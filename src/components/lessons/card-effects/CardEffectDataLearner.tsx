'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Brain, TrendingUp, Sparkles, FileText, BarChart3, Image } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 📊 DATA LEARNER
 * Aula: Introdução à I.A.
 * Conceito: I.A. aprende com dados - textos, imagens, gráficos
 * Ajuste X2: 11 cenas (~33 segundos)
 */
export function CardEffectDataLearner({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const dataTypes = [
    { icon: FileText, label: "Textos", emoji: "📝" },
    { icon: BarChart3, label: "Gráficos", emoji: "📊" },
    { icon: Image, label: "Imagens", emoji: "🖼️" },
  ];

  const stats = [
    { label: "Padrões", value: "1.2M", emoji: "🔍" },
    { label: "Conexões", value: "500K", emoji: "🔗" },
    { label: "Insights", value: "10K", emoji: "💡" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Database className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              I.A. <span className="text-emerald-400">Aprende</span> com Dados
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-emerald-200 text-sm"
            >
              Quanto mais dados, mais inteligente
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Tipos de dados */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="datatypes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-bold text-white mb-6">Fontes de Aprendizado:</h3>
            <div className="flex gap-4">
              {dataTypes.map((type, idx) => {
                const shouldShow = scene >= 3 + idx * 0.5;
                const Icon = type.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: shouldShow ? 1 : 0.3, y: shouldShow ? 0 : 20 }}
                    transition={{ delay: idx * 0.15 }}
                    className="w-20 h-20 rounded-xl bg-emerald-500/20 flex flex-col items-center justify-center text-center"
                  >
                    <span className="text-2xl mb-1">{type.emoji}</span>
                    <span className="text-emerald-300 text-xs">{type.label}</span>
                  </motion.div>
                );
              })}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: scene >= 5 ? 1 : 0 }}
              className="mt-6 text-emerald-300 text-sm text-center"
            >
              Cada dado ensina algo novo
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 6-7: Cérebro processando */}
        {scene >= 6 && scene <= 7 && (
          <motion.div
            key="brain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center mb-6"
              animate={{ 
                boxShadow: ['0 0 0px #10b981', '0 0 50px #10b981', '0 0 0px #10b981']
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Brain className="w-14 h-14 text-emerald-400" />
            </motion.div>
            
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-emerald-300 text-sm font-medium"
            >
              Processando padrões...
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 8-9: Estatísticas */}
        {scene >= 8 && scene <= 9 && (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-bold text-white mb-6">Resultados do Aprendizado:</h3>
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.15, type: "spring" }}
                  className="p-3 rounded-lg bg-teal-500/15 border border-teal-500/20 text-center"
                >
                  <span className="text-lg">{stat.emoji}</span>
                  <p className="text-teal-300 font-bold text-sm">{stat.value}</p>
                  <p className="text-teal-400/70 text-xs">{stat.label}</p>
                </motion.div>
              ))}
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
                boxShadow: ['0 0 0px rgba(16, 185, 129, 0)', '0 0 50px rgba(16, 185, 129, 0.5)', '0 0 0px rgba(16, 185, 129, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center max-w-sm"
            >
              <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Quanto mais dados, melhor a I.A.</h3>
              <p className="text-emerald-300 text-sm">
                Ela encontra padrões que humanos não conseguem ver
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
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-emerald-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectDataLearner;
