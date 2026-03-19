import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { PROMPT_ENRICH_FRAMES, postProcessFrameDefaults, validateFrames } = await import("../_shared/prompt-master.ts");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { pipeline_id, batch_size = 3, batch_index = 0 } = await req.json();

    if (!pipeline_id) {
      return new Response(
        JSON.stringify({ error: "pipeline_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch pipeline
    const { data: pipeline, error: pipelineError } = await supabase
      .from("v10_bpa_pipeline")
      .select("*")
      .eq("id", pipeline_id)
      .single();

    if (pipelineError || !pipeline) {
      return new Response(
        JSON.stringify({ error: "Pipeline not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pipeline.lesson_id) {
      return new Response(
        JSON.stringify({ error: "Pipeline has no lesson_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch steps
    const { data: allSteps, error: stepsError } = await supabase
      .from("v10_lesson_steps")
      .select("*")
      .eq("lesson_id", pipeline.lesson_id)
      .order("step_number", { ascending: true });

    if (stepsError || !allSteps) {
      throw new Error(`Failed to fetch steps: ${stepsError?.message}`);
    }

    // 3. Batch the steps
    const start = batch_index * batch_size;
    const batchSteps = allSteps.slice(start, start + batch_size);
    const hasMoreBatches = start + batch_size < allSteps.length;

    if (batchSteps.length === 0) {
      return new Response(
        JSON.stringify({ success: 0, hasMoreBatches: false, message: "No steps in this batch" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[v10-enrich-frames] Processing batch ${batch_index}: steps ${start + 1}-${start + batchSteps.length} of ${allSteps.length}`);

    // 4. For each step, enrich frames via AI
    let successCount = 0;
    for (const step of batchSteps) {
      try {
        const stepsContext = JSON.stringify({
          step_number: step.step_number,
          title: step.title,
          app_name: step.app_name,
          description: step.description,
          frames: step.frames,
        });

        const userMessage = `Enriqueça os frames deste passo para que pareçam a interface REAL do app "${step.app_name}".

Passo atual:
${stepsContext}

Retorne APENAS o JSON array dos frames enriquecidos (mesmo formato, mas com elements completos e realistas).`;

        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: PROMPT_ENRICH_FRAMES },
                { role: "user", content: userMessage },
              ],
            }),
          }
        );

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`[v10-enrich-frames] AI error for step ${step.step_number}: ${aiResponse.status} ${errorText}`);
          continue;
        }

        const aiData = await aiResponse.json();
        const rawContent = aiData.choices?.[0]?.message?.content;

        if (!rawContent) {
          console.error(`[v10-enrich-frames] No content for step ${step.step_number}`);
          continue;
        }

        // Parse enriched frames
        let enrichedFrames;
        try {
          const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          enrichedFrames = JSON.parse(cleaned);
        } catch {
          console.error(`[v10-enrich-frames] Failed to parse JSON for step ${step.step_number}`);
          continue;
        }

        if (!Array.isArray(enrichedFrames)) {
          console.error(`[v10-enrich-frames] Response is not array for step ${step.step_number}`);
          continue;
        }

        // Post-process frame defaults (bar_color from TOOL_TABLE, chrome_header first)
        const tempStep = { ...step, frames: enrichedFrames };
        postProcessFrameDefaults([tempStep]);

        // Preserve mockup_url from original frames
        const originalFrames = step.frames || [];
        for (let i = 0; i < enrichedFrames.length; i++) {
          if (originalFrames[i]?.mockup_url) {
            enrichedFrames[i].mockup_url = originalFrames[i].mockup_url;
          }
        }

        // Update step with enriched frames
        const { error: updateError } = await supabase
          .from("v10_lesson_steps")
          .update({ frames: enrichedFrames })
          .eq("id", step.id);

        if (updateError) {
          console.error(`[v10-enrich-frames] Update error for step ${step.step_number}: ${updateError.message}`);
          continue;
        }

        successCount++;
        console.log(`[v10-enrich-frames] Step ${step.step_number} enriched: ${enrichedFrames.length} frames`);
      } catch (err) {
        console.error(`[v10-enrich-frames] Error processing step ${step.step_number}:`, err);
      }
    }

    // 5. Run V2 validation on all steps and log
    const { data: updatedSteps } = await supabase
      .from("v10_lesson_steps")
      .select("*")
      .eq("lesson_id", pipeline.lesson_id)
      .order("step_number", { ascending: true });

    if (updatedSteps) {
      const v2Result = validateFrames(updatedSteps);
      console.log(`[v10-enrich-frames] V2 validation: ${v2Result.passed ? 'PASSED' : 'FAILED'} (${v2Result.errors.length} errors)`);

      await supabase.from("v10_bpa_pipeline_log").insert({
        pipeline_id,
        stage: 3,
        action: "enrich_frames",
        details: {
          batch_index,
          batch_size,
          success_count: successCount,
          total_steps: allSteps.length,
          v2_validation: v2Result,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: successCount,
        hasMoreBatches,
        batch_index,
        total_steps: allSteps.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("v10-enrich-frames error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
