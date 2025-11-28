import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnlockRequest {
  promptId: string;
  categoryId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { promptId, categoryId } = await req.json() as UnlockRequest;

    if (!promptId || !categoryId) {
      return new Response(
        JSON.stringify({ error: 'promptId e categoryId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se já possui o prompt desbloqueado
    const { data: existingUnlock } = await supabaseClient
      .from('user_unlocked_prompts')
      .select('id')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .single();

    if (existingUnlock) {
      return new Response(
        JSON.stringify({ error: 'Prompt já desbloqueado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar coins do usuário
    const { data: userData, error: fetchError } = await supabaseClient
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single();

    if (fetchError || !userData) {
      console.error('[unlock-premium-prompt] Erro ao buscar usuário:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar dados do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentCoins = userData.coins || 0;
    const requiredCoins = 1000;

    if (currentCoins < requiredCoins) {
      return new Response(
        JSON.stringify({ 
          error: 'Créditos insuficientes',
          required: requiredCoins,
          current: currentCoins
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduzir créditos
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ coins: currentCoins - requiredCoins })
      .eq('id', user.id);

    if (updateError) {
      console.error('[unlock-premium-prompt] Erro ao deduzir créditos:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar pagamento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Desbloquear prompt
    const { data: unlockedPrompt, error: unlockError } = await supabaseClient
      .from('user_unlocked_prompts')
      .insert({
        user_id: user.id,
        prompt_id: promptId,
        category_id: categoryId,
        credits_spent: requiredCoins
      })
      .select()
      .single();

    if (unlockError) {
      // Reverter dedução de créditos em caso de erro
      await supabaseClient
        .from('users')
        .update({ coins: currentCoins })
        .eq('id', user.id);

      console.error('[unlock-premium-prompt] Erro ao desbloquear:', unlockError);
      return new Response(
        JSON.stringify({ error: 'Erro ao desbloquear prompt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[unlock-premium-prompt] Prompt ${promptId} desbloqueado para usuário ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        unlockedPrompt,
        remainingCoins: currentCoins - requiredCoins
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[unlock-premium-prompt] Erro:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
