'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🤝 COAUTHOR ROLE
 *
 * Contexto: "coautora, não dona"
 * Momento: I.A. é parceira que acelera, mas você tem o controle
 *
 * Visual: Duas figuras lado a lado (Você + I.A.)
 */
export function CardEffectCoauthorRole({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Duas figuras lado a lado */}
      <div className="flex items-center gap-4">
        {/* Você */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 mt-2">
            Você
          </span>
        </motion.div>

        {/* Símbolo de parceria */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-2xl font-bold text-slate-400"
        >
          +
        </motion.div>

        {/* I.A. */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 mt-2">
            I.A.
          </span>
        </motion.div>
      </div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-3 text-xs font-medium text-indigo-700 dark:text-indigo-400"
      >
        Coautora, não dona
      </motion.p>
    </div>
  );
}
