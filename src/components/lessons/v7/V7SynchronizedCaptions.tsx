// src/components/lessons/v7/V7SynchronizedCaptions.tsx
// Synchronized captions that highlight words as audio plays

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface V7SynchronizedCaptionsProps {
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  isVisible?: boolean;
  className?: string;
  maxWords?: number; // Max words to show at once
}

export const V7SynchronizedCaptions = ({
  wordTimestamps,
  currentTime,
  isVisible = true,
  className = '',
  maxWords = 12,
}: V7SynchronizedCaptionsProps) => {
  // Find current word index based on currentTime
  const currentWordIndex = useMemo(() => {
    return wordTimestamps.findIndex(
      (word) => currentTime >= word.start && currentTime < word.end
    );
  }, [wordTimestamps, currentTime]);

  // Get visible words window (centered on current word)
  const visibleWords = useMemo(() => {
    if (currentWordIndex < 0) return [];

    const halfWindow = Math.floor(maxWords / 2);
    let startIdx = Math.max(0, currentWordIndex - halfWindow);
    let endIdx = Math.min(wordTimestamps.length, startIdx + maxWords);

    // Adjust if we're near the end
    if (endIdx - startIdx < maxWords) {
      startIdx = Math.max(0, endIdx - maxWords);
    }

    return wordTimestamps.slice(startIdx, endIdx).map((word, idx) => ({
      ...word,
      absoluteIndex: startIdx + idx,
    }));
  }, [wordTimestamps, currentWordIndex, maxWords]);

  // Calculate which words are past, current, future
  const getWordState = (absoluteIndex: number): 'past' | 'current' | 'future' => {
    if (absoluteIndex < currentWordIndex) return 'past';
    if (absoluteIndex === currentWordIndex) return 'current';
    return 'future';
  };

  if (!isVisible || visibleWords.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`v7-synchronized-captions absolute bottom-24 left-0 right-0 flex justify-center z-30 px-4 sm:px-8 ${className}`}
    >
      <div className="bg-black/80 backdrop-blur-md rounded-lg px-4 sm:px-6 py-3 sm:py-4 max-w-4xl w-full sm:w-auto">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
          <AnimatePresence mode="popLayout">
            {visibleWords.map((word) => {
              const state = getWordState(word.absoluteIndex);
              
              return (
                <motion.span
                  key={`${word.absoluteIndex}-${word.word}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: state === 'future' ? 0.4 : 1,
                    scale: state === 'current' ? 1.15 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    text-sm sm:text-base md:text-lg font-medium transition-colors duration-150
                    ${state === 'current' 
                      ? 'text-cyan-400 bg-cyan-500/20 px-1.5 sm:px-2 py-0.5 rounded' 
                      : state === 'past'
                        ? 'text-white/70'
                        : 'text-white/40'
                    }
                  `}
                >
                  {word.word}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        <div className="mt-2 sm:mt-3 h-0.5 sm:h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentWordIndex + 1) / wordTimestamps.length) * 100}%` 
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};
