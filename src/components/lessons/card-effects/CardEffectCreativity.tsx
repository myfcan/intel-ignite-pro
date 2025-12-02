'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Palette, Sparkles, Wand2, Star } from 'lucide-react';

/**
 * CardEffectCreativity
 *
 * Animação cinematográfica: IA gerando ideias criativas
 *
 * Sequência de animação (2-3 segundos):
 * 1. Lâmpada central aparece e acende
 * 2. Raios de luz/ideias emanam
 * 3. Bolhas de cores surgem representando criatividade
 * 4. Estrelas/sparkles celebram as ideias
 */
export const CardEffectCreativity: React.FC = () => {
  // Cores criativas
  const creativeColors = [
    '#f472b6', // pink
    '#a78bfa', // purple
    '#60a5fa', // blue
    '#34d399', // green
    '#fbbf24', // yellow
    '#fb7185', // rose
  ];

  // Variantes para a lâmpada
  const bulbVariants = {
    hidden: { opacity: 0, scale: 0, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: 'spring' as const,
        stiffness: 150
      }
    }
  };

  // Variantes para o brilho
  const glowVariants = {
    off: { opacity: 0, scale: 0.5 },
    on: {
      opacity: [0, 1, 0.8],
      scale: [0.5, 1.5, 1.3],
      transition: {
        delay: 0.4,
        duration: 0.6,
        ease: 'easeOut' as const
      }
    },
    pulse: {
      opacity: [0.8, 1, 0.8],
      scale: [1.3, 1.5, 1.3],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  // Variantes para as bolhas de ideia
  const bubbleVariants = {
    hidden: { opacity: 0, scale: 0, y: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0.8],
      scale: [0, 1, 0.9],
      y: -30 - (i * 10),
      x: (i % 2 === 0 ? 1 : -1) * (20 + i * 8),
      transition: {
        delay: 0.8 + (i * 0.15),
        duration: 0.5,
        ease: 'easeOut' as const
      }
    }),
    float: (i: number) => ({
      y: [-30 - (i * 10), -40 - (i * 10), -30 - (i * 10)],
      transition: {
        delay: 1.3 + (i * 0.1),
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    })
  };

  // Variantes para raios de luz
  const rayVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: (i: number) => ({
      scaleY: 1,
      opacity: [0, 0.8, 0.6],
      transition: {
        delay: 0.5 + (i * 0.08),
        duration: 0.4,
        ease: 'easeOut' as const
      }
    })
  };

  // Variantes para estrelas
  const starVariants = {
    hidden: { opacity: 0, scale: 0, rotate: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      rotate: 360,
      transition: {
        delay: 1.5 + (i * 0.1),
        duration: 0.4,
        type: 'spring' as const
      }
    }),
    twinkle: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  };

  // Posições das estrelas
  const starPositions = [
    { x: -60, y: -50 },
    { x: 60, y: -40 },
    { x: -40, y: 30 },
    { x: 70, y: 20 },
    { x: 0, y: -70 },
  ];

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-fuchsia-900/20 to-slate-900 rounded-xl">
      {/* Sparkle background */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: creativeColors[i % creativeColors.length],
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Light rays emanating from center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-24 w-1 bg-gradient-to-t from-yellow-400/60 via-yellow-300/30 to-transparent"
            style={{
              transformOrigin: 'bottom center',
              rotate: `${i * 45}deg`,
            }}
            custom={i}
            variants={rayVariants}
            initial="hidden"
            animate="visible"
          />
        ))}
      </div>

      {/* Main lightbulb */}
      <motion.div
        className="relative z-10"
        variants={bulbVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl"
          variants={glowVariants}
          initial="off"
          animate={["on", "pulse"]}
        />

        {/* Lightbulb container */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          >
            <Lightbulb className="w-10 h-10 text-yellow-900" />
          </motion.div>

          {/* Inner glow */}
          <motion.div
            className="absolute inset-2 bg-white rounded-full opacity-30"
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
        </div>

        {/* Idea bubbles */}
        {creativeColors.slice(0, 4).map((color, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
            custom={i}
            variants={bubbleVariants}
            initial="hidden"
            animate={["visible", "float"]}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: color }}
            >
              {i === 0 && <Palette className="w-4 h-4 text-white" />}
              {i === 1 && <Wand2 className="w-4 h-4 text-white" />}
              {i === 2 && <Sparkles className="w-4 h-4 text-white" />}
              {i === 3 && <Star className="w-4 h-4 text-white" />}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating stars */}
      {starPositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `calc(50% + ${pos.x}px)`,
            top: `calc(50% + ${pos.y}px)`,
          }}
          custom={i}
          variants={starVariants}
          initial="hidden"
          animate={["visible", "twinkle"]}
        >
          <Star
            className="w-4 h-4"
            style={{ color: creativeColors[i % creativeColors.length] }}
            fill="currentColor"
          />
        </motion.div>
      ))}

      {/* Bottom label */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-yellow-300/70 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.4 }}
      >
        Gerando ideias criativas...
      </motion.div>
    </div>
  );
};

export default CardEffectCreativity;
