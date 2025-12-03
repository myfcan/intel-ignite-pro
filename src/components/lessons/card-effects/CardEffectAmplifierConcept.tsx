'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Volume2, Waves } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectAmplifierConcept - Visualiza o conceito de amplificação
 */
export const CardEffectAmplifierConcept: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'input' | 'amplify' | 'output' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('input');

    timersRef.current.push(setTimeout(() => setPhase('amplify'), 1500));
    timersRef.current.push(setTimeout(() => setPhase('output'), 3000));
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
  const showAmplify = ['amplify', 'output', 'complete'].includes(phase);
  const showOutput = ['output', 'complete'].includes(phase);

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950">
      {/* Wave animations */}
      {showAmplify && [...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400/30"
          initial={{ width: 50, height: 50, opacity: 0 }}
          animate={{ width: 300 + i * 50, height: 300 + i * 50, opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
        />
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-6">
          {/* Input */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                className="text-center"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2">
                  <Volume2 className="w-7 h-7 text-white/60" />
                </div>
                <p className="text-xs text-white/50">Sua voz</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Amplifier */}
          <AnimatePresence>
            {showAmplify && (
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <motion.div
                  className="w-20 h-20 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mb-2"
                  animate={{ boxShadow: ['0 0 20px rgba(6, 182, 212, 0.3)', '0 0 40px rgba(6, 182, 212, 0.6)', '0 0 20px rgba(6, 182, 212, 0.3)'] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Zap className="w-10 h-10 text-white" />
                </motion.div>
                <p className="text-xs text-cyan-300 font-medium">I.A.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Output */}
          <AnimatePresence>
            {showOutput && (
              <motion.div
                className="text-center"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 flex items-center justify-center mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Waves className="w-12 h-12 text-cyan-400" />
                </motion.div>
                <p className="text-xs text-cyan-300 font-medium">Amplificada</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-8 text-center max-w-xs"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="text-sm text-white/80">
                A I.A. não substitui você, ela <span className="text-cyan-400 font-bold">amplifica</span> sua capacidade
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Zap className="w-3 h-3 text-cyan-400" />
        <span className="text-[9px] text-cyan-300">Amplificador</span>
      </motion.div>
    </div>
  );
};

export default CardEffectAmplifierConcept;
