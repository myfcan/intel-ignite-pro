'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * 📈 LONG TERM ASSET
 *
 * Contexto: "ativo de longo prazo"
 * Momento: Conteúdo profundo trabalha por você por anos
 *
 * Visual: Gráfico de crescimento ao longo do tempo
 */
export function CardEffectLongTermAsset({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  return (
    <div className="relative w-full h-full min-h-[180px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Ícone principal */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-3"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
      </motion.div>

      {/* Título */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3"
      >
        Ativo de Longo Prazo
      </motion.h3>

      {/* Métricas de crescimento */}
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Anos</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center"
        >
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">+1k</span>
        </motion.div>
      </div>

      {/* Linha de crescimento */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-4 w-32 h-1 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full origin-left"
      />
    </div>
  );
}
