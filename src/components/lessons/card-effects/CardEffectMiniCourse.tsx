'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Layers, Trophy, Star, Zap } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectMiniCourse: React.FC<CardEffectProps> = ({ isActive = true, duration = 33 }) => {
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

  const modules = [
    { title: 'Módulo 1', status: 'complete' },
    { title: 'Módulo 2', status: 'complete' },
    { title: 'Módulo 3', status: 'progress' },
    { title: 'Módulo 4', status: 'pending' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 bg-green-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Estrutura do mini-curso */}
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
                <Layers className="w-8 h-8 text-emerald-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Formato Enxuto
                </h2>
              </motion.div>

              <div className="w-full space-y-2">
                {modules.map((mod, idx) => (
                  <motion.div
                    key={mod.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: idx * 0.2, duration: 0.4 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      currentScene >= idx + 1 
                        ? mod.status === 'complete' 
                          ? 'bg-emerald-500/20 border border-emerald-500/40' 
                          : mod.status === 'progress'
                          ? 'bg-yellow-500/20 border border-yellow-500/40'
                          : 'bg-white/5 border border-white/20'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <motion.div
                      animate={currentScene >= idx + 1 && mod.status === 'progress' ? { 
                        scale: [1, 1.2, 1] 
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <CheckCircle className={`w-5 h-5 ${
                        mod.status === 'complete' 
                          ? 'text-emerald-400' 
                          : mod.status === 'progress'
                          ? 'text-yellow-400'
                          : 'text-white/30'
                      }`} />
                    </motion.div>
                    <span className="text-white text-sm sm:text-base">{mod.title}</span>
                    {mod.status === 'progress' && (
                      <span className="ml-auto text-xs bg-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded">
                        Em progresso
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {currentScene >= 5 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-200/70 text-sm text-center"
                >
                  Um projeto que você consegue terminar
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Conclusão */}
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
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                  <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </motion.div>

                {/* Confetti effect */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ['#10b981', '#22c55e', '#fbbf24', '#f59e0b'][i % 4],
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
                      y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.15,
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
                  Impacto Real
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-emerald-200/80 text-sm sm:text-base"
                >
                  Mini-curso de 4 módulos ou eBook de 5 capítulos — projetos terminá­veis que entregam valor real
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 text-emerald-400"
              >
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Menos é mais</span>
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
                idx === currentScene ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectMiniCourse;
