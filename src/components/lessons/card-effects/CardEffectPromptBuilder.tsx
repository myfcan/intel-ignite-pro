'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Plus, CheckCircle, Sparkles, Terminal } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectPromptBuilder - Construtor de prompts passo a passo
 *
 * 5 Cenas progressivas (~15s total, 3s por cena):
 * 1. Título e template vazio
 * 2. Passo 1: [SEU PRODUTO]
 * 3. Passo 2: [SEU PÚBLICO]
 * 4. Passo 3: história pessoal
 * 5. "Prompt pronto para usar!"
 *
 * Roda 2x automaticamente
 */
export const CardEffectPromptBuilder: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const steps = [
    { label: 'Produto', value: '[SEU PRODUTO]', color: 'cyan' },
    { label: 'Público', value: '[SEU PÚBLICO]', color: 'purple' },
    { label: 'Tom', value: 'história pessoal', color: 'pink' },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1); // Template vazio
    timersRef.current.push(setTimeout(() => setScene(2), 3000)); // Passo 1
    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Passo 2
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // Passo 3
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Pronto

    // Loop logic
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 15000));
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '25px 25px'
        }} />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* ========== CENA 1: Title ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg sm:text-xl font-bold text-white">Construtor de Prompts</h3>
              </div>
              <p className="text-sm text-white/50">A fórmula que funciona</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt template */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="w-full max-w-md p-4 bg-slate-800/50 border border-slate-700 rounded-lg font-mono text-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <p className="text-white/70">
                <span className="text-slate-500">Crie um texto sobre </span>
                <AnimatePresence>
                  {visibleSteps >= 1 && (
                    <motion.span
                      className="text-cyan-400 font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {steps[0].value}
                    </motion.span>
                  )}
                </AnimatePresence>
              </p>
              <p className="text-white/70 mt-1">
                <span className="text-slate-500">para </span>
                <AnimatePresence>
                  {visibleSteps >= 2 && (
                    <motion.span
                      className="text-purple-400 font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {steps[1].value}
                    </motion.span>
                  )}
                </AnimatePresence>
              </p>
              <p className="text-white/70 mt-1">
                <span className="text-slate-500">Tom: </span>
                <AnimatePresence>
                  {visibleSteps >= 3 && (
                    <motion.span
                      className="text-pink-400 font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {steps[2].value}
                    </motion.span>
                  )}
                </AnimatePresence>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicators */}
        <div className="flex gap-3 mt-6">
          {steps.map((step, i) => {
            const isVisible = visibleSteps > i;
            const colorClasses = {
              cyan: { active: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400', icon: 'text-cyan-400', text: 'text-cyan-300' },
              purple: { active: 'bg-purple-500/20 border-purple-500/40 text-purple-400', icon: 'text-purple-400', text: 'text-purple-300' },
              pink: { active: 'bg-pink-500/20 border-pink-500/40 text-pink-400', icon: 'text-pink-400', text: 'text-pink-300' },
            };
            const colors = colorClasses[step.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  isVisible ? colors.active : 'bg-white/5 border-white/10'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: scene >= 1 ? 1 : 0, scale: 1 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                {isVisible ? (
                  <CheckCircle className={`w-4 h-4 ${colors.icon}`} />
                ) : (
                  <Plus className="w-4 h-4 text-white/30" />
                )}
                <span className={`text-xs ${isVisible ? colors.text : 'text-white/30'}`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* ========== CENA 5: Complete message ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full border border-emerald-500/40"
                animate={{
                  boxShadow: ['0 0 15px rgba(16, 185, 129, 0.2)', '0 0 30px rgba(16, 185, 129, 0.4)', '0 0 15px rgba(16, 185, 129, 0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">Prompt pronto para usar!</span>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] text-cyan-300 font-medium">Fórmula</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#06b6d4' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectPromptBuilder;
