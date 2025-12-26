// V7PhasePERFEITOSynced - Synchronized PERFEITO reveal with narration
// ✅ V7-v23: VERTICAL LAYOUT - P-E-R-F-E-I-T-O stacked with meanings appearing horizontally
// Creates typewriter effect with blur as each meaning is spoken

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
  { letter: 'P', word: 'Persona', subtitle: 'específica', searchWord: 'Persona' },
  { letter: 'E', word: 'Estrutura', subtitle: 'clara', searchWord: 'Estrutura' },
  { letter: 'R', word: 'Resultado', subtitle: 'esperado', searchWord: 'Resultado' },
  { letter: 'F', word: 'Formato', subtitle: 'definido', searchWord: 'Formato' },
  { letter: 'E', word: 'Exemplos', subtitle: 'práticos', searchWord: 'Exemplos' },
  { letter: 'I', word: 'Iteração', subtitle: 'contínua', searchWord: 'Iteração' },
  { letter: 'T', word: 'Tom', subtitle: 'adequado', searchWord: 'Tom' },
  { letter: 'O', word: 'Otimização', subtitle: 'constante', searchWord: 'Otimização' },
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
  const [visibleMeanings, setVisibleMeanings] = useState<number[]>([]);
  const [perfeitoVisible, setPerfeitoVisible] = useState(false);
  const completedRef = useRef(false);

  // Find key timestamps from narration
  const timings = useMemo(() => {
    // Find "PERFEITO" word timestamp
    const perfeitoTs = findWordTimestamp(wordTimestamps, 'PERFEITO');
    // Find "Eles" (start of narration)
    const elesTs = findWordTimestamp(wordTimestamps, 'Eles');
    // Find "constante" (last word of PERFEITO narration)
    const constanteTs = findWordTimestamp(wordTimestamps, 'constante');

    // Find each meaning word timestamp
    const meaningTimestamps = PERFEITO_MEANINGS.map(m => ({
      ...m,
      timestamp: findWordTimestamp(wordTimestamps, m.searchWord)
    }));

    const realEnd = constanteTs?.end ?? 60;

    console.log('[V7PhasePERFEITOSynced] Timings found:', {
      perfeito: perfeitoTs?.start,
      eles: elesTs?.start,
      constante: constanteTs?.end,
      realEnd,
      meanings: meaningTimestamps.map(m => `${m.word}: ${m.timestamp?.start?.toFixed(1)}s`),
    });

    return {
      start: elesTs?.start ?? 0,
      perfeitoReveal: perfeitoTs?.start ?? (elesTs ? elesTs.start + 2 : 2),
      meanings: meaningTimestamps,
      end: realEnd,
    };
  }, [wordTimestamps]);

  const relativeTime = currentTime;

  // Phase 1: Wait for "PERFEITO" word, then show vertical letters
  useEffect(() => {
    if (phase === 'waiting' && relativeTime >= timings.perfeitoReveal - 0.5) {
      console.log('[V7PhasePERFEITOSynced] 🎬 Starting PERFEITO vertical reveal');
      setPhase('reveal-perfeito');
      setPerfeitoVisible(true);
    }
  }, [phase, relativeTime, timings.perfeitoReveal]);

  // Phase 2: After initial reveal, do 3 blinks
  useEffect(() => {
    if (phase === 'reveal-perfeito') {
      const timer = setTimeout(() => {
        setPhase('blink');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 2b: Execute 3 blinks
  useEffect(() => {
    if (phase === 'blink' && blinkCount < 3) {
      const timer = setTimeout(() => {
        setBlinkCount(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else if (phase === 'blink' && blinkCount >= 3) {
      setPhase('meanings');
    }
  }, [phase, blinkCount]);

  // Phase 3: Show each meaning when spoken in audio
  useEffect(() => {
    if (phase === 'meanings') {
      const newVisible: number[] = [];

      for (let i = 0; i < timings.meanings.length; i++) {
        const meaning = timings.meanings[i];
        if (meaning.timestamp && relativeTime >= meaning.timestamp.start) {
          newVisible.push(i);
        }
      }

      if (newVisible.length !== visibleMeanings.length) {
        console.log(`[V7PhasePERFEITOSynced] 📍 Meanings visible: ${newVisible.length}/8`);
        setVisibleMeanings(newVisible);
      }
    }
  }, [phase, relativeTime, timings.meanings, visibleMeanings.length]);

  // Phase 4: Complete when all meanings shown and narration ends
  useEffect(() => {
    const allMeaningsShown = visibleMeanings.length >= PERFEITO_MEANINGS.length;

    if (relativeTime >= timings.end && allMeaningsShown && !completedRef.current) {
      completedRef.current = true;
      setPhase('complete');
      console.log('[V7PhasePERFEITOSynced] ✅ Complete - all meanings shown');
      onComplete?.();
    }
  }, [relativeTime, timings.end, visibleMeanings.length, onComplete]);

  // Typewriter text component with blur effect
  const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
      setDisplayText('');
      setIsTyping(true);

      const timeout = setTimeout(() => {
        let index = 0;
        const interval = setInterval(() => {
          if (index < text.length) {
            setDisplayText(text.slice(0, index + 1));
            index++;
          } else {
            setIsTyping(false);
            clearInterval(interval);
          }
        }, 50); // 50ms per character

        return () => clearInterval(interval);
      }, delay);

      return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
      <span className="relative">
        {displayText}
        {isTyping && (
          <motion.span
            className="inline-block w-0.5 h-full bg-cyan-400 ml-0.5"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase === 'meanings'
            ? 'radial-gradient(circle at center, rgba(0, 217, 166, 0.15) 0%, transparent 60%)'
            : 'radial-gradient(circle at center, rgba(0, 217, 166, 0.08) 0%, transparent 50%)',
        }}
        transition={{ duration: 1 }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          "O Método" header
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {perfeitoVisible && (
          <motion.div
            className="absolute top-8 sm:top-16 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-white/60 text-sm sm:text-lg tracking-widest uppercase">
              O Método
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          VERTICAL P-E-R-F-E-I-T-O with meanings
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {perfeitoVisible && (
          <motion.div
            className="flex flex-col items-start gap-1 sm:gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: phase === 'blink' ? [1, 0.3, 1] : 1,
              scale: 1
            }}
            transition={{
              opacity: phase === 'blink' ? { duration: 0.4, repeat: blinkCount < 3 ? 1 : 0 } : { duration: 0.5 },
              scale: { duration: 0.5 }
            }}
          >
            {PERFEITO_MEANINGS.map((item, index) => {
              const isVisible = phase === 'meanings' && visibleMeanings.includes(index);
              const showLetter = phase !== 'waiting';

              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 sm:gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: showLetter ? 1 : 0,
                    x: showLetter ? 0 : -20
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.08
                  }}
                >
                  {/* Letter */}
                  <motion.span
                    className="text-4xl sm:text-6xl md:text-7xl font-black w-12 sm:w-16 md:w-20 text-center"
                    style={{
                      background: isVisible
                        ? 'linear-gradient(135deg, #00d9a6 0%, #22D3EE 100%)'
                        : 'linear-gradient(135deg, #666 0%, #888 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: isVisible ? 'drop-shadow(0 0 20px rgba(0, 217, 166, 0.6))' : 'none',
                    }}
                    animate={{
                      scale: isVisible ? [1, 1.1, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.letter}
                  </motion.span>

                  {/* = sign */}
                  <motion.span
                    className="text-2xl sm:text-3xl md:text-4xl font-bold"
                    style={{
                      color: isVisible ? '#00d9a6' : '#555',
                    }}
                  >
                    =
                  </motion.span>

                  {/* Meaning with typewriter effect */}
                  <motion.div
                    className="flex items-baseline gap-2"
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{
                      opacity: isVisible ? 1 : 0,
                      filter: isVisible ? 'blur(0px)' : 'blur(10px)'
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {isVisible && (
                      <>
                        <span
                          className="text-xl sm:text-2xl md:text-3xl font-bold text-white"
                          style={{
                            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <TypewriterText text={item.word} />
                        </span>
                        <span className="text-sm sm:text-base md:text-lg text-cyan-400/70">
                          {item.subtitle}
                        </span>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <AnimatePresence>
        {phase === 'meanings' && (
          <motion.div
            className="absolute bottom-8 sm:bottom-16 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex gap-2">
              {PERFEITO_MEANINGS.map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  animate={{
                    backgroundColor: visibleMeanings.includes(i) ? '#00d9a6' : '#333',
                    scale: visibleMeanings.includes(i) ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle effects when meanings appear */}
      <AnimatePresence>
        {phase === 'meanings' && visibleMeanings.length > 0 && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1 h-1 rounded-full bg-cyan-400"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 text-xs text-white/40 font-mono">
          Phase: {phase} | Time: {relativeTime.toFixed(1)}s | Visible: {visibleMeanings.length}/8
        </div>
      )}
    </div>
  );
};

export default V7PhasePERFEITOSynced;
