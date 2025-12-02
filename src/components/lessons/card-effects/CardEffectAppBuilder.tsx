'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Smartphone, AppWindow } from 'lucide-react';

/**
 * CardEffectAppBuilder
 *
 * Animação cinematográfica: IA construindo um aplicativo
 *
 * Sequência de animação (2-3 segundos):
 * 1. Mockup de celular surge com fade-in suave
 * 2. Linhas de "código"/blocos de UI aparecem dentro da tela
 * 3. Ícone de IA pulsa emitindo faíscas
 * 4. Ícone de app pronto "encaixa" com scale-up e glow
 */
export const CardEffectAppBuilder: React.FC = () => {
  // Variantes para o container do celular
  const phoneVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  // Variantes para as linhas de código
  const codeLineVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: (i: number) => ({
      width: '100%',
      opacity: 1,
      transition: {
        delay: 0.5 + (i * 0.1),
        duration: 0.3,
        ease: 'easeOut'
      }
    })
  };

  // Variantes para o ícone de IA pulsando
  const aiIconVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.3, duration: 0.3 }
    },
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
      transition: {
        repeat: Infinity,
        duration: 0.8,
        ease: 'easeInOut'
      }
    }
  };

  // Variantes para as faíscas
  const sparkVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      x: [0, (i % 2 === 0 ? 15 : -15) * (i + 1) * 0.3],
      y: [0, -15 * (i + 1) * 0.3],
      transition: {
        delay: 0.4 + (i * 0.15),
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.8
      }
    })
  };

  // Variantes para o ícone do app final
  const appIconVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: 1.8,
        duration: 0.4,
        type: 'spring',
        stiffness: 200
      }
    }
  };

  // Glow effect para o app final
  const glowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.8, 0.4],
      scale: [1, 1.5, 1.2],
      transition: {
        delay: 1.9,
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  // Linhas de código com diferentes larguras
  const codeLines = [
    { width: '85%', bg: 'from-purple-400 to-blue-400' },
    { width: '60%', bg: 'from-blue-400 to-cyan-400' },
    { width: '75%', bg: 'from-cyan-400 to-purple-400' },
    { width: '50%', bg: 'from-purple-400 to-pink-400' },
    { width: '90%', bg: 'from-pink-400 to-blue-400' },
    { width: '45%', bg: 'from-blue-400 to-purple-400' },
  ];

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-xl">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Phone mockup */}
      <motion.div
        className="relative z-10"
        variants={phoneVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Phone frame */}
        <div className="relative w-36 h-64 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-1.5 shadow-2xl shadow-purple-500/20">
          {/* Phone inner bezel */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-gray-700 to-gray-800 opacity-50" />

          {/* Phone screen */}
          <div className="relative w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl overflow-hidden">
            {/* Screen notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl" />

            {/* Code lines container */}
            <div className="absolute inset-0 pt-8 px-3 space-y-2">
              {codeLines.map((line, i) => (
                <motion.div
                  key={i}
                  className="h-2 rounded-full overflow-hidden"
                  style={{ maxWidth: line.width }}
                  custom={i}
                  variants={codeLineVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className={`h-full w-full bg-gradient-to-r ${line.bg} opacity-70`} />
                </motion.div>
              ))}

              {/* UI Block elements */}
              <motion.div
                className="mt-4 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.3 }}
              >
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/40 to-blue-500/40" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-3/4 rounded bg-gray-600/50" />
                    <div className="h-2 w-1/2 rounded bg-gray-700/50" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/40 to-purple-500/40" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-2/3 rounded bg-gray-600/50" />
                    <div className="h-2 w-1/3 rounded bg-gray-700/50" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* AI Icon floating over screen */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              variants={aiIconVariants}
              initial="hidden"
              animate={["visible", "pulse"]}
            >
              <div className="relative">
                <Sparkles className="w-8 h-8 text-purple-400" />

                {/* Spark particles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400 rounded-full"
                    custom={i}
                    variants={sparkVariants}
                    initial="hidden"
                    animate="visible"
                  />
                ))}
              </div>
            </motion.div>

            {/* App icon appearing at end */}
            <motion.div
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
              variants={appIconVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur-md"
                  variants={glowVariants}
                  initial="hidden"
                  animate="visible"
                />

                {/* App icon */}
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AppWindow className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Phone glow/shadow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl -z-10"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      {/* Label */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-purple-300/70 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.4 }}
      >
        IA construindo seu app...
      </motion.div>
    </div>
  );
};

export default CardEffectAppBuilder;
