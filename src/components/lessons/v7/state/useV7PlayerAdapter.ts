// useV7PlayerAdapter - Bridge between XState machine and legacy V7PhasePlayer
// ✅ Level 4: Gradual integration of state machine without breaking existing logic
// This adapter allows incremental migration from useState to XState

import { useCallback, useEffect, useRef } from 'react';
import { useV7PlayerMachine } from '../state/useV7PlayerMachine';
import type { V7LessonScript } from '../cinematic/phases/V7PhaseController';

interface UseV7PlayerAdapterProps {
  script: V7LessonScript;
  hasAudio: boolean;
  audioDuration: number;
  audioCurrentTime: number;
  audioIsPlaying: boolean;
  onComplete?: () => void;
  onExit?: () => void;
}

interface UseV7PlayerAdapterReturn {
  // State from machine
  machineState: string;
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isInteractionLocked: boolean;
  
  // Phase tracking (from machine context)
  currentPhaseIndex: number;
  lockedPhaseIndex: number | null;
  
  // UI state
  showControls: boolean;
  showTransitionParticles: boolean;
  transitionParticleColor: 'cyan' | 'gold' | 'emerald' | 'purple';
  
  // Interaction state
  interactionComplete: boolean;
  isNavigatingBack: boolean;
  
  // Actions (forward to machine)
  handleLoadingComplete: () => void;
  lockPhase: (index: number) => void;
  unlockPhase: () => void;
  setInteractionComplete: (value: boolean) => void;
  setIsNavigatingBack: (value: boolean) => void;
  handleQuizComplete: (selectedIds: string[]) => void;
  handlePlaygroundComplete: (result?: Record<string, unknown>) => void;
  handleSecretRevealComplete: () => void;
  handleCTAChoice: (choice: 'negative' | 'positive') => void;
  triggerParticles: (color: 'cyan' | 'gold' | 'emerald' | 'purple') => void;
  clearParticles: () => void;
  showControlsFn: () => void;
  hideControlsFn: () => void;
  goToNextPhase: () => void;
  goToPreviousPhase: () => void;
  goToPhase: (index: number) => void;
  exit: () => void;
  
  // Feedback audio
  playFeedbackAudio: (url: string) => void;
  onFeedbackAudioEnded: () => void;
  onFeedbackAudioError: () => void;
  isPlayingFeedbackAudio: boolean;
  feedbackAudioUrl: string | null;
}

/**
 * Adapter hook that bridges the XState machine with the legacy V7PhasePlayer.
 * 
 * This allows gradual migration:
 * 1. The machine handles core state transitions
 * 2. The adapter syncs audio state from external audio manager
 * 3. Legacy code can still use familiar patterns while machine ensures consistency
 */
export function useV7PlayerAdapter({
  script,
  hasAudio,
  audioDuration,
  audioCurrentTime,
  audioIsPlaying,
  onComplete,
  onExit,
}: UseV7PlayerAdapterProps): UseV7PlayerAdapterReturn {
  const machine = useV7PlayerMachine();
  const hasLoadedScript = useRef(false);
  const hasLoadedAudio = useRef(false);
  
  // Load script into machine on mount
  useEffect(() => {
    if (script && !hasLoadedScript.current) {
      machine.loadScript(script);
      hasLoadedScript.current = true;
    }
  }, [script, machine]);
  
  // Sync audio duration when available
  useEffect(() => {
    if (hasAudio && audioDuration > 0 && !hasLoadedAudio.current) {
      machine.onAudioLoaded(audioDuration);
      hasLoadedAudio.current = true;
    }
  }, [hasAudio, audioDuration, machine]);
  
  // Sync audio time updates
  useEffect(() => {
    if (audioIsPlaying) {
      machine.updateTime(audioCurrentTime);
    }
  }, [audioCurrentTime, audioIsPlaying, machine]);
  
  // Handle completion callback
  useEffect(() => {
    if (machine.isCompleted && onComplete) {
      onComplete();
    }
  }, [machine.isCompleted, onComplete]);
  
  // Handle exit callback
  useEffect(() => {
    if (machine.isExited && onExit) {
      onExit();
    }
  }, [machine.isExited, onExit]);
  
  // Wrapped actions that sync with machine
  const handleLoadingComplete = useCallback(() => {
    machine.onLoadingComplete();
    machine.play();
  }, [machine]);
  
  const lockPhase = useCallback((index: number) => {
    machine.lockPhase(index);
  }, [machine]);
  
  const unlockPhase = useCallback(() => {
    machine.unlockPhase();
  }, [machine]);
  
  // For backwards compatibility - machine handles this internally
  const setInteractionComplete = useCallback((value: boolean) => {
    if (value) {
      machine.unlockPhase();
    }
  }, [machine]);
  
  const setIsNavigatingBack = useCallback((value: boolean) => {
    // Machine tracks this internally via goToPreviousPhase
    // This is a no-op for compatibility
    console.log('[V7PlayerAdapter] setIsNavigatingBack:', value);
  }, []);
  
  const handleQuizComplete = useCallback((selectedIds: string[]) => {
    console.log('[V7PlayerAdapter] Quiz complete:', selectedIds);
    machine.onQuizComplete(selectedIds);
  }, [machine]);
  
  const handlePlaygroundComplete = useCallback((result?: Record<string, unknown>) => {
    console.log('[V7PlayerAdapter] Playground complete');
    machine.onPlaygroundComplete(result);
  }, [machine]);
  
  const handleSecretRevealComplete = useCallback(() => {
    console.log('[V7PlayerAdapter] Secret reveal complete');
    machine.onSecretRevealComplete();
  }, [machine]);
  
  const handleCTAChoice = useCallback((choice: 'negative' | 'positive') => {
    console.log('[V7PlayerAdapter] CTA choice:', choice);
    machine.onCTAChoice(choice);
  }, [machine]);
  
  const triggerParticles = useCallback((color: 'cyan' | 'gold' | 'emerald' | 'purple') => {
    machine.triggerParticles(color);
    // Auto-clear after animation
    setTimeout(() => machine.onParticlesComplete(), 1500);
  }, [machine]);
  
  return {
    // State
    machineState: machine.state,
    isLoading: machine.isLoading,
    isPlaying: machine.isPlaying,
    isPaused: machine.isPaused,
    isCompleted: machine.isCompleted,
    isInteractionLocked: machine.isInteractionLocked,
    
    // Phase tracking
    currentPhaseIndex: machine.currentPhaseIndex,
    lockedPhaseIndex: machine.context.lockedPhaseIndex,
    
    // UI state
    showControls: machine.context.showControls,
    showTransitionParticles: machine.context.showTransitionParticles,
    transitionParticleColor: machine.context.transitionParticleColor,
    
    // Interaction state
    interactionComplete: machine.context.interactionComplete,
    isNavigatingBack: machine.context.isNavigatingBack,
    
    // Actions
    handleLoadingComplete,
    lockPhase,
    unlockPhase,
    setInteractionComplete,
    setIsNavigatingBack,
    handleQuizComplete,
    handlePlaygroundComplete,
    handleSecretRevealComplete,
    handleCTAChoice,
    triggerParticles,
    clearParticles: machine.onParticlesComplete,
    showControlsFn: machine.showControls,
    hideControlsFn: machine.hideControls,
    goToNextPhase: machine.goToNextPhase,
    goToPreviousPhase: machine.goToPreviousPhase,
    goToPhase: machine.goToPhase,
    exit: machine.exit,
    
    // Feedback audio
    playFeedbackAudio: machine.playFeedbackAudio,
    onFeedbackAudioEnded: machine.onFeedbackAudioEnded,
    onFeedbackAudioError: machine.onFeedbackAudioError,
    isPlayingFeedbackAudio: machine.context.isPlayingFeedbackAudio,
    feedbackAudioUrl: machine.context.feedbackAudioUrl,
  };
}
