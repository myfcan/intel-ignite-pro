'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, FileText, Cog, ArrowRight, Sparkles, Zap, Type } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * ⚙️ AI TEXT ENGINE
 * Aula: Vídeos simples com I.A.
 * Conceito: Palavras-chave entrando e roteiro saindo
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectAiTextEngine({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const inputWords = ['postura', 'dor', 'dica', 'home office'];
  const outputLines = ['1. Gancho inicial', '2. Explicação simples', '3. Chamada final'];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-800 p-4 sm:p-6 flex flex-col">
      
      {/* Circuit pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Cog className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              A força da <span className="text-cyan-400">I.A. de texto</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-300 text-sm"
            >
              Transformando informações em roteiro
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Palavras entrando */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="input"
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
              <Type className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">Suas palavras-chave</span>
            </motion.div>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-xs mb-8">
              {inputWords.map((word, idx) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, scale: 0, x: -50 }}
                  animate={{ 
                    opacity: scene >= 3 + idx * 0.3 ? 1 : 0, 
                    scale: scene >= 3 + idx * 0.3 ? 1 : 0,
                    x: 0
                  }}
                  transition={{ delay: idx * 0.15, type: 'spring' }}
                  className="px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40"
                >
                  <span className="text-cyan-300 text-sm">{word}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Arrow to machine */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 text-cyan-400 rotate-90" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 6-7: Máquina processando */}
        {scene >= 6 && scene <= 7 && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                boxShadow: ['0 0 0px rgba(34, 211, 238, 0)', '0 0 40px rgba(34, 211, 238, 0.6)', '0 0 0px rgba(34, 211, 238, 0)']
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                boxShadow: { duration: 1.5, repeat: Infinity }
              }}
              className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center mb-6"
            >
              <Cog className="w-14 h-14 text-white" />
            </motion.div>
            
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-2 text-cyan-300"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Processando...</span>
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 8-9: Roteiro saindo */}
        {scene >= 8 && scene <= 9 && (
          <motion.div
            key="output"
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
              <FileText className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Roteiro gerado</span>
            </motion.div>
            
            <div className="w-full max-w-sm p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              {outputLines.map((line, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-center gap-2 py-2"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-white text-sm">{line}</span>
                </motion.div>
              ))}
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
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6"
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Motor de geração
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-cyan-200 text-sm max-w-xs"
            >
              A I.A. transforma seu briefing em roteiro pronto para gravar
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

export default CardEffectAiTextEngine;
