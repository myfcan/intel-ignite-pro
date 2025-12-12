'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Image, Video } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * 🛠️ TOOL GROUPS
 *
 * Contexto: "três grupos de ferramentas"
 * Momento: Explicando os 3 tipos de I.A. que trabalham juntos
 *
 * Visual: 3 grupos lado a lado (Texto, Visual, Vídeo)
 */
export function CardEffectToolGroups({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  const groups = [
    { icon: MessageSquare, label: 'Texto', color: 'from-cyan-500 to-blue-600' },
    { icon: Image, label: 'Visual', color: 'from-purple-500 to-pink-600' },
    { icon: Video, label: 'Vídeo', color: 'from-red-500 to-orange-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-950 dark:to-cyan-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Título */}
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xs font-bold text-cyan-800 dark:text-cyan-300 mb-4 uppercase tracking-wide"
      >
        3 Grupos de I.A.
      </motion.h3>

      {/* Grupos */}
      <div className="flex items-center gap-3">
        {groups.map((group, idx) => (
          <motion.div
            key={group.label}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.2, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center shadow-lg`}>
              <group.icon className="w-7 h-7 text-white" />
            </div>
            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 mt-2">
              {group.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-4 text-[10px] text-center text-slate-600 dark:text-slate-400"
      >
        Trabalhando juntos
      </motion.p>
    </div>
  );
}
