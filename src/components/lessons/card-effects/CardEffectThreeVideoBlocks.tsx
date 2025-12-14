'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MessageSquare, ArrowRight, Layers, CheckCircle, Target } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 📦 THREE VIDEO BLOCKS
 * Aula: Vídeos simples com I.A.
 * Conceito: Gancho, Mensagem e Chamada - estrutura simples de roteiro
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectThreeVideoBlocks({ isActive = true, duration = 33 }: CardEffectProps) {
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
    { 
      id: 'gancho',
      label: 'Gancho', 
      icon: Zap, 
      color: '#f59e0b',
      desc: 'A primeira frase que para o dedo'
    },
    { 
      id: 'mensagem',
      label: 'Mensagem', 
      icon: MessageSquare, 
      color: '#3b82f6',
      desc: 'O coração do vídeo'
    },
    { 
      id: 'chamada',
      label: 'Chamada', 
      icon: ArrowRight, 
      color: '#22c55e',
      desc: 'O convite para ação'
    },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-6 flex flex-col">
      
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
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
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Layers className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Três blocos, <span className="text-cyan-400">um vídeo</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-blue-200 text-sm"
            >
              Gancho, mensagem e chamada final
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Blocos aparecendo */}
        {scene >= 3 && scene <= 6 && (
          <motion.div
            key="blocks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-4 w-full max-w-sm">
              {blocks.map((block, idx) => {
                const Icon = block.icon;
                const shouldShow = scene >= 3 + idx;
                const isActive = scene === 3 + idx;
                
                return (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.2, 
                      y: shouldShow ? 0 : 50,
                      scale: shouldShow ? 1 : 0.8
                    }}
                    transition={{ delay: idx * 0.15, type: 'spring' }}
                  >
                    <motion.div
                      animate={isActive ? { 
                        boxShadow: [`0 0 0px ${block.color}`, `0 0 30px ${block.color}`, `0 0 0px ${block.color}`]
                      } : {}}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                      className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: `${block.color}15`,
                        borderColor: `${block.color}40`
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${block.color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: block.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg">{block.label}</div>
                        <div className="text-slate-400 text-sm">{block.desc}</div>
                      </div>
                      {shouldShow && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: block.color }}
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-8: Estrutura unificada */}
        {scene >= 7 && scene <= 8 && (
          <motion.div
            key="unified"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2">
              {blocks.map((block, idx) => {
                const Icon = block.icon;
                return (
                  <React.Fragment key={block.id}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${block.color}30` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: block.color }} />
                    </motion.div>
                    {idx < blocks.length - 1 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        <ArrowRight className="w-6 h-6 text-slate-500" />
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-blue-200 text-center text-sm max-w-xs"
            >
              Essa estrutura simples funciona para qualquer vídeo curto
            </motion.p>
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
                boxShadow: ['0 0 0px rgba(34, 197, 94, 0)', '0 0 50px rgba(34, 197, 94, 0.4)', '0 0 0px rgba(34, 197, 94, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6"
            >
              <Target className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Gravação mais leve
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-green-300 text-sm max-w-xs"
            >
              Você não precisa decorar tudo — só saber onde começa, o que dizer e como terminar
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-cyan-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectThreeVideoBlocks;
