'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Volume2, Waves, Radio, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectAmplifierConcept - Visualiza o conceito de amplificação
 *
 * 5 Cenas progressivas (~15s total, 3s por cena):
 * 1. Input - "Sua voz" pequena
 * 2. Amplificador I.A. aparece
 * 3. Ondas de amplificação
 * 4. Output - "Voz amplificada"
 * 5. Mensagem: "I.A. não substitui, amplifica"
 *
 * Roda 2x automaticamente
 */
export const CardEffectAmplifierConcept: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1); // Input
    timersRef.current.push(setTimeout(() => setScene(2), 3000)); // Amplificador
    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Ondas
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // Output
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Mensagem

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

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950">
      {/* Background waves */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
            style={{ top: `${20 + i * 15}%` }}
            animate={scene >= 3 ? {
              x: ['-100%', '100%'],
              opacity: [0, 0.5, 0],
            } : { opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Wave animations during scene 3+ */}
      {scene >= 3 && [...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400/30"
          initial={{ width: 80, height: 80, opacity: 0 }}
          animate={{ width: 300 + i * 60, height: 300 + i * 60, opacity: [0, 0.5, 0] }}
          transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
        />
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* Title */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.h3
              className="text-xl sm:text-2xl font-bold text-white mb-6 text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              O Conceito de Amplificação
            </motion.h3>
          )}
        </AnimatePresence>

        {/* Main visualization */}
        <div className="flex items-center gap-4 sm:gap-8">

          {/* ========== CENA 1: Input ========== */}
          <AnimatePresence>
            {scene >= 1 && (
              <motion.div
                className="text-center"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
              >
                <motion.div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2"
                  animate={scene >= 2 ? { scale: [1, 0.9, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-white/60" />
                </motion.div>
                <p className="text-xs text-white/50">Sua voz</p>
                <p className="text-[10px] text-white/30 mt-0.5">pequena</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 2: Amplificador ========== */}
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                className="text-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, duration: 0.8 }}
              >
                <motion.div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg"
                  animate={{
                    boxShadow: scene >= 3
                      ? ['0 0 20px rgba(6, 182, 212, 0.3)', '0 0 50px rgba(6, 182, 212, 0.6)', '0 0 20px rgba(6, 182, 212, 0.3)']
                      : '0 0 10px rgba(6, 182, 212, 0.2)'
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </motion.div>
                <motion.p
                  className="text-sm text-cyan-300 font-bold mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  I.A.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 4: Output ========== */}
          <AnimatePresence>
            {scene >= 4 && (
              <motion.div
                className="text-center"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
              >
                <motion.div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 flex items-center justify-center mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Waves className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
                </motion.div>
                <p className="text-xs text-cyan-300 font-bold">Amplificada</p>
                <p className="text-[10px] text-cyan-400/70 mt-0.5">alcança mais</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========== CENA 3: Connection lines ========== */}
        <AnimatePresence>
          {scene >= 3 && scene < 5 && (
            <motion.div
              className="flex items-center justify-center gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Radio className="w-4 h-4 text-cyan-400/60" />
              <motion.div
                className="flex gap-1"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.7, delay: i * 0.12, repeat: Infinity }}
                  />
                ))}
              </motion.div>
              <Radio className="w-4 h-4 text-cyan-400/60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 5: Mensagem Final ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-6 max-w-sm text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/40"
                animate={{
                  boxShadow: ['0 0 15px rgba(6, 182, 212, 0.2)', '0 0 30px rgba(6, 182, 212, 0.4)', '0 0 15px rgba(6, 182, 212, 0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-200 font-medium text-sm">
                  A I.A. não substitui você, ela <span className="font-bold text-white">amplifica</span>!
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Zap className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] text-cyan-300 font-medium">Amplificador</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#06b6d4' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectAmplifierConcept;
