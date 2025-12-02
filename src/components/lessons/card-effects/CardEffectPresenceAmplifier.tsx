'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MessageSquare, Mail, Share2, Sparkles } from 'lucide-react';

/**
 * CardEffectPresenceAmplifier - "A I.A. que amplia a sua presença"
 *
 * Efeito cinematográfico:
 * 1. Silhueta de pessoa + caixa de texto aparecem
 * 2. Feixe de luz sai do texto para um orbe de I.A. no centro
 * 3. Orbe gira e emite cópias estilizadas para diferentes canais
 * 4. Cópias aparecem em: chat, email, rede social
 * 5. Todas mantêm o mesmo "estilo" visual
 * 6. Cópias se organizam em grade, orbe fica pulsando
 */
export const CardEffectPresenceAmplifier: React.FC = () => {
  const [phase, setPhase] = useState<'enter' | 'beam' | 'clone' | 'spread' | 'complete'>('enter');
  const [visibleClones, setVisibleClones] = useState(0);
  const [showOrganized, setShowOrganized] = useState(false);

  const cloneTargets = [
    { id: 1, icon: MessageSquare, label: 'Chat', position: { x: 20, y: 25 }, finalPosition: { x: 60, y: 20 } },
    { id: 2, icon: Mail, label: 'Email', position: { x: 80, y: 30 }, finalPosition: { x: 75, y: 20 } },
    { id: 3, icon: Share2, label: 'Social', position: { x: 75, y: 70 }, finalPosition: { x: 90, y: 20 } },
    { id: 4, icon: MessageSquare, label: 'WhatsApp', position: { x: 25, y: 75 }, finalPosition: { x: 60, y: 45 } },
    { id: 5, icon: Share2, label: 'LinkedIn', position: { x: 85, y: 55 }, finalPosition: { x: 75, y: 45 } },
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Fase beam
    timers.push(setTimeout(() => setPhase('beam'), 600));

    // Fase clone
    timers.push(setTimeout(() => setPhase('clone'), 1200));

    // Clones aparecem
    cloneTargets.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleClones(i + 1), 1400 + i * 300));
    });

    // Organizar em grade
    timers.push(setTimeout(() => {
      setPhase('spread');
      setShowOrganized(true);
    }, 3200));

    // Fase complete
    timers.push(setTimeout(() => setPhase('complete'), 4000));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full h-72 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Silhueta da pessoa + texto original */}
      <motion.div
        className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Silhueta */}
        <div className="w-12 h-16 bg-gradient-to-b from-indigo-500/50 to-indigo-700/50 rounded-t-full flex items-center justify-center">
          <User className="w-6 h-6 text-white/70" />
        </div>

        {/* Texto original */}
        <motion.div
          className="relative w-24 p-2 bg-slate-800/80 rounded-lg border border-indigo-500/30"
          animate={phase === 'beam' ? {
            borderColor: ['rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.8)', 'rgba(99, 102, 241, 0.3)'],
          } : {}}
          transition={{ duration: 0.5, repeat: phase === 'beam' ? 3 : 0 }}
        >
          {/* Linhas de texto */}
          <div className="space-y-1">
            <div className="h-1.5 bg-indigo-400/60 rounded w-full" />
            <div className="h-1.5 bg-indigo-400/40 rounded w-3/4" />
            <div className="h-1.5 bg-indigo-400/40 rounded w-5/6" />
          </div>

          {/* Feixe de luz saindo */}
          {phase === 'beam' && (
            <motion.div
              className="absolute right-0 top-1/2 w-20 h-1 bg-gradient-to-r from-indigo-400 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: 2 }}
              style={{ originX: 0 }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Orbe de I.A. central */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        {/* Glow externo */}
        <motion.div
          className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Orbe */}
        <motion.div
          className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
          animate={{
            rotate: phase === 'clone' || phase === 'spread' ? 360 : 0,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Sparkles className="w-8 h-8 text-white" />

          {/* Anéis girando */}
          <motion.div
            className="absolute inset-0 border-2 border-white/30 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-1 border border-white/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Partículas saindo do orbe */}
        <AnimatePresence>
          {phase === 'clone' && cloneTargets.slice(0, visibleClones).map((target, i) => (
            <motion.div
              key={`particle-${target.id}`}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-indigo-400 rounded-full"
              initial={{ x: '-50%', y: '-50%', opacity: 1 }}
              animate={{
                x: `${(target.position.x - 50) * 3}%`,
                y: `${(target.position.y - 50) * 3}%`,
                opacity: [1, 0],
                scale: [1, 0.5],
              }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Clones de texto nos canais */}
      {cloneTargets.map((target, i) => {
        const Icon = target.icon;
        const isVisible = visibleClones > i;
        const pos = showOrganized ? target.finalPosition : target.position;

        return (
          <motion.div
            key={target.id}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isVisible ? 1 : 0,
              opacity: isVisible ? 1 : 0,
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
            transition={{
              scale: { type: 'spring', stiffness: 300 },
              left: { duration: 0.5 },
              top: { duration: 0.5 },
            }}
          >
            {/* Card de clone */}
            <div className="relative w-20 p-2 bg-slate-800/80 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
              {/* Ícone do canal */}
              <motion.div
                className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: isVisible ? 1 : 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Icon className="w-3 h-3 text-white" />
              </motion.div>

              {/* Linhas de texto (mesmo estilo) */}
              <div className="space-y-1">
                <div className="h-1 bg-indigo-400/60 rounded w-full" />
                <div className="h-1 bg-indigo-400/40 rounded w-3/4" />
                <div className="h-1 bg-indigo-400/40 rounded w-5/6" />
              </div>

              {/* Flash de duplicação */}
              <motion.div
                className="absolute inset-0 bg-indigo-400/30 rounded-lg"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Label */}
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-slate-500 whitespace-nowrap">
                {target.label}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Label inferior */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-indigo-300/70 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
      >
        Sua presença multiplicada
      </motion.div>

      {/* Contador */}
      <motion.div
        className="absolute top-4 right-4 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <span className="text-[10px] text-indigo-300">
          {visibleClones} canais ativos
        </span>
      </motion.div>
    </div>
  );
};

export default CardEffectPresenceAmplifier;
