import { useState, useEffect } from 'react';
import { ExerciseConfig } from '@/types/guidedLesson';
import { DragDropLesson } from './DragDropLesson';
import { CompleteSentenceExercise } from './CompleteSentenceExercise';
import { ScenarioSelectionExercise } from './ScenarioSelectionExercise';
import { FillInBlanksExercise } from './FillInBlanksExercise';
import { TrueFalseExercise } from './TrueFalseExercise';
import { PlatformMatchExercise } from './PlatformMatchExercise';
import { DataCollectionExercise } from './DataCollectionExercise';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExercisesSectionProps {
  exercises: ExerciseConfig[];
  onComplete: () => void;
  onScoreUpdate?: (scores: number[]) => void;
  onBack?: () => void; // Callback para voltar à aula
}

export function ExercisesSection({ exercises, onComplete, onScoreUpdate, onBack }: ExercisesSectionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Calcular progresso e animar barra
  useEffect(() => {
    const newProgress = (scores.length / exercises.length) * 100;
    setProgressPercentage(newProgress);
  }, [scores.length, exercises.length]);

  const handleExerciseComplete = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);
    
    // Atualizar scores no componente pai
    if (onScoreUpdate) {
      onScoreUpdate(newScores);
    }

    console.log(`✅ [EXERCISE ${currentExerciseIndex + 1}] Completo com score: ${score}`);

    // 🎉 Feedback visual: confetti + toast
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6']
    });

    toast({
      title: "Exercício completo!",
      description: `${scores.length + 1} de ${exercises.length} concluídos`,
      duration: 2000,
    });

    if (currentExerciseIndex < exercises.length - 1) {
      console.log(`➡️ [EXERCISES] Avançando para exercício ${currentExerciseIndex + 2} de ${exercises.length}`);
      setTimeout(() => {
        setCurrentExerciseIndex(prev => prev + 1);
      }, 1500);
    } else {
      // Último exercício
      console.log('✅ [EXERCISES] Todos os exercícios completos, chamando onComplete');
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const handleBackClick = () => {
    if (scores.length > 0) {
      // Tem progresso - mostrar confirmação
      setShowBackDialog(true);
    } else {
      // Sem progresso - voltar direto
      onBack?.();
    }
  };

  const handleConfirmBack = () => {
    setShowBackDialog(false);
    onBack?.();
  };

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <>
      <AlertDialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voltar para a aula?</AlertDialogTitle>
            <AlertDialogDescription>
              Você já completou {scores.length} de {exercises.length} exercícios. 
              Seu progresso não será salvo se voltar agora.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar exercícios</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBack}>Voltar para aula</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div 
        data-testid="exercises-section"
        data-exercise-index={currentExerciseIndex}
        data-total-exercises={exercises.length}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 animate-fade-in"
      >
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold">Exercícios Finais</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Exercício {currentExerciseIndex + 1} de {exercises.length}</span>
                {scores.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    {scores.length} completos
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Barra de progresso animada */}
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {currentExercise.type === 'drag-drop' && (
          <DragDropLesson
            data-testid={`exercise-drag-drop-${currentExerciseIndex}`}
            content={{
              items: currentExercise.data.items.map((item: any) => item.text),
              correctOrder: currentExercise.data.items.map((item: any) => item.text),
              instruction: currentExercise.instruction
            }}
            onSubmit={async (items: string[]) => {
              const correctCount = items.filter((item, index) => 
                item === currentExercise.data.items[index].text
              ).length;
              const score = (correctCount / items.length) * 100;
              handleExerciseComplete(score);
              return {
                passed: score >= 70,
                score,
                feedback: score >= 70 ? 'Excelente trabalho!' : 'Quase lá! Tente novamente.',
                isLastLesson: false
              };
            }}
            submitting={false}
          />
        )}

        {currentExercise.type === 'complete-sentence' && (
          <CompleteSentenceExercise
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            sentences={currentExercise.data.sentences}
            onComplete={handleExerciseComplete}
          />
        )}

        {currentExercise.type === 'scenario-selection' && (
          <ScenarioSelectionExercise
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            scenarios={currentExercise.data.scenarios}
            onComplete={handleExerciseComplete}
          />
        )}

        {currentExercise.type === 'fill-in-blanks' && (
          <FillInBlanksExercise
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            sentences={currentExercise.data.sentences}
            feedback={currentExercise.data.feedback}
            onComplete={handleExerciseComplete}
          />
        )}

        {currentExercise.type === 'true-false' && (
          <TrueFalseExercise
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            statements={currentExercise.data.statements}
            feedback={currentExercise.data.feedback}
            onComplete={handleExerciseComplete}
          />
        )}

        {currentExercise.type === 'data-collection' && (
          <DataCollectionExercise
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            scenarios={currentExercise.data.scenarios}
            onComplete={handleExerciseComplete}
          />
        )}

        {currentExercise.type === 'platform-match' && (
          <PlatformMatchExercise
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            scenarios={currentExercise.data.scenarios}
            platforms={currentExercise.data.platforms}
            onComplete={handleExerciseComplete}
          />
        )}
      </div>
    </div>
    </>
  );
}
