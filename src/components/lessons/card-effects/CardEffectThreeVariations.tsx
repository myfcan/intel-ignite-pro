'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, FileText, Sparkles, CheckCircle, ArrowRight, Layers, Star } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 📋 THREE VARIATIONS
 * Aula: Vídeos simples com I.A.
 * Conceito: Um roteiro central se divide em três variações
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectThreeVariations({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const variations = [
    { label: 'Versão curta', desc: '30 segundos', color: '#3b82f6', highlight: 'Direto ao ponto' },
    { label: 'Versão média', desc: '1 minuto', color: '#8b5cf6', highlight: 'Com exemplo' },
    { label: 'Versão longa', desc: '2 minutos', color: '#ec4899', highlight: 'Completa' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-950 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 50%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Layers className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Uma ideia, <span className="text-purple-400">três versões</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-indigo-200 text-sm"
            >
              Mais opções para você escolher
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-4: Roteiro central */}
        {scene >= 3 && scene <= 4 && (
          <motion.div
            key="central"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-48 p-4 rounded-xl bg-purple-500/20 border-2 border-purple-500 text-center"
            >
              <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-white font-semibold">Roteiro original</div>
              <div className="text-purple-300 text-sm mt-1">Seu tema principal</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.5 }}
              className="w-0.5 h-12 bg-purple-500/50 mt-4"
            />
          </motion.div>
        )}

        {/* Cenas 5-7: Divisão em variações */}
        {scene >= 5 && scene <= 7 && (
          <motion.div
            key="split"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {/* Central smaller */}
            <div className="w-32 p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center mb-4">
              <FileText className="w-5 h-5 text-purple-400 mx-auto" />
              <div className="text-white text-xs font-medium mt-1">Original</div>
            </div>
            
            {/* Branching lines */}
            <div className="flex justify-center gap-8 mb-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="w-0.5 h-8"
                  style={{ backgroundColor: variations[i].color }}
                />
              ))}
            </div>
            
            {/* Variations */}
            <div className="flex gap-3 flex-wrap justify-center">
              {variations.map((v, idx) => {
                const isVisible = scene >= 5 + idx * 0.5;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ 
                      opacity: isVisible ? 1 : 0.3, 
                      y: isVisible ? 0 : 20,
                      scale: isVisible ? 1 : 0.8
                    }}
                    transition={{ delay: idx * 0.15 }}
                    className="w-28 p-3 rounded-xl border text-center"
                    style={{ 
                      backgroundColor: `${v.color}15`,
                      borderColor: `${v.color}40`
                    }}
                  >
                    <Copy className="w-5 h-5 mx-auto mb-1" style={{ color: v.color }} />
                    <div className="text-white text-xs font-semibold">{v.label}</div>
                    <div className="text-slate-400 text-[10px] mt-1">{v.desc}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 8-9: Escolha destacada */}
        {scene >= 8 && scene <= 9 && (
          <motion.div
            key="choice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex gap-4 mb-6">
              {variations.map((v, idx) => {
                const isSelected = idx === 1; // Highlight middle one
                return (
                  <motion.div
                    key={idx}
                    animate={isSelected ? { 
                      scale: [1, 1.1, 1],
                      boxShadow: [`0 0 0px ${v.color}`, `0 0 30px ${v.color}`, `0 0 0px ${v.color}`]
                    } : { opacity: 0.5 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-24 p-3 rounded-xl border text-center"
                    style={{ 
                      backgroundColor: `${v.color}20`,
                      borderColor: isSelected ? v.color : `${v.color}30`
                    }}
                  >
                    <div className="text-white text-xs font-semibold">{v.label}</div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2"
                      >
                        <CheckCircle className="w-5 h-5 mx-auto" style={{ color: v.color }} />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-purple-200 text-sm text-center"
            >
              Você escolhe a que funciona melhor
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
                boxShadow: ['0 0 0px rgba(139, 92, 246, 0)', '0 0 50px rgba(139, 92, 246, 0.5)', '0 0 0px rgba(139, 92, 246, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6"
            >
              <Star className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              A I.A. gera opções
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-purple-200 text-sm max-w-xs"
            >
              Você decide qual versão combina com seu estilo e momento
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

export default CardEffectThreeVariations;
