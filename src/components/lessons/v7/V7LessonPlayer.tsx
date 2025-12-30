/**
 * V7LessonPlayer - Player definitivo para aulas V7-vv
 *
 * Baseado no V7Contract.ts - Consome exatamente o que o Pipeline gera.
 *
 * MÁQUINA DE ESTADOS:
 * loading → playing → [paused_for_interaction] → [showing_feedback] → playing → completed
 *
 * @version VV-Definitive
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  V7LessonData,
  V7Phase,
  V7PlayerStatus,
  V7PlayerState,
  V7MicroVisual,
  V7QuizOption,
} from '@/types/V7Contract';

// Import visual components
import V7VisualRenderer from './visuals/V7VisualRenderer';
import V7MicroVisualOverlay from './visuals/V7MicroVisualOverlay';
import V7QuizInteraction from './visuals/V7QuizInteraction';
import V7PlaygroundInteraction from './visuals/V7PlaygroundInteraction';
import V7FeedbackOverlay from './visuals/V7FeedbackOverlay';

interface V7LessonPlayerProps {
  lessonData: V7LessonData;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export default function V7LessonPlayer({
  lessonData,
  onComplete,
  onProgress,
}: V7LessonPlayerProps) {
  // =========================================================================
  // STATE
  // =========================================================================
  const [status, setStatus] = useState<V7PlayerStatus>('loading');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeMicroVisuals, setActiveMicroVisuals] = useState<V7MicroVisual[]>([]);

  // Interaction state
  const [selectedOption, setSelectedOption] = useState<V7QuizOption | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Audio refs
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateIntervalRef = useRef<number | null>(null);

  // Derived state
  const currentPhase = useMemo(() => lessonData.phases[currentPhaseIndex], [lessonData.phases, currentPhaseIndex]);
  const progress = useMemo(() => (currentTime / lessonData.metadata.totalDuration) * 100, [currentTime, lessonData.metadata.totalDuration]);

  // =========================================================================
  // AUDIO MANAGEMENT
  // =========================================================================
  useEffect(() => {
    // Initialize main audio
    if (lessonData.audio.mainAudio.url) {
      mainAudioRef.current = new Audio(lessonData.audio.mainAudio.url);
      mainAudioRef.current.preload = 'auto';

      mainAudioRef.current.addEventListener('canplaythrough', () => {
        console.log('[V7Player] Main audio ready');
        setStatus('playing');
        mainAudioRef.current?.play();
      });

      mainAudioRef.current.addEventListener('ended', () => {
        console.log('[V7Player] Main audio ended');
        setStatus('completed');
        onComplete?.();
      });

      mainAudioRef.current.addEventListener('error', (e) => {
        console.error('[V7Player] Audio error:', e);
      });
    } else {
      // No audio - start immediately
      setStatus('playing');
    }

    return () => {
      mainAudioRef.current?.pause();
      mainAudioRef.current = null;
      feedbackAudioRef.current?.pause();
      feedbackAudioRef.current = null;
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [lessonData.audio.mainAudio.url, onComplete]);

  // Time tracking
  useEffect(() => {
    if (status === 'playing' && mainAudioRef.current) {
      timeUpdateIntervalRef.current = window.setInterval(() => {
        if (mainAudioRef.current) {
          setCurrentTime(mainAudioRef.current.currentTime);
        }
      }, 100);
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [status]);

  // =========================================================================
  // PHASE MANAGEMENT
  // =========================================================================
  useEffect(() => {
    if (status !== 'playing') return;

    // Find current phase based on time
    for (let i = lessonData.phases.length - 1; i >= 0; i--) {
      const phase = lessonData.phases[i];
      if (currentTime >= phase.startTime && currentTime < phase.endTime) {
        if (i !== currentPhaseIndex) {
          console.log(`[V7Player] Phase change: ${currentPhaseIndex} → ${i} (${phase.id})`);
          setCurrentPhaseIndex(i);
        }
        break;
      }
    }

    // Report progress
    onProgress?.(progress);
  }, [currentTime, status, lessonData.phases, currentPhaseIndex, progress, onProgress]);

  // =========================================================================
  // ANCHOR ACTIONS (PAUSE)
  // =========================================================================
  useEffect(() => {
    if (status !== 'playing' || !currentPhase?.anchorActions) return;

    for (const action of currentPhase.anchorActions) {
      if (action.type === 'pause') {
        // Check if we've reached the pause point
        const tolerance = 0.15; // 150ms tolerance
        if (Math.abs(currentTime - action.keywordTime) < tolerance) {
          console.log(`[V7Player] Pause triggered: "${action.keyword}" @ ${action.keywordTime.toFixed(2)}s`);
          mainAudioRef.current?.pause();
          setStatus('waiting-interaction');
          break;
        }
      }
    }
  }, [currentTime, status, currentPhase]);

  // =========================================================================
  // MICRO-VISUALS
  // =========================================================================
  useEffect(() => {
    if (!currentPhase?.microVisuals) {
      setActiveMicroVisuals([]);
      return;
    }

    const active = currentPhase.microVisuals.filter(mv => {
      const isAfterTrigger = currentTime >= mv.triggerTime;
      const isBeforeEnd = currentTime < mv.triggerTime + mv.duration;
      return isAfterTrigger && isBeforeEnd;
    });

    setActiveMicroVisuals(active);
  }, [currentTime, currentPhase]);

  // =========================================================================
  // INTERACTION HANDLERS
  // =========================================================================
  const handleQuizAnswer = useCallback(async (option: V7QuizOption) => {
    console.log(`[V7Player] Quiz answered: ${option.id} (correct: ${option.isCorrect})`);
    setSelectedOption(option);
    setShowFeedback(true);
    setStatus('showing-feedback');

    // Play feedback audio if available
    if (option.feedback.audioId && lessonData.audio.feedbackAudios) {
      const feedbackAudio = lessonData.audio.feedbackAudios[option.feedback.audioId];
      if (feedbackAudio?.url) {
        console.log(`[V7Player] Playing feedback audio: ${option.feedback.audioId}`);
        feedbackAudioRef.current = new Audio(feedbackAudio.url);
        feedbackAudioRef.current.play();

        // Wait for feedback audio to finish
        await new Promise<void>((resolve) => {
          feedbackAudioRef.current!.addEventListener('ended', () => resolve());
          feedbackAudioRef.current!.addEventListener('error', () => resolve());
        });
      }
    }
  }, [lessonData.audio.feedbackAudios]);

  const handleContinueAfterFeedback = useCallback(() => {
    console.log('[V7Player] Continuing after feedback');
    setShowFeedback(false);
    setSelectedOption(null);

    // Move to next phase
    const nextPhaseIndex = currentPhaseIndex + 1;

    if (nextPhaseIndex < lessonData.phases.length) {
      const nextPhase = lessonData.phases[nextPhaseIndex];

      // Seek main audio to next phase start
      if (mainAudioRef.current) {
        console.log(`[V7Player] Seeking to ${nextPhase.startTime.toFixed(2)}s`);
        mainAudioRef.current.currentTime = nextPhase.startTime;
        mainAudioRef.current.play();
      }

      setCurrentPhaseIndex(nextPhaseIndex);
      setStatus('playing');
    } else {
      // Lesson complete
      setStatus('completed');
      onComplete?.();
    }
  }, [currentPhaseIndex, lessonData.phases, onComplete]);

  const handlePlaygroundComplete = useCallback(() => {
    console.log('[V7Player] Playground completed');
    handleContinueAfterFeedback();
  }, [handleContinueAfterFeedback]);

  // =========================================================================
  // RENDER
  // =========================================================================
  if (status === 'loading') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-xl">Carregando aula...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      {/* Main Visual */}
      <AnimatePresence mode="wait">
        {currentPhase && (
          <motion.div
            key={currentPhase.id}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <V7VisualRenderer
              visual={currentPhase.visual}
              effects={currentPhase.effects}
              phaseType={currentPhase.type}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Micro-Visuals Overlay */}
      <V7MicroVisualOverlay microVisuals={activeMicroVisuals} />

      {/* Quiz Interaction */}
      {status === 'waiting-interaction' && currentPhase?.interaction?.type === 'quiz' && (
        <V7QuizInteraction
          interaction={currentPhase.interaction as any}
          onAnswer={handleQuizAnswer}
        />
      )}

      {/* Playground Interaction */}
      {status === 'waiting-interaction' && currentPhase?.interaction?.type === 'playground' && (
        <V7PlaygroundInteraction
          interaction={currentPhase.interaction as any}
          onComplete={handlePlaygroundComplete}
        />
      )}

      {/* Feedback Overlay */}
      {showFeedback && selectedOption && (
        <V7FeedbackOverlay
          feedback={selectedOption.feedback}
          isCorrect={selectedOption.isCorrect}
          onContinue={handleContinueAfterFeedback}
        />
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-cyan-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase Indicator (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white/50 font-mono">
          Phase: {currentPhaseIndex + 1}/{lessonData.phases.length} |
          Time: {currentTime.toFixed(1)}s |
          Status: {status}
        </div>
      )}
    </div>
  );
}
