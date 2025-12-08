'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Wand2, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectObjectTransformer - Transforma objeto comum em vendável
 *
 * 5 Cenas progressivas (~15s total, 3s por cena):
 * 1. Objeto comum (caneta) aparecendo
 * 2. Varinha de transformação
 * 3. Partículas de magia
 * 4. Produto vendável com história
 * 5. Template de prompt
 *
 * Roda 2x automaticamente
 */
export const CardEffectObjectTransformer: React.FC<CardEffectProps> = ({ isActive = false }) => {
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
    setScene(1); // Objeto comum
    timersRef.current.push(setTimeout(() => setScene(2), 3000)); // Varinha
    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Magia
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // Produto
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Template

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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={scene > 0 ? {
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.3, 1],
            } : { opacity: 0 }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Magic particles during scene 3 */}
      <AnimatePresence>
        {scene === 3 && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-violet-400"
            style={{ left: '50%', top: '45%' }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: (Math.random() - 0.5) * 200,
              y: (Math.random() - 0.5) * 200,
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, delay: i * 0.1 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* Title */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.h3
              className="text-lg sm:text-xl font-bold text-white mb-6 text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Desafio: Transforme Qualquer Objeto
            </motion.h3>
          )}
        </AnimatePresence>

        {/* Main visualization */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* ========== CENA 1: Objeto comum ========== */}
          <AnimatePresence>
            {scene >= 1 && (
              <motion.div
                className="text-center"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: scene >= 4 ? 0.4 : 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-2"
                  animate={scene === 1 ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Pencil className="w-9 h-9 sm:w-10 sm:h-10 text-white/60" />
                </motion.div>
                <p className="text-xs text-white/50">Caneta comum</p>
                <p className="text-xs text-white/30 mt-0.5">R$ 5</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 2: Transform action ========== */}
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
              >
                <motion.div
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center"
                  animate={scene === 3 ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 1.5 }}
                >
                  <Wand2 className="w-7 h-7 text-white" />
                </motion.div>
                <motion.div
                  className="mt-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 text-violet-400" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== CENA 4: Resultado ========== */}
          <AnimatePresence>
            {scene >= 4 && (
              <motion.div
                className="text-center"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
              >
                <motion.div
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center mb-2"
                  animate={{
                    boxShadow: ['0 0 15px rgba(16, 185, 129, 0.2)', '0 0 30px rgba(16, 185, 129, 0.4)', '0 0 15px rgba(16, 185, 129, 0.2)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ShoppingCart className="w-9 h-9 sm:w-10 sm:h-10 text-emerald-400" />
                </motion.div>
                <p className="text-xs text-emerald-300 font-medium">Produto vendável</p>
                <p className="text-xs text-emerald-400/70 mt-0.5">Com história</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sparkle effect during scene 3 */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              className="flex items-center gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-violet-300">Transformando...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 5: Prompt template ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl max-w-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-violet-300 font-medium">FÓRMULA MÁGICA</span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                "Crie um texto sobre <span className="text-cyan-400 font-bold">[objeto]</span> para <span className="text-pink-400 font-bold">[público]</span>. Tom: <span className="text-yellow-400 font-bold">história pessoal</span>."
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Wand2 className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-[10px] text-violet-300 font-medium">Desafio</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#8b5cf6' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectObjectTransformer;
