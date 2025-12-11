'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Image, BookImage, Video, Sparkles, Star } from 'lucide-react';

interface CardEffectVisualIdentityProps {
  onComplete?: () => void;
}

export const CardEffectVisualIdentity = ({ onComplete }: CardEffectVisualIdentityProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneDuration = 3000;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= totalScenes - 1) {
          setTimeout(() => onComplete?.(), 500);
          return 0;
        }
        return prev + 1;
      });
    }, sceneDuration);
    return () => clearInterval(interval);
  }, [onComplete]);

  const visualAssets = [
    { icon: BookImage, label: 'Capas de livro', color: 'bg-pink-500/30' },
    { icon: Video, label: 'Thumbnails de vídeo', color: 'bg-rose-500/30' },
    { icon: Image, label: 'Slides e imagens', color: 'bg-fuchsia-500/30' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-pink-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-20 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Tipos de assets */}
          {currentScene <= 5 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-md w-full"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-3"
              >
                <Palette className="w-8 h-8 text-pink-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Cara do Seu Projeto
                </h2>
              </motion.div>

              <div className="w-full space-y-3">
                {visualAssets.map((asset, idx) => (
                  <motion.div
                    key={asset.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3,
                      scale: currentScene >= idx + 1 ? 1 : 0.95 
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className={`flex items-center gap-4 p-4 rounded-xl ${asset.color} border border-pink-500/30 ${
                      currentScene >= idx + 1 ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <asset.icon className="w-8 h-8 text-pink-300" />
                    <span className="text-white font-medium text-sm sm:text-base">{asset.label}</span>
                  </motion.div>
                ))}
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-pink-200/70 text-sm text-center"
                >
                  DALL·E, Midjourney, Canva com I.A.
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Identidade visual */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg"
            >
              <div className="relative">
                {/* Main canvas */}
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-32 h-40 sm:w-40 sm:h-52 rounded-lg bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600 shadow-2xl shadow-pink-500/30 flex items-center justify-center overflow-hidden"
                >
                  <div className="text-white/30 text-4xl font-bold">eBook</div>
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-3 -right-3"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-2 -left-2"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-pink-300" />
                </motion.div>
              </div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Identidade Visual
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-pink-200/80 text-sm sm:text-base"
                >
                  Capas e imagens que comunicam o valor do seu conteúdo antes mesmo de abrir
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 bg-pink-500/20 px-4 py-2 rounded-full border border-pink-500/30"
              >
                <Palette className="w-4 h-4 text-pink-400" />
                <span className="text-pink-300 text-sm font-medium">Sem depender de designer</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 mt-4">
          {Array.from({ length: totalScenes }).map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentScene ? 'w-6 bg-pink-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectVisualIdentity;
