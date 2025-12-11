'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, XCircle, Rocket, ArrowRight, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectProjectPicker: React.FC<CardEffectProps> = ({ isActive = true }) => {
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

  const projectOptions = [
    { label: 'Curso completo', size: 'Grande', risky: true },
    { label: 'Mini-curso 4 módulos', size: 'Enxuto', risky: false, recommended: true },
    { label: 'eBook 5 capítulos', size: 'Enxuto', risky: false },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Escolha de projeto */}
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
                <Target className="w-8 h-8 text-cyan-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Escolha um Projeto
                </h2>
              </motion.div>

              <div className="w-full space-y-3">
                {projectOptions.map((project, idx) => (
                  <motion.div
                    key={project.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className={`flex items-center gap-3 p-4 rounded-xl border ${
                      project.recommended
                        ? 'bg-green-500/20 border-green-500/50'
                        : project.risky
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-cyan-500/15 border-cyan-500/30'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm sm:text-base">{project.label}</span>
                        {project.recommended && (
                          <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <span className="text-white/60 text-xs">Tamanho: {project.size}</span>
                    </div>
                    {project.risky ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </motion.div>
                ))}
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-cyan-200/70 text-sm text-center"
                >
                  Comece pequeno, mas comece de verdade
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Foco */}
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
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                  <Rocket className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                
                {/* Focus ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-cyan-400/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Um Projeto, Não Dez
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-cyan-200/80 text-sm sm:text-base"
                >
                  O pior erro é tentar fazer "o curso da sua vida" logo de cara. Comece com algo enxuto e terminável.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 text-cyan-400"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Foco é a chave</span>
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
                idx === currentScene ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectProjectPicker;
