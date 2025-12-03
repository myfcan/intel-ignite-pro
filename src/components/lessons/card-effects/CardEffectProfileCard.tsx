'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, ShoppingBag, Heart } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectProfileCard - Apresentação de perfil de pessoa
 *
 * Mostra um card de perfil animado com foto, nome, idade e contexto
 * Ideal para introduzir personagens em histórias de caso
 */
export const CardEffectProfileCard: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'photo' | 'name' | 'details' | 'complete'>('waiting');
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('photo');

    timersRef.current.push(setTimeout(() => setPhase('name'), 800));
    timersRef.current.push(setTimeout(() => setPhase('details'), 1600));
    timersRef.current.push(setTimeout(() => setPhase('complete'), 2800));
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

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={isAnimating ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Profile Photo */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="relative mb-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              {/* Ring animation */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-orange-400"
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name */}
        <AnimatePresence>
          {['name', 'details', 'complete'].includes(phase) && (
            <motion.div
              className="text-center mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Maria</h3>
              <p className="text-orange-300 font-medium">52 anos</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details */}
        <AnimatePresence>
          {['details', 'complete'].includes(phase) && (
            <motion.div
              className="flex flex-wrap justify-center gap-3 mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white/90">Campinas</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white/90">Vendedora</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quote */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="mt-6 max-w-xs text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-orange-200/80 italic">
                "Descobri que a diferença está em como você conta a história"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
      >
        <Heart className="w-3 h-3 text-orange-400" />
        <span className="text-[9px] text-orange-300">História Real</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProfileCard;
