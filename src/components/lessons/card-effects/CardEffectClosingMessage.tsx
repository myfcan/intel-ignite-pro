'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Star, Rocket, Heart, Lightbulb, Target, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 33;

/**
 * CardEffectClosingMessage - Ajuste X aplicado
 *
 * FASE 1 (Cenas 1-5): Elementos empilhados - mensagem de fechamento
 * FASE 2 (Cenas 6-11): Efeitos em tela limpa
 *
 * 11 Cenas (~33s total, 3s por cena)
 */
export const CardEffectClosingMessage: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-indigo-950/50 to-purple-950/30">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={scene > 0 ? { y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] } : { opacity: 0.1 }}
            transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}
          animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
          transition={{ duration: 5 * scale, repeat: 0 }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-4 sm:px-6 pt-8 pb-16">

        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-5) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 5 && (
            <motion.div 
              className="flex flex-col items-center gap-4 w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1-2: Message */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 * scale }}
              >
                <p className="text-lg sm:text-xl font-medium text-white/90 leading-relaxed">
                  Você está aqui para estar{' '}
                  {scene >= 2 && (
                    <motion.span
                      className="text-purple-400 font-bold"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      nesse segundo grupo.
                    </motion.span>
                  )}
                </p>
              </motion.div>

              {/* Cena 3: Radar */}
              {scene >= 3 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <p className="text-base text-slate-300/90">
                    Nesta lição: <span className="text-cyan-400 font-medium">abrir o seu radar</span> para o que já é possível.
                  </p>
                </motion.div>
              )}

              {/* Cena 4: Practice */}
              {scene >= 4 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <p className="text-base text-slate-300/90">
                    Próximas aulas: <span className="text-pink-400 font-medium">prompts, ferramentas e passo a passo</span>
                  </p>
                </motion.div>
              )}

              {/* Cena 5: Tools */}
              {scene >= 5 && (
                <motion.div
                  className="flex flex-wrap justify-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-300">Ferramentas</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-300">Passo a passo</span>
                  </div>
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
              {/* Cena 6: Big rocket */}
              {scene === 6 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(139,92,246,0.3)', '0 0 60px rgba(139,92,246,0.6)', '0 0 30px rgba(139,92,246,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Rocket className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Sua Jornada</p>
                </motion.div>
              )}

              {/* Cena 7: Divider stars */}
              {scene === 7 && (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                  <Star className="w-6 h-6 text-purple-400" />
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                </motion.div>
              )}

              {/* Cena 8: Benefits */}
              {scene === 8 && (
                <motion.div
                  className="flex flex-col gap-3 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {['Conhecimento prático', 'Resultados reais', 'Passo a passo'].map((item, i) => (
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

              {/* Cena 9: Heart */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="w-10 h-10 text-white fill-white" />
                  </motion.div>
                  <p className="text-white/80 mt-4 text-lg">Feito para você</p>
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
                  <p className="text-xl font-bold text-white">Pronto para brilhar!</p>
                </motion.div>
              )}

              {/* Cena 11: Final CTA */}
              {scene === 11 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="relative bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-6"
                    animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.2)', '0 0 40px rgba(139,92,246,0.4)', '0 0 20px rgba(139,92,246,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Rocket className="w-6 h-6 text-purple-400" />
                      <p className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        usar a I.A. na sua vida real
                      </p>
                      <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <ArrowRight className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400/60" />
                    <Heart className="absolute -bottom-2 -left-2 w-4 h-4 text-pink-400/60" />
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
                backgroundColor: scene >= s ? '#8b5cf6' : 'rgba(255,255,255,0.2)',
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
        transition={{ delay: 0.5 * scale, duration: 0.6 * scale }}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Próximos passos</span>
      </motion.div>
    </div>
  );
};

export default CardEffectClosingMessage;
