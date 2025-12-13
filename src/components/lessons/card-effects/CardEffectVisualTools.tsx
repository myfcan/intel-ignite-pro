'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Image, Palette } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🎨 VISUAL TOOLS
 *
 * Contexto: "I.A. para capas e materiais visuais"
 * Momento: DALL-E, Midjourney para criar capas e ilustrações
 *
 * Visual: Paleta de cores + imagens sendo geradas
 */
export function CardEffectVisualTools({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  const tools = ['DALL-E', 'Midjourney', 'Gemini'];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Paleta de cores animada */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-3"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl">
          <Palette className="w-7 h-7 text-white" />
        </div>
      </motion.div>

      {/* Título */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-3"
      >
        Ferramentas Visuais
      </motion.h3>

      {/* Grid de imagens mockup */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[0, 1, 2].map((idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
            className="w-12 h-12 rounded bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center"
          >
            <Image className="w-5 h-5 text-white/70" />
          </motion.div>
        ))}
      </div>

      {/* Lista de ferramentas */}
      <div className="flex flex-wrap justify-center gap-2">
        {tools.map((tool, idx) => (
          <motion.span
            key={tool}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + idx * 0.1 }}
            className="text-[9px] font-medium text-purple-600 dark:text-purple-400"
          >
            {tool}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
