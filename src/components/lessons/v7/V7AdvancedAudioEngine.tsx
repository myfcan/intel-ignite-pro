// src/components/lessons/v7/V7AdvancedAudioEngine.tsx
// Advanced audio synchronization engine with word timestamp support

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { AudioTrack, SyncPoint, SoundEffect } from '@/types/v7-cinematic.types';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface V7AdvancedAudioEngineRef {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getWordTimestamps: () => WordTimestamp[];
}

interface V7AdvancedAudioEngineProps {
  audioTrack: AudioTrack;
  wordTimestamps?: WordTimestamp[];
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  onTimeUpdate?: (time: number) => void;
  onSyncPoint?: (syncPoint: SyncPoint) => void;
  onCurrentWordChange?: (wordIndex: number, word: WordTimestamp | null) => void;
  onAudioReady?: () => void;
  onAudioError?: (error: Error) => void;
}

export const V7AdvancedAudioEngine = forwardRef<V7AdvancedAudioEngineRef, V7AdvancedAudioEngineProps>(
  (
    {
      audioTrack,
      wordTimestamps = [],
      currentTime,
      isPlaying,
      volume,
      playbackRate,
      onTimeUpdate,
      onSyncPoint,
      onCurrentWordChange,
      onAudioReady,
      onAudioError,
    },
    ref
  ) => {
    // ============================================================================
    // REFS AND STATE
    // ============================================================================

    const narrationRef = useRef<HTMLAudioElement>(null);
    const musicRef = useRef<HTMLAudioElement>(null);
    const effectsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
    const processedSyncPointsRef = useRef<Set<string>>(new Set());
    const lastWordIndexRef = useRef<number>(-1);
    const timeUpdateIntervalRef = useRef<number>();

    const [isAudioReady, setIsAudioReady] = useState(false);

    // ============================================================================
    // EXPOSE METHODS VIA REF
    // ============================================================================

    useImperativeHandle(ref, () => ({
      play: async () => {
        if (narrationRef.current) {
          await narrationRef.current.play();
        }
        if (musicRef.current && audioTrack.backgroundMusic) {
          await musicRef.current.play();
        }
      },
      pause: () => {
        if (narrationRef.current) {
          narrationRef.current.pause();
        }
        if (musicRef.current) {
          musicRef.current.pause();
        }
      },
      seek: (time: number) => {
        if (narrationRef.current) {
          narrationRef.current.currentTime = time;
        }
        if (musicRef.current) {
          musicRef.current.currentTime = time;
        }
      },
      setVolume: (vol: number) => {
        if (narrationRef.current) {
          narrationRef.current.volume = Math.max(0, Math.min(vol, 1));
        }
      },
      setPlaybackRate: (rate: number) => {
        if (narrationRef.current) {
          narrationRef.current.playbackRate = rate;
        }
      },
      getCurrentTime: () => narrationRef.current?.currentTime || 0,
      getDuration: () => narrationRef.current?.duration || 0,
      getWordTimestamps: () => wordTimestamps,
    }));

    // ============================================================================
    // WORD TIMESTAMP SYNCHRONIZATION
    // ============================================================================

    const findCurrentWordIndex = useCallback(
      (time: number): number => {
        return wordTimestamps.findIndex(
          (word) => time >= word.start && time < word.end
        );
      },
      [wordTimestamps]
    );

    // ============================================================================
    // TIME UPDATE HANDLER
    // ============================================================================

    const handleTimeUpdate = useCallback(() => {
      if (!narrationRef.current) return;

      const time = narrationRef.current.currentTime;

      // Report time update
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }

      // Check for current word change
      if (wordTimestamps.length > 0 && onCurrentWordChange) {
        const currentWordIndex = findCurrentWordIndex(time);

        if (currentWordIndex !== lastWordIndexRef.current) {
          lastWordIndexRef.current = currentWordIndex;
          const currentWord = currentWordIndex >= 0 ? wordTimestamps[currentWordIndex] : null;
          onCurrentWordChange(currentWordIndex, currentWord);
        }
      }

      // Check sync points
      checkSyncPoints(time);
    }, [onTimeUpdate, wordTimestamps, onCurrentWordChange, findCurrentWordIndex]);

    // ============================================================================
    // SYNC POINT DETECTION
    // ============================================================================

    const checkSyncPoints = useCallback(
      (time: number) => {
        const tolerance = 0.1; // 100ms tolerance

        audioTrack.syncPoints.forEach((syncPoint) => {
          const timeDiff = Math.abs(time - syncPoint.timestamp);

          if (
            timeDiff < tolerance &&
            !processedSyncPointsRef.current.has(syncPoint.id)
          ) {
            console.log('[V7AdvancedAudioEngine] Sync point triggered:', syncPoint);
            processedSyncPointsRef.current.add(syncPoint.id);

            if (onSyncPoint) {
              onSyncPoint(syncPoint);
            }
          }

          // Clear processed sync points that are now in the past
          if (time > syncPoint.timestamp + 1) {
            processedSyncPointsRef.current.delete(syncPoint.id);
          }
        });
      },
      [audioTrack.syncPoints, onSyncPoint]
    );

    // ============================================================================
    // AUDIO PLAYBACK CONTROL
    // ============================================================================

    // Sync narration audio with external currentTime (for seeking)
    useEffect(() => {
      if (!narrationRef.current) return;

      const audio = narrationRef.current;
      const timeDiff = Math.abs(audio.currentTime - currentTime);

      // Only sync if difference is more than 200ms (to avoid constant updates)
      if (timeDiff > 0.2) {
        audio.currentTime = currentTime;
        if (musicRef.current) {
          musicRef.current.currentTime = currentTime;
        }
      }
    }, [currentTime]);

    // Control play/pause
    useEffect(() => {
      if (!narrationRef.current) return;

      const audio = narrationRef.current;

      if (isPlaying) {
        audio.play().catch((err) => {
          console.error('[V7AdvancedAudioEngine] Narration play error:', err);
          if (onAudioError) {
            onAudioError(err);
          }
        });

        if (musicRef.current && audioTrack.backgroundMusic) {
          musicRef.current.play().catch(console.error);
        }
      } else {
        audio.pause();
        if (musicRef.current) {
          musicRef.current.pause();
        }
      }
    }, [isPlaying, audioTrack.backgroundMusic, onAudioError]);

    // Control volume
    useEffect(() => {
      if (narrationRef.current) {
        const narrationVolume = volume * (audioTrack.volume?.narration || 1);
        narrationRef.current.volume = Math.max(0, Math.min(narrationVolume, 1));
      }

      if (musicRef.current && audioTrack.backgroundMusic) {
        const musicVolume = volume * (audioTrack.volume?.music || 0.3);
        musicRef.current.volume = Math.max(0, Math.min(musicVolume, 1));
      }
    }, [volume, audioTrack.volume, audioTrack.backgroundMusic]);

    // Control playback rate
    useEffect(() => {
      if (narrationRef.current) {
        narrationRef.current.playbackRate = playbackRate;
      }

      if (musicRef.current) {
        musicRef.current.playbackRate = playbackRate;
      }
    }, [playbackRate]);

    // ============================================================================
    // SOUND EFFECTS
    // ============================================================================

    const playSoundEffect = useCallback(
      (effect: SoundEffect) => {
        let audio = effectsRef.current.get(effect.id);

        if (!audio) {
          audio = new Audio(effect.url);
          effectsRef.current.set(effect.id, audio);
        }

        const effectVolume = (effect.volume || 1) * volume * (audioTrack.volume?.effects || 1);
        audio.volume = Math.max(0, Math.min(effectVolume, 1));
        audio.loop = effect.loop || false;

        audio.play().catch((err) => {
          console.error('[V7AdvancedAudioEngine] Sound effect play error:', err);
        });
      },
      [volume, audioTrack.volume]
    );

    // Check for sound effects at current time - integrated into time update
    const checkSoundEffects = useCallback(
      (time: number) => {
        if (!audioTrack.soundEffects) return;

        const tolerance = 0.15; // 150ms tolerance for effects

        audioTrack.soundEffects.forEach((effect) => {
          const timeDiff = Math.abs(time - effect.triggerTime);
          const effectKey = `effect-${effect.id}`;

          if (
            timeDiff < tolerance &&
            !processedSyncPointsRef.current.has(effectKey)
          ) {
            console.log('[V7AdvancedAudioEngine] Playing sound effect:', effect.id, 'at', time);
            playSoundEffect(effect);
            processedSyncPointsRef.current.add(effectKey);
          }

          // Clear processed effects after they pass
          if (time > effect.triggerTime + 1) {
            processedSyncPointsRef.current.delete(effectKey);
          }
        });
      },
      [audioTrack.soundEffects, playSoundEffect]
    );

    // Enhanced time update handler that also checks sound effects
    useEffect(() => {
      if (!narrationRef.current || !isPlaying) return;

      const checkEffectsInterval = setInterval(() => {
        if (narrationRef.current) {
          const time = narrationRef.current.currentTime;
          checkSoundEffects(time);
        }
      }, 50); // Check every 50ms for precise timing

      return () => clearInterval(checkEffectsInterval);
    }, [isPlaying, checkSoundEffects]);

    // ============================================================================
    // AUDIO ELEMENT EVENT HANDLERS
    // ============================================================================

    const handleAudioCanPlay = useCallback(() => {
      setIsAudioReady(true);
      if (onAudioReady) {
        onAudioReady();
      }
    }, [onAudioReady]);

    const handleAudioError = useCallback(
      (e: React.SyntheticEvent<HTMLAudioElement>) => {
        const error = new Error('Audio failed to load');
        console.error('[V7AdvancedAudioEngine] Audio error:', e);
        if (onAudioError) {
          onAudioError(error);
        }
      },
      [onAudioError]
    );

    // ============================================================================
    // CLEANUP
    // ============================================================================

    useEffect(() => {
      return () => {
        // Stop all sound effects
        effectsRef.current.forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
        effectsRef.current.clear();

        // Clear interval
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
      };
    }, []);

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
      <>
        {/* Main narration audio */}
        <audio
          ref={narrationRef}
          src={audioTrack.narration.url}
          preload="auto"
          className="hidden"
          onTimeUpdate={handleTimeUpdate}
          onCanPlay={handleAudioCanPlay}
          onError={handleAudioError}
        />

        {/* Background music (optional) */}
        {audioTrack.backgroundMusic && (
          <audio
            ref={musicRef}
            src={audioTrack.backgroundMusic.url}
            preload="auto"
            loop
            className="hidden"
          />
        )}

        {/* Development debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-2 left-2 z-50 bg-black/70 text-white text-xs p-2 rounded font-mono max-w-xs">
            <div>Audio Time: {narrationRef.current?.currentTime?.toFixed(2)}s</div>
            <div>Word Index: {lastWordIndexRef.current}</div>
            <div>Ready: {isAudioReady ? '✓' : '✗'}</div>
            <div>Music: {audioTrack.backgroundMusic ? '✓' : '✗'}</div>
            <div>SFX Count: {audioTrack.soundEffects?.length || 0}</div>
            <div>Playing: {isPlaying ? '▶' : '⏸'}</div>
          </div>
        )}
      </>
    );
  }
);

V7AdvancedAudioEngine.displayName = 'V7AdvancedAudioEngine';
