'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Check, X, Lightbulb, Target, Sparkles, CheckCircle, Brain } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectStrategicAdvisor - "Conselho estratégico de bolso"
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - cenários de decisão
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - resultado
 */
export const CardEffectStrategicAdvisor: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1);
    for (let i = 2; i <= 12; i++) {
      timersRef.current.push(setTimeout(() => setScene(i), (i - 1) * 3000 * scale));
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
  }, [isActive, scale]);

  const scenarios = [
    { id: 1, name: 'Conservador', growth: '+15%', color: 'from-blue-500 to-cyan-500', pros: ['Baixo risco'], cons: ['Lento'] },
    { id: 2, name: 'Realista', growth: '+35%', color: 'from-purple-500 to-indigo-500', pros: ['Equilibrado'], cons: ['Moderado'], recommended: true },
    { id: 3, name: 'Agressivo', growth: '+80%', color: 'from-orange-500 to-red-500', pros: ['Alto retorno'], cons: ['Risco alto'] },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-4 sm:px-6 pt-8 pb-16">

        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-6) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 6 && (
            <motion.div 
              className="flex flex-col items-center gap-4 w-full max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Título */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 * scale }}
              >
                <div className="flex items-center gap-2 justify-center mb-2">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-lg font-bold text-purple-300">Conselho Estratégico</span>
                </div>
                <p className="text-sm text-slate-400">Análise de cenários com I.A.</p>
              </motion.div>

              {/* Cena 2-4: Cenários aparecem */}
              <motion.div
                className="flex flex-col gap-2 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                {scenarios.slice(0, Math.min(scene, 3)).map((scenario, i) => (
                  <motion.div
                    key={scenario.id}
                    className={`relative p-3 bg-slate-800/50 rounded-xl border ${scenario.recommended && scene >= 5 ? 'border-purple-500/50' : 'border-slate-700/30'}`}
                    initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', delay: i * 0.2 * scale }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`px-2 py-0.5 bg-gradient-to-r ${scenario.color} rounded text-[10px] text-white font-bold`}>
                        {scenario.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-sm font-bold text-green-400">{scenario.growth}</span>
                      </div>
                    </div>
                    
                    {/* Prós e Contras */}
                    <div className="flex gap-4 text-[9px]">
                      <div className="flex items-center gap-1 text-green-400">
                        <Check className="w-3 h-3" />
                        {scenario.pros[0]}
                      </div>
                      <div className="flex items-center gap-1 text-red-400">
                        <X className="w-3 h-3" />
                        {scenario.cons[0]}
                      </div>
                    </div>
                    
                    {/* Badge recomendado */}
                    {scenario.recommended && scene >= 5 && (
                      <motion.div
                        className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-500 rounded-full text-[8px] text-white font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        Recomendado
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Cena 6: Highlight */}
              {scene >= 6 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Melhor escolha identificada</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== FASE 2: TELA LIMPA (Cenas 7-12) ========== */}
        <AnimatePresence>
          {scene >= 7 && (
            <motion.div 
              className="flex flex-col items-center justify-center h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 * scale }}
            >
              {/* Cena 7: Grande ícone */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(168,85,247,0.3)', '0 0 60px rgba(168,85,247,0.6)', '0 0 30px rgba(168,85,247,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Decisão Informada</p>
                </motion.div>
              )}

              {/* Cena 8: Stats */}
              {scene === 8 && (
                <motion.div
                  className="grid grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {[
                    { label: 'Cenários', value: '3+' },
                    { label: 'Riscos', value: 'Mapeados' },
                    { label: 'Decisão', value: 'Rápida' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <p className="text-lg font-bold text-purple-400">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 9: Alvo */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Target className="w-20 h-20 text-purple-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Objetivo Claro</p>
                </motion.div>
              )}

              {/* Cena 10: Crescimento */}
              {scene === 10 && (
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
                  <p className="text-lg font-bold text-white mt-4">Crescimento Estratégico</p>
                </motion.div>
              )}

              {/* Cena 11: Checkmark */}
              {scene === 11 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.3)', '0 0 40px rgba(34,197,94,0.6)', '0 0 20px rgba(34,197,94,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-green-400 mt-4">Caminho Definido</p>
                </motion.div>
              )}

              {/* Cena 12: Mensagem Final */}
              {scene === 12 && (
                <motion.div
                  className="text-center max-w-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 * scale }}
                >
                  <motion.div
                    className="p-6 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(168,85,247,0.2)', '0 0 40px rgba(168,85,247,0.4)', '0 0 20px rgba(168,85,247,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white">
                      Um <span className="text-purple-400 font-bold">conselho estratégico de bolso</span> para decisões importantes.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-1.5 mt-auto pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#a855f7' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <Brain className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Conselho Estratégico</span>
      </motion.div>
    </div>
  );
};

export default CardEffectStrategicAdvisor;
