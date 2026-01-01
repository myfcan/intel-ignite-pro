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
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden pb-16">
      {/* Animated background glow - pulsing */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 50% at center, rgba(0, 217, 166, ${showContent ? 0.15 : 0.05}) 0%, transparent 70%)`,
          transition: 'all 0.8s ease-out',
        }}
      />
      
      {/* Scanlines effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
        }}
      />

      {/* Header with glow */}
      <div
        className="absolute top-6 sm:top-10 text-center transition-all duration-700"
        style={{ 
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
        }}
      >
        <span 
          className="text-xs sm:text-sm tracking-[0.5em] uppercase font-light"
          style={{
            color: 'rgba(0, 217, 166, 0.6)',
            textShadow: '0 0 20px rgba(0, 217, 166, 0.3)',
          }}
        >
          O Método
        </span>
      </div>

      {/* PERFEITO Vertical Layout - Modern Design */}
      <div
        className="flex flex-col items-start gap-1 sm:gap-2 transition-all duration-700"
        style={{ 
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        {PERFEITO_MEANINGS.map((item, index) => {
          const isVisible = index < visibleCount;
          const isJustRevealed = index === visibleCount - 1;

          return (
            <div
              key={index}
              className="flex items-center gap-3 sm:gap-4 group"
              style={{
                opacity: showContent ? 1 : 0.3,
                transform: showContent ? 'translateX(0)' : 'translateX(-20px)',
                transition: `all 0.5s ease-out ${index * 0.05}s`,
              }}
            >
              {/* Letter - Large and prominent */}
              <div className="relative">
                <span
                  className="text-4xl sm:text-5xl md:text-6xl font-black w-12 sm:w-14 md:w-16 text-center inline-block transition-all duration-500"
                  style={{
                    background: isVisible
                      ? 'linear-gradient(180deg, #00d9a6 0%, #22D3EE 50%, #00d9a6 100%)'
                      : 'linear-gradient(180deg, #2a2a2a, #1a1a1a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: isVisible 
                      ? 'drop-shadow(0 0 25px rgba(0, 217, 166, 0.6))' 
                      : 'none',
                    transform: isJustRevealed ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {item.letter}
                </span>
                
                {/* Glow ring for just revealed letter */}
                {isJustRevealed && (
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(0, 217, 166, 0.4) 0%, transparent 70%)',
                      animation: 'pulse 0.6s ease-out',
                      transform: 'scale(2)',
                    }}
                  />
                )}
              </div>

              {/* Connector line */}
              <div 
                className="h-[2px] transition-all duration-500"
                style={{
                  width: isVisible ? '24px' : '12px',
                  background: isVisible 
                    ? 'linear-gradient(90deg, #00d9a6, transparent)' 
                    : '#2a2a2a',
                  opacity: isVisible ? 1 : 0.3,
                }}
              />

              {/* Meaning text - slides in from left */}
              <div
                className="flex flex-col transition-all duration-500"
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-16px)',
                  filter: isVisible ? 'none' : 'blur(4px)',
                }}
              >
                <span 
                  className="text-base sm:text-lg md:text-xl font-bold tracking-wide"
                  style={{
                    color: '#ffffff',
                    textShadow: isJustRevealed ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                  }}
                >
                  {item.meaning}
                </span>
                <span 
                  className="text-xs sm:text-sm font-light -mt-0.5"
                  style={{
                    color: 'rgba(34, 211, 238, 0.7)',
                  }}
                >
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern progress indicator - bottom bar */}
      <div
        className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 transition-all duration-500"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div 
            className="w-32 sm:w-40 h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(visibleCount / 8) * 100}%`,
                background: 'linear-gradient(90deg, #00d9a6, #22D3EE)',
                boxShadow: '0 0 10px rgba(0, 217, 166, 0.5)',
              }}
            />
          </div>
          {/* Counter */}
          <span 
            className="text-xs font-mono"
            style={{ color: 'rgba(0, 217, 166, 0.6)' }}
          >
            {visibleCount}/8
          </span>
        </div>
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
