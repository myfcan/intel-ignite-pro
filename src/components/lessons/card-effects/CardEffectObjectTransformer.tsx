'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Wand2, ShoppingCart } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectObjectTransformer - Transforma objeto comum em vendável
 */
export const CardEffectObjectTransformer: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'object' | 'transform' | 'result' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('object');

    timersRef.current.push(setTimeout(() => setPhase('transform'), 1500));
    timersRef.current.push(setTimeout(() => setPhase('result'), 3000));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 4500));
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
  const showTransform = ['transform', 'result', 'complete'].includes(phase);
  const showResult = ['result', 'complete'].includes(phase);

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
      {/* Magic particles */}
      <AnimatePresence>
        {showTransform && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-violet-400"
            style={{ left: '50%', top: '50%' }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: (Math.random() - 0.5) * 150,
              y: (Math.random() - 0.5) * 150,
            }}
            transition={{ duration: 1, delay: i * 0.05 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <motion.h3
          className="text-lg font-bold text-white mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 1 : 0 }}
        >
          Desafio: Transforme Qualquer Objeto
        </motion.h3>

        <div className="flex items-center gap-6">
          {/* Object before */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                className="text-center"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: showResult ? 0.4 : 1 }}
              >
                <div className="w-20 h-20 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-2">
                  <Pencil className="w-10 h-10 text-white/60" />
                </div>
                <p className="text-xs text-white/50">Caneta comum</p>
                <p className="text-xs text-white/30 mt-1">R$ 5</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transform action */}
          <AnimatePresence>
            {showTransform && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <motion.div
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1 }}
                >
                  <Wand2 className="w-7 h-7 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                className="text-center"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <motion.div
                  className="w-20 h-20 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center mb-2"
                  animate={{ boxShadow: ['0 0 10px rgba(16, 185, 129, 0.2)', '0 0 20px rgba(16, 185, 129, 0.4)', '0 0 10px rgba(16, 185, 129, 0.2)'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ShoppingCart className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <p className="text-xs text-emerald-300 font-medium">Produto vendável</p>
                <p className="text-xs text-emerald-400 mt-1">Com história</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Prompt hint */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-6 p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg max-w-xs"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="text-xs text-violet-300 text-center">
                "Crie um texto sobre <span className="font-bold">[objeto]</span> para <span className="font-bold">[público]</span>. Tom: história pessoal."
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Wand2 className="w-3 h-3 text-violet-400" />
        <span className="text-[9px] text-violet-300">Desafio</span>
      </motion.div>
    </div>
  );
};

export default CardEffectObjectTransformer;
