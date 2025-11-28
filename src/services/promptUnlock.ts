import { supabase } from '@/integrations/supabase/client';

export interface UnlockedPrompt {
  id: string;
  user_id: string;
  prompt_id: string;
  category_id: string;
  credits_spent: number;
  unlocked_at: string;
}

export async function getUnlockedPrompts(): Promise<UnlockedPrompt[]> {
  const { data, error } = await supabase
    .from('user_unlocked_prompts')
    .select('*')
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('[promptUnlock] Erro ao buscar prompts desbloqueados:', error);
    return [];
  }

  return data || [];
}

export async function isPromptUnlocked(promptId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_unlocked_prompts')
    .select('id')
    .eq('prompt_id', promptId)
    .single();

  return !!data;
}

export async function unlockPromptWithCredits(
  promptId: string,
  categoryId: string
): Promise<{ success: boolean; error?: string; remainingCoins?: number }> {
  try {
    const { data, error } = await supabase.functions.invoke('unlock-premium-prompt', {
      body: { promptId, categoryId }
    });

    if (error) throw error;

    if (data.error) {
      return { success: false, error: data.error };
    }

    return {
      success: true,
      remainingCoins: data.remainingCoins
    };
  } catch (error: any) {
    console.error('[promptUnlock] Erro ao desbloquear prompt:', error);
    return { success: false, error: error.message || 'Erro ao desbloquear prompt' };
  }
}
