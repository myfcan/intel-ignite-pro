'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Cpu, ArrowRight, Sparkles, Link } from 'lucide-react';

interface CardEffectBridgeBuilderProps {
  isActive?: boolean;
}

export const CardEffectBridgeBuilder: React.FC<CardEffectBridgeBuilderProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [bridgeProgress, setBridgeProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => setScene(2), 1500),
      setTimeout(() => setBridgeProgress(25), 2000),
      setTimeout(() => setBridgeProgress(50), 2500),
      setTimeout(() => setBridgeProgress(75), 3000),
      setTimeout(() => setBridgeProgress(100), 3500),
      setTimeout(() => setScene(3), 4500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-900 border border-emerald-500/30">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h3 className="text-base font-bold text-white mb-1">Construtor de Pontes</h3>
          <p className="text-[10px] text-emerald-300">Conectando problemas a soluções</p>
        </motion.div>

        {/* Visualização da ponte */}
        <div className="relative w-full max-w-xs h-32 flex items-center justify-between">
          {/* Lado esquerdo - Pessoas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center mb-1">
              <Users className="w-7 h-7 text-orange-400" />
            </div>
            <span className="text-[9px] text-orange-300 font-medium">Pessoas</span>
            <span className="text-[7px] text-orange-400/70">com problemas</span>
          </motion.div>

          {/* Ponte central */}
          <div className="absolute left-1/2 -translate-x-1/2 w-32 flex flex-col items-center">
            {/* Linha da ponte */}
            <div className="relative w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 via-emerald-400 to-cyan-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${bridgeProgress}%` }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Partículas na ponte */}
              {bridgeProgress > 0 && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                  style={{ left: `${bridgeProgress - 5}%` }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>

            {/* Label VOCÊ */}
            <AnimatePresence>
              {scene >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex flex-col items-center"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-300" />
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold mt-1">VOCÊ</span>
                  <span className="text-[7px] text-emerald-400/70">a ponte</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lado direito - I.A. */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-1">
              <Cpu className="w-7 h-7 text-cyan-400" />
            </div>
            <span className="text-[9px] text-cyan-300 font-medium">I.A.</span>
            <span className="text-[7px] text-cyan-400/70">com soluções</span>
          </motion.div>
        </div>

        {/* Mensagem de conexão */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-4 text-center"
            >
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-lg px-4 py-2">
                <Link className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-medium">
                  Conexão estabelecida!
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-2">
                Você é a ponte entre dois mundos
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#10b981' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-2 py-0.5"
      >
        <ArrowRight className="w-3 h-3 text-emerald-400" />
        <span className="text-[9px] text-emerald-300 font-medium">Ponte</span>
      </motion.div>
    </div>
  );
};

export default CardEffectBridgeBuilder;
