/**
 * V7PostLessonFlow - Gerencia o fluxo pós-aula V7-vv
 * Conecta: LessonComplete → DragDrop Exercise → Results → Rewards → Dashboard
 * 
 * Este componente é um wrapper que NÃO modifica o V7PhasePlayer existente.
 * Ele intercepta o onComplete e mostra as telas de conclusão antes de navegar.
 * 
 * ✅ V7-vv: Conectado com sistema de gamificação real do banco de dados
 * ✅ Mostra próxima aula recomendada no modal de recompensas
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useV7SoundEffects } from './useV7SoundEffects';
import { AnimatePresence } from 'framer-motion';
import { V7LessonCompleteCard } from './phases/V7LessonCompleteCard';
import { V7PerfeitoDragDrop } from './phases/V7PerfeitoDragDrop';
import { V7ExerciseResultCard } from './phases/V7ExerciseResultCard';
import { V7RewardsModal } from './phases/V7RewardsModal';
import { V7ExitConfirmModal } from './V7ExitConfirmModal';
import { registerGamificationEvent, GamificationResult } from '@/services/gamification';
import { useUserGamification } from '@/hooks/useUserGamification';
import { supabase } from '@/integrations/supabase/client';

// Tipo para próxima aula com preview
interface NextLesson {
  id: string;
  title: string;
  order_index: number;
  description?: string | null;
  estimated_time?: number | null;
}

// Flow stages
type FlowStage = 
  | 'lesson_complete'   // Card de conclusão de aula
  | 'exercise'          // Exercício drag-and-drop
  | 'results'           // Resultado do exercício
  | 'rewards';          // Modal de recompensas

interface V7PostLessonFlowProps {
  lessonTitle: string;
  lessonId: string;
  // Callbacks
  onComplete: () => void;
  onExit?: () => void;
}

export const V7PostLessonFlow = ({
  lessonTitle,
  lessonId,
  onComplete,
  onExit
}: V7PostLessonFlowProps) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<FlowStage>('lesson_complete');
  const [exerciseScore, setExerciseScore] = useState({ score: 0, total: 8 });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const { playSound } = useV7SoundEffects(0.6, true);
  
  // ✅ Gamification state from database
  const [gamificationResult, setGamificationResult] = useState<GamificationResult | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { stats, refresh: refreshStats } = useUserGamification();
  
  // ✅ Próxima aula recomendada
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [trailId, setTrailId] = useState<string | null>(null);
  
  // ✅ Handler para abrir modal de confirmação
  const handleExitRequest = useCallback(() => {
    setShowExitConfirm(true);
  }, []);
  
  // ✅ Buscar próxima aula da trilha
  useEffect(() => {
    const fetchNextLesson = async () => {
      try {
        // Primeiro, buscar a aula atual para obter trail_id e order_index
        const { data: currentLesson } = await supabase
          .from('lessons')
          .select('trail_id, order_index')
          .eq('id', lessonId)
          .single();
        
        if (!currentLesson?.trail_id) return;
        
        // Salvar trail_id para navegação
        setTrailId(currentLesson.trail_id);
        
        // Buscar próxima aula da mesma trilha com descrição
        const { data: next } = await supabase
          .from('lessons')
          .select('id, title, order_index, description, estimated_time')
          .eq('trail_id', currentLesson.trail_id)
          .eq('is_active', true)
          .gt('order_index', currentLesson.order_index)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();
        
        if (next) {
          setNextLesson(next);
          console.log('[V7PostLessonFlow] Próxima aula encontrada:', next.title);
        }
      } catch (error) {
        console.log('[V7PostLessonFlow] Nenhuma próxima aula encontrada');
      }
    };
    
    fetchNextLesson();
  }, [lessonId]);

  // ✅ Register lesson completion when entering results stage
  const registerLessonCompletion = useCallback(async () => {
    if (isRegistering || gamificationResult) return;
    
    setIsRegistering(true);
    console.log('[V7PostLessonFlow] Registering lesson completion:', lessonId);
    
    try {
      const result = await registerGamificationEvent('lesson_completed', lessonId, {
        exerciseScore: exerciseScore.score,
        exerciseTotal: exerciseScore.total,
        completedAt: new Date().toISOString()
      });
      
      if (result) {
        console.log('[V7PostLessonFlow] Gamification result:', result);
        setGamificationResult(result);
        
        // 🔊 Gamification sounds based on result
        if (result.is_new_patent) {
          playSound('level-up');
        } else if (result.xp_delta >= 50) {
          playSound('streak-bonus');
        }
        
        // Refresh stats to get updated totals
        await refreshStats();
      } else {
        console.warn('[V7PostLessonFlow] No gamification result returned');
        // Set default values if registration fails
        setGamificationResult({
          xp_delta: 100,
          coins_delta: 25,
          new_power_score: stats?.powerScore || 100,
          new_coins: stats?.coins || 25,
          new_patent_level: stats?.patentLevel || 1,
          patent_name: stats?.patentName || 'Operador Básico de I.A.',
          is_new_patent: false
        });
      }
    } catch (error) {
      console.error('[V7PostLessonFlow] Error registering completion:', error);
      // Set fallback values
      setGamificationResult({
        xp_delta: 100,
        coins_delta: 25,
        new_power_score: stats?.powerScore || 100,
        new_coins: stats?.coins || 25,
        new_patent_level: stats?.patentLevel || 1,
        patent_name: stats?.patentName || 'Operador Básico de I.A.',
        is_new_patent: false
      });
    } finally {
      setIsRegistering(false);
    }
  }, [lessonId, exerciseScore, isRegistering, gamificationResult, stats, refreshStats]);

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

  // ✅ Register gamification when entering results
  useEffect(() => {
    if (stage === 'results' && !gamificationResult && !isRegistering) {
      registerLessonCompletion();
    }
  }, [stage, gamificationResult, isRegistering, registerLessonCompletion]);

  const handleViewRewards = useCallback(() => {
    console.log('[V7PostLessonFlow] Results → Rewards');
    setStage('rewards');
  }, []);

  const handleRewardsBack = useCallback(() => {
    console.log('[V7PostLessonFlow] Rewards → Results (back)');
    setStage('results');
  }, []);

  // ✅ Ir para trilha da aula atual
  const handleGoToTrail = useCallback(() => {
    if (trailId) {
      console.log('[V7PostLessonFlow] Going to trail:', trailId);
      navigate(`/trail/${trailId}`);
    } else {
      // Fallback para dashboard se não tiver trail
      navigate('/dashboard');
    }
  }, [trailId, navigate]);
  
  // ✅ Ir para dashboard
  const handleGoToDashboard = useCallback(() => {
    console.log('[V7PostLessonFlow] Going to dashboard');
    navigate('/dashboard');
  }, [navigate]);
  
  // ✅ Ir direto para próxima aula
  const handleGoToNextLesson = useCallback(() => {
    if (nextLesson) {
      console.log('[V7PostLessonFlow] Going to next lesson:', nextLesson.id);
      navigate(`/v7/${nextLesson.id}`);
    }
  }, [nextLesson, navigate]);

  return (
    <AnimatePresence mode="wait">
      {/* Stage 1: Lesson Complete Card */}
      {stage === 'lesson_complete' && (
        <V7LessonCompleteCard
          key="lesson-complete"
          onContinue={handleLessonCompleteNext}
          onExit={handleExitRequest}
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
            onExit={handleExitRequest}
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
          onExit={handleExitRequest}
        />
      )}

      {/* Stage 4: Rewards Modal - ✅ Connected to real gamification data + próxima aula */}
      {stage === 'rewards' && gamificationResult && (
        <V7RewardsModal
          key="rewards"
          xpDelta={gamificationResult.xp_delta}
          coinsDelta={gamificationResult.coins_delta}
          newPowerScore={gamificationResult.new_power_score}
          newCoins={gamificationResult.new_coins}
          patentName={gamificationResult.patent_name}
          isNewPatent={gamificationResult.is_new_patent}
          nextLesson={nextLesson}
          onBack={handleGoToDashboard}
          onContinue={handleGoToTrail}
          onNextLesson={handleGoToNextLesson}
        />
      )}

      {/* ✅ Exit Confirmation Modal */}
      <V7ExitConfirmModal
        isOpen={showExitConfirm}
        onConfirmExit={() => {
          setShowExitConfirm(false);
          onExit?.();
        }}
        onContinue={() => setShowExitConfirm(false)}
      />
    </AnimatePresence>
  );
};

export default V7PostLessonFlow;
