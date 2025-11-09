import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { awardPoints, updateStreak, POINTS } from '@/lib/gamification';

interface GamificationData {
  points: number;
  level: number;
  streak: number;
  achievements: number;
  loading: boolean;
}

export function useGamification() {
  const [data, setData] = useState<GamificationData>({
    points: 0,
    level: 1,
    streak: 0,
    achievements: 0,
    loading: true,
  });

  const [notification, setNotification] = useState<{
    show: boolean;
    points: number;
    reason: string;
  }>({
    show: false,
    points: 0,
    reason: '',
  });

  // Load user data
  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user points and streak
      const { data: userData } = await supabase
        .from('users')
        .select('total_points, streak_days')
        .eq('id', user.id)
        .single();

      // Get achievements count
      const { count: achievementsCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (userData) {
        const points = userData.total_points || 0;
        const level = Math.floor(points / 1000) + 1;

        setData({
          points,
          level,
          streak: userData.streak_days || 0,
          achievements: achievementsCount || 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const showNotification = (points: number, reason: string) => {
    setNotification({ show: true, points, reason });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const awardPointsWithNotification = async (points: number, reason: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const success = await awardPoints(user.id, points, reason);
    if (success) {
      showNotification(points, reason);
      await loadGamificationData();
    }
  };

  const updateStreakWithNotification = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newStreak = await updateStreak(user.id);
    await loadGamificationData();
    return newStreak;
  };

  return {
    ...data,
    notification,
    showNotification,
    hideNotification,
    awardPoints: awardPointsWithNotification,
    updateStreak: updateStreakWithNotification,
    refresh: loadGamificationData,
  };
}
