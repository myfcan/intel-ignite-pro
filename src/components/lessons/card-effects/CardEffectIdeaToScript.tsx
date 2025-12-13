'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Wand2, ListOrdered, ArrowRight, Lightbulb, PenTool } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 📝 IDEA TO SCRIPT
 * Aula: Vídeos simples com I.A.
 * Conceito: Anotações soltas se transformando em roteiro organizado
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectIdeaToScript({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const messyNotes = ['dor nas costas', 'exercícios simples', 'rotina', 'postura', 'dica rápida'];
  const organizedScript = [
    { num: 1, text: 'Gancho: "Se você sente dor..."' },
    { num: 2, text: 'Dica principal sobre postura' },
    { num: 3, text: 'Chamada: "Segue para mais"' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950 p-4 sm:p-6 flex flex-col">
      
      {/* Magic particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: '100%',
              opacity: 0 
            }}
            animate={{ 
              y: '-10%',
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.4
            }}
          />
        ))}
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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <PenTool className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Da ideia ao <span className="text-violet-400">roteiro</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-purple-200 text-sm"
            >
              Quando a I.A. organiza o que você quer dizer
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Notas bagunçadas */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="messy"
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
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Anotações soltas</span>
            </motion.div>
            
            <div className="relative w-64 h-48">
              {messyNotes.map((note, idx) => (
                <motion.div
                  key={idx}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    rotate: (Math.random() - 0.5) * 30
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: (idx % 3 - 1) * 60,
                    y: Math.floor(idx / 3) * 50 - 30,
                    rotate: (Math.random() - 0.5) * 15
                  }}
                  transition={{ delay: idx * 0.15, type: 'spring' }}
                  className="absolute left-1/2 top-1/2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg"
                >
                  <span className="text-amber-200 text-xs whitespace-nowrap">{note}</span>
                </motion.div>
              ))}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-slate-400 text-sm text-center"
            >
              Ideias espalhadas na cabeça...
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 6-7: Transformação */}
        {scene >= 6 && scene <= 7 && (
          <motion.div
            key="transform"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6"
            >
              <Wand2 className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-3 text-purple-300"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">I.A. organizando...</span>
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 8-9: Roteiro organizado */}
        {scene >= 8 && scene <= 9 && (
          <motion.div
            key="organized"
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
              <ListOrdered className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Roteiro pronto</span>
            </motion.div>
            
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {organizedScript.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">{item.num}</span>
                  </div>
                  <span className="text-white text-sm">{item.text}</span>
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
                boxShadow: ['0 0 0px rgba(139, 92, 246, 0)', '0 0 50px rgba(139, 92, 246, 0.5)', '0 0 0px rgba(139, 92, 246, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6"
            >
              <FileText className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Bagunça virou estrutura
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-purple-200 text-sm max-w-xs"
            >
              A I.A. tira a confusão da cabeça e entrega um roteiro organizado
            </motion.p>
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

export default CardEffectIdeaToScript;
