import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth: require admin/supervisor role
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const {
      searchScreens,
      searchFlows,
      getScreen,
      getFlow,
    } = await import("../_shared/refero.ts");

    const { action, query, screen_id, flow_id, limit } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: "action is required (search_screens | search_flows | get_screen | get_flow)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: unknown;

    switch (action) {
      case "search_screens": {
        if (!query) {
          return new Response(
            JSON.stringify({ error: "query is required for search_screens" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await searchScreens(query, limit ?? 10);
        break;
      }

      case "search_flows": {
        if (!query) {
          return new Response(
            JSON.stringify({ error: "query is required for search_flows" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await searchFlows(query, limit ?? 5);
        break;
      }

      case "get_screen": {
        if (!screen_id) {
          return new Response(
            JSON.stringify({ error: "screen_id is required for get_screen" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await getScreen(screen_id);
        break;
      }

      case "get_flow": {
        if (!flow_id) {
          return new Response(
            JSON.stringify({ error: "flow_id is required for get_flow" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = await getFlow(flow_id);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result ?? { error: "No result from Refero" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("v10-refero-search error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
