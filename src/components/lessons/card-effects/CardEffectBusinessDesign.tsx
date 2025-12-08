'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Target, Users, Lightbulb, Rocket, Star, TrendingUp, Sparkles, Heart } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectBusinessDesign - "I.A. que ajuda a montar um negócio"
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - canvas de negócio
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - resultado
 */
export const CardEffectBusinessDesign: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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

  const postits = [
    { id: 1, label: 'Problema', icon: Target, color: 'from-red-400 to-rose-500' },
    { id: 2, label: 'Público', icon: Users, color: 'from-blue-400 to-cyan-500' },
    { id: 3, label: 'Solução', icon: Lightbulb, color: 'from-green-400 to-emerald-500' },
    { id: 4, label: 'Oferta', icon: Star, color: 'from-purple-400 to-indigo-500' },
    { id: 5, label: 'Diferencial', icon: Rocket, color: 'from-orange-400 to-amber-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30">
      {/* Background - mesa de estratégia */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
              repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(251, 191, 36, 0.03) 40px, rgba(251, 191, 36, 0.03) 41px),
              repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(251, 191, 36, 0.03) 40px, rgba(251, 191, 36, 0.03) 41px)
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
                <p className="text-lg font-bold text-amber-300">Business Model Canvas</p>
                <p className="text-sm text-slate-400 mt-1">Estruturando sua ideia</p>
              </motion.div>

              {/* Cena 2-6: Post-its aparecem */}
              <motion.div
                className="grid grid-cols-3 gap-3 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                {postits.slice(0, Math.min(scene, 5)).map((postit, i) => {
                  const Icon = postit.icon;
                  return (
                    <motion.div
                      key={postit.id}
                      className={`relative p-3 bg-gradient-to-br ${postit.color} rounded-lg shadow-lg ${i === 2 ? 'col-span-3' : ''}`}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: i * 0.15 * scale }}
                    >
                      {/* Fita adesiva */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-yellow-200/60 rounded-sm" />
                      
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-sm text-white font-bold">{postit.label}</span>
                      </div>
                      
                      {scene >= postit.id + 1 && (
                        <motion.div
                          className="absolute -right-1 -bottom-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          <span className="text-[10px] font-bold text-slate-800">{postit.id}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Cena 6: Badge pronto */}
              {scene >= 6 && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Canvas estruturado</span>
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
              {/* Cena 7: Grande ícone Rocket */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(251,191,36,0.3)', '0 0 60px rgba(251,191,36,0.6)', '0 0 30px rgba(251,191,36,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Negócio Estruturado</p>
                </motion.div>
              )}

              {/* Cena 8: Etapas de validação */}
              {scene === 8 && (
                <motion.div
                  className="flex flex-col gap-3 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {['Ideia validada', 'Público mapeado', 'Plano de lançamento'].map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 rounded-xl border border-amber-500/30"
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      <span className="text-white/90 text-sm">{item}</span>
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
                    <TrendingUp className="w-20 h-20 text-amber-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Pronto para Crescer</p>
                </motion.div>
              )}

              {/* Cena 10: Estrelas */}
              {scene === 10 && (
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
                        <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xl font-bold text-white">Ideia 5 Estrelas</p>
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
                  <p className="text-white/80 mt-4 text-lg">Sua Paixão, Seu Negócio</p>
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
                    className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(251,191,36,0.2)', '0 0 40px rgba(251,191,36,0.4)', '0 0 20px rgba(251,191,36,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white">
                      Sair do <span className="text-amber-400 font-bold">"não sei por onde começar"</span> para um rascunho de negócio em poucas horas.
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
                backgroundColor: scene >= s ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
      >
        <Rocket className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] text-amber-300 font-medium">Design de Negócio</span>
      </motion.div>
    </div>
  );
};

export default CardEffectBusinessDesign;
