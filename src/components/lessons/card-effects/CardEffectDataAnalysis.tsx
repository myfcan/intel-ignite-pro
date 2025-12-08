'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Brain, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

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
 *
 * 🆕 MELHORIAS V5:
 * - isActive: animação só inicia quando card está em foco
 * - Durações 2-2.5x mais lentas para melhor experiência
 * - Loop contínuo enquanto ativo
 */
export const CardEffectDataAnalysis: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'animating'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('animating');

    // Durações mais lentas (2-2.5x)
    const LOOP_DELAY = 8000; // tempo total da animação antes de reiniciar

    // 🔄 Loop 2x: reiniciar animação apenas 2 vezes
    timersRef.current.push(setTimeout(() => {
      if (loopCount < 1) {
        setLoopCount(prev => prev + 1);
      }
    }, LOOP_DELAY));
  };

  // 🎯 Iniciar animação quando isActive mudar para true
  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      // Parar e resetar quando não estiver ativo
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase('waiting');
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]); // loopCount força reinício do loop
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

  // Se não estiver ativo, não animar
  const isAnimating = phase !== 'waiting';

  // Variantes para as barras (durações 2.5x mais lentas)
  const barVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: (i: number) => ({
      height: barData[i].height,
      opacity: 1,
      transition: {
        delay: 0.75 + (i * 0.25), // era 0.3 + (i * 0.1)
        duration: 1.0, // era 0.4
        ease: 'easeOut' as const
      }
    })
  };

  // Variantes para a linha de tendência (durações 2.5x mais lentas)
  const trendLineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 2.5, // era 1
        duration: 2.0, // era 0.8
        ease: 'easeInOut' as const
      }
    }
  };

  // Variantes para o ícone de IA (durações 2.5x mais lentas)
  const aiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 1.25, // era 0.5
        duration: 0.75, // era 0.3
        type: 'spring' as const
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2.5, // era 1
        repeat: Infinity
      }
    }
  };

  // Variantes para insights (durações 2.5x mais lentas)
  const insightVariants = {
    hidden: { opacity: 0, y: 10, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 3.75 + (i * 0.375), // era 1.5 + (i * 0.15)
        duration: 0.75, // era 0.3
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-xl">
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
            animate={isAnimating ? {
              y: [0, -20],
              opacity: [0.1, 0.3, 0.1],
            } : {
              opacity: 0
            }}
            transition={{
              duration: (2 + Math.random()) * 2.5, // 2.5x mais lento
              repeat: isAnimating ? Infinity : 0,
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
            animate={isAnimating ? "visible" : "hidden"}
            style={{ originY: 1 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
              initial={{ y: '100%' }}
              animate={isAnimating ? { y: '-100%' } : { y: '100%' }}
              transition={{
                delay: 1.25 + (i * 0.25), // era 0.5 + (i * 0.1), 2.5x mais lento
                duration: 1.5, // era 0.6, 2.5x mais lento
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
          animate={isAnimating ? "visible" : "hidden"}
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
          animate={isAnimating ? "visible" : "hidden"}
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
            animate={isAnimating ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{
              delay: 3.25 + (i * 0.2), // era 1.3 + (i * 0.08), 2.5x mais lento
              duration: 0.5, // era 0.2, 2.5x mais lento
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
        animate={isAnimating ? ["visible", "pulse"] : "hidden"}
      >
        <div className="relative">
          {/* Glow */}
          <motion.div
            className="absolute inset-0 bg-purple-400 rounded-full blur-md"
            animate={isAnimating ? {
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            } : {
              opacity: 0
            }}
            transition={{
              duration: 3.75, // era 1.5, 2.5x mais lento
              repeat: isAnimating ? Infinity : 0
            }}
          />

          {/* Icon container */}
          <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>

          {/* Scanning lines */}
          <motion.div
            className="absolute -left-16 top-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent to-purple-400"
            animate={isAnimating ? {
              opacity: [0, 1, 0],
              scaleX: [0, 1, 0],
            } : {
              opacity: 0
            }}
            transition={{
              duration: 3.75, // era 1.5, 2.5x mais lento
              repeat: isAnimating ? Infinity : 0,
              repeatDelay: 1.25 // era 0.5, 2.5x mais lento
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
              animate={isAnimating ? "visible" : "hidden"}
            >
              <Icon className={`w-3 h-3 ${insight.color}`} />
              <span className={`text-xs font-medium ${insight.color}`}>{insight.text}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom label */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-sm text-cyan-300/70 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={isAnimating ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
        transition={{ delay: isAnimating ? 5 : 0, duration: 1.0 }}
      >
        {isAnimating ? 'Analisando dados...' : 'Aguardando...'}
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              isAnimating && i <= Math.floor((loopCount + 1) * 2.5)
                ? 'bg-cyan-400'
                : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectDataAnalysis;
