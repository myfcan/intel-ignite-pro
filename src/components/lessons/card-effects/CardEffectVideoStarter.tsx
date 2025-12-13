'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users, Megaphone, Palette, Rocket, CheckCircle, Sparkles, Play } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🚀 VIDEO STARTER
 * Aula: Vídeos simples com I.A.
 * Conceito: Quatro ícones: tema, público, objetivo e tom
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectVideoStarter({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const steps = [
    { icon: Target, label: 'Tema', desc: 'Sobre o que falar', color: '#3b82f6' },
    { icon: Users, label: 'Público', desc: 'Para quem é o vídeo', color: '#8b5cf6' },
    { icon: Megaphone, label: 'Objetivo', desc: 'O que a pessoa deve fazer', color: '#22c55e' },
    { icon: Palette, label: 'Tom', desc: 'Como você quer soar', color: '#f59e0b' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-violet-950 p-4 sm:p-6 flex flex-col">
      
      {/* Gradient pulse */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 70%, rgba(139, 92, 246, 0.5) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 6, repeat: Infinity }}
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
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Seu próximo vídeo <span className="text-blue-400">começa aqui</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-indigo-200 text-sm"
            >
              Do tema ao roteiro pronto
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-7: Passos aparecendo */}
        {scene >= 3 && scene <= 7 && (
          <motion.div
            key="steps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const shouldShow = scene >= 3 + idx;
                const isActive = scene === 3 + idx;
                
                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.2, 
                      scale: shouldShow ? 1 : 0.8,
                      y: shouldShow ? 0 : 20
                    }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <motion.div
                      animate={isActive ? {
                        boxShadow: [`0 0 0px ${step.color}`, `0 0 25px ${step.color}`, `0 0 0px ${step.color}`]
                      } : {}}
                      transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                      className="p-4 rounded-xl border text-center"
                      style={{ 
                        backgroundColor: `${step.color}15`,
                        borderColor: `${step.color}40`
                      }}
                    >
                      <motion.div
                        animate={shouldShow ? { rotate: [0, -5, 5, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
                        style={{ backgroundColor: `${step.color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: step.color }} />
                      </motion.div>
                      <div className="text-white font-semibold text-sm">{step.label}</div>
                      <div className="text-slate-400 text-xs mt-1">{step.desc}</div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 8-9: Todos juntos */}
        {scene >= 8 && scene <= 9 && (
          <motion.div
            key="together"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2 mb-6">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.label}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </motion.div>
                );
              })}
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
              </motion.div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-blue-200 text-center text-sm max-w-xs"
            >
              Poucos elementos para destravar um roteiro funcional
            </motion.p>
          </motion.div>
        )}

        {/* Cena 10: Mensagem final */}
        {scene >= 10 && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(59, 130, 246, 0)', '0 0 50px rgba(59, 130, 246, 0.5)', '0 0 0px rgba(59, 130, 246, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6"
            >
              <Play className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Pronto para gravar
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-indigo-200 text-sm max-w-xs"
            >
              Em poucos cliques, você sai com um roteiro pronto para o celular
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-blue-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectVideoStarter;
