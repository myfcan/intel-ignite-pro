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

    const { pipeline_id, num_steps } = await req.json();

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

    // 4. Call the Lovable AI Gateway
    const systemPrompt = `Voce e um designer instrucional especializado em criar aulas interativas passo-a-passo para plataformas de aprendizado.

Gere uma lista de passos de aula em formato JSON array. Cada passo deve ser um objeto com a seguinte estrutura:

{
  "title": "string - titulo curto e descritivo do passo",
  "description": "string - descricao detalhada do que o aluno deve fazer neste passo",
  "phase": number (1-5),
  "app_name": "string - nome da ferramenta sendo usada, ex: VS Code, Terminal, Chrome, GitHub, Figma",
  "duration_seconds": number (entre 20 e 60),
  "frames": [
    {
      "bar_text": "string - texto principal da barra de progresso",
      "bar_sub": "string - subtexto da barra",
      "bar_color": "string - cor hex, ex: #6366f1",
      "elements": [
        { "type": "text", "content": "string - instrucao ou conteudo textual" },
        { "type": "chrome_header", "url": "string - URL exibida no navegador simulado" },
        { "type": "button", "label": "string", "primary": true }
      ],
      "tip": null ou { "text": "string - dica contextual", "position": "top" ou "bottom" },
      "action": "string ou null - acao esperada do usuario, ex: 'click_button', 'type_text'",
      "check": "string ou null - validacao a ser feita, ex: 'file_exists', 'output_contains'"
    }
  ],
  "liv": {
    "tip": "string - dica rapida da assistente Liv",
    "analogy": "string - analogia para facilitar o entendimento",
    "sos": "string - mensagem de socorro se o aluno travar"
  }
}

Fases:
1 = Preparacao (setup inicial, contexto)
2 = Configuracao (configurar ferramentas e ambiente)
3 = Execucao (realizar a tarefa principal)
4 = Validacao (testar e verificar resultados)
5 = Conclusao (revisar e consolidar aprendizado)

Regras:
- Cada passo deve ter pelo menos 1 frame e no maximo 3 frames
- Distribua as fases logicamente ao longo dos passos
- Use duration_seconds entre 20 e 60, proporcional a complexidade
- Inclua dicas uteis nos campos liv
- Retorne APENAS o JSON array, sem markdown, sem explicacoes adicionais`;

    const userMessage = `Gere ${num_steps} passos para a aula "${pipeline.title}" (slug: ${pipeline.slug}). Notas do instrutor: ${pipeline.docs_manual_input || "nenhuma"}`;

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

    // 8. Insert each step into v10_lesson_steps
    const insertedSteps = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const { data: inserted, error: insertError } = await supabase
        .from("v10_lesson_steps")
        .insert({
          lesson_id,
          step_number: i + 1,
          title: step.title,
          description: step.description,
          phase: step.phase,
          app_name: step.app_name,
          duration_seconds: step.duration_seconds,
          frames: step.frames,
          liv: step.liv,
          app_badge_bg: "#e2e8f0",
          app_badge_color: "#1e293b",
          accent_color: "#6366f1",
          progress_percent: 0,
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

    // 11. Log to v10_bpa_pipeline_log
    await supabase.from("v10_bpa_pipeline_log").insert({
      pipeline_id,
      stage: 2,
      action: "steps_generated",
      details: {
        lesson_id,
        num_steps: steps.length,
        estimated_minutes: estimatedMinutes,
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
