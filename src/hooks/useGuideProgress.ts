import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GuideProgress {
  guide_id: string;
  started_at: string;
  completed_at: string | null;
}

export const useGuideProgress = (userId?: string) => {
  const [progress, setProgress] = useState<GuideProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_guide_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Erro ao buscar progresso dos guias:', error);
    } finally {
      setLoading(false);
    }
  };

  const markGuideAsStarted = async (guideId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_guide_progress')
        .upsert({
          user_id: userId,
          guide_id: guideId,
          started_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,guide_id',
          ignoreDuplicates: true
        });

      if (error) throw error;
      await fetchProgress();
    } catch (error) {
      console.error('Erro ao marcar guia como iniciado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar seu progresso.',
        variant: 'destructive',
      });
    }
  };

  const markGuideAsCompleted = async (guideId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_guide_progress')
        .upsert({
          user_id: userId,
          guide_id: guideId,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,guide_id'
        });

      if (error) throw error;
      
      await fetchProgress();
      
      toast({
        title: '🎉 Parabéns!',
        description: 'Você completou este guia!',
      });
    } catch (error) {
      console.error('Erro ao marcar guia como completo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar o guia como completo.',
        variant: 'destructive',
      });
    }
  };

  const isGuideCompleted = (guideId: string) => {
    return progress.some(p => p.guide_id === guideId && p.completed_at !== null);
  };

  const isGuideStarted = (guideId: string) => {
    return progress.some(p => p.guide_id === guideId);
  };

  return {
    progress,
    loading,
    markGuideAsStarted,
    markGuideAsCompleted,
    isGuideCompleted,
    isGuideStarted,
  };
};
