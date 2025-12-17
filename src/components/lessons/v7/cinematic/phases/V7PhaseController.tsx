// V7PhaseController - Manages phase/scene synchronization with audio
// Central controller for the cinematic experience

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface V7SceneContent {
  // Basic text fields
  mainText?: string;
  subtitle?: string;
  number?: string;
  highlightWord?: string;
  title?: string;
  hookQuestion?: string; // "VOCÊ SABIA?" - teaser question for dramatic scenes
  
  // Lists and collections
  items?: any[];
  options?: any[];
  metrics?: any[];
  hints?: string[];
  successCriteria?: string[];
  
  // Playground comparison fields
  challenge?: string;
  context?: string;
  amateurPrompt?: string;
  professionalPrompt?: string;
  amateurResult?: {
    title?: string;
    content?: string;
    score?: number;
    maxScore?: number;
    verdict?: string;
  } | string;
  professionalResult?: {
    title?: string;
    content?: string;
    score?: number;
    maxScore?: number;
    verdict?: string;
  } | string;
  amateurScore?: number;
  professionalScore?: number;
  
  // Quiz/Interaction fields
  correctFeedback?: string;
  incorrectFeedback?: string;
  revealGoodMessage?: string;
  revealBadMessage?: string;
  
  // Additional context
  narration?: string;
  explanation?: string;
  tip?: string;
  warning?: string;
  ctaTitle?: string;
  ctaOptions?: any[];

  // Animation/Visual effect properties
  backgroundColor?: string;
  aspectRatio?: string;
  glowEffect?: boolean;
  glowColor?: string;
  countUpAnimation?: boolean | string;
  particleType?: string;
  particleColor?: string;
  letterByLetter?: boolean;
  cameraZoom?: boolean;
  cameraShake?: boolean;
  particleEffect?: string;
  splitPosition?: number;
  dividerAnimation?: boolean;
  pulseEffect?: boolean;
  pulseColor?: string;
  iconBounce?: boolean;
  staggerChildren?: boolean | number;
  staggerDelay?: number;
  highlightOnHover?: boolean;
  scaleOnHover?: boolean | number;
  particles?: boolean | string;
  confettiOnSelect?: boolean;
  glitchEffect?: boolean;
  typewriterSpeed?: number;
  typewriterHighlight?: boolean;
  cursor?: boolean;
  raceAnimation?: boolean;
  victoryAnimation?: boolean;
  winnerEffect?: boolean | string;
  pulseAnimation?: boolean;
  scoreRevealDelay?: number;
  scoreColor?: string;
}

export interface V7Scene {
  id: string;
  startWord?: number; // Word index to start this scene
  startTime?: number; // Time in seconds to start
  duration?: number;  // Duration in seconds
  type: 'text-reveal' | 'number-reveal' | 'split-screen' | 'comparison' | 
        'quiz' | 'result' | 'playground' | 'cards-reveal' | 'cta' | 'gamification' |
        'letterbox' | 'particle-effect' | 'quiz-intro' | 'quiz-question' | 'quiz-options' | 
        'quiz-result' | 'playground-intro' | 'playground-code' | 'playground-result';
  content: V7SceneContent;
  animation: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'explode' | 'count-up' | 
             'letter-by-letter' | 'scale-up' | 'particle-burst' | 'zoom-in' | 'letterbox' | 'glitch';
}

export interface V7Phase {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  type: 'loading' | 'dramatic' | 'narrative' | 'interaction' | 'playground' | 'revelation' | 'gamification';
  scenes: V7Scene[];
  mood?: 'danger' | 'success' | 'warning' | 'neutral' | 'dramatic';
  autoAdvance?: boolean;
}

export interface V7LessonScript {
  id: string;
  title: string;
  totalDuration: number;
  phases: V7Phase[];
  audioUrl?: string;
  wordTimestamps?: { word: string; start: number; end: number }[];
}

interface UsePhaseControllerProps {
  script: V7LessonScript;
  currentTime: number;
  isPlaying: boolean;
}

interface UsePhaseControllerReturn {
  currentPhase: V7Phase | null;
  currentPhaseIndex: number;
  currentScene: V7Scene | null;
  currentSceneIndex: number;
  progress: number;
  phaseProgress: number;
  goToPhase: (index: number) => void;
  goToScene: (phaseIndex: number, sceneIndex: number) => void;
}

export function usePhaseController({
  script,
  currentTime,
  isPlaying,
}: UsePhaseControllerProps): UsePhaseControllerReturn {
  const [manualPhaseIndex, setManualPhaseIndex] = useState<number | null>(null);

  // Find current phase based on time
  const currentPhaseIndex = useMemo(() => {
    if (manualPhaseIndex !== null) return manualPhaseIndex;
    
    const index = script.phases.findIndex(
      (phase) => currentTime >= phase.startTime && currentTime < phase.endTime
    );
    return index === -1 ? 0 : index;
  }, [script.phases, currentTime, manualPhaseIndex]);

  const currentPhase = script.phases[currentPhaseIndex] || null;

  // Find current scene within phase based on time
  const currentSceneIndex = useMemo(() => {
    if (!currentPhase) return 0;
    
    const phaseElapsed = currentTime - currentPhase.startTime;
    let accumulatedTime = 0;

    for (let i = 0; i < currentPhase.scenes.length; i++) {
      const scene = currentPhase.scenes[i];
      const sceneDuration = scene.duration || 
        (currentPhase.endTime - currentPhase.startTime) / currentPhase.scenes.length;
      
      if (scene.startTime !== undefined) {
        if (currentTime >= scene.startTime) {
          // Check if this is the last matching scene
          const nextScene = currentPhase.scenes[i + 1];
          if (!nextScene || (nextScene.startTime && currentTime < nextScene.startTime)) {
            return i;
          }
        }
      } else {
        if (phaseElapsed < accumulatedTime + sceneDuration) {
          return i;
        }
        accumulatedTime += sceneDuration;
      }
    }

    return currentPhase.scenes.length - 1;
  }, [currentPhase, currentTime]);

  const currentScene = currentPhase?.scenes[currentSceneIndex] || null;

  // Calculate overall progress
  const progress = useMemo(() => {
    return (currentTime / script.totalDuration) * 100;
  }, [currentTime, script.totalDuration]);

  // Calculate phase progress
  const phaseProgress = useMemo(() => {
    if (!currentPhase) return 0;
    const phaseDuration = currentPhase.endTime - currentPhase.startTime;
    const elapsed = currentTime - currentPhase.startTime;
    return Math.min(100, (elapsed / phaseDuration) * 100);
  }, [currentPhase, currentTime]);

  // Reset manual override when time changes significantly
  useEffect(() => {
    if (manualPhaseIndex !== null && isPlaying) {
      const expectedPhase = script.phases.findIndex(
        (phase) => currentTime >= phase.startTime && currentTime < phase.endTime
      );
      if (expectedPhase !== -1 && expectedPhase !== manualPhaseIndex) {
        // Time has moved to a different phase, clear manual override
        setManualPhaseIndex(null);
      }
    }
  }, [currentTime, manualPhaseIndex, script.phases, isPlaying]);

  const goToPhase = useCallback((index: number) => {
    if (index >= 0 && index < script.phases.length) {
      setManualPhaseIndex(index);
    }
  }, [script.phases.length]);

  const goToScene = useCallback((phaseIndex: number, sceneIndex: number) => {
    if (phaseIndex >= 0 && phaseIndex < script.phases.length) {
      setManualPhaseIndex(phaseIndex);
      // Scene navigation is handled by the time-based logic
    }
  }, [script.phases.length]);

  return {
    currentPhase,
    currentPhaseIndex,
    currentScene,
    currentSceneIndex,
    progress,
    phaseProgress,
    goToPhase,
    goToScene,
  };
}

export default usePhaseController;
