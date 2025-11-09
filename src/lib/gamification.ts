import { supabase } from '@/integrations/supabase/client';

export interface PointsConfig {
  LESSON_COMPLETE: number;
  EXERCISE_CORRECT: number;
  PERFECT_SCORE: number;
  FAST_COMPLETION: number;
  STREAK_BONUS_MULTIPLIER: number;
  FIRST_LESSON: number;
  TRAIL_COMPLETE: number;
}

export const POINTS: PointsConfig = {
  LESSON_COMPLETE: 100,
  EXERCISE_CORRECT: 10,
  PERFECT_SCORE: 50,
  FAST_COMPLETION: 30,
  STREAK_BONUS_MULTIPLIER: 1.5,
  FIRST_LESSON: 50,
  TRAIL_COMPLETE: 500,
};

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'lessons' | 'exercises' | 'streak' | 'speed' | 'perfect' | 'special';
  requirement: number;
  points: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Lessons achievements
  { id: '1_lesson', name: 'Primeiro Passo', description: 'Complete sua primeira aula', icon: '🎯', type: 'lessons', requirement: 1, points: 50 },
  { id: '5_lessons', name: 'Estudante Dedicado', description: 'Complete 5 aulas', icon: '📚', type: 'lessons', requirement: 5, points: 100 },
  { id: '10_lessons', name: 'Aprendiz Ávido', description: 'Complete 10 aulas', icon: '🎓', type: 'lessons', requirement: 10, points: 200 },
  { id: '25_lessons', name: 'Mestre em Treinamento', description: 'Complete 25 aulas', icon: '🏆', type: 'lessons', requirement: 25, points: 500 },
  { id: '50_lessons', name: 'Grande Mestre', description: 'Complete 50 aulas', icon: '👑', type: 'lessons', requirement: 50, points: 1000 },
  
  // Streak achievements
  { id: 'streak_7', name: 'Semana Consistente', description: 'Mantenha 7 dias de sequência', icon: '🔥', type: 'streak', requirement: 7, points: 100 },
  { id: 'streak_30', name: 'Mês Dedicado', description: 'Mantenha 30 dias de sequência', icon: '🌟', type: 'streak', requirement: 30, points: 500 },
  { id: 'streak_100', name: 'Sequência Lendária', description: 'Mantenha 100 dias de sequência', icon: '⚡', type: 'streak', requirement: 100, points: 2000 },
  
  // Perfect score achievements
  { id: 'perfect_5', name: 'Perfeccionista', description: 'Acerte 100% em 5 aulas', icon: '💯', type: 'perfect', requirement: 5, points: 150 },
  { id: 'perfect_20', name: 'Mestre da Precisão', description: 'Acerte 100% em 20 aulas', icon: '🎯', type: 'perfect', requirement: 20, points: 600 },
  
  // Speed achievements
  { id: 'speed_5', name: 'Rápido como o Vento', description: 'Complete 5 aulas em menos de 15 minutos', icon: '⚡', type: 'speed', requirement: 5, points: 200 },
  { id: 'speed_20', name: 'Velocista', description: 'Complete 20 aulas em menos de 15 minutos', icon: '🚀', type: 'speed', requirement: 20, points: 800 },
];

export async function awardPoints(
  userId: string,
  points: number,
  reason: string
): Promise<boolean> {
  try {
    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('total_points, streak_days')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const currentPoints = userData?.total_points || 0;
    const streakDays = userData?.streak_days || 0;

    // Apply streak bonus if applicable
    let finalPoints = points;
    if (streakDays >= 7) {
      finalPoints = Math.round(points * POINTS.STREAK_BONUS_MULTIPLIER);
    }

    // Update user points
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        total_points: currentPoints + finalPoints,
        level: calculateLevel(currentPoints + finalPoints)
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Register in points history
    await supabase
      .from('points_history')
      .insert({
        user_id: userId,
        points: finalPoints,
        reason: reason
      });

    console.log(`✅ [POINTS] +${finalPoints} pts para ${userId} (${reason})`);
    return true;
  } catch (error) {
    console.error('❌ [POINTS] Erro ao atribuir pontos:', error);
    return false;
  }
}

export async function checkAndAwardAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  try {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return false;

    // Check if already achieved
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_name', achievementId)
      .single();

    if (existing) {
      console.log(`ℹ️ [ACHIEVEMENT] ${achievementId} já conquistado anteriormente`);
      return false;
    }

    // Award achievement
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_type: achievement.type,
        achievement_name: achievementId,
        points_earned: achievement.points,
      });

    if (error) throw error;

    // Award points
    await awardPoints(userId, achievement.points, `Conquista: ${achievement.name}`);

    console.log(`🏆 [ACHIEVEMENT] ${achievement.name} conquistado!`);
    return true;
  } catch (error) {
    console.error('❌ [ACHIEVEMENT] Erro:', error);
    return false;
  }
}

export async function updateStreak(userId: string): Promise<number> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('last_activity_date, streak_days')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = userData?.last_activity_date;
    const currentStreak = userData?.streak_days || 0;

    let newStreak = currentStreak;

    if (!lastActivity || lastActivity !== today) {
      // Check if it's consecutive
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        // Consecutive day
        newStreak = currentStreak + 1;
      } else if (lastActivity !== today) {
        // Broke streak
        newStreak = 1;
      }

      // Update
      await supabase
        .from('users')
        .update({
          last_activity_date: today,
          streak_days: newStreak,
        })
        .eq('id', userId);

      console.log(`🔥 [STREAK] Atualizado para ${newStreak} dias`);

      // Check for streak achievements
      if (newStreak === 7) await checkAndAwardAchievement(userId, 'streak_7');
      if (newStreak === 30) await checkAndAwardAchievement(userId, 'streak_30');
      if (newStreak === 100) await checkAndAwardAchievement(userId, 'streak_100');
    }

    return newStreak;
  } catch (error) {
    console.error('❌ [STREAK] Erro:', error);
    return 0;
  }
}

export function calculateLevel(points: number): number {
  return Math.floor(points / 1000) + 1;
}

export function getPointsToNextLevel(points: number): number {
  return 1000 - (points % 1000);
}
