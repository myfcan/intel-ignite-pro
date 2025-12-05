'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Star, Rocket, Heart } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectClosingMessage - Mensagem de encerramento motivacional
 *
 * 5 Cenas progressivas (~15s total, 3s por cena):
 * 1. "Você está aqui..."
 * 2. "...nesse segundo grupo"
 * 3. "Abrir o seu radar"
 * 4. "Próximas aulas = prática"
 * 5. "Usar I.A. na vida real"
 *
 * Roda 2x automaticamente
 */
export const CardEffectClosingMessage: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1);
    timersRef.current.push(setTimeout(() => setScene(2), 3000));
    timersRef.current.push(setTimeout(() => setScene(3), 6000));
    timersRef.current.push(setTimeout(() => setScene(4), 9000));
    timersRef.current.push(setTimeout(() => setScene(5), 12000));

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

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-indigo-950/50 to-purple-950/30">
      {/* Background effects */}
      <div className="absolute inset-0">
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
            animate={scene > 0 ? {
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            } : { opacity: 0.1 }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Glow effect */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}
          animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 sm:px-8 md:px-12 py-8">
        <div className="max-w-2xl w-full space-y-5">

          {/* ========== CENA 1-2: "Você está aqui nesse segundo grupo" ========== */}
          <AnimatePresence>
            {scene >= 1 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.p
                  className="text-lg sm:text-xl md:text-2xl font-medium text-white/90 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Você está aqui para estar{' '}
                  <AnimatePresence>
                    {scene >= 2 && (
                      <motion.span
                        className="text-purple-400 font-bold"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        nesse segundo grupo.
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                className="flex justify-center py-3"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                  <Star className="w-4 h-4 text-purple-400" />
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 3: "Abrir o seu radar" ========== */}
          <AnimatePresence>
            {scene >= 3 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed">
                  Nesta lição, a intenção foi{' '}
                  <motion.span
                    className="text-cyan-400 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    abrir o seu radar
                  </motion.span>{' '}
                  para o que já é possível.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 4: "Próximas aulas = prática" ========== */}
          <AnimatePresence>
            {scene >= 4 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed">
                  Nas próximas aulas: <span className="text-pink-400 font-medium">prompts, ferramentas e passo a passo</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 5: Highlighted final text ========== */}
          <AnimatePresence>
            {scene >= 5 && (
              <motion.div
                className="relative mt-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: 'spring' }}
              >
                {/* Glow behind */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-xl blur-xl"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Card container */}
                <div className="relative bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3">
                    <Rocket className="w-5 h-5 text-purple-400" />
                    <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      usar a I.A. na sua vida real
                    </p>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                  </div>

                  {/* Sparkle decorations */}
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400/60" />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-2 -left-2"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <Heart className="w-4 h-4 text-pink-400/60" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Próximos passos</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#8b5cf6' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectClosingMessage;
