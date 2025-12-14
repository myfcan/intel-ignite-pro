'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User, Mic, Eye, Smile, MessageCircle, Sparkles, Users } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 💕 VIDEO CONNECTION
 * Aula: Vídeos simples com I.A.
 * Conceito: Rostos, voz e expressão criando conexão
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectVideoConnection({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const connectionElements = [
    { icon: Eye, label: 'Olhar', desc: 'Você vê o rosto' },
    { icon: Mic, label: 'Voz', desc: 'Escuta o tom' },
    { icon: Smile, label: 'Expressão', desc: 'Sente a energia' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-rose-950 via-pink-950 to-purple-950 p-4 sm:p-6 flex flex-col">
      
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)',
            'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.4) 0%, transparent 60%)',
            'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Introdução */}
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
              className="relative"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-2xl"
              >
                <Heart className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl sm:text-3xl font-bold text-white mt-6 mb-3"
            >
              Conexão de <span className="text-pink-400">verdade</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-rose-200 text-sm"
            >
              Rosto, voz e expressão em destaque
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Elementos de conexão */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="elements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {connectionElements.map((elem, idx) => {
                const Icon = elem.icon;
                const isActive = scene >= 3 + idx;
                return (
                  <motion.div
                    key={elem.label}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.3, 
                      x: isActive ? 0 : -50,
                      scale: scene === 3 + idx ? 1.05 : 1
                    }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-pink-500/10 border border-pink-500/20"
                  >
                    <motion.div
                      animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center"
                    >
                      <Icon className="w-6 h-6 text-pink-400" />
                    </motion.div>
                    <div>
                      <div className="text-white font-semibold">{elem.label}</div>
                      <div className="text-pink-300 text-sm">{elem.desc}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 6-8: Rostos em close */}
        {scene >= 6 && scene <= 8 && (
          <motion.div
            key="faces"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ 
                      borderColor: ['rgba(236, 72, 153, 0.3)', 'rgba(236, 72, 153, 0.8)', 'rgba(236, 72, 153, 0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-2 flex items-center justify-center"
                  >
                    <User className="w-7 h-7 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <Smile className="w-3 h-3 text-white" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-pink-200 text-center text-sm"
            >
              Rostos humanos geram confiança instantânea
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
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center opacity-10"
            >
              <div className="w-64 h-64 border-2 border-dashed border-pink-400 rounded-full" />
            </motion.div>
            
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-3 mb-6"
            >
              <Users className="w-10 h-10 text-pink-400" />
              <MessageCircle className="w-8 h-8 text-rose-400" />
              <Sparkles className="w-10 h-10 text-purple-400" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Proximidade e confiança
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-rose-200 text-sm max-w-xs"
            >
              O vídeo cria a sensação de estar junto, mesmo à distância
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-pink-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectVideoConnection;
