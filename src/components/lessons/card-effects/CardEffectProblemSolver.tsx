'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Wand2, DollarSign, ArrowRight, Sparkles } from 'lucide-react';

interface CardEffectProblemSolverProps {
  isActive?: boolean;
}

export const CardEffectProblemSolver: React.FC<CardEffectProblemSolverProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => setScene(2), 1500),
      setTimeout(() => setScene(3), 3500),
      setTimeout(() => setScene(4), 5500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-rose-900/20 to-slate-900 border border-rose-500/30">
      {/* Partículas de transformação */}
      <AnimatePresence>
        {scene >= 2 && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-rose-400"
                initial={{ 
                  opacity: 0,
                  x: '50%',
                  y: '50%',
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  x: `${30 + Math.random() * 40}%`,
                  y: `${20 + Math.random() * 60}%`,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h3 className="text-base font-bold text-white mb-1">Solucionador</h3>
          <p className="text-[10px] text-rose-300">Transforme problemas em renda</p>
        </motion.div>

        {/* Fluxo de transformação */}
        <div className="flex items-center gap-2 w-full max-w-xs justify-center">
          {/* Problema */}
          <motion.div
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              scene >= 1 ? 'bg-red-500/20 border border-red-400/40' : 'bg-slate-800/30'
            }`}
            animate={{
              scale: scene === 1 ? 1.05 : 1,
              opacity: scene >= 3 ? 0.5 : 1,
            }}
          >
            <HelpCircle className="w-8 h-8 text-red-400 mb-1" />
            <span className="text-[9px] text-red-300">Problema</span>
            <span className="text-[7px] text-red-400/70">"Preciso de..."</span>
          </motion.div>

          {/* Seta + Varinha */}
          <motion.div
            className="flex flex-col items-center"
            animate={{
              scale: scene === 2 ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: scene === 2 ? Infinity : 0 }}
          >
            <Wand2 className={`w-5 h-5 ${scene >= 2 ? 'text-rose-400' : 'text-slate-600'}`} />
            <ArrowRight className={`w-4 h-4 ${scene >= 2 ? 'text-rose-400' : 'text-slate-600'}`} />
          </motion.div>

          {/* Solução */}
          <motion.div
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              scene >= 3 ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-slate-800/30'
            }`}
            animate={{
              scale: scene === 3 ? 1.05 : 1,
            }}
          >
            <motion.div
              animate={{
                rotate: scene >= 3 ? [0, 10, -10, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className={`w-8 h-8 ${scene >= 3 ? 'text-emerald-400' : 'text-slate-600'} mb-1`} />
            </motion.div>
            <span className={`text-[9px] ${scene >= 3 ? 'text-emerald-300' : 'text-slate-500'}`}>Solução</span>
            <span className={`text-[7px] ${scene >= 3 ? 'text-emerald-400/70' : 'text-slate-600'}`}>Com I.A.</span>
          </motion.div>
        </div>

        {/* Exemplos de transformação */}
        <motion.div
          className="w-full max-w-xs mt-4 space-y-1.5"
          animate={{ opacity: scene >= 2 ? 1 : 0.3 }}
        >
          {[
            { problem: '"Preciso de posts"', solution: 'Pacote de conteúdo' },
            { problem: '"Currículo urgente"', solution: 'CV profissional' },
            { problem: '"Comunicados"', solution: 'Templates prontos' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: scene >= 2 ? 1 : 0.3,
                x: 0 
              }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center justify-between text-[9px] bg-slate-800/30 rounded-lg px-2 py-1"
            >
              <span className="text-red-300">{item.problem}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-emerald-300">{item.solution}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Resultado */}
        <AnimatePresence>
          {scene === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-3 flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-lg px-4 py-2"
            >
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-emerald-300 font-bold">= R$ 100</p>
                <p className="text-[8px] text-emerald-400/70">Por problema resolvido</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#f43f5e' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-3 right-3 flex items-center gap-1 bg-rose-500/20 border border-rose-400/30 rounded-full px-2 py-0.5"
      >
        <Wand2 className="w-3 h-3 text-rose-400" />
        <span className="text-[9px] text-rose-300 font-medium">Mágica</span>
      </motion.div>
    </div>
  );
};

export default CardEffectProblemSolver;
