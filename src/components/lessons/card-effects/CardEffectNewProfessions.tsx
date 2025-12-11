'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Rocket, Sparkles, Settings, BookOpen, Cpu, Star, TrendingUp, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectNewProfessions - "Novas profissões com I.A."
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - profissões emergentes
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - foguete e celebração
 */
export const CardEffectNewProfessions: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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

  const professions = [
    { id: 1, label: 'Configurador de Agentes', icon: Settings, color: 'from-blue-500 to-cyan-500' },
    { id: 2, label: 'Consultor de Automações', icon: Cpu, color: 'from-purple-500 to-indigo-500' },
    { id: 3, label: 'Criador de Cursos com I.A.', icon: BookOpen, color: 'from-pink-500 to-rose-500' },
    { id: 4, label: 'Especialista em Prompt', icon: Sparkles, color: 'from-orange-500 to-amber-500' },
  ];

  const confettiColors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#22c55e', '#eab308'];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/30">
      {/* Estrelas de fundo */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={scene > 0 ? {
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            } : { opacity: 0.2 }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
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
                    className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-lg font-bold text-rose-300">Novas Profissões</span>
                </div>
                <p className="text-sm text-slate-400">Carreiras do futuro com I.A.</p>
              </motion.div>

              {/* Cena 2-5: Profissões aparecem */}
              <motion.div
                className="grid grid-cols-2 gap-3 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                {professions.slice(0, Math.min(scene, 4)).map((prof, i) => {
                  const Icon = prof.icon;
                  return (
                    <motion.div
                      key={prof.id}
                      className="relative"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', delay: i * 0.2 * scale }}
                    >
                      {/* Silhueta */}
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-16 bg-gradient-to-b from-slate-600/80 to-slate-800/80 rounded-t-full flex items-center justify-center mb-2">
                          <User className="w-6 h-6 text-white/50" />
                        </div>
                        
                        {/* Badge de profissão */}
                        <motion.div
                          className={`px-2 py-1 bg-gradient-to-r ${prof.color} rounded-lg backdrop-blur-sm`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: (i + 1) * 0.15 * scale }}
                        >
                          <div className="flex items-center gap-1">
                            <Icon className="w-3 h-3 text-white" />
                            <span className="text-[8px] text-white font-medium">{prof.label}</span>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Cena 6: Foguete pequeno */}
              {scene >= 6 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 border border-rose-500/40 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <Rocket className="w-4 h-4 text-rose-400" />
                  <span className="text-sm text-rose-300">Novas oportunidades</span>
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
              {/* Cena 7: Grande foguete */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ 
                      boxShadow: ['0 0 30px rgba(244,63,94,0.3)', '0 0 60px rgba(244,63,94,0.6)', '0 0 30px rgba(244,63,94,0.3)'],
                      y: [0, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Decolando!</p>
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
                    { label: 'Novas carreiras', value: '100+' },
                    { label: 'Demanda', value: 'Alta' },
                    { label: 'Mercado', value: 'Global' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-rose-500/10 rounded-xl border border-rose-500/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <p className="text-lg font-bold text-rose-400">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 9: Estrelas */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex justify-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1 * scale, type: 'spring' }}
                      >
                        <Star className="w-10 h-10 text-rose-400 fill-rose-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-white">Oportunidades 5 Estrelas</p>
                </motion.div>
              )}

              {/* Cena 10: Crescimento */}
              {scene === 10 && (
                <motion.div
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp className="w-20 h-20 text-green-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Mercado em Expansão</p>
                </motion.div>
              )}

              {/* Cena 11: Confetti + Checkmark */}
              {scene === 11 && (
                <motion.div
                  className="text-center relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  {/* Confetti */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: confettiColors[i % confettiColors.length],
                        left: '50%',
                        top: '50%',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0.5],
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
                      }}
                      transition={{ duration: 1.5, delay: i * 0.05 }}
                    />
                  ))}
                  
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
                    animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.3)', '0 0 40px rgba(34,197,94,0.6)', '0 0 20px rgba(34,197,94,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-green-400 mt-4">Futuro Garantido</p>
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
                    className="p-6 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(244,63,94,0.2)', '0 0 40px rgba(244,63,94,0.4)', '0 0 20px rgba(244,63,94,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-rose-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white">
                      A I.A. <span className="text-rose-400 font-bold">cria novas profissões</span>. Quem aprende agora escolhe onde quer estar.
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
                backgroundColor: scene >= s ? '#f43f5e' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 border border-rose-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <Star className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-[10px] text-rose-300 font-medium">Novas Profissões</span>
      </motion.div>
    </div>
  );
};

export default CardEffectNewProfessions;
