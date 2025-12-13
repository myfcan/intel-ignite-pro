'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, Brain, Handshake, ArrowRight, CheckCircle, Shield } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

/**
 * 🤝 COAUTHOR ROLE - Aula 9
 * Contexto: "coautora, não dona"
 * I.A. é parceira que acelera, mas você tem o controle
 */
export function CardEffectCoauthorRole({ isActive = true, duration = 33 }: CardEffectProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= totalScenes - 1) return prev;
        return prev + 1;
      });
    }, sceneTime);
    return () => clearInterval(interval);
  }, [isActive, sceneTime]);

  if (!isActive) return null;

  const roles = [
    { human: 'Você decide', ai: 'I.A. executa' },
    { human: 'Você revisa', ai: 'I.A. gera rascunhos' },
    { human: 'Você aprova', ai: 'I.A. sugere' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8 flex-1">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Duas figuras lado a lado */}
          {currentScene <= 5 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-md w-full"
            >
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Coautora, Não Dona
              </motion.h2>

              {/* Duas figuras */}
              <div className="flex items-center gap-6 sm:gap-10">
                {/* Você */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
                    animate={currentScene >= 2 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  <span className="text-sm font-bold text-blue-300">Você</span>
                  <span className="text-xs text-blue-200/60">Controle</span>
                </motion.div>

                {/* Símbolo de parceria */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="flex flex-col items-center"
                >
                  <Handshake className="w-8 h-8 text-indigo-400" />
                  <span className="text-xs text-indigo-300 mt-1">Parceria</span>
                </motion.div>

                {/* I.A. */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
                    animate={currentScene >= 3 ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  <span className="text-sm font-bold text-purple-300">I.A.</span>
                  <span className="text-xs text-purple-200/60">Aceleração</span>
                </motion.div>
              </div>

              {/* Divisão de papéis */}
              {currentScene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-2 mt-4"
                >
                  {roles.map((role, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: currentScene >= idx + 3 ? 1 : 0.3, x: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                    >
                      <span className="text-blue-300 text-xs sm:text-sm">{role.human}</span>
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                      <span className="text-purple-300 text-xs sm:text-sm">{role.ai}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Você no comando */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg"
            >
              <motion.div
                className="relative"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <Shield className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
                </div>

                {/* Sparkles orbitando */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ top: '50%', left: '50%' }}
                    animate={{
                      x: Math.cos((i * 90 + currentScene * 30) * Math.PI / 180) * 70 - 10,
                      y: Math.sin((i * 90 + currentScene * 30) * Math.PI / 180) * 70 - 10,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </motion.div>
                ))}
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Você no Comando
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-indigo-200/80 text-sm sm:text-base"
                >
                  A I.A. acelera o trabalho, mas a decisão final, o estilo e a aprovação são sempre seus
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-500/30"
              >
                <CheckCircle className="w-4 h-4 text-indigo-400" />
                <span className="text-indigo-300 text-sm font-medium">Controle total mantido</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1.5 mt-4 pb-4 sm:pb-6">
        {Array.from({ length: totalScenes }).map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentScene ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectCoauthorRole;