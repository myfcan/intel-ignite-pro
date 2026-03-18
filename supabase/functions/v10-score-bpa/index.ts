import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Auth: require admin/supervisor role
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const { pipeline_id } = await req.json();

    if (!pipeline_id) {
      return new Response(
        JSON.stringify({ error: 'pipeline_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch pipeline
    const { data: pipeline, error: fetchError } = await (supabase as any)
      .from('v10_bpa_pipeline')
      .select('*')
      .eq('id', pipeline_id)
      .single();

    if (fetchError || !pipeline) {
      console.error('Error fetching pipeline:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Pipeline not found', details: fetchError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Extract context
    const { title, slug, docs_manual_input } = pipeline;

    // 3. Query Refero MCP for real screen availability data
    let referoContext = "";
    let referoScreenCount = 0;
    let referoFlowCount = 0;

    try {
      const { searchScreens, searchFlows } = await import("../_shared/refero.ts");

      // Extract the tool/app name from the title (e.g., "SDR de Voz com Bland AI" → "Bland AI")
      const searchQuery = title;

      const [screensResult, flowsResult] = await Promise.all([
        searchScreens(searchQuery, 5),
        searchFlows(searchQuery, 3),
      ]);

      referoScreenCount = screensResult.total;
      referoFlowCount = flowsResult.total;

      if (referoScreenCount > 0 || referoFlowCount > 0) {
        const screenNames = screensResult.screens
          .map((s: any) => s.screen_name || s.app_name || "screen")
          .join(", ");

        referoContext = `\n\nDADOS DO REFERO (banco real de 126.000+ telas):
- Telas encontradas para "${searchQuery}": ${referoScreenCount}
- Fluxos de usuário encontrados: ${referoFlowCount}
${screensResult.screens.length > 0 ? `- Exemplos de telas: ${screenNames}` : ""}
USE esses dados reais para calibrar o score_refero. Se há muitas telas (>10), score_refero deve ser alto (80-95). Se há poucas (1-5), score_refero médio (50-70). Se não há telas (0), score_refero baixo (10-30).`;
      } else {
        referoContext = `\n\nDADOS DO REFERO: Nenhuma tela encontrada para "${searchQuery}" no banco Refero (126.000+ telas). Isso indica que a ferramenta pode ter poucos screenshots de referência disponíveis. Considere isso ao definir score_refero (provavelmente 10-40).`;
      }

      console.log(`Refero search for "${searchQuery}": ${referoScreenCount} screens, ${referoFlowCount} flows`);
    } catch (err) {
      console.warn("Refero MCP query failed (non-fatal):", err);
      referoContext = "\n\nDADOS DO REFERO: Consulta ao Refero indisponível. Avalie score_refero com base no seu conhecimento geral.";
    }

    // 4. Call Lovable AI Gateway with Refero-enriched context
    const systemPrompt = `Você é um especialista sênior em design instrucional para aulas de tecnologia, com profundo conhecimento do ecossistema de ferramentas digitais populares (Canva, Notion, ChatGPT, Calendly, Google Workspace, Figma, Midjourney, Make, Bland AI, etc.).

TAREFA: Analise o tema proposto para uma aula prática e retorne um JSON com 5 scores (0-100 cada):

1. **score_refero** (0-100): Disponibilidade de screenshots e referências visuais no banco Refero e na web.
   - Ferramentas com muitas telas no Refero (>10) ou com GUI pública muito conhecida = 80-95
   - Ferramentas com poucas telas no Refero (1-10) ou com GUI razoável = 50-75
   - Ferramentas sem telas no Refero e sem GUI pública = 10-35

2. **score_docs** (0-100): Qualidade da documentação oficial e recursos de aprendizado.
   - Docs oficiais completas, API pública, help center, comunidade ativa = 80-95
   - Docs parciais ou só blog posts = 50-70
   - Documentação escassa ou inexistente = 10-35

3. **score_pedagogy** (0-100): Valor pedagógico e aplicabilidade prática para renda extra.
   - Ensina habilidades diretamente monetizáveis (automação, criação, produtividade) = 80-95
   - Aplicação prática indireta = 50-70
   - Puramente teórico = 10-35

4. **score_difficulty** (0-100): Facilidade de ensino (INVERTIDO: mais fácil = mais pontos).
   - UI intuitiva, fluxos claros, poucos pré-requisitos = 80-95
   - Complexidade moderada = 50-70
   - Curva íngreme, muitos pré-requisitos = 10-35

5. **score_relevance** (0-100): Relevância no mercado atual e demanda.
   - IA generativa, automação, no-code (tendências 2024-2025) = 80-95
   - Ferramentas estáveis e consolidadas = 50-70
   - Tecnologias em declínio = 10-35

REGRAS:
- Use seu conhecimento geral sobre o ecossistema da ferramenta/tema mencionado
- NÃO penalize por falta de "notas do usuário" — avalie pelo TEMA em si
- Ferramentas populares (Calendly, Canva, ChatGPT, Notion) = scores altos por padrão
- Retorne APENAS JSON puro com os 5 scores + "justificativa" (objeto com 5 strings curtas)
- Formato: { "score_refero": N, "score_docs": N, "score_pedagogy": N, "score_difficulty": N, "score_relevance": N, "justificativa": { "refero": "...", "docs": "...", "pedagogy": "...", "difficulty": "...", "relevance": "..." } }
- Sem markdown, sem code blocks, apenas JSON puro.`;

    const userMessage = `Tema da aula: ${title}
Slug: ${slug}
Notas adicionais do criador: ${docs_manual_input || 'Nenhuma nota fornecida — avalie com base no seu conhecimento sobre o tema.'}${referoContext}`;

    console.log('Calling Lovable AI Gateway for pipeline:', pipeline_id);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway returned ${aiResponse.status}: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('No content in AI response');
    }

    console.log('AI raw response:', rawContent);

    // 5. Parse the AI response JSON
    const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const scores = JSON.parse(cleaned);

    const {
      score_refero,
      score_docs,
      score_pedagogy,
      score_difficulty,
      score_relevance,
    } = scores;

    // 6. Calculate weighted average (matching frontend Stage1Score)
    // Weights: Refero 20%, Docs 25%, Pedagogia 25%, Dificuldade 15%, Relevância 15%
    const score_total = Math.round(
      score_refero * 0.20 +
      score_docs * 0.25 +
      score_pedagogy * 0.25 +
      score_difficulty * 0.15 +
      score_relevance * 0.15
    );
    const score_semaphore = score_total >= 70 ? 'green' : score_total >= 40 ? 'yellow' : 'red';

    // 7. Update pipeline with scores + Refero metadata
    const updatePayload: Record<string, unknown> = {
      score_refero,
      score_docs,
      score_pedagogy,
      score_difficulty,
      score_relevance,
      score_total,
      score_semaphore,
    };

    const { error: updateError } = await (supabase as any)
      .from('v10_bpa_pipeline')
      .update(updatePayload)
      .eq('id', pipeline_id);

    if (updateError) {
      console.error('Error updating pipeline:', updateError);
      throw new Error(`Failed to update pipeline: ${updateError.message}`);
    }

    // 8. Log to pipeline log with Refero data
    const { error: logError } = await (supabase as any)
      .from('v10_bpa_pipeline_log')
      .insert({
        pipeline_id,
        stage: 1,
        action: 'score-bpa',
        details: {
          ...updatePayload,
          refero_screens: referoScreenCount,
          refero_flows: referoFlowCount,
          justificativa: scores.justificativa,
        },
      });

    if (logError) {
      console.error('Error logging to pipeline log:', logError);
    }

    console.log('Scores calculated for pipeline:', pipeline_id, updatePayload);

    // 9. Return the updated scores
    return new Response(
      JSON.stringify({
        ...updatePayload,
        refero_screens: referoScreenCount,
        refero_flows: referoFlowCount,
        justificativa: scores.justificativa,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('v10-score-bpa error:', error);
    return new Response(
      JSON.stringify({ error: error?.message ?? String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
