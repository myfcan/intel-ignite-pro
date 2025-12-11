'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * 🎯 OBJECTIVE FOCUS
 *
 * Contexto: "objetivos de cada parte"
 * Momento: Explicando que cada módulo tem objetivos claros do que o aluno deve conseguir fazer
 *
 * Visual: Lista de objetivos com checkmarks aparecendo
 */
export function CardEffectObjectiveFocus({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  const objectives = [
    'Entender o conceito',
    'Ver exemplos práticos',
    'Aplicar no dia a dia',
  ];

  return (
    <div className="relative w-full h-full min-h-[180px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-green-50/30 dark:from-slate-950 dark:to-green-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Ícone central */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-4"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <Target className="w-7 h-7 text-white" />
        </div>
      </motion.div>

      {/* Título */}
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm font-bold text-green-800 dark:text-green-300 mb-3"
      >
        Objetivos de Aprendizagem
      </motion.h3>

      {/* Lista de objetivos */}
      <div className="flex flex-col gap-2 w-full max-w-[200px]">
        {objectives.map((obj, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + idx * 0.2 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg border border-green-200/50 dark:border-green-800/50"
          >
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300">{obj}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
