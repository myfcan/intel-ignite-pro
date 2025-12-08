'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Zap, Target, ArrowRight, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectStatsComparison - A Transformação em Números
 *
 * 7 Cenas progressivas (~21s total, 3s por cena):
 * 1. Ícone de análise aparecendo
 * 2. Números ANTES (30 posts, 2-3 vendas)
 * 3. Transição/seta
 * 4. Números DEPOIS (8 posts, 47 vendas)
 * 5. Comparação lado a lado
 * 6. Insight "Menos esforço, mais resultado"
 * 7. Conclusão: "-73% posts, +1.467% vendas"
 *
 * Roda 2x automaticamente
 */
export const CardEffectStatsComparison: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1); // Ícone de análise
    timersRef.current.push(setTimeout(() => setScene(2), 3000)); // Números ANTES
    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Transição
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // Números DEPOIS
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Comparação
    timersRef.current.push(setTimeout(() => setScene(6), 15000)); // Insight
    timersRef.current.push(setTimeout(() => setScene(7), 18000)); // Conclusão

    // Loop logic
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 21000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Central glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* ========== CENA 1: Ícone de Análise ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="mb-5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30"
                animate={{
                  boxShadow: scene >= 2
                    ? ['0 0 20px rgba(16, 185, 129, 0.2)', '0 0 40px rgba(16, 185, 129, 0.4)', '0 0 20px rgba(16, 185, 129, 0.2)']
                    : '0 0 10px rgba(16, 185, 129, 0.1)'
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BarChart3 className="w-8 h-8 text-emerald-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.h3
              className="text-xl sm:text-2xl font-bold text-white mb-6 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              A Transformação em Números
            </motion.h3>
          )}
        </AnimatePresence>

        {/* Comparison container */}
        <div className="flex items-center gap-4 sm:gap-8">

          {/* ========== CENA 2: Números ANTES ========== */}
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                className="text-center p-4 sm:p-5 bg-red-500/10 border border-red-500/30 rounded-xl min-w-[110px]"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: scene >= 4 ? 0.6 : 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-xs text-red-300 mb-1 font-semibold">ANTES</p>
                <motion.p
                  className="text-3xl font-bold text-red-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  30
                </motion.p>
                <p className="text-xs text-white/60">posts/mês</p>
                <div className="mt-3 pt-3 border-t border-red-500/20">
                  <p className="text-xl font-bold text-red-400">2-3</p>
                  <p className="text-xs text-white/60">vendas</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 3: Transição ========== */}
          <AnimatePresence>
            {scene >= 3 && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
                <motion.p
                  className="text-xs text-white/50 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  I.A.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 4: Números DEPOIS ========== */}
          <AnimatePresence>
            {scene >= 4 && (
              <motion.div
                className="text-center p-4 sm:p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl min-w-[110px]"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-emerald-300 mb-1 font-semibold">DEPOIS</p>
                <motion.p
                  className="text-3xl font-bold text-emerald-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  8
                </motion.p>
                <p className="text-xs text-white/60">posts/mês</p>
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <motion.p
                    className="text-xl font-bold text-emerald-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    47
                  </motion.p>
                  <p className="text-xs text-white/60">vendas</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========== CENA 5: Comparação visual ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-4 flex items-center gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center px-3 py-1.5 bg-red-500/10 rounded-lg">
                <p className="text-xs text-red-300">Esforço alto</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/50" />
              <div className="text-center px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                <p className="text-xs text-emerald-300">Esforço inteligente</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 6: Insight ========== */}
        <AnimatePresence>
          {scene >= 6 && (
            <motion.div
              className="mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-200">Menos esforço, mais resultado</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 7: Conclusão ========== */}
        <AnimatePresence>
          {scene >= 7 && (
            <motion.div
              className="mt-4 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full border border-emerald-500/40"
                animate={{
                  boxShadow: ['0 0 15px rgba(16, 185, 129, 0.2)', '0 0 30px rgba(16, 185, 129, 0.4)', '0 0 15px rgba(16, 185, 129, 0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Target className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-200 font-bold">-73% posts</span>
                <span className="text-white/40">•</span>
                <span className="text-cyan-200 font-bold">+1.467% vendas</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] text-emerald-300 font-medium">Resultados Reais</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <motion.div
            key={s}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#10b981' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectStatsComparison;
