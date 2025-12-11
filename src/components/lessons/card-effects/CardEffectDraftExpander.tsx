'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Languages, ArrowRight, Brain, Sparkles, CheckCircle } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectDraftExpander: React.FC<CardEffectProps> = ({ isActive = true }) => {
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

  const transformationSteps = [
    { from: 'Conceito técnico', to: 'Linguagem simples' },
    { from: 'Ideia abstrata', to: 'Exemplo prático' },
    { from: 'Teoria pura', to: 'Aplicação real' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Transformação de linguagem */}
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
                <Languages className="w-8 h-8 text-indigo-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Traduza o Complicado
                </h2>
              </motion.div>

              <div className="w-full space-y-3">
                {transformationSteps.map((step, idx) => (
                  <motion.div
                    key={step.from}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl ${
                      currentScene >= idx + 1
                        ? 'bg-indigo-500/20 border border-indigo-500/40'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex-1 text-right">
                      <span className="text-white/60 text-sm line-through">{step.from}</span>
                    </div>
                    <motion.div
                      animate={currentScene >= idx + 1 ? { x: [0, 5, 0] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 text-indigo-400" />
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-indigo-300 text-sm font-medium">{step.to}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-indigo-200/70 text-sm text-center"
                >
                  Da sua cabeça para a linguagem do aluno
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Expansão visual */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg"
            >
              <div className="relative">
                {/* Brain with expansion effect */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30"
                >
                  <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                
                {/* Expanding waves */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-2xl border-2 border-indigo-400/30"
                    animate={{
                      scale: [1, 1.5 + i * 0.3],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}

                {/* Floating text particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded bg-indigo-400/60"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                      y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Expandir Rascunhos
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-indigo-200/80 text-sm sm:text-base"
                >
                  A I.A. gera explicações em linguagem simples que você depois ajusta e personaliza
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 text-indigo-400"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Rascunho → Conteúdo claro</span>
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
                idx === currentScene ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectDraftExpander;
