import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, prompt } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // System prompt para instruir a IA a executar o prompt como tarefa
    const systemPrompt = `Você é um assistente prestativo. O usuário vai enviar um prompt/instrução e você deve EXECUTAR essa instrução diretamente.
NÃO peça mais informações. NÃO faça perguntas de volta.
Se o prompt pede para criar algo, CRIE.
Se o prompt pede para listar algo, LISTE.
Se o prompt pede para analisar algo, ANALISE.
Responda em português brasileiro de forma útil e direta.`;

    // Call Lovable AI Gateway for main response
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices[0]?.message?.content || '';

    // Get detailed feedback on the prompt
    const feedbackSystemPrompt = `Você é um coach de prompts. Analise o prompt do usuário e dê feedback ESPECÍFICO e ACIONÁVEL.

ESTRUTURA DO FEEDBACK (máximo 3 frases):
1. Um ponto POSITIVO específico (o que está bom)
2. Uma SUGESTÃO CONCRETA de melhoria (ex: "Adicione X para obter Y")
3. Opcional: Exemplo rápido de como melhorar

CRITÉRIOS DE AVALIAÇÃO:
- Clareza: O objetivo está claro?
- Contexto: Há informações suficientes?
- Especificidade: É específico ou vago?
- Formato: Indica o formato desejado da resposta?

Responda em português brasileiro, tom encorajador mas direto.`;

    const feedbackResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: feedbackSystemPrompt },
          { role: 'user', content: `Analise este prompt:\n\n"${prompt}"` }
        ],
        max_tokens: 300,
      }),
    });

    const feedbackData = await feedbackResponse.json();
    const feedbackText = feedbackData.choices[0]?.message?.content || 'Feedback não disponível';

    // Save session to database
    const { error: insertError } = await supabaseClient
      .from('user_playground_sessions')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        user_prompt: prompt,
        ai_response: responseText,
        ai_feedback: feedbackText,
        tokens_used: (aiData.usage?.total_tokens || 0) + (feedbackData.usage?.total_tokens || 0),
      });

    if (insertError) {
      console.error('Failed to save session:', insertError);
    }

    return new Response(JSON.stringify({
      aiResponse: responseText,
      aiFeedback: feedbackText,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in lesson-playground:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
