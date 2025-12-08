'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Layers, Target, Sparkles, ArrowDown, Clock, Zap, CheckCircle, Star } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 33;

/**
 * CardEffectVariationMultiplier - Ajuste X aplicado
 *
 * FASE 1 (Cenas 1-5): Elementos empilhados - produto e variações
 * FASE 2 (Cenas 6-11): Efeitos em tela limpa
 *
 * 11 Cenas (~33s total, 3s por cena)
 */
export const CardEffectVariationMultiplier: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const variations = [
    { label: 'Para mães', color: 'pink' },
    { label: 'Para economizar', color: 'emerald' },
    { label: 'Para presente', color: 'purple' },
    { label: 'Promoção urgente', color: 'orange' },
    { label: 'Dia das Mães', color: 'rose' },
    { label: 'Recomeço', color: 'cyan' },
  ];

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

  const visibleVariations = scene === 3 ? 2 : scene === 4 ? 4 : scene >= 5 ? 6 : 0;

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
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
              {/* Cena 1: Source product */}
              <motion.div
                className="text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-white/70 font-medium">1 Produto</p>
              </motion.div>

              {/* Cena 2: Arrow */}
              {scene >= 2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 * scale }}
                >
                  <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <div className="flex flex-col items-center gap-1">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <ArrowDown className="w-4 h-4 text-purple-400" />
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Cenas 3-5: Variations grid */}
              <div className="grid grid-cols-2 gap-2 w-full">
                {variations.map((variation, i) => {
                  const isVisible = visibleVariations > i;
                  const colorClasses: Record<string, string> = {
                    pink: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
                    emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                    purple: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
                    orange: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
                    rose: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
                    cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
                  };

                  return (
                    <motion.div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colorClasses[variation.color]}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', delay: i * 0.1 * scale }}
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-xs font-medium">{variation.label}</span>
                    </motion.div>
                  );
                })}
              </div>
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
              {/* Cena 6: Big layers icon */}
              {scene === 6 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(168,85,247,0.3)', '0 0 60px rgba(168,85,247,0.6)', '0 0 30px rgba(168,85,247,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Layers className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Multiplicador de Conteúdo</p>
                </motion.div>
              )}

              {/* Cena 7: Big number */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <motion.p
                    className="text-7xl font-black text-purple-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5 * scale, repeat: 0 }}
                  >
                    20+
                  </motion.p>
                  <p className="text-white/80 mt-2 text-lg">abordagens diferentes</p>
                </motion.div>
              )}

              {/* Cena 8: Time saved */}
              {scene === 8 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="w-10 h-10 text-cyan-400" />
                    <div className="text-left">
                      <p className="text-3xl font-bold text-cyan-400">10 posts</p>
                      <p className="text-white/70">em 10 minutos</p>
                    </div>
                  </div>
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
                  {['Mesma essência', 'Múltiplos públicos', 'Máximo alcance'].map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3 px-4 py-3 bg-purple-500/10 rounded-xl border border-purple-500/30"
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                      <span className="text-white/90 text-sm">{item}</span>
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
                  <p className="text-xl font-bold text-white">Eficiência máxima</p>
                </motion.div>
              )}

              {/* Cena 11: Final message */}
              {scene === 11 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/40"
                    animate={{ boxShadow: ['0 0 20px rgba(168,85,247,0.2)', '0 0 40px rgba(168,85,247,0.4)', '0 0 20px rgba(168,85,247,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <span className="text-sm text-purple-200">
                      <span className="font-bold text-white">1 produto</span> → <span className="font-bold text-white">20+ abordagens</span>
                    </span>
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
        <Layers className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Multiplicador</span>
      </motion.div>
    </div>
  );
};

export default CardEffectVariationMultiplier;
