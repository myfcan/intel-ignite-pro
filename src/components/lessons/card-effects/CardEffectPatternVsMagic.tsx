'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Binary, Brain, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * ✨ PATTERN VS MAGIC
 * Aula: Introdução à I.A.
 * Conceito: I.A. não é mágica, é reconhecimento de padrões
 * Ajuste X2: 11 cenas (~33 segundos)
 */
export function CardEffectPatternVsMagic({ isActive = true, duration = 33 }: CardEffectProps) {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              <span className="text-pink-400">Magia</span> ou <span className="text-cyan-400">Padrões</span>?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-purple-200 text-sm"
            >
              Desmistificando a I.A.
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Magia (mito) */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="magic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              className="p-6 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center mb-4"
              animate={scene >= 4 ? { filter: 'blur(2px) grayscale(0.5)' } : {}}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Wand2 className="w-12 h-12 text-pink-400 mx-auto mb-3" />
              </motion.div>
              <h3 className="text-pink-400 font-bold text-lg mb-1">"Magia"</h3>
              <p className="text-pink-300/60 text-xs">Mito popular</p>
            </motion.div>
            
            {scene >= 5 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center"
              >
                <span className="text-red-400 text-3xl font-bold">✗</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Cenas 6-8: Padrões (realidade) */}
        {scene >= 6 && scene <= 8 && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div 
              className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center mb-4"
              animate={{ 
                boxShadow: ['0 0 0px #06b6d4', '0 0 30px #06b6d4', '0 0 0px #06b6d4']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Binary className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-cyan-400 font-bold text-lg mb-1">Padrões</h3>
              <p className="text-cyan-300/60 text-xs">Realidade científica</p>
            </motion.div>

            {scene >= 7 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
            )}
            
            {scene >= 8 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-cyan-300 text-sm text-center"
              >
                I.A. encontra padrões em dados
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Cena 9: Comparação visual */}
        {scene === 9 && (
          <motion.div
            key="compare"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="flex items-center gap-6">
              <div className="text-center opacity-40">
                <Wand2 className="w-10 h-10 text-pink-400 mx-auto mb-2" />
                <span className="text-pink-300 text-xs">Magia</span>
              </div>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-8 h-8 text-white/60" />
              </motion.div>
              
              <div className="text-center">
                <motion.div
                  animate={{ 
                    boxShadow: ['0 0 0px #06b6d4', '0 0 20px #06b6d4', '0 0 0px #06b6d4']
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-2"
                >
                  <Binary className="w-7 h-7 text-cyan-400" />
                </motion.div>
                <span className="text-cyan-300 text-xs">Padrões</span>
              </div>
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
                boxShadow: ['0 0 0px rgba(6, 182, 212, 0)', '0 0 50px rgba(6, 182, 212, 0.5)', '0 0 0px rgba(6, 182, 212, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center max-w-sm"
            >
              <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">I.A. reconhece padrões em dados</h3>
              <p className="text-cyan-300 text-sm">
                Não é mágica - é matemática e estatística avançada
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

export default CardEffectPatternVsMagic;
