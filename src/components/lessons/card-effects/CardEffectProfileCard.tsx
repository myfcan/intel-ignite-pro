'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Heart, Scissors, Home, Users, Palette, Clock, Star, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 33;

/**
 * CardEffectProfileCard - Ajuste X aplicado
 *
 * FASE 1 (Cenas 1-5): Elementos empilhados - perfil da Maria
 * FASE 2 (Cenas 6-11): Efeitos em tela limpa
 *
 * 11 Cenas (~33s total, 3s por cena)
 */
export const CardEffectProfileCard: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%23fff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-4 sm:px-6 pt-6 pb-16">

        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-5) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 5 && (
            <motion.div 
              className="flex flex-col items-center gap-3 w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Avatar */}
              <motion.div
                className="relative"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 * scale }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-2xl">
                  <User className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-orange-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 3 * scale, repeat: 0 }}
                />
              </motion.div>

              {/* Cena 2: Nome + Idade */}
              {scene >= 2 && (
                <motion.div
                  className="text-center"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <h3 className="text-2xl font-bold text-white">Maria</h3>
                  <p className="text-orange-300 font-semibold text-sm">42 anos</p>
                </motion.div>
              )}

              {/* Cena 3: Tags */}
              {scene >= 3 && (
                <motion.div
                  className="flex flex-wrap justify-center gap-2"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                    <Users className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-xs text-white font-medium">Mãe de 2</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs text-white font-medium">São Paulo</span>
                  </div>
                </motion.div>
              )}

              {/* Cena 4: Artesanato */}
              {scene >= 4 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <Home className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-semibold text-sm">Loja de artesanato</span>
                </motion.div>
              )}

              {/* Cena 5: Problema */}
              {scene >= 5 && (
                <motion.div
                  className="px-4 py-3 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-xl border border-rose-500/30"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <p className="text-orange-100 font-medium text-xs text-center">
                    Talentosa, mas <span className="text-rose-400 font-bold">estagnada há 3 anos</span>
                  </p>
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
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(251,146,60,0.3)', '0 0 60px rgba(251,146,60,0.6)', '0 0 30px rgba(251,146,60,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Heart className="w-14 h-14 text-white fill-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Uma História Real</p>
                </motion.div>
              )}

              {/* Cena 7: Habilidades */}
              {scene === 7 && (
                <motion.div
                  className="grid grid-cols-3 gap-3 max-w-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {['Tricô', 'Bordado', 'Macramê'].map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex flex-col items-center gap-2 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.15 * scale }}
                    >
                      <Scissors className="w-8 h-8 text-orange-400" />
                      <span className="text-white text-sm font-medium">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 8: Anos de experiência */}
              {scene === 8 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <motion.p
                    className="text-7xl font-black text-orange-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5 * scale, repeat: 0 }}
                  >
                    20+
                  </motion.p>
                  <p className="text-white/80 mt-2 text-lg">anos de experiência</p>
                </motion.div>
              )}

              {/* Cena 9: Qualidades */}
              {scene === 9 && (
                <motion.div
                  className="flex flex-col gap-3 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {[
                    { icon: Clock, text: 'Experiência comprovada', color: 'purple' },
                    { icon: Palette, text: 'Peças únicas', color: 'emerald' },
                    { icon: Heart, text: 'Feitas com amor', color: 'pink' }
                  ].map((item, i) => (
                    <motion.div
                      key={item.text}
                      className={`flex items-center gap-3 px-4 py-3 bg-${item.color}-500/10 rounded-xl border border-${item.color}-500/30`}
                      style={{ 
                        backgroundColor: item.color === 'purple' ? 'rgba(168,85,247,0.1)' : item.color === 'emerald' ? 'rgba(16,185,129,0.1)' : 'rgba(236,72,153,0.1)',
                        borderColor: item.color === 'purple' ? 'rgba(168,85,247,0.3)' : item.color === 'emerald' ? 'rgba(16,185,129,0.3)' : 'rgba(236,72,153,0.3)'
                      }}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <item.icon className={`w-5 h-5`} style={{ color: item.color === 'purple' ? '#a855f7' : item.color === 'emerald' ? '#10b981' : '#ec4899' }} />
                      <span className="text-white/90 text-sm">{item.text}</span>
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
                  <p className="text-xl font-bold text-white">Talento reconhecido</p>
                </motion.div>
              )}

              {/* Cena 11: O problema */}
              {scene === 11 && (
                <motion.div
                  className="text-center max-w-xs"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="px-6 py-4 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-2xl border border-rose-500/40"
                    animate={{ boxShadow: ['0 0 20px rgba(244,63,94,0.2)', '0 0 40px rgba(244,63,94,0.4)', '0 0 20px rgba(244,63,94,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: 0 }}
                  >
                    <Sparkles className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-white">
                      Mas algo faltava...
                    </p>
                    <p className="text-sm text-rose-300 mt-1">A I.A. mudou tudo!</p>
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
                backgroundColor: scene >= s ? '#f97316' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 * scale }}
      >
        <Heart className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
        <span className="text-[10px] text-orange-300 font-medium">História Real</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProfileCard;
