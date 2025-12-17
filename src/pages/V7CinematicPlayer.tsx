// V7 Cinematic Player Page - Uses phase-based player with database lessons
import { useParams, useNavigate } from 'react-router-dom';
import { useV7PhaseScript } from '@/hooks/useV7PhaseScript';
import { V7PhasePlayer } from '@/components/lessons/v7/cinematic/V7PhasePlayer';
import { fimDaBrincadeiraScript } from '@/data/v7LessonScripts/fimDaBrincadeiraScript';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function V7CinematicPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch lesson from database
  const { script, audioUrl, wordTimestamps, isLoading, error } = useV7PhaseScript(lessonId);

  // Handle lesson completion
  const handleComplete = () => {
    toast({
      title: '🎉 Aula Completa!',
      description: 'Você completou a experiência cinematográfica!',
    });
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando experiência cinematográfica...</p>
        </div>
      </div>
    );
  }

  // Render error state - fallback to demo script
  if (error || !script) {
    console.log('[V7CinematicPlayer] Using fallback demo script');
    return (
      <V7PhasePlayer
        script={fimDaBrincadeiraScript}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <V7PhasePlayer
      script={script}
      audioUrl={audioUrl || undefined}
      wordTimestamps={wordTimestamps}
      onComplete={handleComplete}
    />
  );
}
