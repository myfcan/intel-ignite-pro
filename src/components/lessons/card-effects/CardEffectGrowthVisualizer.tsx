'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, Award, Rocket, Target } from 'lucide-react';

interface CardEffectGrowthVisualizerProps {
  isActive?: boolean;
}

export const CardEffectGrowthVisualizer: React.FC<CardEffectGrowthVisualizerProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [growthStage, setGrowthStage] = useState(0);

  const stages = [
    { label: 'Iniciante', icon: Star, value: 'R$0', color: 'slate' },
    { label: 'Praticante', icon: Target, value: 'R$300', color: 'blue' },
    { label: 'Profissional', icon: Award, value: 'R$1.000+', color: 'purple' },
    { label: 'Expert', icon: Rocket, value: 'R$3.000+', color: 'gold' },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => { setScene(2); setGrowthStage(1); }, 1500),
      setTimeout(() => setGrowthStage(2), 2500),
      setTimeout(() => setGrowthStage(3), 3500),
      setTimeout(() => setGrowthStage(4), 4500),
      setTimeout(() => setScene(3), 5500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const getColors = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      slate: { bg: 'bg-slate-500/20', border: 'border-slate-400/40', text: 'text-slate-400' },
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-400/40', text: 'text-blue-400' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-400/40', text: 'text-purple-400' },
      gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/40', text: 'text-yellow-400' },
    };
    return colors[color];
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 border border-orange-500/30">
      {/* Background graph lines */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-orange-400"
            style={{ top: `${20 + i * 15}%` }}
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
          <h3 className="text-base font-bold text-white mb-1">Visualizador de Crescimento</h3>
          <p className="text-[10px] text-orange-300">De zero a profissional</p>
        </motion.div>

        {/* Gráfico de crescimento */}
        <div className="w-full max-w-xs h-20 relative mb-3">
          {/* Linha do gráfico */}
          <svg className="w-full h-full" viewBox="0 0 200 60">
            <motion.path
              d="M 10 55 Q 50 50 80 35 Q 120 15 160 10 L 190 5"
              fill="none"
              stroke="rgba(249, 115, 22, 0.3)"
              strokeWidth="2"
              strokeDasharray="4"
            />
            <motion.path
              d="M 10 55 Q 50 50 80 35 Q 120 15 160 10 L 190 5"
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: growthStage / 4 }}
              transition={{ duration: 0.8 }}
            />
            
            {/* Pontos do gráfico */}
            {stages.map((stage, index) => {
              const positions = [
                { x: 10, y: 55 },
                { x: 70, y: 40 },
                { x: 130, y: 20 },
                { x: 190, y: 5 },
              ];
              const isReached = growthStage > index;
              
              return (
                <motion.circle
                  key={index}
                  cx={positions[index].x}
                  cy={positions[index].y}
                  r={isReached ? 6 : 4}
                  fill={isReached ? '#f97316' : '#475569'}
                  initial={{ scale: 0 }}
                  animate={{ scale: isReached ? 1 : 0.8 }}
                  transition={{ delay: index * 0.2 }}
                />
              );
            })}
          </svg>
        </div>

        {/* Estágios */}
        <div className="grid grid-cols-4 gap-1 w-full max-w-xs">
          {stages.map((stage, index) => {
            const isReached = growthStage > index;
            const isCurrent = growthStage === index + 1;
            const colors = getColors(stage.color);
            const Icon = stage.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isCurrent ? 1.05 : 1,
                }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col items-center p-1.5 rounded-lg ${
                  isReached || isCurrent
                    ? `${colors.bg} border ${colors.border}`
                    : 'bg-slate-800/30 border border-slate-700/30'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${
                  isReached || isCurrent ? colors.text : 'text-slate-500'
                }`} />
                <span className={`text-[7px] font-medium ${
                  isReached || isCurrent ? colors.text : 'text-slate-500'
                }`}>
                  {stage.label}
                </span>
                <span className={`text-[8px] font-bold ${
                  isReached || isCurrent ? 'text-white' : 'text-slate-600'
                }`}>
                  {stage.value}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Mensagem final */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-lg px-3 py-1.5"
            >
              <Rocket className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-300 font-medium">
                Crescimento é inevitável!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-2">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#f97316' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-orange-500/20 border border-orange-400/30 rounded-full px-2 py-0.5"
      >
        <TrendingUp className="w-3 h-3 text-orange-400" />
        <span className="text-[9px] text-orange-300 font-medium">Growth</span>
      </motion.div>
    </div>
  );
};

export default CardEffectGrowthVisualizer;
