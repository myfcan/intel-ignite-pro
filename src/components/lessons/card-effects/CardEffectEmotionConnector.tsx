'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Sparkles, MessageCircle, Star, Quote, Zap, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 33;

/**
 * CardEffectEmotionConnector - Ajuste X aplicado
 *
 * FASE 1 (Cenas 1-5): Elementos empilhados
 * FASE 2 (Cenas 6-11): Efeitos em tela limpa
 *
 * 11 Cenas (~33s total, 3s por cena)
 */
export const CardEffectEmotionConnector: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-pink-950 via-rose-950 to-red-950">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)' }}
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
              {/* Cena 1: Quote Header */}
              <motion.div
                className="flex items-center justify-center gap-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                <MessageCircle className="w-5 h-5 text-pink-400" />
                <span className="text-xs text-pink-300 font-medium uppercase tracking-wider">Texto que conecta</span>
              </motion.div>

              {/* Cena 2: Quote text */}
              {scene >= 2 && (
                <motion.div
                  className="text-center px-4 py-4 bg-white/5 rounded-xl border border-pink-500/20"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <Quote className="w-6 h-6 text-pink-400/50 mx-auto mb-2" />
                  <p className="text-sm sm:text-base text-white/90 italic leading-relaxed">
                    "Toda mãe conhece aquele momento: filho com tarefa, você cansada do trabalho, mas ali, <span className="text-pink-400 font-bold not-italic">juntos</span>..."
                  </p>
                </motion.div>
              )}

              {/* Cena 3: Connection icons */}
              {scene >= 3 && (
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
                    <Users className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-pink-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.7, delay: i * 0.1, repeat: Infinity }}
                      />
                    ))}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                </motion.div>
              )}

              {/* Cena 4: Floating hearts */}
              {scene >= 4 && (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                    >
                      <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 5: Success badge */}
              {scene >= 5 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full border border-pink-500/40"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.6 * scale }}
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-200 font-medium text-sm">Emoção conecta!</span>
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
              {/* Cena 6: Big heart with glow */}
              {scene === 6 && (
                <motion.div
                  className="relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"
                    animate={{ boxShadow: ['0 0 30px rgba(236,72,153,0.3)', '0 0 60px rgba(236,72,153,0.6)', '0 0 30px rgba(236,72,153,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Heart className="w-16 h-16 text-white fill-white" />
                  </motion.div>
                  <motion.p
                    className="text-center text-white font-bold text-xl mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 * scale }}
                  >
                    Conexão Emocional
                  </motion.p>
                </motion.div>
              )}

              {/* Cena 7: Before/After comparison */}
              {scene === 7 && (
                <motion.div
                  className="flex flex-col gap-4 max-w-sm w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-xs text-red-300 mb-1 font-medium">❌ TEXTO GENÉRICO</p>
                    <p className="text-sm text-white/60">"Vendo produtos de qualidade..."</p>
                  </div>
                  <Zap className="w-6 h-6 text-pink-400 mx-auto" />
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <p className="text-xs text-emerald-300 mb-1 font-medium">✓ TEXTO EMOCIONAL</p>
                    <p className="text-sm text-white/90">"Toda mãe conhece..."</p>
                  </div>
                </motion.div>
              )}

              {/* Cena 8: Impact stats */}
              {scene === 8 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <motion.p
                    className="text-6xl font-black text-pink-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5 * scale, repeat: 0 }}
                  >
                    10x
                  </motion.p>
                  <p className="text-white/80 mt-2">mais engajamento</p>
                </motion.div>
              )}

              {/* Cena 9: Key benefits */}
              {scene === 9 && (
                <motion.div
                  className="flex flex-col gap-3 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {['História pessoal', 'Emoção real', 'Público específico'].map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3 px-4 py-3 bg-pink-500/10 rounded-xl border border-pink-500/30"
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <CheckCircle className="w-5 h-5 text-pink-400" />
                      <span className="text-white/90 text-sm">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 10: Stars celebration */}
              {scene === 10 && (
                <motion.div
                  className="relative flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <motion.div
                    className="text-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: i * 0.1 * scale, type: 'spring' }}
                        >
                          <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xl font-bold text-white">Cliente emocionado = Cliente fiel</p>
                  </motion.div>
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
                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl border border-pink-500/40"
                    animate={{ boxShadow: ['0 0 20px rgba(236,72,153,0.2)', '0 0 40px rgba(236,72,153,0.4)', '0 0 20px rgba(236,72,153,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Sparkles className="w-6 h-6 text-pink-400" />
                    <span className="text-lg font-bold text-pink-200">Emoção conecta, produto não!</span>
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
                backgroundColor: scene >= s ? '#ec4899' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 border border-pink-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 * scale }}
      >
        <Heart className="w-3.5 h-3.5 text-pink-400" />
        <span className="text-[10px] text-pink-300 font-medium">Conexão</span>
      </motion.div>
    </div>
  );
};

export default CardEffectEmotionConnector;
