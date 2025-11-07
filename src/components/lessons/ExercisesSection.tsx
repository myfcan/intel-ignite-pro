import { useState } from 'react';
import { ExerciseConfig } from '@/types/guidedLesson';
import { DragDropLesson } from './DragDropLesson';
import { CompleteSentenceExercise } from './CompleteSentenceExercise';
import { ScenarioSelectionExercise } from './ScenarioSelectionExercise';
import { FillInBlanksExercise } from './FillInBlanksExercise';
import { TrueFalseExercise } from './TrueFalseExercise';
import { PlatformMatchExercise } from './PlatformMatchExercise';

interface ExercisesSectionProps {
  exercises: ExerciseConfig[];
  onComplete: () => void;
  onScoreUpdate?: (scores: number[]) => void;
}

export function ExercisesSection({ exercises, onComplete, onScoreUpdate }: ExercisesSectionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  const handleExerciseComplete = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);
    
    // Atualizar scores no componente pai
    if (onScoreUpdate) {
      onScoreUpdate(newScores);
    }

    console.log(`✅ [EXERCISE ${currentExerciseIndex + 1}] Completo com score: ${score}`);

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

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Exercícios Finais</h2>
          <p className="text-muted-foreground">
            Exercício {currentExerciseIndex + 1} de {exercises.length}
          </p>
        </div>

        {currentExercise.type === 'drag-drop' && (
          <DragDropLesson
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
  );
}
