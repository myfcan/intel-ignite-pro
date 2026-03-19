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

    const { pipeline_id, num_steps, instructions, trail_id, course_id } = await req.json();

    if (!pipeline_id || !num_steps) {
      return new Response(
        JSON.stringify({ error: "pipeline_id and num_steps are required" }),
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
        JSON.stringify({ error: "Pipeline not found", details: pipelineError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let lesson_id = pipeline.lesson_id;

    // 2. If pipeline has no lesson_id, create one in v10_lessons
    if (!lesson_id) {
      const { data: lesson, error: lessonError } = await supabase
        .from("v10_lessons")
        .insert({
          slug: pipeline.slug,
          title: pipeline.title,
          status: "draft",
          total_steps: 0,
          estimated_minutes: 0,
          tools: [],
          xp_reward: 0,
          order_in_trail: 0,
        })
        .select("id")
        .single();

      if (lessonError || !lesson) {
        throw new Error(`Failed to create lesson: ${lessonError?.message}`);
      }

      lesson_id = lesson.id;

      // 3. Update pipeline with the new lesson_id
      const { error: updatePipelineError } = await supabase
        .from("v10_bpa_pipeline")
        .update({ lesson_id })
        .eq("id", pipeline_id);

      if (updatePipelineError) {
        throw new Error(`Failed to update pipeline with lesson_id: ${updatePipelineError.message}`);
      }
    }

    // 4. Call the Lovable AI Gateway — using Prompt Master system prompt
    const { PROMPT_GENERATE_STEPS, postProcessC2C3, postProcessFrameDefaults, validateTools, validateStructure } = await import("../_shared/prompt-master.ts");
    const systemPrompt = PROMPT_GENERATE_STEPS;

    // Extract declared tools from pipeline title/docs
    const declaredTools = (pipeline.tools as string[] || []);

    const instructionsBlock = instructions
      ? `\n\nINSTRUÇÕES DO INSTRUTOR (prioridade máxima):\n${instructions}\n`
      : '';

    const userMessage = `Gere ${num_steps} passos para a aula "${pipeline.title}" (slug: ${pipeline.slug}).

Ferramentas declaradas: ${declaredTools.length > 0 ? declaredTools.join(', ') : 'Detectar automaticamente do contexto'}

Documentacao/notas do instrutor sobre o app:
${pipeline.docs_manual_input || "Nenhuma documentacao fornecida — use seu conhecimento sobre o app."}
${instructionsBlock}
REGRAS CRÍTICAS (auditoria automática V1-V5):
- Use APENAS as ferramentas declaradas (V1). Último passo = AILIV.
- 3 fases obrigatórias (phase_number 1-3), não 5 (V3).
- Média ≤1.5 frames/passo (V2). 78% dos passos devem ter 1 frame.
- 80%+ dos passos devem ter dependency (V3).
- 3-5 celebrations no total (V3).
- description > 30 chars com termos técnicos → tooltip_term obrigatório (C2).
- bar_sub muda entre frames → nav_breadcrumb obrigatório (C3).
- Declare lesson_type: "automation" | "tutorial" | "conceptual".

Retorne APENAS o JSON array.`;

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
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI Gateway error (${aiResponse.status}): ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("No content returned from AI Gateway");
    }

    // 7. Parse the JSON response
    let steps;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      steps = JSON.parse(cleaned);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${rawContent.substring(0, 500)}`);
    }

    if (!Array.isArray(steps)) {
      throw new Error("AI response is not a JSON array");
    }

    // 7b. Validate and fix frames
    let totalFrames = 0;
    for (const step of steps) {
      if (!step.frames || !Array.isArray(step.frames) || step.frames.length === 0) {
        // Auto-fix: create a default frame if none exist
        step.frames = [{
          bar_text: step.app_name || "app",
          bar_sub: step.title || "Tela principal",
          bar_color: step.accent_color || "#6366F1",
          elements: [],
        }];
        console.warn(`[v10-generate-steps] Step "${step.title}" had 0 frames — auto-created 1 default frame`);
      }
      for (const frame of step.frames) {
        if (!frame.bar_text) {
          frame.bar_text = step.app_name || "app";
          console.warn(`[v10-generate-steps] Frame in "${step.title}" had empty bar_text — auto-filled with "${frame.bar_text}"`);
        }
      }
      totalFrames += step.frames.length;
    }
    const avgFrames = steps.length > 0 ? totalFrames / steps.length : 0;
    console.log(`[v10-generate-steps] Frame validation: ${totalFrames} total frames across ${steps.length} steps (avg: ${avgFrames.toFixed(2)})`);
    if (avgFrames < 1.3) {
      console.warn(`[v10-generate-steps] WARNING: Low frame average ${avgFrames.toFixed(2)} (expected >= 1.3). Steps may need more frames for multi-screen navigation.`);
    }

    // 7c. POST-PROCESSING: Use shared utilities from prompt-master.ts
    const c2c3Result = postProcessC2C3(steps);
    console.log(`[v10-generate-steps] Post-processing C2C3: ${c2c3Result.c2Fixes} C2 fixes, ${c2c3Result.c3Fixes} C3 fixes`);

    postProcessFrameDefaults(steps);
    console.log(`[v10-generate-steps] Post-processing frame defaults complete`);

    // 7d. Run V1 + V3 validations (log only, non-blocking)
    const v1Result = validateTools(steps, declaredTools);
    if (!v1Result.passed) {
      console.warn(`[v10-generate-steps] V1 validation warnings: ${v1Result.errors.join('; ')}`);
    }
    const v3Result = validateStructure(steps);
    if (!v3Result.passed) {
      console.warn(`[v10-generate-steps] V3 validation warnings: ${v3Result.errors.join('; ')}`);
    }

    // Check for INTERMEDIARY_NEEDED response
    if (steps.length === 1 && steps[0]?.status === 'INTERMEDIARY_NEEDED') {
      const { error: intError } = await supabase
        .from("v10_bpa_pipeline")
        .update({ intermediary_status: steps[0] })
        .eq("id", pipeline_id);
      if (intError) console.error("Failed to save intermediary_status:", intError);
      return new Response(
        JSON.stringify({ success: true, intermediary_needed: true, options: steps[0].options }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Insert each step into v10_lesson_steps
    const insertedSteps = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const slug = step.slug || step.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
      const progressPercent = Math.round((100 / steps.length) * (i + 1));
      const { data: inserted, error: insertError } = await supabase
        .from("v10_lesson_steps")
        .insert({
          lesson_id,
          step_number: i + 1,
          slug,
          title: step.title,
          description: step.description,
          phase: step.phase,
          app_name: step.app_name,
          app_icon: step.app_icon || null,
          duration_seconds: step.duration_seconds,
          frames: step.frames,
          liv: step.liv,
          warnings: step.warnings || null,
          app_badge_bg: step.app_badge_bg || "#EEF2FF",
          app_badge_color: step.app_badge_color || "#6366F1",
          accent_color: step.accent_color || "#6366F1",
          progress_percent: progressPercent,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`Failed to insert step ${i + 1}: ${insertError.message}`);
      }

      insertedSteps.push(inserted);
    }

    // 9. Update v10_bpa_pipeline with steps_generated count
    const { error: updateStepsError } = await supabase
      .from("v10_bpa_pipeline")
      .update({ steps_generated: steps.length })
      .eq("id", pipeline_id);

    if (updateStepsError) {
      throw new Error(`Failed to update pipeline steps_generated: ${updateStepsError.message}`);
    }

    // 10. Update v10_lessons with total_steps, estimated_minutes, description, and tools
    const totalDurationSeconds = steps.reduce(
      (sum: number, s: { duration_seconds: number }) => sum + (s.duration_seconds || 0),
      0
    );
    const estimatedMinutes = Math.ceil(totalDurationSeconds / 60);

    // Extract unique tools from step app_name values
    const toolsSet = new Set<string>();
    for (const step of steps) {
      if (step.app_name && typeof step.app_name === "string" && step.app_name.trim()) {
        toolsSet.add(step.app_name.trim());
      }
    }
    const tools = Array.from(toolsSet);

    // Generate a description from pipeline data
    const description = `Aula prática de ${pipeline.title} com ${steps.length} passos interativos. Ferramentas: ${tools.join(", ") || "diversas"}. Duração estimada: ${estimatedMinutes} minutos.`;

    const { error: updateLessonError } = await supabase
      .from("v10_lessons")
      .update({
        total_steps: steps.length,
        estimated_minutes: estimatedMinutes,
        description,
        tools,
      })
      .eq("id", lesson_id);

    if (updateLessonError) {
      throw new Error(`Failed to update lesson: ${updateLessonError.message}`);
    }

    // 10b. Auto-create intro slides based on tools
    const introSlides = [];

    // Slide 1: Welcome/title slide
    introSlides.push({
      lesson_id,
      slide_order: 1,
      icon: "BookOpen",
      tool_name: null,
      tool_color: "#6366f1",
      title: pipeline.title,
      subtitle: `${steps.length} passos | ${estimatedMinutes} min`,
      description: `Bem-vindo! Nesta aula você vai aprender ${pipeline.title.toLowerCase()}.`,
      label: "Introdução",
      appear_at_seconds: 0,
    });

    // Slides for each tool
    const toolColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
    tools.forEach((tool, idx) => {
      introSlides.push({
        lesson_id,
        slide_order: idx + 2,
        icon: "Wrench",
        tool_name: tool,
        tool_color: toolColors[idx % toolColors.length],
        title: tool,
        subtitle: "Ferramenta utilizada",
        description: `Você vai usar ${tool} nesta aula.`,
        label: "Ferramenta",
        appear_at_seconds: (idx + 1) * 3,
      });
    });

    // Final slide: "Vamos começar"
    introSlides.push({
      lesson_id,
      slide_order: tools.length + 2,
      icon: "Rocket",
      tool_name: null,
      tool_color: "#10B981",
      title: "Vamos começar!",
      subtitle: "Tudo pronto para iniciar",
      description: "Clique em continuar para começar o tutorial.",
      label: "Início",
      appear_at_seconds: (tools.length + 1) * 3,
    });

    // Delete existing intro slides (idempotent)
    await supabase
      .from("v10_lesson_intro_slides")
      .delete()
      .eq("lesson_id", lesson_id);

    // Insert new intro slides
    const { error: introError } = await supabase
      .from("v10_lesson_intro_slides")
      .insert(introSlides);

    if (introError) {
      console.error("Failed to create intro slides:", introError.message);
    }

    // 11. Log to v10_bpa_pipeline_log (includes C2/C3 fix counts for forensics)
    await supabase.from("v10_bpa_pipeline_log").insert({
      pipeline_id,
      stage: 2,
      action: "steps_generated",
      details: {
        lesson_id,
        num_steps: steps.length,
        estimated_minutes: estimatedMinutes,
      c2_fixes: c2c3Result.c2Fixes,
      c3_fixes: c2c3Result.c3Fixes,
      },
    });

    // 12. Return steps count and lesson_id
    return new Response(
      JSON.stringify({
        success: true,
        lesson_id,
        steps_count: steps.length,
        estimated_minutes: estimatedMinutes,
        tools,
        intro_slides_created: introSlides.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("v10-generate-steps error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
