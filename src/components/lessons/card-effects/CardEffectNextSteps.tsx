'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Rocket, Sparkles, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectNextSteps - Mostra próximos passos / call-to-action
 */
export const CardEffectNextSteps: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'steps' | 'cta' | 'complete'>('waiting');
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const steps = [
    'Encontrar oportunidades reais',
    'Começar pequeno',
    'Aplicar hoje mesmo',
  ];

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('enter');
    setVisibleSteps(0);

    timersRef.current.push(setTimeout(() => setPhase('steps'), 800));

    steps.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setVisibleSteps(i + 1), 1200 + i * 600));
    });

    timersRef.current.push(setTimeout(() => setPhase('cta'), 4000));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 5500));
    timersRef.current.push(setTimeout(() => setLoopCount(prev => prev + 1), 12000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setPhase('waiting');
      setVisibleSteps(0);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Background glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
        animate={isAnimating ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Title */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Rocket className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">Próximos Passos</h3>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps list */}
        <div className="space-y-3 w-full max-w-xs">
          {steps.map((step, i) => {
            const isVisible = visibleSteps > i;

            return (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-3 bg-white/5 border border-purple-500/30 rounded-lg"
                initial={{ x: -30, opacity: 0 }}
                animate={isVisible ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                transition={{ type: 'spring' }}
              >
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm text-white/80">{step}</span>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <AnimatePresence>
          {['cta', 'complete'].includes(phase) && (
            <motion.div
              className="mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.div
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
                animate={{ boxShadow: ['0 0 20px rgba(168, 85, 247, 0.3)', '0 0 40px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(168, 85, 247, 0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white">Começando hoje</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.p
              className="mt-4 text-xs text-purple-300/70 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Não são promessas. São possibilidades reais.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <ArrowRight className="w-3 h-3 text-purple-400" />
        <span className="text-[9px] text-purple-300">Ação</span>
      </motion.div>
    </div>
  );
};

export default CardEffectNextSteps;
