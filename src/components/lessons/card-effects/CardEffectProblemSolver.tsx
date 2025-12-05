'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Wand2, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 12;

export const CardEffectProblemSolver: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [revealedItems, setRevealedItems] = useState<number[]>([]);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const items = [
    { problem: '"Preciso de posts"', solution: 'Pacote de conteúdo' },
    { problem: '"Currículo urgente"', solution: 'CV profissional' },
    { problem: '"Comunicados"', solution: 'Templates prontos' },
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
    setRevealedItems([]);
    setScene(1);
    
    timersRef.current.push(setTimeout(() => setScene(2), 2500 * scale));
    items.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setRevealedItems(prev => [...prev, i]), (3500 + i * 600) * scale));
    });
    timersRef.current.push(setTimeout(() => setScene(3), 6500 * scale));
    timersRef.current.push(setTimeout(() => setScene(4), 9000 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setRevealedItems([]);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-rose-900/30 to-pink-950">
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div className="text-center mb-6" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 * scale }}>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Solucionador</h3>
              <p className="text-rose-300 text-sm">Transforme problemas em renda</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 1 && (
            <motion.div className="flex items-center gap-4 w-full max-w-sm justify-center mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 * scale }}>
              <motion.div className={`flex flex-col items-center p-3 rounded-xl ${scene >= 1 ? 'bg-red-500/20 border border-red-400/40' : 'bg-slate-800/30'}`} animate={{ scale: scene === 1 ? 1.05 : 1, opacity: scene >= 3 ? 0.5 : 1 }}>
                <HelpCircle className="w-10 h-10 text-red-400 mb-2" />
                <span className="text-sm text-red-300">Problema</span>
              </motion.div>
              <motion.div className="flex flex-col items-center" animate={{ scale: scene === 2 ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.5 * scale, repeat: 0 }}>
                <Wand2 className={`w-7 h-7 ${scene >= 2 ? 'text-rose-400' : 'text-slate-600'}`} />
                <ArrowRight className={`w-5 h-5 ${scene >= 2 ? 'text-rose-400' : 'text-slate-600'}`} />
              </motion.div>
              <motion.div className={`flex flex-col items-center p-3 rounded-xl ${scene >= 3 ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-slate-800/30'}`} animate={{ scale: scene === 3 ? 1.05 : 1 }}>
                <Sparkles className={`w-10 h-10 ${scene >= 3 ? 'text-emerald-400' : 'text-slate-600'} mb-2`} />
                <span className={`text-sm ${scene >= 3 ? 'text-emerald-300' : 'text-slate-500'}`}>Solução</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 2 && (
            <motion.div className="w-full max-w-sm space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 * scale }}>
              {items.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: revealedItems.includes(index) ? 1 : 0.3, x: revealedItems.includes(index) ? 0 : -20 }} transition={{ duration: 0.4 * scale }} className="flex items-center justify-between px-4 py-3 bg-slate-800/50 rounded-xl border border-white/10">
                  <span className="text-sm text-red-300">{item.problem}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-emerald-300">{item.solution}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 * scale }} className="mt-4">
              <motion.div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/30" animate={{ boxShadow: ['0 0 15px rgba(16,185,129,0.2)', '0 0 30px rgba(16,185,129,0.4)', '0 0 15px rgba(16,185,129,0.2)'] }} transition={{ duration: 2 * scale, repeat: 0 }}>
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="text-lg text-emerald-300 font-bold">= R$ 100</p>
                  <p className="text-xs text-emerald-400/70">Por problema resolvido</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div key={s} className="w-2.5 h-2.5 rounded-full" animate={{ backgroundColor: scene >= s ? '#f43f5e' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }} transition={{ duration: 0.4 * scale }} />
          ))}
        </div>
      </div>

      <motion.div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 border border-rose-500/30 rounded-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }} transition={{ duration: 0.5 * scale }}>
        <Wand2 className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-[10px] text-rose-300 font-medium">Mágica</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProblemSolver;
