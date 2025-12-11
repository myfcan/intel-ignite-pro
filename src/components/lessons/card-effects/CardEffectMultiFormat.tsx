'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Video, BookOpen } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * 🔄 MULTI FORMAT
 *
 * Contexto: "mesma base, formatos diferentes"
 * Momento: Um único conhecimento vira curso + eBook sem começar do zero
 *
 * Visual: Núcleo central se dividindo em 2 produtos
 */
export function CardEffectMultiFormat({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  return (
    <div className="relative w-full h-full min-h-[180px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Núcleo central */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="relative z-10"
      >
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-xl">
          <Zap className="w-8 h-8 text-white" />
        </div>

        {/* Linha de expansão esquerda */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '40px', opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute top-1/2 right-full -translate-y-1/2 h-0.5 bg-gradient-to-l from-indigo-400 to-transparent"
        />

        {/* Linha de expansão direita */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '40px', opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute top-1/2 left-full -translate-y-1/2 h-0.5 bg-gradient-to-r from-indigo-400 to-transparent"
        />
      </motion.div>

      {/* Produto 1: Vídeo (esquerda) */}
      <motion.div
        initial={{ scale: 0, x: 20 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ delay: 0.9, type: 'spring' }}
        className="absolute left-6"
      >
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
          <Video className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      {/* Produto 2: eBook (direita) */}
      <motion.div
        initial={{ scale: 0, x: -20 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ delay: 0.9, type: 'spring' }}
        className="absolute right-6"
      >
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-3 text-xs font-medium text-indigo-700 dark:text-indigo-400"
      >
        Múltiplos Formatos
      </motion.p>
    </div>
  );
}
