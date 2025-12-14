'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Film, Music, FileText, Wand2, Sparkles, Zap, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { CardEffectProps } from './index';

const totalScenes = 11;

export const CardEffectMediaGenerator = ({ isActive = true, duration }: CardEffectProps) => {
  const [scene, setScene] = useState<number>(0);
  const [generatingType, setGeneratingType] = useState(0);
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
    setGeneratingType(0);
    
    for (let i = 2; i <= totalScenes; i++) {
      timersRef.current.push(setTimeout(() => {
        setScene(i);
        // Cycle through media types during scenes 3-5
        if (i >= 3 && i <= 5) {
          setGeneratingType(i - 3);
        }
      }, (i - 1) * sceneTime));
    }
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setGeneratingType(0);
    }
    return () => clearTimers();
  }, [isActive, sceneTime]);

  const mediaTypes = [
    { icon: FileText, name: 'Texto', color: '#3b82f6' },
    { icon: Image, name: 'Imagem', color: '#22c55e' },
    { icon: Film, name: 'Vídeo', color: '#a855f7' },
    { icon: Music, name: 'Áudio', color: '#f59e0b' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 p-4 sm:p-6">
      
      {/* Background glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)' }}
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
                className="text-center mb-3"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-3">
                  <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-300 text-xs font-medium">Gerador de Mídia</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  I.A. <span className="text-cyan-400">Cria</span> Qualquer Mídia
                </h2>
              </motion.div>

              {/* Cena 2: Prompt Input */}
              {scene >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-sm p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-white font-medium text-sm">Seu Prompt</span>
                  </div>
                </motion.div>
              )}

              {/* Cenas 3-6: Media Grid */}
              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-2 w-full max-w-sm"
                >
                  {mediaTypes.map((type, idx) => {
                    const Icon = type.icon;
                    const isGenerating = scene >= 3 && scene <= 5 && generatingType === idx;
                    const isComplete = scene >= 6;
                    
                    return (
                      <motion.div
                        key={idx}
                        className="p-3 rounded-xl border text-center"
                        style={{ 
                          backgroundColor: isComplete ? `${type.color}15` : 'rgba(255,255,255,0.02)',
                          borderColor: isGenerating || isComplete ? type.color : 'rgba(255,255,255,0.1)'
                        }}
                        animate={isGenerating ? { 
                          boxShadow: [`0 0 0px ${type.color}`, `0 0 20px ${type.color}`, `0 0 0px ${type.color}`]
                        } : {}}
                        transition={{ duration: 0.3, repeat: isGenerating ? Infinity : 0 }}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-1.5" style={{ color: isGenerating || isComplete ? type.color : '#6b7280' }} />
                        <p className="font-medium text-sm" style={{ color: isGenerating || isComplete ? type.color : '#9ca3af' }}>
                          {type.name}
                        </p>
                        {isComplete && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: type.color, color: 'white' }}
                          >
                            PRONTO!
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
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
              {/* Cena 7: Grande ícone */}
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
                    <Wand2 className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Geração Completa!</p>
                </motion.div>
              )}

              {/* Cena 8: Stats */}
              {scene === 8 && (
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {[
                    { icon: FileText, label: 'Textos', value: '∞' },
                    { icon: Image, label: 'Imagens', value: '∞' },
                    { icon: Film, label: 'Vídeos', value: '∞' },
                    { icon: Music, label: 'Áudios', value: '∞' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        className="text-center p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.15, type: 'spring' }}
                      >
                        <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-slate-400">{stat.label}</p>
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
                  <p className="text-lg font-bold text-white mt-4">Um Prompt</p>
                  <p className="text-sm text-cyan-300 mt-2">Infinitas possibilidades</p>
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
                  <p className="text-white/80 mt-4 text-lg">Poder de Criação</p>
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
                    className="p-6 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(6,182,212,0.2)', '0 0 40px rgba(6,182,212,0.4)', '0 0 20px rgba(6,182,212,0.2)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-lg font-medium text-white">
                      Você define <span className="text-cyan-400 font-bold">o que criar</span>, a I.A. executa em qualquer formato.
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
                backgroundColor: scene >= s + 1 ? '#06b6d4' : 'rgba(255,255,255,0.2)',
                scale: scene === s + 1 ? 1.3 : 1
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
        <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] text-cyan-300 font-medium">Gerador</span>
      </motion.div>
    </div>
  );
};
