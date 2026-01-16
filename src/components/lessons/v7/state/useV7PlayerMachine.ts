// useV7PlayerMachine - React hook for the V7 Player State Machine
// ✅ Level 4: Provides a clean interface between React components and XState

import { useCallback, useEffect, useMemo } from 'react';
import { useMachine } from '@xstate/react';
import { v7PlayerMachine, V7PlayerEvent, V7PlayerContext } from './v7PlayerMachine';
import type { V7LessonScript, V7Phase } from '../cinematic/phases/V7PhaseController';

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface UseV7PlayerMachineReturn {
  // Current state
  state: string;
  isIdle: boolean;
  isLoading: boolean;
  isReady: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isExited: boolean;
  isInteractionLocked: boolean;
  isAnchorPaused: boolean;
  isPlayingFeedback: boolean;
  
  // Context data
  context: V7PlayerContext;
  currentPhase: V7Phase | null;
  currentPhaseIndex: number;
  currentSceneIndex: number;
  progress: number;
  phaseProgress: number;
  
  // Actions
  loadScript: (script: V7LessonScript) => void;
  onAudioLoaded: (duration: number) => void;
  onAudioError: (error: string) => void;
  onLoadingComplete: () => void;
  
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  updateTime: (time: number) => void;
  onAudioEnded: () => void;
  
  goToNextPhase: () => void;
  goToPreviousPhase: () => void;
  goToPhase: (index: number) => void;
  
  onAnchorPause: () => void;
  onAnchorResume: () => void;
  lockPhase: (index: number) => void;
  unlockPhase: () => void;
  
  onQuizComplete: (selectedIds: string[]) => void;
  onPlaygroundComplete: (result?: Record<string, unknown>) => void;
  onCTAChoice: (choice: 'negative' | 'positive') => void;
  onSecretRevealComplete: () => void;
  
  playFeedbackAudio: (url: string) => void;
  onFeedbackAudioEnded: () => void;
  onFeedbackAudioError: () => void;
  
  showControls: () => void;
  hideControls: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  triggerParticles: (color: 'cyan' | 'gold' | 'emerald' | 'purple') => void;
  onParticlesComplete: () => void;
  
  exit: () => void;
  
  // Raw machine access (for advanced use)
  send: (event: V7PlayerEvent) => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useV7PlayerMachine(): UseV7PlayerMachineReturn {
  const [state, send] = useMachine(v7PlayerMachine);
  
  // Get the state value as a string for easy checking
  const stateValue = state.value;
  
  // Memoized state checks using object shape matching
  const isIdle = state.matches('idle');
  const isLoading = state.matches('loading');
  const isReady = state.matches('ready');
  const isPlaying = state.matches('playing');
  const isPaused = state.matches('paused');
  const isCompleted = state.matches('completed');
  const isExited = state.matches('exited');
  
  // Check nested states using object shape
  const isInteractionLocked = state.matches({ playing: 'interactionLocked' });
  const isAnchorPaused = state.matches({ playing: 'anchorPaused' });
  const isPlayingFeedback = state.matches({ playing: { interactionLocked: 'playingFeedback' } });
  
  // Current phase from context
  const currentPhase = useMemo(() => {
    const script = state.context.scaledScript || state.context.script;
    if (!script) return null;
    return script.phases[state.context.currentPhaseIndex] || null;
  }, [state.context.scaledScript, state.context.script, state.context.currentPhaseIndex]);
  
  // Progress calculations
  const progress = useMemo(() => {
    const script = state.context.scaledScript || state.context.script;
    if (!script || script.totalDuration === 0) return 0;
    return (state.context.currentTime / script.totalDuration) * 100;
  }, [state.context.scaledScript, state.context.script, state.context.currentTime]);
  
  const phaseProgress = useMemo(() => {
    if (!currentPhase) return 0;
    const phaseDuration = currentPhase.endTime - currentPhase.startTime;
    if (phaseDuration === 0) return 0;
    const elapsed = state.context.currentTime - currentPhase.startTime;
    return Math.min(100, Math.max(0, (elapsed / phaseDuration) * 100));
  }, [currentPhase, state.context.currentTime]);
  
  // ========================================
  // ACTION CALLBACKS
  // ========================================
  
  // Lifecycle
  const loadScript = useCallback((script: V7LessonScript) => {
    send({ type: 'LOAD_SCRIPT', script });
  }, [send]);
  
  const onAudioLoaded = useCallback((duration: number) => {
    send({ type: 'AUDIO_LOADED', duration });
  }, [send]);
  
  const onAudioError = useCallback((error: string) => {
    send({ type: 'AUDIO_ERROR', error });
  }, [send]);
  
  const onLoadingComplete = useCallback(() => {
    send({ type: 'LOADING_COMPLETE' });
  }, [send]);
  
  // Playback
  const play = useCallback(() => {
    send({ type: 'PLAY' });
  }, [send]);
  
  const pause = useCallback(() => {
    send({ type: 'PAUSE' });
  }, [send]);
  
  const togglePlayPause = useCallback(() => {
    send({ type: 'TOGGLE_PLAY_PAUSE' });
  }, [send]);
  
  const seek = useCallback((time: number) => {
    send({ type: 'SEEK', time });
  }, [send]);
  
  const updateTime = useCallback((time: number) => {
    send({ type: 'TIME_UPDATE', time });
  }, [send]);
  
  const onAudioEnded = useCallback(() => {
    send({ type: 'AUDIO_ENDED' });
  }, [send]);
  
  // Navigation
  const goToNextPhase = useCallback(() => {
    send({ type: 'GO_TO_NEXT_PHASE' });
  }, [send]);
  
  const goToPreviousPhase = useCallback(() => {
    send({ type: 'GO_TO_PREVIOUS_PHASE' });
  }, [send]);
  
  const goToPhase = useCallback((index: number) => {
    send({ type: 'GO_TO_PHASE', index });
  }, [send]);
  
  // Anchor events
  const onAnchorPause = useCallback(() => {
    send({ type: 'ANCHOR_PAUSE' });
  }, [send]);
  
  const onAnchorResume = useCallback(() => {
    send({ type: 'ANCHOR_RESUME' });
  }, [send]);
  
  const lockPhase = useCallback((index: number) => {
    send({ type: 'LOCK_PHASE', index });
  }, [send]);
  
  const unlockPhase = useCallback(() => {
    send({ type: 'UNLOCK_PHASE' });
  }, [send]);
  
  // Interaction completion
  const onQuizComplete = useCallback((selectedIds: string[]) => {
    send({ type: 'QUIZ_COMPLETE', selectedIds });
  }, [send]);
  
  const onPlaygroundComplete = useCallback((result?: Record<string, unknown>) => {
    send({ type: 'PLAYGROUND_COMPLETE', result });
  }, [send]);
  
  const onCTAChoice = useCallback((choice: 'negative' | 'positive') => {
    send({ type: 'CTA_CHOICE', choice });
  }, [send]);
  
  const onSecretRevealComplete = useCallback(() => {
    send({ type: 'SECRET_REVEAL_COMPLETE' });
  }, [send]);
  
  // Feedback audio
  const playFeedbackAudio = useCallback((url: string) => {
    send({ type: 'PLAY_FEEDBACK_AUDIO', url });
  }, [send]);
  
  const onFeedbackAudioEnded = useCallback(() => {
    send({ type: 'FEEDBACK_AUDIO_ENDED' });
  }, [send]);
  
  const onFeedbackAudioError = useCallback(() => {
    send({ type: 'FEEDBACK_AUDIO_ERROR' });
  }, [send]);
  
  // UI controls
  const showControlsFn = useCallback(() => {
    send({ type: 'SHOW_CONTROLS' });
  }, [send]);
  
  const hideControlsFn = useCallback(() => {
    send({ type: 'HIDE_CONTROLS' });
  }, [send]);
  
  const toggleMute = useCallback(() => {
    send({ type: 'TOGGLE_MUTE' });
  }, [send]);
  
  const setVolume = useCallback((volume: number) => {
    send({ type: 'SET_VOLUME', volume });
  }, [send]);
  
  const triggerParticles = useCallback((color: 'cyan' | 'gold' | 'emerald' | 'purple') => {
    send({ type: 'TRIGGER_PARTICLES', color });
  }, [send]);
  
  const onParticlesComplete = useCallback(() => {
    send({ type: 'PARTICLES_COMPLETE' });
  }, [send]);
  
  // Exit
  const exit = useCallback(() => {
    send({ type: 'EXIT' });
  }, [send]);
  
  // Convert state value to string representation for debugging
  const stateString = typeof stateValue === 'string' 
    ? stateValue 
    : JSON.stringify(stateValue);
  
  return {
    // State
    state: stateString,
    isIdle,
    isLoading,
    isReady,
    isPlaying,
    isPaused,
    isCompleted,
    isExited,
    isInteractionLocked,
    isAnchorPaused,
    isPlayingFeedback,
    
    // Context
    context: state.context,
    currentPhase,
    currentPhaseIndex: state.context.currentPhaseIndex,
    currentSceneIndex: state.context.currentSceneIndex,
    progress,
    phaseProgress,
    
    // Actions
    loadScript,
    onAudioLoaded,
    onAudioError,
    onLoadingComplete,
    
    play,
    pause,
    togglePlayPause,
    seek,
    updateTime,
    onAudioEnded,
    
    goToNextPhase,
    goToPreviousPhase,
    goToPhase,
    
    onAnchorPause,
    onAnchorResume,
    lockPhase,
    unlockPhase,
    
    onQuizComplete,
    onPlaygroundComplete,
    onCTAChoice,
    onSecretRevealComplete,
    
    playFeedbackAudio,
    onFeedbackAudioEnded,
    onFeedbackAudioError,
    
    showControls: showControlsFn,
    hideControls: hideControlsFn,
    toggleMute,
    setVolume,
    triggerParticles,
    onParticlesComplete,
    
    exit,
    
    send,
  };
}
