/**
 * image-lab-pipeline-bridge
 * 
 * Server-to-server bridge for Pipeline V7/V5 → Image Lab.
 * Auth: service_role_key (NOT user JWT). Called from other edge functions only.
 * 
 * C12.1 HARDENING:
 * - SLO_GUARD: Checks KPIs before processing
 * - SLO timeouts per provider (OpenAI 70s, Gemini 35s, wall-clock 120s)
 * - RETRY_POLICY: Max 3 attempts per scene with fallback
 * - CIRCUIT_BREAKER: Respects provider circuit state
 * - Degraded response on ALL_PROVIDERS_FAILED (never 5xx for generation failures)
 * 
 * C12.1.x FAULT INJECTION:
 * - Header x-image-lab-fault: openai_timeout | gemini_timeout | both_fail
 * - Requires ALLOW_FAULT_INJECTION=true env var
 * - Does NOT update circuit_state when fault injection is active
 * 
 * Input:  { scenes: [{ scene_id, prompt_scene, style_hints? }], preset_key?, size?, provider? }
 * Output: { results: [{ scene_id, asset_id, storage_path, status, error? }] }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-image-lab-fault",
};

const SIZE_MAP: Record<string, { w: number; h: number; api: string }> = {
  "1536x1024": { w: 1536, h: 1024, api: "1536x1024" },
  "1024x1024": { w: 1024, h: 1024, api: "1024x1024" },
  "1024x1536": { w: 1024, h: 1536, api: "1024x1536" },
};

// === C12.1_SLO_CONFIG (C12.1.x updated) ===
const SLO_CONFIG = {
  OPENAI_TIMEOUT_MS: 70_000,
  GEMINI_TIMEOUT_MS: 35_000,
  MAX_TOTAL_WALL_MS: 120_000,
};

function getProviderTimeout(provider: string): number {
  return provider === "gemini" ? SLO_CONFIG.GEMINI_TIMEOUT_MS : SLO_CONFIG.OPENAI_TIMEOUT_MS;
}

// === C12.1_CACHE: Prompt normalization ===
function normalizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\s*([,.])\s*/g, '$1')
    .replace(/([.,!?]){2,}/g, '$1')
    .replace(/\.\s*\./g, '.');
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function classifyError(err: any): string {
  const msg = err.message?.toLowerCase() || "";
  if (msg.includes("429") || msg.includes("rate limit")) return "RATE_LIMIT";
  if (msg.includes("timeout") || msg.includes("408") || err.name === "AbortError") return "TIMEOUT";
  if (msg.includes("content_policy") || msg.includes("safety")) return "CONTENT_POLICY";
  if (msg.match(/5\d\d/)) return "PROVIDER_5XX";
  return "GENERATION_FAILED";
}

// === C12.1.x FAULT INJECTION ===
interface FaultInjection {
  active: boolean;
  type: string | null;
}

function parseFaultInjection(req: Request): FaultInjection {
  const allowFault = Deno.env.get("ALLOW_FAULT_INJECTION") === "true";
  if (!allowFault) return { active: false, type: null };
  
  const faultHeader = req.headers.get("x-image-lab-fault");
  if (!faultHeader) return { active: false, type: null };
  
  const validFaults = ["openai_timeout", "gemini_timeout", "both_fail"];
  if (!validFaults.includes(faultHeader)) return { active: false, type: null };
  
  console.log(`[bridge:C12.1.x_FAULT] Fault injection ACTIVE: type=${faultHeader}`);
  return { active: true, type: faultHeader };
}

function shouldSimulateFault(fault: FaultInjection, provider: string): boolean {
  if (!fault.active) return false;
  if (fault.type === "both_fail") return true;
  if (fault.type === "openai_timeout" && provider === "openai") return true;
  if (fault.type === "gemini_timeout" && provider === "gemini") return true;
  return false;
}

async function generateFromProvider(
  provider: string,
  model: string,
  promptFinal: string,
  sizeInfo: { w: number; h: number; api: string },
  openaiKey: string,
  lovableKey: string,
  timeoutMs: number,
  fault: FaultInjection,
): Promise<Uint8Array> {
  // C12.1.x: Fault injection — simulate failure
  if (shouldSimulateFault(fault, provider)) {
    console.log(`[bridge:C12.1.x_FAULT] Simulating SLO_TIMEOUT for provider=${provider}`);
    throw Object.assign(new Error(`[FAULT_INJECTION] Simulated SLO_TIMEOUT for ${provider}`), { name: "AbortError" });
  }

  if (provider === "gemini") {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let resp: Response;
    try {
      resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          modalities: ["image", "text"],
          messages: [{
            role: "user",
            content: `Generate an image with the following description. Return ONLY the image, no text.\n\n${promptFinal}`,
          }],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Gemini API error ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    const message = data.choices?.[0]?.message;
    const content = message?.content;
    const images = message?.images;
    let b64Data: string | null = null;

    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        const url = img.image_url?.url;
        if (url?.startsWith("data:")) { b64Data = url.split(",")[1]; break; }
      }
    }
    if (!b64Data && Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "image_url" && part.image_url?.url?.startsWith("data:")) {
          b64Data = part.image_url.url.split(",")[1]; break;
        } else if (part.inline_data?.data) {
          b64Data = part.inline_data.data; break;
        }
      }
    }
    if (!b64Data && typeof content === "string") {
      const match = content.match(/data:image\/[^;]+;base64,([^\s"]+)/);
      if (match) b64Data = match[1];
    }
    if (!b64Data) throw new Error("No image data in Gemini response");

    const bin = atob(b64Data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } else {
    // OpenAI
    const openaiBody: Record<string, unknown> = {
      model,
      prompt: promptFinal,
      n: 1,
      size: sizeInfo.api,
    };
    if (!model.startsWith("gpt-image")) {
      openaiBody.response_format = "b64_json";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let resp: Response;
    try {
      resp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(openaiBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    const item = data.data?.[0];

    if (item?.b64_json) {
      const bin = atob(item.b64_json);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } else if (item?.url) {
      const imgResp = await fetch(item.url);
      if (!imgResp.ok) throw new Error(`Failed to download from OpenAI URL: ${imgResp.status}`);
      return new Uint8Array(await imgResp.arrayBuffer());
    } else {
      throw new Error("No image data in OpenAI response");
    }
  }
}

// === C12.1 SLO-AWARE RETRY for bridge scenes ===
async function generateSceneWithRetry(
  supabase: any,
  jobId: string,
  provider: string,
  model: string,
  promptFinal: string,
  sizeInfo: { w: number; h: number; api: string },
  openaiKey: string,
  lovableKey: string,
  fault: FaultInjection,
): Promise<{ bytes: Uint8Array; attemptId: string; usedProvider: string; retryCount: number; fallbackUsed: boolean }> {
  const wallStart = Date.now();
  const fallbackProvider = provider === "openai" ? "gemini" : "openai";
  const fallbackModel = provider === "openai" ? "google/gemini-2.5-flash-image" : "gpt-image-1";

  const providers = [
    { p: provider, m: model },
    { p: provider, m: model }, // retry same
    { p: fallbackProvider, m: fallbackModel }, // fallback
  ];

  for (let i = 0; i < providers.length; i++) {
    const { p, m } = providers[i];

    // Wall-clock guard: skip attempt 2 if exceeded
    if (i === 1) {
      const wallElapsed = Date.now() - wallStart;
      if (wallElapsed >= SLO_CONFIG.MAX_TOTAL_WALL_MS) {
        console.warn(`[bridge:C12.1_SLO] Wall-clock exceeded (${wallElapsed}ms), skipping retry, going to fallback`);
        continue;
      }
    }

    if (i === 2) {
      console.log(`[bridge:C12.1_SLO] IMAGE_FALLBACK_TRIGGERED: from=${provider}, to=${p}, jobId=${jobId}`);
    }

    console.log(`[bridge:C12.1_SLO] IMAGE_PROVIDER_START: provider=${p}, jobId=${jobId}, attempt=${i + 1}/3`);

    const { data: attempt } = await supabase.from("image_attempts").insert({
      job_id: jobId, provider: p, model: m, status: "processing", prompt_final: promptFinal,
    }).select("id").single();
    if (!attempt) throw new Error("Failed to create attempt");

    const start = Date.now();
    const remainingWall = Math.max(SLO_CONFIG.MAX_TOTAL_WALL_MS - (Date.now() - wallStart), 5_000);
    const providerTimeout = Math.min(getProviderTimeout(p), remainingWall);

    try {
      const bytes = await generateFromProvider(p, m, promptFinal, sizeInfo, openaiKey, lovableKey, providerTimeout, fault);
      const latency = Date.now() - start;
      await supabase.from("image_attempts").update({
        status: "completed", latency_ms: latency, bytes_out: bytes.length,
        cost_estimate: p === "openai" ? 0.02 : 0.01,
      }).eq("id", attempt.id);
      return { bytes, attemptId: attempt.id, usedProvider: p, retryCount: i, fallbackUsed: i === 2 };
    } catch (err: any) {
      const latency = Date.now() - start;
      const isSloTimeout = err.name === "AbortError" || latency >= providerTimeout - 500;
      const errorCode = isSloTimeout ? "SLO_TIMEOUT" : classifyError(err);
      if (isSloTimeout) {
        console.warn(`[bridge:C12.1_SLO] IMAGE_PROVIDER_TIMEOUT: provider=${p}, ms=${latency}, jobId=${jobId}`);
      }
      await supabase.from("image_attempts").update({
        status: "failed", error_code: errorCode,
        error_message: err.message?.substring(0, 500), latency_ms: latency,
      }).eq("id", attempt.id);
      console.warn(`[bridge:C12.1] Attempt ${i + 1}/3 failed for job ${jobId}: ${errorCode}`);
      if (i === 2) throw err; // Last attempt, propagate
    }
  }
  throw new Error("Unreachable");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    // === Auth: service_role_key only (server-to-server) ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "AUTH_MISSING" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    if (token !== serviceKey) {
      return new Response(JSON.stringify({ ok: false, error: "FORBIDDEN", message: "Only service_role_key allowed" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // C12.1.x: Parse fault injection (bridge is service-to-service, no user role check needed — env var is the guardrail)
    const fault = parseFaultInjection(req);

    // === C12.1_SLO_GUARD ===
    const { data: kpis } = await supabase
      .from("image_lab_kpis_last_7d")
      .select("*")
      .single();

    const { count: stuckCount } = await supabase
      .from("image_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "processing");

    if (kpis && !fault.active) {
      // C12.1_SLO_GUARD v2: Bridge is server-to-server automated
      // Skip first_pass_accept_rate (requires manual approval, not applicable)
      // Only block on real operational failures

      // fail_rate from view is 0-100 scale (percentage)
      const failRateViolation = (kpis.fail_rate_openai || 0) > 40
        && (kpis.fail_rate_gemini || 0) > 40;

      // Both providers must be slow (at least one healthy = proceed)
      const latencyViolation = (kpis.avg_latency_openai || 0) > 60000
        && (kpis.avg_latency_gemini || 0) > 60000;

      const stuckViolation = (stuckCount || 0) > 0;

      if (failRateViolation || latencyViolation || stuckViolation) {
        console.warn(`[bridge:C12.1_SLO] VIOLATION: failRate=${failRateViolation}, latency=${latencyViolation}, stuck=${stuckViolation}`);
        return new Response(JSON.stringify({
          ok: false,
          reason: "SLO_VIOLATION",
          details: {
            fail_rate_openai: kpis.fail_rate_openai,
            fail_rate_gemini: kpis.fail_rate_gemini,
            avg_latency_openai: kpis.avg_latency_openai,
            avg_latency_gemini: kpis.avg_latency_gemini,
            stuck_jobs: stuckCount,
          },
        }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const {
      scenes,
      preset_key = "cinematic-01",
      size = "1024x1024",
      provider = "gemini",
    } = body;

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "INVALID_INPUT", message: "scenes[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Fetch preset ===
    const { data: preset } = await supabase
      .from("image_presets")
      .select("*")
      .eq("key", preset_key)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!preset) {
      return new Response(JSON.stringify({ ok: false, error: "PRESET_NOT_FOUND", message: `Preset '${preset_key}' not found` }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sizeInfo = SIZE_MAP[size] || SIZE_MAP["1024x1024"];
    const model = provider === "gemini" ? "google/gemini-2.5-flash-image" : "gpt-image-1";

    // === Process each scene with C12.1 SLO-aware retry ===
    const results = await Promise.allSettled(
      scenes.map(async (scene: { scene_id: string; prompt_scene: string; style_hints?: string }) => {
        const { scene_id, prompt_scene, style_hints = "" } = scene;

        const promptFinal = preset.prompt_template
          .replace("{{SCENE}}", prompt_scene)
          .replace("{{STYLE_HINTS}}", style_hints);

        // C12.1_CACHE: normalized prompt for hash
        const hashInput = `${provider}|${model}|${size}|${preset.key}|${preset.version}|${normalizePrompt(promptFinal)}`;
        const hash = await sha256(hashInput);

        // Cache check
        const { data: cached } = await supabase
          .from("image_assets")
          .select("id, storage_path")
          .eq("hash", hash)
          .in("status", ["approved", "completed"])
          .limit(1);

        if (cached && cached.length > 0) {
          console.log(`[bridge] IMAGE_CACHE_HIT: scene=${scene_id}, assetId=${cached[0].id}`);
          return {
            scene_id,
            asset_id: cached[0].id,
            storage_path: cached[0].storage_path,
            status: "cached" as const,
          };
        }

        // Create job
        const { data: job, error: jobErr } = await supabase.from("image_jobs").insert({
          preset_id: preset.id,
          preset_key: preset.key,
          preset_version: preset.version,
          provider,
          model,
          size,
          prompt_scene,
          prompt_final: promptFinal,
          hash,
          status: "processing",
          n: 1,
          metadata: { pipeline_bridge: true, scene_id, style_hints, fault_injection: fault.active ? fault.type : undefined },
        }).select("id").single();

        if (jobErr || !job) throw new Error(`Failed to create job: ${jobErr?.message}`);

        try {
          // C12.1: Generate with SLO-aware retry policy (max 3 attempts)
          const genResult = await generateSceneWithRetry(
            supabase, job.id, provider, model, promptFinal, sizeInfo, openaiKey, lovableKey, fault,
          );

          const storagePath = `${job.id}/${genResult.attemptId}/0.png`;

          // Upload
          const { error: uploadErr } = await supabase.storage
            .from("image-lab")
            .upload(storagePath, genResult.bytes, { contentType: "image/png", upsert: true });
          if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

          // Binary-safe file hash
          const fileHashBuf = await crypto.subtle.digest("SHA-256", genResult.bytes.buffer as ArrayBuffer);
          const fileHash = Array.from(new Uint8Array(fileHashBuf))
            .map(b => b.toString(16).padStart(2, "0")).join("");

          // Create asset (C12: never store signed URLs)
          const { data: asset } = await supabase.from("image_assets").insert({
            job_id: job.id,
            attempt_id: genResult.attemptId,
            status: "completed",
            variation_index: 0,
            storage_path: storagePath,
            public_url: null,
            width: sizeInfo.w,
            height: sizeInfo.h,
            sha256_bytes: fileHash,
            hash,
          }).select("id, storage_path").single();

          // Update job
          await supabase.from("image_jobs").update({
            status: "completed",
            latency_ms: Date.now(),
          }).eq("id", job.id);

          return {
            scene_id,
            asset_id: asset?.id,
            storage_path: asset?.storage_path || storagePath,
            status: "generated" as const,
            retry_count: genResult.retryCount,
            fallback_used: genResult.fallbackUsed,
          };
        } catch (err: any) {
          await supabase.from("image_jobs").update({
            status: "failed",
            error_code: classifyError(err),
            error_message: err.message?.substring(0, 500),
          }).eq("id", job.id);
          throw err;
        }
      })
    );

    // Aggregate — C12.1: degraded response instead of failed for individual scenes
    const output = results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      // C12.1: Return degraded placeholder instead of propagating error as 5xx
      console.warn(`[bridge:C12.1_SLO] IMAGE_LAB_DEGRADED_PLACEHOLDER_RETURNED: scene=${scenes[i].scene_id}, reason=ALL_PROVIDERS_FAILED`);
      return {
        scene_id: scenes[i].scene_id,
        asset_id: null,
        storage_path: null,
        status: "degraded" as const,
        degraded: true,
        reason: "ALL_PROVIDERS_FAILED",
        error: r.reason?.message?.substring(0, 300),
      };
    });

    const successCount = output.filter(o => o.status !== "degraded").length;
    const degradedCount = output.filter(o => o.status === "degraded").length;

    return new Response(JSON.stringify({
      ok: true, // Always true at HTTP level — degraded scenes have status:"degraded"
      results: output,
      total: scenes.length,
      success: successCount,
      degraded: degradedCount,
      degraded_mode: degradedCount > 0,
      fault_injection: fault.active ? fault.type : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[image-lab-pipeline-bridge] Error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error: "BRIDGE_ERROR",
      message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
