import React from 'react';

interface IntroAudioBarProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

/**
 * IntroAudioBar — Compact audio progress bar for Part A intro.
 * Shows gradient-filled progress and mm:ss time display.
 */
export const IntroAudioBar: React.FC<IntroAudioBarProps> = ({
  currentTime,
  duration,
  isPlaying,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isPlaying && currentTime === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 py-3">
      {/* Progress track */}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-linear"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
          }}
        />
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
