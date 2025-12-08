'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Rocket, Sparkles, CheckCircle, Target, Lightbulb, Zap, Play, Star } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 33;

/**
 * CardEffectNextSteps - Ajuste X aplicado
 *
 * FASE 1 (Cenas 1-5): Elementos empilhados - passos
 * FASE 2 (Cenas 6-11): Efeitos em tela limpa
 *
 * 11 Cenas (~33s total, 3s por cena)
 */
export const CardEffectNextSteps: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const steps = [
    { text: 'Encontrar oportunidades', icon: Target },
    { text: 'Começar pequeno', icon: Lightbulb },
    { text: 'Aplicar hoje', icon: Rocket },
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

  const visibleSteps = scene === 2 ? 1 : scene === 3 ? 2 : scene >= 4 ? 3 : 0;

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Background glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
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
              {/* Cena 1: Header */}
              <motion.div
                className="text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                <Rocket className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Próximos Passos</h3>
              </motion.div>

              {/* Cenas 2-4: Steps list */}
              <div className="space-y-3 w-full">
                {steps.map((step, i) => {
                  const isVisible = visibleSteps > i;
                  const Icon = step.icon;

                  return (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white/5 border border-purple-500/30 rounded-xl"
                      initial={{ x: -30, opacity: 0 }}
                      animate={isVisible ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 100, delay: i * 0.15 * scale }}
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-sm text-white/80 flex-1">{step.text}</span>
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Cena 5: Resumo */}
              {scene >= 5 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full border border-cyan-500/30"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-cyan-300">Testar → Medir → Repetir</span>
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
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(168,85,247,0.3)', '0 0 60px rgba(168,85,247,0.6)', '0 0 30px rgba(168,85,247,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Rocket className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Hora de Agir!</p>
                </motion.div>
              )}

              {/* Cena 7: Formula */}
              {scene === 7 && (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-center gap-3">
                    {['Testar', 'Medir', 'Ajustar', 'Repetir'].map((item, i) => (
                      <React.Fragment key={item}>
                        {i > 0 && <ArrowRight className="w-4 h-4 text-purple-400" />}
                        <motion.div
                          className="px-3 py-2 bg-purple-500/10 rounded-lg border border-purple-500/30"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.15 * scale }}
                        >
                          <span className="text-xs text-purple-300">{item}</span>
                        </motion.div>
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Cena 8: Simple and repeatable */}
              {scene === 8 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Play className="w-10 h-10 text-emerald-400" />
                    <div className="text-left">
                      <p className="text-xl font-bold text-white">Sistema Simples</p>
                      <p className="text-white/70 text-sm">e repetível</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cena 9: Promises */}
              {scene === 9 && (
                <motion.div
                  className="flex flex-col gap-3 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {['Não são promessas', 'São possibilidades reais', 'Comprovadas'].map((item, i) => (
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
                  <p className="text-xl font-bold text-white">Você consegue!</p>
                </motion.div>
              )}

              {/* Cena 11: CTA */}
              {scene === 11 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-2xl shadow-lg"
                    animate={{ boxShadow: ['0 0 20px rgba(168,85,247,0.3)', '0 0 50px rgba(168,85,247,0.5)', '0 0 20px rgba(168,85,247,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                    <span className="text-lg font-bold text-white">Começando hoje</span>
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight className="w-6 h-6 text-white" />
                    </motion.div>
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
        <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Ação</span>
      </motion.div>
    </div>
  );
};

export default CardEffectNextSteps;
