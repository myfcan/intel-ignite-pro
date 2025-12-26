// V7PhasePERFEITOSynced - Synchronized PERFEITO reveal with narration
// ✅ V7-v24: STABLE VERTICAL LAYOUT - No animations that cause trembling
// P-E-R-F-E-I-T-O stacked vertically with meanings appearing as spoken

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const constanteTs = findWordTimestamp(wordTimestamps, 'constante');

    const meanings = PERFEITO_MEANINGS.map(m => ({
      ...m,
      timestamp: findWordTimestamp(wordTimestamps, m.meaning)
    }));

    console.log('[V7PhasePERFEITOSynced] Timestamps:', {
      perfeito: perfeitoTs?.start?.toFixed(1),
      constante: constanteTs?.end?.toFixed(1),
      meanings: meanings.map(m => `${m.meaning}: ${m.timestamp?.start?.toFixed(1) || 'N/A'}`),
    });

    return {
      perfeitoStart: perfeitoTs?.start ?? 0,
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
      console.log(`[V7PhasePERFEITOSynced] Visible: ${count}/8`);
    }
  }, [showContent, currentTime, timings.meanings, visibleCount]);

  // Complete when all meanings shown and time passed
  useEffect(() => {
    if (visibleCount >= 8 && currentTime >= timings.endTime && !completedRef.current) {
      completedRef.current = true;
      console.log('[V7PhasePERFEITOSynced] ✅ Complete');
      setTimeout(() => onComplete?.(), 500);
    }
  }, [visibleCount, currentTime, timings.endTime, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow - static, no animation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 217, 166, 0.12) 0%, transparent 60%)',
        }}
      />

      {/* Header */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="absolute top-12 sm:top-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-white/50 text-sm sm:text-base tracking-[0.3em] uppercase">
              O Método
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERFEITO Vertical Layout - STABLE, no trembling */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="flex flex-col items-start gap-0.5 sm:gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {PERFEITO_MEANINGS.map((item, index) => {
              const isVisible = index < visibleCount;

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-4 h-10 sm:h-14"
                >
                  {/* Letter - always visible but dim until meaning shown */}
                  <span
                    className="text-3xl sm:text-5xl md:text-6xl font-black w-10 sm:w-14 md:w-16 text-center transition-all duration-300"
                    style={{
                      background: isVisible
                        ? 'linear-gradient(135deg, #00d9a6, #22D3EE)'
                        : 'linear-gradient(135deg, #444, #555)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: isVisible ? '0 0 30px rgba(0, 217, 166, 0.5)' : 'none',
                    }}
                  >
                    {item.letter}
                  </span>

                  {/* Equals sign */}
                  <span
                    className="text-xl sm:text-2xl md:text-3xl font-bold transition-colors duration-300"
                    style={{ color: isVisible ? '#00d9a6' : '#444' }}
                  >
                    =
                  </span>

                  {/* Meaning - fades in when spoken */}
                  <div
                    className="flex items-baseline gap-2 transition-opacity duration-400"
                    style={{ opacity: isVisible ? 1 : 0 }}
                  >
                    <span className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                      {item.meaning}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base text-cyan-400/60">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="absolute bottom-12 sm:bottom-20 flex gap-1.5 sm:gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {PERFEITO_MEANINGS.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i < visibleCount ? '#00d9a6' : '#333',
                  transform: i < visibleCount ? 'scale(1)' : 'scale(0.8)',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug - only in dev */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white/30 font-mono">
          Time: {currentTime.toFixed(1)}s | Visible: {visibleCount}/8
        </div>
      )}
    </div>
  );
};

export default V7PhasePERFEITOSynced;
