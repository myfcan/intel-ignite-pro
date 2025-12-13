'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Puzzle, Sparkles, Zap, Layers, Target, CheckCircle, Lightbulb } from 'lucide-react';
import { CardEffectProps } from './index';

const totalScenes = 11;

export const CardEffectRecombinationEngine = ({ isActive = true, duration }: CardEffectProps) => {
  const [scene, setScene] = useState<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const sceneTime = useMemo(() => {
    const effectiveDuration = duration && duration > 0 ? duration : 33;
    return (effectiveDuration * 1000) / totalScenes;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1);
    
    for (let i = 2; i <= totalScenes; i++) {
      timersRef.current.push(setTimeout(() => setScene(i), (i - 1) * sceneTime));
    }
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
    }
    return () => clearTimers();
  }, [isActive, sceneTime]);

  const pieces = [
    { text: 'Estilo', color: '#3b82f6' },
    { text: 'Tom', color: '#22c55e' },
    { text: 'Contexto', color: '#a855f7' },
    { text: 'Formato', color: '#f59e0b' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950 p-4 sm:p-6">
      
      {/* Background glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start pt-8 pb-16">

        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-6) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 6 && (
            <motion.div
              className="flex flex-col items-center gap-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Header */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 mb-3">
                  <Shuffle className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 text-sm font-medium">Motor de Recombinação</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  I.A. <span className="text-orange-400">Recombina</span> Padrões
                </h2>
              </motion.div>

              {/* Cenas 2-5: Peças */}
              {scene >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-3 justify-center"
                >
                  {pieces.slice(0, Math.min(scene - 1, 4)).map((piece, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.15 }}
                      className="px-4 py-2 rounded-lg border flex items-center gap-2"
                      style={{ 
                        backgroundColor: `${piece.color}20`,
                        borderColor: piece.color
                      }}
                    >
                      <Puzzle className="w-4 h-4" style={{ color: piece.color }} />
                      <span className="font-medium" style={{ color: piece.color }}>{piece.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 6: Processing */}
              {scene >= 6 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center mt-4"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/30 to-rose-500/30 flex items-center justify-center border border-orange-500/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Shuffle className="w-8 h-8 text-orange-400" />
                  </motion.div>
                  <p className="text-orange-300 text-sm mt-3">Recombinando padrões...</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== FASE 2: TELA LIMPA (Cenas 7-11) ========== */}
        <AnimatePresence>
          {scene >= 7 && (
            <motion.div
              className="flex flex-col items-center justify-center h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Cena 7: Novo Conteúdo */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(251,146,60,0.3)', '0 0 60px rgba(251,146,60,0.6)', '0 0 30px rgba(251,146,60,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Novo Conteúdo!</p>
                  <p className="text-orange-300 text-sm">Único e original</p>
                </motion.div>
              )}

              {/* Cena 8: Stats */}
              {scene === 8 && (
                <motion.div
                  className="grid grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {[
                    { icon: Layers, label: 'Padrões', value: '4' },
                    { icon: Zap, label: 'Combinação', value: '∞' },
                    { icon: Target, label: 'Original', value: '100%' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/30"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2 }}
                      >
                        <Icon className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                        <p className="text-xl font-bold text-orange-400">{stat.value}</p>
                        <p className="text-xs text-slate-400">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Cena 9: Lightbulb */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Lightbulb className="w-20 h-20 text-yellow-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">I.A. não copia</p>
                  <p className="text-sm text-orange-300 mt-2">Ela RECOMBINA de forma criativa</p>
                </motion.div>
              )}

              {/* Cena 10: Checkmark */}
              {scene === 10 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-white/80 mt-4 text-lg">Criação Original</p>
                </motion.div>
              )}

              {/* Cena 11: Mensagem Final */}
              {scene === 11 && (
                <motion.div
                  className="text-center max-w-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div
                    className="p-6 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(251,146,60,0.2)', '0 0 40px rgba(251,146,60,0.4)', '0 0 20px rgba(251,146,60,0.2)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-lg font-medium text-white">
                      A I.A. <span className="text-orange-400 font-bold">mistura padrões</span> de forma nova e criativa para criar algo único.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-1.5 mt-auto pt-4">
          {Array.from({ length: totalScenes }).map((_, s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s + 1 ? '#f97316' : 'rgba(255,255,255,0.2)',
                scale: scene === s + 1 ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <Shuffle className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Recombinação</span>
      </motion.div>
    </div>
  );
};
