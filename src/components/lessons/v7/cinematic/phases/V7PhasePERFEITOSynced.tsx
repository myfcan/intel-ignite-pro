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
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at center, rgba(0, 217, 166, 0.08) 0%, transparent 70%)',
          opacity: showContent ? 1 : 0,
        }}
      />

      {/* Header - MÉTODO */}
      <div
        className="absolute top-8 sm:top-12 text-center transition-all duration-700"
        style={{ 
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
        }}
      >
        <span 
          className="text-xs sm:text-sm tracking-[0.5em] uppercase font-light text-cyan-400/70"
        >
          M É T O D O
        </span>
      </div>

      {/* PERFEITO Vertical Layout - ULTRA CLEAN */}
      <div
        className="flex flex-col items-start gap-4 sm:gap-5 transition-all duration-700"
        style={{ 
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {PERFEITO_MEANINGS.map((item, index) => {
          const isRevealed = index < visibleCount;
          const isNew = index === visibleCount - 1;

          return (
            <div
              key={index}
              className="flex items-center gap-5 sm:gap-8"
            >
              {/* Letter - LARGER, bolder colors */}
              <span
                className="text-6xl sm:text-7xl md:text-8xl font-black transition-all duration-500 min-w-[56px] sm:min-w-[72px] md:min-w-[88px] text-center"
                style={{
                  color: isRevealed ? '#22D3EE' : 'rgba(255, 255, 255, 0.25)',
                  textShadow: isRevealed 
                    ? '0 0 40px rgba(34, 211, 238, 0.9), 0 0 80px rgba(34, 211, 238, 0.5), 0 0 120px rgba(0, 217, 166, 0.3)' 
                    : 'none',
                  transform: isNew ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {item.letter}
              </span>

              {/* Meaning - larger text */}
              <div
                className="flex flex-col transition-all duration-400"
                style={{ 
                  opacity: isRevealed ? 1 : 0.15,
                  transform: isRevealed ? 'translateX(0)' : 'translateX(-10px)',
                }}
              >
                <span 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white transition-all duration-300"
                  style={{
                    textShadow: isNew ? '0 0 25px rgba(255,255,255,0.6)' : 'none',
                  }}
                >
                  {item.meaning}
                </span>
                <span 
                  className="text-sm sm:text-base md:text-lg font-light -mt-0.5"
                  style={{ 
                    color: isRevealed ? '#00d9a6' : 'rgba(100, 100, 100, 0.4)',
                  }}
                >
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress dots - bottom */}
      <div
        className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 transition-opacity duration-500"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {PERFEITO_MEANINGS.map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              background: i < visibleCount ? '#00d9a6' : 'rgba(255,255,255,0.2)',
              boxShadow: i < visibleCount ? '0 0 10px rgba(0, 217, 166, 0.6)' : 'none',
              transform: i === visibleCount - 1 ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
        <span className="text-xs font-mono text-cyan-400/60 ml-3">
          {visibleCount}/8
        </span>
      </div>
    </div>
  );
};

export default V7PhasePERFEITOSynced;
