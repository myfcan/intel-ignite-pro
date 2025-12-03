'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, Clock, Frown } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectProblemIdentifier - Visualização do problema
 * Mostra indicadores de problema/dor do personagem
 */
export const CardEffectProblemIdentifier: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'problems' | 'complete'>('waiting');
  const [visibleProblems, setVisibleProblems] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const problems = [
    { icon: Clock, text: 'Horas postando', value: '8h/dia' },
    { icon: TrendingDown, text: 'Vendas por mês', value: '2-3' },
    { icon: Frown, text: 'Engajamento', value: 'Baixo' },
  ];

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('enter');
    setVisibleProblems(0);

    timersRef.current.push(setTimeout(() => setPhase('problems'), 600));
    problems.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setVisibleProblems(i + 1), 1000 + i * 600));
    });
    timersRef.current.push(setTimeout(() => setPhase('complete'), 3500));
    timersRef.current.push(setTimeout(() => setLoopCount(prev => prev + 1), 12000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setPhase('waiting');
      setVisibleProblems(0);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-red-950 via-rose-950 to-slate-950">
      {/* Warning pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)' }}
        animate={isAnimating ? { scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Alert Icon */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' }}
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <AnimatePresence>
          {isAnimating && (
            <motion.h3
              className="text-xl font-bold text-white mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              O Problema
            </motion.h3>
          )}
        </AnimatePresence>

        {/* Problem Cards */}
        <div className="space-y-3 w-full max-w-xs">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            const isVisible = visibleProblems > i;

            return (
              <motion.div
                key={i}
                className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={isVisible ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-white/80">{problem.text}</span>
                </div>
                <span className="text-sm font-bold text-red-400">{problem.value}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Conclusion */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.p
              className="mt-6 text-sm text-red-300/80 text-center max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              "Muito esforço, pouco resultado"
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <AlertTriangle className="w-3 h-3 text-red-400" />
        <span className="text-[9px] text-red-300">Diagnóstico</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProblemIdentifier;
