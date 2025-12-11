'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * 💬 TEXT TOOLS
 *
 * Contexto: "modelos de linguagem para estrutura e texto"
 * Momento: ChatGPT, Claude para sumário, títulos, roteiros
 *
 * Visual: Chat com I.A. gerando estrutura de curso
 */
export function CardEffectTextTools({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  const tools = ['ChatGPT', 'Claude', 'Gemini'];

  return (
    <div className="relative w-full h-full min-h-[180px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Ícone principal */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-3"
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
      </motion.div>

      {/* Título */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm font-bold text-cyan-800 dark:text-cyan-300 mb-3"
      >
        Ferramentas de Texto
      </motion.h3>

      {/* Lista de ferramentas */}
      <div className="flex flex-wrap justify-center gap-2">
        {tools.map((tool, idx) => (
          <motion.div
            key={tool}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + idx * 0.15, type: 'spring' }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-full border border-cyan-200/50 dark:border-cyan-800/50"
          >
            <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{tool}</span>
          </motion.div>
        ))}
      </div>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-3 text-[10px] text-center text-slate-600 dark:text-slate-400"
      >
        Para sumário, títulos e roteiros
      </motion.p>
    </div>
  );
}
