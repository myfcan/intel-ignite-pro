'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, FileText, Sparkles, Wand2, ArrowRight, CheckCircle } from 'lucide-react';

interface CardEffectTextEngineProps {
  onComplete?: () => void;
}

export const CardEffectTextEngine = ({ onComplete }: CardEffectTextEngineProps) => {
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

  const capabilities = [
    'Módulos e capítulos',
    'Rascunhos de explicação',
    'Exemplos práticos',
    'Exercícios',
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Capacidades */}
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
                <MessageSquare className="w-8 h-8 text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  I.A. de Texto em Ação
                </h2>
              </motion.div>

              <div className="w-full space-y-2">
                {capabilities.map((cap, idx) => (
                  <motion.div
                    key={cap}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: idx * 0.2, duration: 0.4 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      currentScene >= idx + 1 
                        ? 'bg-blue-500/20 border border-blue-500/40' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <motion.div
                      animate={currentScene >= idx + 1 ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className={`w-5 h-5 ${
                        currentScene >= idx + 1 ? 'text-blue-400' : 'text-white/30'
                      }`} />
                    </motion.div>
                    <span className={`text-sm sm:text-base ${
                      currentScene >= idx + 1 ? 'text-white' : 'text-white/50'
                    }`}>{cap}</span>
                  </motion.div>
                ))}
              </div>

              {currentScene >= 5 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-blue-200/70 text-sm text-center"
                >
                  ChatGPT, Claude ou equivalentes — o motor do seu conteúdo
                </motion.p>
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
              className="flex flex-col items-center gap-6 text-center max-w-lg"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                      '0 0 40px rgba(59, 130, 246, 0.6)',
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center"
                >
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </motion.div>

                {/* Typing effect */}
                <motion.div
                  className="absolute -right-4 -bottom-4 bg-blue-600 rounded-lg px-3 py-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-white text-xs">Gerando...</span>
                </motion.div>

                {/* Magic sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos(i * 60 * Math.PI / 180) * 50],
                      y: [0, Math.sin(i * 60 * Math.PI / 180) * 50],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                ))}
              </div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Motor do Conteúdo
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-blue-200/80 text-sm sm:text-base"
                >
                  Do esqueleto aos rascunhos completos — a I.A. escreve, você revisa e personaliza
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 text-blue-400"
              >
                <Wand2 className="w-5 h-5" />
                <span className="text-sm font-medium">Ideia → Rascunho → Conteúdo</span>
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

export default CardEffectTextEngine;
