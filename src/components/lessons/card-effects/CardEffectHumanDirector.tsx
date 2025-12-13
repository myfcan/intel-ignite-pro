'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, ArrowRight, Crown, Handshake, Sparkles, Target, Zap } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 👑 HUMAN DIRECTOR
 * Aula: Introdução à I.A.
 * Conceito: Você é o diretor, a I.A. executa
 * Ajuste X2: 11 cenas (~33 segundos)
 */
export function CardEffectHumanDirector({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const tasks = [
    { human: "Define objetivos", ai: "Executa tarefas" },
    { human: "Avalia resultados", ai: "Processa dados" },
    { human: "Toma decisões", ai: "Sugere opções" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-yellow-950 to-orange-950 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(251, 191, 36, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.4) 0%, transparent 50%)',
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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Você é o <span className="text-amber-400">Diretor</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-amber-200 text-sm"
            >
              A I.A. é sua assistente, não sua substituta
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Humano aparece */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="human"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center border-2 border-amber-500/50"
                animate={{ 
                  boxShadow: ['0 0 0px #f59e0b', '0 0 40px #f59e0b', '0 0 0px #f59e0b']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <User className="w-12 h-12 text-amber-400" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30"
              >
                <span className="text-amber-300 text-sm font-bold flex items-center gap-1">
                  <Crown className="w-4 h-4" /> VOCÊ
                </span>
              </motion.div>
            </motion.div>
            
            {scene >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-3"
              >
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-amber-400" />
                </motion.div>
                <span className="text-amber-300 text-sm">Direciona</span>
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-amber-400" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Cenas 6-7: I.A. aparece */}
        {scene >= 6 && scene <= 7 && (
          <motion.div
            key="ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
                  <User className="w-8 h-8 text-amber-400" />
                </div>
                <span className="text-amber-300 text-xs mt-2 block">Você</span>
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Handshake className="w-8 h-8 text-white/60" />
              </motion.div>
              
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Bot className="w-8 h-8 text-cyan-400" />
                </motion.div>
                <span className="text-cyan-300 text-xs mt-2 block">I.A.</span>
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-white/70 text-sm text-center"
            >
              Parceria estratégica
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 8-9: Divisão de tarefas */}
        {scene >= 8 && scene <= 9 && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-bold text-white mb-4">Divisão Clara:</h3>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {tasks.map((pair, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-amber-300 text-xs">{pair.human}</span>
                  </div>
                  <Handshake className="w-4 h-4 text-white/40" />
                  <div className="flex-1 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <span className="text-cyan-300 text-xs">{pair.ai}</span>
                  </div>
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
                boxShadow: ['0 0 0px rgba(245, 158, 11, 0)', '0 0 50px rgba(245, 158, 11, 0.5)', '0 0 0px rgba(245, 158, 11, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-cyan-500/10 border border-amber-500/20 text-center max-w-sm"
            >
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Humano + I.A. = Superpoder</h3>
              <p className="text-amber-300 text-sm">
                Você dirige, a I.A. executa. Juntos, vocês são imbatíveis.
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
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-amber-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectHumanDirector;
