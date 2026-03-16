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

    // 2. Extract context from pipeline
    const { title, slug, docs_manual_input } = pipeline;

    // 3. Call Lovable AI Gateway
    const systemPrompt = `Você é um especialista em design instrucional para aulas de tecnologia. Analise o tema proposto e retorne um JSON com 5 scores (0-20 cada): score_refero (disponibilidade de screenshots/referências visuais), score_docs (qualidade da documentação oficial), score_pedagogy (valor pedagógico e aplicabilidade), score_difficulty (invertido: mais fácil = mais pontos), score_relevance (relevância no mercado atual). Retorne APENAS o JSON, sem markdown.`;

    const userMessage = `Tema: ${title}\nSlug: ${slug}\nNotas: ${docs_manual_input || 'nenhuma'}`;

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

    // 6. Parse the AI response JSON
    const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const scores = JSON.parse(cleaned);

    const {
      score_refero,
      score_docs,
      score_pedagogy,
      score_difficulty,
      score_relevance,
    } = scores;

    // 7. Calculate total and semaphore
    const score_total = score_refero + score_docs + score_pedagogy + score_difficulty + score_relevance;
    const score_semaphore = score_total >= 70 ? 'green' : score_total >= 40 ? 'yellow' : 'red';

    // 8. Update pipeline with scores
    const updatePayload = {
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

    // 9. Log to pipeline log
    const { error: logError } = await (supabase as any)
      .from('v10_bpa_pipeline_log')
      .insert({
        pipeline_id,
        stage: 1,
        action: 'score-bpa',
        details: updatePayload,
      });

    if (logError) {
      console.error('Error logging to pipeline log:', logError);
      // Non-fatal: don't throw, just log
    }

    console.log('Scores calculated for pipeline:', pipeline_id, updatePayload);

    // 10. Return the updated scores
    return new Response(
      JSON.stringify(updatePayload),
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
