import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    // === PARTE 1: Auth hardened via getClaims() ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_MISSING" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_INVALID" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

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

    // === C12_CONCURRENCY_LOCK: Check job status before processing ===
    const { data: currentJob, error: jobCheckError } = await supabase.from("image_jobs").select("status").eq("id", job_id).single();
    if (jobCheckError || !currentJob) {
      return new Response(JSON.stringify({ ok: false, error_code: "JOB_NOT_FOUND", error_message: `Job ${job_id} not found` }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (currentJob.status === "processing") {
      return new Response(JSON.stringify({ ok: false, error_code: "LOCKED", error_message: "Job is already being processed (concurrency lock)" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["queued", "failed", "rejected"].includes(currentJob.status)) {
      return new Response(JSON.stringify({ ok: false, error_code: "INVALID_STATUS", error_message: `Job status is ${currentJob.status}, cannot start batch` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Set job to processing ONCE at start ===
    await supabase.from("image_jobs").update({
      status: "processing",
      updated_at: new Date().toISOString(),
    }).eq("id", job_id);

    // Build flat list of tasks from plan
    const tasks: Array<{ provider: string; index: number }> = [];
    for (const item of plan) {
      const { provider = "openai", n = 1 } = item;
      for (let i = 0; i < n; i++) {
        tasks.push({ provider, index: tasks.length });
      }
    }

    // === PARTE 2: Execute ALL tasks in parallel via Promise.allSettled ===
    const generateUrl = `${supabaseUrl}/functions/v1/image-lab-generate`;
    const startTime = Date.now();

    const results = await Promise.allSettled(
      tasks.map(async (task) => {
        const resp = await fetch(generateUrl, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ job_id, provider: task.provider, n: 1, size }),
        });
        const result = await resp.json();
        if (!result.ok) {
          throw new Error(result.error_message || `${task.provider} failed`);
        }
        return { provider: task.provider, assets: result.assets || [] };
      })
    );

    const totalLatencyMs = Date.now() - startTime;

    // Aggregate results
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
        allAssets.push(...result.value.assets);
        providerStats[task.provider].success++;
      } else {
        errors.push({ provider: task.provider, index: task.index, error: result.reason?.message || "Unknown error" });
        providerStats[task.provider].fail++;
      }
    }

    // === PARTE 2: Final status — consistent state machine ===
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
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[image-lab-generate-batch] Error:", error);
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
