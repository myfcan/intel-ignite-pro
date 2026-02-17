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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

  try {
    // === PARTE 1: Auth hardened via getClaims() ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_MISSING", error_message: "No auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_INVALID", error_message: "Invalid JWT" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

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

    let imageBytes: Uint8Array;

    if (actualProvider === "gemini") {
      // Use Lovable AI Gateway for Gemini
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

      const geminiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: `Generate an image with the following description. Return ONLY the image, no text.\n\n${promptFinal}`,
            },
          ],
        }),
      });

      if (!geminiResp.ok) {
        const errText = await geminiResp.text();
        throw new Error(`Gemini API error ${geminiResp.status}: ${errText}`);
      }

      const geminiData = await geminiResp.json();
      console.log("[image-lab-generate] Gemini response structure:", JSON.stringify({
        hasChoices: !!geminiData.choices,
        choicesLength: geminiData.choices?.length,
        contentType: typeof geminiData.choices?.[0]?.message?.content,
        isArray: Array.isArray(geminiData.choices?.[0]?.message?.content),
      }));

      const content = geminiData.choices?.[0]?.message?.content;
      let b64Data: string | null = null;

      if (Array.isArray(content)) {
        // Look for inline_data (Google's native format) or image_url
        for (const part of content) {
          if (part.type === "image_url" && part.image_url?.url) {
            const url = part.image_url.url;
            if (url.startsWith("data:")) {
              b64Data = url.split(",")[1];
              break;
            }
          } else if (part.inline_data?.data) {
            b64Data = part.inline_data.data;
            break;
          } else if (part.type === "image" && part.data) {
            b64Data = part.data;
            break;
          }
        }
      } else if (typeof content === "string") {
        const match = content.match(/data:image\/[^;]+;base64,([^\s"]+)/);
        if (match) b64Data = match[1];
      }

      if (!b64Data) {
        // Log the actual content for debugging
        console.error("[image-lab-generate] Gemini: no image found. Content:", JSON.stringify(content)?.substring(0, 500));
        throw new Error("No image data in Gemini response");
      }

      const binaryString = atob(b64Data);
      imageBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imageBytes[i] = binaryString.charCodeAt(i);
      }
    } else {
      // OpenAI - gpt-image-1 does NOT support response_format parameter
      // It returns URLs by default
      const openaiBody: Record<string, unknown> = {
        model: actualModel,
        prompt: promptFinal,
        n: 1,
        size: sizeInfo.api,
      };

      // Only add response_format for dall-e models (not gpt-image-1)
      if (!actualModel.startsWith("gpt-image")) {
        openaiBody.response_format = "b64_json";
      }

      const openaiResp = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(openaiBody),
      });

      if (!openaiResp.ok) {
        const errText = await openaiResp.text();
        throw new Error(`OpenAI API error ${openaiResp.status}: ${errText}`);
      }

      const openaiData = await openaiResp.json();
      const imageItem = openaiData.data?.[0];

      if (imageItem?.b64_json) {
        // DALL-E style b64 response
        const binaryString = atob(imageItem.b64_json);
        imageBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageBytes[i] = binaryString.charCodeAt(i);
        }
      } else if (imageItem?.url) {
        // gpt-image-1 returns a URL - download it
        const imgResp = await fetch(imageItem.url);
        if (!imgResp.ok) throw new Error(`Failed to download image from OpenAI URL: ${imgResp.status}`);
        imageBytes = new Uint8Array(await imgResp.arrayBuffer());
      } else {
        throw new Error("No image data in OpenAI response");
      }
    }

    const latencyMs = Date.now() - startTime;
    // === PARTE 4: bytes_out telemetry ===
    const bytesOut = imageBytes.length;

    // Upload to storage
    const storagePath = `${job_id}/${attempt!.id}/0.png`;
    const { error: uploadError } = await supabase.storage
      .from("image-lab")
      .upload(storagePath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    // === PARTE 3: Generate signed URL instead of public URL ===
    const { data: signedData, error: signedError } = await supabase.storage
      .from("image-lab")
      .createSignedUrl(storagePath, 3600);

    const signedUrl = signedError ? null : signedData?.signedUrl;

    // Compute file hash
    const fileHash = await sha256(new TextDecoder().decode(imageBytes).substring(0, 1000) + imageBytes.length);

    // Create asset (store storage_path for on-demand signed URL generation)
    const { data: asset } = await supabase.from("image_assets").insert({
      job_id,
      attempt_id: attempt!.id,
      status: "completed",
      variation_index: 0,
      storage_path: storagePath,
      public_url: signedUrl,
      width: sizeInfo.w,
      height: sizeInfo.h,
      sha256_bytes: fileHash,
      hash,
    }).select().single();

    // === PARTE 4: Update attempt with latency + bytes_out ===
    await supabase.from("image_attempts").update({
      status: "completed",
      latency_ms: latencyMs,
      bytes_out: bytesOut,
      cost_estimate: actualProvider === "openai" ? 0.02 : 0.01,
    }).eq("id", attempt!.id);

    // Update job
    await supabase.from("image_jobs").update({
      status: "completed",
      latency_ms: latencyMs,
    }).eq("id", job_id);

    return new Response(JSON.stringify({
      ok: true,
      job: { id: job_id, status: "completed", latency_ms: latencyMs, prompt_final: promptFinal, hash, cache_hit: false },
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
        // C12 normalized error classification
        const errorMsg = error.message?.substring(0, 500) || "Unknown error";
        let errorCode = "GENERATION_FAILED";
        if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("rate limit")) errorCode = "RATE_LIMIT";
        else if (errorMsg.toLowerCase().includes("timeout") || errorMsg.includes("408")) errorCode = "TIMEOUT";
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
