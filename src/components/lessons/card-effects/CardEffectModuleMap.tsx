'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * 🗺️ MODULE MAP
 *
 * Contexto da narração: "mapa de módulos"
 * Momento: Explicando como dividir o conteúdo em módulos que resolvem etapas
 *
 * Visual: Mapa com 4 módulos conectados em sequência
 * Cada módulo resolve uma etapa do caminho do aluno
 */
export function CardEffectModuleMap({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  const modules = [
    { num: 1, title: 'Introduzir', color: 'from-blue-500 to-blue-600' },
    { num: 2, title: 'Aprofundar', color: 'from-purple-500 to-purple-600' },
    { num: 3, title: 'Praticar', color: 'from-amber-500 to-amber-600' },
    { num: 4, title: 'Dominar', color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="relative w-full h-full min-h-[180px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-4 left-4 flex items-center gap-2"
      >
        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
          Mapa de Módulos
        </span>
      </motion.div>

      {/* Módulos em sequência */}
      <div className="flex items-center gap-2">
        {modules.map((module, idx) => (
          <React.Fragment key={module.num}>
            {/* Módulo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.2, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center shadow-md`}>
                <span className="text-white font-bold text-lg">{module.num}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 mt-1">
                {module.title}
              </span>
            </motion.div>

            {/* Seta de conexão */}
            {idx < modules.length - 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.2 }}
              >
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-3 text-[10px] text-center text-slate-600 dark:text-slate-400"
      >
        Cada módulo resolve uma etapa
      </motion.p>
    </div>
  );
}
