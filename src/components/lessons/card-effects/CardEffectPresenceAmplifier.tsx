'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MessageSquare, Mail, Share2, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

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
 *
 * 🆕 MELHORIAS V5:
 * - isActive: animação só inicia quando card está em foco
 * - Durações 2.5x mais lentas para melhor experiência
 * - Loop contínuo enquanto ativo
 */
export const CardEffectPresenceAmplifier: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'beam' | 'clone' | 'spread' | 'complete'>('waiting');
  const [visibleClones, setVisibleClones] = useState(0);
  const [showOrganized, setShowOrganized] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('enter');
    setVisibleClones(0);
    setShowOrganized(false);

    // Durações mais lentas (2.5x)
    const ENTER_DELAY = 0;         // entrada imediata
    const BEAM_DELAY = 1500;       // era 600ms
    const CLONE_DELAY = 3000;      // era 1200ms
    const CLONE_START = 3500;      // era 1400ms
    const CLONE_INTERVAL = 750;    // era 300ms
    const SPREAD_DELAY = 8000;     // era 3200ms
    const COMPLETE_DELAY = 10000;  // era 4000ms
    const LOOP_DELAY = 15000;      // tempo até reiniciar

    // Fase 1: Entrada
    timersRef.current.push(setTimeout(() => setPhase('enter'), ENTER_DELAY));

    // Fase 2: Feixe de luz
    timersRef.current.push(setTimeout(() => setPhase('beam'), BEAM_DELAY));

    // Fase 3: Clone
    timersRef.current.push(setTimeout(() => setPhase('clone'), CLONE_DELAY));

    // Clones aparecem um a um
    cloneTargets.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setVisibleClones(i + 1), CLONE_START + i * CLONE_INTERVAL));
    });

    // Fase 4: Organizar em grade
    timersRef.current.push(setTimeout(() => {
      setPhase('spread');
      setShowOrganized(true);
    }, SPREAD_DELAY));

    // Fase 5: Complete
    timersRef.current.push(setTimeout(() => setPhase('complete'), COMPLETE_DELAY));

    // 🔄 Loop: reiniciar animação após um tempo
    timersRef.current.push(setTimeout(() => {
      setLoopCount(prev => prev + 1);
    }, LOOP_DELAY));
  };

  // Posições ajustadas para melhor responsividade mobile
  const cloneTargets = [
    { id: 1, icon: MessageSquare, label: 'Chat', position: { x: 65, y: 20 }, finalPosition: { x: 55, y: 15 } },
    { id: 2, icon: Mail, label: 'Email', position: { x: 80, y: 35 }, finalPosition: { x: 75, y: 15 } },
    { id: 3, icon: Share2, label: 'Social', position: { x: 70, y: 60 }, finalPosition: { x: 90, y: 15 } },
    { id: 4, icon: MessageSquare, label: 'WhatsApp', position: { x: 60, y: 75 }, finalPosition: { x: 55, y: 40 } },
    { id: 5, icon: Share2, label: 'LinkedIn', position: { x: 80, y: 70 }, finalPosition: { x: 75, y: 40 } },
  ];

  // 🎯 Iniciar animação quando isActive mudar para true
  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      // Parar e resetar quando não estiver ativo
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase('waiting');
      setVisibleClones(0);
      setShowOrganized(false);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]); // loopCount força reinício do loop

  // Se não estiver ativo, mostrar estado inicial sutil
  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[500px] h-[60vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30">
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
        className="absolute left-2 sm:left-6 top-1/3 sm:top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3"
        initial={{ x: -50, opacity: 0 }}
        animate={{
          x: isAnimating ? 0 : -50,
          opacity: isAnimating ? 1 : 0,
        }}
        transition={{ duration: 1 }} // 2.5x mais lento (era 0.4)
      >
        {/* Silhueta */}
        <div className="w-8 h-12 sm:w-12 sm:h-16 bg-gradient-to-b from-indigo-500/50 to-indigo-700/50 rounded-t-full flex items-center justify-center">
          <User className="w-4 h-4 sm:w-6 sm:h-6 text-white/70" />
        </div>

        {/* Texto original */}
        <motion.div
          className="relative w-16 sm:w-24 p-1.5 sm:p-2 bg-slate-800/80 rounded-lg border border-indigo-500/30"
          animate={isAnimating && phase === 'beam' ? {
            borderColor: ['rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.8)', 'rgba(99, 102, 241, 0.3)'],
          } : {}}
          transition={{ duration: 1.25, repeat: isAnimating && phase === 'beam' ? 3 : 0 }} // 2.5x mais lento (era 0.5)
        >
          {/* Linhas de texto */}
          <div className="space-y-1">
            <div className="h-1.5 bg-indigo-400/60 rounded w-full" />
            <div className="h-1.5 bg-indigo-400/40 rounded w-3/4" />
            <div className="h-1.5 bg-indigo-400/40 rounded w-5/6" />
          </div>

          {/* Feixe de luz saindo */}
          {isAnimating && phase === 'beam' && (
            <motion.div
              className="absolute right-0 top-1/2 w-20 h-1 bg-gradient-to-r from-indigo-400 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: 2 }} // 2.5x mais lento (era 0.8)
              style={{ originX: 0 }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Orbe de I.A. central */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isAnimating ? 1 : 0,
          opacity: isAnimating ? 1 : 0,
        }}
        transition={{ delay: 0.75, type: 'spring' }} // 2.5x mais lento (era 0.3)
      >
        {/* Glow externo */}
        <motion.div
          className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl"
          animate={{
            opacity: isAnimating ? [0.3, 0.6, 0.3] : 0,
            scale: isAnimating ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 5, repeat: Infinity }} // 2.5x mais lento (era 2)
        />

        {/* Orbe */}
        <motion.div
          className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
          animate={{
            rotate: isAnimating && (phase === 'clone' || phase === 'spread') ? 360 : 0,
          }}
          transition={{
            duration: 7.5, // 2.5x mais lento (era 3)
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />

          {/* Anéis girando */}
          <motion.div
            className="absolute inset-0 border-2 border-white/30 rounded-full"
            animate={{ rotate: isAnimating ? -360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} // 2.5x mais lento (era 4)
          />
          <motion.div
            className="absolute inset-1 border border-white/20 rounded-full"
            animate={{ rotate: isAnimating ? 360 : 0 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} // 2.5x mais lento (era 6)
          />
        </motion.div>

        {/* Partículas saindo do orbe */}
        <AnimatePresence>
          {isAnimating && phase === 'clone' && cloneTargets.slice(0, visibleClones).map((target, i) => (
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
              transition={{ duration: 1.25, delay: i * 0.25 }} // 2.5x mais lento (era 0.5 e delay 0.1)
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Clones de texto nos canais */}
      {cloneTargets.map((target, i) => {
        const Icon = target.icon;
        const isVisible = isAnimating && visibleClones > i;
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
              scale: { type: 'spring', stiffness: 120 }, // mais suave (era 300)
              left: { duration: 1.25 }, // 2.5x mais lento (era 0.5)
              top: { duration: 1.25 }, // 2.5x mais lento (era 0.5)
            }}
          >
            {/* Card de clone */}
            <div className="relative w-14 sm:w-20 p-1.5 sm:p-2 bg-slate-800/80 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
              {/* Ícone do canal */}
              <motion.div
                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-indigo-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: isVisible ? 1 : 0 }}
                transition={{ delay: 0.5, type: 'spring' }} // 2.5x mais lento (era 0.2)
              >
                <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
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
                transition={{ duration: 0.75 }} // 2.5x mais lento (era 0.3)
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
        animate={{ opacity: isAnimating ? 1 : 0 }}
        transition={{ delay: isAnimating ? 10 : 0 }} // 2.5x mais lento (era 4)
      >
        Sua presença multiplicada
      </motion.div>

      {/* Contador */}
      <motion.div
        className="absolute top-4 right-4 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
        transition={{ delay: isAnimating ? 7.5 : 0 }} // 2.5x mais lento (era 3)
      >
        <span className="text-[10px] text-indigo-300">
          {visibleClones} canais ativos
        </span>
      </motion.div>
    </div>
  );
};

export default CardEffectPresenceAmplifier;
