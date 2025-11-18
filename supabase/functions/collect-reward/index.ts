import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollectRewardRequest {
  reward_id: string;
}

Deno.serve(async (req) => {
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
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

    const { reward_id } = await req.json() as CollectRewardRequest;

    if (!reward_id) {
      return new Response(
        JSON.stringify({ error: 'reward_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎁 Coletando recompensa ${reward_id} para usuário ${user.id}`);

    // Use service role for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar a recompensa e validar
    const { data: reward, error: rewardError } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('user_id', user.id)
      .single();

    if (rewardError || !reward) {
      console.error('❌ Recompensa não encontrada:', rewardError);
      return new Response(
        JSON.stringify({ error: 'Recompensa não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (reward.collected) {
      return new Response(
        JSON.stringify({ error: 'Recompensa já coletada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Marcar recompensa como coletada
    const { error: updateError } = await supabase
      .from('user_rewards')
      .update({
        collected: true,
        collected_at: new Date().toISOString(),
      })
      .eq('id', reward_id);

    if (updateError) {
      console.error('❌ Erro ao atualizar recompensa:', updateError);
      throw updateError;
    }

    console.log(`✅ Recompensa marcada como coletada`);

    // 3. Creditar pontos/XP baseado no reward_type
    let pointsAdded = 0;
    
    if (reward.reward_type === 'points' || reward.reward_type === 'xp') {
      pointsAdded = reward.reward_value;

      // Adicionar ao histórico de pontos
      const { error: pointsHistoryError } = await supabase
        .from('points_history')
        .insert({
          user_id: user.id,
          points: pointsAdded,
          reason: `Recompensa de missão diária coletada`,
        });

      if (pointsHistoryError) {
        console.error('⚠️ Erro ao adicionar ao histórico:', pointsHistoryError);
      } else {
        console.log(`💰 +${pointsAdded} pontos adicionados ao histórico`);
      }

      // Atualizar total de pontos do usuário
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('total_points')
        .eq('id', user.id)
        .single();

      if (userDataError) {
        console.error('⚠️ Erro ao buscar dados do usuário:', userDataError);
      } else {
        const newTotal = (userData.total_points || 0) + pointsAdded;
        
        const { error: updateUserError } = await supabase
          .from('users')
          .update({ total_points: newTotal })
          .eq('id', user.id);

        if (updateUserError) {
          console.error('⚠️ Erro ao atualizar total_points:', updateUserError);
        } else {
          console.log(`🎯 Total de pontos atualizado: ${newTotal}`);
        }
      }
    }

    // 4. Marcar a missão como reward_claimed
    const { error: missionUpdateError } = await supabase
      .from('user_daily_missions')
      .update({ reward_claimed: true })
      .eq('id', reward.mission_id);

    if (missionUpdateError) {
      console.error('⚠️ Erro ao atualizar missão:', missionUpdateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reward_type: reward.reward_type,
        reward_value: reward.reward_value,
        points_added: pointsAdded,
        message: `Você ganhou ${reward.reward_value} ${reward.reward_type}!`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
