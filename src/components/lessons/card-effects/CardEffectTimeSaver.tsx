'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, FileText } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectTimeSaver - Mostra economia de tempo com I.A.
 * 10 posts em 10 minutos
 */
export const CardEffectTimeSaver: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'before' | 'process' | 'after' | 'complete'>('waiting');
  const [postCount, setPostCount] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('before');
    setPostCount(0);

    timersRef.current.push(setTimeout(() => setPhase('process'), 1500));

    // Count up posts
    for (let i = 1; i <= 10; i++) {
      timersRef.current.push(setTimeout(() => setPostCount(i), 1800 + i * 150));
    }

    timersRef.current.push(setTimeout(() => setPhase('after'), 4000));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 5500));
    // Loop 2x
    timersRef.current.push(setTimeout(() => {
      if (loopCount < 1) {
        setLoopCount(prev => prev + 1);
      }
    }, 12000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setPhase('waiting');
      setPostCount(0);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950">
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Clock animation */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center"
                animate={phase === 'process' ? { rotate: 360 } : {}}
                transition={{ duration: 2, ease: 'linear', repeat: phase === 'process' ? Infinity : 0 }}
              >
                <Clock className="w-10 h-10 text-white" />
              </motion.div>

              {/* Time indicator */}
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-xs font-bold text-white">10 min</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post counter */}
        <AnimatePresence>
          {['process', 'after', 'complete'].includes(phase) && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-6 h-6 text-emerald-400" />
                <motion.span
                  className="text-5xl font-black text-white"
                  key={postCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {postCount}
                </motion.span>
                <span className="text-xl text-white/60">posts</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Before/After comparison */}
        <AnimatePresence>
          {['after', 'complete'].includes(phase) && (
            <motion.div
              className="flex items-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="text-center px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-300">Antes</p>
                <p className="text-lg font-bold text-red-400">8h/dia</p>
              </div>
              <Zap className="w-6 h-6 text-yellow-400" />
              <div className="text-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-xs text-emerald-300">Agora</p>
                <p className="text-lg font-bold text-emerald-400">10 min</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.p
              className="mt-6 text-sm text-emerald-300/80 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Não é sobre trabalhar mais. É sobre <span className="font-bold text-white">trabalhar melhor</span>.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Clock className="w-3 h-3 text-emerald-400" />
        <span className="text-[9px] text-emerald-300">Economia</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              (phase === 'before' && i === 0) ||
              (phase === 'process' && i <= 2) ||
              (phase === 'after' && i <= 3) ||
              (phase === 'complete' && i <= 4)
                ? 'bg-emerald-400'
                : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectTimeSaver;
