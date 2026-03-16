import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { V10IntroSlide } from '../../../../types/v10.types';
import { IntroSlides } from './IntroSlides';
import { IntroAudioBar } from './IntroAudioBar';

interface PartAScreenProps {
  slides: V10IntroSlide[];
  audioUrl: string;
  onComplete: () => void;
}

/**
 * PartAScreen — Container for Part A (intro/context screens).
 *
 * - Dark background #0F0B1E
 * - Slide area + bottom controls
 * - Audio playback synced with slide transitions via appear_at_seconds
 * - "Pular introdução" while playing, "Começar aula →" when done
 * - Dot navigation at bottom
 */
export const PartAScreen: React.FC<PartAScreenProps> = ({
  slides,
  audioUrl,
  onComplete,
}) => {
  const hasAudio = !!audioUrl && audioUrl.length > 0;
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioEnded, setAudioEnded] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);

  // ---------- Audio callbacks ----------

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = audio.currentTime;
    setCurrentTime(time);

    // Advance slide based on appear_at_seconds
    for (let i = slides.length - 1; i >= 0; i--) {
      const appearAt = slides[i].appear_at_seconds ?? 0;
      if (time >= appearAt) {
        setCurrentIndex(i);
        break;
      }
    }
  }, [slides]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setAudioEnded(true);
    // Show last slide when audio finishes
    setCurrentIndex(slides.length - 1);
  }, [slides.length]);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play().then(() => {
      setIsPlaying(true);
      setAudioEnded(false);
      setShowPlayOverlay(false);
      // Move to slide 1 if we are still on the hero
      if (slides.length > 1) {
        setCurrentIndex(1);
      }
    }).catch(() => {
      setShowPlayOverlay(true);
    });
  }, [slides.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // ---------- Render ----------

  return (
    <div
      className="flex flex-col min-h-screen w-full max-w-[420px] mx-auto"
      style={{ backgroundColor: '#0F0B1E' }}
    >
      {/* Hidden audio element */}
      {hasAudio && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Autoplay blocked overlay */}
      {hasAudio && showPlayOverlay && (
        <button
          type="button"
          onClick={() => {
            const audio = audioRef.current;
            if (audio) {
              audio.play().then(() => {
                setIsPlaying(true);
                setShowPlayOverlay(false);
                if (slides.length > 1) setCurrentIndex(1);
              }).catch(() => {});
            }
          }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white/80 text-sm font-medium">
              Toque para ativar o &aacute;udio
            </span>
          </div>
        </button>
      )}

      {/* Slides area */}
      <IntroSlides
        slides={slides}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        audioDuration={duration}
        hasAudio={hasAudio}
        onPlay={handlePlay}
        onComplete={onComplete}
      />

      {/* Bottom controls */}
      <div className="flex-shrink-0 pb-6 px-4">
        {/* Audio progress bar */}
        <IntroAudioBar
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
        />

        {/* Dot navigation */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${i === currentIndex
                    ? 'w-6 bg-indigo-500'
                    : 'w-2 bg-white/20'
                  }
                `}
              />
            ))}
          </div>
        )}

        {/* Action buttons */}
        {audioEnded ? (
          <button
            type="button"
            onClick={onComplete}
            className="w-full min-h-[44px] py-3 rounded-xl text-white font-semibold text-base transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            {'Começar aula \u2192'}
          </button>
        ) : isPlaying ? (
          <button
            type="button"
            onClick={onComplete}
            className="w-full min-h-[44px] py-3 rounded-xl text-white/60 font-medium text-sm bg-white/5 border border-white/10 transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {'Pular introdução'}
          </button>
        ) : null}
      </div>
    </div>
  );
};
