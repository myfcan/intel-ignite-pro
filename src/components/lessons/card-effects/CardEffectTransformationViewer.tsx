'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, TrendingUp, Award, Users, ShoppingCart, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 33;

/**
 * CardEffectTransformationViewer - Ajuste X aplicado
 *
 * FASE 1 (Cenas 1-5): Elementos empilhados - contador e comparação
 * FASE 2 (Cenas 6-11): Efeitos em tela limpa
 *
 * 11 Cenas (~33s total, 3s por cena)
 */
export const CardEffectTransformationViewer: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<number>(0);
  const [displayNumber, setDisplayNumber] = useState(0);
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
    setDisplayNumber(0);
    setScene(1);

    // Animate counter in scene 2
    timersRef.current.push(setTimeout(() => {
      setScene(2);
      const targetNumber = 47;
      const steps = 25;
      const stepTime = 80;
      for (let i = 1; i <= steps; i++) {
        timersRef.current.push(setTimeout(() => {
          setDisplayNumber(Math.round((targetNumber / steps) * i));
        }, stepTime * i));
      }
    }, 3000 * scale));

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
      setDisplayNumber(0);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] } : { opacity: 0 }}
        transition={{ duration: 3 * scale, repeat: 0 }}
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
              {/* Cena 1-2: Big Number */}
              <motion.div
                className="text-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 * scale }}
              >
                <motion.div
                  className="text-7xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                >
                  {displayNumber}
                </motion.div>
                {scene >= 3 && (
                  <motion.p
                    className="text-lg text-white/80 mt-2"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 * scale }}
                  >
                    vendas em um mês
                  </motion.p>
                )}
              </motion.div>

              {/* Cena 4: Comparação */}
              {scene >= 4 && (
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 * scale }}
                >
                  <div className="text-center px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-white/50">Antes</p>
                    <p className="text-xl font-bold text-red-400">2-3</p>
                  </div>
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <div className="text-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <p className="text-xs text-white/50">Depois</p>
                    <p className="text-xl font-bold text-emerald-400">47</p>
                  </div>
                </motion.div>
              )}

              {/* Cena 5: Alcance */}
              {scene >= 5 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full border border-cyan-500/30"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-cyan-300">Alcance 10x maior</span>
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
              {/* Cena 6: Big sparkles */}
              {scene === 6 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(168,85,247,0.3)', '0 0 60px rgba(168,85,247,0.6)', '0 0 30px rgba(168,85,247,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Sparkles className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Transformação Total</p>
                </motion.div>
              )}

              {/* Cena 7: Growth chart */}
              {scene === 7 && (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-end gap-3 h-32">
                    {[20, 35, 50, 75, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-8 bg-gradient-to-t from-purple-500 to-fuchsia-500 rounded-t-lg"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.15 * scale, duration: 0.5 * scale }}
                      />
                    ))}
                  </div>
                  <p className="text-white/80">Crescimento exponencial</p>
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
                    className="text-6xl font-black text-purple-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5 * scale, repeat: 0 }}
                  >
                    +1.567%
                  </motion.p>
                  <p className="text-white/80 mt-2 text-lg">de aumento</p>
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
                  {[
                    { icon: Users, text: 'Alcance 10x maior', color: 'cyan' },
                    { icon: ShoppingCart, text: 'Clientes de todo Brasil', color: 'pink' }
                  ].map((item, i) => (
                    <motion.div
                      key={item.text}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border`}
                      style={{
                        backgroundColor: item.color === 'cyan' ? 'rgba(6,182,212,0.1)' : 'rgba(236,72,153,0.1)',
                        borderColor: item.color === 'cyan' ? 'rgba(6,182,212,0.3)' : 'rgba(236,72,153,0.3)'
                      }}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color === 'cyan' ? '#06b6d4' : '#ec4899' }} />
                      <span className="text-white/90 text-sm">{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 10: Stars */}
              {scene === 10 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex justify-center gap-3 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1 * scale, type: 'spring' }}
                      >
                        <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xl font-bold text-white">Resultados comprovados</p>
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
                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500/20 to-yellow-500/20 rounded-2xl border border-emerald-500/40"
                    animate={{ boxShadow: ['0 0 20px rgba(16,185,129,0.2)', '0 0 50px rgba(16,185,129,0.5)', '0 0 20px rgba(16,185,129,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    <span className="text-lg font-bold text-emerald-300">+1.567% de aumento</span>
                    <Award className="w-6 h-6 text-yellow-400" />
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
                backgroundColor: scene >= s ? '#a855f7' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 * scale }}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Transformação</span>
      </motion.div>
    </div>
  );
};

export default CardEffectTransformationViewer;
