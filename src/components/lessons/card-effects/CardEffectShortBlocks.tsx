'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Scissors, Play, Layers, CheckCircle, Sparkles, Film } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🎬 SHORT BLOCKS
 * Aula: Vídeos simples com I.A.
 * Conceito: Grave em blocos curtos - gancho, meio e fim separados
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectShortBlocks({ isActive = true, duration = 33 }: CardEffectProps) {
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
    { label: 'Gancho', color: '#f59e0b', duration: '5s' },
    { label: 'Conteúdo', color: '#3b82f6', duration: '25s' },
    { label: 'Chamada', color: '#22c55e', duration: '10s' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 sm:p-6 flex flex-col">
      
      {/* Film strip pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 12px)',
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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Film className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Um vídeo, vários <span className="text-purple-400">pedacinhos</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-indigo-200 text-sm"
            >
              Gancho, meio e fim em takes separados
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Timeline dividida */}
        {scene >= 3 && scene <= 6 && (
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
              <Layers className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Timeline dividida</span>
            </motion.div>
            
            <div className="flex gap-2 w-full max-w-sm">
              {blocks.map((block, idx) => {
                const shouldShow = scene >= 3 + idx;
                const isActive = scene === 3 + idx;
                
                return (
                  <motion.div
                    key={block.label}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3, 
                      scaleX: shouldShow ? 1 : 0
                    }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex-1"
                  >
                    <motion.div
                      animate={isActive ? {
                        boxShadow: [`0 0 0px ${block.color}`, `0 0 20px ${block.color}`, `0 0 0px ${block.color}`]
                      } : {}}
                      transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                      className="h-20 rounded-lg flex flex-col items-center justify-center"
                      style={{ backgroundColor: `${block.color}30` }}
                    >
                      <Video className="w-5 h-5 mb-1" style={{ color: block.color }} />
                      <div className="text-white text-xs font-semibold">{block.label}</div>
                      <div className="text-slate-400 text-[10px]">{block.duration}</div>
                    </motion.div>
                    {shouldShow && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex justify-center mt-2"
                      >
                        <Play className="w-4 h-4" style={{ color: block.color }} />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-8: Montagem */}
        {scene >= 7 && scene <= 8 && (
          <motion.div
            key="assembly"
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
              <span className="text-amber-300 text-sm font-medium">Depois você junta</span>
            </motion.div>
            
            <div className="flex items-center gap-2">
              {blocks.map((block, idx) => (
                <React.Fragment key={block.label}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.15 }}
                    className="w-16 h-10 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${block.color}40` }}
                  >
                    <span className="text-white text-xs">{block.label}</span>
                  </motion.div>
                  {idx < blocks.length - 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="w-1 h-1 rounded-full bg-slate-500"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Result */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 w-full max-w-xs h-12 rounded-lg bg-gradient-to-r from-amber-500/30 via-blue-500/30 to-green-500/30 border border-white/20 flex items-center justify-center"
            >
              <span className="text-white text-sm font-medium">Vídeo final montado</span>
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 9-10: Mensagem final */}
        {scene >= 9 && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(139, 92, 246, 0)', '0 0 50px rgba(139, 92, 246, 0.5)', '0 0 0px rgba(139, 92, 246, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Menos pressão por take
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-indigo-200 text-sm max-w-xs"
            >
              Grave em partes e monte depois. Errou? Regrava só aquele pedaço.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-purple-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectShortBlocks;
