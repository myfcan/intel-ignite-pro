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

    // Check user's daily limit
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('plan, daily_interaction_limit, interactions_used_today, last_interaction_reset')
      .eq('id', user.id)
      .single();

    if (userDataError) throw userDataError;

    // Reset daily counter if needed
    const lastReset = new Date(userData.last_interaction_reset);
    const now = new Date();
    const shouldReset = lastReset.getDate() !== now.getDate() || 
                       lastReset.getMonth() !== now.getMonth() || 
                       lastReset.getFullYear() !== now.getFullYear();

    if (shouldReset) {
      await supabase
        .from('users')
        .update({ 
          interactions_used_today: 0,
          last_interaction_reset: now.toISOString()
        })
        .eq('id', user.id);
      userData.interactions_used_today = 0;
    }

    // Check if limit reached
    if (userData.interactions_used_today >= userData.daily_interaction_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Limite diário atingido',
          limit_reached: true,
          limit: userData.daily_interaction_limit,
          used: userData.interactions_used_today
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
      ? 'Você é um assistente de IA especializado em ensinar pessoas com 38+ anos sobre inteligência artificial. Seja claro, didático e use exemplos práticos.'
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

    // Increment user's interaction count
    await supabase
      .from('users')
      .update({ 
        interactions_used_today: userData.interactions_used_today + 1
      })
      .eq('id', user.id);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        cached: false,
        limit_reached: false,
        remaining: userData.daily_interaction_limit - userData.interactions_used_today - 1
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