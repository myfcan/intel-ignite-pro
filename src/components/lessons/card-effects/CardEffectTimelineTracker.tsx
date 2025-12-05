'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, CheckCircle, Circle, ArrowRight, TrendingUp } from 'lucide-react';

interface CardEffectTimelineTrackerProps {
  isActive?: boolean;
}

export const CardEffectTimelineTracker: React.FC<CardEffectTimelineTrackerProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [activeWeek, setActiveWeek] = useState(0);

  const timeline = [
    { period: 'Semana 1-2', task: 'Exploração', goal: '3 testes grátis' },
    { period: 'Mês 1', task: 'Primeiros Ganhos', goal: '3-5 serviços' },
    { period: 'Mês 2-3', task: 'Crescimento', goal: 'Aumentar preços' },
    { period: 'Mês 4+', task: 'Estabilidade', goal: 'Renda recorrente' },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => { setScene(2); setActiveWeek(1); }, 1500),
      setTimeout(() => setActiveWeek(2), 2500),
      setTimeout(() => setActiveWeek(3), 3500),
      setTimeout(() => setActiveWeek(4), 4500),
      setTimeout(() => setScene(3), 5500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900/20 to-slate-900 border border-sky-500/30">
      {/* Background timeline */}
      <div className="absolute left-8 top-20 bottom-20 w-0.5 bg-sky-400/20" />

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <h3 className="text-base font-bold text-white mb-1">Linha do Tempo</h3>
          <p className="text-[10px] text-sky-300">Seu progresso mapeado</p>
        </motion.div>

        {/* Timeline vertical */}
        <div className="w-full max-w-xs space-y-2">
          {timeline.map((item, index) => {
            const isActive = activeWeek > index;
            const isCurrent = activeWeek === index + 1;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2"
              >
                {/* Indicador */}
                <motion.div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? 'bg-sky-500'
                      : isCurrent
                      ? 'bg-sky-500/50 border-2 border-sky-400'
                      : 'bg-slate-700 border border-slate-600'
                  }`}
                  animate={{
                    scale: isCurrent ? [1, 1.2, 1] : 1,
                    boxShadow: isCurrent ? '0 0 15px rgba(14, 165, 233, 0.5)' : 'none'
                  }}
                  transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
                >
                  {isActive ? (
                    <CheckCircle className="w-3 h-3 text-white" />
                  ) : (
                    <Circle className="w-2 h-2 text-slate-500" />
                  )}
                </motion.div>

                {/* Content */}
                <motion.div
                  className={`flex-1 p-2 rounded-lg ${
                    isActive || isCurrent
                      ? 'bg-sky-500/20 border border-sky-400/40'
                      : 'bg-slate-800/30 border border-slate-700/30'
                  }`}
                  animate={{
                    scale: isCurrent ? 1.02 : 1,
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[10px] font-bold ${
                      isActive || isCurrent ? 'text-sky-300' : 'text-slate-500'
                    }`}>
                      {item.period}
                    </span>
                    {isCurrent && (
                      <span className="text-[7px] bg-sky-400 text-slate-900 px-1 rounded font-bold">
                        ATUAL
                      </span>
                    )}
                  </div>
                  <p className={`text-[9px] ${
                    isActive || isCurrent ? 'text-white' : 'text-slate-500'
                  }`}>
                    {item.task}
                  </p>
                  <p className={`text-[8px] ${
                    isActive || isCurrent ? 'text-sky-400/70' : 'text-slate-600'
                  }`}>
                    Meta: {item.goal}
                  </p>
                </motion.div>
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
              className="mt-3 flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 rounded-lg px-3 py-1.5"
            >
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-sky-300 font-medium">
                4 meses para estabilidade!
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
                backgroundColor: scene >= s ? '#0ea5e9' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-sky-500/20 border border-sky-400/30 rounded-full px-2 py-0.5"
      >
        <Calendar className="w-3 h-3 text-sky-400" />
        <span className="text-[9px] text-sky-300 font-medium">Timeline</span>
      </motion.div>
    </div>
  );
};

export default CardEffectTimelineTracker;
