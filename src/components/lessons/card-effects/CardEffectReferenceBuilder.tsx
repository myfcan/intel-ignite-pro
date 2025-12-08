'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Users, TrendingUp, Crown, MessageCircle } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 12;

export const CardEffectReferenceBuilder: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [reputation, setReputation] = useState(0);
  const [followers, setFollowers] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setReputation(0);
    setFollowers(0);
    
    setScene(1);
    
    timersRef.current.push(setTimeout(() => {
      setScene(2);
      let rep = 0;
      const repInterval = setInterval(() => {
        rep += 5;
        setReputation(rep);
        if (rep >= 100) clearInterval(repInterval);
      }, 50 * scale);
      intervalsRef.current.push(repInterval);
      
      let fol = 0;
      const folInterval = setInterval(() => {
        fol += 2;
        setFollowers(fol);
        if (fol >= 50) clearInterval(folInterval);
      }, 60 * scale);
      intervalsRef.current.push(folInterval);
    }, 2500 * scale));
    
    timersRef.current.push(setTimeout(() => setScene(3), 5500 * scale));
    timersRef.current.push(setTimeout(() => setScene(4), 9000 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setReputation(0);
      setFollowers(0);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-yellow-900/30 to-amber-950">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: (2 + Math.random() * 2) * scale, repeat: 0, delay: Math.random() * 2 * scale }}
          >
            <Star className="w-2 h-2 text-yellow-400/30" fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 * scale }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Construtor de Autoridade</h3>
              <p className="text-yellow-300 text-sm">Vire referência no mercado</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 150 / scale }}
            >
              <motion.div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 flex items-center justify-center"
                animate={{ boxShadow: ['0 0 20px rgba(234,179,8,0.3)', '0 0 40px rgba(234,179,8,0.5)', '0 0 20px rgba(234,179,8,0.3)'] }}
                transition={{ duration: 2 * scale, repeat: 0 }}
              >
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300" />
              </motion.div>
              
              {scene >= 2 && (
                <motion.div
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ duration: 0.4 * scale }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                >
                  <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="grid grid-cols-2 gap-4 w-full max-w-sm mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 * scale }}
            >
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  <span className="text-2xl font-bold text-yellow-300">{reputation}%</span>
                </div>
                <p className="text-xs text-yellow-400/70">Reputação</p>
              </div>

              <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-2xl font-bold text-orange-300">{followers}</span>
                </div>
                <p className="text-xs text-orange-400/70">Indicações</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 3 && (
            <motion.div
              className="w-full max-w-sm space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 * scale }}
            >
              {['Clientes procuram você', 'Preços mais altos', 'Menos esforço de venda'].map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 * scale, duration: 0.4 * scale }}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white/10 backdrop-blur rounded-xl border border-white/20"
                >
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-white text-sm font-medium">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              className="mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 * scale }}
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-500/30"
                animate={{ boxShadow: ['0 0 15px rgba(234,179,8,0.2)', '0 0 30px rgba(234,179,8,0.4)', '0 0 15px rgba(234,179,8,0.2)'] }}
                transition={{ duration: 2 * scale, repeat: 0 }}
              >
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold text-sm">Autoridade construída!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{ backgroundColor: scene >= s ? '#eab308' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 * scale }}
      >
        <Crown className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-[10px] text-yellow-300 font-medium">Expert</span>
      </motion.div>
    </div>
  );
};

export default CardEffectReferenceBuilder;
