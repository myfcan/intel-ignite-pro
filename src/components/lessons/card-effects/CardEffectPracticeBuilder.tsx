'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, CheckSquare, HelpCircle, Lightbulb, ArrowRight, Star } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectPracticeBuilder: React.FC<CardEffectProps> = ({ isActive = true, duration = 33 }) => {
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

  const exerciseTypes = [
    { icon: CheckSquare, label: 'Exercícios práticos', color: 'from-orange-500 to-red-500' },
    { icon: HelpCircle, label: 'Perguntas de reflexão', color: 'from-yellow-500 to-orange-500' },
    { icon: Lightbulb, label: 'Desafios aplicados', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Tipos de exercícios */}
          {currentScene <= 5 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-md w-full"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-3"
              >
                <Dumbbell className="w-8 h-8 text-orange-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Do Conteúdo à Prática
                </h2>
              </motion.div>

              <div className="w-full space-y-3">
                {exerciseTypes.map((type, idx) => (
                  <motion.div
                    key={type.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      scale: currentScene >= idx + 1 ? 1 : 0.95 
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className={`p-4 rounded-xl bg-gradient-to-r ${type.color} ${
                      currentScene >= idx + 1 ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <type.icon className="w-6 h-6 text-white" />
                      <span className="text-white font-semibold text-sm sm:text-base">{type.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-orange-200/70 text-sm text-center"
                >
                  Exercícios que fixam o aprendizado de verdade
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Resultado */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                  <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                
                {/* Floating checkmarks */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: i < 2 ? '-15px' : 'auto',
                      bottom: i >= 2 ? '-15px' : 'auto',
                      left: i % 2 === 0 ? '-15px' : 'auto',
                      right: i % 2 === 1 ? '-15px' : 'auto',
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <CheckSquare className="w-5 h-5 text-green-400" />
                  </motion.div>
                ))}
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Prática que Fixa
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-orange-200/80 text-sm sm:text-base"
                >
                  Peça para a I.A. criar exercícios simples para testar se a pessoa entendeu cada módulo
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <span className="text-white/60 text-sm">Teoria</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Aplicação real
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 mt-4">
          {Array.from({ length: totalScenes }).map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentScene ? 'w-6 bg-orange-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectPracticeBuilder;
