// src/components/lessons/v7/V7SynchronizedCaptions.tsx
// ✅ LEGENDA ESTÁTICA COM FRASE COMPLETA
// - Exibe 1-2 frases por vez (não palavra por palavra)
// - Transição suave entre frases
// - Leitura natural e confortável
// - Não distrai do visual

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  V7_SPACING, 
  V7_LAYERS, 
  V7_CLASSES,
} from './v7-design-tokens';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface Sentence {
  text: string;
  startTime: number;
  endTime: number;
  words: WordTimestamp[];
}

interface V7SynchronizedCaptionsProps {
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  isVisible?: boolean;
  className?: string;
  maxWords?: number; // Mantido para compatibilidade, mas não usado no novo modelo
}

// Limpa markdown e filtra palavras não-faladas
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

// Verifica se a palavra termina uma frase
const isSentenceEnd = (word: string): boolean => {
  return /[.!?:;]$/.test(word);
};

export const V7SynchronizedCaptions = ({
  wordTimestamps,
  currentTime,
  isVisible = true,
  className = '',
}: V7SynchronizedCaptionsProps) => {
  const [displayedSentence, setDisplayedSentence] = useState<Sentence | null>(null);
  const lastSentenceRef = useRef<string>('');

  // Limpa e agrupa palavras em sentenças
  const sentences = useMemo(() => {
    const cleanedWords: WordTimestamp[] = [];
    
    wordTimestamps.forEach((w) => {
      const cleaned = cleanWord(w.word);
      if (cleaned) {
        cleanedWords.push({ ...w, word: cleaned });
      }
    });

    if (cleanedWords.length === 0) return [];

    const result: Sentence[] = [];
    let currentSentence: WordTimestamp[] = [];
    let sentenceStartTime = 0;

    cleanedWords.forEach((word, index) => {
      if (currentSentence.length === 0) {
        sentenceStartTime = word.start;
      }
      
      currentSentence.push(word);

      // Cria nova frase quando:
      // 1. Encontra pontuação final
      // 2. Ou acumula ~12-15 palavras (para frases longas sem pontuação)
      // 3. Ou há uma pausa longa (>1.5s) entre palavras
      const isEnd = isSentenceEnd(word.word);
      const isTooLong = currentSentence.length >= 15;
      const nextWord = cleanedWords[index + 1];
      const hasLongPause = nextWord && (nextWord.start - word.end) > 1.5;

      if (isEnd || isTooLong || hasLongPause || index === cleanedWords.length - 1) {
        const text = currentSentence.map(w => w.word).join(' ');
        result.push({
          text,
          startTime: sentenceStartTime,
          endTime: word.end,
          words: [...currentSentence],
        });
        currentSentence = [];
      }
    });

    return result;
  }, [wordTimestamps]);

  // Encontra a frase atual baseado no tempo
  const currentSentence = useMemo(() => {
    return sentences.find(
      (sentence) => currentTime >= sentence.startTime && currentTime < sentence.endTime + 0.5
    ) || null;
  }, [sentences, currentTime]);

  // Atualiza a frase exibida com transição suave
  useEffect(() => {
    if (currentSentence && currentSentence.text !== lastSentenceRef.current) {
      lastSentenceRef.current = currentSentence.text;
      setDisplayedSentence(currentSentence);
    }
  }, [currentSentence]);

  if (!isVisible || !displayedSentence) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayedSentence.text}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`v7-captions fixed left-0 right-0 flex justify-center px-4 sm:px-6 pointer-events-none ${className}`}
        style={{
          bottom: V7_SPACING.positions.captions.bottom,
          paddingLeft: V7_SPACING.safeArea.left,
          paddingRight: V7_SPACING.safeArea.right,
          zIndex: V7_LAYERS.captions,
        }}
      >
        {/* Container de legenda estática */}
        <div 
          className="
            bg-black/75 backdrop-blur-md rounded-lg
            px-5 py-3 sm:px-6 sm:py-3.5
            max-w-[85vw] sm:max-w-2xl md:max-w-3xl
            border border-white/10 shadow-lg
          "
        >
          <p 
            className="
              text-center text-white font-medium
              text-base sm:text-lg md:text-xl
              leading-relaxed tracking-wide
            "
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {displayedSentence.text}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
