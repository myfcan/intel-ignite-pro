'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Cpu, Sparkles, Link } from 'lucide-react';
import { CardEffectProps } from './index';

export const CardEffectBridgeBuilder: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3>(0);
  const [bridgeProgress, setBridgeProgress] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setBridgeProgress(0);
    setScene(1);
    
    timersRef.current.push(setTimeout(() => setScene(2), 2000));
    timersRef.current.push(setTimeout(() => setBridgeProgress(25), 2500));
    timersRef.current.push(setTimeout(() => setBridgeProgress(50), 3000));
    timersRef.current.push(setTimeout(() => setBridgeProgress(75), 3500));
    timersRef.current.push(setTimeout(() => setBridgeProgress(100), 4000));
    timersRef.current.push(setTimeout(() => setScene(3), 5500));

    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setBridgeProgress(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 8000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setBridgeProgress(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        {/* Título */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Construtor de Pontes</h3>
              <p className="text-orange-300 text-sm">Conectando problemas a soluções</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visualização da ponte */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="relative w-full max-w-sm flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Lado esquerdo - Pessoas */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
                </div>
                <span className="text-xs text-orange-300 font-medium">Pessoas</span>
                <span className="text-[10px] text-orange-400/70">com problemas</span>
              </motion.div>

              {/* Ponte central */}
              <div className="absolute left-1/2 -translate-x-1/2 top-8 w-24 sm:w-32 flex flex-col items-center">
                <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${bridgeProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                  {bridgeProgress > 0 && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white"
                      style={{ left: `${Math.max(0, bridgeProgress - 5)}%` }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </div>

                <AnimatePresence>
                  {scene >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex flex-col items-center"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-400 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-orange-300" />
                      </div>
                      <span className="text-sm text-orange-300 font-bold mt-2">VOCÊ</span>
                      <span className="text-[10px] text-orange-400/70">a ponte</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Lado direito - I.A. */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-2">
                  <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                </div>
                <span className="text-xs text-amber-300 font-medium">I.A.</span>
                <span className="text-[10px] text-amber-400/70">com soluções</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conclusão */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto"
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
                animate={{
                  boxShadow: ['0 0 15px rgba(34,197,94,0.2)', '0 0 30px rgba(34,197,94,0.4)', '0 0 15px rgba(34,197,94,0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Link className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold text-sm">Conexão estabelecida!</span>
              </motion.div>
              <p className="text-[11px] text-orange-200/70 text-center mt-2">
                Você é a ponte entre dois mundos
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#f97316' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 }}
      >
        <Link className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Ponte</span>
      </motion.div>
    </div>
  );
};

export default CardEffectBridgeBuilder;
