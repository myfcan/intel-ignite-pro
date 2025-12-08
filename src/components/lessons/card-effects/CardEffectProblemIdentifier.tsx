'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Facebook, HelpCircle, PenOff, Users, TrendingDown, XCircle, Eye, ThumbsDown, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectProblemIdentifier - O problema da Maria com vendas online
 *
 * 10 Cenas progressivas (~30s total, 3s por cena):
 * 1. Instagram e Facebook aparecendo
 * 2. "Não sabia o que postar"
 * 3. "Não sabia como escrever"
 * 4. "Poucos likes e engajamento"
 * 5. "Vendas só de vizinhos"
 * 6. "Ciclo de desistência"
 * 7. "Tempo perdido" - NOVO
 * 8. "Dinheiro investido sem retorno" - NOVO
 * 9. "Frustração acumulada" - NOVO
 * 10. "Estagnada há 3 anos"
 *
 * Roda 2x automaticamente
 */
export const CardEffectProblemIdentifier: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(0);
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
    timersRef.current.push(setTimeout(() => setScene(7), 18000)); // Tempo perdido
    timersRef.current.push(setTimeout(() => setScene(8), 21000)); // Dinheiro sem retorno
    timersRef.current.push(setTimeout(() => setScene(9), 24000)); // Frustração
    timersRef.current.push(setTimeout(() => setScene(10), 27000)); // Estagnada

    // Loop logic
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 30000));
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
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-red-950/50 to-slate-950">
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

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-4 sm:px-6 pt-4 sm:pt-6 pb-16">

        {/* ========== CENA 1: Social Media Icons ========== */}
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="flex gap-3 mb-3"
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                  <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                {scene >= 2 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                  <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                {scene >= 2 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
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
              className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              O Desafio Digital
            </motion.h3>
          )}
        </AnimatePresence>

        {/* ========== CENAS 2-6: Problem Cards ========== */}
        <div className="space-y-1.5 sm:space-y-2 w-full max-w-xs">
          {/* Cena 2: Não sabia o que postar */}
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                className="flex items-center gap-2 p-2 sm:p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-[11px] sm:text-xs truncate">Não sabia o que postar</p>
                  <p className="text-red-300/60 text-[9px] sm:text-[10px] truncate">Sem ideias de conteúdo</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 3: Não sabia como escrever */}
          <AnimatePresence>
            {scene >= 3 && (
              <motion.div
                className="flex items-center gap-2 p-2 sm:p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <PenOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-[11px] sm:text-xs truncate">Não sabia como escrever</p>
                  <p className="text-red-300/60 text-[9px] sm:text-[10px] truncate">Textos não chamavam atenção</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 4: Poucos likes */}
          <AnimatePresence>
            {scene >= 4 && (
              <motion.div
                className="flex items-center gap-2 p-2 sm:p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-[11px] sm:text-xs truncate">Poucos likes e engajamento</p>
                  <p className="text-orange-300/60 text-[9px] sm:text-[10px] truncate">Ninguém comentava</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 5: Vendas só de vizinhos */}
          <AnimatePresence>
            {scene >= 5 && (
              <motion.div
                className="flex items-center gap-2 p-2 sm:p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-[11px] sm:text-xs truncate">Vendas só de vizinhos</p>
                  <p className="text-orange-300/60 text-[9px] sm:text-[10px] truncate">Dependia do boca a boca</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cena 6: Ciclo de desistência */}
          <AnimatePresence>
            {scene >= 6 && (
              <motion.div
                className="flex items-center gap-2 p-2 sm:p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, duration: 0.8 }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-[11px] sm:text-xs truncate">Ciclo de desistência</p>
                  <p className="text-red-300/60 text-[9px] sm:text-[10px] truncate">Criar → postar → ninguém ver</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========== CENA 7-9: Novos efeitos visuais diferentes ========== */}
        <AnimatePresence>
          {scene >= 7 && scene < 10 && (
            <motion.div
              className="mt-3 sm:mt-4 w-full max-w-xs"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Cena 7: Tempo perdido - Relógio animado */}
              {scene === 7 && (
                <motion.div
                  className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl"
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.8, type: 'spring' }}
                >
                  <motion.div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-500/20 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm sm:text-base">Horas e horas perdidas</p>
                    <motion.p 
                      className="text-purple-300/70 text-xs sm:text-sm"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Tentando sem direção
                    </motion.p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-purple-400"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Cena 8: Dinheiro investido sem retorno - Moedas caindo */}
              {scene === 8 && (
                <motion.div
                  className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 border border-amber-500/30 rounded-xl relative overflow-hidden"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, type: 'spring' }}
                >
                  {/* Moedas caindo */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-500/60"
                      style={{ left: `${15 + i * 18}%`, top: -20 }}
                      animate={{
                        y: [0, 200],
                        opacity: [1, 0],
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                  ))}
                  <motion.div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/20 flex items-center justify-center z-10"
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                  </motion.div>
                  <div className="text-center z-10">
                    <p className="text-white font-bold text-sm sm:text-base">Dinheiro sem retorno</p>
                    <motion.p 
                      className="text-amber-300/70 text-xs sm:text-sm"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Investimento desperdiçado
                    </motion.p>
                  </div>
                </motion.div>
              )}

              {/* Cena 9: Frustração acumulada - Alertas pulsando */}
              {scene === 9 && (
                <motion.div
                  className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-gradient-to-br from-rose-900/40 to-red-900/40 border border-rose-500/30 rounded-xl"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                >
                  <div className="relative">
                    <motion.div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-500/20 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(244, 63, 94, 0.4)',
                          '0 0 0 15px rgba(244, 63, 94, 0)',
                          '0 0 0 0 rgba(244, 63, 94, 0)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" />
                    </motion.div>
                    {/* Mini alertas orbitando */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-rose-400/60"
                        style={{
                          top: '50%',
                          left: '50%',
                        }}
                        animate={{
                          x: [0, Math.cos(i * 2.1) * 35, 0],
                          y: [0, Math.sin(i * 2.1) * 35, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.4,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm sm:text-base">Frustração acumulada</p>
                    <motion.p 
                      className="text-rose-300/70 text-xs sm:text-sm"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Vontade de desistir
                    </motion.p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== CENA 10: Conclusão - Estagnada ========== */}
        <AnimatePresence>
          {scene >= 10 && (
            <motion.div
              className="mt-3 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-600/30 to-rose-600/30 rounded-full border border-red-500/40"
                animate={{
                  boxShadow: ['0 0 10px rgba(239,68,68,0.2)', '0 0 25px rgba(239,68,68,0.4)', '0 0 10px rgba(239,68,68,0.2)']
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                <span className="text-red-200 font-bold text-xs sm:text-sm">Loja estagnada há 3 anos</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator - inside content flow */}
        <div className="flex gap-1.5 sm:gap-2 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
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
        className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/20 border border-red-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
        <span className="text-[9px] sm:text-[10px] text-red-300 font-medium">Diagnóstico</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProblemIdentifier;
