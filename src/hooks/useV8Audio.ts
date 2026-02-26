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
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.playbackRate = playbackRate;
    audioRef.current = audio;

    const handleCanPlay = () => setIsReady(true);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };
    const handleDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
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
  }, [audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

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
