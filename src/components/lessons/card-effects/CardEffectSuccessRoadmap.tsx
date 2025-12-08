'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Flag, Rocket, Star, Sparkles, Target, CheckCircle, Zap, Trophy } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 33;

/**
 * CardEffectSuccessRoadmap - Ajuste X aplicado
 *
 * FASE 1 (Cenas 1-5): Elementos empilhados - mapa com etapas
 * FASE 2 (Cenas 6-11): Efeitos em tela limpa
 *
 * 11 Cenas (~33s total, 3s por cena)
 */
export const CardEffectSuccessRoadmap: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-fuchsia-900/30 to-purple-950">
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(217, 70, 239, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
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
                transition={{ duration: 0.5 * scale }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Mapa do Sucesso</h3>
                <p className="text-fuchsia-300 text-sm">Comece agora</p>
              </motion.div>

              {/* Cena 2: Step 1 */}
              {scene >= 2 && (
                <motion.div 
                  className="flex items-center gap-3 px-4 py-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/30 w-full"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 * scale }}
                >
                  <div className="w-10 h-10 rounded-full bg-fuchsia-500 flex items-center justify-center">
                    <Flag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-fuchsia-300 font-medium text-sm">Passo 1</p>
                    <p className="text-white text-xs">Comece pequeno</p>
                  </div>
                </motion.div>
              )}

              {/* Cena 3: Step 2 */}
              {scene >= 3 && (
                <motion.div 
                  className="flex items-center gap-3 px-4 py-3 bg-purple-500/10 rounded-xl border border-purple-500/30 w-full"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 * scale }}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-purple-300 font-medium text-sm">Passo 2</p>
                    <p className="text-white text-xs">Pratique diariamente</p>
                  </div>
                </motion.div>
              )}

              {/* Cena 4: Step 3 */}
              {scene >= 4 && (
                <motion.div 
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 rounded-xl border border-fuchsia-500/40 w-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 * scale }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-fuchsia-300 font-bold text-sm">Sucesso!</p>
                    <p className="text-white text-xs">Resultados reais</p>
                  </div>
                </motion.div>
              )}

              {/* Cena 5: Today message */}
              {scene >= 5 && (
                <motion.div 
                  className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 rounded-xl border border-fuchsia-500/40"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 * scale }}
                >
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  <div>
                    <p className="text-sm font-bold text-white">HOJE MESMO!</p>
                    <p className="text-xs text-fuchsia-300">Seu primeiro passo define tudo</p>
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
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(217,70,239,0.3)', '0 0 60px rgba(217,70,239,0.6)', '0 0 30px rgba(217,70,239,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Rocket className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Decolagem Garantida</p>
                </motion.div>
              )}

              {/* Cena 7: 3 pillars */}
              {scene === 7 && (
                <motion.div
                  className="grid grid-cols-3 gap-3 max-w-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {[
                    { icon: Target, label: 'Foco' },
                    { icon: Zap, label: 'Ação' },
                    { icon: Trophy, label: 'Resultado' }
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      className="flex flex-col items-center gap-2 p-4 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.15 * scale }}
                    >
                      <item.icon className="w-8 h-8 text-fuchsia-400" />
                      <span className="text-white text-sm font-medium">{item.label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 8: Big number */}
              {scene === 8 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <motion.p
                    className="text-7xl font-black text-fuchsia-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5 * scale, repeat: 0 }}
                  >
                    100%
                  </motion.p>
                  <p className="text-white/80 mt-2 text-lg">possível para você</p>
                </motion.div>
              )}

              {/* Cena 9: Checklist */}
              {scene === 9 && (
                <motion.div
                  className="flex flex-col gap-3 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {['Conhecimento adquirido', 'Ferramentas disponíveis', 'Próximo passo claro'].map((item, i) => (
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
                  <p className="text-xl font-bold text-white">Você está pronto!</p>
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
                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(217,70,239,0.3)', '0 0 50px rgba(217,70,239,0.5)', '0 0 20px rgba(217,70,239,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Trophy className="w-7 h-7 text-white" />
                    <span className="text-lg font-bold text-white">COMECE HOJE!</span>
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
                backgroundColor: scene >= s ? '#d946ef' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div 
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-full" 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }} 
        transition={{ duration: 0.5 * scale }}
      >
        <Map className="w-3.5 h-3.5 text-fuchsia-400" />
        <span className="text-[10px] text-fuchsia-300 font-medium">Roadmap</span>
      </motion.div>
    </div>
  );
};

export default CardEffectSuccessRoadmap;
