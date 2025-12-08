'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Facebook, HelpCircle, PenOff, Users, TrendingDown, XCircle, Eye, ThumbsDown } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectProblemIdentifier - O problema da Maria com vendas online
 *
 * 7 Cenas progressivas (~21s total, 3s por cena):
 * 1. Instagram e Facebook aparecendo
 * 2. "Não sabia o que postar"
 * 3. "Não sabia como escrever"
 * 4. "Poucos likes e engajamento"
 * 5. "Vendas só de vizinhos"
 * 6. "Ciclo de desistência"
 * 7. "Estagnada há 3 anos"
 *
 * Roda 2x automaticamente
 */
export const CardEffectProblemIdentifier: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1); // Social media icons
    timersRef.current.push(setTimeout(() => setScene(2), 3000)); // Não sabia postar
    timersRef.current.push(setTimeout(() => setScene(3), 6000)); // Não sabia escrever
    timersRef.current.push(setTimeout(() => setScene(4), 9000)); // Poucos likes
    timersRef.current.push(setTimeout(() => setScene(5), 12000)); // Vendas vizinhos
    timersRef.current.push(setTimeout(() => setScene(6), 15000)); // Ciclo desistência
    timersRef.current.push(setTimeout(() => setScene(7), 18000)); // Estagnada

    // Loop logic
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 21000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-red-950/50 to-slate-950">
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
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-6 pb-16">

        {/* ========== CENA 1: Social Media Icons ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="flex gap-3 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                {scene >= 2 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <XCircle className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                {scene >= 2 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <XCircle className="w-3 h-3 text-white" />
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
              className="text-lg sm:text-xl font-bold text-white mb-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              O Desafio Digital
            </motion.h3>
          )}
        </AnimatePresence>

        {/* ========== CENAS 2-6: Problem Cards ========== */}
        <div className="space-y-2 w-full max-w-xs">
          {/* Cena 2: Não sabia o que postar */}
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-xs">Não sabia o que postar</p>
                  <p className="text-red-300/60 text-[10px]">Sem ideias de conteúdo</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 3: Não sabia como escrever */}
          <AnimatePresence>
            {scene >= 3 && (
              <motion.div
                className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <PenOff className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-xs">Não sabia como escrever</p>
                  <p className="text-red-300/60 text-[10px]">Textos não chamavam atenção</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 4: Poucos likes */}
          <AnimatePresence>
            {scene >= 4 && (
              <motion.div
                className="flex items-center gap-2 p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <ThumbsDown className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-xs">Poucos likes e engajamento</p>
                  <p className="text-orange-300/60 text-[10px]">Ninguém comentava</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 5: Vendas só de vizinhos */}
          <AnimatePresence>
            {scene >= 5 && (
              <motion.div
                className="flex items-center gap-2 p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-xs">Vendas só de vizinhos</p>
                  <p className="text-orange-300/60 text-[10px]">Dependia do boca a boca</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 6: Ciclo de desistência */}
          <AnimatePresence>
            {scene >= 6 && (
              <motion.div
                className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-xs">Ciclo de desistência</p>
                  <p className="text-red-300/60 text-[10px]">Criar → postar → ninguém ver → desistir</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========== CENA 7: Conclusão - Estagnada ========== */}
        <AnimatePresence>
          {scene >= 7 && (
            <motion.div
              className="mt-3 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600/30 to-rose-600/30 rounded-full border border-red-500/40"
                animate={{
                  boxShadow: ['0 0 10px rgba(239,68,68,0.2)', '0 0 25px rgba(239,68,68,0.4)', '0 0 10px rgba(239,68,68,0.2)']
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-red-200 font-bold text-sm">Loja estagnada há 3 anos</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator - inside content flow */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#ef4444' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[10px] text-red-300 font-medium">Diagnóstico</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProblemIdentifier;
