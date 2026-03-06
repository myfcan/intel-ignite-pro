import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Loader2 } from "lucide-react";

interface V8AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  playbackSpeed?: number;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;

export const V8AudioPlayer = ({
  audioUrl,
  autoPlay = false,
  playbackSpeed: externalSpeed,
  onEnded,
  onPlay,
  onPause,
  onTimeUpdate,
}: V8AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<(typeof PLAYBACK_RATES)[number]>(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync external speed
  useEffect(() => {
    if (
      externalSpeed &&
      (PLAYBACK_RATES as readonly number[]).includes(externalSpeed)
    ) {
      setSpeed(externalSpeed as (typeof PLAYBACK_RATES)[number]);
    }
  }, [externalSpeed]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };
    const handleDurationChange = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleCanPlay = () => setIsLoaded(true);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplaythrough", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, [onEnded, onTimeUpdate]);

  // Apply playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && audioRef.current && isLoaded) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        onPlay?.();
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, isLoaded]);

  // Reset on audioUrl change
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsLoaded(false);
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        onPlay?.();
      }).catch(() => {});
    }
  }, [isPlaying, onPlay, onPause]);

  const cycleSpeed = useCallback(() => {
    setSpeed((prev) => {
      const idx = PLAYBACK_RATES.indexOf(prev);
      return PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
    });
  }, []);

  const handleSeekBar = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
  }, [duration]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex items-center gap-3 h-12 px-3.5 rounded-xl border border-slate-200 bg-slate-50">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* Play / Pause / Loading */}
      {autoPlay && !isLoaded ? (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm active:scale-95 transition-transform"
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isPlaying ? (
              <motion.div
                key="pause"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.12 }}
              >
                <Pause className="w-3 h-3" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.12 }}
              >
                <Play className="w-3 h-3 ml-0.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      )}

      {/* Progress bar */}
      <div
        className="relative flex-1 h-1.5 rounded-full bg-slate-200 cursor-pointer group"
        onClick={handleSeekBar}
      >
        {autoPlay && !isLoaded ? (
          <div className="absolute inset-0 rounded-full bg-slate-300 animate-pulse" />
        ) : (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${progress}%` }}
            layout
            transition={{ type: "tween", duration: 0.1 }}
          />
        )}
      </div>

      {/* Time */}
      <span className="text-[11px] font-mono text-slate-500 tabular-nums flex-shrink-0 min-w-[52px] text-center">
        {autoPlay && !isLoaded ? "..." : `${formatTime(currentTime)}/${formatTime(duration)}`}
      </span>

      {/* Speed */}
      <button
        onClick={cycleSpeed}
        className="text-[11px] font-semibold font-mono text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0 min-w-[28px]"
      >
        {speed}x
      </button>
    </div>
  );
};
