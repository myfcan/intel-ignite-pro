'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Hand, Eye, Play, Pause, ArrowUp, Timer, Sparkles } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * ⚡ HOOK POWER
 * Aula: Vídeos simples com I.A.
 * Conceito: A primeira frase que para o dedo no feed
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectHookPower({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const hookExamples = [
    '"Se você sente dor nas costas todo dia..."',
    '"Antes de contratar, assista isso..."',
    '"O erro que 90% das pessoas cometem..."',
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 p-4 sm:p-6 flex flex-col">
      
      {/* Lightning effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.6) 0%, transparent 60%)',
            'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.4) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Título */}
        {scene <= 2 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(245, 158, 11, 0)', '0 0 60px rgba(245, 158, 11, 0.8)', '0 0 0px rgba(245, 158, 11, 0)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl"
              >
                <Zap className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mt-6 mb-3"
            >
              O poder da <span className="text-amber-400">primeira frase</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-orange-200 text-sm"
            >
              Segundos que decidem se alguém fica ou passa
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Feed scrollando e parando */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="relative w-48 h-72 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
              {/* Videos scrolling */}
              <motion.div
                animate={scene === 3 ? { y: [0, -200] } : { y: -200 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-col gap-2 p-2"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className={`w-full h-16 rounded-lg flex items-center justify-center ${
                      i === 3 ? 'bg-amber-500/30 border-2 border-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    {i === 3 ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Zap className="w-6 h-6 text-amber-400" />
                      </motion.div>
                    ) : (
                      <Play className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                ))}
              </motion.div>
              
              {/* Finger stopping */}
              {scene >= 4 && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute bottom-4 right-4"
                >
                  <motion.div
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Hand className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-amber-200 text-sm text-center"
            >
              O gancho certo para o dedo
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 6-8: Exemplos de ganchos */}
        {scene >= 6 && scene <= 8 && (
          <motion.div
            key="examples"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-6"
            >
              <Eye className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Exemplos de gancho</span>
            </motion.div>
            
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {hookExamples.map((example, idx) => {
                const isVisible = scene >= 6 + idx * 0.5;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: isVisible ? 1 : 0.3, x: isVisible ? 0 : -30 }}
                    transition={{ delay: idx * 0.2 }}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                      <span className="text-white text-sm italic">{example}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 9-10: Tempo crítico */}
        {scene >= 9 && (
          <motion.div
            key="time"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 rounded-full border-4 border-amber-500 border-t-transparent flex items-center justify-center mb-6"
            >
              <Timer className="w-10 h-10 text-amber-400" />
            </motion.div>
            
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl font-bold text-amber-400 mb-2"
            >
              3 segundos
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-orange-200 text-sm max-w-xs"
            >
              É o tempo que você tem para capturar a atenção no feed
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 mt-4 text-green-400 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>A I.A. te ajuda a encontrar o gancho certo</span>
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

export default CardEffectHookPower;
