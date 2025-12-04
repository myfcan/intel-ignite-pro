'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Facebook, HelpCircle, PenOff, Users, TrendingDown, XCircle } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectProblemIdentifier - O problema da Maria com vendas online
 *
 * 5 Cenas progressivas (~10s total):
 * 1. Instagram e Facebook aparecendo (0-2s)
 * 2. "Não sabia o que postar" (2-4s)
 * 3. "Não sabia como escrever" (4-6s)
 * 4. "Vendas só de vizinhos" (6-8s)
 * 5. "Estagnada há 3 anos" (8-10s)
 */
export const CardEffectProblemIdentifier: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const startAnimation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setScene(1); // Social media icons
    timersRef.current.push(setTimeout(() => setScene(2), 2000)); // Não sabia postar
    timersRef.current.push(setTimeout(() => setScene(3), 4000)); // Não sabia escrever
    timersRef.current.push(setTimeout(() => setScene(4), 6000)); // Vendas vizinhos
    timersRef.current.push(setTimeout(() => setScene(5), 8000)); // Estagnada
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
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-red-950/50 to-slate-950">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Warning pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

        {/* ========== CENA 1: Social Media Icons ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="flex gap-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                {scene >= 2 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <XCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                  <Facebook className="w-8 h-8 text-white" />
                </div>
                {scene >= 2 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <XCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.h3
              className="text-xl sm:text-2xl font-bold text-white mb-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              O Desafio Digital
            </motion.h3>
          )}
        </AnimatePresence>

        {/* ========== CENAS 2-5: Problem Cards ========== */}
        <div className="space-y-3 w-full max-w-sm">
          {/* Cena 2: Não sabia o que postar */}
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">Não sabia o que postar</p>
                  <p className="text-red-300/60 text-xs">Sem ideias de conteúdo</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 3: Não sabia como escrever */}
          <AnimatePresence>
            {scene >= 3 && (
              <motion.div
                className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <PenOff className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">Não sabia como escrever</p>
                  <p className="text-red-300/60 text-xs">Textos não chamavam atenção</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 4: Vendas só de vizinhos */}
          <AnimatePresence>
            {scene >= 4 && (
              <motion.div
                className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">Vendas só de vizinhos</p>
                  <p className="text-orange-300/60 text-xs">Dependia do boca a boca</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========== CENA 5: Conclusão - Estagnada ========== */}
        <AnimatePresence>
          {scene >= 5 && (
            <motion.div
              className="mt-5 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/30 to-rose-600/30 rounded-full border border-red-500/40"
                animate={{
                  boxShadow: ['0 0 10px rgba(239,68,68,0.2)', '0 0 20px rgba(239,68,68,0.4)', '0 0 10px rgba(239,68,68,0.2)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-red-200 font-bold">Loja estagnada há 3 anos</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[10px] text-red-300 font-medium">Diagnóstico</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: scene >= s ? '#ef4444' : 'rgba(255,255,255,0.2)',
              scale: scene === s ? 1.3 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectProblemIdentifier;
