// V7PhaseLoading - Cinematic loading phase
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface V7PhaseLoadingProps {
  onComplete: () => void;
  duration?: number;
}

export default function V7PhaseLoading({ onComplete, duration = 3000 }: V7PhaseLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        return Math.min(next, 100);
      });
    }, 100);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(onComplete, 300);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Particle effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              y: [null, -100],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Pulsing logo */}
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 20px rgba(var(--primary), 0.3)',
              '0 0 40px rgba(var(--primary), 0.5)',
              '0 0 20px rgba(var(--primary), 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-3xl font-bold text-primary-foreground">V7</span>
        </motion.div>

        {/* Loading text */}
        <motion.p
          className="text-muted-foreground text-sm tracking-wider"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Preparando experiência...
        </motion.p>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-muted/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Progress percentage */}
        <motion.span
          className="text-muted-foreground text-xs font-mono"
          key={Math.floor(progress)}
        >
          {Math.floor(progress)}%
        </motion.span>
      </div>
    </div>
  );
}
