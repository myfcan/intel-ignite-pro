'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Target, Sparkles } from 'lucide-react';

interface CardEffectProfitCalculatorProps {
  isActive?: boolean;
}

export const CardEffectProfitCalculator: React.FC<CardEffectProfitCalculatorProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [services, setServices] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => setScene(2), 1000),
    ];

    // Animação dos contadores
    let servicesCount = 0;
    const countInterval = setInterval(() => {
      if (servicesCount < 5) {
        servicesCount++;
        setServices(servicesCount);
        setTotal(servicesCount * 100);
      } else {
        clearInterval(countInterval);
      }
    }, 400);

    const timer2 = setTimeout(() => setScene(3), 4000);
    timers.push(timer2);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(countInterval);
    };
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-900 border border-emerald-500/30">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-0.5 bg-emerald-400"
            style={{ top: `${20 + i * 20}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
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
          <h3 className="text-base font-bold text-white mb-1">Calculadora de Ganhos</h3>
          <p className="text-[10px] text-emerald-300">Projete sua renda mensal</p>
        </motion.div>

        {/* Gráfico de projeção */}
        <div className="w-full max-w-xs bg-slate-800/50 border border-emerald-400/30 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] text-slate-400">Mês 1</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] text-emerald-300">Meta: 5 serviços</span>
            </div>
          </div>

          {/* Barras de progresso */}
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((week) => (
              <div key={week} className="flex items-center gap-2">
                <span className="text-[8px] text-slate-500 w-6">S{week}</span>
                <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: services >= week ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className={`text-[8px] ${services >= week ? 'text-emerald-400' : 'text-slate-500'}`}>
                  R$100
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total acumulado */}
        <motion.div
          className="w-full max-w-xs bg-emerald-500/10 border border-emerald-400/40 rounded-xl p-3 text-center"
          animate={{
            scale: scene >= 2 ? [1, 1.02, 1] : 1,
          }}
          transition={{ duration: 1, repeat: scene >= 2 ? Infinity : 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <motion.span
              className="text-2xl font-bold text-emerald-300"
              key={total}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              R$ {total.toLocaleString('pt-BR')}
            </motion.span>
          </div>
          <p className="text-[9px] text-emerald-400/70">
            {services} serviço(s) × R$100 cada
          </p>
        </motion.div>

        {/* Projeção futura */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 w-full max-w-xs"
            >
              <div className="flex items-center justify-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-3 py-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <div className="text-center">
                  <p className="text-xs text-yellow-300 font-medium">Mês 3: R$ 1.500+</p>
                  <p className="text-[8px] text-yellow-400/70">Com crescimento consistente</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#10b981' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-2 py-0.5"
      >
        <TrendingUp className="w-3 h-3 text-emerald-400" />
        <span className="text-[9px] text-emerald-300 font-medium">Projeção</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProfitCalculator;
