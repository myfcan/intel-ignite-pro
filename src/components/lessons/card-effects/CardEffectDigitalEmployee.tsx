'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, FileText, CheckCircle, Bot, Clock, Zap, Users, TrendingUp, Heart } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectDigitalEmployee - "I.A. como funcionário digital"
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - dashboard e processamento
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - resultados
 */
export const CardEffectDigitalEmployee: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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

  const incomingItems = [
    { id: 1, icon: MessageCircle, type: 'Chat', color: 'bg-blue-500' },
    { id: 2, icon: Mail, type: 'Email', color: 'bg-pink-500' },
    { id: 3, icon: FileText, type: 'Formulário', color: 'bg-purple-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-4 sm:px-6 pt-8 pb-16">

        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-6) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 6 && (
            <motion.div 
              className="flex flex-col items-center gap-4 w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Robô Avatar */}
              <motion.div
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <motion.div
                  className="absolute inset-0 bg-cyan-500 rounded-2xl blur-xl"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Bot className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              {/* Cena 2: Dashboard Panel */}
              {scene >= 2 && (
                <motion.div
                  className="w-full bg-slate-900/80 rounded-xl border border-cyan-500/20 overflow-hidden"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 * scale }}
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-slate-400">Central de Operações</span>
                    </div>
                    <span className="text-[10px] text-cyan-400">Online 24/7</span>
                  </div>

                  {/* Cena 3-5: Items sendo processados */}
                  <div className="p-4 space-y-2">
                    {incomingItems.slice(0, Math.max(0, scene - 2)).map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.id}
                          className="flex items-center justify-between px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg"
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.2 * scale }}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-green-400">{item.type}</span>
                          </div>
                          <span className="text-[10px] text-green-400/60">Resolvido</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Cena 6: Badges */}
              {scene >= 6 && (
                <motion.div
                  className="flex flex-wrap justify-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-300">24/7</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-300">Automático</span>
                  </div>
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
              {/* Cena 7: Grande ícone Bot */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(6,182,212,0.3)', '0 0 60px rgba(6,182,212,0.6)', '0 0 30px rgba(6,182,212,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bot className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Funcionário Digital</p>
                </motion.div>
              )}

              {/* Cena 8: Stats de produtividade */}
              {scene === 8 && (
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {[
                    { icon: MessageCircle, label: 'Mensagens/dia', value: '500+' },
                    { icon: Mail, label: 'Emails/dia', value: '200+' },
                    { icon: FileText, label: 'Formulários', value: '100+' },
                    { icon: Clock, label: 'Horas salvas', value: '8h/dia' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.15 * scale, type: 'spring' }}
                      >
                        <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-slate-400">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Cena 9: Usuários felizes */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="flex justify-center gap-3 mb-4"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Users className="w-16 h-16 text-cyan-400" />
                  </motion.div>
                  <p className="text-lg font-bold text-white">Atendimento Escalável</p>
                  <p className="text-sm text-slate-400 mt-2">Sem contratar mais pessoas</p>
                </motion.div>
              )}

              {/* Cena 10: Tendência de crescimento */}
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
                  <p className="text-lg font-bold text-white mt-4">Produtividade 10x</p>
                </motion.div>
              )}

              {/* Cena 11: Coração */}
              {scene === 11 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="w-10 h-10 text-white fill-white" />
                  </motion.div>
                  <p className="text-white/80 mt-4 text-lg">Clientes Satisfeitos</p>
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
                    className="p-6 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(6,182,212,0.2)', '0 0 40px rgba(6,182,212,0.4)', '0 0 20px rgba(6,182,212,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <p className="text-lg font-medium text-white">
                      Tem gente ganhando dinheiro só configurando esses <span className="text-cyan-400 font-bold">funcionários digitais</span>.
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
                backgroundColor: scene >= s ? '#06b6d4' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <Bot className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] text-cyan-300 font-medium">Funcionário Digital</span>
      </motion.div>
    </div>
  );
};

export default CardEffectDigitalEmployee;
