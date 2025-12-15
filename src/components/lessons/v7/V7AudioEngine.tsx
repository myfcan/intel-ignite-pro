// src/components/lessons/v7/V7AudioEngine.tsx
// Audio synchronization engine for V7 Cinematic Player

import { useEffect, useRef, useCallback } from 'react';
import { AudioTrack, SyncPoint, SoundEffect } from '@/types/v7-cinematic.types';

interface V7AudioEngineProps {
  audioTrack: AudioTrack;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  onSyncPoint?: (syncPoint: SyncPoint) => void;
}

export const V7AudioEngine = ({
  audioTrack,
  currentTime,
  isPlaying,
  volume,
  playbackRate,
  onSyncPoint,
}: V7AudioEngineProps) => {
  // ============================================================================
  // HOOKS AT TOP
  // ============================================================================

  const narrationRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const effectsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const lastSyncCheckRef = useRef<number>(0);
  const processedSyncPointsRef = useRef<Set<string>>(new Set());

  // ============================================================================
  // SYNC POINT DETECTION
  // ============================================================================

  const checkSyncPoints = useCallback(() => {
    const tolerance = 0.1; // 100ms tolerance

    audioTrack.syncPoints.forEach((syncPoint) => {
      const timeDiff = Math.abs(currentTime - syncPoint.timestamp);

      // Check if we're at a sync point and haven't processed it yet
      if (timeDiff < tolerance && !processedSyncPointsRef.current.has(syncPoint.id)) {
        console.log('[V7AudioEngine] Sync point triggered:', syncPoint);
        processedSyncPointsRef.current.add(syncPoint.id);

        if (onSyncPoint) {
          onSyncPoint(syncPoint);
        }
      }

      // Clear processed sync points that are now in the past
      if (currentTime > syncPoint.timestamp + 1) {
        processedSyncPointsRef.current.delete(syncPoint.id);
      }
    });
  }, [audioTrack.syncPoints, currentTime, onSyncPoint]);

  // ============================================================================
  // AUDIO PLAYBACK CONTROL
  // ============================================================================

  // Sync narration audio with current time
  useEffect(() => {
    if (!narrationRef.current) return;

    const audio = narrationRef.current;
    const timeDiff = Math.abs(audio.currentTime - currentTime);

    // Sync if difference is more than 200ms
    if (timeDiff > 0.2) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // Control play/pause
  useEffect(() => {
    if (!narrationRef.current) return;

    const audio = narrationRef.current;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('[V7AudioEngine] Narration play error:', err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

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
  }, [volume, audioTrack.volume]);

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

  const playSoundEffect = useCallback((effect: SoundEffect) => {
    let audio = effectsRef.current.get(effect.id);

    if (!audio) {
      audio = new Audio(effect.url);
      effectsRef.current.set(effect.id, audio);
    }

    audio.volume = effect.volume || 1;
    audio.loop = effect.loop || false;

    audio.play().catch((err) => {
      console.error('[V7AudioEngine] Sound effect play error:', err);
    });
  }, []);

  // Check for sound effects at current time
  useEffect(() => {
    if (!audioTrack.soundEffects) return;

    const tolerance = 0.1;

    audioTrack.soundEffects.forEach((effect) => {
      const timeDiff = Math.abs(currentTime - effect.triggerTime);

      if (timeDiff < tolerance && !processedSyncPointsRef.current.has(`effect-${effect.id}`)) {
        playSoundEffect(effect);
        processedSyncPointsRef.current.add(`effect-${effect.id}`);
      }

      // Clear processed effects
      if (currentTime > effect.triggerTime + 1) {
        processedSyncPointsRef.current.delete(`effect-${effect.id}`);
      }
    });
  }, [currentTime, audioTrack.soundEffects, playSoundEffect]);

  // ============================================================================
  // SYNC POINT CHECKING LOOP
  // ============================================================================

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        checkSyncPoints();
      }
    }, 50); // Check every 50ms

    return () => clearInterval(interval);
  }, [isPlaying, checkSyncPoints]);

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
        <div className="fixed bottom-2 left-2 z-50 bg-black/70 text-white text-xs p-2 rounded font-mono">
          <div>Audio Time: {narrationRef.current?.currentTime.toFixed(2)}s</div>
          <div>Target Time: {currentTime.toFixed(2)}s</div>
          <div>
            Sync: {Math.abs((narrationRef.current?.currentTime || 0) - currentTime) < 0.2 ? '✓' : '✗'}
          </div>
        </div>
      )}
    </>
  );
};
