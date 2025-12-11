'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Award } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * 🔺 CORE TRIANGLE
 *
 * Contexto da narração: "tema, público e promessa"
 * Momento: Explicando as 3 decisões fundamentais antes de criar conteúdo profundo
 *
 * Visual: Triângulo com os 3 pilares essenciais
 * - Tema (topo): Sobre o que você vai falar
 * - Público (esquerda): Para quem é o conteúdo
 * - Promessa (direita): Qual transformação entrega
 */
export function CardEffectCoreTriangle({ isActive = true }: CardEffectProps) {
  if (!isActive) return null;

  const vertices = [
    { id: 'tema', icon: Target, label: 'Tema', desc: 'O que você ensina', x: '50%', y: '20%', color: 'violet' },
    { id: 'publico', icon: Users, label: 'Público', desc: 'Para quem é', x: '20%', y: '70%', color: 'blue' },
    { id: 'promessa', icon: Award, label: 'Promessa', desc: 'Qual transformação', x: '80%', y: '70%', color: 'amber' },
  ];

  return (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">

      {/* Linhas do triângulo */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="triangle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Tema → Público */}
        <motion.line
          x1="50" y1="20" x2="20" y2="70"
          stroke="url(#triangle-gradient)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        {/* Público → Promessa */}
        <motion.line
          x1="20" y1="70" x2="80" y2="70"
          stroke="url(#triangle-gradient)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />

        {/* Promessa → Tema */}
        <motion.line
          x1="80" y1="70" x2="50" y2="20"
          stroke="url(#triangle-gradient)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
      </svg>

      {/* Vértices do triângulo */}
      {vertices.map((vertex, idx) => (
        <motion.div
          key={vertex.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 + idx * 0.15, type: 'spring', stiffness: 200 }}
          className="absolute z-10"
          style={{ left: vertex.x, top: vertex.y, transform: 'translate(-50%, -50%)' }}
        >
          {/* Círculo com ícone */}
          <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-${vertex.color}-500 to-${vertex.color}-600 flex items-center justify-center shadow-lg`}>
            <vertex.icon className="w-7 h-7 text-white" />

            {/* Pulso sutil */}
            <motion.div
              className={`absolute inset-0 rounded-full bg-${vertex.color}-400 opacity-20`}
              animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, delay: 1.5 + idx * 0.3, repeat: Infinity, repeatDelay: 2 }}
            />
          </div>

          {/* Label */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{vertex.label}</p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400">{vertex.desc}</p>
          </div>
        </motion.div>
      ))}

      {/* Texto central */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 dark:border-purple-800"
      >
        <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
          Tríade Central
        </p>
      </motion.div>
    </div>
  );
}
