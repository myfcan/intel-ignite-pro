'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Sparkles, MessageCircle, Star } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectEmotionConnector - Mostra conexão emocional
 *
 * 5 Cenas progressivas (~10s total):
 * 1. Citação emocional aparecendo (0-2s)
 * 2. Corações flutuando (2-4s)
 * 3. Ícones de pessoas conectando (4-6s)
 * 4. Linha de conexão pulsando (6-8s)
 * 5. "Emoção conecta, produto não" (8-10s)
 */
export const CardEffectEmotionConnector: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setScene(1); // Citação
    timersRef.current.push(setTimeout(() => setScene(2), 2000)); // Corações
    timersRef.current.push(setTimeout(() => setScene(3), 4000)); // Pessoas
    timersRef.current.push(setTimeout(() => setScene(4), 6000)); // Conexão
    timersRef.current.push(setTimeout(() => setScene(5), 8000)); // Mensagem
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
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-pink-950 via-rose-950 to-red-950">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* ========== CENA 2: Floating hearts ========== */}
      <AnimatePresence>
        {scene >= 2 && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + Math.random() * 70}%`,
              bottom: '20%',
            }}
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
              y: -200 - Math.random() * 150,
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{ duration: 4, delay: i * 0.2 }}
          >
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

        {/* ========== CENA 1: Quote text ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="max-w-sm text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.div
                className="flex items-center justify-center gap-2 mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <MessageCircle className="w-5 h-5 text-pink-400" />
                <span className="text-xs text-pink-300 font-medium uppercase tracking-wider">Texto que conecta</span>
              </motion.div>
              <motion.p
                className="text-base sm:text-lg text-white/90 italic leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                "Toda mãe conhece aquele momento: filho com tarefa, você cansada do trabalho, mas ali, <span className="text-pink-400 font-bold not-italic">juntos</span>..."
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 3 & 4: Connection visualization ========== */}
        <AnimatePresence>
          {scene >= 3 && (
            <motion.div
              className="flex items-center gap-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {/* Person 1 */}
              <motion.div
                className="w-14 h-14 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center"
                animate={scene >= 4 ? {
                  boxShadow: ['0 0 10px rgba(236, 72, 153, 0.2)', '0 0 25px rgba(236, 72, 153, 0.5)', '0 0 10px rgba(236, 72, 153, 0.2)']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Users className="w-7 h-7 text-pink-400" />
              </motion.div>

              {/* Connection line */}
              <motion.div
                className="flex gap-1.5"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-pink-400 rounded-full"
                    animate={scene >= 4 ? {
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    } : { opacity: 0.5 }}
                    transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </motion.div>

              {/* Heart */}
              <motion.div
                className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center"
                animate={scene >= 4 ? {
                  boxShadow: ['0 0 15px rgba(236, 72, 153, 0.3)', '0 0 35px rgba(236, 72, 153, 0.6)', '0 0 15px rgba(236, 72, 153, 0.3)'],
                  scale: [1, 1.05, 1]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-7 h-7 text-white fill-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small stars */}
        <AnimatePresence>
          {scene >= 4 && [...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${30 + i * 12}%`,
                left: i % 2 === 0 ? '20%' : '75%',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ========== CENA 5: Success message ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full border border-pink-500/40"
                animate={{
                  boxShadow: ['0 0 15px rgba(236, 72, 153, 0.2)', '0 0 30px rgba(236, 72, 153, 0.4)', '0 0 15px rgba(236, 72, 153, 0.2)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span className="text-pink-200 font-bold text-sm">
                  Emoção conecta, produto não!
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/20 border border-pink-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <Heart className="w-3.5 h-3.5 text-pink-400" />
        <span className="text-[10px] text-pink-300 font-medium">Conexão</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#ec4899' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectEmotionConnector;
