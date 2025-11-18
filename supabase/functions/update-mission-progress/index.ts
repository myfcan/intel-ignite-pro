import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateProgressRequest {
  user_id: string;
  action_type: 'aulas' | 'exercicios';
  increment?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, action_type, increment = 1 } = await req.json() as UpdateProgressRequest;

    if (!user_id || !action_type) {
      return new Response(
        JSON.stringify({ error: 'user_id e action_type são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Atualizando progresso: usuário=${user_id}, ação=${action_type}, incremento=${increment}`);

    const today = new Date().toISOString().split('T')[0];

    // 1. Buscar missões do dia do usuário que correspondem ao tipo de ação
    const { data: missions, error: missionsError } = await supabase
      .from('user_daily_missions')
      .select(`
        id,
        progress_value,
        completed,
        mission_id,
        missions_daily_templates (
          requirement_type,
          requirement_value,
          reward_type,
          reward_value
        )
      `)
      .eq('user_id', user_id)
      .eq('date', today)
      .eq('completed', false);

    if (missionsError) {
      console.error('❌ Erro ao buscar missões:', missionsError);
      throw missionsError;
    }

    if (!missions || missions.length === 0) {
      console.log('⚠️ Nenhuma missão ativa encontrada para hoje');
      return new Response(
        JSON.stringify({ message: 'Nenhuma missão ativa' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updatedMissions: any[] = [];
    let anyMissionCompleted = false;

    // 2. Atualizar progresso das missões correspondentes
    for (const mission of missions) {
      const template = Array.isArray(mission.missions_daily_templates) 
        ? mission.missions_daily_templates[0] 
        : mission.missions_daily_templates;
      
      if (!template || template.requirement_type !== action_type) {
        continue;
      }

      const newProgress = mission.progress_value + increment;
      const isCompleted = newProgress >= template.requirement_value;

      console.log(`📈 Missão ${mission.id}: ${mission.progress_value} → ${newProgress}/${template.requirement_value}`);

      const { data: updated, error: updateError } = await supabase
        .from('user_daily_missions')
        .update({
          progress_value: newProgress,
          completed: isCompleted,
        })
        .eq('id', mission.id)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Erro ao atualizar missão ${mission.id}:`, updateError);
      } else {
        updatedMissions.push(updated);
        if (isCompleted) {
          anyMissionCompleted = true;
          console.log(`✅ Missão ${mission.id} completada!`);
        }
      }
    }

    // 3. Se alguma missão foi completada, atualizar streak
    if (anyMissionCompleted) {
      console.log('🔥 Atualizando streak...');

      const { data: streak, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user_id)
        .maybeSingle();

      if (streakError) {
        console.error('❌ Erro ao buscar streak:', streakError);
      } else if (streak) {
        // Verificar se é o primeiro completamento do dia
        const lastActiveDate = streak.last_active_date;
        const isFirstCompletionToday = lastActiveDate !== today;

        if (isFirstCompletionToday) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const isConsecutive = lastActiveDate === yesterday;

          const newCurrentStreak = isConsecutive ? streak.current_streak + 1 : 1;
          const newBestStreak = Math.max(streak.best_streak, newCurrentStreak);

          const { error: updateStreakError } = await supabase
            .from('user_streaks')
            .update({
              current_streak: newCurrentStreak,
              best_streak: newBestStreak,
              last_active_date: today,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user_id);

          if (updateStreakError) {
            console.error('❌ Erro ao atualizar streak:', updateStreakError);
          } else {
            console.log(`🔥 Streak atualizado: ${newCurrentStreak} dias (recorde: ${newBestStreak})`);
          }
        } else {
          console.log('⏭️ Streak já foi atualizado hoje');
        }
      } else {
        // Criar streak se não existir
        const { error: createStreakError } = await supabase
          .from('user_streaks')
          .insert({
            user_id,
            current_streak: 1,
            best_streak: 1,
            last_active_date: today,
          });

        if (createStreakError) {
          console.error('❌ Erro ao criar streak:', createStreakError);
        } else {
          console.log('✨ Novo streak iniciado!');
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        missions_updated: updatedMissions.length,
        missions_completed: updatedMissions.filter(m => m.completed).length,
        streak_updated: anyMissionCompleted,
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
