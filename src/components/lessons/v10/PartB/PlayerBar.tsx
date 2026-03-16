import React from 'react';

interface PlayerBarProps {
  stepNumber: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: 1 | 1.5 | 2;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSpeedChange: () => void;
  onContinue: () => void;
  isLastStep: boolean;
  isLastFrame: boolean;
  continueEnabled?: boolean;
  onSkipNarration?: () => void;
}

const GRADIENT = 'linear-gradient(135deg, #6366F1, #8B5CF6)';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  stepNumber,
  totalSteps,
  isPlaying,
  speed,
  currentTime,
  duration,
  onPlayPause,
  onSpeedChange,
  onContinue,
  isLastStep,
  isLastFrame,
  continueEnabled = true,
  onSkipNarration,
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isComplete = isLastStep && isLastFrame;

  return (
    <div
      className="shrink-0 w-full px-4 pt-3 pb-4"
      style={{ backgroundColor: '#1A1625' }}
    >
      {/* Top row: step label + progress + time */}
      <div className="flex items-center gap-3 mb-3">
        <span className="shrink-0 text-xs font-bold text-white/60 tabular-nums">
          {stepNumber}/{totalSteps}
        </span>

        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              background: GRADIENT,
            }}
          />
        </div>

        <span className="shrink-0 text-xs text-white/50 tabular-nums font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Bottom row: play, speed, continue */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          type="button"
          onClick={onPlayPause}
          className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-white"
          style={{ background: GRADIENT }}
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
            </svg>
          )}
        </button>

        {/* Speed button */}
        <button
          type="button"
          onClick={onSpeedChange}
          className="shrink-0 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold text-white/70 bg-white/10 hover:bg-white/15 transition-colors"
          aria-label={`Velocidade ${speed}x`}
        >
          {speed}x
        </button>

        {/* Skip narration button — only when audio is playing and continue is disabled */}
        {!continueEnabled && isPlaying && onSkipNarration && (
          <button
            type="button"
            onClick={onSkipNarration}
            className="shrink-0 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold text-white/70 bg-white/10 hover:bg-white/15 transition-colors"
            aria-label="Pular narração"
          >
            Pular
          </button>
        )}

        {/* Continue button */}
        <button
          type="button"
          onClick={onContinue}
          disabled={!continueEnabled}
          className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl text-sm font-bold text-white transition-all active:scale-[0.97]"
          style={{
            background: continueEnabled ? GRADIENT : 'rgba(255,255,255,0.15)',
            opacity: continueEnabled ? 1 : 0.5,
            cursor: continueEnabled ? 'pointer' : 'not-allowed',
          }}
        >
          {isComplete ? (
            <span className="flex items-center gap-1.5">
              <span>&#x1F389;</span>
              <span>Completo!</span>
            </span>
          ) : (
            'Continuar'
          )}
        </button>
      </div>
    </div>
  );
};

export default PlayerBar;
