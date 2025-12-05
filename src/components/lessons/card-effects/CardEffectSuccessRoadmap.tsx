'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Flag, Rocket, Star, CheckCircle, Sparkles } from 'lucide-react';

interface CardEffectSuccessRoadmapProps {
  isActive?: boolean;
}

export const CardEffectSuccessRoadmap: React.FC<CardEffectSuccessRoadmapProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => { setScene(2); setActiveStep(1); }, 1500),
      setTimeout(() => setActiveStep(2), 2500),
      setTimeout(() => setActiveStep(3), 3500),
      setTimeout(() => setScene(3), 5000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-fuchsia-900/20 to-slate-900 border border-fuchsia-500/30">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-fuchsia-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <h3 className="text-base font-bold text-white mb-1">Mapa do Sucesso</h3>
          <p className="text-[10px] text-fuchsia-300">Comece agora</p>
        </motion.div>

        {/* Roadmap visual */}
        <div className="relative w-full max-w-xs">
          {/* Path connecting steps */}
          <svg className="absolute inset-0 w-full h-full" style={{ height: '140px' }}>
            <motion.path
              d="M 40 20 Q 100 20 100 50 Q 100 80 160 80 Q 220 80 220 110"
              fill="none"
              stroke="rgba(217, 70, 239, 0.2)"
              strokeWidth="3"
              strokeDasharray="8"
            />
            <motion.path
              d="M 40 20 Q 100 20 100 50 Q 100 80 160 80 Q 220 80 220 110"
              fill="none"
              stroke="#d946ef"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: activeStep / 3 }}
              transition={{ duration: 0.8 }}
            />
          </svg>

          {/* Steps */}
          <div className="relative" style={{ height: '140px' }}>
            {/* Step 1 */}
            <motion.div
              className="absolute left-4 top-2"
              animate={{
                scale: activeStep >= 1 ? 1 : 0.9,
                opacity: activeStep >= 1 ? 1 : 0.5,
              }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeStep >= 1 ? 'bg-fuchsia-500' : 'bg-slate-700'
              }`}>
                <Flag className="w-5 h-5 text-white" />
              </div>
              <p className="text-[9px] text-fuchsia-300 mt-1 text-center">Comece</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-12"
              animate={{
                scale: activeStep >= 2 ? 1 : 0.9,
                opacity: activeStep >= 2 ? 1 : 0.5,
              }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeStep >= 2 ? 'bg-fuchsia-500' : 'bg-slate-700'
              }`}>
                <Star className="w-5 h-5 text-white" />
              </div>
              <p className="text-[9px] text-fuchsia-300 mt-1 text-center">Pratique</p>
            </motion.div>

            {/* Step 3 - Final */}
            <motion.div
              className="absolute right-4 bottom-2"
              animate={{
                scale: activeStep >= 3 ? 1.1 : 0.9,
                opacity: activeStep >= 3 ? 1 : 0.5,
              }}
            >
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  activeStep >= 3 ? 'bg-gradient-to-br from-fuchsia-500 to-purple-500' : 'bg-slate-700'
                }`}
                animate={{
                  boxShadow: activeStep >= 3 ? '0 0 30px rgba(217, 70, 239, 0.6)' : 'none',
                }}
              >
                <Rocket className="w-6 h-6 text-white" />
              </motion.div>
              <p className="text-[9px] text-fuchsia-300 mt-1 text-center font-bold">Sucesso!</p>
            </motion.div>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-2 text-center"
            >
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-400/40 rounded-xl px-4 py-2"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(217, 70, 239, 0.2)',
                    '0 0 40px rgba(217, 70, 239, 0.4)',
                    '0 0 20px rgba(217, 70, 239, 0.2)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                <div>
                  <p className="text-sm font-bold text-white">HOJE MESMO!</p>
                  <p className="text-[9px] text-fuchsia-300">Seu primeiro passo define tudo</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#d946ef' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-3 right-3 flex items-center gap-1 bg-fuchsia-500/20 border border-fuchsia-400/30 rounded-full px-2 py-0.5"
      >
        <Map className="w-3 h-3 text-fuchsia-400" />
        <span className="text-[9px] text-fuchsia-300 font-medium">Roadmap</span>
      </motion.div>
    </div>
  );
};

export default CardEffectSuccessRoadmap;
