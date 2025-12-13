'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Globe, Wifi, Smartphone, Users, AppWindow, Brain, Sparkles } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🚀 GAME CHANGERS
 * Aula: Introdução à I.A.
 * Conceito: Tecnologias que transformaram o mundo
 * Ajuste X2: 11 cenas (~33 segundos)
 */
export function CardEffectGameChangers({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const timelineData = [
    { year: "1990", label: "Internet", icon: Globe, color: "#3b82f6" },
    { year: "2000", label: "Banda Larga", icon: Wifi, color: "#10b981" },
    { year: "2007", label: "Smartphones", icon: Smartphone, color: "#f59e0b" },
    { year: "2011", label: "Redes Sociais", icon: Users, color: "#ec4899" },
    { year: "2015", label: "Apps", icon: AppWindow, color: "#8b5cf6" },
    { year: "2025", label: "I.A. Generativa", icon: Brain, color: "#06b6d4" },
  ];

  const getCurrentItem = () => {
    if (scene <= 2) return null;
    const index = Math.min(scene - 3, timelineData.length - 1);
    return timelineData[index];
  };

  const currentItem = getCurrentItem();

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Título e intro */}
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
              animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.8 }}
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
              Mudanças de <span className="text-blue-400">Jogo</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-blue-200 text-sm"
            >
              Tecnologias que transformaram o mundo
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-8: Timeline items (um por vez) */}
        {scene >= 3 && scene <= 8 && currentItem && (
          <motion.div
            key={`item-${scene}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div 
              className="w-28 h-28 rounded-2xl flex items-center justify-center mb-6"
              style={{ 
                backgroundColor: `${currentItem.color}20`,
                boxShadow: `0 0 40px ${currentItem.color}40`
              }}
              animate={scene === 8 ? { 
                boxShadow: [`0 0 20px ${currentItem.color}40`, `0 0 60px ${currentItem.color}60`, `0 0 20px ${currentItem.color}40`]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <currentItem.icon 
                className="w-14 h-14" 
                style={{ color: currentItem.color }} 
              />
            </motion.div>

            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              {currentItem.label}
            </motion.h3>

            <motion.div 
              className="px-6 py-2.5 rounded-full font-bold text-lg text-white"
              style={{ backgroundColor: currentItem.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {currentItem.year}
            </motion.div>

            {scene === 8 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300 text-sm font-medium">
                  A próxima revolução é AGORA!
                </span>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Cenas 9-10: Mensagem final */}
        {scene >= 9 && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(59, 130, 246, 0)', '0 0 50px rgba(59, 130, 246, 0.5)', '0 0 0px rgba(59, 130, 246, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center max-w-sm"
            >
              <Rocket className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Cada revolução trouxe quem agiu primeiro</h3>
              <p className="text-blue-300 text-sm">
                Você está no início da próxima!
              </p>
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

export default CardEffectGameChangers;
