'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Layers, Target, Sparkles, ArrowDown } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectVariationMultiplier - Mostra multiplicação de variações de conteúdo
 *
 * 5 Cenas progressivas (~15s total, 3s por cena):
 * 1. Produto único aparecendo
 * 2. Seta de multiplicação
 * 3. Primeira variação aparece
 * 4. Mais variações aparecem
 * 5. "1 produto → 20+ abordagens"
 *
 * Roda 2x automaticamente
 */
export const CardEffectVariationMultiplier: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const variations = [
    { label: 'Para mães', color: 'pink' },
    { label: 'Para economizar', color: 'emerald' },
    { label: 'Para presente', color: 'purple' },
    { label: 'Promoção urgente', color: 'orange' },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1); // Produto
    timersRef.current.push(setTimeout(() => setScene(2), 3000)); // Seta
    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // 1ª variação
    timersRef.current.push(setTimeout(() => setScene(4), 8000)); // Mais variações
    timersRef.current.push(setTimeout(() => setScene(5), 11000)); // Conclusão

    // Loop logic
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 15000));
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

  // How many variations to show
  const visibleVariations = scene === 3 ? 1 : scene >= 4 ? 4 : 0;

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Multiplication rays during scene 2 */}
      <AnimatePresence>
        {scene === 2 && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/3 w-0.5 h-20 bg-gradient-to-b from-purple-400 to-transparent origin-top"
            style={{ rotate: `${i * 45}deg` }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 1.5 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* ========== CENA 1: Source product ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2 shadow-lg"
                animate={scene === 2 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.7 }}
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-sm text-white/70 font-medium">1 Produto</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 2: Arrow ========== */}
        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="flex flex-col items-center gap-1">
                  <Layers className="w-6 h-6 text-purple-400" />
                  <ArrowDown className="w-5 h-5 text-purple-400" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 3-4: Variations grid ========== */}
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {variations.map((variation, i) => {
            const isVisible = visibleVariations > i;
            const colorClasses = {
              pink: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
              emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
              purple: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
              orange: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
            };

            return (
              <motion.div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colorClasses[variation.color as keyof typeof colorClasses]}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring', delay: i * 0.15 }}
              >
                <Copy className="w-4 h-4" />
                <span className="text-xs font-medium">{variation.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* ========== CENA 5: Complete message ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-6 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/40"
                animate={{
                  boxShadow: ['0 0 15px rgba(168, 85, 247, 0.2)', '0 0 30px rgba(168, 85, 247, 0.4)', '0 0 15px rgba(168, 85, 247, 0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-200">
                  <span className="font-bold text-white">1 produto</span> → <span className="font-bold text-white">20+ abordagens</span>
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Layers className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Multiplicador</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#a855f7' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectVariationMultiplier;
