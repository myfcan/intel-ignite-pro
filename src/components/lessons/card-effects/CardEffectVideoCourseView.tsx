'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * 🎥 VIDEO COURSE VIEW
 *
 * Contexto: "curso em vídeo passo a passo"
 * Momento: Mostrando exemplo da Luciana que criou curso em vídeo com módulos curtos
 *
 * Visual: Player de vídeo com timeline de módulos
 */
export function CardEffectVideoCourseView({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  const modules = [
    { title: 'Entendendo a dor', duration: '8min' },
    { title: 'Hábitos do dia', duration: '12min' },
    { title: 'Alongamentos', duration: '15min' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-red-50/30 dark:from-slate-950 dark:to-red-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Player mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[220px] bg-slate-900 rounded-lg overflow-hidden shadow-xl"
      >
        {/* Área do vídeo */}
        <div className="relative aspect-video bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Play className="w-6 h-6 text-white ml-1" />
          </motion.div>

          {/* Badge de curso */}
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 rounded text-[8px] font-bold text-white">
            CURSO
          </div>
        </div>

        {/* Timeline/módulos */}
        <div className="p-2 space-y-1">
          {modules.map((mod, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.15 }}
              className="flex items-center gap-2 text-white/80"
            >
              <div className="w-1 h-1 rounded-full bg-red-500" />
              <span className="text-[9px] flex-1">{mod.title}</span>
              <Clock className="w-2.5 h-2.5" />
              <span className="text-[8px]">{mod.duration}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-3 text-xs font-medium text-red-700 dark:text-red-400"
      >
        Curso em Vídeo
      </motion.p>
    </div>
  );
}
