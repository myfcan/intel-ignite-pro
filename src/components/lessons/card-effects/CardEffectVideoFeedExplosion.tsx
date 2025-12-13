'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Video, Film, Smartphone, TrendingUp, Eye, Users, Zap } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🎬 VIDEO FEED EXPLOSION
 * Aula: Vídeos simples com I.A.
 * Conceito: Feed de celular vazio que vai ganhando stories, Reels e vídeos
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectVideoFeedExplosion({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const videoTypes = [
    { icon: Play, label: 'Stories', color: '#f59e0b' },
    { icon: Film, label: 'Reels', color: '#ec4899' },
    { icon: Video, label: 'Shorts', color: '#ef4444' },
    { icon: TrendingUp, label: 'Lives', color: '#8b5cf6' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{ 
          background: [
            'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Título e celular vazio */}
        {scene <= 2 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Smartphone className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              O feed em <span className="text-pink-400">movimento</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-purple-200 text-sm max-w-xs"
            >
              De posts estáticos para vídeos o tempo todo
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Vídeos surgindo no feed */}
        {scene >= 3 && scene <= 6 && (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="relative w-48 h-80 bg-slate-800 rounded-3xl border-4 border-slate-700 overflow-hidden shadow-2xl">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-900 rounded-b-xl z-10" />
              
              {/* Feed de vídeos */}
              <div className="absolute inset-2 top-8 flex flex-col gap-2 overflow-hidden">
                {videoTypes.map((type, idx) => {
                  const shouldShow = scene >= 3 + idx * 0.5;
                  const Icon = type.icon;
                  return (
                    <motion.div
                      key={type.label}
                      initial={{ opacity: 0, x: 100, scale: 0.8 }}
                      animate={{ 
                        opacity: shouldShow ? 1 : 0, 
                        x: shouldShow ? 0 : 100,
                        scale: shouldShow ? 1 : 0.8
                      }}
                      transition={{ delay: idx * 0.15, type: 'spring', stiffness: 200 }}
                      className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ backgroundColor: `${type.color}20` }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${type.color}40` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: type.color }} />
                      </div>
                      <span className="text-white text-xs font-medium">{type.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-purple-200 text-sm text-center"
            >
              Vídeos dominam cada plataforma
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 7-8: Estatísticas de crescimento */}
        {scene >= 7 && scene <= 8 && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-4"
            >
              <div className="text-center">
                <Eye className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">10x</div>
                <div className="text-purple-300 text-xs">mais atenção</div>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">5x</div>
                <div className="text-purple-300 text-xs">mais engajamento</div>
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-pink-300 text-sm text-center mt-4"
            >
              Vídeo é o formato que mais cresce
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 9-10: Destaque no criador */}
        {scene >= 9 && (
          <motion.div
            key="creator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(168, 85, 247, 0)', '0 0 60px rgba(168, 85, 247, 0.6)', '0 0 0px rgba(168, 85, 247, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6"
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2 text-center"
            >
              Quem aparece, é lembrado
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-purple-200 text-sm text-center max-w-xs"
            >
              Um criador com clareza se destaca no mar de vídeos
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

export default CardEffectVideoFeedExplosion;
