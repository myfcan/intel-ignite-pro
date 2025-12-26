// V7PhasePERFEITOSynced - Synchronized PERFEITO reveal with narration
// ✅ V7-v26: ANCHORTEXT-BASED como V5 - busca palavras no wordTimestamps
// ✅ V7-v26: Pure CSS transitions - NO Framer Motion trembling
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
  exitAnchor?: string; // ✅ V7-v26: AnchorText de saída (ex: "constante")
}

// PERFEITO letter meanings - agora com anchorText para cada item
const PERFEITO_MEANINGS = [
  { letter: 'P', meaning: 'Persona', subtitle: 'específica', anchorText: 'Persona' },
  { letter: 'E', meaning: 'Estrutura', subtitle: 'clara', anchorText: 'Estrutura' },
  { letter: 'R', meaning: 'Resultado', subtitle: 'esperado', anchorText: 'Resultado' },
  { letter: 'F', meaning: 'Formato', subtitle: 'definido', anchorText: 'Formato' },
  { letter: 'E', meaning: 'Exemplos', subtitle: 'práticos', anchorText: 'Exemplos' },
  { letter: 'I', meaning: 'Iteração', subtitle: 'contínua', anchorText: 'Iteração' },
  { letter: 'T', meaning: 'Tom', subtitle: 'adequado', anchorText: 'Tom' },
  { letter: 'O', meaning: 'Otimização', subtitle: 'constante', anchorText: 'constante' }, // ✅ Última palavra = exitAnchor
];

// ✅ V7-v27: Busca palavra no wordTimestamps - MATCH EXATO APENAS
// Problema anterior: 'constante'.includes('cento') = true causava match prematuro
const findAnchorTimestamp = (timestamps: WordTimestamp[], anchor: string): WordTimestamp | null => {
  if (!timestamps || timestamps.length === 0) return null;
  
  const normalizedAnchor = anchor.toLowerCase().replace(/[.,!?;:'"]/g, '');
  
  for (const ts of timestamps) {
    const normalizedWord = ts.word.toLowerCase().replace(/[.,!?;:'"]/g, '');
    // ✅ MATCH EXATO APENAS - não usa includes()
    if (normalizedWord === normalizedAnchor) {
      return ts;
    }
  }
  
  return null;
};

// ✅ V7-v26: Verifica se anchor foi falado (currentTime >= end do timestamp)
const hasAnchorBeenSpoken = (timestamps: WordTimestamp[], anchor: string, currentTime: number): boolean => {
  const ts = findAnchorTimestamp(timestamps, anchor);
  if (!ts) return false;
  return currentTime >= ts.end;
};

export const V7PhasePERFEITOSynced = ({
  wordTimestamps,
  currentTime,
  isPlaying,
  onComplete,
  exitAnchor = 'constante', // ✅ Default: última palavra do PERFEITO
}: V7PhasePERFEITOSyncedProps) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);

  // ✅ V7-v26: Encontrar timestamp de entrada (PERFEITO) e saída (exitAnchor)
  const timings = useMemo(() => {
    const perfeitoTs = findAnchorTimestamp(wordTimestamps, 'PERFEITO');
    const exitTs = findAnchorTimestamp(wordTimestamps, exitAnchor);

    console.log('[V7PhasePERFEITOSynced] 🎯 AnchorText timings:', {
      perfeito: perfeitoTs ? `start: ${perfeitoTs.start.toFixed(1)}s` : 'NOT FOUND',
      exitAnchor: exitAnchor,
      exitTime: exitTs ? `end: ${exitTs.end.toFixed(1)}s` : 'NOT FOUND',
      totalWords: wordTimestamps.length,
    });

    // Log das palavras encontradas para debug
    if (wordTimestamps.length > 0) {
      const relevantWords = wordTimestamps.filter(ts => {
        const w = ts.word.toLowerCase();
        return w.includes('perfeito') || w.includes('persona') || w.includes('estrutura') || 
               w.includes('resultado') || w.includes('formato') || w.includes('exemplos') ||
               w.includes('iteração') || w.includes('tom') || w.includes('otimização') || 
               w.includes('constante');
      });
      console.log('[V7PhasePERFEITOSynced] 📝 Relevant words in timestamps:', 
        relevantWords.map(w => `"${w.word}" @ ${w.start.toFixed(1)}-${w.end.toFixed(1)}s`));
    }

    return {
      perfeitoStart: perfeitoTs?.start ?? 0,
      exitTime: exitTs?.end ?? 999, // ✅ Se não achar, nunca completa automaticamente
    };
  }, [wordTimestamps, exitAnchor]);

  // Show content when PERFEITO is spoken
  useEffect(() => {
    if (!showContent) {
      const perfeitoSpoken = hasAnchorBeenSpoken(wordTimestamps, 'PERFEITO', currentTime);
      if (perfeitoSpoken || currentTime >= timings.perfeitoStart) {
        setShowContent(true);
        console.log('[V7PhasePERFEITOSynced] 🎬 PERFEITO anchor detected - showing layout');
      }
    }
  }, [showContent, currentTime, wordTimestamps, timings.perfeitoStart]);

  // ✅ V7-v26: Update visible count baseado em anchorText de CADA item
  useEffect(() => {
    if (!showContent) return;

    let count = 0;
    for (const item of PERFEITO_MEANINGS) {
      if (hasAnchorBeenSpoken(wordTimestamps, item.anchorText, currentTime)) {
        count++;
      }
    }

    if (count !== visibleCount) {
      setVisibleCount(count);
      console.log(`[V7PhasePERFEITOSynced] 📊 Visible: ${count}/8 at ${currentTime.toFixed(1)}s`);
    }
  }, [showContent, currentTime, wordTimestamps, visibleCount]);

  // ✅ V7-v26: Complete SOMENTE quando exitAnchor for falado
  // NÃO depende de visibleCount - depende APENAS do anchorText
  useEffect(() => {
    if (completedRef.current) return;
    
    const exitAnchorSpoken = hasAnchorBeenSpoken(wordTimestamps, exitAnchor, currentTime);
    
    if (exitAnchorSpoken) {
      completedRef.current = true;
      console.log(`[V7PhasePERFEITOSynced] ✅ EXIT ANCHOR "${exitAnchor}" detected at ${currentTime.toFixed(1)}s - completing phase`);
      // Delay para absorver o visual completo
      setTimeout(() => onComplete?.(), 800);
    }
  }, [currentTime, wordTimestamps, exitAnchor, onComplete]);

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
          {currentTime.toFixed(1)}s | {visibleCount}/8 | exit: {timings.exitTime.toFixed(1)}s
        </div>
      )}
    </div>
  );
};

export default V7PhasePERFEITOSynced;
