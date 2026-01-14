/**
 * V7PostLessonFlow - Gerencia o fluxo pós-aula V7-vv
 * Conecta: LessonComplete → DragDrop Exercise → Results → Rewards → Dashboard
 * 
 * Este componente é um wrapper que NÃO modifica o V7PhasePlayer existente.
 * Ele intercepta o onComplete e mostra as telas de conclusão antes de navegar.
 */

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { V7LessonCompleteCard } from './phases/V7LessonCompleteCard';
import { V7PerfeitoDragDrop } from './phases/V7PerfeitoDragDrop';
import { V7ExerciseResultCard } from './phases/V7ExerciseResultCard';
import { V7RewardsModal } from './phases/V7RewardsModal';

// Flow stages
type FlowStage = 
  | 'lesson_complete'   // Card de conclusão de aula
  | 'exercise'          // Exercício drag-and-drop
  | 'results'           // Resultado do exercício
  | 'rewards';          // Modal de recompensas

interface V7PostLessonFlowProps {
  lessonTitle: string;
  lessonId: string;
  avatarUrl?: string;
  // Gamification data (mock por enquanto, depois conectar com DB)
  xpDelta?: number;
  coinsDelta?: number;
  newPowerScore?: number;
  newCoins?: number;
  patentName?: string;
  isNewPatent?: boolean;
  // Callbacks
  onComplete: () => void;
}

export const V7PostLessonFlow = ({
  lessonTitle,
  lessonId,
  avatarUrl,
  xpDelta = 150,
  coinsDelta = 50,
  newPowerScore = 1250,
  newCoins = 350,
  patentName = 'Prompt Pioneer',
  isNewPatent = false,
  onComplete
}: V7PostLessonFlowProps) => {
  const [stage, setStage] = useState<FlowStage>('lesson_complete');
  const [exerciseScore, setExerciseScore] = useState({ score: 0, total: 8 });

  // Handlers para navegação entre stages
  const handleLessonCompleteNext = useCallback(() => {
    console.log('[V7PostLessonFlow] LessonComplete → Exercise');
    setStage('exercise');
  }, []);

  const handleExerciseComplete = useCallback((score: number, total: number) => {
    console.log(`[V7PostLessonFlow] Exercise Complete: ${score}/${total}`);
    setExerciseScore({ score, total });
    setStage('results');
  }, []);

  const handleViewRewards = useCallback(() => {
    console.log('[V7PostLessonFlow] Results → Rewards');
    setStage('rewards');
  }, []);

  const handleRewardsBack = useCallback(() => {
    console.log('[V7PostLessonFlow] Rewards → Results (back)');
    setStage('results');
  }, []);

  const handleRewardsContinue = useCallback(() => {
    console.log('[V7PostLessonFlow] Flow Complete → Dashboard');
    onComplete();
  }, [onComplete]);

  return (
    <AnimatePresence mode="wait">
      {/* Stage 1: Lesson Complete Card */}
      {stage === 'lesson_complete' && (
        <V7LessonCompleteCard
          key="lesson-complete"
          onContinue={handleLessonCompleteNext}
          avatarUrl={avatarUrl}
        />
      )}

      {/* Stage 2: PERFEITO Drag & Drop Exercise */}
      {stage === 'exercise' && (
        <div 
          key="exercise"
          className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        >
          <V7PerfeitoDragDrop
            onComplete={handleExerciseComplete}
          />
        </div>
      )}

      {/* Stage 3: Exercise Results */}
      {stage === 'results' && (
        <V7ExerciseResultCard
          key="results"
          lessonTitle={lessonTitle}
          score={exerciseScore.score}
          total={exerciseScore.total}
          onViewRewards={handleViewRewards}
        />
      )}

      {/* Stage 4: Rewards Modal */}
      {stage === 'rewards' && (
        <V7RewardsModal
          key="rewards"
          xpDelta={xpDelta}
          coinsDelta={coinsDelta}
          newPowerScore={newPowerScore}
          newCoins={newCoins}
          patentName={patentName}
          isNewPatent={isNewPatent}
          onBack={handleRewardsBack}
          onContinue={handleRewardsContinue}
        />
      )}
    </AnimatePresence>
  );
};

export default V7PostLessonFlow;
