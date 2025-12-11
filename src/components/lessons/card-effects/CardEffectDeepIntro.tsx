'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Layers, TrendingUp, ArrowRight, Star, Zap } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectDeepIntro: React.FC<CardEffectProps> = ({ isActive = true }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneDuration = 3000;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= totalScenes - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, sceneDuration);
    return () => clearInterval(interval);
  }, [isActive]);

  const contentTypes = [
    { icon: BookOpen, label: 'Post rápido', time: '30s', depth: 1 },
    { icon: Layers, label: 'Artigo', time: '5min', depth: 2 },
    { icon: TrendingUp, label: 'Curso completo', time: '2h+', depth: 4 },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Comparação de profundidade */}
          {currentScene <= 5 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 sm:gap-6 max-w-md"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-4"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Níveis de Profundidade
                </h2>
                <p className="text-purple-200/80 text-sm">
                  Do post rápido ao curso completo
                </p>
              </motion.div>

              <div className="w-full space-y-3">
                {contentTypes.map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: currentScene >= idx ? 1 : 0.3,
                      scale: currentScene === idx + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: idx * 0.2, duration: 0.5 }}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all ${
                      currentScene >= idx 
                        ? 'bg-white/10 border border-purple-500/50' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${currentScene >= idx ? 'bg-purple-500/30' : 'bg-white/10'}`}>
                      <item.icon className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-medium text-sm sm:text-base">{item.label}</span>
                      <span className="text-purple-300/60 text-xs ml-2">~{item.time}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className={`w-2 h-6 rounded-full ${
                            i < item.depth ? 'bg-purple-400' : 'bg-white/20'
                          }`}
                          animate={{ 
                            scaleY: currentScene >= idx && i < item.depth ? [1, 1.2, 1] : 1 
                          }}
                          transition={{ delay: i * 0.1, duration: 0.4 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {currentScene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-green-400 mt-4"
                >
                  <Star className="w-5 h-5" />
                  <span className="text-sm font-medium">Profundidade constrói autoridade</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Transformação */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-lg text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                <motion.div
                  className="absolute -right-2 -top-2"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Conteúdo que Transforma
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-purple-200/80 text-sm sm:text-base"
                >
                  Cursos, eBooks, aulas estruturadas — materiais que organizam seu conhecimento em uma linha lógica
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-6 py-3 rounded-full border border-purple-500/30"
              >
                <span className="text-white font-medium text-sm">Do post rápido</span>
                <ArrowRight className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium text-sm">ao curso completo</span>
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
                idx === currentScene ? 'w-6 bg-purple-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectDeepIntro;
