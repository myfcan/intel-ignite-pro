import { supabase } from "@/integrations/supabase/client";

/**
 * Atualiza o progresso de missões diárias do usuário
 * @param actionType - Tipo de ação: 'aulas' ou 'exercicios'
 * @param increment - Quantidade a incrementar (padrão: 1)
 */
export async function updateMissionProgress(
  actionType: 'aulas' | 'exercicios',
  increment: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ [MISSIONS] Usuário não autenticado');
      return { success: false, error: 'User not authenticated' };
    }

    console.log(`📊 [MISSIONS] Atualizando progresso: ${actionType} +${increment}`);

    const { data, error } = await supabase.functions.invoke('update-mission-progress', {
      body: {
        user_id: user.id,
        action_type: actionType,
        increment,
      },
    });

    if (error) {
      console.error('❌ [MISSIONS] Erro ao atualizar:', error);
      return { success: false, error: error.message };
    }

    if (data?.missions_completed > 0) {
      console.log(`✅ [MISSIONS] ${data.missions_completed} missão(ões) completada(s)!`);
    }

    if (data?.streak_updated) {
      console.log('🔥 [MISSIONS] Streak atualizado!');
    }

    return { success: true };
  } catch (error: any) {
    console.error('❌ [MISSIONS] Erro geral:', error);
    return { success: false, error: error.message };
  }
}
