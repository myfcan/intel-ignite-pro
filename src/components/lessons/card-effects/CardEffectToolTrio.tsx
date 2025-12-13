'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FolderKanban, Image, Layers, Sparkles, ArrowRight } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectToolTrio: React.FC<CardEffectProps> = ({ isActive = true, duration = 33 }) => {
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

  const tools = [
    { 
      icon: FileText, 
      label: 'I.A. de Texto', 
      desc: 'Motor do conteúdo',
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      icon: FolderKanban, 
      label: 'I.A. de Organização', 
      desc: 'Cérebro do projeto',
      color: 'from-purple-500 to-violet-500' 
    },
    { 
      icon: Image, 
      label: 'I.A. Visual', 
      desc: 'Capa e identidade',
      color: 'from-pink-500 to-rose-500' 
    },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Os três pilares */}
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
                <Layers className="w-8 h-8 text-purple-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Três Camadas de I.A.
                </h2>
              </motion.div>

              <div className="grid grid-cols-3 gap-3 w-full">
                {tools.map((tool, idx) => (
                  <motion.div
                    key={tool.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      y: 0,
                      scale: currentScene === idx + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-gradient-to-br ${tool.color} ${
                      currentScene >= idx + 1 ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <tool.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    <div className="text-center">
                      <div className="text-white font-semibold text-xs sm:text-sm">{tool.label.split(' ').slice(-1)}</div>
                      <div className="text-white/70 text-[10px] sm:text-xs">{tool.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Connection lines */}
              {currentScene >= 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-0.5 w-8 bg-gradient-to-r from-blue-400 to-purple-400" />
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <div className="h-0.5 w-8 bg-gradient-to-r from-purple-400 to-pink-400" />
                </motion.div>
              )}

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-purple-200/70 text-sm text-center"
                >
                  Juntas, elas aceleram semanas de trabalho
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - União visual */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg"
            >
              <div className="relative">
                {/* Central hub */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-dashed border-purple-400/30 flex items-center justify-center"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </motion.div>

                {/* Orbiting tools */}
                {tools.map((tool, idx) => (
                  <motion.div
                    key={tool.label}
                    className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${tool.color.split(' ')[0].replace('from-', '')} 0%, ${tool.color.split(' ')[1].replace('to-', '')} 100%)`,
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: Math.cos((idx * 120 + currentScene * 20) * Math.PI / 180) * 70 - 20,
                      y: Math.sin((idx * 120 + currentScene * 20) * Math.PI / 180) * 70 - 20,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <tool.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                ))}
              </div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Trabalho em Time
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-purple-200/80 text-sm sm:text-base"
                >
                  Uma I.A. escreve, outra organiza, outra cuida do visual. Juntas, aceleram semanas de trabalho.
                </motion.p>
              </div>
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

export default CardEffectToolTrio;
