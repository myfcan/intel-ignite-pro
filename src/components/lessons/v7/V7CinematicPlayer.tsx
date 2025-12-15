// src/components/lessons/v7/V7CinematicPlayer.tsx
// Main player component for V7 Cinematic Lessons with full audio sync, transitions, and accessibility

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
import { V7PlayerControls, VolumeSettings } from './V7PlayerControls';
import { V7AdvancedAudioEngine, V7AdvancedAudioEngineRef } from './V7AdvancedAudioEngine';
import { V7SynchronizedCaptions } from './V7SynchronizedCaptions';
import { V7ActTransition } from './V7CinematicTransitions';
import { ParticlesBackground } from './ParticlesBackground';
import { V7QuizInteraction, QuizResult } from './V7QuizInteraction';
import { V7CodeChallenge, CodeChallengeResult } from './V7CodeChallenge';
import { V7InteractionFeedback } from './V7InteractionFeedback';
import { V7TouchControls } from './V7TouchControls';
import { V7Subtitles } from './V7Subtitles';
import { V7AccessibilityWrapper } from './V7AccessibilityWrapper';
import { useV7Analytics } from '@/hooks/useV7Analytics';
import { useIsMobile } from '@/hooks/use-mobile';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface V7CinematicPlayerProps {
  lesson: V7CinematicLesson;
  wordTimestamps?: WordTimestamp[];
  onComplete?: (results: V7PlayerState) => void;
  onProgress?: (progress: number) => void;
  autoPlay?: boolean;
}

export const V7CinematicPlayer = ({
  lesson,
  wordTimestamps = [],
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

  // Captions visibility
  const [showCaptions, setShowCaptions] = useState(true);

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
  const [transitionType, setTransitionType] = useState<'fade' | 'slide' | 'zoom' | 'dissolve'>('fade');

  // Volume settings state
  const [volumeSettings, setVolumeSettings] = useState<VolumeSettings>({
    master: 1,
    narration: lesson.audioTrack.volume?.narration || 1,
    music: lesson.audioTrack.volume?.music || 0.3,
    effects: lesson.audioTrack.volume?.effects || 1,
  });

  // Refs for timing and audio
  const audioEngineRef = useRef<V7AdvancedAudioEngineRef>(null);
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

  // Calculate progress percentage
  const progress = useMemo(() => {
    return (playerState.currentTime / lesson.duration) * 100;
  }, [playerState.currentTime, lesson.duration]);

  // ============================================================================
  // PLAYBACK CONTROLS
  // ============================================================================

  const play = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
    audioEngineRef.current?.play();
    trackEvent({ type: 'act-start', timestamp: Date.now(), data: { actId: currentAct?.id } });
  }, [currentAct, trackEvent]);

  const pause = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));
    audioEngineRef.current?.pause();
    trackEvent({ type: 'pause', timestamp: Date.now(), data: { time: playerState.currentTime } });
  }, [playerState.currentTime, trackEvent]);

  const seek = useCallback(
    (time: number) => {
      const clampedTime = Math.max(0, Math.min(time, lesson.duration));
      setPlayerState((prev) => ({ ...prev, currentTime: clampedTime }));
      audioEngineRef.current?.seek(clampedTime);

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
    audioEngineRef.current?.setVolume(clampedVolume);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlayerState((prev) => ({ ...prev, playbackRate: rate }));
    audioEngineRef.current?.setPlaybackRate(rate);
  }, []);

  // ============================================================================
  // AUDIO TIME UPDATE HANDLER
  // ============================================================================

  const handleTimeUpdate = useCallback(
    (time: number) => {
      // Update current time
      setPlayerState((prev) => ({ ...prev, currentTime: time }));

      // Report progress (throttled to every 100ms)
      const now = performance.now();
      if (onProgress && now - lastUpdateRef.current > 100) {
        onProgress((time / lesson.duration) * 100);
        lastUpdateRef.current = now;
      }

      // Check if lesson is complete
      if (time >= lesson.duration) {
        pause();
        setPlayerState((prev) => ({ ...prev, currentTime: lesson.duration }));
        trackEvent({ type: 'complete', timestamp: Date.now(), data: playerState });

        if (onComplete) {
          onComplete(playerState);
        }
        return;
      }

      // Check for act changes
      const newAct = getCurrentActAtTime(time);
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

        // Determine transition type from act config
        const transitionEffect = newAct.transitions.in.type as 'fade' | 'slide' | 'zoom' | 'dissolve';
        setTransitionType(transitionEffect || 'dissolve');
        setIsTransitioning(true);

        // Transition to new act
        setTimeout(() => {
          setCurrentAct(newAct);
          setPlayerState((prev) => ({
            ...prev,
            currentActId: newAct.id,
          }));
          setIsTransitioning(false);
        }, 400);

        trackEvent({
          type: 'act-start',
          timestamp: Date.now(),
          data: { actId: newAct.id, type: newAct.type },
        });
      }

      // Check for interactions
      const interaction = lesson.interactionPoints.find(
        (ip) => Math.abs(ip.timestamp - time) < 0.1 && ip.required
      );
      if (interaction && !playerState.interactionResults[interaction.id]) {
        pause();
        setShowInteraction(true);
        setCurrentInteraction(interaction);
      }
    },
    [
      lesson,
      currentAct,
      playerState,
      getCurrentActAtTime,
      pause,
      onComplete,
      onProgress,
      trackEvent,
    ]
  );

  // ============================================================================
  // SYNC POINT HANDLER
  // ============================================================================

  const handleSyncPoint = useCallback(
    (syncPoint: SyncPoint) => {
      if (!syncPoint.action) return;

      console.log('[V7Player] Executing sync action:', syncPoint.action.type);

      switch (syncPoint.action.type) {
        case 'pause':
          pause();
          break;
        case 'highlight':
          // Trigger highlight animation - handled by ActRenderer
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
    },
    [pause]
  );

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
          ? interaction.feedback?.onSuccess?.content || 'Correto! Excelente trabalho!'
          : interaction.feedback?.onError?.content || 'Incorreto. Tente novamente!',
        points: isCorrect ? interaction.points || 0 : 0,
        xp: isCorrect ? interaction.points || 0 : 0,
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
      // Small delay to ensure audio is ready
      setTimeout(() => {
        play();
      }, 500);
    }
  }, [lesson, autoPlay, play]);

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
  // COMPUTED - Current act index
  // ============================================================================

  const currentActIndex = useMemo(() => {
    return lesson.cinematicFlow.acts.findIndex((a) => a.id === currentAct?.id);
  }, [lesson.cinematicFlow.acts, currentAct]);

  // ============================================================================
  // NAVIGATION HANDLERS FOR TOUCH/ACCESSIBILITY
  // ============================================================================

  const handleNextAct = useCallback(() => {
    const nextIndex = currentActIndex + 1;
    if (nextIndex < lesson.cinematicFlow.acts.length) {
      const nextAct = lesson.cinematicFlow.acts[nextIndex];
      seek(nextAct.startTime);
    }
  }, [currentActIndex, lesson.cinematicFlow.acts, seek]);

  const handlePreviousAct = useCallback(() => {
    const prevIndex = currentActIndex - 1;
    if (prevIndex >= 0) {
      const prevAct = lesson.cinematicFlow.acts[prevIndex];
      seek(prevAct.startTime);
    }
  }, [currentActIndex, lesson.cinematicFlow.acts, seek]);

  const handlePlayPauseToggle = useCallback(() => {
    if (playerState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playerState.isPlaying, play, pause]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!currentAct) {
    return (
      <div 
        className="flex items-center justify-center h-screen bg-gray-900"
        role="status"
        aria-label="Carregando aula"
      >
        <p className="text-white">Carregando aula...</p>
      </div>
    );
  }

  return (
    <V7AccessibilityWrapper
      lessonTitle={lesson.title}
      currentActTitle={currentAct?.title || 'Ato ' + (currentActIndex + 1)}
      currentActIndex={currentActIndex}
      totalActs={lesson.cinematicFlow.acts.length}
      isPlaying={playerState.isPlaying}
      currentTime={playerState.currentTime}
      duration={lesson.duration}
      onPlay={play}
      onPause={pause}
      onSeek={seek}
      onNextAct={handleNextAct}
      onPreviousAct={handlePreviousAct}
      onVolumeChange={setVolume}
      volume={volumeSettings.master}
    >
      <div 
        className="v7-cinematic-player relative w-full h-screen bg-black overflow-hidden"
        role="main"
        aria-label={`Reprodutor de aula: ${lesson.title}`}
      >
        {/* Particles background */}
        <ParticlesBackground
          intensity="medium"
          colorScheme="purple"
          interactive={!playerState.isPlaying}
          speed={0.8}
          connected={true}
          className="opacity-40"
          aria-hidden="true"
        />

        {/* Advanced Audio Engine with volume settings */}
        <V7AdvancedAudioEngine
          ref={audioEngineRef}
          audioTrack={{
            ...lesson.audioTrack,
            volume: {
              narration: volumeSettings.narration,
              music: volumeSettings.music,
              effects: volumeSettings.effects,
            },
          }}
          wordTimestamps={wordTimestamps}
          currentTime={playerState.currentTime}
          isPlaying={playerState.isPlaying}
          volume={volumeSettings.master}
          playbackRate={playerState.playbackRate}
          onTimeUpdate={handleTimeUpdate}
          onSyncPoint={handleSyncPoint}
          onAudioReady={() => console.log('[V7Player] Audio ready')}
          onAudioError={(err) => console.error('[V7Player] Audio error:', err)}
        />

        {/* Main cinematic view with touch controls for mobile */}
        <V7TouchControls
          onSwipeLeft={handleNextAct}
          onSwipeRight={handlePreviousAct}
          onTap={handlePlayPauseToggle}
          onDoubleTap={() => seek(playerState.currentTime + 10)}
          isPlaying={playerState.isPlaying}
          currentActIndex={currentActIndex}
          totalActs={lesson.cinematicFlow.acts.length}
        >
          <div className="v7-stage relative w-full h-full z-10">
            <V7ActTransition
              actId={currentAct.id}
              type={transitionType}
              direction="left"
            >
              <CinematicActRenderer
                act={currentAct}
                currentTime={playerState.currentTime}
                isTransitioning={isTransitioning}
                transitionType={transitionType}
                lesson={lesson}
                playerState={playerState}
              />
            </V7ActTransition>
          </div>
        </V7TouchControls>

        {/* Full Subtitles with settings and transcript */}
        <V7Subtitles
          wordTimestamps={wordTimestamps}
          currentTime={playerState.currentTime}
          isVisible={showCaptions}
          onToggle={() => setShowCaptions(!showCaptions)}
          onSeek={seek}
          lessonTitle={lesson.title}
        />

        {/* Timeline - responsive, hidden on very small mobile */}
        <div 
          className="hidden sm:block" 
          id="v7-controls"
          role="region"
          aria-label="Linha do tempo da aula"
        >
          <V7Timeline
            lesson={lesson}
            currentTime={playerState.currentTime}
            onSeek={seek}
            completedActs={playerState.completedActs}
          />
        </div>

        {/* Player controls - responsive with safe area */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-30 pb-safe"
          role="toolbar"
          aria-label="Controles do player"
        >
          <V7PlayerControls
            isPlaying={playerState.isPlaying}
            volume={volumeSettings.master}
            volumeSettings={volumeSettings}
            playbackRate={playerState.playbackRate}
            hasBackgroundMusic={!!lesson.audioTrack.backgroundMusic}
            hasSoundEffects={!!lesson.audioTrack.soundEffects?.length}
            onPlay={play}
            onPause={pause}
            onVolumeChange={(v) => setVolumeSettings((prev) => ({ ...prev, master: v }))}
            onVolumeSettingsChange={setVolumeSettings}
            onPlaybackRateChange={setPlaybackRate}
          />
        </div>

        {/* Interaction overlay */}
        {showInteraction && currentInteraction && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Interação da aula"
          >
            {currentInteraction.type === 'quiz' || currentInteraction.type === 'reflection' ? (
              <V7QuizInteraction
                interaction={currentInteraction}
                onComplete={(result: QuizResult) =>
                  handleInteractionComplete(currentInteraction.id, result)
                }
                onSkip={
                  !currentInteraction.required
                    ? () => {
                        setShowInteraction(false);
                        setCurrentInteraction(null);
                        play();
                      }
                    : undefined
                }
              />
            ) : currentInteraction.type === 'code-challenge' ? (
              <V7CodeChallenge
                interaction={currentInteraction}
                onComplete={(result: CodeChallengeResult) =>
                  handleInteractionComplete(currentInteraction.id, result)
                }
                onSkip={
                  !currentInteraction.required
                    ? () => {
                        setShowInteraction(false);
                        setCurrentInteraction(null);
                        play();
                      }
                    : undefined
                }
              />
            ) : (
              <div className="bg-slate-900 rounded-lg p-6 sm:p-8 max-w-2xl w-full mx-4 border border-white/10">
                <p className="text-white">Interação: {currentInteraction.id}</p>
                <button
                  onClick={() => handleInteractionComplete(currentInteraction.id, { completed: true })}
                  className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Continuar para o próximo conteúdo"
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

        {/* Score/XP display - Mobile responsive */}
        <div 
          className="absolute top-4 right-4 z-40 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4"
          role="status"
          aria-label={`Pontuação: ${playerState.xp} XP`}
          aria-live="polite"
        >
          <div className="text-white text-xs sm:text-sm">
            <div>XP: {playerState.xp}</div>
            <div className="hidden sm:block">Score: {playerState.score}</div>
          </div>
        </div>

        {/* Mobile navigation hint - only on first load */}
        <div className="sm:hidden absolute bottom-28 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-white/40 text-xs animate-pulse">
            Deslize para navegar • Toque para pausar
          </p>
        </div>
      </div>
    </V7AccessibilityWrapper>
  );
};
