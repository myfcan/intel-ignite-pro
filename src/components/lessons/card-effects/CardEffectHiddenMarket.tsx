'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, DollarSign, Users, Store, Coffee, GraduationCap, Building } from 'lucide-react';

interface CardEffectHiddenMarketProps {
  isActive?: boolean;
}

export const CardEffectHiddenMarket: React.FC<CardEffectHiddenMarketProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [revealedOpportunities, setRevealedOpportunities] = useState<number[]>([]);

  const opportunities = [
    { icon: Store, label: 'Padaria', need: 'Posts para redes' },
    { icon: GraduationCap, label: 'Professor', need: 'Organizar aulas' },
    { icon: Building, label: 'Síndico', need: 'Comunicados' },
    { icon: Coffee, label: 'Café', need: 'Cardápio semanal' },
    { icon: Users, label: 'Família', need: 'Planejamento' },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => setScene(2), 1500),
      setTimeout(() => setRevealedOpportunities([0]), 2500),
      setTimeout(() => setRevealedOpportunities([0, 1]), 3200),
      setTimeout(() => setRevealedOpportunities([0, 1, 2]), 3900),
      setTimeout(() => setRevealedOpportunities([0, 1, 2, 3]), 4600),
      setTimeout(() => setRevealedOpportunities([0, 1, 2, 3, 4]), 5300),
      setTimeout(() => setScene(3), 6500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-purple-500/30">
      {/* Grid de fundo invisível */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <h3 className="text-base font-bold text-white mb-1">Mercado Oculto</h3>
          <p className="text-[10px] text-purple-300">Oportunidades que ninguém vê</p>
        </motion.div>

        {/* Olho que muda */}
        <motion.div
          className="mb-3"
          animate={{
            scale: scene === 2 ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center"
              animate={{
                boxShadow: scene >= 2 
                  ? '0 0 30px rgba(168, 85, 247, 0.6)' 
                  : '0 0 10px rgba(168, 85, 247, 0.2)'
              }}
            >
              <AnimatePresence mode="wait">
                {scene === 1 ? (
                  <motion.div
                    key="closed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EyeOff className="w-6 h-6 text-purple-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Eye className="w-6 h-6 text-purple-300" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Raios de luz */}
            {scene >= 2 && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-6 h-0.5 bg-gradient-to-r from-purple-400 to-transparent origin-left"
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Grid de oportunidades */}
        <div className="grid grid-cols-5 gap-1.5 w-full max-w-xs">
          {opportunities.map((opp, index) => {
            const isRevealed = revealedOpportunities.includes(index);
            const Icon = opp.icon;
            
            return (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all duration-500 ${
                    isRevealed 
                      ? 'bg-purple-500/30 border border-purple-400/50' 
                      : 'bg-slate-800/50 border border-slate-700/50'
                  }`}
                  animate={{
                    boxShadow: isRevealed 
                      ? '0 0 15px rgba(168, 85, 247, 0.4)' 
                      : 'none'
                  }}
                >
                  <motion.div
                    animate={{
                      opacity: isRevealed ? 1 : 0.3,
                      scale: isRevealed ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`w-4 h-4 ${isRevealed ? 'text-purple-300' : 'text-slate-600'}`} />
                  </motion.div>
                  <motion.span
                    className="text-[6px] mt-0.5 text-center"
                    animate={{
                      opacity: isRevealed ? 1 : 0,
                      color: isRevealed ? '#c4b5fd' : '#475569'
                    }}
                  >
                    {opp.label}
                  </motion.span>
                </motion.div>

                {/* Tooltip de necessidade */}
                <AnimatePresence>
                  {isRevealed && scene >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <span className="text-[5px] text-emerald-400 bg-emerald-500/20 px-1 py-0.5 rounded">
                        {opp.need}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Mensagem de conclusão */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-lg px-3 py-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-medium">
                  5 oportunidades reveladas!
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
                backgroundColor: scene >= s ? '#a855f7' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-purple-500/20 border border-purple-400/30 rounded-full px-2 py-0.5"
      >
        <Eye className="w-3 h-3 text-purple-400" />
        <span className="text-[9px] text-purple-300 font-medium">Visão</span>
      </motion.div>
    </div>
  );
};

export default CardEffectHiddenMarket;
