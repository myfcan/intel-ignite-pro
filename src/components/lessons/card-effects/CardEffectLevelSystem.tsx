'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Globe, Crown, Star, Zap, ArrowUp } from 'lucide-react';

interface CardEffectLevelSystemProps {
  isActive?: boolean;
}

export const CardEffectLevelSystem: React.FC<CardEffectLevelSystemProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [activeLevel, setActiveLevel] = useState(0);

  const levels = [
    { level: 1, title: 'Círculo Próximo', icon: Users, value: 'Grátis - R$100', color: 'green' },
    { level: 2, title: 'Serviços Online', icon: Globe, value: '~R$100/serviço', color: 'blue' },
    { level: 3, title: 'Seu Sistema', icon: Crown, value: 'R$300-500/mês', color: 'purple' },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => { setScene(2); setActiveLevel(1); }, 1500),
      setTimeout(() => setActiveLevel(2), 3000),
      setTimeout(() => setActiveLevel(3), 4500),
      setTimeout(() => setScene(3), 6000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const getColor = (color: string, type: 'bg' | 'border' | 'text') => {
    const colors: Record<string, Record<string, string>> = {
      green: { bg: 'bg-emerald-500/20', border: 'border-emerald-400/40', text: 'text-emerald-400' },
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-400/40', text: 'text-blue-400' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-400/40', text: 'text-purple-400' },
    };
    return colors[color][type];
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900 border border-indigo-500/30">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent" />

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <h3 className="text-base font-bold text-white mb-1">Sistema de Níveis</h3>
          <p className="text-[10px] text-indigo-300">Evolua passo a passo</p>
        </motion.div>

        {/* Escada de níveis */}
        <div className="flex flex-col-reverse gap-2 w-full max-w-xs">
          {levels.map((lvl, index) => {
            const isActive = activeLevel >= lvl.level;
            const isCurrent = activeLevel === lvl.level;
            const Icon = lvl.icon;
            
            return (
              <motion.div
                key={lvl.level}
                initial={{ opacity: 0, x: -30 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  marginLeft: `${(3 - lvl.level) * 12}px`
                }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <motion.div
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    isActive 
                      ? `${getColor(lvl.color, 'bg')} ${getColor(lvl.color, 'border')}` 
                      : 'bg-slate-800/30 border-slate-700/30'
                  }`}
                  animate={{
                    scale: isCurrent ? 1.02 : 1,
                    boxShadow: isCurrent ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? getColor(lvl.color, 'bg') : 'bg-slate-700/30'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? getColor(lvl.color, 'text') : 'text-slate-500'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        Nível {lvl.level}
                      </span>
                      {isCurrent && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[8px] bg-yellow-500/30 text-yellow-300 px-1 rounded"
                        >
                          ATUAL
                        </motion.span>
                      )}
                    </div>
                    <p className={`text-[9px] ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                      {lvl.title}
                    </p>
                  </div>

                  <div className={`text-[9px] font-medium ${isActive ? getColor(lvl.color, 'text') : 'text-slate-600'}`}>
                    {lvl.value}
                  </div>

                  {/* Indicador de progresso */}
                  {isActive && !isCurrent && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Linha conectora */}
                {lvl.level < 3 && (
                  <motion.div
                    className={`absolute -top-2 left-4 w-0.5 h-2 ${
                      activeLevel > lvl.level ? 'bg-indigo-400' : 'bg-slate-700'
                    }`}
                    animate={{
                      backgroundColor: activeLevel > lvl.level ? '#818cf8' : '#334155'
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mensagem motivacional */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-lg px-3 py-2">
                <ArrowUp className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-indigo-300 font-medium">
                  Suba de nível com consistência!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#6366f1' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-2 py-0.5"
      >
        <TrendingUp className="w-3 h-3 text-indigo-400" />
        <span className="text-[9px] text-indigo-300 font-medium">Evolução</span>
      </motion.div>
    </div>
  );
};

export default CardEffectLevelSystem;
