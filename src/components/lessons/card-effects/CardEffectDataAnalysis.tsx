'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Brain, Sparkles } from 'lucide-react';

/**
 * CardEffectDataAnalysis
 *
 * Animação cinematográfica: IA analisando dados
 *
 * Sequência de animação (2-3 segundos):
 * 1. Barras de gráfico crescem do zero
 * 2. Linha de tendência aparece
 * 3. Ícone de IA/cérebro pulsa analisando
 * 4. Insights/sparkles aparecem indicando descobertas
 */
export const CardEffectDataAnalysis: React.FC = () => {
  // Dados do gráfico de barras
  const barData = [
    { height: 40, color: 'from-blue-400 to-blue-500' },
    { height: 65, color: 'from-cyan-400 to-cyan-500' },
    { height: 45, color: 'from-blue-400 to-blue-500' },
    { height: 80, color: 'from-purple-400 to-purple-500' },
    { height: 55, color: 'from-cyan-400 to-cyan-500' },
    { height: 90, color: 'from-pink-400 to-pink-500' },
    { height: 70, color: 'from-purple-400 to-purple-500' },
  ];

  // Variantes para as barras
  const barVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: (i: number) => ({
      height: barData[i].height,
      opacity: 1,
      transition: {
        delay: 0.3 + (i * 0.1),
        duration: 0.4,
        ease: 'easeOut' as const
      }
    })
  };

  // Variantes para a linha de tendência
  const trendLineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 1,
        duration: 0.8,
        ease: 'easeInOut' as const
      }
    }
  };

  // Variantes para o ícone de IA
  const aiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5,
        duration: 0.3,
        type: 'spring' as const
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity
      }
    }
  };

  // Variantes para insights
  const insightVariants = {
    hidden: { opacity: 0, y: 10, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 1.5 + (i * 0.15),
        duration: 0.3,
        type: 'spring' as const
      }
    })
  };

  // Pontos para a linha de tendência
  const trendPoints = barData.map((bar, i) => ({
    x: 20 + (i * 35),
    y: 100 - bar.height - 5
  }));

  const trendPath = `M${trendPoints.map(p => `${p.x},${p.y}`).join(' L')}`;

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-xl">
      {/* Data stream background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-400/10 text-xs font-mono"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {Math.random() > 0.5 ? '01' : '10'}
          </motion.div>
        ))}
      </div>

      {/* Chart container */}
      <div className="relative z-10 flex items-end gap-1 h-32">
        {barData.map((bar, i) => (
          <motion.div
            key={i}
            className={`w-6 bg-gradient-to-t ${bar.color} rounded-t-sm relative overflow-hidden`}
            custom={i}
            variants={barVariants}
            initial="hidden"
            animate="visible"
            style={{ originY: 1 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
              initial={{ y: '100%' }}
              animate={{ y: '-100%' }}
              transition={{
                delay: 0.5 + (i * 0.1),
                duration: 0.6,
                ease: 'easeOut'
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Trend line SVG overlay */}
      <svg
        className="absolute z-20 w-72 h-32"
        viewBox="0 0 260 100"
        style={{
          left: 'calc(50% - 144px)',
          top: 'calc(50% - 64px)',
        }}
      >
        {/* Trend line glow */}
        <motion.path
          d={trendPath}
          stroke="rgba(34, 211, 238, 0.4)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={trendLineVariants}
          initial="hidden"
          animate="visible"
          filter="blur(4px)"
        />

        {/* Trend line */}
        <motion.path
          d={trendPath}
          stroke="url(#trendGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={trendLineVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Data points */}
        {trendPoints.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#22d3ee"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 1.3 + (i * 0.08),
              duration: 0.2,
              type: 'spring'
            }}
          />
        ))}

        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      {/* AI Brain icon */}
      <motion.div
        className="absolute top-6 right-8"
        variants={aiVariants}
        initial="hidden"
        animate={["visible", "pulse"]}
      >
        <div className="relative">
          {/* Glow */}
          <motion.div
            className="absolute inset-0 bg-purple-400 rounded-full blur-md"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />

          {/* Icon container */}
          <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>

          {/* Scanning lines */}
          <motion.div
            className="absolute -left-16 top-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent to-purple-400"
            animate={{
              opacity: [0, 1, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          />
        </div>
      </motion.div>

      {/* Insight bubbles */}
      <div className="absolute top-4 left-8 space-y-2">
        {[
          { icon: TrendingUp, text: '+45%', color: 'text-green-400' },
          { icon: BarChart3, text: 'Peak', color: 'text-cyan-400' },
          { icon: Sparkles, text: 'Insight', color: 'text-purple-400' },
        ].map((insight, i) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={i}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded-lg border border-slate-700"
              custom={i}
              variants={insightVariants}
              initial="hidden"
              animate="visible"
            >
              <Icon className={`w-3 h-3 ${insight.color}`} />
              <span className={`text-xs font-medium ${insight.color}`}>{insight.text}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom label */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-cyan-300/70 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.4 }}
      >
        Analisando dados...
      </motion.div>
    </div>
  );
};

export default CardEffectDataAnalysis;
