'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Globe, Crown, Star, ArrowUp } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 11;

export const CardEffectLevelSystem: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3>(0);
  const [activeLevel, setActiveLevel] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const levels = [
    { level: 1, title: 'Círculo Próximo', icon: Users, value: 'Grátis - R$100', color: 'amber' },
    { level: 2, title: 'Serviços Online', icon: Globe, value: '~R$100/serviço', color: 'orange' },
    { level: 3, title: 'Seu Sistema', icon: Crown, value: 'R$300-500/mês', color: 'rose' },
  ];

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setActiveLevel(0);
    setScene(1);
    
    timersRef.current.push(setTimeout(() => { setScene(2); setActiveLevel(1); }, 2000 * scale));
    timersRef.current.push(setTimeout(() => setActiveLevel(2), 4000 * scale));
    timersRef.current.push(setTimeout(() => setActiveLevel(3), 6000 * scale));
    timersRef.current.push(setTimeout(() => setScene(3), 8000 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setActiveLevel(0);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  const getColor = (color: string, type: 'bg' | 'border' | 'text') => {
    const colors: Record<string, Record<string, string>> = {
      amber: { bg: 'bg-amber-500/20', border: 'border-amber-400/40', text: 'text-amber-400' },
      orange: { bg: 'bg-orange-500/20', border: 'border-orange-400/40', text: 'text-orange-400' },
      rose: { bg: 'bg-rose-500/20', border: 'border-rose-400/40', text: 'text-rose-400' },
    };
    return colors[color][type];
  };

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent" />

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 * scale }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Sistema de Níveis</h3>
              <p className="text-orange-300 text-sm">Evolua passo a passo</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="flex flex-col-reverse gap-3 w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 * scale }}
            >
              {levels.map((lvl, index) => {
                const isActiveLevel = activeLevel >= lvl.level;
                const isCurrent = activeLevel === lvl.level;
                const Icon = lvl.icon;
                
                return (
                  <motion.div
                    key={lvl.level}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0, marginLeft: `${(3 - lvl.level) * 16}px` }}
                    transition={{ delay: index * 0.1 * scale, duration: 0.5 * scale }}
                  >
                    <motion.div
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isActiveLevel 
                          ? `${getColor(lvl.color, 'bg')} ${getColor(lvl.color, 'border')}` 
                          : 'bg-white/5 border-white/10'
                      }`}
                      animate={{
                        scale: isCurrent ? 1.02 : 1,
                        boxShadow: isCurrent ? '0 0 25px rgba(251, 146, 60, 0.3)' : 'none'
                      }}
                      transition={{ duration: 0.4 * scale }}
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                        isActiveLevel ? getColor(lvl.color, 'bg') : 'bg-white/5'
                      }`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActiveLevel ? getColor(lvl.color, 'text') : 'text-white/30'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isActiveLevel ? 'text-white' : 'text-white/40'}`}>
                            Nível {lvl.level}
                          </span>
                          {isCurrent && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 * scale }}
                              className="text-[10px] bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded"
                            >
                              ATUAL
                            </motion.span>
                          )}
                        </div>
                        <p className={`text-xs ${isActiveLevel ? 'text-white/80' : 'text-white/30'}`}>
                          {lvl.title}
                        </p>
                      </div>

                      <div className={`text-xs font-medium ${isActiveLevel ? getColor(lvl.color, 'text') : 'text-white/30'}`}>
                        {lvl.value}
                      </div>

                      {isActiveLevel && !isCurrent && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 * scale }}
                        >
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 * scale }}
              className="mt-6"
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
                animate={{
                  boxShadow: ['0 0 15px rgba(34,197,94,0.2)', '0 0 30px rgba(34,197,94,0.4)', '0 0 15px rgba(34,197,94,0.2)']
                }}
                transition={{ duration: 2 * scale, repeat: 0 }}
              >
                <ArrowUp className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold text-sm">Suba de nível com consistência!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#f97316' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 * scale }}
      >
        <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Evolução</span>
      </motion.div>
    </div>
  );
};

export default CardEffectLevelSystem;
