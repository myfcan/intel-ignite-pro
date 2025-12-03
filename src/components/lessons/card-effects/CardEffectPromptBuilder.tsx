'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Plus, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectPromptBuilder - Construtor de prompts passo a passo
 */
export const CardEffectPromptBuilder: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'step1' | 'step2' | 'step3' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const steps = [
    { label: 'Produto', value: '[SEU PRODUTO]', color: 'cyan' },
    { label: 'Público', value: '[SEU PÚBLICO]', color: 'purple' },
    { label: 'Tom', value: 'história pessoal', color: 'pink' },
  ];

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('step1');

    timersRef.current.push(setTimeout(() => setPhase('step2'), 1500));
    timersRef.current.push(setTimeout(() => setPhase('step3'), 3000));
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
  const visibleSteps = phase === 'step1' ? 1 : phase === 'step2' ? 2 : phase === 'step3' || phase === 'complete' ? 3 : 0;

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30">
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <motion.h3
          className="text-lg font-bold text-white mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 1 : 0 }}
        >
          Construtor de Prompts
        </motion.h3>
        <motion.p
          className="text-sm text-white/50 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 1 : 0 }}
        >
          A fórmula que funciona
        </motion.p>

        {/* Prompt template */}
        <motion.div
          className="w-full max-w-md p-4 bg-slate-800/50 border border-slate-700 rounded-lg font-mono text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 1 : 0 }}
        >
          <p className="text-white/70">
            <span className="text-slate-500">Crie um texto sobre </span>
            <AnimatePresence>
              {visibleSteps >= 1 && (
                <motion.span
                  className="text-cyan-400 font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
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
                >
                  {steps[2].value}
                </motion.span>
              )}
            </AnimatePresence>
          </p>
        </motion.div>

        {/* Step indicators */}
        <div className="flex gap-3 mt-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                visibleSteps > i
                  ? i === 0 ? 'bg-cyan-500/20 border-cyan-500/40' :
                    i === 1 ? 'bg-purple-500/20 border-purple-500/40' :
                    'bg-pink-500/20 border-pink-500/40'
                  : 'bg-white/5 border-white/10'
              } border`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isAnimating ? 1 : 0, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {visibleSteps > i ? (
                <CheckCircle className={`w-4 h-4 ${
                  i === 0 ? 'text-cyan-400' : i === 1 ? 'text-purple-400' : 'text-pink-400'
                }`} />
              ) : (
                <Plus className="w-4 h-4 text-white/30" />
              )}
              <span className={`text-xs ${
                visibleSteps > i
                  ? i === 0 ? 'text-cyan-300' : i === 1 ? 'text-purple-300' : 'text-pink-300'
                  : 'text-white/30'
              }`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Complete message */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-6 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <p className="text-sm text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Prompt pronto para usar!
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
        <Code2 className="w-3 h-3 text-cyan-400" />
        <span className="text-[9px] text-cyan-300">Fórmula</span>
      </motion.div>
    </div>
  );
};

export default CardEffectPromptBuilder;
