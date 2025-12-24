// V7PhasePERFEITOSynced - Synchronized PERFEITO reveal with narration
// ✅ V7-v20: Syncs word reveals with audio timestamps from "Eles" to "constante"
// Creates: 1) PERFEITO slow reveal + 3 blinks, 2) Each meaning word takes center stage

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

// Mapping of PERFEITO letters to their meanings (based on narration)
const PERFEITO_MEANINGS = [
  { letter: 'P', word: 'Persona', searchWord: 'Persona' },
  { letter: 'E', word: 'Estrutura', searchWord: 'Estrutura' },
  { letter: 'R', word: 'Resultado', searchWord: 'Resultado' },
  { letter: 'F', word: 'Formato', searchWord: 'Formato' },
  { letter: 'E', word: 'Exemplos', searchWord: 'Exemplos' },
  { letter: 'I', word: 'Iteração', searchWord: 'Iteração' },
  { letter: 'T', word: 'Tom', searchWord: 'Tom' },
  { letter: 'O', word: 'Otimização', searchWord: 'Otimização' },
];

// Find timestamps for key words in narration
const findWordTimestamp = (timestamps: WordTimestamp[], searchWord: string): WordTimestamp | null => {
  const normalized = searchWord.toLowerCase().replace(/[.,:;!?"]/g, '');
  const found = timestamps.find(t => 
    t.word.toLowerCase().replace(/[.,:;!?"]/g, '') === normalized ||
    t.word.toLowerCase().includes(normalized)
  );
  return found || null;
};

export const V7PhasePERFEITOSynced = ({
  wordTimestamps,
  currentTime,
  isPlaying,
  onComplete,
}: V7PhasePERFEITOSyncedProps) => {
  // Phase states
  const [phase, setPhase] = useState<'waiting' | 'reveal-perfeito' | 'blink' | 'meanings' | 'complete'>('waiting');
  const [blinkCount, setBlinkCount] = useState(0);
  const [currentMeaningIndex, setCurrentMeaningIndex] = useState(-1);
  const [perfeitoVisible, setPerfeitoVisible] = useState(false);
  const completedRef = useRef(false);
  
  // Find key timestamps from narration
  const timings = useMemo(() => {
    // Find "PERFEITO" word timestamp
    const perfeitoTs = findWordTimestamp(wordTimestamps, 'PERFEITO');
    // Find "Eles" (start of narration)
    const elesTs = findWordTimestamp(wordTimestamps, 'Eles');
    // ✅ V7-v22: Find "constante" mais precisamente - última palavra da narração PERFEITO
    // A narração é: "Eles conhecem o segredo. O método PERFEITO. Persona específica. Estrutura clara. 
    // Resultado esperado. Formato definido. Exemplos práticos. Iteração contínua. Tom adequado. Otimização constante"
    const constanteTs = findWordTimestamp(wordTimestamps, 'constante');
    
    // ✅ V7-v22: Find "Otimização" (última palavra do acrônimo, antes de "constante")
    const otimizacaoTs = findWordTimestamp(wordTimestamps, 'Otimização');
    
    // Find each meaning word timestamp
    const meaningTimestamps = PERFEITO_MEANINGS.map(m => ({
      ...m,
      timestamp: findWordTimestamp(wordTimestamps, m.searchWord)
    }));
    
    // ✅ V7-v22: O fim REAL é após "constante", mas usamos "Otimização" como último meaning
    // Se não achar "constante", usamos o fim de "Otimização" + 2 segundos
    const realEnd = constanteTs?.end ?? (otimizacaoTs ? otimizacaoTs.end + 2 : 60);
    
    console.log('[V7PhasePERFEITOSynced] Timings found:', {
      perfeito: perfeitoTs?.start,
      eles: elesTs?.start,
      otimizacao: otimizacaoTs?.end,
      constante: constanteTs?.end,
      realEnd,
      meanings: meaningTimestamps.map(m => `${m.word}: ${m.timestamp?.start}`),
    });
    
    return {
      start: elesTs?.start ?? 0,
      perfeitoReveal: perfeitoTs?.start ?? (elesTs ? elesTs.start + 2 : 2),
      meanings: meaningTimestamps,
      end: realEnd,
    };
  }, [wordTimestamps]);

  // Calculate time into this narration segment
  const relativeTime = currentTime;
  
  // ✅ Phase 1: Wait for "PERFEITO" word, then reveal with slow effect
  useEffect(() => {
    if (phase === 'waiting' && relativeTime >= timings.perfeitoReveal - 0.5) {
      console.log('[V7PhasePERFEITOSynced] 🎬 Starting PERFEITO reveal');
      setPhase('reveal-perfeito');
      setPerfeitoVisible(true);
    }
  }, [phase, relativeTime, timings.perfeitoReveal]);
  
  // ✅ Phase 2: After reveal, do 3 blinks
  useEffect(() => {
    if (phase === 'reveal-perfeito') {
      // Start blinking after initial reveal (1.5s)
      const timer = setTimeout(() => {
        setPhase('blink');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);
  
  // ✅ Phase 2b: Execute 3 blinks
  useEffect(() => {
    if (phase === 'blink' && blinkCount < 3) {
      const timer = setTimeout(() => {
        setBlinkCount(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else if (phase === 'blink' && blinkCount >= 3) {
      // Move to meanings phase
      setPhase('meanings');
    }
  }, [phase, blinkCount]);
  
  // ✅ Phase 3: Sync each meaning word with audio
  useEffect(() => {
    if (phase === 'meanings') {
      // Find which meaning should be shown based on current audio time
      let activeIndex = -1;
      
      for (let i = 0; i < timings.meanings.length; i++) {
        const meaning = timings.meanings[i];
        if (meaning.timestamp && relativeTime >= meaning.timestamp.start) {
          activeIndex = i;
        }
      }
      
      if (activeIndex !== currentMeaningIndex) {
        console.log(`[V7PhasePERFEITOSynced] 📍 Meaning ${activeIndex}: ${PERFEITO_MEANINGS[activeIndex]?.word}`);
        setCurrentMeaningIndex(activeIndex);
      }
    }
  }, [phase, relativeTime, timings.meanings, currentMeaningIndex]);
  
  // ✅ Phase 4: Complete when narration ends AND all meanings were shown
  // ✅ V7-v22: Adiciona verificação de que TODAS as 8 palavras foram mostradas
  useEffect(() => {
    // Só completa se:
    // 1. Tempo passou do fim da narração (após "constante")
    // 2. Todas as 8 palavras do acrônimo foram mostradas (currentMeaningIndex >= 7 = "O" de Otimização)
    const allMeaningsShown = currentMeaningIndex >= PERFEITO_MEANINGS.length - 1;
    
    if (relativeTime >= timings.end && allMeaningsShown && !completedRef.current) {
      completedRef.current = true;
      setPhase('complete');
      console.log('[V7PhasePERFEITOSynced] ✅ Complete - all meanings shown and narration ended');
      onComplete?.();
    }
  }, [relativeTime, timings.end, currentMeaningIndex, onComplete]);

  // Current meaning to display
  const activeMeaning = currentMeaningIndex >= 0 ? PERFEITO_MEANINGS[currentMeaningIndex] : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase === 'meanings' 
            ? 'radial-gradient(circle at center, rgba(0, 217, 166, 0.2) 0%, transparent 60%)'
            : 'radial-gradient(circle at center, rgba(0, 217, 166, 0.1) 0%, transparent 50%)',
        }}
        transition={{ duration: 1 }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE 1 & 2: PERFEITO word reveal + blinks
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {(phase === 'reveal-perfeito' || phase === 'blink') && (
          <motion.div
            key="perfeito-main"
            className="flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            {/* "O Método" subtitle */}
            <motion.span
              className="text-white/60 text-lg sm:text-xl mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              O Método
            </motion.span>

            {/* PERFEITO with slow reveal + blink effect */}
            <motion.h1
              className="text-5xl sm:text-7xl md:text-9xl font-black tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #00d9a6 0%, #22D3EE 50%, #00d9a6 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 60px rgba(0, 217, 166, 0.5)',
              }}
              initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
              animate={{ 
                opacity: phase === 'blink' ? [1, 0.3, 1] : 1, 
                scale: 1, 
                filter: 'blur(0px)',
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                opacity: phase === 'blink' ? { 
                  duration: 0.4, 
                  repeat: blinkCount < 3 ? 1 : 0,
                  repeatType: 'reverse' 
                } : { duration: 1.5, ease: 'easeOut' },
                scale: { duration: 1.5, ease: 'easeOut' },
                filter: { duration: 1.5, ease: 'easeOut' },
                backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
              }}
            >
              PERFEITO
            </motion.h1>

            {/* Glow pulse effect during blink */}
            {phase === 'blink' && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  boxShadow: [
                    'inset 0 0 100px rgba(0, 217, 166, 0)',
                    'inset 0 0 100px rgba(0, 217, 166, 0.3)',
                    'inset 0 0 100px rgba(0, 217, 166, 0)',
                  ],
                }}
                transition={{ duration: 0.4, repeat: 3 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          PHASE 3: Each meaning word takes center stage (MOSAIC EFFECT)
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {phase === 'meanings' && activeMeaning && (
          <motion.div
            key={`meaning-${currentMeaningIndex}`}
            className="flex flex-col items-center justify-center text-center px-4"
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -30 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 20,
              duration: 0.5 
            }}
          >
            {/* Letter with mega glow */}
            <motion.span
              className="text-8xl sm:text-9xl md:text-[12rem] font-black leading-none"
              style={{
                background: 'linear-gradient(135deg, #00d9a6, #22D3EE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 60px rgba(0, 217, 166, 0.6))',
              }}
              animate={{
                scale: [1, 1.05, 1],
                filter: [
                  'drop-shadow(0 0 60px rgba(0, 217, 166, 0.6))',
                  'drop-shadow(0 0 100px rgba(0, 217, 166, 0.9))',
                  'drop-shadow(0 0 60px rgba(0, 217, 166, 0.6))',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {activeMeaning.letter}
            </motion.span>

            {/* Meaning word with typewriter-like growth */}
            <motion.span
              className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mt-4"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
              style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
              }}
            >
              {activeMeaning.word}
            </motion.span>

            {/* Particles/sparkles effect */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-cyan-400"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 100,
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          Small PERFEITO letters at bottom during meanings phase
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'meanings' && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {PERFEITO_MEANINGS.map((item, index) => {
              const isActive = index === currentMeaningIndex;
              const isPast = index < currentMeaningIndex;
              
              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center"
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    opacity: isActive ? 1 : isPast ? 0.7 : 0.4,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    className="text-lg sm:text-2xl font-bold"
                    style={{
                      background: isActive || isPast 
                        ? 'linear-gradient(135deg, #00d9a6, #22D3EE)'
                        : 'linear-gradient(135deg, #666, #888)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {item.letter}
                  </span>
                  {isActive && (
                    <motion.div
                      className="w-1 h-1 rounded-full bg-cyan-400 mt-1"
                      layoutId="activeDot"
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white/40 font-mono">
          Phase: {phase} | Time: {relativeTime.toFixed(1)}s | Meaning: {currentMeaningIndex}
        </div>
      )}
    </div>
  );
};

export default V7PhasePERFEITOSynced;
