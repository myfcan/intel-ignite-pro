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
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
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
  onBack?: () => void;
  exerciseMetadata?: Array<{ title: string; type: string }>;
}

export function ExercisesSection({ exercises, onComplete, onScoreUpdate, onBack, exerciseMetadata }: ExercisesSectionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [showRetryCard, setShowRetryCard] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const newProgress = (scores.length / exercises.length) * 100;
    setProgressPercentage(newProgress);
  }, [scores.length, exercises.length]);

  const handleExerciseComplete = (score: number) => {
    console.log('🎯 [EXERCISE] Score:', score);
    console.log('🎯 [EXERCISE] Exercício', currentExerciseIndex + 1, 'de', exercises.length);
    
    const currentExercise = exercises[currentExerciseIndex];
    const passingScore = currentExercise.passingScore || 70;
    const passed = score >= passingScore;
    
    // Confete se passou
    if (passed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6']
      });
    }
    
    // Toast de feedback diferenciado
    if (passed) {
      toast({
        title: "✅ Exercício completo!",
        description: `Score: ${Math.round(score)}% - ${scores.length + 1}/${exercises.length}`,
        duration: 2000,
      });
    } else {
      toast({
        title: "⚠️ Quase lá!",
        description: `Score: ${Math.round(score)}% - Você precisa de pelo menos ${passingScore}%`,
        variant: "destructive",
        duration: 3000,
      });
    }
    
    // Salvar score
    const newScores = [...scores, score];
    setScores(newScores);
    
    if (onScoreUpdate) {
      onScoreUpdate(newScores);
    }

    // Só avançar se passou
    if (passed) {
      setShowRetryCard(false);
      if (currentExerciseIndex < exercises.length - 1) {
        console.log(`➡️ [EXERCISES] Passou! Avançando para exercício ${currentExerciseIndex + 2} de ${exercises.length}`);
        setTimeout(() => {
          setCurrentExerciseIndex(prev => prev + 1);
        }, 1200);
      } else {
        // Último exercício - completar
        console.log('✅ [EXERCISES] Todos os exercícios completos, chamando onComplete');
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } else {
      // Não passou - mostrar retry card
      console.log('❌ [EXERCISES] Não passou. Score necessário:', passingScore);
      setLastScore(score);
      setTimeout(() => {
        setShowRetryCard(true);
      }, 1500);
    }
  };

  const handleRetry = () => {
    console.log('🔄 [RETRY] Tentando exercício novamente');
    setShowRetryCard(false);
    setRetryCount(prev => prev + 1);
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

        {!showRetryCard && currentExercise.type === 'drag-drop' && (
          <DragDropLesson
            key={`exercise-${currentExerciseIndex}-retry-${retryCount}`}
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

        {!showRetryCard && currentExercise.type === 'complete-sentence' && (
          <CompleteSentenceExercise
            key={`exercise-${currentExerciseIndex}-retry-${retryCount}`}
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            sentences={currentExercise.data.sentences}
            onComplete={handleExerciseComplete}
          />
        )}

        {!showRetryCard && currentExercise.type === 'scenario-selection' && (
          <ScenarioSelectionExercise
            key={`exercise-${currentExerciseIndex}-retry-${retryCount}`}
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            data={currentExercise.data}
            onComplete={handleExerciseComplete}
          />
        )}

        {!showRetryCard && currentExercise.type === 'fill-in-blanks' && (
          <FillInBlanksExercise
            key={`exercise-${currentExerciseIndex}-retry-${retryCount}`}
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            sentences={currentExercise.data.sentences}
            feedback={currentExercise.data.feedback}
            onComplete={handleExerciseComplete}
          />
        )}

        {!showRetryCard && currentExercise.type === 'true-false' && (
          <TrueFalseExercise
            key={`exercise-${currentExerciseIndex}-retry-${retryCount}`}
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            statements={currentExercise.data.statements}
            feedback={currentExercise.data.feedback}
            onComplete={handleExerciseComplete}
          />
        )}

        {!showRetryCard && currentExercise.type === 'data-collection' && (
          <DataCollectionExercise
            key={`exercise-${currentExerciseIndex}-retry-${retryCount}`}
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            scenarios={currentExercise.data.scenarios}
            onComplete={handleExerciseComplete}
          />
        )}

        {!showRetryCard && currentExercise.type === 'platform-match' && (
          <PlatformMatchExercise
            key={`exercise-${currentExerciseIndex}-retry-${retryCount}`}
            title={currentExercise.title}
            instruction={currentExercise.instruction}
            scenarios={currentExercise.data.scenarios}
            platforms={currentExercise.data.platforms}
            onComplete={handleExerciseComplete}
          />
        )}
        
        {/* Retry Card - quando não passar no exercício */}
        {showRetryCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8 text-center border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <div className="text-6xl mb-4">💪</div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                Quase lá!
              </h3>
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-2">
                Score: <span className="font-bold text-amber-600 dark:text-amber-400">{Math.round(lastScore)}%</span>
              </p>
              <p className="text-muted-foreground mb-6">
                Você precisa de pelo menos {currentExercise.passingScore || 70}% para avançar. Revise o conteúdo e tente novamente!
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleRetry}
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  🔄 Tentar Novamente
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}
