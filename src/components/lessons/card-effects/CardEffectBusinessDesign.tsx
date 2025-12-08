'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectBusinessDesign - "I.A. que ajuda a montar um negócio"
 *
 * Efeito cinematográfico:
 * 1. Canvas branco desliza de baixo para cima
 * 2. Post-its caem e grudam com bounce: Problema, Público, Solução, Oferta, Diferencial
 * 3. Laser azul passa e reorganiza em colunas perfeitas
 * 4. Setas conectam problema → solução → oferta
 * 5. Números 1, 2, 3 aparecem com micro animação
 * 6. Canvas se recolhe e badge "Plano inicial pronto" aparece
 *
 * 🆕 MELHORIAS V5:
 * - isActive: animação só inicia quando card está em foco
 * - Durações 2-2.5x mais lentas para melhor experiência
 * - Loop contínuo enquanto ativo
 */
export const CardEffectBusinessDesign: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'postits' | 'laser' | 'connect' | 'complete'>('waiting');
  const [visiblePostits, setVisiblePostits] = useState(0);
  const [laserPosition, setLaserPosition] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const postits = [
    { id: 1, label: 'Problema', color: 'from-red-400 to-rose-500', finalX: 0, finalY: 0 },
    { id: 2, label: 'Público', color: 'from-blue-400 to-cyan-500', finalX: 1, finalY: 0 },
    { id: 3, label: 'Solução', color: 'from-green-400 to-emerald-500', finalX: 0, finalY: 1 },
    { id: 4, label: 'Oferta', color: 'from-purple-400 to-indigo-500', finalX: 1, finalY: 1 },
    { id: 5, label: 'Diferencial', color: 'from-orange-400 to-amber-500', finalX: 2, finalY: 0 },
  ];

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('enter');
    setVisiblePostits(0);
    setLaserPosition(0);
    setShowArrows(false);
    setShowBadge(false);

    // Durações mais lentas (2-2.5x)
    const ENTER_DELAY = 1250;      // era 500ms (2.5x)
    const POSTIT_DELAY = 750;      // era 300ms (2.5x)
    const LASER_START = 6250;      // era 2500ms (2.5x)
    const LASER_SPEED = 75;        // era 30ms (2.5x)
    const ARROWS_DELAY = 8000;     // era 3200ms (2.5x)
    const COMPLETE_DELAY = 10000;  // era 4000ms (2.5x)
    const LOOP_DELAY = 15000;      // tempo total até reiniciar

    // Fase 1: Canvas entra
    timersRef.current.push(setTimeout(() => setPhase('postits'), ENTER_DELAY));

    // Fase 2: Post-its caem um a um
    postits.forEach((_, i) => {
      timersRef.current.push(
        setTimeout(() => setVisiblePostits(i + 1), ENTER_DELAY + 200 + i * POSTIT_DELAY)
      );
    });

    // Fase 3: Laser passa
    timersRef.current.push(setTimeout(() => {
      setPhase('laser');
      let pos = 0;
      const laserInterval = setInterval(() => {
        pos += 5;
        setLaserPosition(pos);
        if (pos >= 100) {
          clearInterval(laserInterval);
          setPhase('connect');
        }
      }, LASER_SPEED);
    }, LASER_START));

    // Fase 4: Setas aparecem
    timersRef.current.push(setTimeout(() => setShowArrows(true), ARROWS_DELAY));

    // Fase 5: Badge aparece
    timersRef.current.push(setTimeout(() => {
      setPhase('complete');
      setShowBadge(true);
    }, COMPLETE_DELAY));

    // 🔄 Loop 2x: reiniciar animação apenas 2 vezes
    timersRef.current.push(setTimeout(() => {
      if (loopCount < 1) {
        setLoopCount(prev => prev + 1);
      }
    }, LOOP_DELAY));
  };

  // 🎯 Iniciar animação quando isActive mudar para true
  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      // Parar e resetar quando não estiver ativo
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase('waiting');
      setVisiblePostits(0);
      setLaserPosition(0);
      setShowArrows(false);
      setShowBadge(false);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]); // loopCount força reinício do loop

  // Se não estiver ativo, mostrar estado inicial sutil
  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30">
      {/* Background - mesa de estratégia */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
              repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(251, 191, 36, 0.03) 40px, rgba(251, 191, 36, 0.03) 41px),
              repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(251, 191, 36, 0.03) 40px, rgba(251, 191, 36, 0.03) 41px)
            `,
          }}
        />
      </div>

      {/* Canvas principal */}
      <motion.div
        className="absolute inset-6 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden"
        initial={{ y: '100%', opacity: 0 }}
        animate={{
          y: isAnimating ? 0 : '100%',
          opacity: isAnimating ? 1 : 0,
        }}
        transition={{ duration: 1.25, ease: 'easeOut' }} // 2.5x slower (era 0.5)
      >
        {/* Header do canvas */}
        <div className="px-4 py-2 border-b border-slate-700/50 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          <span className="text-xs text-slate-400">Business Model Canvas</span>
        </div>

        {/* Área dos post-its */}
        <div className="relative p-4 h-[calc(100%-40px)]">
          {/* Grid guia (aparece após laser) */}
          <motion.div
            className="absolute inset-4 grid grid-cols-3 gap-2 opacity-0"
            animate={{ opacity: isAnimating && (phase === 'connect' || phase === 'complete') ? 0.3 : 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-dashed border-slate-600/30 rounded-lg" />
            ))}
          </motion.div>

          {/* Post-its */}
          {postits.map((postit, i) => {
            const isVisible = isAnimating && visiblePostits > i;
            const isOrganized = isAnimating && (phase === 'connect' || phase === 'complete');

            // Posição inicial (caindo de cima, posições aleatórias)
            const initialX = 20 + (i * 15) % 60;
            const initialY = -50;

            // Posição após cair (espalhado)
            const fallenX = 10 + (i * 18) % 70;
            const fallenY = 20 + (i * 12) % 40;

            // Posição final organizada
            const organizedX = 8 + postit.finalX * 32;
            const organizedY = 10 + postit.finalY * 45;

            return (
              <motion.div
                key={postit.id}
                className="absolute"
                style={{
                  width: '28%',
                  height: '35%',
                }}
                initial={{
                  x: `${initialX}%`,
                  y: initialY,
                  rotate: -10 + Math.random() * 20,
                  opacity: 0,
                }}
                animate={{
                  x: isOrganized ? `${organizedX}%` : isVisible ? `${fallenX}%` : `${initialX}%`,
                  y: isOrganized ? `${organizedY}%` : isVisible ? `${fallenY}%` : initialY,
                  rotate: isOrganized ? 0 : isVisible ? -5 + Math.random() * 10 : -10,
                  opacity: isVisible ? 1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: isOrganized ? 100 : 75, // 2x mais lento (era 200/150)
                  damping: isOrganized ? 20 : 12,
                  duration: 1.25, // 2.5x mais lento (era 0.5)
                }}
              >
                <div className={`w-full h-full bg-gradient-to-br ${postit.color} rounded-lg shadow-lg p-2 flex flex-col`}>
                  {/* Fita adesiva */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-yellow-200/60 rounded-sm" />

                  {/* Texto */}
                  <span className="text-white font-bold text-[10px] drop-shadow-sm">{postit.label}</span>

                  {/* Número (aparece após connect) */}
                  <AnimatePresence>
                    {isOrganized && i < 3 && (
                      <motion.div
                        className="absolute -right-1 -bottom-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                      >
                        <span className="text-[10px] font-bold text-slate-800">{i + 1}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}

          {/* Laser azul */}
          {isAnimating && phase === 'laser' && (
            <motion.div
              className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-blue-400 to-transparent"
              style={{ left: `${laserPosition}%` }}
              animate={{
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  '0 0 10px rgba(59, 130, 246, 0.5)',
                  '0 0 30px rgba(59, 130, 246, 0.8)',
                  '0 0 10px rgba(59, 130, 246, 0.5)',
                ],
              }}
              transition={{ duration: 0.75, repeat: Infinity }} // 2.5x mais lento (era 0.3)
            />
          )}

          {/* Setas conectando */}
          <AnimatePresence>
            {isAnimating && showArrows && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Problema → Solução */}
                <motion.path
                  d="M 25% 35% L 25% 55%"
                  stroke="rgba(251, 191, 36, 0.6)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.25 }} // 2.5x mais lento (era 0.5)
                />
                {/* Solução → Oferta */}
                <motion.path
                  d="M 35% 65% L 55% 65%"
                  stroke="rgba(251, 191, 36, 0.6)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.25, delay: 0.5 }} // 2.5x mais lento (era 0.5 e 0.2)
                />

                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="rgba(251, 191, 36, 0.6)"
                    />
                  </marker>
                </defs>
              </svg>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Badge "Plano inicial pronto" */}
      <AnimatePresence>
        {isAnimating && showBadge && (
          <motion.div
            className="absolute bottom-8 right-8 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-full backdrop-blur-sm"
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 150 }} // 2x mais lento (era 300)
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }} // 2.5x mais lento (era 0.2)
            >
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </motion.div>
            <span className="text-xs font-medium text-green-300">Plano inicial pronto</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partículas decorativas */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              (phase === 'enter' && i === 0) ||
              (phase === 'postits' && i <= 1) ||
              (phase === 'laser' && i <= 2) ||
              (phase === 'connect' && i <= 3) ||
              (phase === 'complete' && i <= 4)
                ? 'bg-amber-400'
                : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectBusinessDesign;
