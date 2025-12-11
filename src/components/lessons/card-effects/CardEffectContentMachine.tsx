'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Video, Instagram, Youtube, Layers, Zap, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectContentMachine - "Máquina de conteúdo com I.A."
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - esteira de produção
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - resultado
 */
export const CardEffectContentMachine: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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

  const contentTypes = [
    { id: 1, icon: Instagram, label: 'Posts', color: 'from-pink-500 to-purple-500' },
    { id: 2, icon: Youtube, label: 'Vídeos', color: 'from-red-500 to-rose-500' },
    { id: 3, icon: FileText, label: 'Artigos', color: 'from-blue-500 to-cyan-500' },
    { id: 4, icon: Image, label: 'Imagens', color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950/30">
      {/* Background industrial */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.2) 0%, transparent 50%),
              repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(251, 146, 60, 0.05) 50px, rgba(251, 146, 60, 0.05) 51px)
            `,
          }}
        />
      </div>

      {/* Engrenagens animadas */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-8 left-8 w-16 h-16 border-4 border-orange-500/20 rounded-full"
          animate={scene > 0 ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-2 bg-orange-500/20 rounded"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(24px)`,
              }}
            />
          ))}
        </motion.div>
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
                    className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Layers className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-lg font-bold text-orange-300">Máquina de Conteúdo</span>
                </div>
                <p className="text-sm text-slate-400">Produção em escala com I.A.</p>
              </motion.div>

              {/* Cena 2-5: Tipos de conteúdo aparecem */}
              <motion.div
                className="grid grid-cols-2 gap-3 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                {contentTypes.slice(0, Math.min(scene, 4)).map((type, i) => {
                  const Icon = type.icon;
                  return (
                    <motion.div
                      key={type.id}
                      className={`relative p-4 bg-gradient-to-br ${type.color} rounded-xl shadow-lg`}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: i * 0.15 * scale }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-white" />
                        <span className="text-sm text-white font-bold">{type.label}</span>
                      </div>
                      
                      {/* Contador */}
                      <motion.div
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: (i + 1) * 0.2 * scale }}
                      >
                        <span className="text-[10px] font-bold text-slate-800">∞</span>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Cena 6: Esteira animada */}
              {scene >= 6 && (
                <motion.div
                  className="w-full h-12 bg-slate-800/50 rounded-lg border border-orange-500/20 overflow-hidden relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(251, 146, 60, 0.1) 30px, rgba(251, 146, 60, 0.1) 32px)`,
                    }}
                    animate={{ backgroundPositionX: ['0px', '64px'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-orange-300">Produzindo...</span>
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
              {/* Cena 7: Grande ícone */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(251,146,60,0.3)', '0 0 60px rgba(251,146,60,0.6)', '0 0 30px rgba(251,146,60,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Layers className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Linha de Produção</p>
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
                    { label: 'Posts/dia', value: '30+' },
                    { label: 'Formatos', value: '10+' },
                    { label: 'Tempo salvo', value: '90%' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <p className="text-2xl font-bold text-orange-400">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 9: Crescimento */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp className="w-20 h-20 text-orange-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Escala Ilimitada</p>
                </motion.div>
              )}

              {/* Cena 10: Sparkles */}
              {scene === 10 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-20 h-20 text-amber-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Qualidade Consistente</p>
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
                  <p className="text-xl font-bold text-green-400 mt-4">Produção Ativa</p>
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
                    className="p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(251,146,60,0.2)', '0 0 40px rgba(251,146,60,0.4)', '0 0 20px rgba(251,146,60,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-orange-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white">
                      Uma <span className="text-orange-400 font-bold">linha de produção de conteúdo</span> que nunca para.
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
                backgroundColor: scene >= s ? '#fb923c' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
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
        <Layers className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Máquina de Conteúdo</span>
      </motion.div>
    </div>
  );
};

export default CardEffectContentMachine;
