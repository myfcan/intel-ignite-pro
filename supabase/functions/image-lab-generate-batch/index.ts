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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_MISSING" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ ok: false, error_code: "AUTH_INVALID" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
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

    // Call image-lab-generate sequentially for each plan item
    const generateUrl = `${supabaseUrl}/functions/v1/image-lab-generate`;
    const allAssets: any[] = [];
    const errors: any[] = [];

    for (const item of plan) {
      const { provider = "openai", n = 1 } = item;

      for (let i = 0; i < n; i++) {
        try {
          const resp = await fetch(generateUrl, {
            method: "POST",
            headers: {
              "Authorization": authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ job_id, provider, n: 1, size }),
          });

          const result = await resp.json();
          if (result.ok && result.assets) {
            allAssets.push(...result.assets);
          } else {
            errors.push({ provider, index: i, error: result.error_message || "Unknown error" });
          }

          // Reset job status to queued for next iteration (if not last)
          if (i < n - 1 || plan.indexOf(item) < plan.length - 1) {
            await supabase.from("image_jobs").update({ status: "queued" }).eq("id", job_id);
          }
        } catch (err: any) {
          errors.push({ provider, index: i, error: err.message });
          // Reset for next attempt
          await supabase.from("image_jobs").update({ status: "queued" }).eq("id", job_id);
        }
      }
    }

    // Final status
    const finalStatus = allAssets.length > 0 ? "completed" : "failed";
    await supabase.from("image_jobs").update({ status: finalStatus }).eq("id", job_id);

    return new Response(JSON.stringify({
      ok: allAssets.length > 0,
      job_id,
      assets: allAssets,
      errors: errors.length > 0 ? errors : undefined,
      total_generated: allAssets.length,
      total_failed: errors.length,
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
