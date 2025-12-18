// src/components/lessons/v7/V7SynchronizedCaptions.tsx
// ✅ REFACTORED: Clean, minimal captions that don't block interaction
// - Removed progress bar
// - Added pointer-events-none
// - Positioned higher to not overlap buttons
// - Reduced animations for stability

import { useMemo } from 'react';
import { motion } from 'framer-motion';

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
  // Skip markdown headers
  if (word.startsWith('#')) return null;
  // Skip markdown bold/italic markers
  if (word === '**' || word === '*' || word === '__' || word === '_') return null;
  // Skip markdown links
  if (word.startsWith('[') && word.endsWith(']')) return null;
  // Skip pure brackets
  if (word === '[' || word === ']' || word === '(' || word === ')') return null;
  // Skip stage directions like [ATO 1:]
  if (word.startsWith('[') || word.endsWith(']')) return null;
  // Skip template markers
  if (word.includes('**') || word.includes('###') || word.includes('---')) return null;
  // Skip metadata-like text
  if (word.includes('Título') || word.includes('Subtítulo') || word.includes('Categoria') || 
      word.includes('Duração') || word.includes('Roteiro') || word.includes('Template')) return null;
  
  // Clean remaining markdown from word
  let cleaned = word
    .replace(/^\*\*|\*\*$/g, '') // Remove bold markers
    .replace(/^\*|\*$/g, '')     // Remove italic markers
    .replace(/^_|_$/g, '')       // Remove underscores
    .replace(/^`|`$/g, '')       // Remove code markers
    .replace(/\[|\]/g, '')       // Remove brackets
    .trim();
  
  // Skip if empty after cleaning
  if (!cleaned || cleaned.length === 0) return null;
  
  return cleaned;
};

export const V7SynchronizedCaptions = ({
  wordTimestamps,
  currentTime,
  isVisible = true,
  className = '',
  maxWords = 12,
}: V7SynchronizedCaptionsProps) => {
  // Filter and clean words
  const cleanedTimestamps = useMemo(() => {
    return wordTimestamps
      .map((w, index) => {
        const cleaned = cleanWord(w.word);
        if (!cleaned) return null;
        return { ...w, word: cleaned, originalIndex: index };
      })
      .filter(Boolean) as (WordTimestamp & { originalIndex: number })[];
  }, [wordTimestamps]);

  // Find current word index based on currentTime
  const currentWordIndex = useMemo(() => {
    return cleanedTimestamps.findIndex(
      (word) => currentTime >= word.start && currentTime < word.end
    );
  }, [cleanedTimestamps, currentTime]);

  // Get visible words window (centered on current word)
  const visibleWords = useMemo(() => {
    if (currentWordIndex < 0) return [];

    const halfWindow = Math.floor(maxWords / 2);
    let startIdx = Math.max(0, currentWordIndex - halfWindow);
    let endIdx = Math.min(cleanedTimestamps.length, startIdx + maxWords);

    // Adjust if we're near the end
    if (endIdx - startIdx < maxWords) {
      startIdx = Math.max(0, endIdx - maxWords);
    }

    return cleanedTimestamps.slice(startIdx, endIdx).map((word, idx) => ({
      ...word,
      absoluteIndex: startIdx + idx,
    }));
  }, [cleanedTimestamps, currentWordIndex, maxWords]);

  // Calculate which words are past, current, future
  const getWordState = (absoluteIndex: number): 'past' | 'current' | 'future' => {
    if (absoluteIndex < currentWordIndex) return 'past';
    if (absoluteIndex === currentWordIndex) return 'current';
    return 'future';
  };

  if (!isVisible || visibleWords.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`v7-captions fixed bottom-36 left-0 right-0 flex justify-center z-20 px-4 pointer-events-none ${className}`}
    >
      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-5 py-3 max-w-3xl">
        <p className="text-center text-base sm:text-lg leading-relaxed flex flex-wrap justify-center gap-x-1.5 gap-y-1">
          {visibleWords.map((word) => {
            const state = getWordState(word.absoluteIndex);
            return (
              <span
                key={`${word.absoluteIndex}-${word.word}`}
                className={`
                  transition-colors duration-200
                  ${state === 'current'
                    ? 'text-cyan-400 font-semibold bg-cyan-500/20 px-1 rounded'
                    : state === 'past'
                      ? 'text-white/60'
                      : 'text-white/40'
                  }
                `}
              >
                {word.word}
              </span>
            );
          })}
        </p>
      </div>
    </motion.div>
  );
};