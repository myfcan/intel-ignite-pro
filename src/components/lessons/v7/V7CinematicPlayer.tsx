// src/components/lessons/v7/V7CinematicPlayer.tsx
// Main player component for V7 Cinematic Lessons

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  V7CinematicLesson,
  V7PlayerState,
  CinematicAct,
  SyncPoint,
  InteractionPoint,
} from '@/types/v7-cinematic.types';
import { CinematicActRenderer } from './CinematicActRenderer';
import { V7Timeline } from './V7Timeline';
import { V7PlayerControls } from './V7PlayerControls';
import { V7AudioEngine } from './V7AudioEngine';
import { ParticlesBackground } from './ParticlesBackground';
import { V7QuizInteraction, QuizResult } from './V7QuizInteraction';
import { V7CodeChallenge, CodeChallengeResult } from './V7CodeChallenge';
import { V7InteractionFeedback } from './V7InteractionFeedback';
import { useV7Analytics } from '@/hooks/useV7Analytics';

interface V7CinematicPlayerProps {
  lesson: V7CinematicLesson;
  onComplete?: (results: V7PlayerState) => void;
  onProgress?: (progress: number) => void;
  autoPlay?: boolean;
}

export const V7CinematicPlayer = ({
  lesson,
  onComplete,
  onProgress,
  autoPlay = false,
}: V7CinematicPlayerProps) => {
  // ============================================================================
  // ALL HOOKS AT TOP (Rules of Hooks)
  // ============================================================================

  // Player state
  const [playerState, setPlayerState] = useState<V7PlayerState>({
    currentActId: null,
    currentTime: 0,
    isPlaying: false,
    isPaused: false,
    volume: 1,
    playbackRate: 1,
    completedActs: [],
    interactionResults: {},
    score: 0,
    xp: 0,
    achievements: [],
  });

  // Current act tracking
  const [currentAct, setCurrentAct] = useState<CinematicAct | null>(null);
  const [nextAct, setNextAct] = useState<CinematicAct | null>(null);

  // Interaction state
  const [showInteraction, setShowInteraction] = useState(false);
  const [currentInteraction, setCurrentInteraction] = useState<InteractionPoint | null>(null);
  const [feedbackState, setFeedbackState] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'partial';
    message: string;
    points?: number;
    xp?: number;
  } | null>(null);

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<string | null>(null);

  // Refs for timing and audio
  const animationFrameRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Analytics hook
  const { trackEvent, trackMetric } = useV7Analytics(lesson.id);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Get current act based on currentTime
  const getCurrentActAtTime = useCallback(
    (time: number): CinematicAct | null => {
      return (
        lesson.cinematicFlow.acts.find(
          (act) => time >= act.startTime && time < act.startTime + act.duration
        ) || null
      );
    },
    [lesson.cinematicFlow.acts]
  );

  // Get sync points for current time
  const getCurrentSyncPoints = useCallback(
    (time: number): SyncPoint[] => {
      return lesson.audioTrack.syncPoints.filter(
        (sp) => Math.abs(sp.timestamp - time) < 0.1
      );
    },
    [lesson.audioTrack.syncPoints]
  );

  // Calculate progress percentage
  const progress = useMemo(() => {
    return (playerState.currentTime / lesson.duration) * 100;
  }, [playerState.currentTime, lesson.duration]);

  // ============================================================================
  // PLAYBACK CONTROLS
  // ============================================================================

  const play = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
    if (audioRef.current) {
      audioRef.current.play();
    }
    startTimeRef.current = performance.now() - playerState.currentTime * 1000;
    trackEvent({ type: 'act-start', timestamp: Date.now(), data: { actId: currentAct?.id } });
  }, [playerState.currentTime, currentAct, trackEvent]);

  const pause = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    trackEvent({ type: 'pause', timestamp: Date.now(), data: { time: playerState.currentTime } });
  }, [playerState.currentTime, trackEvent]);

  const seek = useCallback(
    (time: number) => {
      const clampedTime = Math.max(0, Math.min(time, lesson.duration));
      setPlayerState((prev) => ({ ...prev, currentTime: clampedTime }));
      if (audioRef.current) {
        audioRef.current.currentTime = clampedTime;
      }
      startTimeRef.current = performance.now() - clampedTime * 1000;

      // Update current act
      const newAct = getCurrentActAtTime(clampedTime);
      if (newAct && newAct.id !== currentAct?.id) {
        setCurrentAct(newAct);
      }

      trackEvent({ type: 'seek', timestamp: Date.now(), data: { time: clampedTime } });
    },
    [lesson.duration, getCurrentActAtTime, currentAct, trackEvent]
  );

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(volume, 1));
    setPlayerState((prev) => ({ ...prev, volume: clampedVolume }));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlayerState((prev) => ({ ...prev, playbackRate: rate }));
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // ============================================================================
  // ACT TRANSITIONS
  // ============================================================================

  const transitionToAct = useCallback(
    (act: CinematicAct) => {
      setIsTransitioning(true);
      setTransitionType(act.transitions.in.type);

      // Find transition config
      const transitionConfig = lesson.cinematicFlow.transitions.find(
        (t) => t.toActId === act.id
      );

      const transitionDuration = transitionConfig?.duration || 500;

      setTimeout(() => {
        setCurrentAct(act);
        setPlayerState((prev) => ({
          ...prev,
          currentActId: act.id,
        }));
        setIsTransitioning(false);
        setTransitionType(null);
      }, transitionDuration);

      trackEvent({
        type: 'act-start',
        timestamp: Date.now(),
        data: { actId: act.id, type: act.type },
      });
    },
    [lesson.cinematicFlow.transitions, trackEvent]
  );

  // ============================================================================
  // TIME UPDATE LOOP
  // ============================================================================

  const updateTime = useCallback(() => {
    if (!playerState.isPlaying) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    const newTime = elapsed * playerState.playbackRate;

    // Check if lesson is complete
    if (newTime >= lesson.duration) {
      pause();
      setPlayerState((prev) => ({ ...prev, currentTime: lesson.duration }));

      trackEvent({ type: 'complete', timestamp: Date.now(), data: playerState });

      if (onComplete) {
        onComplete(playerState);
      }
      return;
    }

    // Update current time
    setPlayerState((prev) => ({ ...prev, currentTime: newTime }));

    // Report progress (throttled to every 100ms)
    if (onProgress && now - lastUpdateRef.current > 100) {
      onProgress((newTime / lesson.duration) * 100);
      lastUpdateRef.current = now;
    }

    // Check for act changes
    const newAct = getCurrentActAtTime(newTime);
    if (newAct && newAct.id !== currentAct?.id) {
      // Mark previous act as completed
      if (currentAct) {
        setPlayerState((prev) => ({
          ...prev,
          completedActs: [...prev.completedActs, currentAct.id],
        }));

        trackEvent({
          type: 'act-complete',
          timestamp: Date.now(),
          data: { actId: currentAct.id },
        });
      }

      // Transition to new act
      transitionToAct(newAct);
    }

    // Check for sync points
    const syncPoints = getCurrentSyncPoints(newTime);
    syncPoints.forEach((sp) => {
      if (sp.action) {
        handleSyncAction(sp);
      }
    });

    // Check for interactions
    const interaction = lesson.interactionPoints.find(
      (ip) => Math.abs(ip.timestamp - newTime) < 0.1 && ip.required
    );
    if (interaction && !playerState.interactionResults[interaction.id]) {
      pause();
      setShowInteraction(true);
      setCurrentInteraction(interaction);
    }

    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, [
    playerState,
    lesson,
    currentAct,
    getCurrentActAtTime,
    getCurrentSyncPoints,
    pause,
    transitionToAct,
    onComplete,
    onProgress,
    trackEvent,
  ]);

  // ============================================================================
  // SYNC POINT HANDLER
  // ============================================================================

  const handleSyncAction = useCallback((syncPoint: SyncPoint) => {
    if (!syncPoint.action) return;

    console.log('[V7Player] Executing sync action:', syncPoint.action.type);

    switch (syncPoint.action.type) {
      case 'pause':
        pause();
        break;
      case 'highlight':
        // Trigger highlight animation
        // This will be handled by the ActRenderer
        break;
      case 'zoom':
        // Trigger zoom animation
        break;
      case 'reveal':
        // Trigger reveal animation
        break;
      case 'execute':
        // Execute custom action
        break;
    }
  }, [pause]);

  // ============================================================================
  // INTERACTION HANDLERS
  // ============================================================================

  const handleInteractionComplete = useCallback(
    (interactionId: string, result: any) => {
      const interaction = lesson.interactionPoints.find((ip) => ip.id === interactionId);

      if (!interaction) return;

      // Store result
      setPlayerState((prev) => ({
        ...prev,
        interactionResults: {
          ...prev.interactionResults,
          [interactionId]: result,
        },
        xp: prev.xp + (interaction.points || 0),
      }));

      // Show feedback
      const isCorrect = result.correct !== false;
      setFeedbackState({
        show: true,
        type: isCorrect ? 'success' : 'error',
        message: isCorrect 
          ? (interaction.feedback?.onSuccess?.content || 'Correto! Excelente trabalho!')
          : (interaction.feedback?.onError?.content || 'Incorreto. Tente novamente!'),
        points: isCorrect ? (interaction.points || 0) : 0,
        xp: isCorrect ? (interaction.points || 0) : 0,
      });

      // Hide interaction
      setShowInteraction(false);
      setCurrentInteraction(null);

      // Resume playback after feedback
      setTimeout(() => {
        setFeedbackState(null);
        play();
      }, 2500);

      trackEvent({
        type: 'interaction',
        timestamp: Date.now(),
        data: { interactionId, result },
      });
    },
    [lesson.interactionPoints, play, trackEvent]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initialize player
  useEffect(() => {
    if (lesson.cinematicFlow.acts.length > 0) {
      setCurrentAct(lesson.cinematicFlow.acts[0]);
      setPlayerState((prev) => ({
        ...prev,
        currentActId: lesson.cinematicFlow.acts[0].id,
      }));
    }

    if (autoPlay) {
      play();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [lesson, autoPlay, play]);

  // Start animation loop when playing
  useEffect(() => {
    if (playerState.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playerState.isPlaying, updateTime]);

  // Track metrics
  useEffect(() => {
    trackMetric({
      id: 'progress',
      name: 'Progress',
      value: progress,
      unit: '%',
    });
  }, [progress, trackMetric]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!currentAct) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Carregando aula...</p>
      </div>
    );
  }

  return (
    <div className="v7-cinematic-player relative w-full h-screen bg-black overflow-hidden">
      {/* Particles background */}
      <ParticlesBackground
        intensity="medium"
        colorScheme="purple"
        interactive={!playerState.isPlaying}
        speed={0.8}
        connected={true}
        className="opacity-40"
      />

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={lesson.audioTrack.narration.url}
        preload="auto"
        className="hidden"
      />

      {/* Main cinematic view */}
      <div className="v7-stage relative w-full h-full z-10">
        <CinematicActRenderer
          act={currentAct}
          currentTime={playerState.currentTime}
          isTransitioning={isTransitioning}
          transitionType={transitionType}
          lesson={lesson}
          playerState={playerState}
        />
      </div>

      {/* Timeline */}
      <V7Timeline
        lesson={lesson}
        currentTime={playerState.currentTime}
        onSeek={seek}
        completedActs={playerState.completedActs}
      />

      {/* Player controls */}
      <V7PlayerControls
        isPlaying={playerState.isPlaying}
        volume={playerState.volume}
        playbackRate={playerState.playbackRate}
        onPlay={play}
        onPause={pause}
        onVolumeChange={setVolume}
        onPlaybackRateChange={setPlaybackRate}
      />

      {/* Interaction overlay */}
      {showInteraction && currentInteraction && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          {currentInteraction.type === 'quiz' || currentInteraction.type === 'reflection' ? (
            <V7QuizInteraction
              interaction={currentInteraction}
              onComplete={(result: QuizResult) => handleInteractionComplete(currentInteraction.id, result)}
              onSkip={!currentInteraction.required ? () => {
                setShowInteraction(false);
                setCurrentInteraction(null);
                play();
              } : undefined}
            />
          ) : currentInteraction.type === 'code-challenge' ? (
            <V7CodeChallenge
              interaction={currentInteraction}
              onComplete={(result: CodeChallengeResult) => handleInteractionComplete(currentInteraction.id, result)}
              onSkip={!currentInteraction.required ? () => {
                setShowInteraction(false);
                setCurrentInteraction(null);
                play();
              } : undefined}
            />
          ) : (
            // Fallback for other interaction types
            <div className="bg-slate-900 rounded-lg p-8 max-w-2xl border border-white/10">
              <p className="text-white">Interação: {currentInteraction.id}</p>
              <button
                onClick={() => handleInteractionComplete(currentInteraction.id, { completed: true })}
                className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Feedback overlay */}
      {feedbackState?.show && (
        <V7InteractionFeedback
          type={feedbackState.type}
          message={feedbackState.message}
          points={feedbackState.points}
          xp={feedbackState.xp}
          onComplete={() => setFeedbackState(null)}
        />
      )}

      {/* Score/XP display */}
      <div className="absolute top-4 right-4 z-40 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
        <div className="text-white text-sm">
          <div>XP: {playerState.xp}</div>
          <div>Score: {playerState.score}</div>
        </div>
      </div>
    </div>
  );
};
