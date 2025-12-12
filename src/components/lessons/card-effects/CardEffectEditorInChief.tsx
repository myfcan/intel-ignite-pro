'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * ✅ EDITOR IN CHIEF
 *
 * Contexto: "você decide o que entra e o que fica de fora"
 * Momento: Você tem o filtro final, não a I.A.
 *
 * Visual: Você aprovando/rejeitando sugestões da I.A.
 */
export function CardEffectEditorInChief({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-green-50/30 dark:from-slate-950 dark:to-green-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Título */}
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm font-bold text-green-800 dark:text-green-300 mb-4"
      >
        Você no Comando
      </motion.h3>

      {/* Duas opções: Aprovar / Rejeitar */}
      <div className="flex items-center gap-6">
        {/* Aprovar */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-medium text-green-700 dark:text-green-400 mt-2">
            Aprovo
          </span>
        </motion.div>

        {/* Rejeitar */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
            <X className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-medium text-red-700 dark:text-red-400 mt-2">
            Rejeito
          </span>
        </motion.div>
      </div>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-4 text-[10px] text-center text-slate-600 dark:text-slate-400"
      >
        Você decide o que entra e o que fica de fora
      </motion.p>
    </div>
  );
}
