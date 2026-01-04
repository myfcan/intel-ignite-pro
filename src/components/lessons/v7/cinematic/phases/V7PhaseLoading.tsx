// V7PhaseLoading - Elegant minimal loading bar (não ocupa tela toda)
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface V7PhaseLoadingProps {
  onComplete: () => void;
  duration?: number;
}

export default function V7PhaseLoading({ onComplete, duration = 2500 }: V7PhaseLoadingProps) {
  const [progress, setProgress] = useState(0);

  // ✅ FIX: Use ref to store onComplete so the effect doesn't re-run when callback changes
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 20;
        return Math.min(next, 100);
      });
    }, 80);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => onCompleteRef.current(), 200);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Minimal centered loading bar */}
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        {/* Subtle loading text */}
        <motion.p
          className="text-muted-foreground/60 text-sm tracking-widest uppercase"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Carregando...
        </motion.p>

        {/* Elegant progress bar */}
        <div className="w-64 h-1 bg-muted/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
