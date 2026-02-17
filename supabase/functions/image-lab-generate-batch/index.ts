import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SIZE_MAP: Record<string, { w: number; h: number; api: string }> = {
  "1536x1024": { w: 1536, h: 1024, api: "1536x1024" },
  "1024x1024": { w: 1024, h: 1024, api: "1024x1024" },
  "1024x1536": { w: 1024, h: 1536, api: "1024x1536" },
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generate image bytes from a single provider. Returns Uint8Array on success. */
async function generateFromProvider(
  provider: string,
  model: string,
  promptFinal: string,
  sizeInfo: { w: number; h: number; api: string },
  openaiKey: string,
  lovableKey: string,
): Promise<Uint8Array> {
  if (provider === "gemini") {
    // C12 FIX: AbortController with 120s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
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
          messages: [
            {
              role: "user",
              content: `Generate an image with the following description. Return ONLY the image, no text.\n\n${promptFinal}`,
            },
          ],
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

    // Gateway returns images in message.images array
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        const url = img.image_url?.url;
        if (url?.startsWith("data:")) { b64Data = url.split(",")[1]; break; }
      }
    }

    // Fallback: content array
    if (!b64Data && Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "image_url" && part.image_url?.url?.startsWith("data:")) {
          b64Data = part.image_url.url.split(",")[1]; break;
        } else if (part.inline_data?.data) {
          b64Data = part.inline_data.data; break;
        }
      }
    }

    // Fallback: content string
    if (!b64Data && typeof content === "string") {
      const match = content.match(/data:image\/[^;]+;base64,([^\s"]+)/);
      if (match) b64Data = match[1];
    }

    if (!b64Data) {
      console.error("[batch] Gemini: no image found. Content:", JSON.stringify(content)?.substring(0, 500));
      throw new Error("No image data in Gemini response");
    }

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

    // C12 FIX: AbortController with 120s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    // === Auth via REST API (reliable in Deno edge runtime) ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_MISSING" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Auth via REST API (reliable in Deno edge runtime)
    const authResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
    if (!authResp.ok) {
      const errText = await authResp.text();
      console.error("AUTH failed:", authResp.status, errText);
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_INVALID" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authUser = await authResp.json();
    const userId = authUser.id;

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const userRoles = (roles || []).map((r: any) => r.role);
    if (!userRoles.includes("admin") && !userRoles.includes("supervisor")) {
      return new Response(JSON.stringify({ ok: false, error_code: "FORBIDDEN" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { job_id, plan, size = "1024x1024" } = body;

    if (!job_id || !plan || !Array.isArray(plan)) {
      return new Response(JSON.stringify({ ok: false, error_code: "INVALID_INPUT", error_message: "job_id and plan[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Fetch job + validate status ===
    const { data: job, error: jobError } = await supabase.from("image_jobs").select("*").eq("id", job_id).single();
    if (jobError || !job) {
      return new Response(JSON.stringify({ ok: false, error_code: "JOB_NOT_FOUND", error_message: `Job ${job_id} not found` }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (job.status === "processing") {
      return new Response(JSON.stringify({ ok: false, error_code: "LOCKED", error_message: "Job is already being processed (concurrency lock)" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["queued", "failed", "rejected"].includes(job.status)) {
      return new Response(JSON.stringify({ ok: false, error_code: "INVALID_STATUS", error_message: `Job status is ${job.status}, cannot start batch` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Fetch preset ===
    const { data: preset } = await supabase.from("image_presets").select("*").eq("id", job.preset_id).single();
    if (!preset) {
      return new Response(JSON.stringify({ ok: false, error_code: "PRESET_NOT_FOUND", error_message: "Preset not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Build prompt_final ===
    const styleHints = (job.metadata as any)?.style_hints || "";
    let promptFinal = preset.prompt_template
      .replace("{{SCENE}}", job.prompt_scene)
      .replace("{{STYLE_HINTS}}", styleHints);
    if (job.prompt_base) promptFinal = job.prompt_base + " " + promptFinal;

    const actualSize = size || job.size || "1024x1024";
    const sizeInfo = SIZE_MAP[actualSize] || SIZE_MAP["1024x1024"];

    // === Compute hash for idempotency (once for the job, not per task) ===
    // Use job's primary provider/model for the hash
    const hashInput = `${job.provider}|${job.model}|${actualSize}|${preset.key}|${preset.version}|${promptFinal}`;
    const hash = await sha256(hashInput);

    // === Cache check ===
    const { data: cachedAssets } = await supabase
      .from("image_assets")
      .select("*")
      .eq("hash", hash)
      .in("status", ["approved", "completed"])
      .limit(1);

    if (cachedAssets && cachedAssets.length > 0) {
      await supabase.from("image_jobs").update({
        status: "completed",
        cache_hit: true,
        prompt_final: promptFinal,
        hash,
        preset_key: preset.key,
        preset_version: preset.version,
      }).eq("id", job_id);

      return new Response(JSON.stringify({
        ok: true,
        job_id,
        assets: cachedAssets,
        cache_hit: true,
        total_generated: cachedAssets.length,
        total_failed: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Set job to processing ONCE ===
    await supabase.from("image_jobs").update({
      status: "processing",
      prompt_final: promptFinal,
      hash,
      size: actualSize,
      preset_key: preset.key,
      preset_version: preset.version,
      updated_at: new Date().toISOString(),
    }).eq("id", job_id);

    // === Build flat task list ===
    const tasks: Array<{ provider: string; model: string; index: number }> = [];
    for (const item of plan) {
      const { provider = "openai", model = provider === "gemini" ? "google/gemini-2.5-flash-image" : "gpt-image-1", n = 1 } = item;
      for (let i = 0; i < n; i++) {
        tasks.push({ provider, model, index: tasks.length });
      }
    }

    // === Execute ALL tasks in parallel — INTERNALIZED (no recursive edge function calls) ===
    const startTime = Date.now();

    const results = await Promise.allSettled(
      tasks.map(async (task) => {
        const taskStart = Date.now();

        // Create individual attempt
        const { data: attempt } = await supabase.from("image_attempts").insert({
          job_id,
          provider: task.provider,
          model: task.model,
          status: "processing",
          prompt_final: promptFinal,
        }).select().single();

        if (!attempt) throw new Error("Failed to create attempt");

        try {
          const imageBytes = await generateFromProvider(
            task.provider, task.model, promptFinal, sizeInfo, openaiKey, lovableKey,
          );

          const taskLatency = Date.now() - taskStart;
          const bytesOut = imageBytes.length;

          // Upload to storage
          const storagePath = `${job_id}/${attempt.id}/0.png`;
          const { error: uploadError } = await supabase.storage
            .from("image-lab")
            .upload(storagePath, imageBytes, { contentType: "image/png", upsert: true });

          if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

          // File hash
          // C12 FIX: Binary-safe hash (no TextDecoder corruption)
          const fileHashBuffer = await crypto.subtle.digest("SHA-256", imageBytes);
          const fileHash = Array.from(new Uint8Array(fileHashBuffer))
            .map(b => b.toString(16).padStart(2, "0")).join("");

          // C12_STORAGE_PRIVACY: Store ONLY storage_path, never signed URLs in DB
          const { data: asset } = await supabase.from("image_assets").insert({
            job_id,
            attempt_id: attempt.id,
            status: "completed",
            variation_index: task.index,
            storage_path: storagePath,
            public_url: null,
            width: sizeInfo.w,
            height: sizeInfo.h,
            sha256_bytes: fileHash,
            hash,
          }).select().single();

          // Update attempt to completed
          await supabase.from("image_attempts").update({
            status: "completed",
            latency_ms: taskLatency,
            bytes_out: bytesOut,
            cost_estimate: task.provider === "openai" ? 0.02 : 0.01,
          }).eq("id", attempt.id);

          return { provider: task.provider, asset };
        } catch (err: any) {
          // Update attempt to failed
          const errMsg = err.message?.substring(0, 500) || "Unknown error";
          let errorCode = "GENERATION_FAILED";
          if (errMsg.includes("429") || errMsg.toLowerCase().includes("rate limit")) errorCode = "RATE_LIMIT";
          else if (errMsg.toLowerCase().includes("timeout")) errorCode = "TIMEOUT";
          else if (errMsg.toLowerCase().includes("content_policy") || errMsg.toLowerCase().includes("safety")) errorCode = "CONTENT_POLICY";
          else if (errMsg.match(/5\d\d/)) errorCode = "PROVIDER_5XX";

          await supabase.from("image_attempts").update({
            status: "failed",
            error_code: errorCode,
            error_message: errMsg,
            latency_ms: Date.now() - taskStart,
          }).eq("id", attempt.id);

          throw err;
        }
      })
    );

    const totalLatencyMs = Date.now() - startTime;

    // === Aggregate results ===
    const allAssets: any[] = [];
    const errors: any[] = [];
    const providerStats: Record<string, { success: number; fail: number }> = {};

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const task = tasks[i];
      if (!providerStats[task.provider]) {
        providerStats[task.provider] = { success: 0, fail: 0 };
      }

      if (result.status === "fulfilled") {
        if (result.value.asset) allAssets.push(result.value.asset);
        providerStats[task.provider].success++;
      } else {
        errors.push({ provider: task.provider, index: task.index, error: result.reason?.message || "Unknown error" });
        providerStats[task.provider].fail++;
      }
    }

    // === Final status ===
    const finalStatus = allAssets.length > 0 ? "completed" : "failed";
    const batchMetadata = {
      batch: true,
      totalAttempts: tasks.length,
      successCount: allAssets.length,
      failCount: errors.length,
      providers: providerStats,
      totalLatencyMs,
    };

    await supabase.from("image_jobs").update({
      status: finalStatus,
      latency_ms: totalLatencyMs,
      metadata: { ...(body.metadata || {}), ...batchMetadata },
      error_message: errors.length > 0 ? errors.map(e => `${e.provider}: ${e.error}`).join("; ").substring(0, 500) : null,
      error_code: allAssets.length === 0 && errors.length > 0 ? "BATCH_FAILED" : null,
    }).eq("id", job_id);

    return new Response(JSON.stringify({
      ok: allAssets.length > 0,
      job_id,
      assets: allAssets,
      errors: errors.length > 0 ? errors : undefined,
      total_generated: allAssets.length,
      total_failed: errors.length,
      latency_ms: totalLatencyMs,
      provider_stats: providerStats,
      cache_hit: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[image-lab-generate-batch] Error:", error);

    // Best-effort: update job to failed
    try {
      const supabase = createClient(supabaseUrl, serviceKey);
      const body = await req.clone().json().catch(() => ({}));
      if (body.job_id) {
        await supabase.from("image_jobs").update({
          status: "failed",
          error_code: "BATCH_FAILED",
          error_message: error.message?.substring(0, 500),
        }).eq("id", body.job_id);
      }
    } catch (_) { /* best effort */ }

    return new Response(JSON.stringify({
      ok: false,
      error_code: "BATCH_FAILED",
      error_message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
