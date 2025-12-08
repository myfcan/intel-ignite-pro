'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, FileText, Highlighter, PenTool, Layers, Star, Heart, Sparkles, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectContentCreator - "A I.A. como coautora de livros e cursos"
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - criação de conteúdo
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - resultado
 */
export const CardEffectContentCreator: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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
    { id: 1, label: 'Sumário', icon: Layers, color: 'from-blue-500 to-cyan-500' },
    { id: 2, label: 'Capítulos', icon: BookOpen, color: 'from-purple-500 to-indigo-500' },
    { id: 3, label: 'Exemplos', icon: PenTool, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)
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
                <p className="text-lg font-bold text-purple-300">Coautor de Conteúdo</p>
                <p className="text-sm text-slate-400 mt-1">E-books, cursos e manuais</p>
              </motion.div>

              {/* Cena 2-4: Cards de conteúdo */}
              <motion.div
                className="flex justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 * scale }}
              >
                {contentTypes.slice(0, Math.min(scene, 3)).map((type, i) => {
                  const Icon = type.icon;
                  return (
                    <motion.div
                      key={type.id}
                      className={`relative p-4 bg-gradient-to-b ${type.color} rounded-lg shadow-xl text-center`}
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', delay: i * 0.2 * scale }}
                    >
                      <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                      <span className="text-xs text-white font-bold">{type.label}</span>
                      
                      {/* Keywords */}
                      {scene >= type.id + 2 && (
                        <motion.div
                          className="mt-2 space-y-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {['Aula 1', 'Conceito', 'Prática'].slice(0, type.id).map((kw, ki) => (
                            <motion.div
                              key={ki}
                              className="text-[8px] text-white/80 bg-white/20 rounded px-1"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: ki * 0.2 * scale }}
                            >
                              {kw}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Cena 5: Livro fechado */}
              {scene >= 5 && (
                <motion.div
                  className="relative"
                  initial={{ scale: 0, rotateY: 90 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ type: 'spring' }}
                >
                  <div className="relative w-24 h-32 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-r-lg shadow-2xl">
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-purple-800 to-purple-600 rounded-l-sm" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <BookOpen className="w-6 h-6 text-white/80 mb-1" />
                      <span className="text-[10px] text-white/90 font-bold text-center">Seu Curso</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cena 6: Player de vídeo */}
              {scene >= 6 && (
                <motion.div
                  className="relative w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl"
                  initial={{ scale: 0, x: 50 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: 'spring' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-slate-900 flex items-center justify-center">
                    <motion.div
                      className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="w-5 h-5 text-purple-600 ml-0.5" fill="currentColor" />
                    </motion.div>
                  </div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400">Também em vídeo</span>
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
              {/* Cena 7: Grande ícone BookOpen */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(168,85,247,0.3)', '0 0 60px rgba(168,85,247,0.6)', '0 0 30px rgba(168,85,247,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BookOpen className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Conteúdo Pronto</p>
                </motion.div>
              )}

              {/* Cena 8: Tipos de conteúdo */}
              {scene === 8 && (
                <motion.div
                  className="flex flex-col gap-3 max-w-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {['E-books prontos', 'Cursos estruturados', 'Manuais completos'].map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3 px-4 py-3 bg-purple-500/10 rounded-xl border border-purple-500/30"
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                      <span className="text-white/90 text-sm">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 9: Highlighter */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Highlighter className="w-20 h-20 text-yellow-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Destaques Automáticos</p>
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
                        <Star className="w-10 h-10 text-purple-400 fill-purple-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xl font-bold text-white">Autoridade Instantânea</p>
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
                  <p className="text-white/80 mt-4 text-lg">Conhecimento Compartilhado</p>
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
                    className="p-6 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(168,85,247,0.2)', '0 0 40px rgba(168,85,247,0.4)', '0 0 20px rgba(168,85,247,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-3" />
                    <p className="text-lg font-medium text-white">
                      Construir <span className="text-purple-400 font-bold">autoridade</span> muito mais rápido com e-books, manuais e cursos.
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
        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Coautor de Conteúdo</span>
      </motion.div>
    </div>
  );
};

export default CardEffectContentCreator;
