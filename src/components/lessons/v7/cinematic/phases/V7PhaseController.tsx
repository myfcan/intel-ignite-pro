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
  
  // ✅ V7-v3: Split-screen comparison cards
  leftCard?: {
    icon?: string;
    label?: string;
    value?: string;
    details?: string[];
    isPositive?: boolean;
  };
  rightCard?: {
    icon?: string;
    label?: string;
    value?: string;
    details?: string[];
    isPositive?: boolean;
  };
  
  // ✅ V7-v3: Gamification fields
  achievement?: string;
  xp?: number;
  
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
  pauseKeyword?: string; // ✅ V7-v4: Keyword to pause narration

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

// ✅ V7-vv-v2: MicroVisual interface for overlay rendering
export interface V7MicroVisual {
  id: string;
  anchorText: string;
  triggerTime: number;
  type: 'icon' | 'text' | 'number' | 'image' | 'badge' | 'highlight';
  content: {
    value?: string;
    icon?: string;
    color?: string;
    animation?: string;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    description?: string;
  };
  duration: number;
}

export interface V7Phase {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  type: 'loading' | 'dramatic' | 'narrative' | 'comparison' | 'interaction' | 'playground' | 'revelation' | 'gamification' | 'secret-reveal';
  scenes: V7Scene[];
  mood?: 'danger' | 'success' | 'warning' | 'neutral' | 'dramatic';
  autoAdvance?: boolean;

  // ✅ V7-vv-v2: MicroVisuals for overlay rendering
  microVisuals?: V7MicroVisual[];

  // ✅ V7.1: ANCHOR-BASED PHASE TRANSITION
  // When set, phase only becomes active AFTER this word is spoken in the narration
  // This replaces time-based transitions with word-based transitions
  enterAnchor?: string;

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

  // ✅ V7-v4: Interaction data for secret-reveal phase
  interaction?: Record<string, unknown>;
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

// ✅ V7.1: NO FALLBACKS - AnchorText is the ONLY sync mechanism
// Fallback config has been removed. Interactive phases MUST have:
// 1. wordTimestamps (from ElevenLabs TTS)
// 2. anchorActions or pauseKeywords (to define when to pause)
// Without these, the phase will play through without pausing.

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

  // ✅ V7.1: Lesson-level configuration (NO FALLBACKS - AnchorText only)
  audioConfig?: V7AudioConfig;
  anchorPoints?: V7AnchorPoint[];
}

interface UsePhaseControllerProps {
  script: V7LessonScript;
  currentTime: number;
  isPlaying: boolean;
  hasAudio?: boolean; // Whether audio is available
  wordTimestamps?: { word: string; start: number; end: number }[]; // ✅ V7.1: For anchor-based transitions
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
  wordTimestamps = [],
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
  const rawTime = hasAudio ? currentTime : internalTime;

  // ✅ V7-v28 FIX: Do NOT add +3s offset here!
  // The phases now use timestamps directly from DB (starting at 0), so audio time maps 1:1
  // The loading phase (0-3s) is handled separately and doesn't need offset
  const effectiveTime = rawTime;

  // ✅ V7.1: Helper to check if an anchor word has been spoken
  const hasAnchorBeenSpoken = useCallback((anchorWord: string, beforeTime: number): boolean => {
    if (!wordTimestamps || wordTimestamps.length === 0) return true; // No timestamps = allow transition

    const normalizedAnchor = anchorWord.toLowerCase().replace(/[.,!?;:]/g, '');

    for (const ts of wordTimestamps) {
      const normalizedWord = ts.word.toLowerCase().replace(/[.,!?;:]/g, '');
      if (normalizedWord === normalizedAnchor || normalizedWord.includes(normalizedAnchor)) {
        // Anchor word found - check if it has been spoken (timestamp passed)
        return beforeTime >= ts.end;
      }
    }

    // Anchor word not found in timestamps - fallback to time-based
    console.warn(`[V7PhaseController] ⚠️ enterAnchor "${anchorWord}" not found in wordTimestamps`);
    return true;
  }, [wordTimestamps]);

  // ✅ V7.1: Find current phase based on ANCHOR or TIME
  // If a phase has enterAnchor, it only becomes active after that word is spoken
  const currentPhaseIndex = useMemo(() => {
    // ✅ V7.1 FIX: Even with manualPhaseIndex, RESPECT enterAnchor!
    // If the target phase has enterAnchor and it hasn't been spoken, stay on previous phase
    if (manualPhaseIndex !== null) {
      const manualPhase = script.phases[manualPhaseIndex];
      if (manualPhase?.enterAnchor) {
        if (!hasAnchorBeenSpoken(manualPhase.enterAnchor, effectiveTime)) {
          // ✅ Anchor not spoken yet - stay on PREVIOUS phase (or 0 if first)
          const previousIndex = Math.max(0, manualPhaseIndex - 1);
          console.log(`[V7PhaseController] ⏳ enterAnchor "${manualPhase.enterAnchor}" not yet spoken - staying on phase ${previousIndex}`);
          return previousIndex;
        }
      }
      return manualPhaseIndex;
    }

    // ✅ V7-v29 FIX: Find the BEST matching phase, handling GAPS properly
    // Strategy: Find the last phase whose startTime we've passed
    // This prevents looping back to phase 0 when in a gap
    let bestIndex = 0;

    for (let i = 0; i < script.phases.length; i++) {
      const phase = script.phases[i];

      // Check if this phase should be active
      if (phase.enterAnchor) {
        // ✅ ANCHOR-BASED: Phase only active after enterAnchor word is spoken
        if (hasAnchorBeenSpoken(phase.enterAnchor, effectiveTime)) {
          bestIndex = i;
          console.log(`[V7PhaseController] 🎯 Phase "${phase.id}" activated by enterAnchor "${phase.enterAnchor}"`);
        }
      } else {
        // ✅ V7-v29 FIX: Use >= startTime to find which phase we're in or past
        // If time is WITHIN the phase (startTime <= time < endTime), it's active
        // If time is AFTER the phase (time >= endTime), keep looking for later phases
        // If time is BEFORE the phase (time < startTime), stop - we found our phase

        if (effectiveTime >= phase.startTime) {
          // We've passed or are at this phase's start
          if (effectiveTime < phase.endTime) {
            // We're WITHIN this phase - this is the active one
            bestIndex = i;
          } else {
            // We're PAST this phase - keep it as candidate (handles gaps)
            // If the next phase hasn't started yet, this is still the best match
            bestIndex = i;
          }
        } else {
          // Time is BEFORE this phase's startTime
          // If we already have a bestIndex, stop searching
          // Otherwise this phase hasn't started yet and we stay on previous
          break;
        }
      }
    }

    // Log when we're in a gap
    const selectedPhase = script.phases[bestIndex];
    if (selectedPhase && effectiveTime >= selectedPhase.endTime) {
      const nextPhase = script.phases[bestIndex + 1];
      if (nextPhase && effectiveTime < nextPhase.startTime) {
        console.log(`[V7PhaseController] ⏳ In GAP between phase ${bestIndex} (ends ${selectedPhase.endTime.toFixed(1)}s) and phase ${bestIndex + 1} (starts ${nextPhase.startTime.toFixed(1)}s) - showing phase ${bestIndex}`);
      }
    }

    return bestIndex;
  }, [script.phases, effectiveTime, manualPhaseIndex, hasAnchorBeenSpoken]);

  const currentPhase = script.phases[currentPhaseIndex] || null;

  // ✅ V7-vv: Ensure scenes array exists (V7-vv pipeline may not include scenes)
  const phaseScenes = currentPhase?.scenes || [];

  // Find current scene within phase based on time (uses effectiveTime for fallback support)
  const currentSceneIndex = useMemo(() => {
    if (!currentPhase || phaseScenes.length === 0) return 0;

    const phaseElapsed = effectiveTime - currentPhase.startTime;
    let accumulatedTime = 0;

    for (let i = 0; i < phaseScenes.length; i++) {
      const scene = phaseScenes[i];
      const sceneDuration = scene.duration ||
        (currentPhase.endTime - currentPhase.startTime) / phaseScenes.length;

      if (scene.startTime !== undefined) {
        if (effectiveTime >= scene.startTime) {
          // Check if this is the last matching scene
          const nextScene = phaseScenes[i + 1];
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

    return phaseScenes.length - 1;
  }, [currentPhase, phaseScenes, effectiveTime]);

  const currentScene = phaseScenes[currentSceneIndex] || null;

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
