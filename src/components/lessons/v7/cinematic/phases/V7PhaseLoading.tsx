// V7PhaseLoading - Elegant bottom progress bar (player style)
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface V7PhaseLoadingProps {
  onComplete: () => void;
  duration?: number;
}

export default function V7PhaseLoading({ onComplete, duration = 2500 }: V7PhaseLoadingProps) {
  const [progress, setProgress] = useState(0);

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
    <motion.div
      className="fixed bottom-16 left-0 right-0 z-40 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-xl px-6">
        {/* Elegant progress bar - player style */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </div>
        {/* Subtle loading text */}
        <motion.p
          className="text-white/40 text-xs text-center mt-2 tracking-widest uppercase"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Carregando...
        </motion.p>
      </div>
    </motion.div>
  );
}
