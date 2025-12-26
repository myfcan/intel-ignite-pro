// V7PhasePERFEITOSynced - Synchronized PERFEITO reveal with narration
// ✅ V7-v25: COMPACT VERTICAL LAYOUT - Fits screen without overflow
// ✅ V7-v25: Pure CSS transitions - NO Framer Motion trembling
// P-E-R-F-E-I-T-O stacked vertically with meanings appearing as spoken

import { useState, useEffect, useMemo, useRef } from 'react';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface V7PhasePERFEITOSyncedProps {
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  isPlaying: boolean;
  onComplete?: () => void;
}

// PERFEITO letter meanings synced with narration words
const PERFEITO_MEANINGS = [
  { letter: 'P', meaning: 'Persona', subtitle: 'específica' },
  { letter: 'E', meaning: 'Estrutura', subtitle: 'clara' },
  { letter: 'R', meaning: 'Resultado', subtitle: 'esperado' },
  { letter: 'F', meaning: 'Formato', subtitle: 'definido' },
  { letter: 'E', meaning: 'Exemplos', subtitle: 'práticos' },
  { letter: 'I', meaning: 'Iteração', subtitle: 'contínua' },
  { letter: 'T', meaning: 'Tom', subtitle: 'adequado' },
  { letter: 'O', meaning: 'Otimização', subtitle: 'constante' },
];

// Find word timestamp (case insensitive, handles punctuation)
const findWordTimestamp = (timestamps: WordTimestamp[], word: string): WordTimestamp | null => {
  const normalized = word.toLowerCase().replace(/[.,:;!?"]/g, '');
  return timestamps.find(t => {
    const wordNorm = t.word.toLowerCase().replace(/[.,:;!?"]/g, '');
    return wordNorm === normalized || wordNorm.includes(normalized);
  }) || null;
};

export const V7PhasePERFEITOSynced = ({
  wordTimestamps,
  currentTime,
  isPlaying,
  onComplete,
}: V7PhasePERFEITOSyncedProps) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);

  // Find timestamps for each meaning word
  const timings = useMemo(() => {
    const perfeitoTs = findWordTimestamp(wordTimestamps, 'PERFEITO');
    // ✅ V7-v25: Use "constante" END time (not start) to ensure narration finishes
    const constanteTs = findWordTimestamp(wordTimestamps, 'constante');

    const meanings = PERFEITO_MEANINGS.map(m => ({
      ...m,
      timestamp: findWordTimestamp(wordTimestamps, m.meaning)
    }));

    console.log('[V7PhasePERFEITOSynced] Timestamps:', {
      perfeito: perfeitoTs?.start?.toFixed(1),
      constanteEnd: constanteTs?.end?.toFixed(1),
      meanings: meanings.map(m => `${m.meaning}: ${m.timestamp?.start?.toFixed(1) || 'N/A'}`),
    });

    return {
      perfeitoStart: perfeitoTs?.start ?? 0,
      // ✅ V7-v25: End time is when "constante" FINISHES being spoken (end, not start)
      endTime: constanteTs?.end ?? 60,
      meanings,
    };
  }, [wordTimestamps]);

  // Show content when PERFEITO is spoken
  useEffect(() => {
    if (!showContent && currentTime >= timings.perfeitoStart - 0.5) {
      setShowContent(true);
      console.log('[V7PhasePERFEITOSynced] 🎬 Showing vertical layout');
    }
  }, [showContent, currentTime, timings.perfeitoStart]);

  // Update visible meanings based on current time
  useEffect(() => {
    if (!showContent) return;

    let count = 0;
    for (const m of timings.meanings) {
      if (m.timestamp && currentTime >= m.timestamp.start) {
        count++;
      }
    }

    if (count !== visibleCount) {
      setVisibleCount(count);
      console.log(`[V7PhasePERFEITOSynced] Visible: ${count}/8 at ${currentTime.toFixed(1)}s`);
    }
  }, [showContent, currentTime, timings.meanings, visibleCount]);

  // ✅ V7-v25: Complete ONLY after ALL meanings shown AND "constante" fully spoken
  // This prevents playground from activating before narration ends
  useEffect(() => {
    const allMeaningsVisible = visibleCount >= 8;
    const narrationFinished = currentTime >= timings.endTime;
    
    if (allMeaningsVisible && narrationFinished && !completedRef.current) {
      completedRef.current = true;
      console.log(`[V7PhasePERFEITOSynced] ✅ Complete - all visible (${visibleCount}/8) AND narration finished (${currentTime.toFixed(1)}s >= ${timings.endTime.toFixed(1)}s)`);
      // Small delay to let user absorb the complete visual
      setTimeout(() => onComplete?.(), 800);
    }
  }, [visibleCount, currentTime, timings.endTime, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden pb-24">
      {/* Background glow - static, no animation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 217, 166, 0.12) 0%, transparent 60%)',
        }}
      />

      {/* Header - CSS transition for smooth fade */}
      <div
        className="absolute top-8 sm:top-12 text-center transition-opacity duration-500"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        <span className="text-white/50 text-xs sm:text-sm tracking-[0.3em] uppercase">
          O Método
        </span>
      </div>

      {/* PERFEITO Vertical Layout - COMPACT, fits screen */}
      <div
        className="flex flex-col items-start transition-opacity duration-600"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {PERFEITO_MEANINGS.map((item, index) => {
          const isVisible = index < visibleCount;

          return (
            <div
              key={index}
              className="flex items-center h-8 sm:h-9"
              style={{ gap: '0.5rem' }}
            >
              {/* Letter - SMALLER: text-2xl on mobile, text-3xl on desktop */}
              <span
                className="text-2xl sm:text-3xl font-black w-8 sm:w-10 text-center transition-all duration-300"
                style={{
                  background: isVisible
                    ? 'linear-gradient(135deg, #00d9a6, #22D3EE)'
                    : 'linear-gradient(135deg, #444, #555)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: isVisible ? 'drop-shadow(0 0 15px rgba(0, 217, 166, 0.4))' : 'none',
                }}
              >
                {item.letter}
              </span>

              {/* Equals sign - smaller */}
              <span
                className="text-lg sm:text-xl font-bold transition-colors duration-300 w-4"
                style={{ color: isVisible ? '#00d9a6' : '#444' }}
              >
                =
              </span>

              {/* Meaning - fades in smoothly with CSS */}
              <div
                className="flex items-baseline gap-1.5 transition-all duration-400"
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
                }}
              >
                <span className="text-sm sm:text-base font-semibold text-white">
                  {item.meaning}
                </span>
                <span className="text-xs sm:text-sm text-cyan-400/60">
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress dots - SMALLER and positioned better */}
      <div
        className="absolute bottom-16 sm:bottom-20 flex gap-1 transition-opacity duration-500"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {PERFEITO_MEANINGS.map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < visibleCount ? '#00d9a6' : '#333',
              transform: i < visibleCount ? 'scale(1)' : 'scale(0.7)',
            }}
          />
        ))}
      </div>

      {/* Debug - only in dev */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white/30 font-mono">
          {currentTime.toFixed(1)}s | {visibleCount}/8 | end: {timings.endTime.toFixed(1)}s
        </div>
      )}
    </div>
  );
};

export default V7PhasePERFEITOSynced;
