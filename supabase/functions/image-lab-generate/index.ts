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

// === EXTRACTED GENERATION FUNCTIONS ===

async function generateWithGemini(prompt: string): Promise<Uint8Array> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  let resp: Response;
  try {
    resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [{ role: "user", content: `Generate an image with the following description. Return ONLY the image, no text.\n\n${prompt}` }],
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
  console.log("[image-lab-generate] Gemini response structure:", JSON.stringify({
    hasChoices: !!data.choices,
    choicesLength: data.choices?.length,
    contentType: typeof data.choices?.[0]?.message?.content,
    isArray: Array.isArray(data.choices?.[0]?.message?.content),
  }));

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

  // Fallback: check content array (inline_data format)
  if (!b64Data && Array.isArray(content)) {
    for (const part of content) {
      if (part.type === "image_url" && part.image_url?.url?.startsWith("data:")) {
        b64Data = part.image_url.url.split(",")[1]; break;
      } else if (part.inline_data?.data) {
        b64Data = part.inline_data.data; break;
      }
    }
  }

  // Fallback: check content string for base64
  if (!b64Data && typeof content === "string") {
    const match = content.match(/data:image\/[^;]+;base64,([^\s"]+)/);
    if (match) b64Data = match[1];
  }

  if (!b64Data) {
    console.error("[image-lab-generate] Gemini: no image found. Content:", JSON.stringify(content)?.substring(0, 500));
    throw new Error("No image data in Gemini response");
  }

  const binaryString = atob(b64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function generateWithOpenAI(prompt: string, model: string, sizeApi: string): Promise<Uint8Array> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
  const openaiBody: Record<string, unknown> = { model, prompt, n: 1, size: sizeApi };

  // Only add response_format for dall-e models (not gpt-image-1)
  if (!model.startsWith("gpt-image")) {
    openaiBody.response_format = "b64_json";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  let resp: Response;
  try {
    resp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
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
  const imageItem = data.data?.[0];

  if (imageItem?.b64_json) {
    const binaryString = atob(imageItem.b64_json);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  } else if (imageItem?.url) {
    const imgResp = await fetch(imageItem.url);
    if (!imgResp.ok) throw new Error(`Failed to download image from OpenAI URL: ${imgResp.status}`);
    return new Uint8Array(await imgResp.arrayBuffer());
  }
  throw new Error("No image data in OpenAI response");
}

// === MAIN HANDLER ===

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // === Auth via REST API (reliable in Deno edge runtime) ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_MISSING", error_message: "No auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const authResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get("SUPABASE_ANON_KEY")! },
    });
    if (!authResp.ok) {
      const errText = await authResp.text();
      console.error("AUTH failed:", authResp.status, errText);
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_INVALID", error_message: "Invalid JWT" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authUser = await authResp.json();
    const userId = authUser.id;

    // Role check (defense-in-depth)
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const userRoles = (roles || []).map((r: any) => r.role);
    if (!userRoles.includes("admin") && !userRoles.includes("supervisor")) {
      return new Response(JSON.stringify({ ok: false, error_code: "FORBIDDEN", error_message: "Admin/supervisor required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { job_id, provider = "openai", n = 1, size = "1024x1024" } = body;

    if (!job_id) {
      return new Response(JSON.stringify({ ok: false, error_code: "MISSING_JOB_ID", error_message: "job_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch job
    const { data: job, error: jobError } = await supabase
      .from("image_jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ ok: false, error_code: "JOB_NOT_FOUND", error_message: `Job ${job_id} not found` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // C12_CONCURRENCY_LOCK: If processing, reject with LOCKED
    if (job.status === "processing") {
      return new Response(JSON.stringify({ ok: false, error_code: "LOCKED", error_message: "Job is already being processed (concurrency lock)" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // C12_JOB_STATE_MACHINE: Only queued, failed, rejected can start generation
    if (!["queued", "failed", "rejected"].includes(job.status)) {
      return new Response(JSON.stringify({ ok: false, error_code: "INVALID_STATUS", error_message: `Job status is ${job.status}, expected queued/failed/rejected` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch preset
    const { data: preset } = await supabase
      .from("image_presets")
      .select("*")
      .eq("id", job.preset_id)
      .single();

    if (!preset) {
      return new Response(JSON.stringify({ ok: false, error_code: "PRESET_NOT_FOUND", error_message: "Preset not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build prompt_final
    const styleHints = (job.metadata as any)?.style_hints || "";
    let promptFinal = preset.prompt_template
      .replace("{{SCENE}}", job.prompt_scene)
      .replace("{{STYLE_HINTS}}", styleHints);

    if (job.prompt_base) {
      promptFinal = job.prompt_base + " " + promptFinal;
    }

    // Compute hash
    const actualProvider = provider || job.provider || "openai";
    const actualModel = job.model || "gpt-image-1";
    const actualSize = size || job.size || "1024x1024";
    const hashInput = `${actualProvider}|${actualModel}|${actualSize}|${preset.key}|${preset.version}|${promptFinal}`;
    const hash = await sha256(hashInput);

    // Cache check
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
      }).eq("id", job_id);

      return new Response(JSON.stringify({
        ok: true,
        job: { ...job, status: "completed", cache_hit: true, prompt_final: promptFinal, hash },
        assets: cachedAssets,
        cache_hit: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create attempt
    const { data: attempt } = await supabase.from("image_attempts").insert({
      job_id,
      provider: actualProvider,
      model: actualModel,
      status: "processing",
      prompt_final: promptFinal,
    }).select().single();

    // Update job to processing
    await supabase.from("image_jobs").update({
      status: "processing",
      provider: actualProvider,
      model: actualModel,
      size: actualSize,
      prompt_final: promptFinal,
      hash,
      preset_key: preset.key,
      preset_version: preset.version,
    }).eq("id", job_id);

    const startTime = Date.now();
    const sizeInfo = SIZE_MAP[actualSize] || SIZE_MAP["1024x1024"];

    // === GENERATION WITH AUTOMATIC FALLBACK ===

    let imageBytes: Uint8Array;
    let usedProvider = actualProvider;
    let usedModel = actualModel;
    let fallbackUsed = false;
    let currentAttemptId = attempt!.id;

    if (actualProvider === "gemini") {
      try {
        imageBytes = await generateWithGemini(promptFinal);
      } catch (geminiError: any) {
        const isTimeout = geminiError.name === "AbortError" ||
          geminiError.message?.toLowerCase().includes("timeout") ||
          geminiError.message?.includes("408");

        if (isTimeout) {
          console.warn(`[image-lab-generate] ⚠️ Gemini TIMEOUT for job ${job_id}. Falling back to OpenAI...`);

          // Mark original attempt as failed with TIMEOUT
          const geminiLatency = Date.now() - startTime;
          await supabase.from("image_attempts").update({
            status: "failed",
            error_code: "TIMEOUT",
            error_message: "Gemini timeout – automatic fallback to OpenAI triggered",
            latency_ms: geminiLatency,
          }).eq("id", attempt!.id);

          // Create fallback attempt with OpenAI
          const fallbackModel = "gpt-image-1";
          const { data: fallbackAttempt } = await supabase.from("image_attempts").insert({
            job_id,
            provider: "openai",
            model: fallbackModel,
            status: "processing",
            prompt_final: promptFinal,
          }).select().single();

          // Update job provider/model to reflect fallback
          await supabase.from("image_jobs").update({
            provider: "openai",
            model: fallbackModel,
          }).eq("id", job_id);

          currentAttemptId = fallbackAttempt!.id;
          imageBytes = await generateWithOpenAI(promptFinal, fallbackModel, sizeInfo.api);
          usedProvider = "openai";
          usedModel = fallbackModel;
          fallbackUsed = true;
        } else {
          // Non-timeout error: propagate normally
          throw geminiError;
        }
      }
    } else {
      imageBytes = await generateWithOpenAI(promptFinal, actualModel, sizeInfo.api);
    }

    const latencyMs = Date.now() - startTime;
    if (fallbackUsed) {
      console.log(`[image-lab-generate] ✅ Fallback OpenAI succeeded for job ${job_id} in ${latencyMs}ms`);
    }

    // === bytes_out telemetry ===
    const bytesOut = imageBytes.length;

    // Upload to storage
    const storagePath = `${job_id}/${currentAttemptId}/0.png`;
    const { error: uploadError } = await supabase.storage
      .from("image-lab")
      .upload(storagePath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    // Generate signed URL for response
    const { data: signedData, error: signedError } = await supabase.storage
      .from("image-lab")
      .createSignedUrl(storagePath, 3600);

    const signedUrl = signedError ? null : signedData?.signedUrl;

    // Compute file hash (C12: Binary-safe)
    const fileHashBuffer = await crypto.subtle.digest("SHA-256", imageBytes);
    const fileHash = Array.from(new Uint8Array(fileHashBuffer))
      .map(b => b.toString(16).padStart(2, "0")).join("");

    // C12_STORAGE_PRIVACY: Store ONLY storage_path, never signed URLs in DB
    const { data: asset } = await supabase.from("image_assets").insert({
      job_id,
      attempt_id: currentAttemptId,
      status: "completed",
      variation_index: 0,
      storage_path: storagePath,
      public_url: null,
      width: sizeInfo.w,
      height: sizeInfo.h,
      sha256_bytes: fileHash,
      hash,
    }).select().single();

    // Update attempt with latency + bytes_out
    await supabase.from("image_attempts").update({
      status: "completed",
      latency_ms: latencyMs,
      bytes_out: bytesOut,
      cost_estimate: usedProvider === "openai" ? 0.02 : 0.01,
    }).eq("id", currentAttemptId);

    // Update job
    await supabase.from("image_jobs").update({
      status: "completed",
      latency_ms: latencyMs,
      provider: usedProvider,
      model: usedModel,
    }).eq("id", job_id);

    return new Response(JSON.stringify({
      ok: true,
      job: {
        id: job_id,
        status: "completed",
        latency_ms: latencyMs,
        prompt_final: promptFinal,
        hash,
        cache_hit: false,
        fallback_used: fallbackUsed,
        provider: usedProvider,
        model: usedModel,
      },
      assets: [asset],
      cache_hit: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[image-lab-generate] Error:", error);

    // C12: Classify error and update job with normalized error_code
    try {
      const supabase = createClient(supabaseUrl, serviceKey);
      const body = await req.clone().json().catch(() => ({}));
      if (body.job_id) {
        const errorMsg = error.message?.substring(0, 500) || "Unknown error";
        let errorCode = "GENERATION_FAILED";
        if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("rate limit")) errorCode = "RATE_LIMIT";
        else if (errorMsg.toLowerCase().includes("timeout") || errorMsg.includes("408") || error.name === "AbortError") errorCode = "TIMEOUT";
        else if (errorMsg.toLowerCase().includes("content_policy") || errorMsg.toLowerCase().includes("safety")) errorCode = "CONTENT_POLICY";
        else if (errorMsg.match(/5\d\d/)) errorCode = "PROVIDER_5XX";
        else if (errorMsg.toLowerCase().includes("invalid") && errorMsg.toLowerCase().includes("prompt")) errorCode = "INVALID_PROMPT";

        await supabase.from("image_jobs").update({
          status: "failed",
          error_code: errorCode,
          error_message: errorMsg,
        }).eq("id", body.job_id);

        // Update any processing attempts with error details
        await supabase.from("image_attempts").update({
          status: "failed",
          error_code: errorCode,
          error_message: errorMsg,
        }).eq("job_id", body.job_id).eq("status", "processing");
      }
    } catch (_) { /* best effort */ }

    return new Response(JSON.stringify({
      ok: false,
      error_code: "GENERATION_FAILED",
      error_message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
