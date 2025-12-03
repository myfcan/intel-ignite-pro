'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ArrowDown, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectPromptMagic - Mostra a transformação de texto via prompt
 */
export const CardEffectPromptMagic: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'before' | 'magic' | 'after' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('before');

    timersRef.current.push(setTimeout(() => setPhase('magic'), 2000));
    timersRef.current.push(setTimeout(() => setPhase('after'), 3500));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 5500));
    timersRef.current.push(setTimeout(() => setLoopCount(prev => prev + 1), 14000));
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
  const showBefore = ['before', 'magic', 'after', 'complete'].includes(phase);
  const showMagic = ['magic', 'after', 'complete'].includes(phase);
  const showAfter = ['after', 'complete'].includes(phase);

  return (
    <div className="relative w-full min-h-[450px] h-[55vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950">
      {/* Magic particles */}
      <AnimatePresence>
        {showMagic && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: '45%',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -50 + Math.random() * 100],
              x: [(Math.random() - 0.5) * 100],
            }}
            transition={{ duration: 1.5, delay: i * 0.1 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-6">
        {/* BEFORE TEXT */}
        <AnimatePresence>
          {showBefore && (
            <motion.div
              className="w-full max-w-sm p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: showAfter ? 0.5 : 1 }}
              transition={{ type: 'spring' }}
            >
              <p className="text-xs text-red-300 mb-2 font-medium">TEXTO GENÉRICO</p>
              <p className="text-sm text-white/70 font-mono">
                "Vendo produtos de qualidade. Ótimo preço. Interessados chamar."
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAGIC WAND */}
        <AnimatePresence>
          {showMagic && (
            <motion.div
              className="my-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' }}
            >
              <motion.div
                className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                <Wand2 className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div
                className="flex justify-center mt-2"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <ArrowDown className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AFTER TEXT */}
        <AnimatePresence>
          {showAfter && (
            <motion.div
              className="w-full max-w-sm p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              <p className="text-xs text-emerald-300 mb-2 font-medium">TEXTO COM EMOÇÃO</p>
              <p className="text-sm text-white/90 leading-relaxed">
                "Toda mãe conhece aquele momento: filho com tarefa, você cansada do trabalho, mas ali, juntos. Esses momentos passam rápido..."
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success badge */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">Conexão emocional criada</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Wand2 className="w-3 h-3 text-violet-400" />
        <span className="text-[9px] text-violet-300">Transformação</span>
      </motion.div>
    </div>
  );
};

export default CardEffectPromptMagic;
