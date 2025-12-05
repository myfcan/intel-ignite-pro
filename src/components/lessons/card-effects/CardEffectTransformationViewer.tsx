'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, TrendingUp, Award } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectTransformationViewer - Visualização de transformação impactante
 *
 * 5 Cenas progressivas (~15s total, 3s por cena):
 * 1. Número "0" inicial
 * 2. Contador animando até 47
 * 3. "Vendas em um mês" contexto
 * 4. Comparação Antes/Depois
 * 5. "+1.567% de aumento" celebração
 *
 * Roda 2x automaticamente
 */
export const CardEffectTransformationViewer: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [displayNumber, setDisplayNumber] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setDisplayNumber(0);
    setScene(1); // Número 0

    // Scene 2: Animate counter
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
    }, 3000));

    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Contexto
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // Comparação
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Celebração

    // Loop logic
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setDisplayNumber(0);
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
      setDisplayNumber(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Celebration particles */}
      <AnimatePresence>
        {scene >= 5 && [...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: '50%',
              top: '35%',
              backgroundColor: ['#fbbf24', '#a855f7', '#ec4899', '#22c55e'][i % 4],
            }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: (Math.random() - 0.5) * 250,
              y: (Math.random() - 0.5) * 250,
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2.5, delay: i * 0.06 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* ========== CENA 1-2: Big Number ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              <motion.div
                className="text-7xl sm:text-8xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                animate={scene >= 5 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.6, repeat: scene >= 5 ? 3 : 0 }}
              >
                {displayNumber}
              </motion.div>

              {/* ========== CENA 3: Contexto ========== */}
              <AnimatePresence>
                {scene >= 3 && (
                  <motion.p
                    className="text-xl text-white/80 mt-2"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    vendas em um mês
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 4: Comparação ========== */}
        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              className="mt-6 flex items-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-white/50">Antes</p>
                <p className="text-xl font-bold text-red-400">2-3</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-yellow-400" />
              </motion.div>
              <div className="text-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-xs text-white/50">Depois</p>
                <p className="text-xl font-bold text-emerald-400">47</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 5: Growth indicator ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-yellow-500/20 rounded-full border border-emerald-500/40"
                animate={{
                  boxShadow: ['0 0 15px rgba(16, 185, 129, 0.2)', '0 0 30px rgba(16, 185, 129, 0.5)', '0 0 15px rgba(16, 185, 129, 0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">+1.567% de aumento</span>
                <Award className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stars decoration */}
        {scene >= 4 && [...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${25 + i * 15}%`,
              left: i % 2 === 0 ? '15%' : '80%',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </motion.div>
        ))}
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Transformação</span>
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

export default CardEffectTransformationViewer;
