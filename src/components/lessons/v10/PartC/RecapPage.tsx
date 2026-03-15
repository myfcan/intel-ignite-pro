import React, { useRef, useState } from 'react';

interface RecapPageProps {
  isActive: boolean;
  items: string[];
  audioUrl: string | null;
  onContinue: () => void;
}

/**
 * RecapPage (C1) — "O que voce construiu"
 *
 * Shows a list of accomplishments with green check circles.
 * Last item highlighted with green border.
 * Optional audio player for recap narration.
 */
export const RecapPage: React.FC<RecapPageProps> = ({
  isActive,
  items,
  audioUrl,
  onContinue,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  return (
    <div
      className="flex-col items-center w-full min-h-full px-6 py-10"
      style={{ display: isActive ? 'flex' : 'none' }}
    >
      {/* Tag */}
      <span
        className="text-xs font-bold tracking-widest uppercase mb-4"
        style={{ color: '#6366F1' }}
      >
        Aula completa
      </span>

      {/* Title */}
      <h2 className="text-white font-bold text-2xl text-center mb-2">
        O que voc&#234; construiu
      </h2>

      {/* Subtitle */}
      <p className="text-white/50 text-sm text-center mb-8 max-w-[320px]">
        Veja tudo que voc&#234; realizou nesta aula
      </p>

      {/* Accomplishments list */}
      <div className="w-full max-w-[340px] flex flex-col gap-3 mb-8">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: isLast ? '1px solid #34D399' : '1px solid transparent',
              }}
            >
              {/* Green check circle */}
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                style={{ backgroundColor: '#34D399' }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 7.5L5.5 10L11 4"
                    stroke="#0F0B1E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-white text-sm leading-relaxed">{item}</span>
            </div>
          );
        })}
      </div>

      {/* Audio player */}
      {audioUrl && (
        <div className="w-full max-w-[340px] mb-8">
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
          />
          <button
            type="button"
            onClick={toggleAudio}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm transition-colors hover:bg-white/10"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="2" y="1" width="3" height="10" rx="1" fill="white" />
                  <rect x="7" y="1" width="3" height="10" rx="1" fill="white" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 1.5V10.5L10.5 6L3 1.5Z" fill="white" />
                </svg>
              )}
            </div>
            <span>Ouvir recapitula&#231;&#227;o</span>
          </button>
        </div>
      )}

      {/* Spacer to push dots and button to bottom */}
      <div className="flex-1" />

      {/* Dots navigation */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6366F1' }} />
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full max-w-[340px] min-h-[44px] py-3 rounded-xl text-white font-semibold text-base transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
      >
        Continuar
      </button>
    </div>
  );
};
