// V7PhaseController - Manages phase/scene synchronization with audio
// Central controller for the cinematic experience
// ✅ V7-v2: Suporta audioBehavior, timeout, e configurações por interação

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { InteractionState, SoundEffectType } from '../useV7AudioManager';

export interface V7SceneContent {
  // Basic text fields
  mainText?: string;
  subtitle?: string;
  number?: string;
  secondaryNumber?: string; // "2%" - contrast number for dramatic scenes
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

// ✅ V7-v2: Contextual audio loop during interactions
export interface V7ContextualLoop {
  triggerAfter: number;  // Seconds after interaction starts
  text: string;          // Text to speak (TTS) or audio to play
  volume: number;        // Volume level (0-1)
  loop?: boolean;        // Whether to loop the audio
}

// ✅ V7-v2: Audio behavior configuration per interaction
export interface V7AudioBehavior {
  onStart: 'pause' | 'fadeToBackground' | 'continue' | 'switch';
  duringInteraction: {
    mainVolume: number;      // Main narration volume (0-1)
    ambientVolume: number;   // Ambient audio volume (0-1)
    contextualLoops?: V7ContextualLoop[];
  };
  onComplete: 'resume' | 'fadeIn' | 'next';
}

// ✅ V7-v2: Timeout configuration for progressive hints
export interface V7TimeoutConfig {
  soft: number;          // First hint (seconds)
  medium: number;        // Second hint (seconds)
  hard: number;          // Auto-action (seconds)
  hints: string[];       // Hint messages [soft, medium, hard]
  autoAction?: 'skip' | 'selectDefault' | 'continue';
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

  // ✅ Anchor Actions: Flexible keyword-based synchronization (V5-inspired)
  // Supports multiple action types: pause, resume, show, hide, highlight, trigger
  anchorActions?: import('../useAnchorText').AnchorAction[];
  // Legacy: pauseKeywords (will be converted to anchorActions)
  pauseKeywords?: string[];
  // Legacy: resumeKeywords
  resumeKeywords?: string[];

  // ✅ V7-v2: New interaction configuration fields
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
}

// ✅ V7-v2: Sound effects configuration
export interface V7SoundEffectsConfig {
  click?: string;      // Path to click sound
  select?: string;     // Path to select sound
  success?: string;    // Path to success sound
  error?: string;      // Path to error sound
  hint?: string;       // Path to hint sound
  timeout?: string;    // Path to timeout sound
  whoosh?: string;     // Path to whoosh/transition sound
  reveal?: string;     // Path to reveal sound
}

// ✅ V7-v2: Audio configuration
export interface V7AudioConfig {
  mainAudioUrl?: string;           // Main narration audio
  ambientAudioUrl?: string;        // Background ambient audio
  soundEffects?: V7SoundEffectsConfig;
}

// ✅ V7-v2: Fallback configuration
export interface V7FallbacksConfig {
  noWordTimestamps?: {
    pauseAfterSeconds: number;    // When to pause if no word sync
    pauseAfterProgress: number;   // Or pause after this % of phase
  };
  audioLoadError?: 'continue' | 'retry' | 'showError';
}

// ✅ V7-v2: Global anchor points (alternative to per-phase anchorActions)
export interface V7AnchorPoint {
  id: string;
  keyword: string;
  phaseId: string;           // Which phase this anchor belongs to
  action: 'pause' | 'show' | 'highlight' | 'trigger';
  targetId?: string;
  once?: boolean;
}

export interface V7LessonScript {
  id: string;
  title: string;
  totalDuration: number;
  phases: V7Phase[];
  audioUrl?: string;
  wordTimestamps?: { word: string; start: number; end: number }[];

  // ✅ V7-v2: New lesson-level configuration
  audioConfig?: V7AudioConfig;
  fallbacks?: V7FallbacksConfig;
  anchorPoints?: V7AnchorPoint[];
}

interface UsePhaseControllerProps {
  script: V7LessonScript;
  currentTime: number;
  isPlaying: boolean;
  hasAudio?: boolean; // Whether audio is available
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
  internalTime: number; // For debugging
}

export function usePhaseController({
  script,
  currentTime,
  isPlaying,
  hasAudio = true,
}: UsePhaseControllerProps): UsePhaseControllerReturn {
  const [manualPhaseIndex, setManualPhaseIndex] = useState<number | null>(null);

  // FALLBACK TIMER: Internal timer when no audio is available
  const [internalTime, setInternalTime] = useState(0);
  const [isInternalTimerActive, setIsInternalTimerActive] = useState(false);

  // Activate internal timer when no audio and isPlaying
  useEffect(() => {
    if (!hasAudio && isPlaying && !isInternalTimerActive) {
      setIsInternalTimerActive(true);
    }
  }, [hasAudio, isPlaying, isInternalTimerActive]);

  // Internal timer tick - advances time every 100ms
  useEffect(() => {
    if (!isInternalTimerActive || !isPlaying) return;

    const interval = setInterval(() => {
      setInternalTime(prev => {
        const newTime = prev + 0.1;
        // Stop at end of script
        if (newTime >= script.totalDuration) {
          setIsInternalTimerActive(false);
          return script.totalDuration;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isInternalTimerActive, isPlaying, script.totalDuration]);

  // Reset internal timer when phase changes manually
  useEffect(() => {
    if (manualPhaseIndex !== null && !hasAudio) {
      const phase = script.phases[manualPhaseIndex];
      if (phase) {
        setInternalTime(phase.startTime);
      }
    }
  }, [manualPhaseIndex, hasAudio, script.phases]);

  // Use internal time when no audio, otherwise use audio time
  const effectiveTime = hasAudio ? currentTime : internalTime;

  // Find current phase based on time (uses effectiveTime for fallback support)
  const currentPhaseIndex = useMemo(() => {
    if (manualPhaseIndex !== null) return manualPhaseIndex;

    const index = script.phases.findIndex(
      (phase) => effectiveTime >= phase.startTime && effectiveTime < phase.endTime
    );
    return index === -1 ? 0 : index;
  }, [script.phases, effectiveTime, manualPhaseIndex]);

  const currentPhase = script.phases[currentPhaseIndex] || null;

  // Find current scene within phase based on time (uses effectiveTime for fallback support)
  const currentSceneIndex = useMemo(() => {
    if (!currentPhase) return 0;

    const phaseElapsed = effectiveTime - currentPhase.startTime;
    let accumulatedTime = 0;

    for (let i = 0; i < currentPhase.scenes.length; i++) {
      const scene = currentPhase.scenes[i];
      const sceneDuration = scene.duration ||
        (currentPhase.endTime - currentPhase.startTime) / currentPhase.scenes.length;

      if (scene.startTime !== undefined) {
        if (effectiveTime >= scene.startTime) {
          // Check if this is the last matching scene
          const nextScene = currentPhase.scenes[i + 1];
          if (!nextScene || (nextScene.startTime && effectiveTime < nextScene.startTime)) {
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
  }, [currentPhase, effectiveTime]);

  const currentScene = currentPhase?.scenes[currentSceneIndex] || null;

  // Calculate overall progress (uses effectiveTime for fallback support)
  const progress = useMemo(() => {
    return (effectiveTime / script.totalDuration) * 100;
  }, [effectiveTime, script.totalDuration]);

  // Calculate phase progress (uses effectiveTime for fallback support)
  const phaseProgress = useMemo(() => {
    if (!currentPhase) return 0;
    const phaseDuration = currentPhase.endTime - currentPhase.startTime;
    const elapsed = effectiveTime - currentPhase.startTime;
    return Math.min(100, (elapsed / phaseDuration) * 100);
  }, [currentPhase, effectiveTime]);

  // Reset manual override ONLY when time naturally catches up to or passes the manual phase
  // This prevents the race condition where navigating forward gets reset by audio resuming
  useEffect(() => {
    if (manualPhaseIndex !== null && isPlaying) {
      const manualPhase = script.phases[manualPhaseIndex];
      if (manualPhase) {
        // Only clear manual override if time has PASSED the end of the manual phase
        // This allows forward navigation to stick until audio catches up
        if (effectiveTime >= manualPhase.endTime) {
          console.log(`[V7PhaseController] Time (${effectiveTime.toFixed(1)}s) passed manual phase end (${manualPhase.endTime.toFixed(1)}s), clearing override`);
          setManualPhaseIndex(null);
        }
        // If time is BEFORE the manual phase, keep the override (user navigated forward)
        // If time is WITHIN the manual phase, keep the override (correct)
      }
    }
  }, [effectiveTime, manualPhaseIndex, script.phases, isPlaying]);

  const goToPhase = useCallback((index: number) => {
    if (index >= 0 && index < script.phases.length) {
      setManualPhaseIndex(index);
      // Also update internal timer to match the new phase start
      const targetPhase = script.phases[index];
      if (targetPhase && !hasAudio) {
        setInternalTime(targetPhase.startTime);
      }
      console.log(`[V7PhaseController] Manual navigation to phase ${index} (${script.phases[index]?.type})`);
    }
  }, [script.phases, hasAudio]);

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
    internalTime: effectiveTime, // For debugging - shows which time source is being used
  };
}

export default usePhaseController;
