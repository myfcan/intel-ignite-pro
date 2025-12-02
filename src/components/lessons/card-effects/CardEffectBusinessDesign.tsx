'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Rocket, TrendingUp, CheckCircle } from 'lucide-react';

/**
 * CardEffectBusinessDesign
 *
 * Animação cinematográfica: IA desenhando/projetando um negócio
 *
 * Sequência de animação (2-3 segundos):
 * 1. Linha de progresso horizontal aparece
 * 2. Ícones de cada etapa surgem em sequência (ideia → meta → lançamento → crescimento)
 * 3. Linha vai se preenchendo conectando as etapas
 * 4. Check final mostrando projeto completo
 */
export const CardEffectBusinessDesign: React.FC = () => {
  // Etapas do negócio
  const stages = [
    { icon: Lightbulb, label: 'Ideia', color: 'from-yellow-400 to-orange-400' },
    { icon: Target, label: 'Meta', color: 'from-blue-400 to-cyan-400' },
    { icon: Rocket, label: 'Lançamento', color: 'from-purple-400 to-pink-400' },
    { icon: TrendingUp, label: 'Crescimento', color: 'from-green-400 to-emerald-400' },
  ];

  // Variantes para os ícones das etapas
  const stageIconVariants = {
    hidden: { opacity: 0, scale: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.3 + (i * 0.35),
        duration: 0.4,
        type: 'spring' as const,
        stiffness: 200
      }
    })
  };

  // Variantes para os labels
  const labelVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + (i * 0.35),
        duration: 0.3
      }
    })
  };

  // Variantes para a linha de progresso
  const lineProgressVariants = {
    hidden: { width: 0 },
    visible: {
      width: '100%',
      transition: {
        delay: 0.4,
        duration: 1.8,
        ease: 'easeInOut' as const
      }
    }
  };

  // Variantes para o check final
  const checkVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 2.2,
        duration: 0.3,
        type: 'spring' as const,
        stiffness: 200
      }
    }
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 rounded-xl">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-indigo-400/40 rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Main content container */}
      <div className="relative z-10 w-full px-8">
        {/* Progress track (background) */}
        <div className="absolute top-1/2 left-12 right-12 h-1 bg-slate-700 rounded-full transform -translate-y-1/2" />

        {/* Progress line (animated) */}
        <motion.div
          className="absolute top-1/2 left-12 h-1 bg-gradient-to-r from-yellow-400 via-blue-400 via-purple-400 to-green-400 rounded-full transform -translate-y-1/2"
          style={{ right: '48px' }}
          variants={lineProgressVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Stages */}
        <div className="flex justify-between items-center">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={i}
                className="relative flex flex-col items-center"
                custom={i}
              >
                {/* Icon container */}
                <motion.div
                  className="relative"
                  custom={i}
                  variants={stageIconVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${stage.color} rounded-full blur-md opacity-50`}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      delay: 0.5 + (i * 0.35),
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  />

                  {/* Icon circle */}
                  <div className={`relative w-12 h-12 bg-gradient-to-br ${stage.color} rounded-full flex items-center justify-center shadow-lg z-10`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Pulse ring */}
                  <motion.div
                    className={`absolute inset-0 rounded-full border-2 border-current`}
                    style={{ borderColor: i === 0 ? '#facc15' : i === 1 ? '#60a5fa' : i === 2 ? '#c084fc' : '#34d399' }}
                    animate={{
                      scale: [1, 1.5, 1.5],
                      opacity: [0.5, 0, 0],
                    }}
                    transition={{
                      delay: 0.6 + (i * 0.35),
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                </motion.div>

                {/* Label */}
                <motion.span
                  className="mt-3 text-xs text-slate-300 font-medium"
                  custom={i}
                  variants={labelVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {stage.label}
                </motion.span>
              </motion.div>
            );
          })}
        </div>

        {/* Check mark final */}
        <motion.div
          className="absolute -top-2 right-4"
          variants={checkVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-green-400 rounded-full blur-md"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                delay: 2.3,
                duration: 1,
                repeat: Infinity
              }}
            />
            <div className="relative w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom label */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-indigo-300/70 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.4 }}
      >
        Projetando seu negócio...
      </motion.div>
    </div>
  );
};

export default CardEffectBusinessDesign;
