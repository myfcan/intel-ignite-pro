'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Quote, Lightbulb } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectStoryRevealer - Revela o segredo/insight da história
 */
export const CardEffectStoryRevealer: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'question' | 'reveal' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('question');

    timersRef.current.push(setTimeout(() => setPhase('reveal'), 2000));
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

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-yellow-950 to-orange-950">
      {/* Light rays */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full"
        style={{ background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.5), transparent)' }}
        animate={isAnimating ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Question */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="text-center mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: phase === 'question' ? 1 : 0.4 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-lg text-white/80">O que fez a diferença?</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal */}
        <AnimatePresence>
          {['reveal', 'complete'].includes(phase) && (
            <motion.div
              className="text-center max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4"
                animate={{ boxShadow: ['0 0 20px rgba(251, 191, 36, 0.3)', '0 0 40px rgba(251, 191, 36, 0.6)', '0 0 20px rgba(251, 191, 36, 0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lightbulb className="w-8 h-8 text-white" />
              </motion.div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <Quote className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="text-lg font-medium text-white leading-relaxed">
                  Como você <span className="text-amber-400 font-bold">conta a história</span>
                </p>
                <p className="text-sm text-white/60 mt-2">
                  Storytelling que conecta e vende
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Lightbulb className="w-3 h-3 text-amber-400" />
        <span className="text-[9px] text-amber-300">O Segredo</span>
      </motion.div>
    </div>
  );
};

export default CardEffectStoryRevealer;
