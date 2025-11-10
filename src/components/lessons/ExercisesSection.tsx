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
  const [showRetry, setShowRetry] = useState(false);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [passedExercises, setPassedExercises] = useState<boolean[]>(new Array(exercises.length).fill(false));

  useEffect(() => {
    const newProgress = (scores.length / exercises.length) * 100;
    setProgressPercentage(newProgress);
  }, [scores.length, exercises.length]);

  const handleExerciseComplete = (score: number) => {
    const currentExercise = exercises[currentExerciseIndex];
    const PASSING_SCORE = currentExercise.passingScore || 70;
    const passed = score >= PASSING_SCORE;
    
    console.log('🎯 [EXERCISE] Score:', score);
    console.log('🎯 [EXERCISE] Passou?', passed);
    console.log('🎯 [EXERCISE] Passing score:', PASSING_SCORE);
    console.log('🎯 [EXERCISE] Tentativa:', (attempts[currentExerciseIndex] || 0) + 1);
    
    if (passed) {
      // ✅ SUCESSO: Confete + feedback positivo
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6']
      });
      
      toast({
        title: "🎉 Exercício completo!",
        description: `Score: ${Math.round(score)}% - ${scores.length + 1}/${exercises.length}`,
        duration: 2000,
      });
      
      // Marcar exercício como passou
      const newPassedExercises = [...passedExercises];
      newPassedExercises[currentExerciseIndex] = true;
      setPassedExercises(newPassedExercises);
      
      // Salvar e avançar
      const newScores = [...scores, score];
      setScores(newScores);
      
      if (onScoreUpdate) {
        onScoreUpdate(newScores);
      }
      
      // Reset retry state
      setShowRetry(false);

      if (currentExerciseIndex < exercises.length - 1) {
        console.log(`➡️ [EXERCISES] Avançando para exercício ${currentExerciseIndex + 2} de ${exercises.length}`);
        setTimeout(() => {
          setCurrentExerciseIndex(prev => prev + 1);
        }, 1500);
      } else {
        // Último exercício - verificar se TODOS passaram
        const allPassed = newPassedExercises.every(p => p === true);
        console.log('✅ [EXERCISES] Último exercício. Todos passaram?', allPassed);
        
        if (allPassed) {
          console.log('✅ [EXERCISES] Todos os exercícios completos com sucesso, chamando onComplete');
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else {
          // Algum exercício não foi aprovado - isso não deveria acontecer
          console.error('❌ [EXERCISES] ERRO: Chegou ao final mas nem todos passaram!');
          toast({
            title: "⚠️ Erro de validação",
            description: "Algo deu errado. Por favor, tente novamente.",
            variant: "destructive",
            duration: 4000,
          });
        }
      }
    } else {
      // ❌ FALHA: Feedback de erro + opção de retry
      toast({
        title: "📚 Quase lá!",
        description: `Você precisa de ${PASSING_SCORE}% para passar. Score atual: ${Math.round(score)}%`,
        variant: "destructive",
        duration: 4000,
      });
      
      // Incrementar tentativas
      setAttempts(prev => ({ ...prev, [currentExerciseIndex]: (prev[currentExerciseIndex] || 0) + 1 }));
      
      // Mostrar botão de retry
      setShowRetry(true);
    }
  };

  const handleRetry = () => {
    console.log('🔄 [RETRY] Usuário vai tentar novamente');
    setShowRetry(false);
    // Forçar re-render do exercício com key diferente
    setCurrentExerciseIndex(currentExerciseIndex);
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
            data={currentExercise.data}
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
        
        {/* Retry Card */}
        {showRetry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <Card className="p-6 bg-amber-50 dark:bg-amber-950/30 border-amber-500 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="text-4xl">💪</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Continue tentando!</h3>
                  <p className="text-sm text-muted-foreground">
                    Você está no caminho certo. Tente novamente!
                  </p>
                </div>
                <Button onClick={handleRetry} size="lg">
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
