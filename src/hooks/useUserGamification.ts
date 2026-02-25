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
  const [sessionReady, setSessionReady] = useState(false);

  const fetchStats = useCallback(async (userId?: string) => {
    setIsLoading(true);
    
    try {
      // Se userId foi passado diretamente, usar ele
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id;
      }
      
      if (!targetUserId) {
        console.log('[useUserGamification] No user ID available');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('power_score, coins, patent_level, streak_days, total_lessons_completed')
        .eq('id', targetUserId)
        .single();

      if (error) {
        console.error('[useUserGamification] Query error:', error);
        // Setar stats zerados em vez de null para evitar loading infinito
        setStats({
          powerScore: 0,
          coins: 0,
          patentLevel: 0,
          patentName: PATENT_NAMES[0],
          streakDays: 0,
          lessonsCompleted: 0,
        });
        setIsLoading(false);
        return;
      }

      if (data) {
        const newStats = {
          powerScore: data.power_score || 0,
          coins: data.coins || 0,
          patentLevel: data.patent_level || 0,
          patentName: PATENT_NAMES[data.patent_level || 0],
          streakDays: data.streak_days || 0,
          lessonsCompleted: data.total_lessons_completed || 0,
        };

        console.log('[useUserGamification] Stats loaded:', newStats);
        setStats(newStats);
        
        // Detectar subida de patente
        setPrevPatentLevel(prev => {
          if (prev !== null && data.patent_level > prev) {
            setShowPatentCelebration(true);
            setTimeout(() => setShowPatentCelebration(false), 3500);
          }
          return data.patent_level || 0;
        });
      }
    } catch (err) {
      console.error('[useUserGamification] Error:', err);
      // Setar stats zerados para não travar em loading
      setStats({
        powerScore: 0,
        coins: 0,
        patentLevel: 0,
        patentName: PATENT_NAMES[0],
        streakDays: 0,
        lessonsCompleted: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let initAttempts = 0;
    const maxAttempts = 3;

    // Função para inicializar com sessão (com retry para auto-login)
    const initWithSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (isMounted && session?.user) {
        console.log('[useUserGamification] Session found, fetching stats for:', session.user.id);
        setSessionReady(true);
        await fetchStats(session.user.id);
      } else if (isMounted) {
        initAttempts++;
        // Retry até 3 vezes com delay para capturar auto-login
        if (initAttempts < maxAttempts) {
          console.log(`[useUserGamification] No session yet, retry ${initAttempts}/${maxAttempts}`);
          setTimeout(() => {
            if (isMounted) initWithSession();
          }, 300);
        } else {
          console.log('[useUserGamification] No session after retries, setting loading false');
          setIsLoading(false);
        }
      }
    };

    // Escutar mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useUserGamification] Auth event:', event, session?.user?.id);
      
      if (!isMounted) return;
      
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        setSessionReady(true);
        // Buscar imediatamente quando sessão é detectada
        await fetchStats(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setStats(null);
        setSessionReady(false);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Refresh silencioso quando token é atualizado
        fetchStats(session.user.id);
      }
    });

    // Inicializar
    initWithSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchStats]);

  return { 
    stats, 
    isLoading, 
    refresh: fetchStats,
    showPatentCelebration,
    sessionReady
  };
}
