'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, FileText, Handshake, ArrowRight, Heart, Sparkles, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🤝 PARTNERSHIP
 * Aula: Vídeos simples com I.A.
 * Conceito: Pessoa e I.A. trabalhando juntos no roteiro
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectPartnership({ isActive = true, duration = 33 }: CardEffectProps) {
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

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950 via-teal-950 to-emerald-950 p-4 sm:p-6 flex flex-col">
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.1 }}>
        <motion.line
          x1="20%" y1="50%" x2="80%" y2="50%"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="text-cyan-400"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Handshake className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Parceria, não <span className="text-cyan-400">substituição</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-teal-200 text-sm"
            >
              A I.A. ajuda, você continua no comando
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Dois lados */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="sides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center gap-8"
          >
            {/* Human side */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-white font-semibold text-sm">Você</div>
              <div className="text-teal-300 text-xs mt-1">Autenticidade</div>
            </motion.div>
            
            {/* Connection */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  x: [-10, 10, -10],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 text-cyan-400" />
              </motion.div>
              <motion.div
                animate={{ 
                  x: [10, -10, 10],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rotate-180"
              >
                <ArrowRight className="w-6 h-6 text-cyan-400" />
              </motion.div>
            </motion.div>
            
            {/* AI side */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-3"
              >
                <Bot className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-white font-semibold text-sm">I.A.</div>
              <div className="text-cyan-300 text-xs mt-1">Organização</div>
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 6-7: Empurrando roteiro juntos */}
        {scene >= 6 && scene <= 7 && (
          <motion.div
            key="together"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="relative flex items-center gap-4">
              {/* Human pushing */}
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-14 h-14 rounded-full bg-emerald-500/30 flex items-center justify-center"
              >
                <User className="w-7 h-7 text-emerald-400" />
              </motion.div>
              
              {/* Script in middle */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: ['0 0 0px rgba(34, 211, 238, 0)', '0 0 30px rgba(34, 211, 238, 0.5)', '0 0 0px rgba(34, 211, 238, 0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-32 rounded-xl bg-cyan-500/20 border-2 border-cyan-500 flex flex-col items-center justify-center"
              >
                <FileText className="w-10 h-10 text-cyan-400 mb-2" />
                <div className="text-white text-xs font-semibold">Roteiro</div>
              </motion.div>
              
              {/* AI pushing */}
              <motion.div
                animate={{ x: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-14 h-14 rounded-full bg-cyan-500/30 flex items-center justify-center"
              >
                <Bot className="w-7 h-7 text-cyan-400" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Cenas 8-9: O que cada um faz */}
        {scene >= 8 && scene <= 9 && (
          <motion.div
            key="roles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <div className="flex gap-4 w-full max-w-sm">
              {/* AI role */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex-1 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30"
              >
                <Bot className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-white text-sm font-semibold">I.A. cuida</div>
                <div className="text-cyan-300 text-xs mt-1">Página em branco</div>
                <div className="text-cyan-300 text-xs">Estrutura</div>
                <div className="text-cyan-300 text-xs">Variações</div>
              </motion.div>
              
              {/* Human role */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex-1 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <User className="w-6 h-6 text-emerald-400 mb-2" />
                <div className="text-white text-sm font-semibold">Você cuida</div>
                <div className="text-emerald-300 text-xs mt-1">Autenticidade</div>
                <div className="text-emerald-300 text-xs">Jeito de falar</div>
                <div className="text-emerald-300 text-xs">Detalhes reais</div>
              </motion.div>
            </div>
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
                boxShadow: ['0 0 0px rgba(34, 211, 238, 0)', '0 0 50px rgba(34, 211, 238, 0.5)', '0 0 0px rgba(34, 211, 238, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-6"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Decisão final é sua
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-teal-200 text-sm max-w-xs"
            >
              A autenticidade e a experiência real continuam sendo humanas
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

export default CardEffectPartnership;
