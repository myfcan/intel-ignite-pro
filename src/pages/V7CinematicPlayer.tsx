// V7 Cinematic Player Page - Plays lessons from database with full cinematic experience
import { useParams, useNavigate } from 'react-router-dom';
import { useV7CinematicLesson, V7CinematicActData } from '@/hooks/useV7CinematicLesson';
import { V7ImmersivePlayer } from '@/components/lessons/v7/cinematic/V7ImmersivePlayer';
import { 
  V7ActDramatic, 
  V7ActComparison, 
  V7ActInteraction,
  V7ActResult,
  V7ActPlayground 
} from '@/components/lessons/v7/cinematic';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function V7CinematicPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { lesson, isLoading, error } = useV7CinematicLesson(lessonId);
  const [currentActIndex, setCurrentActIndex] = useState(0);

  // Handle lesson completion
  const handleComplete = () => {
    toast({
      title: '🎉 Aula Completa!',
      description: `Você completou: ${lesson?.title}`,
    });
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

  // Render error state
  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Erro ao carregar aula</h2>
          <p className="text-muted-foreground">{error || 'Aula não encontrada'}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // Transform lesson acts to V7ImmersivePlayer format
  const acts = lesson.acts.map((act, index) => ({
    id: act.id,
    type: act.type,
    content: renderActContent(act, currentActIndex, index),
    autoAdvanceMs: act.autoAdvanceMs,
  }));

  // Calculate total duration string
  const minutes = Math.floor(lesson.totalDuration / 60);
  const seconds = lesson.totalDuration % 60;
  const totalDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <V7ImmersivePlayer
      acts={acts}
      totalDuration={totalDuration}
      audioUrl={lesson.audioUrl}
      onComplete={handleComplete}
      onActChange={setCurrentActIndex}
    />
  );
}

// Render act content based on type using correct component interfaces
function renderActContent(
  act: V7CinematicActData, 
  currentIndex: number,
  actIndex: number
) {
  switch (act.type) {
    case 'dramatic':
      return (
        <V7ActDramatic
          mainValue={act.content.dramaticNumber || String(actIndex + 1).padStart(2, '0')}
          subtitle={act.content.narrative || act.title}
          highlightWord={act.content.dramaticLabel}
        />
      );

    case 'comparison':
      const compItems = act.content.comparisonItems || [];
      return (
        <V7ActComparison
          title={act.title}
          leftCard={{
            label: compItems[0]?.label || 'Antes',
            value: compItems[0]?.highlight ? '✗' : '→',
            isPositive: false,
            details: [compItems[0]?.description || 'Abordagem básica'],
          }}
          rightCard={{
            label: compItems[1]?.label || 'Depois',
            value: compItems[1]?.highlight ? '✓' : '→',
            isPositive: true,
            details: [compItems[1]?.description || 'Abordagem avançada'],
          }}
        />
      );

    case 'interaction':
      const options = act.content.interactionOptions || [];
      return (
        <V7ActInteraction
          title={act.content.interactionQuestion || 'Qual é a melhor opção?'}
          subtitle="Selecione a melhor resposta"
          options={options.map(opt => ({
            id: opt.id,
            text: opt.label,
            isDefault: false,
          }))}
          buttonText="Confirmar"
          onReveal={(selectedIds) => {
            console.log('[V7CinematicPlayer] Answer:', selectedIds);
          }}
          allowMultiple={false}
        />
      );

    case 'result':
      const metrics = act.content.resultMetrics || [];
      return (
        <V7ActResult
          emoji="🎉"
          title={act.title || 'Resultado'}
          message="Você completou esta etapa com sucesso!"
          metrics={metrics.map(m => ({
            label: m.label,
            value: m.value,
          }))}
        />
      );

    case 'playground':
      return (
        <V7ActPlayground
          title={act.title || 'Playground'}
          leftSide={{
            label: 'Seu Prompt',
            placeholder: 'Escreva seu prompt aqui...',
            defaultValue: act.content.playgroundCode || '',
          }}
          rightSide={{
            label: 'Prompt Profissional',
            placeholder: 'Veja o exemplo profissional...',
            isPro: true,
          }}
          onGenerateLeft={(prompt) => ({
            text: `Resultado para: "${prompt.slice(0, 50)}..."`,
            scoreLabel: 'Score',
            scoreValue: '65%',
            isHighScore: false,
          })}
          onGenerateRight={(prompt) => ({
            text: `Resultado profissional para: "${prompt.slice(0, 50)}..."`,
            scoreLabel: 'Score',
            scoreValue: '95%',
            isHighScore: true,
          })}
        />
      );

    default:
      return (
        <V7ActDramatic
          mainValue={String(actIndex + 1).padStart(2, '0')}
          subtitle={act.content.narrative || act.title}
        />
      );
  }
}
