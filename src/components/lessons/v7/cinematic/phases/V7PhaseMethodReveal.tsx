import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface V7PhaseMethodRevealProps {
  mainText: string;
  highlightWord: string;
  onComplete?: () => void;
}

/**
 * Componente cinematográfico para revelar "O MÉTODO PERFEITO"
 * Com efeitos de brilho, flash e texto animado
 */
const V7PhaseMethodReveal: React.FC<V7PhaseMethodRevealProps> = ({
  mainText,
  highlightWord,
  onComplete
}) => {
  const [phase, setPhase] = useState<'flash' | 'reveal' | 'glow'>('flash');

  useEffect(() => {
    // Phase 1: Flash (0-500ms)
    const flashTimer = setTimeout(() => {
      setPhase('reveal');
    }, 500);

    // Phase 2: Reveal text (500-1500ms)
    const revealTimer = setTimeout(() => {
      setPhase('glow');
    }, 1500);

    // Phase 3: Glow continues
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden">
      {/* Flash effect */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* Background glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: phase === 'glow' ? 0.8 : 0.4, 
          scale: phase === 'glow' ? 1.5 : 1 
        }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.3) 30%, transparent 70%)'
        }}
      />

      {/* Particle burst effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {phase !== 'flash' && Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: '50%', 
              y: '50%', 
              scale: 0, 
              opacity: 1 
            }}
            animate={{ 
              x: `${50 + (Math.random() - 0.5) * 100}%`,
              y: `${50 + (Math.random() - 0.5) * 100}%`,
              scale: Math.random() * 2 + 0.5,
              opacity: 0
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                : 'linear-gradient(135deg, #a855f7, #6366f1)'
            }}
          />
        ))}
      </div>

      {/* Main Text Container */}
      <div className="relative z-10 text-center">
        {/* Main Text - "O MÉTODO" */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: phase !== 'flash' ? 1 : 0, 
            y: phase !== 'flash' ? 0 : 30 
          }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-white/90 mb-4 tracking-widest"
        >
          {mainText}
        </motion.div>

        {/* Highlight Word - "PERFEITO" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ 
            opacity: phase !== 'flash' ? 1 : 0, 
            scale: phase === 'glow' ? 1.1 : 1,
            y: phase !== 'flash' ? 0 : 50 
          }}
          transition={{ 
            duration: 1,
            delay: 0.6,
            scale: {
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }
          }}
          className="relative"
        >
          {/* Glow behind text */}
          <motion.div
            animate={{ 
              opacity: [0.5, 0.8, 0.5],
              filter: ['blur(20px)', 'blur(40px)', 'blur(20px)']
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
            style={{ filter: 'blur(30px)' }}
          >
            {highlightWord}
          </motion.div>

          {/* Main text */}
          <span className="relative text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-2xl">
            {highlightWord}
          </span>

          {/* Sparkle effect */}
          {phase === 'glow' && (
            <motion.div
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300"
            >
              ✨
            </motion.div>
          )}
        </motion.div>

        {/* Subtitle line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ 
            opacity: phase === 'glow' ? 1 : 0, 
            scaleX: phase === 'glow' ? 1 : 0 
          }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-8 h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        />
      </div>

      {/* Bottom lens flare */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'glow' ? 0.6 : 0 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32"
        style={{
          background: 'linear-gradient(to top, rgba(139, 92, 246, 0.3), transparent)'
        }}
      />
    </div>
  );
};

export default V7PhaseMethodReveal;
