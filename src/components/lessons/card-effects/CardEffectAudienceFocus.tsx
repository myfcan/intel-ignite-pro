'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users, User, Focus, CheckCircle, ArrowRight } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectAudienceFocus: React.FC<CardEffectProps> = ({ isActive = true, duration = 33 }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= totalScenes - 1) return prev;
        return prev + 1;
      });
    }, sceneTime);
    return () => clearInterval(interval);
  }, [isActive, sceneTime]);

  const audiences = [
    { label: 'Todo mundo', focused: false, opacity: 0.3 },
    { label: 'Empreendedores', focused: true, opacity: 0.6 },
    { label: 'Mães 40+', focused: true, opacity: 1 },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Filtro de público */}
          {currentScene <= 5 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-md w-full"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-3"
              >
                <Target className="w-8 h-8 text-teal-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Foco no Público Certo
                </h2>
              </motion.div>

              <div className="relative w-full h-48 flex items-center justify-center">
                {/* Circles representing audience targeting */}
                <motion.div
                  className="absolute w-48 h-48 rounded-full border-2 border-dashed border-white/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute w-36 h-36 rounded-full border-2 border-dashed border-teal-400/40"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                
                {/* Scattered users */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: currentScene >= 2 ? (i < 3 ? 1 : 0.3) : 0.3,
                      scale: currentScene >= 2 ? (i < 3 ? 1.2 : 0.8) : 1,
                    }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <User className={`w-5 h-5 ${i < 3 ? 'text-teal-400' : 'text-white/30'}`} />
                  </motion.div>
                ))}

                {/* Center target */}
                <motion.div
                  className="relative z-10 w-16 h-16 rounded-full bg-teal-500/30 flex items-center justify-center border-2 border-teal-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Focus className="w-8 h-8 text-teal-300" />
                </motion.div>
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-teal-200/70 text-sm text-center"
                >
                  Ensinar é guiar alguém específico
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Resultado */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg"
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(20, 184, 166, 0.3)',
                    '0 0 40px rgba(20, 184, 166, 0.5)',
                    '0 0 20px rgba(20, 184, 166, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center"
              >
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Para Quem é Isso?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-teal-200/80 text-sm sm:text-base"
                >
                  Definir seu público é o primeiro passo para criar conteúdo que realmente conecta
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <span className="text-white/60 text-sm line-through">Falar com todos</span>
                <ArrowRight className="w-4 h-4 text-teal-400" />
                <span className="text-teal-300 text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Guiar alguém específico
                </span>
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
                idx === currentScene ? 'w-6 bg-teal-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardEffectAudienceFocus;
