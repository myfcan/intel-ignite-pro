// src/components/lessons/v7/V7CinematicPlayer.tsx
// Main player component for V7 Cinematic Lessons with full audio sync, transitions, accessibility, and performance optimization

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
import { OptimizedParticlesBackground } from './OptimizedParticlesBackground';
import { V7QuizInteraction, QuizResult } from './V7QuizInteraction';
import { V7CodeChallenge, CodeChallengeResult } from './V7CodeChallenge';
import { V7InteractionFeedback } from './V7InteractionFeedback';
import { V7TouchControls } from './V7TouchControls';
import { V7Subtitles } from './V7Subtitles';
import { V7AccessibilityWrapper } from './V7AccessibilityWrapper';
import { V7PerformanceOverlay } from './V7PerformanceOverlay';
import { useV7Analytics } from '@/hooks/useV7Analytics';
import { useV7Performance, isLowEndDevice } from '@/hooks/useV7Performance';
import { useV7AudioPreloader } from '@/hooks/useV7AudioPreloader';
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
  autoPlay = true,
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

  // Performance state
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showPerformanceOverlay, setShowPerformanceOverlay] = useState(false);

  // Cinematic experience state
  const [showCursor, setShowCursor] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const cursorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Analytics hook
  const { trackEvent, trackMetric } = useV7Analytics(lesson.id);

  // Performance monitoring hook
  const { 
    metrics: performanceMetrics, 
    startMonitoring, 
    recordLoadingComplete,
    recordAudioLoadTime,
  } = useV7Performance({
    onLowPerformance: () => {
      console.log('[V7Player] Low performance detected, reducing effects');
      setReducedMotion(true);
    },
    fpsThreshold: 25,
  });

  // Audio preloader for lazy loading
  const audioAssets = useMemo(() => {
    const assets = [];
    
    // Main narration
    if (lesson.audioTrack.narration?.url) {
      assets.push({
        id: 'narration-main',
        url: lesson.audioTrack.narration.url,
        type: 'narration' as const,
        startTime: 0,
        duration: lesson.duration,
      });
    }
    
    // Background music
    if (lesson.audioTrack.backgroundMusic?.url) {
      assets.push({
        id: 'music-main',
        url: lesson.audioTrack.backgroundMusic.url,
        type: 'music' as const,
        startTime: 0,
        duration: lesson.duration,
      });
    }
    
    // Sound effects
    lesson.audioTrack.soundEffects?.forEach((effect, index) => {
      assets.push({
        id: `effect-${index}`,
        url: effect.url,
        type: 'effect' as const,
        startTime: effect.triggerTime,
        duration: 5, // Assume 5s duration for effects
      });
    });
    
    return assets;
  }, [lesson.audioTrack, lesson.duration]);

  const { 
    progress: audioPreloadProgress,
    isAssetReady,
  } = useV7AudioPreloader(audioAssets, playerState.currentTime, {
    preloadAhead: 30,
    maxConcurrent: 2,
    onAudioReady: (assetId) => {
      console.log('[V7Player] Audio asset ready:', assetId);
      if (assetId === 'narration-main') {
        recordAudioLoadTime(performance.now());
      }
    },
  });

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
        trackEvent({ type: 'complete', timestamp: Date.now(), data: playerState as unknown as Record<string, unknown> });

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

  // Initialize player and start performance monitoring
  useEffect(() => {
    // Start performance monitoring
    startMonitoring();
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isLowEndDevice()) {
      setReducedMotion(true);
    }

    if (lesson.cinematicFlow.acts.length > 0) {
      setCurrentAct(lesson.cinematicFlow.acts[0]);
      setPlayerState((prev) => ({
        ...prev,
        currentActId: lesson.cinematicFlow.acts[0].id,
      }));
    }

    // Record loading complete
    recordLoadingComplete();

    if (autoPlay) {
      // Small delay to ensure audio is ready
      setTimeout(() => {
        play();
      }, 500);
    }
  }, [lesson, autoPlay, play, startMonitoring, recordLoadingComplete]);

  // Track metrics
  useEffect(() => {
    trackMetric({
      id: 'progress',
      name: 'Progress',
      value: progress,
      unit: '%',
    });
  }, [progress, trackMetric]);

  // Toggle performance overlay with keyboard shortcut (Shift+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'P') {
        setShowPerformanceOverlay(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cinematic experience: Hide cursor and controls when idle
  useEffect(() => {
    const handleMouseMove = () => {
      setShowCursor(true);
      setShowControls(true);

      // Clear existing timer
      if (cursorTimerRef.current) {
        clearTimeout(cursorTimerRef.current);
      }

      // Hide cursor and controls after 3 seconds of inactivity
      if (playerState.isPlaying) {
        cursorTimerRef.current = setTimeout(() => {
          setShowCursor(false);
          setShowControls(false);
        }, 3000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseMove);

    // Initial hide after 3 seconds if playing
    if (playerState.isPlaying) {
      cursorTimerRef.current = setTimeout(() => {
        setShowCursor(false);
        setShowControls(false);
      }, 3000);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseMove);
      if (cursorTimerRef.current) {
        clearTimeout(cursorTimerRef.current);
      }
    };
  }, [playerState.isPlaying]);

  // Fullscreen request on load (cinematic experience)
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          console.log('[V7Player] Fullscreen activated');
        }
      } catch (err) {
        console.log('[V7Player] Fullscreen not available or denied:', err);
      }
    };

    // Request fullscreen after a small delay (better UX)
    const timer = setTimeout(() => {
      requestFullscreen();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
        style={{ cursor: showCursor ? 'default' : 'none' }}
        role="main"
        aria-label={`Reprodutor de aula: ${lesson.title}`}
      >
        {/* Performance monitoring overlay */}
        <V7PerformanceOverlay
          fps={performanceMetrics.fps}
          loadingTime={performanceMetrics.loadingTime}
          audioLoadTime={performanceMetrics.audioLoadTime}
          frameDrops={performanceMetrics.frameDrops}
          isLowPerformance={performanceMetrics.isLowPerformance}
          audioProgress={audioPreloadProgress}
          show={showPerformanceOverlay}
        />

        {/* Optimized Particles background */}
        <OptimizedParticlesBackground
          intensity={reducedMotion ? 'low' : 'medium'}
          colorScheme="purple"
          interactive={false}
          speed={0.5}
          connected={!reducedMotion}
          className="opacity-40"
          reducedMotion={reducedMotion}
          isVisible={!playerState.isPlaying || !reducedMotion}
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

        {/* Timeline - responsive, hidden on very small mobile, fades out when idle */}
        <div
          className="hidden sm:block transition-opacity duration-300"
          style={{ opacity: showControls ? 1 : 0 }}
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

        {/* Player controls - responsive with safe area, fades out when idle */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 pb-safe transition-opacity duration-300"
          style={{ opacity: showControls ? 1 : 0 }}
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
