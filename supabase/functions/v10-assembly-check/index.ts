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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { pipeline_id } = await req.json();

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
        JSON.stringify({ error: "Pipeline not found", details: pipelineError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate lesson_id exists
    if (!pipeline.lesson_id) {
      return new Response(
        JSON.stringify({ error: "Pipeline has no lesson_id assigned" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonId = pipeline.lesson_id;

    // 3. Fetch all required data in parallel
    const [stepsRes, slidesRes, narrationsRes, lessonRes] = await Promise.all([
      // Steps for this lesson
      supabase
        .from("v10_lesson_steps")
        .select("*")
        .eq("lesson_id", lessonId),

      // Intro slides count
      supabase
        .from("v10_lesson_intro_slides")
        .select("id", { count: "exact", head: true })
        .eq("lesson_id", lessonId),

      // Narrations for this lesson
      supabase
        .from("v10_lesson_narrations")
        .select("*")
        .eq("lesson_id", lessonId),

      // Lesson metadata
      supabase
        .from("v10_lessons")
        .select("*")
        .eq("id", lessonId)
        .single(),
    ]);

    const steps = stepsRes.data || [];
    const slidesCount = slidesRes.count || 0;
    const narrations = narrationsRes.data || [];
    const lesson = lessonRes.data;

    // 4. Run all 11 checklist items
    const score_ok = pipeline.score_total >= 70;

    const structure_ok = pipeline.audit_passed === true;

    const steps_have_frames =
      steps.length > 0 &&
      steps.every(
        (s: Record<string, unknown>) =>
          Array.isArray(s.frames) && s.frames.length > 0
      );

    const steps_have_liv =
      steps.length > 0 &&
      steps.every((s: Record<string, unknown>) => {
        const liv = s.liv as Record<string, unknown> | null | undefined;
        return (
          liv &&
          typeof liv.tip === "string" &&
          liv.tip.trim().length > 0 &&
          typeof liv.analogy === "string" &&
          liv.analogy.trim().length > 0 &&
          typeof liv.sos === "string" &&
          liv.sos.trim().length > 0
        );
      });

    const intro_slides_ok = slidesCount > 0;

    const images_ok =
      pipeline.images_needed > 0 &&
      pipeline.images_approved >= pipeline.images_needed;

    const mockups_ok =
      pipeline.mockups_total > 0 &&
      pipeline.mockups_approved >= pipeline.mockups_total;

    // Count actual steps with audio_url instead of relying on pipeline counter
    const stepsWithAudio = steps.filter(
      (s: Record<string, unknown>) => s.audio_url != null && (s.audio_url as string).length > 0
    ).length;
    const audios_ok = steps.length > 0 && stepsWithAudio >= steps.length;

    const narration_a_ok = narrations.some(
      (n: Record<string, unknown>) =>
        n.part === "A" && n.audio_url != null
    );

    const narration_c_ok = narrations.some(
      (n: Record<string, unknown>) =>
        n.part === "C" && n.audio_url != null
    );

    const metadata_ok =
      !!lesson &&
      typeof lesson.title === "string" &&
      lesson.title.trim().length > 0 &&
      typeof lesson.description === "string" &&
      lesson.description.trim().length > 0 &&
      Array.isArray(lesson.tools) &&
      lesson.tools.length > 0;

    const results = {
      score_ok,
      structure_ok,
      steps_have_frames,
      steps_have_liv,
      intro_slides_ok,
      images_ok,
      mockups_ok,
      audios_ok,
      narration_a_ok,
      narration_c_ok,
      metadata_ok,
    };

    const allPassed = Object.values(results).every((v) => v === true);

    // 5. Update pipeline with checklist results
    const { error: updateError } = await supabase
      .from("v10_bpa_pipeline")
      .update({
        assembly_checklist: results,
        assembly_passed: allPassed,
      })
      .eq("id", pipeline_id);

    if (updateError) {
      throw new Error(`Failed to update pipeline: ${updateError.message}`);
    }

    // 6. Log the assembly check
    const { error: logError } = await supabase
      .from("v10_bpa_pipeline_log")
      .insert({
        pipeline_id,
        stage: 6,
        action: "assembly_check",
        details: results,
      });

    if (logError) {
      console.error("Failed to insert log:", logError.message);
    }

    // 7. Return results
    return new Response(
      JSON.stringify({ checklist: results, all_passed: allPassed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("assembly-check error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
