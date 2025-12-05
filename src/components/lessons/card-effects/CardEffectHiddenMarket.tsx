'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, DollarSign, Users, Store, Coffee, GraduationCap, Building } from 'lucide-react';
import { CardEffectProps } from './index';

export const CardEffectHiddenMarket: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3>(0);
  const [revealedOpportunities, setRevealedOpportunities] = useState<number[]>([]);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const opportunities = [
    { icon: Store, label: 'Padaria', need: 'Posts para redes' },
    { icon: GraduationCap, label: 'Professor', need: 'Organizar aulas' },
    { icon: Building, label: 'Síndico', need: 'Comunicados' },
    { icon: Coffee, label: 'Café', need: 'Cardápio semanal' },
    { icon: Users, label: 'Família', need: 'Planejamento' },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setRevealedOpportunities([]);
    setScene(1);
    
    timersRef.current.push(setTimeout(() => setScene(2), 2000));
    timersRef.current.push(setTimeout(() => setRevealedOpportunities([0]), 2500));
    timersRef.current.push(setTimeout(() => setRevealedOpportunities([0, 1]), 3200));
    timersRef.current.push(setTimeout(() => setRevealedOpportunities([0, 1, 2]), 3900));
    timersRef.current.push(setTimeout(() => setRevealedOpportunities([0, 1, 2, 3]), 4600));
    timersRef.current.push(setTimeout(() => setRevealedOpportunities([0, 1, 2, 3, 4]), 5300));
    timersRef.current.push(setTimeout(() => setScene(3), 7000));

    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setRevealedOpportunities([]);
        setTimeout(() => startAnimation(), 500);
      }
    }, 10000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setRevealedOpportunities([]);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%23fff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        {/* Título */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Mercado Oculto</h3>
              <p className="text-orange-300 text-sm">Oportunidades que ninguém vê</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Olho */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <motion.div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-400/50 flex items-center justify-center"
                animate={{ 
                  boxShadow: scene >= 2 ? '0 0 30px rgba(251, 146, 60, 0.5)' : '0 0 10px rgba(251, 146, 60, 0.2)'
                }}
              >
                <AnimatePresence mode="wait">
                  {scene === 1 ? (
                    <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <EyeOff className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                      <Eye className="w-10 h-10 sm:w-12 sm:h-12 text-orange-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de oportunidades */}
        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="grid grid-cols-5 gap-3 w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {opportunities.map((opp, index) => {
                const isRevealed = revealedOpportunities.includes(index);
                const Icon = opp.icon;
                
                return (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-500 ${
                        isRevealed 
                          ? 'bg-orange-500/30 border border-orange-400/50' 
                          : 'bg-white/5 border border-white/10'
                      }`}
                      animate={{
                        boxShadow: isRevealed ? '0 0 15px rgba(251, 146, 60, 0.4)' : 'none'
                      }}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isRevealed ? 'text-orange-300' : 'text-white/30'}`} />
                    </motion.div>
                    <span className={`text-[10px] mt-1 ${isRevealed ? 'text-orange-200' : 'text-white/30'}`}>
                      {opp.label}
                    </span>
                    {isRevealed && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[8px] text-green-400 mt-0.5"
                      >
                        {opp.need}
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conclusão */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
                animate={{
                  boxShadow: ['0 0 15px rgba(34,197,94,0.2)', '0 0 30px rgba(34,197,94,0.4)', '0 0 15px rgba(34,197,94,0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold text-sm">5 oportunidades reveladas!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
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
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 }}
      >
        <Eye className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Visão</span>
      </motion.div>
    </div>
  );
};

export default CardEffectHiddenMarket;
