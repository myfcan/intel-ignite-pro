import { useState, useRef, useCallback, useEffect } from "react";

interface AudioSegment {
  actId: string;
  audioUrl?: string;
  text?: string; // For TTS fallback
  startTime: number;
  endTime: number;
}

interface UseV7CinematicAudioProps {
  segments?: AudioSegment[];
  onSegmentChange?: (segmentIndex: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export const useV7CinematicAudio = ({
  segments = [],
  onSegmentChange,
  onTimeUpdate,
  onEnded
}: UseV7CinematicAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);

      // Check segment boundaries
      if (segments.length > 0) {
        const currentSegment = segments[currentSegmentIndex];
        if (currentSegment && audio.currentTime >= currentSegment.endTime) {
          const nextIndex = currentSegmentIndex + 1;
          if (nextIndex < segments.length) {
            setCurrentSegmentIndex(nextIndex);
            onSegmentChange?.(nextIndex);
          }
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [segments, currentSegmentIndex, onTimeUpdate, onSegmentChange, onEnded]);

  // Load audio source
  const loadAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
  }, []);

  // Play
  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  }, []);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to time
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Seek to segment
  const seekToSegment = useCallback((segmentIndex: number) => {
    if (segments[segmentIndex]) {
      setCurrentSegmentIndex(segmentIndex);
      seekTo(segments[segmentIndex].startTime);
      onSegmentChange?.(segmentIndex);
    }
  }, [segments, seekTo, onSegmentChange]);

  // Set volume
  const setVolume = useCallback((value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setVolumeState(clampedValue);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clampedValue;
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [volume]);

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    currentSegmentIndex,
    volume,
    isMuted,
    
    // Actions
    loadAudio,
    play,
    pause,
    togglePlayPause,
    seekTo,
    seekToSegment,
    setVolume,
    toggleMute,
    
    // Helpers
    formatTime,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    progress: duration > 0 ? (currentTime / duration) * 100 : 0
  };
};
