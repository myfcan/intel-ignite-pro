'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, FileText, Scissors, Upload, ArrowRight, CheckCircle, Sparkles, Video } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 📱 PRODUCTION BASICS
 * Aula: Vídeos simples com I.A.
 * Conceito: Celular, timeline, edição, publicação
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectProductionBasics({ isActive = true, duration = 33 }: CardEffectProps) {
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
    { icon: FileText, label: 'Roteiro', color: '#8b5cf6' },
    { icon: Smartphone, label: 'Gravação', color: '#3b82f6' },
    { icon: Scissors, label: 'Edição', color: '#f59e0b' },
    { icon: Upload, label: 'Publicação', color: '#22c55e' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 p-4 sm:p-6 flex flex-col">
      
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Video className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Do roteiro para a <span className="text-blue-400">tela</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-300 text-sm"
            >
              Juntando celular, app e I.A.
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Passos do processo */}
        {scene >= 3 && scene <= 6 && (
          <motion.div
            key="steps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const shouldShow = scene >= 3 + idx * 0.7;
                const isActive = Math.floor(scene) === 3 + idx;
                
                return (
                  <React.Fragment key={step.label}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: shouldShow ? 1 : 0.3, 
                        scale: shouldShow ? 1 : 0.8
                      }}
                      transition={{ delay: idx * 0.15 }}
                    >
                      <motion.div
                        animate={isActive ? {
                          boxShadow: [`0 0 0px ${step.color}`, `0 0 25px ${step.color}`, `0 0 0px ${step.color}`]
                        } : {}}
                        transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                        className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                        style={{ backgroundColor: `${step.color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: step.color }} />
                      </motion.div>
                      <div className="text-center mt-2">
                        <span className="text-white text-xs font-medium">{step.label}</span>
                      </div>
                    </motion.div>
                    
                    {idx < steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ 
                          opacity: shouldShow ? 1 : 0.3, 
                          scaleX: shouldShow ? 1 : 0
                        }}
                        transition={{ delay: idx * 0.15 + 0.1 }}
                      >
                        <ArrowRight className="w-4 h-4 text-slate-500 mb-6" />
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-8: Timeline de edição */}
        {scene >= 7 && scene <= 8 && (
          <motion.div
            key="timeline"
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
              <Scissors className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Edição básica</span>
            </motion.div>
            
            {/* Simple timeline */}
            <div className="w-full max-w-sm p-4 rounded-xl bg-slate-800 border border-slate-700">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex-1 h-12 rounded bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center"
                  >
                    <span className="text-white text-xs">Clip {i}</span>
                  </motion.div>
                ))}
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-amber-500"
                />
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-slate-400 text-sm text-center"
            >
              Legendas, cortes simples, música de fundo
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 9-10: Vídeo publicado */}
        {scene >= 9 && (
          <motion.div
            key="published"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(34, 197, 94, 0)', '0 0 50px rgba(34, 197, 94, 0.5)', '0 0 0px rgba(34, 197, 94, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Caminho completo e simples
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 text-sm max-w-xs mb-4"
            >
              Roteiro → Gravação → Edição básica → Publicado!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 text-green-400 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sem precisar dominar ferramentas avançadas</span>
            </motion.div>
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

export default CardEffectProductionBasics;
