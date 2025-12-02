'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageCircle, CheckCircle2, Zap } from 'lucide-react';

/**
 * CardEffectDigitalEmployee
 *
 * Animação cinematográfica: Funcionário Digital IA trabalhando
 *
 * Sequência de animação (2-3 segundos):
 * 1. Avatar do robô/assistente aparece com bounce
 * 2. Balões de chat surgem representando tarefas sendo executadas
 * 3. Checkmarks aparecem confirmando tarefas completadas
 * 4. Pulso de energia mostrando produtividade contínua
 */
export const CardEffectDigitalEmployee: React.FC = () => {
  // Variantes para o robô
  const robotVariants = {
    hidden: { opacity: 0, scale: 0, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 15,
        duration: 0.5
      }
    },
    working: {
      y: [0, -3, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  // Variantes para os olhos do robô
  const eyeVariants = {
    blink: {
      scaleY: [1, 0.1, 1],
      transition: {
        duration: 0.2,
        repeat: Infinity,
        repeatDelay: 2.5
      }
    }
  };

  // Variantes para as mensagens de chat
  const messageVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        delay: 0.6 + (i * 0.3),
        duration: 0.3,
        type: 'spring' as const,
        stiffness: 150
      }
    }),
    exit: (i: number) => ({
      opacity: 0,
      x: 20,
      transition: {
        delay: 1.5 + (i * 0.2),
        duration: 0.2
      }
    })
  };

  // Variantes para os checkmarks
  const checkVariants = {
    hidden: { opacity: 0, scale: 0, pathLength: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 1.0 + (i * 0.3),
        duration: 0.3,
        type: 'spring' as const,
        stiffness: 200
      }
    })
  };

  // Variantes para pulsos de energia
  const energyPulseVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: [0, 0.6, 0],
      scale: [0.5, 1.5, 2],
      transition: {
        delay: 0.8,
        duration: 1.2,
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  };

  // Tarefas simuladas
  const tasks = [
    { text: 'Respondendo emails...', color: 'from-blue-400 to-cyan-400' },
    { text: 'Agendando reunião...', color: 'from-purple-400 to-pink-400' },
    { text: 'Gerando relatório...', color: 'from-green-400 to-emerald-400' },
  ];

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-xl">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* Energy pulses */}
      <motion.div
        className="absolute w-32 h-32 rounded-full border-2 border-cyan-400/50"
        variants={energyPulseVariants}
        initial="hidden"
        animate="visible"
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full border-2 border-blue-400/50"
        variants={energyPulseVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.2 }}
      />

      {/* Robot avatar */}
      <motion.div
        className="relative z-10"
        variants={robotVariants}
        initial="hidden"
        animate={["visible", "working"]}
      >
        <div className="relative">
          {/* Robot head */}
          <div className="w-20 h-20 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center relative overflow-hidden">
            {/* Metallic sheen */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'easeInOut'
              }}
            />

            {/* Robot face */}
            <div className="flex gap-2">
              {/* Eyes */}
              <motion.div
                className="w-4 h-5 bg-white rounded-full shadow-inner"
                variants={eyeVariants}
                animate="blink"
              >
                <motion.div
                  className="w-2 h-2 bg-slate-800 rounded-full mt-1.5 ml-1"
                  animate={{
                    x: [0, 1, 0, -1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              </motion.div>
              <motion.div
                className="w-4 h-5 bg-white rounded-full shadow-inner"
                variants={eyeVariants}
                animate="blink"
              >
                <motion.div
                  className="w-2 h-2 bg-slate-800 rounded-full mt-1.5 ml-1"
                  animate={{
                    x: [0, 1, 0, -1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              </motion.div>
            </div>

            {/* Antenna */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-3 bg-gray-400" />
              <motion.div
                className="w-3 h-3 bg-cyan-400 rounded-full -mt-1 -ml-1"
                animate={{
                  boxShadow: [
                    '0 0 5px rgba(34, 211, 238, 0.5)',
                    '0 0 15px rgba(34, 211, 238, 0.8)',
                    '0 0 5px rgba(34, 211, 238, 0.5)',
                  ]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
              />
            </div>
          </div>

          {/* Robot body hint */}
          <div className="w-16 h-6 bg-gradient-to-b from-blue-600 to-blue-700 mx-auto rounded-b-lg -mt-1" />
        </div>
      </motion.div>

      {/* Task messages */}
      <div className="absolute right-8 top-8 space-y-2">
        {tasks.map((task, i) => (
          <motion.div
            key={i}
            className="relative flex items-center gap-2"
            custom={i}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Message bubble */}
            <div className={`px-3 py-1.5 bg-gradient-to-r ${task.color} rounded-lg text-xs text-white font-medium shadow-lg`}>
              <motion.span
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  delay: 0.8 + (i * 0.3),
                  duration: 0.8,
                  repeat: Infinity
                }}
              >
                {task.text}
              </motion.span>
            </div>

            {/* Checkmark */}
            <motion.div
              custom={i}
              variants={checkVariants}
              initial="hidden"
              animate="visible"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Floating icons representing work */}
      <motion.div
        className="absolute left-8 top-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: [0, 1, 0],
          y: [10, -10, -30],
        }}
        transition={{
          delay: 1.2,
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5
        }}
      >
        <MessageCircle className="w-5 h-5 text-blue-400" />
      </motion.div>

      <motion.div
        className="absolute left-12 bottom-16"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: [0, 1, 0],
          y: [10, -15, -35],
        }}
        transition={{
          delay: 1.5,
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5
        }}
      >
        <Zap className="w-4 h-4 text-yellow-400" />
      </motion.div>

      {/* Working indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
        <span className="text-sm text-cyan-300/70 font-medium">
          Trabalhando...
        </span>
      </motion.div>
    </div>
  );
};

export default CardEffectDigitalEmployee;
