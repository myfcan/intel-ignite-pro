import React from 'react';
import type { V10IntroSlide } from '../../../../types/v10.types';
import { IntroSlide } from './IntroSlide';

interface IntroSlidesProps {
  slides: V10IntroSlide[];
  currentIndex: number;
  isPlaying: boolean;
  audioDuration: number;
  hasAudio: boolean;
  onPlay: () => void;
  onComplete: () => void;
}

/**
 * IntroSlides — Manages the collection of intro slides.
 * Slide 0 is the hero with play button; remaining slides use IntroSlide.
 */
export const IntroSlides: React.FC<IntroSlidesProps> = ({
  slides,
  currentIndex,
  isPlaying,
  audioDuration,
  onPlay,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
      {/* Hero slide (index 0) */}
      <div
        style={{ display: currentIndex === 0 ? 'flex' : 'none' }}
        className="flex-col items-center justify-center w-full px-4 py-6 text-center"
      >
        {/* Badge */}
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {'AULA PRÁTICA'}
        </span>

        {/* Hero title */}
        <h1 className="text-2xl font-extrabold text-white mb-2 leading-tight">
          {slides[0]?.title || 'SDR de Voz com IA'}
        </h1>

        {/* Hero subtitle */}
        {slides[0]?.subtitle && (
          <p className="text-sm text-white/60 mb-8 max-w-[280px]">
            {slides[0].subtitle}
          </p>
        )}

        {/* Play button */}
        <button
          type="button"
          onClick={onPlay}
          disabled={isPlaying}
          className="group relative w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#0F0B1E]"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          aria-label="Iniciar introdução em áudio"
        >
          {/* Play triangle SVG */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="ml-1"
          >
            <path
              d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z"
              fill="white"
            />
          </svg>
        </button>

        {/* Duration label */}
        <p className="text-sm text-white/50">
          {'Ouvir introdução · '}
          {formatTime(audioDuration)}
        </p>
      </div>

      {/* Content slides (index >= 1) */}
      {slides.slice(1).map((slide, i) => (
        <IntroSlide
          key={slide.id ?? i + 1}
          slide={slide}
          isActive={currentIndex === i + 1}
        />
      ))}
    </div>
  );
};

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
