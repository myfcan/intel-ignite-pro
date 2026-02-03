// V7PhasePERFEITOSynced - Synchronized PERFEITO reveal with narration
// ✅ V7-v60: FIX - Reveal letras SINCRONIZADAS com anchorActions do áudio
// Usa timestamps do banco ao invés de timer fixo de 700ms
// P-E-R-F-E-I-T-O stacked vertically with meanings appearing progressively

import { useState, useEffect, useRef, useMemo } from 'react';
import { useV7SoundEffects } from '../useV7SoundEffects';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

// ✅ V7-v51: Interface para dados dinâmicos do banco
interface LetterData {
  letter: string;
  meaning: string;
  subtitle: string;
}

// ✅ V7-v60: Interface para anchorActions de sincronização
interface LetterAnchorAction {
  id: string;
  keyword: string;
  type: string;
  keywordTime?: number;
  targetId?: string;
}

interface V7PhasePERFEITOSyncedProps {
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  isPlaying: boolean;
  onComplete?: () => void;
  exitAnchor?: string;
  // ✅ V7-v51: Dados dinâmicos do banco
  lettersData?: LetterData[];
  word?: string;
  finalStamp?: string;
  // ✅ V7-v60: AnchorActions para sincronização com áudio
  anchorActions?: LetterAnchorAction[];
}

// PERFEITO letter meanings (FALLBACK se não vier do banco)
const DEFAULT_PERFEITO_MEANINGS = [
  { letter: 'P', meaning: 'Persona', subtitle: 'específica' },
  { letter: 'E', meaning: 'Estrutura', subtitle: 'clara' },
  { letter: 'R', meaning: 'Resultado', subtitle: 'esperado' },
  { letter: 'F', meaning: 'Formato', subtitle: 'definido' },
  { letter: 'E', meaning: 'Exemplos', subtitle: 'práticos' },
  { letter: 'I', meaning: 'Iteração', subtitle: 'contínua' },
  { letter: 'T', meaning: 'Tom', subtitle: 'adequado' },
  { letter: 'O', meaning: 'Otimização', subtitle: 'constante' },
];

// ✅ V7-v60: Fallback interval if no anchorActions (700ms between letters)
const FALLBACK_LETTER_INTERVAL = 700;
const INITIAL_DELAY = 300;

export const V7PhasePERFEITOSynced = ({
  wordTimestamps,
  currentTime,
  isPlaying,
  onComplete,
  exitAnchor = 'teste',
  lettersData,
  word = 'PERFEITO',
  finalStamp,
  anchorActions = [],
}: V7PhasePERFEITOSyncedProps) => {
  // ✅ V7-v51: Usar dados do banco com fallback para dados hardcoded
  const PERFEITO_MEANINGS = lettersData?.length 
    ? lettersData.map((l) => ({
        letter: l.letter,
        meaning: l.meaning,
        subtitle: l.subtitle,
      }))
    : DEFAULT_PERFEITO_MEANINGS;
  
  const [showContent, setShowContent] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);
  const playedSoundsRef = useRef<Set<number>>(new Set());
  const mountTimeRef = useRef<number>(Date.now());
  const revealIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevTimeRef = useRef<number>(0);
  
  // Sound effects
  const { playSound } = useV7SoundEffects();

  // ✅ V7-v60: Extract letter trigger times from anchorActions
  const letterTriggerTimes = useMemo(() => {
    if (!anchorActions || anchorActions.length === 0) {
      console.log('[V7PhasePERFEITOSynced] ⚠️ No anchorActions - using fallback timer');
      return null;
    }
    
    // Find 'show' actions for letters (e.g., c9-mv-p, c9-mv-e1, etc.)
    const letterActions = anchorActions.filter(a => 
      a.type === 'show' && a.keywordTime !== undefined && a.keywordTime > 0
    ).sort((a, b) => (a.keywordTime || 0) - (b.keywordTime || 0));
    
    if (letterActions.length === 0) {
      console.log('[V7PhasePERFEITOSynced] ⚠️ No show actions with keywordTime - using fallback timer');
      return null;
    }
    
    console.log('[V7PhasePERFEITOSynced] ✅ Using anchor-synced reveal:', 
      letterActions.map(a => `${a.keyword}@${a.keywordTime?.toFixed(2)}s`));
    
    return letterActions.map(a => a.keywordTime as number);
  }, [anchorActions]);

  // ✅ V7-v60: Log de inicialização
  useEffect(() => {
    console.log('[V7PhasePERFEITOSynced] 📊 Mounted:', {
      word,
      lettersFromDB: lettersData?.length || 0,
      usingFallback: !lettersData?.length,
      finalStamp,
      currentTime: currentTime.toFixed(1),
      totalLetters: PERFEITO_MEANINGS.length,
      anchorActionsCount: anchorActions?.length || 0,
      usingSyncedReveal: !!letterTriggerTimes,
    });
  }, []);

  // ✅ V7-v60: Mostrar conteúdo imediatamente
  useEffect(() => {
    if (showContent) return;
    
    console.log(`[V7PhasePERFEITOSynced] 🎬 Phase mounted - starting reveal`);
    setShowContent(true);
    playSound('reveal');
  }, [showContent, playSound]);

  // ✅ V7-v60: AUDIO-SYNCED REVEAL - Uses crossing detection on anchorActions
  useEffect(() => {
    if (!letterTriggerTimes || letterTriggerTimes.length === 0) return;
    
    const prevTime = prevTimeRef.current;
    
    // Check each letter's trigger time for crossing
    letterTriggerTimes.forEach((triggerTime, index) => {
      // Crossing detection: prevTime < trigger && currentTime >= trigger
      const crossed = prevTime < triggerTime && currentTime >= triggerTime;
      
      if (crossed && index >= visibleCount) {
        console.log(`[V7PhasePERFEITOSynced] 🎯 CROSSED letter ${index + 1} @ ${triggerTime.toFixed(2)}s`);
        setVisibleCount(index + 1);
        
        // Play sound for this letter
        if (!playedSoundsRef.current.has(index)) {
          playedSoundsRef.current.add(index);
          playSound('letter-reveal', { pitch: index });
          console.log(`[V7PhasePERFEITOSynced] 🔊 Letter ${index + 1}/${PERFEITO_MEANINGS.length}: "${PERFEITO_MEANINGS[index]?.letter}"`);
        }
      }
    });
    
    prevTimeRef.current = currentTime;
  }, [currentTime, letterTriggerTimes, visibleCount, playSound, PERFEITO_MEANINGS]);

  // ✅ V7-v60: FALLBACK TIMER - Only used when no anchorActions available
  useEffect(() => {
    if (letterTriggerTimes) return; // Skip if using audio-synced reveal
    if (!showContent) return;
    
    console.log(`[V7PhasePERFEITOSynced] ⏱️ Using FALLBACK timer (${FALLBACK_LETTER_INTERVAL}ms)`);
    
    const startReveal = () => {
      let letterIndex = 0;
      
      revealIntervalRef.current = setInterval(() => {
        if (letterIndex < PERFEITO_MEANINGS.length) {
          setVisibleCount(letterIndex + 1);
          
          if (!playedSoundsRef.current.has(letterIndex)) {
            playedSoundsRef.current.add(letterIndex);
            playSound('letter-reveal', { pitch: letterIndex });
            console.log(`[V7PhasePERFEITOSynced] 🔊 Letter ${letterIndex + 1}/${PERFEITO_MEANINGS.length}: "${PERFEITO_MEANINGS[letterIndex]?.letter}"`);
          }
          
          letterIndex++;
        } else {
          if (revealIntervalRef.current) {
            clearInterval(revealIntervalRef.current);
            revealIntervalRef.current = null;
          }
          console.log(`[V7PhasePERFEITOSynced] ✅ All ${PERFEITO_MEANINGS.length} letters revealed!`);
        }
      }, FALLBACK_LETTER_INTERVAL);
    };
    
    const initialTimer = setTimeout(startReveal, INITIAL_DELAY);
    
    return () => {
      clearTimeout(initialTimer);
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
      }
    };
  }, [showContent, letterTriggerTimes, playSound, PERFEITO_MEANINGS.length]);

  // ✅ V7-v60: Auto-complete quando todas as letras forem reveladas + delay
  useEffect(() => {
    if (completedRef.current) return;
    if (visibleCount < PERFEITO_MEANINGS.length) return;
    
    const completeTimer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        playSound('completion');
        console.log(`[V7PhasePERFEITOSynced] ✅ Phase complete - all letters revealed`);
        onComplete?.();
      }
    }, 2000); // 2 segundos após a última letra
    
    return () => clearTimeout(completeTimer);
  }, [visibleCount, PERFEITO_MEANINGS.length, onComplete, playSound]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden py-4 pb-44 sm:pb-48">
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at center, rgba(0, 217, 166, 0.08) 0%, transparent 70%)',
          opacity: showContent ? 1 : 0,
        }}
      />

      {/* Header - MÉTODO - positioned relative to content */}
      <div
        className="text-center transition-all duration-700 mb-4"
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

      {/* PERFEITO Vertical Layout - COMPACT for mobile */}
      <div
        className="flex flex-col items-start gap-1 sm:gap-1.5 md:gap-2 transition-all duration-700"
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
              className="flex items-center gap-3 sm:gap-5 transition-all duration-500"
              style={{
                opacity: isRevealed ? 1 : 0.15,
                transform: isRevealed ? 'translateX(0)' : 'translateX(-20px)',
              }}
            >
              {/* Letter - SMALLER for mobile */}
              <span
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black transition-all duration-500 min-w-[28px] sm:min-w-[36px] md:min-w-[48px] lg:min-w-[56px] text-center"
                style={{
                  color: isRevealed ? '#22D3EE' : 'rgba(255, 255, 255, 0.25)',
                  textShadow: isRevealed 
                    ? '0 0 30px rgba(34, 211, 238, 0.9), 0 0 60px rgba(34, 211, 238, 0.5)' 
                    : 'none',
                  transform: isNew ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                {item.letter}
              </span>

              {/* Meaning - compact text */}
              <div
                className="flex flex-col transition-all duration-400"
                style={{ 
                  opacity: isRevealed ? 1 : 0.15,
                  transform: isRevealed ? 'translateX(0)' : 'translateX(-10px)',
                }}
              >
                <span 
                  className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white transition-all duration-300"
                  style={{
                    textShadow: isNew ? '0 0 20px rgba(255,255,255,0.6)' : 'none',
                  }}
                >
                  {item.meaning}
                </span>
                <span 
                  className="text-[10px] sm:text-xs md:text-sm font-light -mt-0.5"
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

      {/* Progress dots - positioned below content */}
      <div
        className="flex items-center gap-2 mt-4 transition-opacity duration-500"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {PERFEITO_MEANINGS.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i < visibleCount ? '#00d9a6' : 'rgba(255,255,255,0.2)',
              boxShadow: i < visibleCount ? '0 0 8px rgba(0, 217, 166, 0.6)' : 'none',
              transform: i === visibleCount - 1 ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
        <span className="text-xs font-mono text-cyan-400/60 ml-2">
          {visibleCount}/{PERFEITO_MEANINGS.length}
        </span>
      </div>
    </div>
  );
};

export default V7PhasePERFEITOSynced;
