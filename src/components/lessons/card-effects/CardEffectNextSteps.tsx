'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Rocket, Sparkles, CheckCircle, Target, Lightbulb, Zap, Play } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectNextSteps - Mostra próximos passos / call-to-action
 *
 * 7 Cenas progressivas (~21s total, 3s por cena):
 * 1. Título "Próximos Passos"
 * 2. Passo 1: Encontrar oportunidades
 * 3. Passo 2: Começar pequeno
 * 4. Passo 3: Aplicar hoje
 * 5. Resumo visual
 * 6. Motivação extra
 * 7. CTA "Começando hoje"
 *
 * Roda 2x automaticamente
 */
export const CardEffectNextSteps: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const steps = [
    { text: 'Encontrar oportunidades reais', icon: Target },
    { text: 'Começar pequeno', icon: Lightbulb },
    { text: 'Aplicar hoje mesmo', icon: Rocket },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1); // Título
    timersRef.current.push(setTimeout(() => setScene(2), 3000)); // Passo 1
    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Passo 2
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // Passo 3
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Resumo
    timersRef.current.push(setTimeout(() => setScene(6), 15000)); // Motivação
    timersRef.current.push(setTimeout(() => setScene(7), 18000)); // CTA

    // Loop logic
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 21000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  const visibleSteps = scene === 2 ? 1 : scene === 3 ? 2 : scene >= 4 ? 3 : 0;

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Background glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* ========== CENA 1: Title ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Rocket className="w-12 h-12 text-purple-400 mx-auto mb-3" />
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
                className="flex items-center gap-3 p-3 bg-white/5 border border-purple-500/30 rounded-xl"
                initial={{ x: -30, opacity: 0 }}
                animate={isVisible ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 100, delay: i * 0.15 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0"
                  animate={isVisible ? {
                    boxShadow: ['0 0 5px rgba(168, 85, 247, 0.2)', '0 0 20px rgba(168, 85, 247, 0.4)', '0 0 5px rgba(168, 85, 247, 0.2)']
                  } : {}}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                >
                  <Icon className="w-5 h-5 text-purple-400" />
                </motion.div>
                <span className="text-sm text-white/80 flex-1">{step.text}</span>
                <CheckCircle className="w-5 h-5 text-purple-400 ml-auto" />
              </motion.div>
            );
          })}
        </div>

        {/* ========== CENA 5: Resumo visual ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-4 flex items-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-300">Testar → Medir → Ajustar → Repetir</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 6: Motivação ========== */}
        <AnimatePresence>
          {scene >= 6 && (
            <motion.div
              className="mt-3 flex items-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                <Play className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-300">Sistema simples e repetível</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 7: CTA ========== */}
        <AnimatePresence>
          {scene >= 7 && (
            <motion.div
              className="mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full shadow-lg"
                animate={{
                  boxShadow: ['0 0 20px rgba(168, 85, 247, 0.3)', '0 0 40px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(168, 85, 247, 0.3)']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white">Começando hoje</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>

              <motion.p
                className="mt-4 text-xs text-purple-300/70 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
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
        transition={{ duration: 0.6 }}
      >
        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Ação</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <motion.div
            key={s}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#a855f7' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectNextSteps;
