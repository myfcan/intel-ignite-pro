import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useV8Audio — Lightweight audio control hook.
 * Used when you need programmatic control outside of V8AudioPlayer component.
 */

interface UseV8AudioOptions {
  autoPlay?: boolean;
  playbackRate?: number;
  onEnded?: () => void;
  onTimeUpdate?: (time: number, duration: number) => void;
}

export const useV8Audio = (audioUrl: string, options: UseV8AudioOptions = {}) => {
  const { autoPlay = false, playbackRate = 1, onEnded, onTimeUpdate } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Create / swap audio element on URL change
  // Store callbacks in refs to avoid stale closures
  const onEndedRef = useRef(onEnded);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onEndedRef.current = onEnded;
  onTimeUpdateRef.current = onTimeUpdate;

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.playbackRate = playbackRate;
    audioRef.current = audio;

    const handleCanPlay = () => setIsReady(true);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdateRef.current?.(audio.currentTime, audio.duration);
    };
    const handleDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    };

    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDuration);
    audio.addEventListener("ended", handleEnded);

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    return () => {
      audio.pause();
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.src = "";
    };
  }, [audioUrl, autoPlay, playbackRate]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const play = useCallback(() => {
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  return { isPlaying, currentTime, duration, isReady, play, pause, seek };
};
