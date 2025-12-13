'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, MapPin, ArrowRight, Star, Sparkles, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectResultClarifier: React.FC<CardEffectProps> = ({ isActive = true, duration = 33 }) => {
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

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-green-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute bottom-20 right-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Jornada A → B */}
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
                Qual Transformação Acontece?
              </motion.h2>

              <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
                {/* Ponto A */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: currentScene >= 1 ? 1 : 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/20 border-2 border-red-400/50 flex items-center justify-center">
                    <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
                  </div>
                  <span className="text-red-300 text-sm font-medium">Ponto A</span>
                  <span className="text-white/60 text-xs">Antes</span>
                </motion.div>

                {/* Path */}
                <motion.div
                  className="flex-1 flex items-center justify-center relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentScene >= 2 ? 1 : 0.3 }}
                >
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400" />
                  <motion.div
                    className="absolute"
                    animate={{ x: currentScene >= 3 ? ['-40px', '40px'] : '-40px' }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                </motion.div>

                {/* Ponto B */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: currentScene >= 3 ? 1 : 0.8, 
                    opacity: currentScene >= 3 ? 1 : 0.3 
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 border-2 border-green-400/50 flex items-center justify-center"
                    animate={currentScene >= 4 ? { 
                      boxShadow: ['0 0 10px rgba(34, 197, 94, 0.3)', '0 0 30px rgba(34, 197, 94, 0.6)', '0 0 10px rgba(34, 197, 94, 0.3)']
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flag className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                  </motion.div>
                  <span className="text-green-300 text-sm font-medium">Ponto B</span>
                  <span className="text-white/60 text-xs">Depois</span>
                </motion.div>
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-200/70 text-sm text-center"
                >
                  Defina o destino antes de traçar o caminho
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Resultado claro */}
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
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                  <Flag className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </motion.div>
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Resultado Final Claro
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-green-200/80 text-sm sm:text-base"
                >
                  "O que a pessoa deve conseguir fazer ao final?" — responda isso antes de escrever a primeira linha
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Transformação definida</span>
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
                idx === currentScene ? 'w-6 bg-green-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectResultClarifier;
