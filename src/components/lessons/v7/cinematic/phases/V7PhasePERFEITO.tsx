// V7PhasePERFEITO - Typewriter effect for "MÉTODO PERFEITO" reveal
// Creates dramatic letter-by-letter reveal with glow effects

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface V7PhasePERFEITOProps {
  onComplete?: () => void;
  autoAdvance?: boolean;
  advanceDelay?: number;
}

const LETTERS = ['P', 'E', 'R', 'F', 'E', 'I', 'T', 'O'];
const LETTER_MEANINGS = [
  { letter: 'P', meaning: 'Persona' },
  { letter: 'E', meaning: 'Especificidade' },
  { letter: 'R', meaning: 'Resultado' },
  { letter: 'F', meaning: 'Formato' },
  { letter: 'E', meaning: 'Exemplos' },
  { letter: 'I', meaning: 'Iteração' },
  { letter: 'T', meaning: 'Tom' },
  { letter: 'O', meaning: 'Objetivo' },
];

export const V7PhasePERFEITO = ({
  onComplete,
  autoAdvance = true,
  advanceDelay = 6000,
}: V7PhasePERFEITOProps) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [currentMeaningIndex, setCurrentMeaningIndex] = useState(-1);

  // Reveal letters one by one
  useEffect(() => {
    if (revealedCount < LETTERS.length) {
      const timer = setTimeout(() => {
        setRevealedCount((prev) => prev + 1);
        setCurrentMeaningIndex(revealedCount);
        setShowMeaning(true);

        // Hide meaning after a short delay
        setTimeout(() => setShowMeaning(false), 400);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [revealedCount]);

  // Auto advance after animation completes
  useEffect(() => {
    if (revealedCount >= LETTERS.length && autoAdvance) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, advanceDelay);
      return () => clearTimeout(timer);
    }
  }, [revealedCount, autoAdvance, advanceDelay, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 pb-24">
      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-white/60 text-lg sm:text-xl">O Método</span>
      </motion.div>

      {/* PERFEITO Letters */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {LETTERS.map((letter, index) => {
          const isRevealed = index < revealedCount;
          const isJustRevealed = index === revealedCount - 1;
          const meaning = LETTER_MEANINGS[index];

          return (
            <motion.div
              key={`${letter}-${index}`}
              className="relative"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isRevealed ? 1 : 0.2,
                scale: isRevealed ? 1 : 0.5,
              }}
              transition={{
                duration: 0.3,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            >
              {/* Letter */}
              <motion.span
                className="text-5xl sm:text-7xl md:text-8xl font-black"
                style={{
                  background: isRevealed
                    ? 'linear-gradient(135deg, #00d9a6, #22D3EE)'
                    : 'linear-gradient(135deg, #333, #555)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: isRevealed
                    ? 'drop-shadow(0 0 30px rgba(0, 217, 166, 0.5))'
                    : 'none',
                }}
                animate={
                  isJustRevealed
                    ? {
                        scale: [1, 1.3, 1],
                        filter: [
                          'drop-shadow(0 0 30px rgba(0, 217, 166, 0.5))',
                          'drop-shadow(0 0 60px rgba(0, 217, 166, 0.8))',
                          'drop-shadow(0 0 30px rgba(0, 217, 166, 0.5))',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                {letter}
              </motion.span>

              {/* Meaning tooltip - shows briefly when letter appears */}
              <AnimatePresence>
                {showMeaning && currentMeaningIndex === index && (
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-cyan-400 text-sm font-medium">
                      {meaning.meaning}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Full reveal - meanings list */}
      <AnimatePresence>
        {revealedCount >= LETTERS.length && (
          <motion.div
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {LETTER_MEANINGS.map((item, index) => (
              <motion.div
                key={item.letter + index}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <span
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #00d9a6, #22D3EE)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {item.letter}
                </span>
                <span className="text-white/60 text-sm block">{item.meaning}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow effect behind letters */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(0, 217, 166, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          opacity: revealedCount >= LETTERS.length ? [0.3, 0.6, 0.3] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

export default V7PhasePERFEITO;
