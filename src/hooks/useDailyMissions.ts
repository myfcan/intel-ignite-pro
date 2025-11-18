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

interface UserReward {
  id: string;
  user_id: string;
  mission_id: string;
  reward_type: string;
  reward_value: number;
  collected: boolean;
  collected_at: string | null;
  created_at: string;
}

interface UserStreak {
  current_streak: number;
  best_streak: number;
  last_active_date: string;
}

export function useDailyMissions() {
  const { toast } = useToast();
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

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

      // Load rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (rewardsError) throw rewardsError;

      setRewards(rewardsData || []);

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
    setClaiming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Find the reward for this mission
      const reward = rewards.find(r => r.mission_id === missionId && !r.collected);
      
      if (!reward) {
        toast({
          title: 'Erro',
          description: 'Recompensa não encontrada',
          variant: 'destructive',
        });
        return;
      }

      // Call edge function to collect reward
      const { data, error } = await supabase.functions.invoke('collect-reward', {
        body: { reward_id: reward.id },
      });

      if (error) throw error;

      // Show success message
      toast({
        title: '🎉 Recompensa coletada!',
        description: data.message,
      });

      // Reload missions and rewards
      await loadMissions();

    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Erro ao coletar recompensa',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    loadMissions();

    // Subscribe to updates
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_rewards',
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
    rewards,
    streak,
    loading,
    claiming,
    claimReward,
    refetch: loadMissions,
  };
}
