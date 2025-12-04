'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, Brain, Zap } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectStoryRevealer - A descoberta que mudou tudo
 *
 * 5 Cenas progressivas (~10s total):
 * 1. Escuridão com luz surgindo (0-2s)
 * 2. Lâmpada acende - "Uma descoberta" (2-4s)
 * 3. "Não foi curso milagroso" (4-6s)
 * 4. "Nem plataforma cara" (6-7s)
 * 5. "I.A. como aliada" - revelação final (7-10s)
 */
export const CardEffectStoryRevealer: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setScene(1); // Luz surgindo
    timersRef.current.push(setTimeout(() => setScene(2), 2000)); // Lâmpada acende
    timersRef.current.push(setTimeout(() => setScene(3), 4000)); // Não foi curso
    timersRef.current.push(setTimeout(() => setScene(4), 5500)); // Nem plataforma
    timersRef.current.push(setTimeout(() => setScene(5), 7000)); // Revelação final
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

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: scene > 0 ? [0.2, 0.8, 0.2] : 0,
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Central glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 60%)' }}
        animate={scene > 0 ? {
          scale: [1, 1.2, 1],
          opacity: scene >= 5 ? [0.5, 0.8, 0.5] : [0.2, 0.4, 0.2]
        } : { opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

        {/* ========== CENA 1: Luz surgindo ========== */}
        <AnimatePresence>
          {scene >= 1 && scene < 5 && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-500/20 flex items-center justify-center"
                animate={{
                  boxShadow: scene >= 2
                    ? ['0 0 30px rgba(251,191,36,0.3)', '0 0 60px rgba(251,191,36,0.5)', '0 0 30px rgba(251,191,36,0.3)']
                    : '0 0 10px rgba(251,191,36,0.1)'
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Lightbulb
                  className={`w-10 h-10 transition-all duration-500 ${
                    scene >= 2 ? 'text-yellow-400' : 'text-yellow-400/30'
                  }`}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 2: Uma descoberta ========== */}
        <AnimatePresence>
          {scene >= 2 && scene < 5 && (
            <motion.div
              className="mt-32 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Uma descoberta!</h3>
              <p className="text-purple-300/80 text-sm">Algo novo, simples e poderoso...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 3 e 4: O que NÃO foi ========== */}
        <AnimatePresence>
          {scene >= 3 && scene < 5 && (
            <motion.div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <span className="text-red-400 text-lg">✕</span>
                <span className="text-slate-300 text-sm">Não foi curso milagroso</span>
              </motion.div>

              {scene >= 4 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <span className="text-red-400 text-lg">✕</span>
                  <span className="text-slate-300 text-sm">Nem plataforma cara</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 5: Revelação Final - I.A. como Aliada ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {/* Ícone central */}
              <motion.div
                className="relative mb-6 mx-auto"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                {/* Sparkles ao redor */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: i < 2 ? '-8px' : 'auto',
                      bottom: i >= 2 ? '-8px' : 'auto',
                      left: i % 2 === 0 ? '-8px' : 'auto',
                      right: i % 2 === 1 ? '-8px' : 'auto',
                    }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Texto principal */}
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 mb-3"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Inteligência Artificial
              </motion.h2>

              <motion.p
                className="text-lg text-purple-200 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                como aliada
              </motion.p>

              {/* Subtexto */}
              <motion.div
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full border border-violet-500/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-violet-200 text-sm font-medium">Uma nova forma de pensar o trabalho</span>
              </motion.div>
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
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">A Virada</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#8b5cf6' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectStoryRevealer;
