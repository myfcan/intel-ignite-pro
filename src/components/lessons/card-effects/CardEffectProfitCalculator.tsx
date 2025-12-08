'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Target, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 12;

export const CardEffectProfitCalculator: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [services, setServices] = useState(0);
  const [total, setTotal] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setServices(0);
    setTotal(0);
    
    setScene(1);
    
    timersRef.current.push(setTimeout(() => {
      setScene(2);
      let count = 0;
      const countInterval = setInterval(() => {
        if (count < 5) {
          count++;
          setServices(count);
          setTotal(count * 100);
        } else {
          clearInterval(countInterval);
        }
      }, 400 * scale);
      intervalsRef.current.push(countInterval);
    }, 2500 * scale));
    
    timersRef.current.push(setTimeout(() => setScene(3), 6000 * scale));
    timersRef.current.push(setTimeout(() => setScene(4), 9000 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setServices(0);
      setTotal(0);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-emerald-900/30 to-teal-950">
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-0.5 bg-emerald-400"
            style={{ top: `${20 + i * 20}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isActive ? 1 : 0 }}
            transition={{ delay: i * 0.2 * scale, duration: 0.5 * scale }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 * scale }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Calculadora de Ganhos</h3>
              <p className="text-emerald-300 text-sm">Projete sua renda mensal</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="w-full max-w-sm bg-slate-800/50 border border-emerald-400/30 rounded-xl p-4 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 * scale }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">Mês 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300">Meta: 5 serviços</span>
                </div>
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((week) => (
                  <div key={week} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-8">S{week}</span>
                    <div className="flex-1 h-4 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: services >= week ? '100%' : '0%' }}
                        transition={{ duration: 0.5 * scale }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${services >= week ? 'text-emerald-400' : 'text-slate-500'}`}>
                      R$100
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="w-full max-w-sm bg-emerald-500/10 border border-emerald-400/40 rounded-xl p-4 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 * scale }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <DollarSign className="w-7 h-7 text-emerald-400" />
                <motion.span
                  className="text-3xl font-bold text-emerald-300"
                  key={total}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 * scale }}
                >
                  R$ {total.toLocaleString('pt-BR')}
                </motion.span>
              </div>
              <p className="text-sm text-emerald-400/70">{services} serviço(s) × R$100 cada</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 * scale }}
              className="mt-4 w-full max-w-sm"
            >
              <div className="flex items-center justify-center gap-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <div className="text-center">
                  <p className="text-sm text-yellow-300 font-medium">Mês 3: R$ 1.500+</p>
                  <p className="text-xs text-yellow-400/70">Com crescimento consistente</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              className="mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 * scale }}
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30"
                animate={{ boxShadow: ['0 0 15px rgba(16,185,129,0.2)', '0 0 30px rgba(16,185,129,0.4)', '0 0 15px rgba(16,185,129,0.2)'] }}
                transition={{ duration: 2 * scale, repeat: 0 }}
              >
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-semibold text-sm">Projeção validada!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{ backgroundColor: scene >= s ? '#10b981' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 * scale }}
      >
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] text-emerald-300 font-medium">Projeção</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProfitCalculator;
