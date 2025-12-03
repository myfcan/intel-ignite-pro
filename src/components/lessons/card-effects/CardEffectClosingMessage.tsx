'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Star, Rocket } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectClosingMessage - Mensagem de encerramento motivacional
 *
 * Card de texto com visual bonito para mensagens de conclusão/transição
 * Animações suaves com reveal progressivo do texto
 */
export const CardEffectClosingMessage: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'line1' | 'divider' | 'line2' | 'line3' | 'highlight' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setPhase('enter');

    // Timing sequencial para reveal do texto
    timersRef.current.push(setTimeout(() => setPhase('line1'), 800));
    timersRef.current.push(setTimeout(() => setPhase('divider'), 2500));
    timersRef.current.push(setTimeout(() => setPhase('line2'), 3500));
    timersRef.current.push(setTimeout(() => setPhase('line3'), 5500));
    timersRef.current.push(setTimeout(() => setPhase('highlight'), 7500));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 9000));

    // Loop
    timersRef.current.push(setTimeout(() => {
      setLoopCount(prev => prev + 1);
    }, 15000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase('waiting');
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';
  const showLine1 = ['line1', 'divider', 'line2', 'line3', 'highlight', 'complete'].includes(phase);
  const showDivider = ['divider', 'line2', 'line3', 'highlight', 'complete'].includes(phase);
  const showLine2 = ['line2', 'line3', 'highlight', 'complete'].includes(phase);
  const showLine3 = ['line3', 'highlight', 'complete'].includes(phase);
  const showHighlight = ['highlight', 'complete'].includes(phase);

  return (
    <div className="relative w-full min-h-[500px] h-[60vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-indigo-950/50 to-purple-950/30">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={isAnimating ? {
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            } : { opacity: 0.1 }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Glow effect */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          }}
          animate={isAnimating ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          } : { opacity: 0 }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 sm:px-8 md:px-12">
        <div className="max-w-2xl w-full space-y-6">

          {/* Line 1 - "Você está aqui para estar nesse segundo grupo" */}
          <AnimatePresence>
            {showLine1 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-white/90 leading-relaxed">
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Você está aqui para estar{' '}
                  </motion.span>
                  <motion.span
                    className="inline-block text-purple-400 font-semibold"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                  >
                    nesse segundo grupo.
                  </motion.span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <AnimatePresence>
            {showDivider && (
              <motion.div
                className="flex justify-center py-4"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                  <Star className="w-4 h-4 text-purple-400" />
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Line 2 - Propósito da lição */}
          <AnimatePresence>
            {showLine2 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed">
                  Nesta lição, a intenção não foi ensinar o como fazer em detalhes, e sim{' '}
                  <motion.span
                    className="text-cyan-400 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    abrir o seu radar
                  </motion.span>{' '}
                  para tudo o que já é possível.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Line 3 - Próximos passos */}
          <AnimatePresence>
            {showLine3 && (
              <motion.div
                className="text-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed">
                  A partir das próximas aulas, vamos descer para a prática: prompts, ferramentas e passo a passo para você
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Highlighted final text */}
          <AnimatePresence>
            {showHighlight && (
              <motion.div
                className="relative mt-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                {/* Glow behind */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-xl blur-xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Card container */}
                <div className="relative bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3">
                    <Rocket className="w-5 h-5 text-purple-400" />
                    <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      usar a I.A. na sua vida real
                    </p>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                  </div>

                  {/* Sparkle decorations */}
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400/60" />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-2 -left-2"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-400/60" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
        transition={{ delay: 1 }}
      >
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span className="text-[9px] text-purple-300">Próximos passos</span>
      </motion.div>
    </div>
  );
};

export default CardEffectClosingMessage;
