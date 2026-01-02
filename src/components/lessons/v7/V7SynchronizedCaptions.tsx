// src/components/lessons/v7/V7SynchronizedCaptions.tsx
// ✅ ULTRA-MINIMAL: Single line captions that don't block UI
// - Single line only (no wrapping)
// - Very compact height
// - Positioned at bottom edge
// - Only shows current word + small context

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  V7_SPACING, 
  V7_LAYERS, 
  V7_CLASSES,
  getCaptionWordClass 
} from './v7-design-tokens';

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
  maxWords?: number;
}

// Clean markdown and filter non-spoken words
const cleanWord = (word: string): string | null => {
  if (word.startsWith('#')) return null;
  if (word === '**' || word === '*' || word === '__' || word === '_') return null;
  if (word.startsWith('[') && word.endsWith(']')) return null;
  if (word === '[' || word === ']' || word === '(' || word === ')') return null;
  if (word.startsWith('[') || word.endsWith(']')) return null;
  if (word.includes('**') || word.includes('###') || word.includes('---')) return null;
  if (word.includes('Título') || word.includes('Subtítulo') || word.includes('Categoria') ||
      word.includes('Duração') || word.includes('Roteiro') || word.includes('Template')) return null;

  let cleaned = word
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/^\*|\*$/g, '')
    .replace(/^_|_$/g, '')
    .replace(/^`|`$/g, '')
    .replace(/\[|\]/g, '')
    .trim();

  if (!cleaned || cleaned.length === 0) return null;
  return cleaned;
};

export const V7SynchronizedCaptions = ({
  wordTimestamps,
  currentTime,
  isVisible = true,
  className = '',
  maxWords = 6, // Reduced from 12 to 6 for single line
}: V7SynchronizedCaptionsProps) => {
  const cleanedTimestamps = useMemo(() => {
    return wordTimestamps
      .map((w, index) => {
        const cleaned = cleanWord(w.word);
        if (!cleaned) return null;
        return { ...w, word: cleaned, originalIndex: index };
      })
      .filter(Boolean) as (WordTimestamp & { originalIndex: number })[];
  }, [wordTimestamps]);

  const currentWordIndex = useMemo(() => {
    return cleanedTimestamps.findIndex(
      (word) => currentTime >= word.start && currentTime < word.end
    );
  }, [cleanedTimestamps, currentTime]);

  // Get visible words - fewer words, centered on current
  const visibleWords = useMemo(() => {
    if (currentWordIndex < 0) return [];

    const halfWindow = Math.floor(maxWords / 2);
    let startIdx = Math.max(0, currentWordIndex - halfWindow);
    let endIdx = Math.min(cleanedTimestamps.length, startIdx + maxWords);

    if (endIdx - startIdx < maxWords) {
      startIdx = Math.max(0, endIdx - maxWords);
    }

    return cleanedTimestamps.slice(startIdx, endIdx).map((word, idx) => ({
      ...word,
      absoluteIndex: startIdx + idx,
    }));
  }, [cleanedTimestamps, currentWordIndex, maxWords]);

  const getWordState = (absoluteIndex: number): 'past' | 'current' | 'future' => {
    if (absoluteIndex < currentWordIndex) return 'past';
    if (absoluteIndex === currentWordIndex) return 'current';
    return 'future';
  };

  if (!isVisible || visibleWords.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`v7-captions fixed left-0 right-0 flex justify-center px-4 sm:px-6 pointer-events-none ${className}`}
        style={{
          // ✅ FIX: Position JUST ABOVE the player controls with safe area support
          bottom: V7_SPACING.positions.captions.bottom,
          paddingLeft: V7_SPACING.safeArea.left,
          paddingRight: V7_SPACING.safeArea.right,
          zIndex: V7_LAYERS.captions,
        }}
      >
        {/* Clean minimal caption - safe distance above all controls */}
        <div className={V7_CLASSES.captionContainer}>
          <p className="text-center text-xs sm:text-sm md:text-base flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
            {visibleWords.map((word) => {
              const state = getWordState(word.absoluteIndex);
              return (
                <span
                  key={`${word.absoluteIndex}-${word.word}`}
                  className={`transition-all duration-150 ${getCaptionWordClass(state)}`}
                >
                  {word.word}
                </span>
              );
            })}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
