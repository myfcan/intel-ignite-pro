'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Heart, Scissors, Home, Users } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectProfileCard - Apresentação de perfil da Maria
 *
 * 5 Cenas progressivas (~10s total):
 * 1. Silhueta aparecendo (0-2s)
 * 2. Foto + Nome + Idade (2-4s)
 * 3. Mãe de 2 filhos + São Paulo (4-6s)
 * 4. Artesã com ícones de trabalho (6-8s)
 * 5. "Talentosa, mas invisível online" (8-10s)
 */
export const CardEffectProfileCard: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setScene(1); // Silhueta
    timersRef.current.push(setTimeout(() => setScene(2), 2000)); // Nome + Idade
    timersRef.current.push(setTimeout(() => setScene(3), 4000)); // Família + Local
    timersRef.current.push(setTimeout(() => setScene(4), 6000)); // Artesanato
    timersRef.current.push(setTimeout(() => setScene(5), 8000)); // Conclusão
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setScene(0);
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      {/* Background pattern - Artesanato */}
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
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

        {/* ========== CENA 1: Silhueta ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="relative mb-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
                animate={{
                  background: scene === 1
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)'
                    : 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)'
                }}
                transition={{ duration: 0.8 }}
              >
                <User className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
              </motion.div>

              {/* Ring animation */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-orange-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 2: Nome + Idade ========== */}
        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="text-center mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-1">Maria</h3>
              <motion.p
                className="text-orange-300 font-semibold text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                42 anos
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 3: Família + Local ========== */}
        <AnimatePresence>
          {scene >= 3 && (
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Users className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-white font-medium">Mãe de 2 filhos</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white font-medium">São Paulo</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 4: Artesanato ========== */}
        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30 mb-3"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Home className="w-5 h-5 text-amber-400" />
                <span className="text-white font-semibold">Dona de loja de artesanato</span>
              </motion.div>

              {/* Ícones de artesanato */}
              <motion.div
                className="flex justify-center gap-4 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {['Tricô', 'Bordado', 'Macramê'].map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex flex-col items-center gap-1"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-orange-300" />
                    </div>
                    <span className="text-[10px] text-orange-200/70">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 5: Conclusão ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-5 max-w-sm text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="px-4 py-3 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-xl border border-rose-500/30"
                animate={{
                  boxShadow: ['0 0 20px rgba(244,63,94,0.2)', '0 0 40px rgba(244,63,94,0.3)', '0 0 20px rgba(244,63,94,0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-orange-100 font-medium text-sm leading-relaxed">
                  Talentosa e dedicada, mas com a loja <span className="text-rose-400 font-bold">estagnada há 3 anos</span>.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge - História Real */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
      >
        <Heart className="w-3.5 h-3.5 text-orange-400" fill="currentColor" />
        <span className="text-[10px] text-orange-300 font-medium">História Real</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#f97316' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectProfileCard;
