/**
 * usePromptAchievements - Hook para gerenciar achievements de prompts
 * Integrado com o sistema de gamificação existente
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PromptAchievement {
  id: string;
  type: 'first_prompt' | 'gold_prompt' | 'streak_3' | 'master_10';
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  coinsReward: number;
}

const PROMPT_ACHIEVEMENTS: Record<string, PromptAchievement> = {
  first_prompt: {
    id: 'first_prompt',
    type: 'first_prompt',
    name: 'Primeiro Acerto',
    description: 'Seu primeiro prompt com score ≥ 70%',
    emoji: '🎯',
    xpReward: 20,
    coinsReward: 5
  },
  gold_prompt: {
    id: 'gold_prompt',
    type: 'gold_prompt',
    name: 'Prompt de Ouro',
    description: 'Primeiro prompt com score ≥ 90%',
    emoji: '💎',
    xpReward: 50,
    coinsReward: 15
  },
  streak_3: {
    id: 'streak_3',
    type: 'streak_3',
    name: 'Sequência Perfeita',
    description: '3 prompts seguidos com score ≥ 80%',
    emoji: '🔥',
    xpReward: 80,
    coinsReward: 25
  },
  master_10: {
    id: 'master_10',
    type: 'master_10',
    name: 'Mestre dos Prompts',
    description: '10 prompts com score ≥ 85%',
    emoji: '👑',
    xpReward: 150,
    coinsReward: 50
  }
};

interface UsePromptAchievementsReturn {
  checkAndAwardAchievements: (score: number, lessonId?: string) => Promise<PromptAchievement[]>;
  isChecking: boolean;
}

export function usePromptAchievements(): UsePromptAchievementsReturn {
  const [isChecking, setIsChecking] = useState(false);

  const checkAndAwardAchievements = useCallback(async (
    score: number,
    lessonId?: string
  ): Promise<PromptAchievement[]> => {
    setIsChecking(true);
    const earnedAchievements: PromptAchievement[] = [];

    try {
      // Verificar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[usePromptAchievements] User not authenticated');
        return [];
      }

      // Buscar achievements já conquistados pelo usuário
      const { data: existingAchievements, error: fetchError } = await supabase
        .from('user_achievements')
        .select('achievement_type')
        .eq('user_id', user.id)
        .in('achievement_type', ['prompt_first', 'prompt_gold', 'prompt_streak_3', 'prompt_master_10']);

      if (fetchError) {
        console.error('[usePromptAchievements] Error fetching achievements:', fetchError);
        return [];
      }

      const existingTypes = new Set(existingAchievements?.map(a => a.achievement_type) || []);

      // Buscar contagem de prompts do usuário
      const { count: promptCount, error: countError } = await supabase
        .from('user_playground_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('[usePromptAchievements] Error counting prompts:', countError);
      }

      const totalPrompts = promptCount || 0;

      // ✅ Achievement: Primeiro Acerto (score >= 70%)
      if (score >= 70 && !existingTypes.has('prompt_first')) {
        const achievement = PROMPT_ACHIEVEMENTS.first_prompt;
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'prompt_first',
            achievement_name: achievement.name,
            points_earned: achievement.xpReward,
            lesson_id: lessonId || null
          });

        if (!insertError) {
          earnedAchievements.push(achievement);
          console.log('[usePromptAchievements] 🎯 Achievement earned: first_prompt');
        }
      }

      // ✅ Achievement: Prompt de Ouro (score >= 90%)
      if (score >= 90 && !existingTypes.has('prompt_gold')) {
        const achievement = PROMPT_ACHIEVEMENTS.gold_prompt;
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'prompt_gold',
            achievement_name: achievement.name,
            points_earned: achievement.xpReward,
            lesson_id: lessonId || null
          });

        if (!insertError) {
          earnedAchievements.push(achievement);
          console.log('[usePromptAchievements] 💎 Achievement earned: gold_prompt');
        }
      }

      // ✅ Achievement: Mestre dos Prompts (10 prompts com score >= 85%)
      if (score >= 85 && totalPrompts >= 10 && !existingTypes.has('prompt_master_10')) {
        // Verificar se realmente tem 10 prompts bons
        const { count: goodPrompts } = await supabase
          .from('user_playground_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if ((goodPrompts || 0) >= 10) {
          const achievement = PROMPT_ACHIEVEMENTS.master_10;
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_type: 'prompt_master_10',
              achievement_name: achievement.name,
              points_earned: achievement.xpReward,
              lesson_id: lessonId || null
            });

          if (!insertError) {
            earnedAchievements.push(achievement);
            console.log('[usePromptAchievements] 👑 Achievement earned: master_10');
          }
        }
      }

      // Registrar evento de gamificação se ganhou algum achievement
      if (earnedAchievements.length > 0) {
        const totalXp = earnedAchievements.reduce((sum, a) => sum + a.xpReward, 0);
        const totalCoins = earnedAchievements.reduce((sum, a) => sum + a.coinsReward, 0);

        // Buscar pontos atuais e atualizar
        const { data: userData } = await supabase
          .from('users')
          .select('total_points, coins, power_score')
          .eq('id', user.id)
          .single();

        if (userData) {
          await supabase
            .from('users')
            .update({
              total_points: (userData.total_points || 0) + totalXp,
              coins: (userData.coins || 0) + totalCoins,
              power_score: (userData.power_score || 0) + totalXp
            })
            .eq('id', user.id);
        }

        console.log(`[usePromptAchievements] 🎉 Awarded ${earnedAchievements.length} achievements! +${totalXp} XP, +${totalCoins} coins`);
      }

      return earnedAchievements;
    } catch (err) {
      console.error('[usePromptAchievements] Error:', err);
      return [];
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkAndAwardAchievements,
    isChecking
  };
}

export { PROMPT_ACHIEVEMENTS };
