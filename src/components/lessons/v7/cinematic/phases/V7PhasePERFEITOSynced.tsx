// V7PhasePERFEITOSynced - Synchronized PERFEITO reveal with narration
// ✅ V7-v29: CLEAN DESIGN - No blue boxes, simple reveal effect with sound
// P-E-R-F-E-I-T-O stacked vertically with meanings appearing as spoken

import { useState, useEffect, useRef, useCallback } from 'react';
import { useV7SoundEffects } from '../useV7SoundEffects';

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

// ✅ Busca palavra EXATA no wordTimestamps - retorna o timestamp
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

// ✅ ANCHORTEXT PURO - retorna true SOMENTE quando palavra foi falada
const hasWordBeenSpoken = (timestamps: WordTimestamp[], anchor: string, currentTime: number): boolean => {
  const ts = findExactWordTimestamp(timestamps, anchor);
  if (!ts) return false;
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
  const playedSoundsRef = useRef<Set<number>>(new Set());
  
  // Sound effects
  const { playSound, unlockAudio } = useV7SoundEffects();

  // ✅ Log inicial das palavras relevantes (apenas uma vez)
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

  // ✅ Mostrar conteúdo SOMENTE quando "PERFEITO" for falado
  useEffect(() => {
    if (showContent) return;
    
    const perfeitoSpoken = hasWordBeenSpoken(wordTimestamps, 'PERFEITO', currentTime);
    
    if (perfeitoSpoken) {
      setShowContent(true);
      playSound('reveal');
      console.log(`[V7PhasePERFEITOSynced] 🎬 "PERFEITO" falado @ ${currentTime.toFixed(1)}s - mostrando layout`);
    }
  }, [showContent, currentTime, wordTimestamps, playSound]);

  // ✅ Atualizar visibleCount e tocar sons baseado em anchorText
  useEffect(() => {
    if (!showContent) return;

    let count = 0;
    for (let i = 0; i < PERFEITO_MEANINGS.length; i++) {
      const item = PERFEITO_MEANINGS[i];
      if (hasWordBeenSpoken(wordTimestamps, item.anchorText, currentTime)) {
        count++;
        
        // ✅ Play sound effect for newly revealed letter
        if (!playedSoundsRef.current.has(i)) {
          playedSoundsRef.current.add(i);
          // Pitch increases with each letter for musical progression
          playSound('letter-reveal', { pitch: i });
          console.log(`[V7PhasePERFEITOSynced] 🔊 Sound for letter "${item.letter}"`);
        }
      }
    }

    if (count !== visibleCount) {
      setVisibleCount(count);
      console.log(`[V7PhasePERFEITOSynced] 📊 Visible: ${count}/8 @ ${currentTime.toFixed(1)}s`);
    }
  }, [showContent, currentTime, wordTimestamps, visibleCount, playSound]);

  // ✅ Completar fase SOMENTE quando exitAnchor for falado
  useEffect(() => {
    if (completedRef.current) return;
    
    const exitSpoken = hasWordBeenSpoken(wordTimestamps, exitAnchor, currentTime);
    
    if (exitSpoken) {
      completedRef.current = true;
      playSound('completion');
      console.log(`[V7PhasePERFEITOSynced] ✅ EXIT "${exitAnchor}" falado @ ${currentTime.toFixed(1)}s - completando fase`);
      setTimeout(() => onComplete?.(), 800);
    }
  }, [currentTime, wordTimestamps, exitAnchor, onComplete, playSound]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden pb-16">
      {/* Animated background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 50% at center, rgba(0, 217, 166, ${showContent ? 0.15 : 0.05}) 0%, transparent 70%)`,
          transition: 'all 0.8s ease-out',
        }}
      />
      
      {/* Subtle scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Header */}
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
            color: 'rgba(0, 217, 166, 0.7)',
            textShadow: '0 0 20px rgba(0, 217, 166, 0.4)',
          }}
        >
          M É T O D O
        </span>
      </div>

      {/* PERFEITO Vertical Layout - CLEAN DESIGN */}
      <div
        className="flex flex-col items-start gap-2 sm:gap-3 transition-all duration-700"
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
              className="flex items-center gap-3 sm:gap-5"
              style={{
                opacity: showContent ? 1 : 0,
                transform: showContent ? 'translateX(0)' : 'translateX(-20px)',
                transition: `all 0.4s ease-out ${index * 0.03}s`,
              }}
            >
              {/* Letter - CLEAN, NO BOX */}
              <div className="relative flex items-center justify-center w-14 sm:w-16 md:w-20">
                <span
                  className="text-5xl sm:text-6xl md:text-7xl font-black transition-all duration-500"
                  style={{
                    // Visible: bright gradient, Hidden: very dim
                    background: isVisible
                      ? 'linear-gradient(180deg, #00d9a6 0%, #22D3EE 50%, #00d9a6 100%)'
                      : 'linear-gradient(180deg, rgba(100,100,100,0.3), rgba(60,60,60,0.2))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    // Glow effect when visible
                    filter: isVisible 
                      ? 'drop-shadow(0 0 20px rgba(0, 217, 166, 0.6)) drop-shadow(0 0 40px rgba(0, 217, 166, 0.3))' 
                      : 'none',
                    // Scale pulse on reveal
                    transform: isJustRevealed ? 'scale(1.15)' : 'scale(1)',
                    opacity: isVisible ? 1 : 0.25,
                  }}
                >
                  {item.letter}
                </span>
                
                {/* Burst effect on reveal */}
                {isJustRevealed && (
                  <>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle, rgba(0, 217, 166, 0.5) 0%, transparent 60%)',
                        animation: 'pulse 0.6s ease-out forwards',
                        transform: 'scale(2.5)',
                        opacity: 0.8,
                      }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none rounded-full"
                      style={{
                        border: '2px solid rgba(0, 217, 166, 0.4)',
                        animation: 'ping 0.8s ease-out forwards',
                        transform: 'scale(1)',
                      }}
                    />
                  </>
                )}
              </div>

              {/* Connector line */}
              <div 
                className="h-[2px] transition-all duration-500"
                style={{
                  width: isVisible ? '32px' : '16px',
                  background: isVisible 
                    ? 'linear-gradient(90deg, rgba(0, 217, 166, 0.8), rgba(34, 211, 238, 0.4), transparent)' 
                    : 'rgba(100, 100, 100, 0.2)',
                  boxShadow: isVisible ? '0 0 10px rgba(0, 217, 166, 0.3)' : 'none',
                }}
              />

              {/* Meaning text - slides in smoothly */}
              <div
                className="flex flex-col transition-all duration-500"
                style={{ 
                  opacity: isVisible ? 1 : 0.15,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
                }}
              >
                <span 
                  className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide transition-all duration-300"
                  style={{
                    color: isVisible ? '#ffffff' : 'rgba(150, 150, 150, 0.4)',
                    textShadow: isJustRevealed ? '0 0 15px rgba(255,255,255,0.6)' : 'none',
                  }}
                >
                  {item.meaning}
                </span>
                <span 
                  className="text-xs sm:text-sm font-light -mt-0.5 transition-all duration-300"
                  style={{
                    color: isVisible ? 'rgba(34, 211, 238, 0.8)' : 'rgba(100, 100, 100, 0.3)',
                  }}
                >
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator - bottom */}
      <div
        className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 transition-all duration-500"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        <div className="flex items-center gap-3">
          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {PERFEITO_MEANINGS.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i < visibleCount 
                    ? 'linear-gradient(135deg, #00d9a6, #22D3EE)' 
                    : 'rgba(255,255,255,0.15)',
                  boxShadow: i < visibleCount ? '0 0 8px rgba(0, 217, 166, 0.5)' : 'none',
                  transform: i === visibleCount - 1 ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          {/* Counter */}
          <span 
            className="text-xs font-mono ml-2"
            style={{ color: 'rgba(0, 217, 166, 0.7)' }}
          >
            {visibleCount}/8
          </span>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(3); }
        }
        @keyframes ping {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }
      `}</style>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white/30 font-mono">
          {currentTime.toFixed(1)}s | {visibleCount}/8 | exit: "{exitAnchor}"
        </div>
      )}
    </div>
  );
};

export default V7PhasePERFEITOSynced;
