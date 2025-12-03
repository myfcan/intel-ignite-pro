'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Layers, Target } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectVariationMultiplier - Mostra multiplicação de variações de conteúdo
 * Um produto → Múltiplas abordagens
 */
export const CardEffectVariationMultiplier: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'source' | 'multiply' | 'variations' | 'complete'>('waiting');
  const [visibleVariations, setVisibleVariations] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const variations = [
    { label: 'Para mães', color: 'pink' },
    { label: 'Para economizar', color: 'emerald' },
    { label: 'Para presente', color: 'purple' },
    { label: 'Promoção urgente', color: 'orange' },
  ];

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('source');
    setVisibleVariations(0);

    timersRef.current.push(setTimeout(() => setPhase('multiply'), 1200));
    timersRef.current.push(setTimeout(() => setPhase('variations'), 2000));

    variations.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setVisibleVariations(i + 1), 2500 + i * 400));
    });

    timersRef.current.push(setTimeout(() => setPhase('complete'), 5000));
    timersRef.current.push(setTimeout(() => setLoopCount(prev => prev + 1), 12000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setPhase('waiting');
      setVisibleVariations(0);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      {/* Multiplication rays */}
      <AnimatePresence>
        {phase === 'multiply' && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/3 w-0.5 h-20 bg-gradient-to-b from-purple-400 to-transparent origin-top"
            style={{ rotate: `${i * 45}deg` }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Source product */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.div
                className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2"
                animate={phase === 'multiply' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-sm text-white/70">1 Produto</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Arrow */}
        <AnimatePresence>
          {['multiply', 'variations', 'complete'].includes(phase) && (
            <motion.div
              className="mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <Layers className="w-6 h-6 text-purple-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Variations grid */}
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {variations.map((variation, i) => {
            const isVisible = visibleVariations > i;
            const colorClasses = {
              pink: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
              emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
              purple: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
              orange: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
            };

            return (
              <motion.div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colorClasses[variation.color as keyof typeof colorClasses]}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring' }}
              >
                <Copy className="w-4 h-4" />
                <span className="text-xs font-medium">{variation.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Complete message */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-6 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="text-sm text-purple-300">
                <span className="font-bold text-white">1 produto</span> → <span className="font-bold text-white">20+ abordagens</span>
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
        <Layers className="w-3 h-3 text-purple-400" />
        <span className="text-[9px] text-purple-300">Multiplicador</span>
      </motion.div>
    </div>
  );
};

export default CardEffectVariationMultiplier;
