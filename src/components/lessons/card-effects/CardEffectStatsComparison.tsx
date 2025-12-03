'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectStatsComparison - Comparação de estatísticas Antes/Depois
 */
export const CardEffectStatsComparison: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'before' | 'arrow' | 'after' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('before');

    timersRef.current.push(setTimeout(() => setPhase('arrow'), 1500));
    timersRef.current.push(setTimeout(() => setPhase('after'), 2500));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 4000));
    timersRef.current.push(setTimeout(() => setLoopCount(prev => prev + 1), 12000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setPhase('waiting');
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';
  const showBefore = ['before', 'arrow', 'after', 'complete'].includes(phase);
  const showArrow = ['arrow', 'after', 'complete'].includes(phase);
  const showAfter = ['after', 'complete'].includes(phase);

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <motion.h3
          className="text-lg font-bold text-white mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 1 : 0 }}
        >
          A Transformação em Números
        </motion.h3>

        <div className="flex items-center gap-4 sm:gap-8">
          {/* BEFORE */}
          <AnimatePresence>
            {showBefore && (
              <motion.div
                className="text-center p-4 sm:p-6 bg-red-500/10 border border-red-500/30 rounded-xl min-w-[120px]"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-xs text-red-300 mb-1">ANTES</p>
                <p className="text-3xl font-bold text-red-400">30</p>
                <p className="text-xs text-white/60">posts/mês</p>
                <div className="mt-3 pt-3 border-t border-red-500/20">
                  <p className="text-xl font-bold text-red-400">2-3</p>
                  <p className="text-xs text-white/60">vendas</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ARROW */}
          <AnimatePresence>
            {showArrow && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-8 h-8 text-white/50" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AFTER */}
          <AnimatePresence>
            {showAfter && (
              <motion.div
                className="text-center p-4 sm:p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl min-w-[120px]"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-emerald-300 mb-1">DEPOIS</p>
                <p className="text-3xl font-bold text-emerald-400">8</p>
                <p className="text-xs text-white/60">posts/mês</p>
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <p className="text-xl font-bold text-emerald-400">47</p>
                  <p className="text-xs text-white/60">vendas</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Conclusion */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-8 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="text-sm text-emerald-300 font-medium">
                -73% posts, +1.467% vendas
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <TrendingUp className="w-3 h-3 text-emerald-400" />
        <span className="text-[9px] text-emerald-300">Resultados Reais</span>
      </motion.div>
    </div>
  );
};

export default CardEffectStatsComparison;
