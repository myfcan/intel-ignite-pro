'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectTransformationViewer - Visualização de transformação impactante
 */
export const CardEffectTransformationViewer: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'number' | 'context' | 'celebration' | 'complete'>('waiting');
  const [displayNumber, setDisplayNumber] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('number');
    setDisplayNumber(0);

    // Animate counter
    const targetNumber = 47;
    const duration = 2000;
    const steps = 30;
    const increment = targetNumber / steps;
    const stepTime = duration / steps;

    for (let i = 1; i <= steps; i++) {
      timersRef.current.push(setTimeout(() => {
        setDisplayNumber(Math.round(increment * i));
      }, stepTime * i));
    }

    timersRef.current.push(setTimeout(() => setPhase('context'), 2500));
    timersRef.current.push(setTimeout(() => setPhase('celebration'), 3500));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 5000));
    timersRef.current.push(setTimeout(() => setLoopCount(prev => prev + 1), 12000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setPhase('waiting');
      setDisplayNumber(0);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';
  const showCelebration = ['celebration', 'complete'].includes(phase);

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Celebration particles */}
      <AnimatePresence>
        {showCelebration && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: '50%',
              top: '40%',
              backgroundColor: ['#fbbf24', '#a855f7', '#ec4899', '#22c55e'][i % 4],
            }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: (Math.random() - 0.5) * 200,
              y: (Math.random() - 0.5) * 200,
            }}
            transition={{ duration: 1.5, delay: i * 0.05 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Big Number */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              <motion.div
                className="text-7xl sm:text-8xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                animate={showCelebration ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: showCelebration ? 2 : 0 }}
              >
                {displayNumber}
              </motion.div>
              <motion.p
                className="text-xl text-white/80 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                vendas em um mês
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context */}
        <AnimatePresence>
          {['context', 'celebration', 'complete'].includes(phase) && (
            <motion.div
              className="mt-8 flex items-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="text-center px-4 py-2 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50">Antes</p>
                <p className="text-lg font-bold text-red-400">2-3</p>
              </div>
              <Zap className="w-6 h-6 text-yellow-400" />
              <div className="text-center px-4 py-2 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50">Depois</p>
                <p className="text-lg font-bold text-emerald-400">47</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Growth indicator */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-6 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <p className="text-sm font-bold text-emerald-400">
                +1.567% de aumento
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span className="text-[9px] text-purple-300">Transformação</span>
      </motion.div>
    </div>
  );
};

export default CardEffectTransformationViewer;
