'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, TrendingUp, Users, Award, CheckCircle, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectAuthorityBuilder: React.FC<CardEffectProps> = ({ isActive = true }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneDuration = 3000;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= totalScenes - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, sceneDuration);
    return () => clearInterval(interval);
  }, [isActive]);

  const authorityPillars = [
    { icon: Users, label: 'Audiência', desc: 'Seguidores confiam' },
    { icon: Award, label: 'Expertise', desc: 'Conhecimento comprovado' },
    { icon: TrendingUp, label: 'Consistência', desc: 'Entrega constante' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 right-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Pilares da autoridade */}
          {currentScene <= 5 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-md"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute -inset-2 border-2 border-amber-400/30 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
                Construindo Autoridade
              </h2>

              <div className="w-full space-y-3">
                {authorityPillars.map((pillar, idx) => (
                  <motion.div
                    key={pillar.label}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: currentScene >= idx + 1 ? 1 : 0.3 
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.5 }}
                    className={`flex items-center gap-4 p-3 sm:p-4 rounded-xl ${
                      currentScene >= idx + 1
                        ? 'bg-amber-500/20 border border-amber-500/40'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="p-2.5 rounded-lg bg-amber-500/30">
                      <pillar.icon className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm sm:text-base">{pillar.label}</div>
                      <div className="text-amber-200/60 text-xs">{pillar.desc}</div>
                    </div>
                    {currentScene >= idx + 1 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Resultado */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg px-4"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="relative"
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/40">
                  <Crown className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
                </div>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-amber-400 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos(i * 45 * Math.PI / 180) * 80],
                      y: [0, Math.sin(i * 45 * Math.PI / 180) * 80],
                      opacity: [0, 1, 0],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                  />
                ))}
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Autoridade Real
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-amber-200/80 text-sm sm:text-base"
                >
                  Não nasce em um dia. É construída com profundidade e consistência ao longo do tempo.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 text-amber-400"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Conteúdo profundo é o caminho</span>
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
                idx === currentScene ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectAuthorityBuilder;
