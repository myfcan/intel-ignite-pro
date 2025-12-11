'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Film, Video, Clapperboard, Sparkles, CheckCircle, TrendingUp, Star } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectVideoStudio - "Vídeos criados com ajuda da I.A."
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - estúdio de edição
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - resultado
 */
export const CardEffectVideoStudio: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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

  const videoScenes = [
    { id: 1, label: 'Cena 1', color: 'from-blue-600 to-purple-600' },
    { id: 2, label: 'Cena 2', color: 'from-green-600 to-teal-600' },
    { id: 3, label: 'Cena 3', color: 'from-orange-600 to-red-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/30">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.2) 0%, transparent 40%)
            `,
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
              {/* Cena 1: Título */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 * scale }}
              >
                <div className="flex items-center gap-2 justify-center mb-2">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Video className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-lg font-bold text-red-300">Estúdio de Vídeo I.A.</span>
                </div>
                <p className="text-sm text-slate-400">Vídeos profissionais automatizados</p>
              </motion.div>

              {/* Cena 2: Player de vídeo */}
              {scene >= 2 && (
                <motion.div
                  className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 * scale }}
                >
                  {/* Barra superior */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border-b border-slate-700/50">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-[10px] text-slate-500 ml-2">Preview</span>
                  </div>

                  {/* Área de preview */}
                  <div className="relative h-32 flex items-center justify-center">
                    {videoScenes.slice(0, Math.min(scene - 1, 3)).map((vs, i) => (
                      <motion.div
                        key={vs.id}
                        className={`absolute inset-0 bg-gradient-to-br ${vs.color}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: scene - 2 === i ? 1 : 0 }}
                        transition={{ duration: 0.5 * scale }}
                      >
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 rounded text-[8px] text-white">
                          {vs.label}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Play button */}
                    <motion.div
                      className="relative z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="w-6 h-6 text-red-600 ml-1" fill="currentColor" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Cena 5-6: Timeline */}
              {scene >= 5 && (
                <motion.div
                  className="w-full h-10 bg-slate-800/80 rounded-lg border border-slate-700/50 overflow-hidden relative"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="absolute top-2 left-2 right-2 h-3 bg-slate-700/50 rounded">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded"
                      initial={{ width: '0%' }}
                      animate={{ width: scene >= 6 ? '70%' : '30%' }}
                      transition={{ duration: 1 * scale }}
                    />
                  </div>
                  <div className="absolute bottom-1 left-2 right-2 flex justify-between">
                    <span className="text-[8px] text-slate-500">00:00</span>
                    <span className="text-[8px] text-slate-500">01:30</span>
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
                    className="w-28 h-28 bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(239,68,68,0.3)', '0 0 60px rgba(239,68,68,0.6)', '0 0 30px rgba(239,68,68,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Film className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Vídeo Pronto</p>
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
                    { label: 'Cenas', value: '12+' },
                    { label: 'Minutos', value: '-80%' },
                    { label: 'Custo', value: '-90%' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <p className="text-2xl font-bold text-red-400">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 9: Clapperboard */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Clapperboard className="w-20 h-20 text-red-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Ação!</p>
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
                  <p className="text-lg font-bold text-white mt-4">Engajamento 5x</p>
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
                  <p className="text-xl font-bold text-green-400 mt-4">Renderizado</p>
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
                    className="p-6 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(239,68,68,0.2)', '0 0 40px rgba(239,68,68,0.4)', '0 0 20px rgba(239,68,68,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-red-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white">
                      I.A. criando <span className="text-red-400 font-bold">vídeos inteiros</span> — roteiro, cortes e edição.
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
                backgroundColor: scene >= s ? '#ef4444' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <Film className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[10px] text-red-300 font-medium">Estúdio de Vídeo</span>
      </motion.div>
    </div>
  );
};

export default CardEffectVideoStudio;
