import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-image-lab-fault",
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

// === C12.1_CACHE: Prompt normalization for deterministic hashing ===
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

// === C12.1.x FAULT INJECTION ===
interface FaultInjection {
  active: boolean;
  type: string | null; // "openai_timeout" | "gemini_timeout" | "both_fail"
}

function parseFaultInjection(req: Request, isAdmin: boolean): FaultInjection {
  const allowFault = Deno.env.get("ALLOW_FAULT_INJECTION") === "true";
  if (!allowFault || !isAdmin) return { active: false, type: null };
  
  const faultHeader = req.headers.get("x-image-lab-fault");
  if (!faultHeader) return { active: false, type: null };
  
  const validFaults = ["openai_timeout", "gemini_timeout", "both_fail"];
  if (!validFaults.includes(faultHeader)) return { active: false, type: null };
  
  console.log(`[C12.1.x_FAULT] Fault injection ACTIVE: type=${faultHeader}`);
  return { active: true, type: faultHeader };
}

function shouldSimulateFault(fault: FaultInjection, provider: string): boolean {
  if (!fault.active) return false;
  if (fault.type === "both_fail") return true;
  if (fault.type === "openai_timeout" && provider === "openai") return true;
  if (fault.type === "gemini_timeout" && provider === "gemini") return true;
  return false;
}

// === C12.1_CIRCUIT_BREAKER HELPERS ===

interface CircuitState {
  provider: string;
  state: string;
  fail_count: number;
  total_count: number;
  last_failure_at: string | null;
  opened_at: string | null;
  cooldown_until: string | null;
  updated_at: string;
}

async function getCircuitState(supabase: any, provider: string): Promise<CircuitState | null> {
  const { data } = await supabase
    .from("image_lab_circuit_state")
    .select("*")
    .eq("provider", provider)
    .single();
  return data;
}

async function updateCircuitAfterAttempt(supabase: any, provider: string, success: boolean, skipCircuitUpdate: boolean): Promise<void> {
  // C12.1.x: Fault injection NEVER updates circuit state
  if (skipCircuitUpdate) {
    console.log(`[C12.1.x_FAULT] Skipping circuit update for ${provider} (fault injection active)`);
    return;
  }

  const circuit = await getCircuitState(supabase, provider);
  if (!circuit) return;

  const newTotalCount = circuit.total_count + 1;
  const newFailCount = success ? circuit.fail_count : circuit.fail_count + 1;

  const windowSize = Math.min(newTotalCount, 20);
  const failRate = windowSize > 0 ? newFailCount / windowSize : 0;

  let newState = circuit.state;
  let openedAt = circuit.opened_at;
  let cooldownUntil = circuit.cooldown_until;
  const lastFailureAt = success ? circuit.last_failure_at : new Date().toISOString();

  if (circuit.state === 'HALF_OPEN') {
    if (success) {
      newState = 'CLOSED';
      openedAt = null;
      cooldownUntil = null;
      console.log(`[C12.1_CIRCUIT] ${provider}: HALF_OPEN → CLOSED (test passed)`);
    } else {
      newState = 'OPEN';
      openedAt = new Date().toISOString();
      cooldownUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      console.log(`[C12.1_CIRCUIT] ${provider}: HALF_OPEN → OPEN (test failed, cooldown 10min)`);
    }
  } else if (circuit.state === 'CLOSED' && failRate > 0.4 && windowSize >= 5) {
    newState = 'OPEN';
    openedAt = new Date().toISOString();
    cooldownUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    console.log(`[C12.1_CIRCUIT] ${provider}: CLOSED → OPEN (failRate=${(failRate*100).toFixed(1)}%)`);
  }

  await supabase.from("image_lab_circuit_state").update({
    state: newState,
    fail_count: newFailCount,
    total_count: newTotalCount,
    last_failure_at: lastFailureAt,
    opened_at: openedAt,
    cooldown_until: cooldownUntil,
    updated_at: new Date().toISOString(),
  }).eq("provider", provider);
}

function resolveProviderWithCircuit(circuit: CircuitState | null, requestedProvider: string): string {
  if (!circuit) return requestedProvider;
  
  if (circuit.state === 'OPEN') {
    const now = new Date();
    const cooldown = circuit.cooldown_until ? new Date(circuit.cooldown_until) : null;
    
    if (cooldown && now >= cooldown) {
      console.log(`[C12.1_CIRCUIT] ${requestedProvider}: OPEN → HALF_OPEN (cooldown expired)`);
      return requestedProvider;
    }
    
    const fallback = requestedProvider === "openai" ? "gemini" : "openai";
    console.log(`[C12.1_CIRCUIT] ${requestedProvider}: OPEN (cooldown active) → forcing ${fallback}`);
    return fallback;
  }
  
  return requestedProvider;
}

// === EXTRACTED GENERATION FUNCTIONS (now with configurable timeout) ===

async function generateWithGemini(prompt: string, timeoutMs: number): Promise<Uint8Array> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
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

  if (!b64Data) {
    console.error("[image-lab-generate] Gemini: no image found. Content:", JSON.stringify(content)?.substring(0, 500));
    throw new Error("No image data in Gemini response");
  }

  const binaryString = atob(b64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function generateWithOpenAI(prompt: string, model: string, sizeApi: string, timeoutMs: number): Promise<Uint8Array> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
  const openaiBody: Record<string, unknown> = { model, prompt, n: 1, size: sizeApi };

  if (!model.startsWith("gpt-image")) {
    openaiBody.response_format = "b64_json";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
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

// === GENERATION WITH C12.1 SLO-AWARE RETRY POLICY ===

interface GenerationResult {
  imageBytes: Uint8Array;
  usedProvider: string;
  usedModel: string;
  fallbackUsed: boolean;
  retryCount: number;
  attemptIds: string[];
}

async function generateWithRetryPolicy(
  supabase: any,
  jobId: string,
  requestedProvider: string,
  requestedModel: string,
  promptFinal: string,
  sizeInfo: { w: number; h: number; api: string },
  fault: FaultInjection,
): Promise<GenerationResult> {
  const attemptIds: string[] = [];
  let retryCount = 0;
  let fallbackUsed = false;
  let currentProvider = requestedProvider;
  let currentModel = requestedModel;
  const wallStart = Date.now();
  const skipCircuit = fault.active;

  // Helper: generate with provider using SLO timeout
  async function tryGenerate(provider: string, model: string, timeoutMs: number): Promise<Uint8Array> {
    // C12.1.x: Fault injection — simulate SLO_TIMEOUT
    if (shouldSimulateFault(fault, provider)) {
      console.log(`[C12.1.x_FAULT] Simulating SLO_TIMEOUT for provider=${provider}, jobId=${jobId}`);
      throw Object.assign(new Error(`[FAULT_INJECTION] Simulated SLO_TIMEOUT for ${provider}`), { name: "AbortError" });
    }
    
    console.log(`[C12.1_SLO] IMAGE_PROVIDER_START: provider=${provider}, jobId=${jobId}, timeoutMs=${timeoutMs}`);
    if (provider === "gemini") {
      return await generateWithGemini(promptFinal, timeoutMs);
    } else {
      return await generateWithOpenAI(promptFinal, model, sizeInfo.api, timeoutMs);
    }
  }

  // Attempt 1: primary provider with SLO timeout
  {
    const { data: attempt } = await supabase.from("image_attempts").insert({
      job_id: jobId, provider: currentProvider, model: currentModel,
      status: "processing", prompt_final: promptFinal,
    }).select("id").single();
    attemptIds.push(attempt!.id);

    const start = Date.now();
    const providerTimeout = getProviderTimeout(currentProvider);
    try {
      const bytes = await tryGenerate(currentProvider, currentModel, providerTimeout);
      const latency = Date.now() - start;
      await supabase.from("image_attempts").update({
        status: "completed", latency_ms: latency, bytes_out: bytes.length,
        cost_estimate: currentProvider === "openai" ? 0.02 : 0.01,
      }).eq("id", attempt!.id);
      await updateCircuitAfterAttempt(supabase, currentProvider, true, skipCircuit);
      return { imageBytes: bytes, usedProvider: currentProvider, usedModel: currentModel, fallbackUsed, retryCount, attemptIds };
    } catch (err: any) {
      const latency = Date.now() - start;
      const isSloTimeout = err.name === "AbortError" || latency >= providerTimeout - 500;
      const errorCode = isSloTimeout ? "SLO_TIMEOUT" : classifyError(err);
      if (isSloTimeout) {
        console.warn(`[C12.1_SLO] IMAGE_PROVIDER_TIMEOUT: provider=${currentProvider}, ms=${latency}, jobId=${jobId}`);
      }
      await supabase.from("image_attempts").update({
        status: "failed", error_code: errorCode, error_message: err.message?.substring(0, 500), latency_ms: latency,
      }).eq("id", attempt!.id);
      await updateCircuitAfterAttempt(supabase, currentProvider, false, skipCircuit);
      console.warn(`[C12.1_RETRY] Attempt 1 failed (${currentProvider}): ${errorCode}`);
    }
  }

  // Attempt 2: retry SAME provider IF wall-clock allows
  retryCount = 1;
  const wallElapsed = Date.now() - wallStart;
  if (wallElapsed < SLO_CONFIG.MAX_TOTAL_WALL_MS) {
    const { data: attempt } = await supabase.from("image_attempts").insert({
      job_id: jobId, provider: currentProvider, model: currentModel,
      status: "processing", prompt_final: promptFinal,
    }).select("id").single();
    attemptIds.push(attempt!.id);

    const start = Date.now();
    const remainingWall = SLO_CONFIG.MAX_TOTAL_WALL_MS - (Date.now() - wallStart);
    const providerTimeout = Math.min(getProviderTimeout(currentProvider), remainingWall);
    try {
      const bytes = await tryGenerate(currentProvider, currentModel, providerTimeout);
      const latency = Date.now() - start;
      await supabase.from("image_attempts").update({
        status: "completed", latency_ms: latency, bytes_out: bytes.length,
        cost_estimate: currentProvider === "openai" ? 0.02 : 0.01,
      }).eq("id", attempt!.id);
      await updateCircuitAfterAttempt(supabase, currentProvider, true, skipCircuit);
      return { imageBytes: bytes, usedProvider: currentProvider, usedModel: currentModel, fallbackUsed, retryCount, attemptIds };
    } catch (err: any) {
      const latency = Date.now() - start;
      const isSloTimeout = err.name === "AbortError" || latency >= providerTimeout - 500;
      const errorCode = isSloTimeout ? "SLO_TIMEOUT" : classifyError(err);
      await supabase.from("image_attempts").update({
        status: "failed", error_code: errorCode, error_message: err.message?.substring(0, 500), latency_ms: latency,
      }).eq("id", attempt!.id);
      await updateCircuitAfterAttempt(supabase, currentProvider, false, skipCircuit);
      console.warn(`[C12.1_RETRY] Attempt 2 failed (${currentProvider}): ${errorCode}`);
    }
  } else {
    console.warn(`[C12.1_SLO] Wall-clock exceeded (${wallElapsed}ms), skipping attempt 2 retry for ${currentProvider}`);
  }

  // Attempt 3: fallback to OTHER provider
  retryCount = 2;
  fallbackUsed = true;
  const fallbackProvider = requestedProvider === "openai" ? "gemini" : "openai";
  const fallbackModel = fallbackProvider === "gemini" ? "google/gemini-2.5-flash-image" : "gpt-image-1";
  console.log(`[C12.1_SLO] IMAGE_FALLBACK_TRIGGERED: from=${currentProvider}, to=${fallbackProvider}, jobId=${jobId}`);
  currentProvider = fallbackProvider;
  currentModel = fallbackModel;

  {
    const { data: attempt } = await supabase.from("image_attempts").insert({
      job_id: jobId, provider: currentProvider, model: currentModel,
      status: "processing", prompt_final: promptFinal,
    }).select("id").single();
    attemptIds.push(attempt!.id);

    const start = Date.now();
    const remainingWall = Math.max(SLO_CONFIG.MAX_TOTAL_WALL_MS - (Date.now() - wallStart), 5_000); // min 5s
    const providerTimeout = Math.min(getProviderTimeout(currentProvider), remainingWall);
    try {
      const bytes = await tryGenerate(currentProvider, currentModel, providerTimeout);
      const latency = Date.now() - start;
      await supabase.from("image_attempts").update({
        status: "completed", latency_ms: latency, bytes_out: bytes.length,
        cost_estimate: currentProvider === "openai" ? 0.02 : 0.01,
      }).eq("id", attempt!.id);
      await updateCircuitAfterAttempt(supabase, currentProvider, true, skipCircuit);
      return { imageBytes: bytes, usedProvider: currentProvider, usedModel: currentModel, fallbackUsed, retryCount, attemptIds };
    } catch (err: any) {
      const latency = Date.now() - start;
      const errorCode = classifyError(err);
      await supabase.from("image_attempts").update({
        status: "failed", error_code: errorCode, error_message: err.message?.substring(0, 500), latency_ms: latency,
      }).eq("id", attempt!.id);
      await updateCircuitAfterAttempt(supabase, currentProvider, false, skipCircuit);

      // All 3 attempts exhausted
      throw new Error(`C12.1_RETRY_EXHAUSTED: All 3 attempts failed. Last: ${errorCode} - ${err.message}`);
    }
  }
}

function classifyError(err: any): string {
  const msg = err.message?.toLowerCase() || "";
  if (msg.includes("429") || msg.includes("rate limit")) return "RATE_LIMIT";
  if (msg.includes("timeout") || msg.includes("408") || err.name === "AbortError") return "TIMEOUT";
  if (msg.includes("content_policy") || msg.includes("safety")) return "CONTENT_POLICY";
  if (msg.match(/5\d\d/)) return "PROVIDER_5XX";
  if (msg.includes("invalid") && msg.includes("prompt")) return "INVALID_PROMPT";
  return "GENERATION_FAILED";
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

    // C12.1.x: Parse fault injection header (admin-only guardrail)
    const isAdmin = userRoles.includes("admin");
    const fault = parseFaultInjection(req, isAdmin);

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

    // C12_CONCURRENCY_LOCK
    if (job.status === "processing") {
      return new Response(JSON.stringify({ ok: false, error_code: "LOCKED", error_message: "Job is already being processed (concurrency lock)" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // C12_JOB_STATE_MACHINE
    if (!["queued", "failed", "rejected"].includes(job.status)) {
      return new Response(JSON.stringify({ ok: false, error_code: "INVALID_STATUS", error_message: `Job status is ${job.status}, expected queued/failed/rejected` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // C12.1_RETRY_POLICY: Check existing attempt count
    const { count: existingAttempts } = await supabase
      .from("image_attempts")
      .select("id", { count: "exact", head: true })
      .eq("job_id", job_id);

    if ((existingAttempts || 0) >= 3) {
      console.warn(`[C12.1] MAX_ATTEMPTS_EXCEEDED for job ${job_id}: ${existingAttempts} attempts`);
      await supabase.from("image_jobs").update({
        status: "failed",
        error_code: "MAX_ATTEMPTS_EXCEEDED",
        error_message: `C12.1: Job already has ${existingAttempts} attempts (max 3)`,
      }).eq("id", job_id);

      return new Response(JSON.stringify({
        ok: false,
        error_code: "MAX_ATTEMPTS_EXCEEDED",
        error_message: `Job already has ${existingAttempts} attempts. Maximum is 3 per C12.1_RETRY_POLICY.`,
      }), {
        status: 429,
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

    // Compute hash with NORMALIZED prompt (C12.1_CACHE)
    const requestedProvider = provider || job.provider || "openai";
    const requestedModel = job.model || "gpt-image-1";
    const actualSize = size || job.size || "1024x1024";
    const hashInput = `${requestedProvider}|${requestedModel}|${actualSize}|${preset.key}|${preset.version}|${normalizePrompt(promptFinal)}`;
    const hash = await sha256(hashInput);

    // Cache check (C12.1_CACHE_GUARD)
    const { data: cachedAssets } = await supabase
      .from("image_assets")
      .select("*")
      .eq("hash", hash)
      .in("status", ["approved", "completed"])
      .limit(1);

    if (cachedAssets && cachedAssets.length > 0) {
      console.log(`[C12.1_SLO] IMAGE_CACHE_HIT: jobId=${job_id}, assetId=${cachedAssets[0].id}`);
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
        retry_count: 0,
        fallback_used: false,
        circuit_state: "N/A",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === C12.1_CIRCUIT_BREAKER: Resolve provider ===
    const circuit = await getCircuitState(supabase, requestedProvider);
    const actualProvider = resolveProviderWithCircuit(circuit, requestedProvider);
    const actualModel = actualProvider === "gemini" ? "google/gemini-2.5-flash-image" : "gpt-image-1";

    if (circuit && circuit.state === 'OPEN' && actualProvider === requestedProvider) {
      await supabase.from("image_lab_circuit_state").update({
        state: 'HALF_OPEN',
        updated_at: new Date().toISOString(),
      }).eq("provider", requestedProvider);
    }

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

    // === C12.1_RETRY_POLICY with SLO: Generate with retry + fallback ===
    const result = await generateWithRetryPolicy(
      supabase, job_id, actualProvider, actualModel, promptFinal, sizeInfo, fault,
    );

    const latencyMs = Date.now() - startTime;
    const lastAttemptId = result.attemptIds[result.attemptIds.length - 1];

    // Upload to storage
    const storagePath = `${job_id}/${lastAttemptId}/0.png`;
    const { error: uploadError } = await supabase.storage
      .from("image-lab")
      .upload(storagePath, result.imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    // Compute file hash (C12: Binary-safe)
    const fileHashBuffer = await crypto.subtle.digest("SHA-256", result.imageBytes);
    const fileHash = Array.from(new Uint8Array(fileHashBuffer))
      .map(b => b.toString(16).padStart(2, "0")).join("");

    // C12_STORAGE_PRIVACY: Store ONLY storage_path, never signed URLs in DB
    const { data: asset } = await supabase.from("image_assets").insert({
      job_id,
      attempt_id: lastAttemptId,
      status: "completed",
      variation_index: 0,
      storage_path: storagePath,
      public_url: null,
      width: sizeInfo.w,
      height: sizeInfo.h,
      sha256_bytes: fileHash,
      hash,
    }).select().single();

    // Get final circuit state for response
    const finalCircuit = await getCircuitState(supabase, result.usedProvider);

    // Update job
    await supabase.from("image_jobs").update({
      status: "completed",
      latency_ms: latencyMs,
      provider: result.usedProvider,
      model: result.usedModel,
      metadata: {
        ...(job.metadata as any || {}),
        fallback_used: result.fallbackUsed,
        fault_injection: fault.active ? fault.type : undefined,
      },
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
        provider: result.usedProvider,
        model: result.usedModel,
      },
      assets: [asset],
      cache_hit: false,
      retry_count: result.retryCount,
      fallback_used: result.fallbackUsed,
      circuit_state: finalCircuit?.state || "UNKNOWN",
      fault_injection: fault.active ? fault.type : undefined,
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
        const errorCode = classifyError(error);

        await supabase.from("image_jobs").update({
          status: "failed",
          error_code: errorCode,
          error_message: errorMsg,
        }).eq("id", body.job_id);

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
