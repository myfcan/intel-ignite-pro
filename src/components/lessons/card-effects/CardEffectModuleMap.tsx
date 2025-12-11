'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Layers, BookOpen, CheckCircle, ArrowRight, Target, Sparkles } from 'lucide-react';

interface CardEffectModuleMapProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectModuleMap: React.FC<CardEffectModuleMapProps> = ({ 
  isActive = false,
  duration = 33 
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneDuration = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) {
      setCurrentScene(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % totalScenes);
    }, sceneDuration);

    return () => clearInterval(interval);
  }, [isActive, sceneDuration]);

  const modules = [
    { title: 'Módulo 1', subtitle: 'Fundamentos', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { title: 'Módulo 2', subtitle: 'Prática', icon: Layers, color: 'from-purple-500 to-purple-600' },
    { title: 'Módulo 3', subtitle: 'Avançado', icon: Target, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Módulo 4', subtitle: 'Resultado', icon: CheckCircle, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {/* FASE 1: Scenes 0-5 - Elementos empilhados */}
        {currentScene >= 0 && currentScene <= 5 && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 w-full max-w-sm"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Map className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Mapa de Módulos</h2>
            </motion.div>

            {/* Module Cards Stack */}
            <div className="flex flex-col gap-3 w-full">
              {modules.map((module, index) => (
                <motion.div
                  key={module.title}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: currentScene >= index ? 1 : 0.3,
                    scale: currentScene === index ? 1.02 : 1
                  }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  className={`relative p-4 rounded-xl border ${
                    currentScene >= index 
                      ? 'bg-white/10 border-white/20' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${module.color}`}>
                      <module.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm sm:text-base">{module.title}</h3>
                      <p className="text-white/60 text-xs sm:text-sm">{module.subtitle}</p>
                    </div>
                    {currentScene > index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Connection Line */}
                  {index < modules.length - 1 && currentScene > index && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      className="absolute left-8 -bottom-3 w-0.5 h-3 bg-gradient-to-b from-white/40 to-transparent origin-top"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: currentScene >= 4 ? 1 : 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 mt-2"
            >
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-white">4</p>
                <p className="text-xs text-white/60">Módulos</p>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-emerald-400">100%</p>
                <p className="text-xs text-white/60">Estruturado</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* FASE 2: Scenes 6-10 - Efeitos de tela limpa */}
        {currentScene >= 6 && currentScene <= 10 && (
          <motion.div
            key="phase2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 flex flex-col items-center justify-center w-full h-full"
          >
            {/* Scene 6: Map Expanding */}
            {currentScene === 6 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
                >
                  <Map className="w-16 h-16 text-white" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
                  Mapa Completo
                </h2>
              </motion.div>
            )}

            {/* Scene 7: Modules Connected */}
            {currentScene === 7 && (
              <motion.div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  {modules.map((module, i) => (
                    <React.Fragment key={i}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${module.color}`}
                      >
                        <module.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </motion.div>
                      {i < modules.length - 1 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '2rem' }}
                          transition={{ delay: i * 0.15 + 0.1 }}
                        >
                          <ArrowRight className="w-6 h-6 text-white/60" />
                        </motion.div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg sm:text-xl text-white/80 text-center mt-4"
                >
                  Sequência clara de aprendizado
                </motion.p>
              </motion.div>
            )}

            {/* Scene 8: Progress Visualization */}
            {currentScene === 8 && (
              <motion.div className="flex flex-col items-center gap-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Progresso Visual</h3>
                <div className="w-64 sm:w-80 h-4 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full"
                  />
                </div>
                <p className="text-white/60 text-sm sm:text-base">Do básico ao avançado</p>
              </motion.div>
            )}

            {/* Scene 9: Achievement */}
            {currentScene === 9 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl"
                  />
                  <div className="relative p-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full">
                    <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Estrutura Pronta!</h3>
              </motion.div>
            )}

            {/* Scene 10: Final Summary */}
            {currentScene === 10 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6 text-center px-4"
              >
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Mapa de Módulos Definido
                </h3>
                <p className="text-white/70 text-sm sm:text-base max-w-xs">
                  Organize seu conteúdo em blocos claros para facilitar o aprendizado
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
              i === currentScene
                ? 'bg-white scale-125'
                : i < currentScene
                ? 'bg-white/60'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectModuleMap;
