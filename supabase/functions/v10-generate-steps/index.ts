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
    const systemPrompt = `Voce e um designer instrucional V10 especializado em criar aulas interativas que SIMULAM a interface real dos apps/ferramentas. Cada frame deve parecer um MOCKUP da tela do app, usando elementos de UI — NUNCA imagens ilustrativas genericas.

## ESTRUTURA DO STEP

{
  "title": "string - titulo curto e descritivo",
  "slug": "string - kebab-case do titulo, ex: criar-conta-make",
  "description": "string - descricao CONTEXTUAL do passo (o que e a ferramenta, por que este passo importa)",
  "phase": number (1-5),
  "app_name": "string - nome CURTO da ferramenta (ex: Make, Bland AI, Sheets, Forms, Calendly)",
  "app_icon": "string - emoji representativo (ex: 🌐, 📞, 📊, 📝, 📅)",
  "app_badge_bg": "string - cor de fundo do badge hex (clara, ex: #EEF2FF)",
  "app_badge_color": "string - cor do texto do badge hex (escura, ex: #6366F1)",
  "accent_color": "string - cor principal do app hex (ex: #6366F1 para Make, #1E293B para Bland)",
  "duration_seconds": number (20-60),
  "frames": [Frame],
  "liv": { "tip": "string", "analogy": "string", "sos": "string" },
  "warnings": Warning ou null
}

## OS 15 TIPOS DE ELEMENTO (use todos que fizerem sentido para simular a interface real)

1. chrome_header — Barra do navegador simulado
   {"type": "chrome_header", "url": "make.com/en/register"}

2. text — Instrucao ou conteudo textual
   {"type": "text", "content": "Crie sua conta gratuita no Make.com"}

3. input — Campo de entrada (simula inputs reais do app)
   {"type": "input", "label": "Email", "placeholder": "seu@email.com", "highlight": true}
   Use highlight:true no campo principal que o aluno deve preencher.

4. select — Menu dropdown
   {"type": "select", "label": "Modelo", "options": ["GPT-3.5", "GPT-4"], "selected": 0}

5. button — Botao de acao
   {"type": "button", "label": "Sign up with email", "primary": true}
   primary:true = botao principal, primary:false = secundario.

6. warning — Alerta visual dentro do frame
   {"type": "warning", "text": "A key aparece CORTADA. Crie uma nova."}

7. nav_breadcrumb — Caminho de navegacao dentro do app
   {"type": "nav_breadcrumb", "from": "Dashboard", "to": "Settings → API Keys", "how": "Menu lateral → Settings → API Keys"}

8. table — Tabela de dados do app
   {"type": "table", "headers": ["Name", "Key"], "rows": [["Default", "org_e6b9...435"]]}

9. code_block — Bloco de codigo/JSON
   {"type": "code_block", "language": "json", "content": "{\\"key\\": \\"value\\"}"}

10. celebration — Tela de conquista/celebracao
    {"type": "celebration", "text": "Planilha criada!", "next": "Agora vamos criar o formulario."}

11. dependency — Referencia a passo anterior
    {"type": "dependency", "text": "Voce vai precisar da API Key do passo 2."}

12. tooltip_term — Termo tecnico com explicacao
    {"type": "tooltip_term", "term": "Webhook", "tip": "URL que recebe dados automaticamente"}

13. divider — Separador visual
    {"type": "divider"}

14. image — Placeholder para screenshot (sera preenchido depois)
    {"type": "image", "src": "", "alt": "Tela do dashboard do Make"}

15. shimmer — Placeholder de carregamento
    {"type": "shimmer", "height": 40}

## ESTRUTURA DO FRAME

{
  "bar_text": "string - dominio/nome do app (ex: make.com, bland.ai)",
  "bar_sub": "string - pagina/secao atual (ex: Pagina inicial, Settings → API Keys)",
  "bar_color": "string - cor hex do app",
  "elements": [array de elementos que SIMULAM a interface real],
  "tip": {"text": "string - dica contextual", "position": "top" ou "bottom"} ou null,
  "action": "string DESCRITIVA - o que o aluno deve fazer (ex: Acesse make.com e clique em Sign up. Use email do Google.)",
  "check": "string DESCRITIVA - como o aluno confirma que fez certo (ex: Voce ve o Dashboard do Make com o botao Create a new scenario.)" ou null
}

IMPORTANTE sobre action e check:
- action deve ser uma FRASE DESCRITIVA dizendo exatamente o que fazer (NAO use codigos como click_button, type_text)
- check deve descrever o que o aluno deve VER na tela para confirmar (NAO use codigos como file_exists, output_contains)
- O ultimo frame de cada step DEVE ter check preenchido

## ESTRUTURA DE WARNINGS (mapeado para "Pontos de atencao" no menu LIV)

Cada step pode ter um campo warnings:
{
  "warn": "string - alerta principal (ex: Escolha Hosting Region: US, nao Europe.)",
  "ift": {
    "tag": "SE → ENTAO",
    "desc": "string - condicao (ex: Apareceu tela de onboarding?)",
    "act": "string - o que fazer (ex: Clique Skip ou X ate ver o Dashboard.)"
  }
}

Se o step tem alguma armadilha, pegadinha, ou situacao condicional, SEMPRE gere warnings.
Se nao ha armadilha, use null.

## ESTRUTURA DE LIV (Assistente Virtual)

{
  "tip": "Resumo rapido do passo em 1-2 frases",
  "analogy": "Analogia do mundo real para facilitar entendimento (ex: API Key e tipo a senha do Wi-Fi)",
  "sos": "Mensagem de socorro detalhada se o aluno travar"
}

TODOS os 3 campos sao OBRIGATORIOS em cada step.

## EXEMPLO COMPLETO (Step 1 da aula SDR de Voz com IA)

{
  "title": "Criar conta no Make.com",
  "slug": "criar-conta-make",
  "description": "O Make.com (plataforma que conecta apps entre si) e a ferramenta que vai conectar tudo: quando um lead preencher o formulario, o Make dispara a ligacao automaticamente.",
  "phase": 1,
  "app_name": "Make",
  "app_icon": "🌐",
  "app_badge_bg": "#EEF2FF",
  "app_badge_color": "#6366F1",
  "accent_color": "#6366F1",
  "duration_seconds": 45,
  "frames": [
    {
      "bar_text": "make.com", "bar_sub": "Pagina inicial", "bar_color": "#6366F1",
      "elements": [
        {"type": "chrome_header", "url": "make.com/en/register"},
        {"type": "text", "content": "Crie sua conta gratuita no Make.com"},
        {"type": "input", "label": "Email", "placeholder": "seu@email.com", "highlight": true},
        {"type": "input", "label": "Senha", "placeholder": "Minimo 8 caracteres", "highlight": false},
        {"type": "button", "label": "Sign up with email", "primary": true},
        {"type": "divider"},
        {"type": "button", "label": "Continue with Google", "primary": false}
      ],
      "tip": {"text": "Use o mesmo email que usa no Google — vai facilitar na hora de conectar", "position": "bottom"},
      "action": "Acesse make.com e clique em Sign up. Use seu email do Google para facilitar.",
      "check": null
    },
    {
      "bar_text": "make.com", "bar_sub": "Onboarding", "bar_color": "#6366F1",
      "elements": [
        {"type": "chrome_header", "url": "make.com/onboarding"},
        {"type": "text", "content": "O Make vai fazer varias perguntas de personalizacao."},
        {"type": "warning", "text": "O Make vai fazer varias perguntas. Nao importa o que responder — clique Skip ou X em tudo ate chegar no Dashboard."},
        {"type": "button", "label": "Skip", "primary": false},
        {"type": "button", "label": "Continue", "primary": true}
      ],
      "tip": {"text": "Skip, Skip, Skip — ignore tudo ate ver o Dashboard", "position": "top"},
      "action": "Pule todas as perguntas do onboarding. Clique Skip ou X ate chegar no Dashboard.",
      "check": "Voce ve o Dashboard do Make com o botao Create a new scenario."
    }
  ],
  "liv": {
    "tip": "Nesse passo voce cria sua conta no Make.com. E gratuito e leva 2 minutos. Use o email do Google pra facilitar depois.",
    "analogy": "O Make e tipo uma linha de montagem digital: voce programa quando acontecer X, faca Y automaticamente.",
    "sos": "Se tiver duvida sobre qual plano escolher: o gratuito ja serve. Ele permite 1.000 operacoes/mes."
  },
  "warnings": {
    "warn": "Escolha Hosting Region: US (nao Europe). Algumas integracoes funcionam melhor na regiao US.",
    "ift": {"tag": "SE → ENTAO", "desc": "Apareceu tela de onboarding com perguntas?", "act": "Clique Skip ou X em tudo ate ver o Dashboard."}
  }
}

## FASES

1 = Preparacao (criar contas, instalar, contextualizar)
2 = Configuracao (configurar ferramentas, conectar APIs)
3 = Execucao (realizar a tarefa principal da aula)
4 = Validacao (testar, verificar resultados)
5 = Conclusao (revisar, consolidar aprendizado, celebrar)

## REGRAS OBRIGATORIAS

1. Cada frame DEVE simular a interface REAL do app — use chrome_header + inputs + buttons + tabelas etc.
2. NUNCA gere frames so com texto generico. Cada frame deve parecer uma tela real do app.
3. REGRA DE FRAMES POR PASSO (OBRIGATORIA — analise a complexidade da navegacao):
   1 frame = Acao simples numa unica tela (ex: "Crie uma planilha nova" → 1 tela so)
   2 frames = Acao com navegacao entre telas (ex: "Va em Settings, depois API Keys" → Dashboard → API Keys = 2 telas)
   3 frames = Acao complexa com multiplas telas (ex: "Crie conta, pule onboarding, chegue no Dashboard" → Signup → Onboarding → Dashboard = 3 telas)
   Cada frame = 1 mockup que sera gerado na Etapa 3. Total de frames = total de mockups.
   Media esperada: ~1.5 frames/passo. Minimo absoluto: 1 frame por passo.
   Cada frame DEVE ter bar_text preenchido (dominio/URL do app da tela).
   JUSTIFIQUE o numero de frames baseado na complexidade da navegacao no passo.
4. action deve ser FRASE DESCRITIVA (ex: "Acesse make.com e clique em Sign up"), NUNCA codigos como "click_button".
5. check deve descrever O QUE O ALUNO VE NA TELA (ex: "Voce ve o Dashboard com o botao Create"), NUNCA codigos como "file_exists".
6. warnings e OBRIGATORIO quando ha armadilhas ou situacoes condicionais. Use null se nao ha.
7. liv.tip, liv.analogy e liv.sos sao TODOS obrigatorios em cada step.
8. Use tooltip_term para termos tecnicos que o aluno pode nao conhecer.
9. Use nav_breadcrumb quando o aluno precisa navegar menus do app.
10. Use dependency quando o step depende de algo feito anteriormente.
11. Use celebration no frame final de uma secao/conquista importante.
12. Quando trocar de ferramenta entre steps, inclua texto "🔄 Mudamos de ferramenta! Saimos do X → Entramos no Y."
13. Retorne APENAS o JSON array, sem markdown, sem explicacoes adicionais.`;

    const userMessage = `Gere ${num_steps} passos para a aula "${pipeline.title}" (slug: ${pipeline.slug}).

Documentacao/notas do instrutor sobre o app:
${pipeline.docs_manual_input || "Nenhuma documentacao fornecida — use seu conhecimento sobre o app."}

Lembre-se:
- Cada frame deve SIMULAR a interface real do app com chrome_header, inputs, buttons, tables, etc.
- Gere warnings para passos com armadilhas ou situacoes condicionais.
- action e check devem ser FRASES DESCRITIVAS, nao codigos.
- Todos os campos de liv (tip, analogy, sos) sao obrigatorios.
- Use tooltip_term para termos tecnicos, nav_breadcrumb para navegacao, dependency para referencias a passos anteriores.`;

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
