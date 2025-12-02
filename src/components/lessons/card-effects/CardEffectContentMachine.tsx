'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, Video, Instagram, Youtube, FileEdit } from 'lucide-react';

/**
 * CardEffectContentMachine - "Máquina de conteúdo com I.A."
 *
 * Efeito cinematográfico:
 * 1. Esteira animada entra pela lateral esquerda
 * 2. Cards de posts/vídeos/artigos movem-se pela esteira
 * 3. Portal de I.A. (anel brilhante) adiciona elementos aos cards
 * 4. Labels: Ideias, Criação, Distribuição acendem em sequência
 * 5. Cards viram formatos diferentes: quadrado (feed), retângulo (YouTube), texto (blog)
 * 6. Após 3-4s, esteira desacelera para loop lento
 */
export const CardEffectContentMachine: React.FC = () => {
  const [phase, setPhase] = useState<'enter' | 'active' | 'idle'>('enter');
  const [activeLabel, setActiveLabel] = useState(0);

  // Tipos de conteúdo que passam na esteira
  const contentItems = [
    { id: 1, type: 'post', icon: Instagram, format: 'square', color: 'from-pink-500 to-purple-500' },
    { id: 2, type: 'video', icon: Youtube, format: 'wide', color: 'from-red-500 to-rose-500' },
    { id: 3, type: 'article', icon: FileEdit, format: 'text', color: 'from-blue-500 to-cyan-500' },
    { id: 4, type: 'image', icon: Image, format: 'square', color: 'from-purple-500 to-indigo-500' },
    { id: 5, type: 'story', icon: Instagram, format: 'tall', color: 'from-orange-500 to-pink-500' },
  ];

  const labels = ['Ideias', 'Criação', 'Distribuição'];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Entra fase ativa
    timers.push(setTimeout(() => setPhase('active'), 500));

    // Labels acendem em sequência
    labels.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveLabel(i + 1), 800 + i * 800));
    });

    // Fase idle (loop lento)
    timers.push(setTimeout(() => setPhase('idle'), 4000));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Componente de engrenagem
  const Gear: React.FC<{ size: number; className?: string; speed?: number }> = ({ size, className, speed = 3 }) => (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    >
      <path
        fill="currentColor"
        d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"
      />
    </motion.svg>
  );

  return (
    <div className="relative w-full h-72 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950/20">
      {/* Background industrial */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(251, 146, 60, 0.1) 50px, rgba(251, 146, 60, 0.1) 51px)
            `,
          }}
        />
      </div>

      {/* Engrenagens decorativas */}
      <div className="absolute top-4 left-4">
        <Gear size={24} className="text-orange-500/30" speed={4} />
      </div>
      <div className="absolute top-8 left-10">
        <Gear size={16} className="text-orange-400/20" speed={3} />
      </div>
      <div className="absolute bottom-4 right-4">
        <Gear size={20} className="text-orange-500/30" speed={5} />
      </div>

      {/* Labels superiores */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-8">
        {labels.map((label, i) => (
          <motion.div
            key={label}
            className="relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <motion.div
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                activeLabel > i
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
              }`}
              animate={activeLabel > i ? {
                boxShadow: ['0 0 0 rgba(251, 146, 60, 0)', '0 0 15px rgba(251, 146, 60, 0.3)', '0 0 0 rgba(251, 146, 60, 0)'],
              } : {}}
              transition={{ duration: 1, repeat: activeLabel > i ? 2 : 0 }}
            >
              {label}
            </motion.div>

            {/* Conector */}
            {i < labels.length - 1 && (
              <motion.div
                className="absolute top-1/2 -right-6 w-4 h-0.5 bg-slate-700"
                animate={{
                  backgroundColor: activeLabel > i ? '#fb923c' : '#334155',
                }}
                transition={{ delay: 0.5 + i * 0.8 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Esteira principal */}
      <motion.div
        className="absolute bottom-16 left-0 right-0 h-20"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Trilhos da esteira */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-700/50 rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-700/50 rounded-full" />

        {/* Textura da esteira em movimento */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg,
              transparent 0px,
              transparent 30px,
              rgba(100, 116, 139, 0.2) 30px,
              rgba(100, 116, 139, 0.2) 32px
            )`,
          }}
          animate={{
            backgroundPositionX: phase === 'idle' ? ['0px', '64px'] : ['0px', '64px'],
          }}
          transition={{
            duration: phase === 'idle' ? 2 : 0.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Portal de I.A. */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-16 h-24"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          {/* Anel externo */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-orange-500/60"
            animate={{
              boxShadow: [
                '0 0 10px rgba(251, 146, 60, 0.3), inset 0 0 10px rgba(251, 146, 60, 0.2)',
                '0 0 30px rgba(251, 146, 60, 0.6), inset 0 0 20px rgba(251, 146, 60, 0.4)',
                '0 0 10px rgba(251, 146, 60, 0.3), inset 0 0 10px rgba(251, 146, 60, 0.2)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Centro do portal */}
          <div className="absolute inset-2 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full" />

          {/* Label I.A. */}
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-orange-500/20 border border-orange-500/40 rounded text-[8px] text-orange-300 font-bold"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            I.A.
          </motion.div>
        </motion.div>

        {/* Cards de conteúdo na esteira */}
        {contentItems.map((item, i) => {
          const Icon = item.icon;
          const speed = phase === 'idle' ? 8 : 4;

          return (
            <motion.div
              key={item.id}
              className="absolute top-1/2 -translate-y-1/2"
              initial={{ x: -50 }}
              animate={{
                x: ['calc(-50px)', 'calc(100vw + 50px)'],
              }}
              transition={{
                duration: speed,
                repeat: Infinity,
                delay: i * (speed / contentItems.length),
                ease: 'linear',
              }}
            >
              {/* Card de conteúdo */}
              <div
                className={`relative bg-gradient-to-br ${item.color} rounded-lg shadow-lg flex items-center justify-center ${
                  item.format === 'square' ? 'w-12 h-12' :
                  item.format === 'wide' ? 'w-16 h-10' :
                  item.format === 'tall' ? 'w-10 h-14' :
                  'w-14 h-10'
                }`}
              >
                <Icon className="w-5 h-5 text-white/80" />

                {/* Flash quando passa pelo portal */}
                <motion.div
                  className="absolute inset-0 bg-orange-300/50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{
                    duration: 0.3,
                    delay: speed * 0.45, // Quando passa pelo centro
                    repeat: Infinity,
                    repeatDelay: speed - 0.3,
                  }}
                />

                {/* Elementos adicionados após portal */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 1, 0] }}
                  transition={{
                    duration: speed,
                    delay: i * (speed / contentItems.length),
                    repeat: Infinity,
                    times: [0, 0.5, 0.9, 1],
                  }}
                >
                  <span className="text-[6px] text-white">✓</span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Indicador de produção */}
      <motion.div
        className="absolute bottom-4 right-4 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <span className="text-[10px] text-green-400">Produzindo</span>
      </motion.div>

      {/* Contador de conteúdo */}
      <motion.div
        className="absolute bottom-4 left-4 px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.span
          className="text-xs text-slate-300"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ∞ conteúdos/mês
        </motion.span>
      </motion.div>
    </div>
  );
};

export default CardEffectContentMachine;
