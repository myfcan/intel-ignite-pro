'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectEmotionConnector - Mostra conexão emocional
 */
export const CardEffectEmotionConnector: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'text' | 'hearts' | 'connect' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('text');

    timersRef.current.push(setTimeout(() => setPhase('hearts'), 1500));
    timersRef.current.push(setTimeout(() => setPhase('connect'), 3000));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 4500));
    timersRef.current.push(setTimeout(() => setLoopCount(prev => prev + 1), 12000));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      timersRef.current.forEach(clearTimeout);
      setPhase('waiting');
    }
    return () => timersRef.current.forEach(clearTimeout);
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';
  const showHearts = ['hearts', 'connect', 'complete'].includes(phase);
  const showConnect = ['connect', 'complete'].includes(phase);

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-pink-950 via-rose-950 to-red-950">
      {/* Floating hearts */}
      <AnimatePresence>
        {showHearts && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: '30%',
            }}
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
              y: -150 - Math.random() * 100,
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{ duration: 3, delay: i * 0.2 }}
          >
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Quote text */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="max-w-sm text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="text-sm text-white/80 italic leading-relaxed">
                "Toda mãe conhece aquele momento: filho com tarefa, você cansada do trabalho, mas ali, <span className="text-pink-400 font-bold">juntos</span>..."
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection visualization */}
        <AnimatePresence>
          {showConnect && (
            <motion.div
              className="flex items-center gap-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-14 h-14 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
                <Users className="w-7 h-7 text-pink-400" />
              </div>

              <motion.div
                className="flex gap-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-pink-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </motion.div>

              <motion.div
                className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center"
                animate={{ boxShadow: ['0 0 10px rgba(236, 72, 153, 0.3)', '0 0 25px rgba(236, 72, 153, 0.6)', '0 0 10px rgba(236, 72, 153, 0.3)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-7 h-7 text-white fill-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success message */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-6 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="text-sm text-pink-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Emoção conecta, produto não
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Heart className="w-3 h-3 text-pink-400" />
        <span className="text-[9px] text-pink-300">Conexão</span>
      </motion.div>
    </div>
  );
};

export default CardEffectEmotionConnector;
