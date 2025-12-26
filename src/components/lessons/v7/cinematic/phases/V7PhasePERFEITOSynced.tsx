// V7PhasePERFEITOSynced - Synchronized PERFEITO reveal with narration
// ✅ V7-v28: ANCHORTEXT PURO - ZERO FALLBACKS DE TEMPO
// ✅ V7-v28: Modelo V5 - busca palavra exata no wordTimestamps, dispara quando currentTime >= ts.end
// P-E-R-F-E-I-T-O stacked vertically with meanings appearing as spoken

import { useState, useEffect, useRef } from 'react';

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
  exitAnchor?: string;
}

// PERFEITO letter meanings com anchorText para cada item
const PERFEITO_MEANINGS = [
  { letter: 'P', meaning: 'Persona', subtitle: 'específica', anchorText: 'Persona' },
  { letter: 'E', meaning: 'Estrutura', subtitle: 'clara', anchorText: 'Estrutura' },
  { letter: 'R', meaning: 'Resultado', subtitle: 'esperado', anchorText: 'Resultado' },
  { letter: 'F', meaning: 'Formato', subtitle: 'definido', anchorText: 'Formato' },
  { letter: 'E', meaning: 'Exemplos', subtitle: 'práticos', anchorText: 'Exemplos' },
  { letter: 'I', meaning: 'Iteração', subtitle: 'contínua', anchorText: 'Iteração' },
  { letter: 'T', meaning: 'Tom', subtitle: 'adequado', anchorText: 'Tom' },
  { letter: 'O', meaning: 'Otimização', subtitle: 'constante', anchorText: 'constante' },
];

// ✅ V7-v28: Busca palavra EXATA no wordTimestamps - retorna o timestamp
const findExactWordTimestamp = (timestamps: WordTimestamp[], anchor: string): WordTimestamp | null => {
  if (!timestamps || timestamps.length === 0) return null;
  
  const normalizedAnchor = anchor.toLowerCase().replace(/[.,!?;:'"]/g, '');
  
  for (const ts of timestamps) {
    const normalizedWord = ts.word.toLowerCase().replace(/[.,!?;:'"]/g, '');
    if (normalizedWord === normalizedAnchor) {
      return ts;
    }
  }
  
  return null;
};

// ✅ V7-v28: ANCHORTEXT PURO - retorna true SOMENTE quando palavra foi falada
// Dispara quando currentTime >= timestamp.end da palavra
const hasWordBeenSpoken = (timestamps: WordTimestamp[], anchor: string, currentTime: number): boolean => {
  const ts = findExactWordTimestamp(timestamps, anchor);
  if (!ts) {
    // Palavra não encontrada = nunca dispara
    return false;
  }
  return currentTime >= ts.end;
};

export const V7PhasePERFEITOSynced = ({
  wordTimestamps,
  currentTime,
  isPlaying,
  onComplete,
  exitAnchor = 'constante',
}: V7PhasePERFEITOSyncedProps) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);
  const loggedRef = useRef(false);

  // ✅ V7-v28: Log inicial das palavras relevantes (apenas uma vez)
  useEffect(() => {
    if (loggedRef.current || wordTimestamps.length === 0) return;
    loggedRef.current = true;
    
    const relevantWords = ['PERFEITO', 'Persona', 'Estrutura', 'Resultado', 'Formato', 'Exemplos', 'Iteração', 'Tom', 'constante'];
    const found: string[] = [];
    const notFound: string[] = [];
    
    for (const word of relevantWords) {
      const ts = findExactWordTimestamp(wordTimestamps, word);
      if (ts) {
        found.push(`"${word}" @ ${ts.end.toFixed(1)}s`);
      } else {
        notFound.push(word);
      }
    }
    
    console.log('[V7PhasePERFEITOSynced] ✅ ANCHORTEXT PURO - Palavras encontradas:', found);
    if (notFound.length > 0) {
      console.log('[V7PhasePERFEITOSynced] ⚠️ Palavras NÃO encontradas:', notFound);
    }
  }, [wordTimestamps]);

  // ✅ V7-v28: Mostrar conteúdo SOMENTE quando "PERFEITO" for falado
  // ZERO FALLBACK DE TEMPO - apenas anchorText
  useEffect(() => {
    if (showContent) return;
    
    const perfeitoSpoken = hasWordBeenSpoken(wordTimestamps, 'PERFEITO', currentTime);
    
    if (perfeitoSpoken) {
      setShowContent(true);
      console.log(`[V7PhasePERFEITOSynced] 🎬 "PERFEITO" falado @ ${currentTime.toFixed(1)}s - mostrando layout`);
    }
  }, [showContent, currentTime, wordTimestamps]);

  // ✅ V7-v28: Atualizar visibleCount baseado em anchorText de CADA letra
  // ZERO FALLBACK DE TEMPO - apenas anchorText
  useEffect(() => {
    if (!showContent) return;

    let count = 0;
    for (const item of PERFEITO_MEANINGS) {
      if (hasWordBeenSpoken(wordTimestamps, item.anchorText, currentTime)) {
        count++;
      }
    }

    if (count !== visibleCount) {
      setVisibleCount(count);
      console.log(`[V7PhasePERFEITOSynced] 📊 Visible: ${count}/8 @ ${currentTime.toFixed(1)}s`);
    }
  }, [showContent, currentTime, wordTimestamps, visibleCount]);

  // ✅ V7-v28: Completar fase SOMENTE quando exitAnchor for falado
  // ZERO FALLBACK DE TEMPO - apenas anchorText
  useEffect(() => {
    if (completedRef.current) return;
    
    const exitSpoken = hasWordBeenSpoken(wordTimestamps, exitAnchor, currentTime);
    
    if (exitSpoken) {
      completedRef.current = true;
      console.log(`[V7PhasePERFEITOSynced] ✅ EXIT "${exitAnchor}" falado @ ${currentTime.toFixed(1)}s - completando fase`);
      // Delay para absorver o visual completo
      setTimeout(() => onComplete?.(), 800);
    }
  }, [currentTime, wordTimestamps, exitAnchor, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden pb-24">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 217, 166, 0.12) 0%, transparent 60%)',
        }}
      />

      {/* Header */}
      <div
        className="absolute top-8 sm:top-12 text-center transition-opacity duration-500"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        <span className="text-white/50 text-xs sm:text-sm tracking-[0.3em] uppercase">
          O Método
        </span>
      </div>

      {/* PERFEITO Vertical Layout */}
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
              {/* Letter */}
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

              {/* Equals sign */}
              <span
                className="text-lg sm:text-xl font-bold transition-colors duration-300 w-4"
                style={{ color: isVisible ? '#00d9a6' : '#444' }}
              >
                =
              </span>

              {/* Meaning */}
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

      {/* Progress dots */}
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

      {/* Debug - ANCHORTEXT PURO */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white/30 font-mono">
          {currentTime.toFixed(1)}s | {visibleCount}/8 | exit: "{exitAnchor}"
        </div>
      )}
    </div>
  );
};

export default V7PhasePERFEITOSynced;
