'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, BookOpen, GraduationCap, Award, User, TrendingUp, Star, Crown, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export function CardEffectAuthorityBuilder({
  isActive = true,
  duration = 33
}: CardEffectProps) {
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

  const steps = [
    { icon: Video, label: 'Curso', color: 'from-red-500 to-pink-500' },
    { icon: BookOpen, label: 'eBook', color: 'from-blue-500 to-cyan-500' },
    { icon: GraduationCap, label: 'Série', color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 rounded-2xl">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8 flex-1">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Construindo autoridade em camadas */}
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
                className="text-center"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Autoridade em Camadas
                </h2>
                <p className="text-amber-200/70 text-sm">
                  Não nasce em um post — é construída
                </p>
              </motion.div>

              {/* Escada de autoridade */}
              <div className="relative w-full flex flex-col items-center gap-2">
                {steps.map((step, idx) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      x: 0,
                      scale: currentScene === idx + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className={`flex items-center gap-3 p-4 rounded-xl w-full max-w-xs bg-gradient-to-r ${step.color} ${
                      currentScene >= idx + 1 ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{ marginLeft: `${idx * 20}px` }}
                  >
                    <step.icon className="w-6 h-6 text-white" />
                    <span className="text-white font-semibold text-sm sm:text-base">{step.label}</span>
                    {currentScene >= idx + 1 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {/* Avatar subindo */}
                {currentScene >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Crescendo</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Selo de autoridade */}
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
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-2xl shadow-amber-500/40">
                  <Crown className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
                </div>

                {/* Raios de luz */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-8 bg-amber-400"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: 'bottom',
                      transform: `rotate(${i * 45}deg) translateY(-80px)`
                    }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}

                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                </motion.div>
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Autoridade Construída
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-amber-200/80 text-sm sm:text-base"
                >
                  Cada camada de conteúdo profundo solidifica sua posição como referência no tema
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full border border-amber-500/30"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">Referência no seu nicho</span>
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
              idx === currentScene ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectAuthorityBuilder;