'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Volume2, Waves, Radio, Sparkles, Mic, MessageSquare, Lightbulb, Target, TrendingUp, Award } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectAmplifierConcept - Visualiza o conceito de amplificação
 * 
 * AJUSTE X APLICADO:
 * Fase 1 (Cenas 1-5): Elementos empilhados - conceito visual inicial
 * Fase 2 (Cenas 6-11): Tela limpa com efeitos visuais únicos expandidos
 * 
 * Total: 11 cenas (~33s, 3s por cena)
 */
export const CardEffectAmplifierConcept: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 1; // Sem repetição com Ajuste X

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    // Fase 1: Elementos empilhados (cenas 1-5)
    setScene(1);
    timersRef.current.push(setTimeout(() => setScene(2), 3000));
    timersRef.current.push(setTimeout(() => setScene(3), 6000));
    timersRef.current.push(setTimeout(() => setScene(4), 9000));
    timersRef.current.push(setTimeout(() => setScene(5), 12000));
    
    // Fase 2: Tela limpa com efeitos expandidos (cenas 6-11)
    timersRef.current.push(setTimeout(() => setScene(6), 15000));  // Voz → Ideias
    timersRef.current.push(setTimeout(() => setScene(7), 18000));  // Ideias → Alcance
    timersRef.current.push(setTimeout(() => setScene(8), 21000));  // Alcance → Impacto
    timersRef.current.push(setTimeout(() => setScene(9), 24000));  // Impacto → Resultados
    timersRef.current.push(setTimeout(() => setScene(10), 27000)); // Resultados → Conquista
    timersRef.current.push(setTimeout(() => setScene(11), 30000)); // Mensagem final expandida
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  const totalScenes = 11;

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950">
      {/* Background waves - sempre visíveis */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
            style={{ top: `${20 + i * 15}%` }}
            animate={scene >= 3 ? {
              x: ['-100%', '100%'],
              opacity: [0, 0.5, 0],
            } : { opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Expanding circles for scenes 3-5 */}
      {scene >= 3 && scene <= 5 && [...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400/30"
          initial={{ width: 80, height: 80, opacity: 0 }}
          animate={{ width: 300 + i * 60, height: 300 + i * 60, opacity: [0, 0.5, 0] }}
          transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
        />
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8">

        {/* ===================== FASE 1: Elementos Empilhados (Cenas 1-5) ===================== */}
        <AnimatePresence mode="wait">
          {scene >= 1 && scene <= 5 && (
            <motion.div
              key="phase1"
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title */}
              <motion.h3
                className="text-xl sm:text-2xl font-bold text-white mb-6 text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                O Conceito de Amplificação
              </motion.h3>

              {/* Main visualization */}
              <div className="flex items-center gap-4 sm:gap-8">
                {/* Input */}
                {scene >= 1 && (
                  <motion.div
                    className="text-center"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                  >
                    <motion.div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2"
                      animate={scene >= 2 ? { scale: [1, 0.9, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 text-white/60" />
                    </motion.div>
                    <p className="text-xs text-white/50">Sua voz</p>
                    <p className="text-[10px] text-white/30 mt-0.5">pequena</p>
                  </motion.div>
                )}

                {/* Amplificador */}
                {scene >= 2 && (
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 150, duration: 0.8 }}
                  >
                    <motion.div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg"
                      animate={{
                        boxShadow: scene >= 3
                          ? ['0 0 20px rgba(6, 182, 212, 0.3)', '0 0 50px rgba(6, 182, 212, 0.6)', '0 0 20px rgba(6, 182, 212, 0.3)']
                          : '0 0 10px rgba(6, 182, 212, 0.2)'
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </motion.div>
                    <motion.p className="text-sm text-cyan-300 font-bold mt-2">I.A.</motion.p>
                  </motion.div>
                )}

                {/* Output */}
                {scene >= 4 && (
                  <motion.div
                    className="text-center"
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                  >
                    <motion.div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 flex items-center justify-center mb-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Waves className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" />
                    </motion.div>
                    <p className="text-xs text-cyan-300 font-bold">Amplificada</p>
                    <p className="text-[10px] text-cyan-400/70 mt-0.5">alcança mais</p>
                  </motion.div>
                )}
              </div>

              {/* Connection lines */}
              {scene >= 3 && scene < 5 && (
                <motion.div
                  className="flex items-center justify-center gap-2 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Radio className="w-4 h-4 text-cyan-400/60" />
                  <motion.div
                    className="flex gap-1"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.7, delay: i * 0.12, repeat: Infinity }}
                      />
                    ))}
                  </motion.div>
                  <Radio className="w-4 h-4 text-cyan-400/60" />
                </motion.div>
              )}

              {/* Mensagem cena 5 */}
              {scene === 5 && (
                <motion.div
                  className="mt-6 max-w-sm text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <motion.div
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/40"
                    animate={{
                      boxShadow: ['0 0 15px rgba(6, 182, 212, 0.2)', '0 0 30px rgba(6, 182, 212, 0.4)', '0 0 15px rgba(6, 182, 212, 0.2)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-200 font-medium text-sm">
                      A I.A. não substitui você, ela <span className="font-bold text-white">amplifica</span>!
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ===================== FASE 2: Tela Limpa - Efeitos Expandidos (Cenas 6-11) ===================== */}
          
          {/* Cena 6: Voz → Ideias (microfone gerando lâmpadas) */}
          {scene === 6 && (
            <motion.div
              key="scene6"
              className="flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Mic className="w-10 h-10 text-white" />
              </motion.div>
              
              <div className="flex gap-4 mb-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
                  >
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
              
              <motion.h3 
                className="text-xl sm:text-2xl font-bold text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Sua voz gera ideias
              </motion.h3>
              <motion.p 
                className="text-cyan-300/80 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                A I.A. transforma pensamentos em conceitos
              </motion.p>
            </motion.div>
          )}

          {/* Cena 7: Ideias → Alcance (alvo expandindo) */}
          {scene === 7 && (
            <motion.div
              key="scene7"
              className="flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative mb-6">
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Target className="w-12 h-12 text-cyan-400" />
                </motion.div>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/30"
                    initial={{ width: 96, height: 96, opacity: 0 }}
                    animate={{ 
                      width: 150 + i * 50, 
                      height: 150 + i * 50, 
                      opacity: [0, 0.5, 0] 
                    }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  />
                ))}
              </div>
              
              <motion.h3 
                className="text-xl sm:text-2xl font-bold text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Alcance multiplicado
              </motion.h3>
              <motion.p 
                className="text-cyan-300/80 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Uma ideia, infinitas possibilidades
              </motion.p>
            </motion.div>
          )}

          {/* Cena 8: Alcance → Impacto (ondas de impacto) */}
          {scene === 8 && (
            <motion.div
              key="scene8"
              className="flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative mb-6">
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.15, 1],
                    boxShadow: ['0 0 30px rgba(168, 85, 247, 0.3)', '0 0 60px rgba(168, 85, 247, 0.6)', '0 0 30px rgba(168, 85, 247, 0.3)']
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <MessageSquare className="w-10 h-10 text-white" />
                </motion.div>
                
                {/* Pulse waves */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-400/40"
                    initial={{ width: 80, height: 80, opacity: 0 }}
                    animate={{ 
                      width: 200 + i * 40, 
                      height: 200 + i * 40, 
                      opacity: [0, 0.6, 0] 
                    }}
                    transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
                  />
                ))}
              </div>
              
              <motion.h3 
                className="text-xl sm:text-2xl font-bold text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Impacto real
              </motion.h3>
              <motion.p 
                className="text-purple-300/80 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Sua mensagem ressoa mais longe
              </motion.p>
            </motion.div>
          )}

          {/* Cena 9: Impacto → Resultados (gráfico subindo) */}
          {scene === 9 && (
            <motion.div
              key="scene9"
              className="flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-end gap-3 mb-6 h-32">
                {[40, 60, 50, 80, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-10 sm:w-12 rounded-t-lg bg-gradient-to-t from-green-600 to-emerald-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: 'easeOut' }}
                  />
                ))}
              </div>
              
              <motion.div
                className="flex items-center gap-2 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <TrendingUp className="w-6 h-6 text-green-400" />
                <span className="text-2xl font-bold text-green-400">+250%</span>
              </motion.div>
              
              <motion.h3 
                className="text-xl sm:text-2xl font-bold text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Resultados exponenciais
              </motion.h3>
              <motion.p 
                className="text-green-300/80 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Menos esforço, mais resultado
              </motion.p>
            </motion.div>
          )}

          {/* Cena 10: Conquista (troféu com brilhos) */}
          {scene === 10 && (
            <motion.div
              key="scene10"
              className="flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative mb-6">
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-14 h-14 text-white" />
                </motion.div>
                
                {/* Sparkles around */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${50 + 45 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                      left: `${50 + 45 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0], 
                      opacity: [0, 1, 0] 
                    }}
                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </motion.div>
                ))}
              </div>
              
              <motion.h3 
                className="text-xl sm:text-2xl font-bold text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Você conquista mais
              </motion.h3>
              <motion.p 
                className="text-yellow-300/80 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Com a I.A. como sua aliada
              </motion.p>
            </motion.div>
          )}

          {/* Cena 11: Mensagem final expandida */}
          {scene === 11 && (
            <motion.div
              key="scene11"
              className="flex flex-col items-center justify-center text-center px-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6"
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: ['0 0 30px rgba(6, 182, 212, 0.3)', '0 0 60px rgba(6, 182, 212, 0.6)', '0 0 30px rgba(6, 182, 212, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h3 
                className="text-2xl sm:text-3xl font-bold text-white mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                A I.A. não substitui você
              </motion.h3>
              
              <motion.div
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full border border-cyan-400/50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <span className="text-lg sm:text-xl font-bold text-cyan-200">
                  Ela <span className="text-white">AMPLIFICA</span> você!
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: scene > 0 ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Zap className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] text-cyan-300 font-medium">Amplificador</span>
      </motion.div>

      {/* Progress indicator - inline no bottom */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[...Array(totalScenes)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: scene >= i + 1 ? '#06b6d4' : 'rgba(255,255,255,0.2)',
              scale: scene === i + 1 ? 1.3 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectAmplifierConcept;
