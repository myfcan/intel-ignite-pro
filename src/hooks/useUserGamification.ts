import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RewardCelebration } from '@/components/gamification/RewardCelebration';

export type UserGamificationStats = {
  powerScore: number;
  coins: number;
  patentLevel: number;
  patentName: string;
  streakDays: number;
  lessonsCompleted: number;
};

const PATENT_NAMES: Record<number, string> = {
  0: 'Sem patente',
  1: 'Operador Básico de I.A.',
  2: 'Executor de Sistemas',
  3: 'Estrategista em I.A.',
};

export function useUserGamification() {
  const [stats, setStats] = useState<UserGamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prevPatentLevel, setPrevPatentLevel] = useState<number | null>(null);
  const [showPatentCelebration, setShowPatentCelebration] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('power_score, coins, patent_level, streak_days, total_lessons_completed')
        .eq('id', user.id)
        .single();

      if (data) {
        const newStats = {
          powerScore: data.power_score || 0,
          coins: data.coins || 0,
          patentLevel: data.patent_level || 0,
          patentName: PATENT_NAMES[data.patent_level || 0],
          streakDays: data.streak_days || 0,
          lessonsCompleted: data.total_lessons_completed || 0,
        };

        // Detectar subida de patente
        if (prevPatentLevel !== null && data.patent_level > prevPatentLevel) {
          setShowPatentCelebration(true);
          setTimeout(() => setShowPatentCelebration(false), 3500);
        }
        
        setPrevPatentLevel(data.patent_level || 0);
        setStats(newStats);
      }
    } catch (err) {
      console.error('[useUserGamification] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [prevPatentLevel]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { 
    stats, 
    isLoading, 
    refresh: fetchStats,
    showPatentCelebration
  };
}
