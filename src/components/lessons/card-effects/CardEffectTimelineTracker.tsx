'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, CheckCircle, Circle, TrendingUp } from 'lucide-react';
import { CardEffectProps } from './index';

export const CardEffectTimelineTracker: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [activeWeek, setActiveWeek] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const timeline = [
    { period: 'Semana 1-2', task: 'Exploração', goal: '3 testes grátis' },
    { period: 'Mês 1', task: 'Primeiros Ganhos', goal: '3-5 serviços' },
    { period: 'Mês 2-3', task: 'Crescimento', goal: 'Aumentar preços' },
    { period: 'Mês 4+', task: 'Estabilidade', goal: 'Renda recorrente' },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setActiveWeek(0);
    
    setScene(1);
    
    timersRef.current.push(setTimeout(() => { setScene(2); setActiveWeek(1); }, 2000));
    timersRef.current.push(setTimeout(() => setActiveWeek(2), 3500));
    timersRef.current.push(setTimeout(() => setActiveWeek(3), 5000));
    timersRef.current.push(setTimeout(() => setActiveWeek(4), 6500));
    timersRef.current.push(setTimeout(() => setScene(3), 8000));
    timersRef.current.push(setTimeout(() => setScene(4), 9500));
    
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 12000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setActiveWeek(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-sky-900/30 to-blue-950">
      <div className="absolute left-10 top-24 bottom-24 w-0.5 bg-sky-400/20" />

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Linha do Tempo</h3>
              <p className="text-sky-300 text-sm">Seu progresso mapeado</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="w-full max-w-sm space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {timeline.map((item, index) => {
                const isActiveItem = activeWeek > index;
                const isCurrent = activeWeek === index + 1;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <motion.div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActiveItem ? 'bg-sky-500' : isCurrent ? 'bg-sky-500/50 border-2 border-sky-400' : 'bg-slate-700 border border-slate-600'
                      }`}
                      animate={{
                        scale: isCurrent ? [1, 1.2, 1] : 1,
                        boxShadow: isCurrent ? '0 0 20px rgba(14, 165, 233, 0.5)' : 'none'
                      }}
                      transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
                    >
                      {isActiveItem ? <CheckCircle className="w-4 h-4 text-white" /> : <Circle className="w-3 h-3 text-slate-500" />}
                    </motion.div>

                    <motion.div
                      className={`flex-1 p-3 rounded-xl ${
                        isActiveItem || isCurrent ? 'bg-sky-500/20 border border-sky-400/40' : 'bg-slate-800/30 border border-slate-700/30'
                      }`}
                      animate={{ scale: isCurrent ? 1.02 : 1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold ${isActiveItem || isCurrent ? 'text-sky-300' : 'text-slate-500'}`}>
                          {item.period}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-sky-400 text-slate-900 px-1.5 py-0.5 rounded font-bold">ATUAL</span>
                        )}
                      </div>
                      <p className={`text-sm ${isActiveItem || isCurrent ? 'text-white' : 'text-slate-500'}`}>{item.task}</p>
                      <p className={`text-xs ${isActiveItem || isCurrent ? 'text-sky-400/70' : 'text-slate-600'}`}>Meta: {item.goal}</p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-xl border border-sky-500/30"
                animate={{ boxShadow: ['0 0 15px rgba(14,165,233,0.2)', '0 0 30px rgba(14,165,233,0.4)', '0 0 15px rgba(14,165,233,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 text-sky-400" />
                <span className="text-white font-semibold text-sm">4 meses para estabilidade!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{ backgroundColor: scene >= s ? '#0ea5e9' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 border border-sky-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
      >
        <Calendar className="w-3.5 h-3.5 text-sky-400" />
        <span className="text-[10px] text-sky-300 font-medium">Timeline</span>
      </motion.div>
    </div>
  );
};

export default CardEffectTimelineTracker;
