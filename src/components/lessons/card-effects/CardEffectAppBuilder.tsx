'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Smartphone, Code, Layers, Rocket, CheckCircle, Zap, Monitor } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 36;

/**
 * CardEffectAppBuilder - "A I.A. que monta um app do zero"
 * 
 * AJUSTE X APLICADO - 12 Cenas (~36s total, 3s por cena)
 * 
 * FASE 1 (Cenas 1-6): Elementos empilhados - construção do app
 * FASE 2 (Cenas 7-12): Efeitos em tela limpa - resultado final
 */
export const CardEffectAppBuilder: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
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

  const codeBlocks = [
    { type: 'header', width: '90%', color: 'from-purple-500 to-indigo-500' },
    { type: 'nav', width: '60%', color: 'from-blue-400 to-cyan-400' },
    { type: 'hero', width: '85%', color: 'from-indigo-400 to-purple-400' },
    { type: 'button', width: '40%', color: 'from-pink-500 to-rose-500' },
    { type: 'list', width: '75%', color: 'from-cyan-400 to-blue-400' },
    { type: 'list', width: '70%', color: 'from-blue-400 to-indigo-400' },
    { type: 'card', width: '80%', color: 'from-purple-400 to-pink-400' },
    { type: 'footer', width: '65%', color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: scene > 0 ? 1 : 0.5 }}
        transition={{ duration: 0.8 }}
      />

      {/* Grid de fundo tech */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 20px 20px, 20px 20px',
          }}
        />
      </div>

      {/* Partículas de energia flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={scene > 0 ? {
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
              y: [0, -30],
            } : { opacity: 0 }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-4 sm:px-6 pt-8 pb-16">

        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-6) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 6 && (
            <motion.div 
              className="flex flex-col items-center gap-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Título e ícone de IA */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 * scale }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-lg font-bold text-white">I.A. + Código</span>
              </motion.div>

              {/* Cena 2: Smartphone aparece */}
              {scene >= 2 && (
                <motion.div
                  className="relative"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <div className="relative w-48 h-80 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-[2.5rem] p-2 shadow-2xl shadow-purple-900/30">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-10" />
                    <div className="relative w-full h-full bg-slate-950 rounded-[2rem] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
                      
                      {/* Blocos de código sendo construídos */}
                      <div className="relative pt-10 px-3 space-y-2">
                        {codeBlocks.slice(0, Math.min(scene, 6)).map((block, i) => (
                          <motion.div
                            key={i}
                            className={`h-4 bg-gradient-to-r ${block.color} rounded-sm`}
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ duration: 0.5 * scale, delay: i * 0.1 * scale }}
                            style={{ width: block.width, originX: 0 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cena 4-6: Descrições */}
              {scene >= 4 && (
                <motion.div
                  className="flex flex-wrap justify-center gap-2 mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 rounded-full border border-purple-500/30">
                    <Code className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300">Estrutura</span>
                  </div>
                  {scene >= 5 && (
                    <motion.div
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-blue-300">Interface</span>
                    </motion.div>
                  )}
                  {scene >= 6 && (
                    <motion.div
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 rounded-full border border-cyan-500/30"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-cyan-300">Código</span>
                    </motion.div>
                  )}
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
              {/* Cena 7: App Icon Grande */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 * scale }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(168,85,247,0.3)', '0 0 60px rgba(168,85,247,0.6)', '0 0 30px rgba(168,85,247,0.3)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <Smartphone className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">Seu App Pronto</p>
                </motion.div>
              )}

              {/* Cena 8: Pulsos de energia */}
              {scene === 8 && (
                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="w-32 h-32 rounded-full border-2 border-purple-500/50"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-16 h-16 text-purple-400" />
                  </motion.div>
                </motion.div>
              )}

              {/* Cena 9: Stats */}
              {scene === 9 && (
                <motion.div
                  className="grid grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 * scale }}
                >
                  {[
                    { label: 'Telas', value: '8+' },
                    { label: 'Funções', value: '15+' },
                    { label: 'Horas', value: '-80%' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 * scale }}
                    >
                      <p className="text-2xl font-bold text-purple-400">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Cena 10: Foguete */}
              {scene === 10 && (
                <motion.div
                  className="text-center"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="w-20 h-20 text-purple-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Pronto para Lançar</p>
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
                  <p className="text-xl font-bold text-green-400 mt-4">App Validado</p>
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
                    animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.2)', '0 0 40px rgba(139,92,246,0.4)', '0 0 20px rgba(139,92,246,0.2)'] }}
                    transition={{ duration: 2 * scale, repeat: Infinity }}
                  >
                    <p className="text-lg font-medium text-white">
                      O que antes exigia uma equipe técnica inteira, agora começa com um <span className="text-purple-400 font-bold">bom prompt</span>.
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
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-purple-300 font-medium">Criador de Apps</span>
      </motion.div>
    </div>
  );
};

export default CardEffectAppBuilder;
