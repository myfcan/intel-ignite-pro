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

  // C06 Compatibility: Refs for crossing detection (avoid state to prevent loops)
  const prevTimeRef = useRef<number>(0);
  const triggeredIdsRef = useRef<Set<string>>(new Set());
  const pauseTriggeredRef = useRef<Set<string>>(new Set());
  const prevPhaseIndexRef = useRef<number>(-1);

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
          const newTime = mainAudioRef.current.currentTime;
          setCurrentTime(newTime);
          // C06: Throttled log (every 1s in dev)
          if (process.env.NODE_ENV === 'development' && Math.floor(newTime) !== Math.floor(currentTime)) {
            console.log(`[V7Player] currentTime: ${newTime.toFixed(2)}s`);
          }
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
  }, [status, currentTime]);

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
          // C06: Log for instrumentation
          if (process.env.NODE_ENV === 'development') {
            console.log('[V7Player] phase change reset', { from: currentPhaseIndex, to: i });
          }
          setCurrentPhaseIndex(i);
        }
        break;
      }
    }

    // Report progress
    onProgress?.(progress);
  }, [currentTime, status, lessonData.phases, currentPhaseIndex, progress, onProgress]);

  // =========================================================================
  // C06: PHASE CHANGE RESET (prevent "ghost" micro-visuals)
  // =========================================================================
  useEffect(() => {
    if (currentPhaseIndex !== prevPhaseIndexRef.current) {
      triggeredIdsRef.current = new Set();
      pauseTriggeredRef.current = new Set();
      prevTimeRef.current = currentTime;
      prevPhaseIndexRef.current = currentPhaseIndex;
      setActiveMicroVisuals([]);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[V7Player] phase reset triggered', { phaseIndex: currentPhaseIndex });
      }
    }
  }, [currentPhaseIndex, currentTime]);

  // =========================================================================
  // C06: showTimeByTargetId - Map anchorActions[show].targetId → keywordTime
  // =========================================================================
  const showTimeByTargetId = useMemo(() => {
    const map = new Map<string, number>();
    if (!currentPhase?.anchorActions) return map;
    
    for (const aa of currentPhase.anchorActions) {
      if (aa.type === 'show' && aa.targetId && typeof aa.keywordTime === 'number') {
        map.set(aa.targetId, aa.keywordTime);
      }
    }
    return map;
  }, [currentPhase?.anchorActions]);

  // =========================================================================
  // C06: Sticky type helper (persist until phase ends)
  // =========================================================================
  const isStickyType = (type: string) =>
    type === 'letter-reveal' || 
    type === 'card-reveal' || 
    type === 'text-highlight' || 
    type === 'highlight';

  // =========================================================================
  // C06: CROSSING DETECTION for show actions
  // =========================================================================
  useEffect(() => {
    if (!currentPhase) return;
    if (status !== 'playing') {
      prevTimeRef.current = currentTime;
      return;
    }

    const prevTime = prevTimeRef.current;

    // C06: SEEK BACKWARDS - Reset triggers and recompute
    if (currentTime < prevTime) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[V7Player] seek backwards recompute', { prevTime: prevTime.toFixed(2), currentTime: currentTime.toFixed(2) });
      }
      triggeredIdsRef.current = new Set();
      
      // Reprocess all shows <= currentTime
      for (const [targetId, t] of showTimeByTargetId.entries()) {
        if (t <= currentTime) {
          triggeredIdsRef.current.add(targetId);
        }
      }
      prevTimeRef.current = currentTime;
      return;
    }

    // C06: PLAY FORWARD - Crossing detection
    for (const [targetId, t] of showTimeByTargetId.entries()) {
      const crossed = prevTime < t && currentTime >= t;
      if (crossed && !triggeredIdsRef.current.has(targetId)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[V7Player] show crossed', { 
            phaseId: currentPhase.id, 
            targetId, 
            t: t.toFixed(2), 
            prevTime: prevTime.toFixed(2), 
            currentTime: currentTime.toFixed(2) 
          });
        }
        triggeredIdsRef.current.add(targetId);
      }
    }

    prevTimeRef.current = currentTime;
  }, [currentTime, status, currentPhase, showTimeByTargetId]);

  // =========================================================================
  // C06: COMPUTE ACTIVE MICRO-VISUALS (C06 Compliant)
  // =========================================================================
  useEffect(() => {
    if (!currentPhase?.microVisuals?.length) {
      setActiveMicroVisuals([]);
      return;
    }

    // Helper: get show time (C06: anchorActions | fallback: legacy triggerTime)
    const getShowTime = (mv: V7MicroVisual): number | null => {
      // C06: Primary source = anchorActions
      const anchorTime = showTimeByTargetId.get(mv.id);
      if (typeof anchorTime === 'number') return anchorTime;
      
      // Fallback for legacy lessons (compatibility)
      if (typeof mv.triggerTime === 'number') return mv.triggerTime;
      
      return null;
    };

    const active = currentPhase.microVisuals.filter(mv => {
      // C06: Only show if trigger was fired
      if (!triggeredIdsRef.current.has(mv.id)) return false;
      
      const showTime = getShowTime(mv);
      if (showTime === null) return false;
      
      // Sticky types: persist until phase ends
      if (isStickyType(mv.type)) {
        return currentTime >= showTime;
      }
      
      // Timed types: respect duration
      const endTime = showTime + (typeof mv.duration === 'number' ? mv.duration : 0);
      return currentTime >= showTime && currentTime < endTime;
    });

    setActiveMicroVisuals(active);
  }, [currentTime, currentPhase, showTimeByTargetId, isStickyType]);

  // =========================================================================
  // C07 Base: ANCHOR ACTIONS - PAUSE (Crossing Detection)
  // =========================================================================
  useEffect(() => {
    if (status !== 'playing' || !currentPhase?.anchorActions) return;

    const prevTime = prevTimeRef.current;

    for (const action of currentPhase.anchorActions) {
      if (action.type === 'pause' && action.id && typeof action.keywordTime === 'number') {
        // C07: Crossing detection (idempotent)
        const crossed = prevTime < action.keywordTime && currentTime >= action.keywordTime;
        
        if (crossed && !pauseTriggeredRef.current.has(action.id)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[V7Player] pause crossed', { 
              phaseId: currentPhase.id,
              actionId: action.id,
              keyword: action.keyword, 
              keywordTime: action.keywordTime?.toFixed(2),
              currentTime: currentTime.toFixed(2)
            });
            console.log('[V7Player] entering waiting-interaction...');
          }
          
          pauseTriggeredRef.current.add(action.id);
          mainAudioRef.current?.pause();
          setStatus('waiting-interaction');
          break;
        }
      }
    }
  }, [currentTime, status, currentPhase]);

  // TODO (C07): Fallback for interaction/playground phases without pause action
  // If phase.type === 'interaction' || 'playground' and no pause actions:
  // Auto-pause at startTime + 0.1s until user interaction

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
