/**
 * image-lab-health — Observability endpoint for AI Image Lab
 * 
 * Returns provider circuit states, 24h KPIs, and degraded_mode status.
 * Auth: admin or supervisor (via REST /auth/v1/user + user_roles check).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    // === Auth: admin/supervisor via REST ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_MISSING", error_message: "No auth header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const authResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
    if (!authResp.ok) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_INVALID", error_message: "Invalid JWT" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authUser = await authResp.json();
    const userId = authUser.id;

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const userRoles = (roles || []).map((r: any) => r.role);
    if (!userRoles.includes("admin") && !userRoles.includes("supervisor")) {
      return new Response(JSON.stringify({ ok: false, error_code: "FORBIDDEN", error_message: "Admin/supervisor required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Fetch circuit states ===
    const { data: circuits } = await supabase
      .from("image_lab_circuit_state")
      .select("*");

    const providers: Record<string, any> = {};
    for (const c of (circuits || [])) {
      providers[c.provider] = {
        state: c.state,
        fail_count: c.fail_count,
        total_count: c.total_count,
        cooldown_until: c.cooldown_until,
        last_failure_at: c.last_failure_at,
      };
    }

    // === Fetch 24h KPIs from image_attempts ===
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: attempts } = await supabase
      .from("image_attempts")
      .select("provider, status, latency_ms")
      .gte("created_at", since24h);

    const kpis: Record<string, { total: number; failed: number; latencySum: number; latencyCount: number }> = {
      openai: { total: 0, failed: 0, latencySum: 0, latencyCount: 0 },
      gemini: { total: 0, failed: 0, latencySum: 0, latencyCount: 0 },
    };

    for (const a of (attempts || [])) {
      const p = a.provider as string;
      if (!kpis[p]) kpis[p] = { total: 0, failed: 0, latencySum: 0, latencyCount: 0 };
      kpis[p].total++;
      if (a.status === "failed") kpis[p].failed++;
      if (a.latency_ms) {
        kpis[p].latencySum += a.latency_ms;
        kpis[p].latencyCount++;
      }
    }

    const failRateOpenai = kpis.openai.total > 0 ? kpis.openai.failed / kpis.openai.total : 0;
    const failRateGemini = kpis.gemini.total > 0 ? kpis.gemini.failed / kpis.gemini.total : 0;
    const avgLatencyOpenai = kpis.openai.latencyCount > 0 ? Math.round(kpis.openai.latencySum / kpis.openai.latencyCount) : 0;
    const avgLatencyGemini = kpis.gemini.latencyCount > 0 ? Math.round(kpis.gemini.latencySum / kpis.gemini.latencyCount) : 0;

    // === Stuck jobs ===
    const { count: stuckCount } = await supabase
      .from("image_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "processing");

    // === Degraded mode calculation ===
    const reasons: string[] = [];
    const bothOpen = providers.openai?.state === "OPEN" && providers.gemini?.state === "OPEN";
    const highFailRates = failRateOpenai > 0.25 && failRateGemini > 0.50;

    if (bothOpen) reasons.push("BOTH_CIRCUITS_OPEN");
    if (highFailRates) reasons.push(`HIGH_FAIL_RATES: openai=${(failRateOpenai * 100).toFixed(1)}%, gemini=${(failRateGemini * 100).toFixed(1)}%`);
    if ((stuckCount || 0) > 0) reasons.push(`STUCK_JOBS: ${stuckCount}`);

    const degradedMode = bothOpen || highFailRates;

    return new Response(JSON.stringify({
      ok: true,
      timestamp: new Date().toISOString(),
      providers,
      kpis_24h: {
        avg_latency_openai_ms: avgLatencyOpenai,
        avg_latency_gemini_ms: avgLatencyGemini,
        fail_rate_openai: Math.round(failRateOpenai * 1000) / 1000,
        fail_rate_gemini: Math.round(failRateGemini * 1000) / 1000,
        jobs_total: (attempts || []).length,
        stuck_jobs: stuckCount || 0,
      },
      degraded_mode: degradedMode,
      reasons,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[image-lab-health] Error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error_code: "HEALTH_ERROR",
      error_message: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
