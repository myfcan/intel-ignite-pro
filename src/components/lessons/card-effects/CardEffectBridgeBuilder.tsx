'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Cpu, Sparkles, Link, Heart, TrendingUp, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { CardEffectProps } from './index';

const totalScenes = 11;

export const CardEffectBridgeBuilder: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<number>(0);
  const [bridgeProgress, setBridgeProgress] = useState(0);
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
    setBridgeProgress(0);
    setScene(1);
    
    for (let i = 2; i <= totalScenes; i++) {
      timersRef.current.push(setTimeout(() => {
        setScene(i);
        // Update bridge progress during scenes 3-5
        if (i === 3) setBridgeProgress(33);
        if (i === 4) setBridgeProgress(66);
        if (i === 5) setBridgeProgress(100);
      }, (i - 1) * sceneTime));
    }
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setBridgeProgress(0);
    }
    return () => clearTimers();
  }, [isActive, sceneTime]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        
        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-6) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 6 && (
            <motion.div
              className="flex flex-col items-center gap-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Título */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-4"
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Construtor de Pontes</h3>
                <p className="text-orange-300 text-sm">Conectando problemas a soluções</p>
              </motion.div>

              {/* Cena 2: Pessoas e I.A. */}
              {scene >= 2 && (
                <motion.div
                  className="relative w-full max-w-sm flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center mb-2">
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
                    </div>
                    <span className="text-xs text-orange-300 font-medium">Pessoas</span>
                    <span className="text-[10px] text-orange-400/70">com problemas</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
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

              {/* Cenas 3-5: Bridge progress */}
              {scene >= 3 && (
                <motion.div
                  className="w-full max-w-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${bridgeProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-center text-sm text-orange-300 mt-2">Construindo ponte...</p>
                </motion.div>
              )}

              {/* Cena 6: VOCÊ é a ponte */}
              {scene >= 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-400 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-orange-300" />
                  </div>
                  <span className="text-sm text-orange-300 font-bold mt-2">VOCÊ</span>
                  <span className="text-[10px] text-orange-400/70">a ponte</span>
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
              {/* Cena 7: Conexão estabelecida */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(34,197,94,0.3)', '0 0 60px rgba(34,197,94,0.6)', '0 0 30px rgba(34,197,94,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Link className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Conexão Estabelecida!</p>
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
                    { icon: Users, label: 'Pessoas', value: '∞' },
                    { icon: Zap, label: 'Soluções', value: '∞' },
                    { icon: Heart, label: 'Valor', value: '$$$' },
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
                        <p className="text-2xl font-bold text-orange-400">{stat.value}</p>
                        <p className="text-xs text-slate-400">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Cena 9: Trending */}
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
                    <TrendingUp className="w-20 h-20 text-green-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Oportunidade Escalável</p>
                  <p className="text-sm text-orange-300 mt-2">Conectar nunca foi tão valioso</p>
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
                    className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-white/80 mt-4 text-lg">Você é a Ponte</p>
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
                    className="p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(251,146,60,0.2)', '0 0 40px rgba(251,146,60,0.4)', '0 0 20px rgba(251,146,60,0.2)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-lg font-medium text-white">
                      Você é a <span className="text-orange-400 font-bold">ponte entre dois mundos</span>: pessoas com problemas e I.A. com soluções.
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
