'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, HelpCircle, AlertCircle, Frown, Lightbulb, Sparkles, Wand2 } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🚫 BLANK SCREEN BLOCK
 * Aula: Vídeos simples com I.A.
 * Conceito: Pessoa olhando para o celular com dúvida, bloqueio criativo
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectBlankScreenBlock({ isActive = true, duration = 33 }: CardEffectProps) {
  const [scene, setScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    setScene(0);
    const interval = setInterval(() => {
      setScene(prev => (prev < totalScenes - 1 ? prev + 1 : prev));
    }, sceneTime);
    return () => clearInterval(interval);
  }, [isActive, sceneTime]);

  const blocks = [
    { text: '"Não sei o que falar"', icon: HelpCircle },
    { text: '"Não sei por onde começar"', icon: AlertCircle },
    { text: '"Tenho vergonha de gravar"', icon: Frown },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4 sm:p-6 flex flex-col">
      
      {/* Static noise effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
      </div>

      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Celular com app de gravação */}
        {scene <= 2 && (
          <motion.div
            key="phone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              {/* Phone frame */}
              <div className="w-36 h-64 bg-slate-800 rounded-3xl border-4 border-slate-600 overflow-hidden shadow-2xl">
                {/* Camera app simulation */}
                <div className="absolute inset-2 bg-black rounded-2xl flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Camera className="w-12 h-12 text-slate-500" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="mt-4 text-slate-600 text-xs"
                  >
                    REC |
                  </motion.div>
                </div>
              </div>
              
              {/* Question mark floating */}
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [-10, 10, -10]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center"
              >
                <HelpCircle className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-slate-400 text-sm text-center"
            >
              O app aberto, mas o vídeo não sai...
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Bloqueios aparecendo */}
        {scene >= 3 && scene <= 6 && (
          <motion.div
            key="blocks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-slate-300 mb-6 text-center"
            >
              O bloqueio da página em branco
            </motion.h3>
            
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {blocks.map((block, idx) => {
                const Icon = block.icon;
                const isVisible = scene >= 3 + idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ 
                      opacity: isVisible ? 1 : 0, 
                      x: isVisible ? 0 : -30,
                      scale: isVisible ? 1 : 0.9
                    }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <Icon className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{block.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-8: Cursor piscando */}
        {scene >= 7 && scene <= 8 && (
          <motion.div
            key="cursor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-full max-w-sm p-6 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-xs text-slate-500 mb-2">Roteiro do vídeo:</div>
              <div className="h-20 flex items-start">
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-0.5 h-5 bg-amber-400"
                />
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-amber-300 text-sm text-center"
            >
              O roteiro que não sai...
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 9-10: Solução com I.A. */}
        {scene >= 9 && (
          <motion.div
            key="solution"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(34, 197, 94, 0)', '0 0 40px rgba(34, 197, 94, 0.5)', '0 0 0px rgba(34, 197, 94, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6"
            >
              <Wand2 className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              A I.A. resolve o bloqueio
            </motion.h3>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-green-300 text-sm"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Roteiro + clareza em minutos</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-amber-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectBlankScreenBlock;
