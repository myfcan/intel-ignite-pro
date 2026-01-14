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

  // ✅ V7-vv: Processa texto com destaque semântico por cores
  const renderHighlightedText = (text: string) => {
    // Regex patterns para diferentes tipos de destaque
    const patterns = [
      // 💚 Verde: Valores monetários (R$ XX.XXX, mil reais, etc)
      { regex: /(R\$\s*[\d.,]+|[\d.,]+\s*(?:mil|milhões?|bilhões?)\s*(?:reais|de reais)?)/gi, color: 'text-green-400' },
      // 🔴 Vermelho: Porcentagens e números chocantes
      { regex: /(\d+(?:[.,]\d+)?%)/g, color: 'text-red-400' },
      // 💛 Amarelo: Palavras-chave especiais
      { regex: /\b(PERFEITO|MÉTODO|PROMPTS?|IA|INTELIGÊNCIA ARTIFICIAL|GRATUITO|GRÁTIS|EXCLUSIVO|AGORA|HOJE)\b/gi, color: 'text-yellow-400' },
    ];

    // Divide o texto em partes e aplica cores
    let result: React.ReactNode[] = [];
    let remainingText = text;
    let key = 0;

    // Processa cada pattern
    patterns.forEach(({ regex, color }) => {
      const parts = remainingText.split(regex);
      const matches = remainingText.match(regex) || [];
      
      if (matches.length > 0) {
        result = [];
        parts.forEach((part, index) => {
          if (part) {
            // Verifica se esta parte é um match
            const isMatch = matches.some(m => m.toLowerCase() === part.toLowerCase());
            if (isMatch) {
              result.push(
                <span key={key++} className={`${color} font-semibold`}>
                  {part}
                </span>
              );
            } else {
              result.push(<span key={key++}>{part}</span>);
            }
          }
        });
        remainingText = ''; // Já processado
      }
    });

    // Se nenhum pattern foi encontrado, retorna texto original
    if (result.length === 0) {
      return text;
    }

    return result;
  };

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
          // ✅ Posição mais alta para dar respiro (100px em vez de 80px)
          bottom: '100px',
          paddingLeft: V7_SPACING.safeArea.left,
          paddingRight: V7_SPACING.safeArea.right,
          zIndex: V7_LAYERS.captions,
        }}
      >
        {/* Container de legenda com ajustes V7-vv */}
        <div 
          className="
            backdrop-blur-md rounded-lg
            max-w-[85vw] sm:max-w-2xl md:max-w-3xl
            border border-white/10 shadow-xl
          "
          style={{
            // ✅ Fundo mais escuro (0.8 em vez de 0.75)
            background: 'rgba(0, 0, 0, 0.8)',
            // ✅ Mais padding vertical (16px 24px)
            padding: '16px 24px',
          }}
        >
          <p 
            className="
              text-center text-white font-medium
              leading-relaxed tracking-wide
            "
            style={{
              // ✅ Fonte 20px fixo
              fontSize: '20px',
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
            }}
          >
            {renderHighlightedText(displayedSentence.text)}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
