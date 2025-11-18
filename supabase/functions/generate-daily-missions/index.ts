import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Iniciando geração de missões diárias...');

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 1. Buscar todos os templates de missões
    const { data: templates, error: templatesError } = await supabase
      .from('missions_daily_templates')
      .select('*');

    if (templatesError) {
      console.error('❌ Erro ao buscar templates:', templatesError);
      throw templatesError;
    }

    if (!templates || templates.length === 0) {
      console.log('⚠️ Nenhum template de missão encontrado');
      return new Response(
        JSON.stringify({ message: 'Nenhum template de missão encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 ${templates.length} templates encontrados`);

    // 2. Buscar todos os usuários
    const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      throw usersError;
    }

    const users = authUsers.users;
    console.log(`👥 ${users.length} usuários encontrados`);

    let missionsCreated = 0;
    let streaksUpdated = 0;

    // 3. Para cada usuário, gerar missões e atualizar streak
    for (const user of users) {
      const userId = user.id;

      // 3.1 Verificar se já existem missões de hoje
      const { data: existingMissions } = await supabase
        .from('user_daily_missions')
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .limit(1);

      if (existingMissions && existingMissions.length > 0) {
        console.log(`⏭️ Usuário ${userId} já tem missões de hoje`);
      } else {
        // 3.2 Criar missões do dia para este usuário
        const missionsToCreate = templates.map(template => ({
          user_id: userId,
          mission_id: template.id,
          date: today,
          progress_value: 0,
          completed: false,
          reward_claimed: false,
        }));

        const { error: insertError } = await supabase
          .from('user_daily_missions')
          .insert(missionsToCreate);

        if (insertError) {
          console.error(`❌ Erro ao criar missões para ${userId}:`, insertError);
        } else {
          missionsCreated += missionsToCreate.length;
          console.log(`✅ ${missionsToCreate.length} missões criadas para ${userId}`);
        }
      }

      // 3.3 Atualizar streak do usuário
      // Verificar se completou pelo menos 1 missão ontem
      const { data: yesterdayMissions } = await supabase
        .from('user_daily_missions')
        .select('completed')
        .eq('user_id', userId)
        .eq('date', yesterday);

      const completedYesterday = yesterdayMissions?.some(m => m.completed) || false;

      // Buscar ou criar registro de streak
      const { data: existingStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingStreak) {
        // Atualizar streak existente
        let newCurrentStreak = existingStreak.current_streak;
        
        if (completedYesterday) {
          newCurrentStreak += 1;
        } else {
          // Verificar se ontem não teve missões (novo usuário)
          if (yesterdayMissions && yesterdayMissions.length > 0) {
            newCurrentStreak = 0;
          }
        }

        const newBestStreak = Math.max(existingStreak.best_streak, newCurrentStreak);

        const { error: updateError } = await supabase
          .from('user_streaks')
          .update({
            current_streak: newCurrentStreak,
            best_streak: newBestStreak,
            last_active_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error(`❌ Erro ao atualizar streak de ${userId}:`, updateError);
        } else {
          streaksUpdated++;
          console.log(`🔥 Streak atualizado para ${userId}: ${newCurrentStreak} dias`);
        }
      } else {
        // Criar novo registro de streak
        const { error: createError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: userId,
            current_streak: 0,
            best_streak: 0,
            last_active_date: today,
          });

        if (createError) {
          console.error(`❌ Erro ao criar streak para ${userId}:`, createError);
        } else {
          streaksUpdated++;
          console.log(`✨ Streak criado para ${userId}`);
        }
      }
    }

    const result = {
      success: true,
      date: today,
      users_processed: users.length,
      missions_created: missionsCreated,
      streaks_updated: streaksUpdated,
    };

    console.log('✅ Geração concluída:', result);

    return new Response(
      JSON.stringify(result),
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
