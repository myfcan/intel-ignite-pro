import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body - user_id now comes from authenticated user
    const { lesson_id, message, context_type } = await req.json();

    if (!message) {
      throw new Error('Missing required field: message');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use service role key for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user plan to determine daily limit
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('plan, daily_interaction_limit')
      .eq('id', user.id)
      .single();

    if (userDataError) throw userDataError;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dailyLimit = userData.daily_interaction_limit ?? 5;

    // Upsert today's row in v10_user_daily_usage (creates new row per day automatically)
    const { data: usageRow, error: usageError } = await supabase
      .from('v10_user_daily_usage')
      .upsert(
        { user_id: user.id, usage_date: today, interactions_limit: dailyLimit },
        { onConflict: 'user_id,usage_date', ignoreDuplicates: true }
      )
      .select('interactions_used, interactions_limit')
      .single();

    // If upsert with ignoreDuplicates returned nothing, fetch the existing row
    let interactionsUsed = usageRow?.interactions_used ?? 0;
    let interactionsLimit = usageRow?.interactions_limit ?? dailyLimit;

    if (!usageRow) {
      const { data: existingRow, error: fetchError } = await supabase
        .from('v10_user_daily_usage')
        .select('interactions_used, interactions_limit')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .single();

      if (fetchError) throw fetchError;
      interactionsUsed = existingRow.interactions_used;
      interactionsLimit = existingRow.interactions_limit;
    }

    // Check if limit reached
    if (interactionsUsed >= interactionsLimit) {
      return new Response(
        JSON.stringify({
          error: 'Limite diário atingido',
          limit_reached: true,
          limit: interactionsLimit,
          used: interactionsUsed
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate cache key
    const cacheKey = `${lesson_id || 'general'}_${context_type}_${message.substring(0, 50)}`;
    const crypto = await import('https://deno.land/std@0.177.0/crypto/mod.ts');
    const encoder = new TextEncoder();
    const data = encoder.encode(cacheKey);
    const hashBuffer = await crypto.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const promptHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first
    const { data: cachedResponse } = await supabase
      .from('claude_cache')
      .select('response_text, id, hit_count')
      .eq('prompt_hash', promptHash)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (cachedResponse) {
      // Update cache hit count
      await supabase
        .from('claude_cache')
        .update({ 
          hit_count: cachedResponse.hit_count + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', cachedResponse.id);

      return new Response(
        JSON.stringify({
          response: cachedResponse.response_text,
          cached: true,
          limit_reached: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI Gateway
    const systemPrompt = context_type === 'playground' 
      ? `REGRAS ABSOLUTAS:
1. EXECUTE a instrução do usuário IMEDIATAMENTE - o prompt já está completo
2. NUNCA peça mais informações
3. NUNCA faça perguntas de volta
4. Responda DIRETAMENTE com o conteúdo solicitado

Você é um assistente de IA especializado em ajudar pessoas. Seja claro, didático e use exemplos práticos.

Se o prompt pede para analisar, ANALISE.
Se pede para listar, LISTE.
Se pede para criar, CRIE.

Ao final da resposta, adicione: "💡 Sugestão:" com UMA sugestão curta de como expandir ou adaptar o resultado.`
      : 'Você é um tutor de IA paciente e didático. Explique conceitos de forma simples e use analogias do dia a dia.';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições atingido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;

    // Store in cache
    await supabase
      .from('claude_cache')
      .insert({
        cache_key: cacheKey,
        prompt_hash: promptHash,
        response_text: aiResponse
      });

    // Increment interaction count in v10_user_daily_usage
    const newUsed = interactionsUsed + 1;
    await supabase
      .from('v10_user_daily_usage')
      .update({ interactions_used: newUsed })
      .eq('user_id', user.id)
      .eq('usage_date', today);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        cached: false,
        limit_reached: false,
        remaining: interactionsLimit - newUsed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in claude-interact:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});