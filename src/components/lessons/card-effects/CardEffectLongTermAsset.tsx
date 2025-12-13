'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Users, DollarSign, Sparkles, Target, BarChart3, Award, Zap } from 'lucide-react';
import { CardEffectProps } from './types';

const totalScenes = 11;

export function CardEffectLongTermAsset({ isActive = true, duration }: CardEffectProps) {
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

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Background glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)' }}
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
              {/* Cena 1: Ícone principal */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="mb-3"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </motion.div>

              {/* Cena 2: Título */}
              {scene >= 2 && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3"
                >
                  Ativo de Longo Prazo
                </motion.h3>
              )}

              {/* Cenas 3-4: Métricas de crescimento */}
              {scene >= 3 && (
                <div className="flex items-center gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Anos</span>
                  </motion.div>

                  {scene >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1" />
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">+1k</span>
                    </motion.div>
                  )}

                  {scene >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1" />
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Renda</span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Cena 6: Linha de crescimento */}
              {scene >= 6 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-4 w-40 h-1.5 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full origin-left"
                />
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
              {/* Cena 7: Grande ícone de sucesso */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(16,185,129,0.3)', '0 0 60px rgba(16,185,129,0.6)', '0 0 30px rgba(16,185,129,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BarChart3 className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-4">Crescimento Contínuo</p>
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
                    { icon: Clock, label: 'Tempo', value: 'Anos' },
                    { icon: Target, label: 'Alcance', value: '10x' },
                    { icon: DollarSign, label: 'Retorno', value: '∞' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2 }}
                      >
                        <Icon className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xl font-bold text-emerald-600">{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Cena 9: Award */}
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
                    <Award className="w-20 h-20 text-emerald-500 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-4">Autoridade Construída</p>
                  <p className="text-sm text-emerald-600 mt-2">Conteúdo que trabalha por você</p>
                </motion.div>
              )}

              {/* Cena 10: Sparkles */}
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
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-emerald-600 mt-4 text-lg">Valor Composto</p>
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
                    className="p-6 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(16,185,129,0.2)', '0 0 40px rgba(16,185,129,0.4)', '0 0 20px rgba(16,185,129,0.2)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-lg font-medium text-emerald-800 dark:text-emerald-300">
                      Conteúdo profundo é um <span className="text-emerald-600 font-bold">ativo de longo prazo</span> que trabalha por você por anos.
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
                backgroundColor: scene >= s + 1 ? '#10b981' : 'rgba(0,0,0,0.1)',
                scale: scene === s + 1 ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] text-emerald-600 font-medium">Ativo</span>
      </motion.div>
    </div>
  );
}
