'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Layers, GitBranch, BookOpen, CheckCircle, ArrowDown } from 'lucide-react';

interface CardEffectStructureMapProps {
  onComplete?: () => void;
}

export const CardEffectStructureMap = ({ onComplete }: CardEffectStructureMapProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneDuration = 3000;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= totalScenes - 1) {
          setTimeout(() => onComplete?.(), 500);
          return 0;
        }
        return prev + 1;
      });
    }, sceneDuration);
    return () => clearInterval(interval);
  }, [onComplete]);

  const structureLevels = [
    { label: 'Módulos', count: 4, color: 'from-blue-500 to-blue-600' },
    { label: 'Capítulos', count: 12, color: 'from-purple-500 to-purple-600' },
    { label: 'Tópicos', count: 36, color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Hierarquia da estrutura */}
          {currentScene <= 5 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 sm:gap-6 max-w-md w-full"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-3 mb-2"
              >
                <Map className="w-8 h-8 text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Mapa do Conhecimento
                </h2>
              </motion.div>

              <div className="w-full space-y-3">
                {structureLevels.map((level, idx) => (
                  <motion.div
                    key={level.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className="relative"
                  >
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${level.color} ${
                      currentScene >= idx + 1 ? 'opacity-100' : 'opacity-30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-sm sm:text-base">{level.label}</span>
                        <span className="text-white/80 text-sm">{level.count} itens</span>
                      </div>
                    </div>
                    {idx < structureLevels.length - 1 && (
                      <motion.div
                        className="flex justify-center py-1"
                        animate={{ opacity: currentScene >= idx + 2 ? 1 : 0.3 }}
                      >
                        <ArrowDown className="w-5 h-5 text-white/40" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-blue-200/70 text-sm text-center"
                >
                  Estrutura clara = aprendizado organizado
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Transformação visual */}
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
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <GitBranch className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                
                {/* Floating nodes */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 rounded-full bg-blue-400"
                    style={{
                      top: i < 2 ? '-10px' : 'auto',
                      bottom: i >= 2 ? '-10px' : 'auto',
                      left: i % 2 === 0 ? '-10px' : 'auto',
                      right: i % 2 === 1 ? '-10px' : 'auto',
                    }}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.3 
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
                  Do Caos à Clareza
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-blue-200/80 text-sm sm:text-base"
                >
                  Sua experiência organizada em módulos, capítulos e tópicos principais
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Estrutura é poder</span>
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
                idx === currentScene ? 'w-6 bg-blue-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectStructureMap;
