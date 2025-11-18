import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  reward_type: string;
  reward_value: number;
}

interface DailyMission {
  id: string;
  user_id: string;
  mission_id: string;
  date: string;
  progress_value: number;
  completed: boolean;
  reward_claimed: boolean;
  missions_daily_templates: MissionTemplate;
}

interface UserStreak {
  current_streak: number;
  best_streak: number;
  last_active_date: string;
}

export function useDailyMissions() {
  const { toast } = useToast();
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMissions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const today = new Date().toISOString().split('T')[0];

      // Load today's missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('user_daily_missions')
        .select(`
          *,
          missions_daily_templates (*)
        `)
        .eq('user_id', session.user.id)
        .eq('date', today);

      if (missionsError) throw missionsError;

      setMissions(missionsData || []);

      // Load streak
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (streakError) throw streakError;

      setStreak(streakData);

    } catch (error: any) {
      console.error('Error loading missions:', error);
      toast({
        title: 'Erro ao carregar missões',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (missionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_daily_missions')
        .update({ reward_claimed: true })
        .eq('id', missionId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Find the mission to get reward info
      const mission = missions.find(m => m.id === missionId);
      if (mission) {
        toast({
          title: '🎉 Recompensa coletada!',
          description: `+${mission.missions_daily_templates.reward_value} ${mission.missions_daily_templates.reward_type}`,
        });
      }

      // Reload missions
      await loadMissions();

    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Erro ao coletar recompensa',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadMissions();

    // Subscribe to mission updates
    const channel = supabase
      .channel('daily-missions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_daily_missions',
        },
        () => {
          loadMissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    missions,
    streak,
    loading,
    claimReward,
    refetch: loadMissions,
  };
}
