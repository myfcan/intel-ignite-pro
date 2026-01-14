// V7 Cinematic Player Page - Uses phase-based player with database lessons ONLY
// ⚠️ NO FALLBACK - Always uses database script
// ✅ V7-vv: Includes post-lesson flow (exercise, results, rewards)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useV7PhaseScript } from '@/hooks/useV7PhaseScript';
import { V7PhasePlayer } from '@/components/lessons/v7/cinematic/V7PhasePlayer';
import { V7PostLessonFlow } from '@/components/lessons/v7/cinematic/V7PostLessonFlow';
import { Loader2, AlertCircle, ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function V7CinematicPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // ✅ V7-vv: Track if lesson content is complete (show post-lesson flow)
  const [showPostLessonFlow, setShowPostLessonFlow] = useState(false);
  
  // ✅ Track trail_id for proper navigation back to trail
  const [trailId, setTrailId] = useState<string | null>(null);
  
  // Fetch lesson from database - NO FALLBACK
  // ✅ V7-vv: Also fetch feedbackAudios for quiz feedback narration
  const { script, audioUrl, wordTimestamps, isLoading, error, refetch, rawContent, detectionPath, feedbackAudios } = useV7PhaseScript(lessonId);

  // ✅ Fetch trail_id when lesson loads
  useEffect(() => {
    if (!lessonId) return;
    
    const fetchTrailId = async () => {
      const { data } = await supabase
        .from('lessons')
        .select('trail_id')
        .eq('id', lessonId)
        .single();
      
      if (data?.trail_id) {
        setTrailId(data.trail_id);
        console.log('[V7CinematicPlayer] Trail ID loaded:', data.trail_id);
      }
    };
    
    fetchTrailId();
  }, [lessonId]);

  // Handle lesson content completion - triggers post-lesson flow
  const handleLessonContentComplete = () => {
    console.log('[V7CinematicPlayer] ✅ Lesson content complete - showing post-lesson flow');
    setShowPostLessonFlow(true);
  };

  // Handle full lesson completion (after rewards) - navigate back to trail
  const handleFullComplete = () => {
    toast({
      title: '🎉 Aula Completa!',
      description: 'Você completou a experiência cinematográfica!',
    });
    // ✅ Navigate back to trail instead of dashboard
    const destination = trailId ? `/trails/${trailId}` : '/dashboard';
    console.log('[V7CinematicPlayer] Navigating to:', destination);
    setTimeout(() => navigate(destination), 1000);
  };

  // Handle exit - navigate back to trail
  const handleExit = () => {
    const destination = trailId ? `/trails/${trailId}` : '/dashboard';
    navigate(destination);
  };

  // Hard refresh - clear cache and refetch WITHOUT reloading page
  const handleHardRefresh = async () => {
    toast({
      title: '🔄 Limpando cache...',
      description: 'Recarregando dados do servidor...',
    });
    
    // Clear React Query cache
    queryClient.clear();
    
    // Clear browser cache for this page
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (e) {
        console.warn('Failed to clear browser caches:', e);
      }
    }
    
    // Refetch the lesson data instead of reloading the page
    // This avoids race conditions where the page reloads before data is ready
    await refetch();
    
    toast({
      title: '✅ Cache limpo!',
      description: 'Dados recarregados do servidor.',
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando experiência cinematográfica...</p>
          <p className="text-xs text-muted-foreground/60">Lesson ID: {lessonId}</p>
        </div>
      </div>
    );
  }

  // ⚠️ ERRO REAL - SEM FALLBACK
  // Mostra erro detalhado para debug
  if (error || !script) {
    console.error('[V7CinematicPlayer] ❌ ERRO CRÍTICO:', {
      error,
      hasScript: !!script,
      lessonId,
      scriptPhases: script?.phases?.length
    });
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Erro ao Carregar Aula</h1>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar a aula do banco de dados.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left">
              <p className="text-sm font-mono text-destructive">
                {error || 'Script não encontrado ou vazio'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Lesson ID: {lessonId}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={handleExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button variant="destructive" onClick={handleHardRefresh}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ USA SCRIPT DO BANCO DE DADOS
  console.log('[V7CinematicPlayer] ✅ Usando script do banco:', {
    id: script.id,
    title: script.title,
    phases: script.phases?.length,
    hasAudio: !!audioUrl,
    timestamps: wordTimestamps?.length,
    showPostLessonFlow
  });

  // ✅ V7-vv: Show post-lesson flow after lesson content completes
  if (showPostLessonFlow) {
    return (
      <V7PostLessonFlow
        lessonTitle={script.title}
        lessonId={script.id}
        onComplete={handleFullComplete}
      />
    );
  }

  return (
    <V7PhasePlayer
      script={script}
      audioUrl={audioUrl || undefined}
      wordTimestamps={wordTimestamps}
      onComplete={handleLessonContentComplete}
      onExit={handleExit}
      rawContent={rawContent}
      detectionPath={detectionPath}
      feedbackAudios={feedbackAudios || undefined}
    />
  );
}
