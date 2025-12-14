'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Brain, Zap, ArrowRight, Rocket, Sparkles, Star } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectLeverageMindset: React.FC<CardEffectProps> = ({ isActive = true, duration = 33 }) => {
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

  const leveragePoints = [
    { icon: Brain, label: 'Seu conhecimento', multiplier: '1x' },
    { icon: Zap, label: 'Com I.A.', multiplier: '10x' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-20 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Comparação de alavancagem */}
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
                <TrendingUp className="w-8 h-8 text-violet-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  I.A. como Alavanca
                </h2>
              </motion.div>

              <div className="flex items-center gap-4 sm:gap-6 w-full justify-center">
                {leveragePoints.map((point, idx) => (
                  <motion.div
                    key={point.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      scale: currentScene >= idx + 1 ? 1 : 0.9 
                    }}
                    transition={{ delay: idx * 0.5, duration: 0.5 }}
                    className={`flex flex-col items-center gap-2 p-4 sm:p-6 rounded-xl ${
                      idx === 1 
                        ? 'bg-violet-500/30 border-2 border-violet-400/50' 
                        : 'bg-white/5 border border-white/20'
                    }`}
                  >
                    <point.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${
                      idx === 1 ? 'text-violet-300' : 'text-white/60'
                    }`} />
                    <span className={`text-xs sm:text-sm ${
                      idx === 1 ? 'text-violet-200' : 'text-white/60'
                    }`}>{point.label}</span>
                    <motion.span 
                      className={`text-2xl sm:text-3xl font-bold ${
                        idx === 1 ? 'text-violet-300' : 'text-white/50'
                      }`}
                      animate={idx === 1 && currentScene >= 3 ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {point.multiplier}
                    </motion.span>
                  </motion.div>
                ))}

                {/* Arrow between */}
                {currentScene >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <ArrowRight className="w-6 h-6 text-violet-400" />
                  </motion.div>
                )}
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-violet-200/70 text-sm text-center"
                >
                  Menos esforço bruto, mais resultado inteligente
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Mentalidade de alavanca */}
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
                animate={{ 
                  y: [0, -15, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-500/40">
                  <Rocket className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
                </div>

                {/* Orbiting stars */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: Math.cos((i * 90 + currentScene * 30) * Math.PI / 180) * 80 - 10,
                      y: Math.sin((i * 90 + currentScene * 30) * Math.PI / 180) * 80 - 10,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}

                {/* Boost particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-violet-400"
                    style={{
                      bottom: '-20px',
                      left: '50%',
                    }}
                    animate={{
                      y: [0, 40, 0],
                      x: [0, (i - 2.5) * 15, 0],
                      opacity: [1, 0, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Alavanca Real
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-violet-200/80 text-sm sm:text-base"
                >
                  É assim que a I.A. deixa de ser curiosidade tecnológica e vira ferramenta real para o seu conhecimento
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 bg-violet-500/20 px-4 py-2 rounded-full border border-violet-500/30"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-violet-300 text-sm font-medium">Multiplique seu impacto</span>
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
                idx === currentScene ? 'w-6 bg-violet-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectLeverageMindset;
