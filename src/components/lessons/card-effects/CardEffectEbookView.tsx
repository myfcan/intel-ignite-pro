'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 📖 EBOOK VIEW
 *
 * Contexto: "eBook para leitura independente"
 * Momento: Mesma estrutura do curso, mas em formato de eBook com textos e checklists
 *
 * Visual: Livro aberto com capítulos
 */
export function CardEffectEbookView({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-950 dark:to-orange-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6">

      {/* Livro aberto */}
      <motion.div
        initial={{ opacity: 0, rotateY: -90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative"
      >
        {/* Capa do livro */}
        <div className="w-32 h-40 bg-gradient-to-br from-orange-600 to-amber-700 rounded-r-lg shadow-xl flex flex-col items-center justify-center border-l-4 border-orange-800">
          <BookOpen className="w-12 h-12 text-white mb-2" />
          <div className="text-center px-3">
            <p className="text-xs font-bold text-white leading-tight mb-1">Guia Completo</p>
            <div className="flex flex-col gap-0.5">
              {['Cap. 1', 'Cap. 2', 'Cap. 3'].map((cap, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="flex items-center gap-1"
                >
                  <FileText className="w-2 h-2 text-orange-200" />
                  <span className="text-[8px] text-orange-100">{cap}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Badge "eBook" */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center shadow-lg"
        >
          <span className="text-[8px] font-bold text-white">PDF</span>
        </motion.div>
      </motion.div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-3 text-xs font-medium text-orange-700 dark:text-orange-400"
      >
        Versão eBook
      </motion.p>
    </div>
  );
}
