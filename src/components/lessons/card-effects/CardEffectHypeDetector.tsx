'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle, Target, Zap, Eye, Shield, Brain, Sparkles } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🔍 HYPE DETECTOR
 * Aula: Introdução à I.A.
 * Conceito: Separar realidade do hype sobre I.A.
 * Ajuste X2: 11 cenas (~33 segundos)
 */
export function CardEffectHypeDetector({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const hypeItems = [
    { text: "IA vai substituir todos!", icon: AlertCircle, isHype: true },
    { text: "Assistente para tarefas", icon: CheckCircle, isHype: false },
    { text: "IA é magia!", icon: AlertCircle, isHype: true },
    { text: "Ferramenta que aprende", icon: CheckCircle, isHype: false },
  ];

  const insightCards = [
    { icon: Eye, text: "Observe com critério", color: "text-violet-400" },
    { icon: Shield, text: "Proteja-se do hype", color: "text-emerald-400" },
    { icon: Brain, text: "Pense com clareza", color: "text-amber-400" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Target className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Detector de <span className="text-violet-400">Hype</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-purple-200 text-sm"
            >
              Separando realidade da ficção sobre I.A.
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Scanner de hype items */}
        {scene >= 3 && scene <= 6 && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {hypeItems.map((item, idx) => {
                const Icon = item.icon;
                const shouldShow = scene >= 3 + idx * 0.5;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      scale: shouldShow ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.4 }}
                    className={`p-3 rounded-xl border-2 ${
                      item.isHype 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-green-500/10 border-green-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`w-5 h-5 ${item.isHype ? 'text-red-400' : 'text-green-400'}`} />
                      <div>
                        <p className="text-white font-medium text-xs">{item.text}</p>
                        <span className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded ${
                          item.isHype 
                            ? 'bg-red-500/20 text-red-300' 
                            : 'bg-green-500/20 text-green-300'
                        }`}>
                          {item.isHype ? 'HYPE' : 'REAL'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-violet-300 text-sm text-center"
            >
              Analisando afirmações...
            </motion.p>
          </motion.div>
        )}

        {/* Cena 7: Análise completa */}
        {scene === 7 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-violet-500/20 border-2 border-violet-500 flex items-center justify-center mb-6"
            >
              <Zap className="w-12 h-12 text-violet-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Análise Completa!</h3>
            <p className="text-violet-300 text-center text-sm">Agora você sabe diferenciar</p>
          </motion.div>
        )}

        {/* Cena 8: Insight Cards */}
        {scene === 8 && (
          <motion.div
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-bold text-white mb-4">Suas Ferramentas:</h3>
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {insightCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    <Icon className={`w-6 h-6 ${card.color} mx-auto mb-2`} />
                    <p className="text-white text-xs font-medium">{card.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cena 9: Stats */}
        {scene === 9 && (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30"
              >
                <p className="text-3xl font-bold text-red-400">50%</p>
                <p className="text-red-300 text-sm mt-1">Era Hype</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30"
              >
                <p className="text-3xl font-bold text-green-400">50%</p>
                <p className="text-green-300 text-sm mt-1">Era Real</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Cena 10: Mensagem final */}
        {scene >= 10 && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(139, 92, 246, 0)', '0 0 50px rgba(139, 92, 246, 0.5)', '0 0 0px rgba(139, 92, 246, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-center max-w-sm"
            >
              <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Detector Ativado!</h3>
              <p className="text-violet-300 text-sm">
                Você agora identifica o que realmente importa na revolução da I.A.
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
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-violet-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectHypeDetector;
