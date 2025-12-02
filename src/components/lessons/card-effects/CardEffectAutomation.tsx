'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cog, Zap, ArrowRight, CircleDot } from 'lucide-react';

/**
 * CardEffectAutomation
 *
 * Animação cinematográfica: Automação/fluxo de processos
 *
 * Sequência de animação (2-3 segundos):
 * 1. Nós aparecem em posições fixas
 * 2. Linhas conectoras surgem entre os nós
 * 3. Pulso de energia percorre as conexões
 * 4. Engrenagens giram mostrando automação ativa
 */
export const CardEffectAutomation: React.FC = () => {
  // Posições dos nós
  const nodes = [
    { x: 40, y: 50, icon: CircleDot, color: 'from-blue-400 to-cyan-500', label: 'Input' },
    { x: 130, y: 30, icon: Cog, color: 'from-purple-400 to-indigo-500', label: 'Process' },
    { x: 130, y: 70, icon: Cog, color: 'from-pink-400 to-rose-500', label: 'Process' },
    { x: 220, y: 50, icon: Zap, color: 'from-yellow-400 to-orange-500', label: 'Output' },
  ];

  // Conexões entre nós (índices)
  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
  ];

  // Variantes para os nós
  const nodeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2 + (i * 0.15),
        duration: 0.3,
        type: 'spring' as const,
        stiffness: 200
      }
    })
  };

  // Variantes para as linhas
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 0.5 + (i * 0.1),
        duration: 0.4,
        ease: 'easeInOut' as const
      }
    })
  };

  // Calcular posição do nó (escalado)
  const getNodePos = (index: number) => {
    const node = nodes[index];
    return { x: node.x, y: node.y };
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-xl">
      {/* Circuit board background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="circuit" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M10 0v10h10M0 10h10v10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
          </pattern>
          <rect width="100" height="100" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Main SVG canvas */}
      <svg
        className="relative z-10 w-72 h-32"
        viewBox="0 0 260 100"
      >
        {/* Connection lines */}
        {connections.map((conn, i) => {
          const from = getNodePos(conn.from);
          const to = getNodePos(conn.to);

          return (
            <g key={i}>
              {/* Background line */}
              <motion.path
                d={`M${from.x},${from.y} L${to.x},${to.y}`}
                stroke="rgba(139, 92, 246, 0.2)"
                strokeWidth="3"
                fill="none"
                custom={i}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
              />

              {/* Animated line */}
              <motion.path
                d={`M${from.x},${from.y} L${to.x},${to.y}`}
                stroke="url(#lineGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                custom={i}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
              />

              {/* Energy pulse */}
              <motion.circle
                r="4"
                fill="#a855f7"
                filter="url(#glow)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  offsetDistance: ['0%', '100%'],
                }}
                transition={{
                  delay: 1 + (i * 0.2),
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                style={{
                  offsetPath: `path('M${from.x},${from.y} L${to.x},${to.y}')`,
                }}
              />
            </g>
          );
        })}

        {/* Gradient and filter definitions */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Nodes overlay (positioned absolutely) */}
      <div className="absolute inset-0 z-20">
        {nodes.map((node, i) => {
          const Icon = node.icon;
          const isGear = node.icon === Cog;

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `calc(50% - 144px + ${node.x}px - 16px)`,
                top: `calc(50% - 64px + ${node.y}px - 16px)`,
              }}
              custom={i}
              variants={nodeVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="relative">
                {/* Glow */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${node.color} rounded-full blur-md opacity-50`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    delay: 0.5 + (i * 0.15),
                    duration: 1.5,
                    repeat: Infinity
                  }}
                />

                {/* Node circle */}
                <motion.div
                  className={`relative w-8 h-8 bg-gradient-to-br ${node.color} rounded-full flex items-center justify-center shadow-lg`}
                  animate={isGear ? { rotate: 360 } : {}}
                  transition={isGear ? { duration: 4, repeat: Infinity, ease: 'linear' } : {}}
                >
                  <Icon className="w-4 h-4 text-white" />
                </motion.div>

                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-400"
                  animate={{
                    scale: [1, 1.8, 1.8],
                    opacity: [0.5, 0, 0],
                  }}
                  transition={{
                    delay: 0.8 + (i * 0.2),
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 0.8
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Flow arrows */}
      <motion.div
        className="absolute left-8 top-1/2 transform -translate-y-1/2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <ArrowRight className="w-5 h-5 text-cyan-400" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute right-8 top-1/2 transform -translate-y-1/2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <ArrowRight className="w-5 h-5 text-yellow-400" />
        </motion.div>
      </motion.div>

      {/* Bottom label */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-purple-300/70 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.4 }}
      >
        Automatizando processos...
      </motion.div>
    </div>
  );
};

export default CardEffectAutomation;
