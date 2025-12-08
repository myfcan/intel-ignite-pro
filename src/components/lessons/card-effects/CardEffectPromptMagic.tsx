'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ArrowDown, Sparkles, Heart, MessageSquare, CheckCircle, Star } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectPromptMagic - Mostra a transformação de texto via prompt
 *
 * 7 Cenas progressivas (~21s total, 3s por cena):
 * 1. Texto genérico aparecendo
 * 2. Varinha mágica entrando
 * 3. Partículas de magia
 * 4. Texto transformado aparecendo
 * 5. Destaques do novo texto
 * 6. Reação do público
 * 7. "Conexão emocional criada" badge
 *
 * Roda 2x automaticamente
 */
export const CardEffectPromptMagic: React.FC<CardEffectProps> = ({ isActive = false }) => {
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
    setScene(1); // Texto genérico
    timersRef.current.push(setTimeout(() => setScene(2), 3000)); // Varinha
    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Magia
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // Texto transformado
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Destaques
    timersRef.current.push(setTimeout(() => setScene(6), 15000)); // Reação
    timersRef.current.push(setTimeout(() => setScene(7), 18000)); // Badge final

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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={scene > 0 ? {
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
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
        {scene >= 3 && scene < 5 && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: '50%',
              backgroundColor: ['#fbbf24', '#a855f7', '#ec4899', '#22c55e'][i % 4],
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -80 + Math.random() * 160],
              x: [(Math.random() - 0.5) * 150],
            }}
            transition={{ duration: 2.5, delay: i * 0.1 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-8">

        {/* ========== CENA 1: Texto Genérico ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="w-full max-w-sm p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: scene >= 4 ? 0.4 : 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-red-400" />
                <p className="text-xs text-red-300 font-medium">TEXTO GENÉRICO</p>
              </div>
              <p className="text-sm text-white/70 font-mono leading-relaxed">
                "Vendo produtos de qualidade. Ótimo preço. Interessados chamar."
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 2: Varinha Mágica ========== */}
        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="my-5"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150, duration: 0.8 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg"
                animate={scene === 3 ? { rotate: [0, 15, -15, 0] } : {}}
                transition={{ duration: 0.6, repeat: scene === 3 ? 5 : 0 }}
              >
                <Wand2 className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="flex justify-center mt-2"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <ArrowDown className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 3: Label de Transformação ========== */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-500/20 rounded-full border border-violet-500/30 mb-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">Transformando...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 4: Texto Transformado ========== */}
        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              className="w-full max-w-sm p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-emerald-300 font-medium">TEXTO COM EMOÇÃO</p>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                "Toda mãe conhece aquele momento: filho com tarefa, você cansada do trabalho, mas ali, juntos. Esses momentos passam rápido..."
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 5: Destaques ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-4 flex flex-wrap justify-center gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {['História pessoal', 'Emoção real', 'Público específico'].map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-300">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 6: Reação ========== */}
        <AnimatePresence>
          {scene >= 6 && (
            <motion.div
              className="mt-4 flex items-center gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-1 px-3 py-1.5 bg-pink-500/20 rounded-full border border-pink-500/30">
                <Heart className="w-3.5 h-3.5 text-pink-400" fill="currentColor" />
                <span className="text-xs text-pink-300">247</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                <span className="text-xs text-yellow-300">Salvo</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 7: Success Badge ========== */}
        <AnimatePresence>
          {scene >= 7 && (
            <motion.div
              className="mt-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full border border-emerald-500/40"
                animate={{
                  boxShadow: ['0 0 15px rgba(16, 185, 129, 0.2)', '0 0 30px rgba(16, 185, 129, 0.4)', '0 0 15px rgba(16, 185, 129, 0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">Conexão emocional criada!</span>
              </motion.div>
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
        <span className="text-[10px] text-violet-300 font-medium">Transformação</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
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

export default CardEffectPromptMagic;
