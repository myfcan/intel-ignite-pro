'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Zap, Target, ArrowRight, Sparkles, CheckCircle, Award } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 33;

/**
 * CardEffectStatsComparison - Ajuste X aplicado
 *
 * FASE 1 (Cenas 1-5): Elementos empilhados - comparação
 * FASE 2 (Cenas 6-11): Efeitos em tela limpa
 *
 * 11 Cenas (~33s total, 3s por cena)
 */
export const CardEffectStatsComparison: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

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
    setScene(1);
    timersRef.current.push(setTimeout(() => setScene(2), 3000 * scale));
    timersRef.current.push(setTimeout(() => setScene(3), 6000 * scale));
    timersRef.current.push(setTimeout(() => setScene(4), 9000 * scale));
    timersRef.current.push(setTimeout(() => setScene(5), 12000 * scale));
    timersRef.current.push(setTimeout(() => setScene(6), 15000 * scale));
    timersRef.current.push(setTimeout(() => setScene(7), 18000 * scale));
    timersRef.current.push(setTimeout(() => setScene(8), 21000 * scale));
    timersRef.current.push(setTimeout(() => setScene(9), 24000 * scale));
    timersRef.current.push(setTimeout(() => setScene(10), 27000 * scale));
    timersRef.current.push(setTimeout(() => setScene(11), 30000 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
    }
    return () => clearTimers();
  }, [isActive, scale]);

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
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-4 sm:px-6 pt-8 pb-16">

        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-5) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 5 && (
            <motion.div 
              className="flex flex-col items-center gap-4 w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Header */}
              <motion.div
                className="text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30 mx-auto mb-3">
                  <BarChart3 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">A Transformação em Números</h3>
              </motion.div>

              {/* Cena 2: Antes */}
              {scene >= 2 && (
                <motion.div
                  className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl w-full"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-xs text-red-300 mb-1 font-semibold">ANTES</p>
                  <p className="text-3xl font-bold text-red-400">30</p>
                  <p className="text-xs text-white/60">posts/mês → 2-3 vendas</p>
                </motion.div>
              )}

              {/* Cena 3: Transformação */}
              {scene >= 3 && (
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 * scale }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3 * scale, repeat: 0, ease: 'linear' }}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>
              )}

              {/* Cena 4: Depois */}
              {scene >= 4 && (
                <motion.div
                  className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl w-full"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-emerald-300 mb-1 font-semibold">DEPOIS</p>
                  <p className="text-3xl font-bold text-emerald-400">8</p>
                  <p className="text-xs text-white/60">posts/mês → 47 vendas</p>
                </motion.div>
              )}

              {/* Cena 5: Insight */}
              {scene >= 5 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-cyan-200">Menos esforço, mais resultado</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== FASE 2: TELA LIMPA (Cenas 6-11) ========== */}
        <AnimatePresence>
          {scene >= 6 && (
            <motion.div 
              className="flex flex-col items-center justify-center h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 * scale }}
            >
              {/* Cena 6: Big chart icon */}
              {scene === 6 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(16,185,129,0.3)', '0 0 60px rgba(16,185,129,0.6)', '0 0 30px rgba(16,185,129,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <TrendingUp className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Crescimento Real</p>
                </motion.div>
              )}

              {/* Cena 7: Side by side comparison */}
              {scene === 7 && (
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-xs text-white/50">Antes</p>
                    <p className="text-2xl font-bold text-red-400">2-3</p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                  >
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                  <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <p className="text-xs text-white/50">Depois</p>
                    <p className="text-2xl font-bold text-emerald-400">47</p>
                  </div>
                </motion.div>
              )}

              {/* Cena 8: Big percentage */}
              {scene === 8 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <motion.p
                    className="text-6xl font-black text-emerald-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5 * scale, repeat: 0 }}
                  >
                    +1.467%
                  </motion.p>
                  <p className="text-white/80 mt-2 text-lg">de aumento em vendas</p>
                </motion.div>
              )}

              {/* Cena 9: Benefits */}
              {scene === 9 && (
                <motion.div
                  className="flex flex-col gap-3 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {['Menos esforço', 'Mais resultado', 'Tempo livre'].map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-white/90 text-sm">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 10: Smart effort */}
              {scene === 10 && (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center px-4 py-2 bg-red-500/10 rounded-lg">
                      <p className="text-xs text-red-300">Esforço alto</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50" />
                    <div className="text-center px-4 py-2 bg-emerald-500/10 rounded-lg">
                      <p className="text-xs text-emerald-300">Esforço inteligente</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg font-medium">Trabalhe com estratégia</p>
                </motion.div>
              )}

              {/* Cena 11: Final badge */}
              {scene === 11 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl border border-emerald-500/40"
                    animate={{ boxShadow: ['0 0 20px rgba(16,185,129,0.2)', '0 0 40px rgba(16,185,129,0.4)', '0 0 20px rgba(16,185,129,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Target className="w-6 h-6 text-emerald-400" />
                    <span className="text-lg font-bold text-emerald-200">-73% posts</span>
                    <span className="text-white/40">•</span>
                    <span className="text-lg font-bold text-cyan-200">+1.467% vendas</span>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#10b981' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 * scale }}
      >
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] text-emerald-300 font-medium">Resultados</span>
      </motion.div>
    </div>
  );
};

export default CardEffectStatsComparison;
