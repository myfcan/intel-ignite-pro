'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, Award, Rocket, Target } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 12;

export const CardEffectGrowthVisualizer: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [growthStage, setGrowthStage] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const stages = [
    { label: 'Iniciante', icon: Star, value: 'R$0', color: 'slate' },
    { label: 'Praticante', icon: Target, value: 'R$300', color: 'blue' },
    { label: 'Profissional', icon: Award, value: 'R$1.000+', color: 'purple' },
    { label: 'Expert', icon: Rocket, value: 'R$3.000+', color: 'gold' },
  ];

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const getColors = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      slate: { bg: 'bg-slate-500/20', border: 'border-slate-400/40', text: 'text-slate-400' },
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-400/40', text: 'text-blue-400' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-400/40', text: 'text-purple-400' },
      gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/40', text: 'text-yellow-400' },
    };
    return colors[color];
  };

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setGrowthStage(0);
    setScene(1);
    
    timersRef.current.push(setTimeout(() => { setScene(2); setGrowthStage(1); }, 2000 * scale));
    timersRef.current.push(setTimeout(() => setGrowthStage(2), 3500 * scale));
    timersRef.current.push(setTimeout(() => setGrowthStage(3), 5000 * scale));
    timersRef.current.push(setTimeout(() => setGrowthStage(4), 6500 * scale));
    timersRef.current.push(setTimeout(() => setScene(3), 8000 * scale));
    timersRef.current.push(setTimeout(() => setScene(4), 9500 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setGrowthStage(0);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-orange-900/30 to-amber-950">
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div className="text-center mb-6" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 * scale }}>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Visualizador de Crescimento</h3>
              <p className="text-orange-300 text-sm">De zero a profissional</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 2 && (
            <motion.div className="grid grid-cols-4 gap-2 w-full max-w-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 * scale }}>
              {stages.map((stage, index) => {
                const isReached = growthStage > index;
                const isCurrent = growthStage === index + 1;
                const colors = getColors(stage.color);
                const Icon = stage.icon;
                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, scale: isCurrent ? 1.05 : 1 }} transition={{ delay: index * 0.1 * scale, duration: 0.4 * scale }} className={`flex flex-col items-center p-2 rounded-xl ${isReached || isCurrent ? `${colors.bg} border ${colors.border}` : 'bg-slate-800/30 border border-slate-700/30'}`}>
                    <Icon className={`w-5 h-5 mb-1 ${isReached || isCurrent ? colors.text : 'text-slate-500'}`} />
                    <span className={`text-[9px] font-medium ${isReached || isCurrent ? colors.text : 'text-slate-500'}`}>{stage.label}</span>
                    <span className={`text-xs font-bold ${isReached || isCurrent ? 'text-white' : 'text-slate-600'}`}>{stage.value}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 * scale }} className="mt-6">
              <motion.div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl border border-orange-500/30" animate={{ boxShadow: ['0 0 15px rgba(249,115,22,0.2)', '0 0 30px rgba(249,115,22,0.4)', '0 0 15px rgba(249,115,22,0.2)'] }} transition={{ duration: 2 * scale, repeat: 0 }}>
                <Rocket className="w-5 h-5 text-orange-400" />
                <span className="text-white font-semibold text-sm">Crescimento é inevitável!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div key={s} className="w-2.5 h-2.5 rounded-full" animate={{ backgroundColor: scene >= s ? '#f97316' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }} transition={{ duration: 0.4 * scale }} />
          ))}
        </div>
      </div>

      <motion.div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }} transition={{ duration: 0.5 * scale }}>
        <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Growth</span>
      </motion.div>
    </div>
  );
};

export default CardEffectGrowthVisualizer;
