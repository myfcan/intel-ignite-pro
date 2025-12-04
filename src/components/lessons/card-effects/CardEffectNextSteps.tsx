'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Rocket, Sparkles, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectNextSteps - Mostra próximos passos / call-to-action
 *
 * 5 Cenas progressivas (~10s total):
 * 1. Título "Próximos Passos" (0-2s)
 * 2. Passo 1: Encontrar oportunidades (2-4s)
 * 3. Passo 2: Começar pequeno (4-6s)
 * 4. Passo 3: Aplicar hoje (6-8s)
 * 5. CTA "Começando hoje" (8-10s)
 */
export const CardEffectNextSteps: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const steps = [
    { text: 'Encontrar oportunidades reais', icon: Target },
    { text: 'Começar pequeno', icon: Lightbulb },
    { text: 'Aplicar hoje mesmo', icon: Rocket },
  ];

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setScene(1); // Título
    timersRef.current.push(setTimeout(() => setScene(2), 2000)); // Passo 1
    timersRef.current.push(setTimeout(() => setScene(3), 4000)); // Passo 2
    timersRef.current.push(setTimeout(() => setScene(4), 6000)); // Passo 3
    timersRef.current.push(setTimeout(() => setScene(5), 8000)); // CTA
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setScene(0);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive]);

  const visibleSteps = scene === 2 ? 1 : scene === 3 ? 2 : scene >= 4 ? 3 : 0;

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Background glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

        {/* ========== CENA 1: Title ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <Rocket className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Próximos Passos</h3>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps list */}
        <div className="space-y-3 w-full max-w-xs">
          {steps.map((step, i) => {
            const isVisible = visibleSteps > i;
            const Icon = step.icon;

            return (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-3 bg-white/5 border border-purple-500/30 rounded-lg"
                initial={{ x: -30, opacity: 0 }}
                animate={isVisible ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                transition={{ type: 'spring', delay: i * 0.1 }}
              >
                <motion.div
                  className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0"
                  animate={isVisible ? {
                    boxShadow: ['0 0 5px rgba(168, 85, 247, 0.2)', '0 0 15px rgba(168, 85, 247, 0.4)', '0 0 5px rgba(168, 85, 247, 0.2)']
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Icon className="w-4 h-4 text-purple-400" />
                </motion.div>
                <span className="text-sm text-white/80">{step.text}</span>
                <CheckCircle className="w-4 h-4 text-purple-400 ml-auto" />
              </motion.div>
            );
          })}
        </div>

        {/* ========== CENA 5: CTA ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full shadow-lg"
                animate={{
                  boxShadow: ['0 0 20px rgba(168, 85, 247, 0.3)', '0 0 40px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(168, 85, 247, 0.3)']
                }}
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

              <motion.p
                className="mt-4 text-xs text-purple-300/70 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Não são promessas. São possibilidades reais.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Ação</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#a855f7' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectNextSteps;
