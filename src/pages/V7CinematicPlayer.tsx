// V7 Cinematic Player Page - Uses phase-based player with database lessons ONLY
// ⚠️ NO FALLBACK - Always uses database script
import { useParams, useNavigate } from 'react-router-dom';
import { useV7PhaseScript } from '@/hooks/useV7PhaseScript';
import { V7PhasePlayer } from '@/components/lessons/v7/cinematic/V7PhasePlayer';
import { Loader2, AlertCircle, ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function V7CinematicPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch lesson from database - NO FALLBACK
  // ✅ V7-vv: Also fetch feedbackAudios for quiz feedback narration
  const { script, audioUrl, wordTimestamps, isLoading, error, refetch, rawContent, detectionPath, feedbackAudios } = useV7PhaseScript(lessonId);

  // Handle lesson completion
  const handleComplete = () => {
    toast({
      title: '🎉 Aula Completa!',
      description: 'Você completou a experiência cinematográfica!',
    });
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  // Handle exit
  const handleExit = () => {
    navigate('/dashboard');
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
    timestamps: wordTimestamps?.length
  });

  return (
    <V7PhasePlayer
      script={script}
      audioUrl={audioUrl || undefined}
      wordTimestamps={wordTimestamps}
      onComplete={handleComplete}
      onExit={handleExit}
      rawContent={rawContent}
      detectionPath={detectionPath}
      feedbackAudios={feedbackAudios || undefined}
    />
  );
}
