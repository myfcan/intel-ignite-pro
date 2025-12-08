'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Rocket, Sparkles, Settings, BookOpen, Cpu } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectNewProfessions - "Novas profissões com I.A."
 *
 * Efeito cinematográfico:
 * 1. Fundo escurece, feixe de luz vertical surge no centro
 * 2. Silhuetas de pessoas aparecem com rótulos flutuantes
 * 3. Rótulos entram com slide-in alternado (esquerda/direita)
 * 4. Foguete é desenhado com linha neon
 * 5. Foguete faz "ignite" e sobe com rastro de partículas
 * 6. Confetti estoura quando o foguete sobe
 * 7. Frase final aparece na parte inferior
 */
export const CardEffectNewProfessions: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'silhouettes' | 'rocket' | 'ignite' | 'complete'>('waiting');
  const [visibleProfessions, setVisibleProfessions] = useState(0);
  const [rocketDrawn, setRocketDrawn] = useState(false);
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const professions = [
    { id: 1, label: 'Configurador de Agentes', icon: Settings, side: 'left' },
    { id: 2, label: 'Consultor de Automações', icon: Cpu, side: 'right' },
    { id: 3, label: 'Criador de Cursos com I.A.', icon: BookOpen, side: 'left' },
    { id: 4, label: 'Especialista em Prompt', icon: Sparkles, side: 'right' },
  ];

  // Confetti colors
  const confettiColors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#22c55e', '#eab308', '#f97316'];

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('enter');
    setVisibleProfessions(0);
    setRocketDrawn(false);
    setRocketLaunched(false);
    setShowQuote(false);
    setShowConfetti(false);

    // Durações mais lentas (2-2.5x)
    const SILHOUETTES_DELAY = 1250;
    const BASE_PROF_DELAY = 2000;
    const PROF_INCREMENT = 1000;
    const ROCKET_DELAY = 7000;
    const IGNITE_DELAY = 8750;
    const CONFETTI_DELAY = 9000; // Confetti logo após ignite
    const QUOTE_DELAY = 10500;
    const LOOP_DELAY = 15000;

    // Fase silhouettes
    timersRef.current.push(setTimeout(() => setPhase('silhouettes'), SILHOUETTES_DELAY));

    // Profissões aparecem
    professions.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setVisibleProfessions(i + 1), BASE_PROF_DELAY + i * PROF_INCREMENT));
    });

    // Foguete desenha
    timersRef.current.push(setTimeout(() => {
      setPhase('rocket');
      setRocketDrawn(true);
    }, ROCKET_DELAY));

    // Ignite
    timersRef.current.push(setTimeout(() => {
      setPhase('ignite');
      setRocketLaunched(true);
    }, IGNITE_DELAY));

    // Confetti burst
    timersRef.current.push(setTimeout(() => {
      setShowConfetti(true);
    }, CONFETTI_DELAY));

    // Quote
    timersRef.current.push(setTimeout(() => {
      setPhase('complete');
      setShowQuote(true);
    }, QUOTE_DELAY));

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
      setVisibleProfessions(0);
      setRocketDrawn(false);
      setRocketLaunched(false);
      setShowQuote(false);
      setShowConfetti(false);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]);

  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/20">
      {/* Background que escurece */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating && phase !== 'enter' ? 0.3 : 0 }}
        transition={{ duration: 1.25 }}
      />

      {/* Estrelas de fundo */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: isAnimating ? [0.2, 0.8, 0.2] : 0.2,
              scale: isAnimating ? [0.8, 1.2, 0.8] : 0.8,
            }}
            transition={{
              duration: 3.75 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Feixe de luz central */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating && phase !== 'enter' ? 1 : 0 }}
        transition={{ duration: 1.25 }}
      >
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(to top, rgba(244, 63, 94, 0.3), rgba(244, 63, 94, 0.1), transparent)',
          }}
        />
      </motion.div>

      {/* Silhuetas com rótulos */}
      <div className="absolute inset-x-0 bottom-20 sm:bottom-16 flex justify-center items-end gap-3 sm:gap-4 px-2">
        {professions.map((prof, i) => {
          const Icon = prof.icon;
          const isVisible = isAnimating && visibleProfessions > i;

          return (
            <motion.div
              key={prof.id}
              className="relative flex flex-col items-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{
                y: isVisible ? 0 : 20,
                opacity: isVisible ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              {/* Silhueta */}
              <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-b from-slate-600/80 to-slate-800/80 rounded-t-full flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white/50" />
              </div>

              {/* Rótulo flutuante */}
              <motion.div
                className={`absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-rose-500/20 border border-rose-500/40 rounded-lg backdrop-blur-sm whitespace-nowrap`}
                initial={{
                  y: -10,
                  opacity: 0,
                }}
                animate={{
                  y: isVisible ? 0 : -10,
                  opacity: isVisible ? 1 : 0,
                }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
                  <span className="text-[6px] sm:text-[8px] text-rose-300 font-medium">{prof.label}</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Foguete */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        initial={{ bottom: '35%' }}
        animate={{
          bottom: isAnimating && rocketLaunched ? '100%' : '35%',
        }}
        transition={{
          duration: isAnimating && rocketLaunched ? 2.5 : 0,
          ease: 'easeIn',
        }}
      >
        {/* Corpo do foguete - REDESENHADO */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: isAnimating && rocketDrawn ? 1 : 0,
            scale: isAnimating && rocketDrawn ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 120 }}
        >
          {/* Glow do foguete */}
          <motion.div
            className="absolute inset-0 bg-rose-500 rounded-full blur-xl"
            animate={isAnimating && rocketLaunched ? {
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.3, 1],
            } : { opacity: 0.3 }}
            transition={{ duration: 0.75, repeat: Infinity }}
          />

          {/* Foguete SVG - Design corrigido e centralizado */}
          <svg width="48" height="80" viewBox="0 0 48 80" className="relative">
            {/* Corpo principal do foguete */}
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Ponta do foguete */}
            <path
              d="M24 0 L32 20 L16 20 Z"
              fill="url(#bodyGradient)"
            />

            {/* Corpo cilíndrico */}
            <rect x="16" y="20" width="16" height="35" fill="url(#bodyGradient)" />

            {/* Janela circular */}
            <circle cx="24" cy="30" r="6" fill="#22d3ee" stroke="#e2e8f0" strokeWidth="2" />

            {/* Asa esquerda - corrigida e simétrica */}
            <path
              d="M16 40 L6 55 L6 60 L16 55 Z"
              fill="#f43f5e"
            />

            {/* Asa direita - corrigida e simétrica */}
            <path
              d="M32 40 L42 55 L42 60 L32 55 Z"
              fill="#f43f5e"
            />

            {/* Base do foguete */}
            <rect x="14" y="55" width="20" height="8" fill="#64748b" rx="2" />

            {/* Bocal central da turbina */}
            <rect x="20" y="63" width="8" height="6" fill="#475569" rx="1" />
          </svg>

          {/* Chama/Turbina - CORRIGIDA E CENTRALIZADA */}
          <AnimatePresence>
            {isAnimating && rocketLaunched && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: '80px' }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Container centralizado para a chama */}
                <div className="relative flex justify-center">
                  {/* Chama principal - centralizada */}
                  <motion.div
                    className="w-6 h-16 rounded-b-full"
                    style={{
                      background: 'linear-gradient(to bottom, #facc15, #f97316, transparent)',
                    }}
                    animate={{
                      scaleY: [1, 1.2, 1],
                      scaleX: [1, 0.9, 1],
                    }}
                    transition={{
                      duration: 0.15,
                      repeat: Infinity,
                    }}
                  />

                  {/* Chama interna */}
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-10 rounded-b-full"
                    style={{
                      background: 'linear-gradient(to bottom, #fef08a, #fbbf24, transparent)',
                    }}
                    animate={{
                      scaleY: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 0.1,
                      repeat: Infinity,
                    }}
                  />

                  {/* Faíscas centralizadas */}
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      style={{
                        left: '50%',
                        top: '30%',
                      }}
                      animate={{
                        y: [0, 30 + Math.random() * 25],
                        x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
                        opacity: [1, 0],
                        scale: [1, 0.3],
                      }}
                      transition={{
                        duration: 0.5 + Math.random() * 0.3,
                        repeat: Infinity,
                        delay: Math.random() * 0.3,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Rastro de partículas do foguete */}
      <AnimatePresence>
        {isAnimating && rocketLaunched && [...Array(15)].map((_, i) => (
          <motion.div
            key={`trail-${i}`}
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full"
            style={{ bottom: '35%' }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, 100 + i * 10],
              x: (Math.random() - 0.5) * 30,
            }}
            transition={{
              duration: 2,
              delay: i * 0.125,
            }}
          />
        ))}
      </AnimatePresence>

      {/* 🎊 CONFETTI BURST */}
      <AnimatePresence>
        {isAnimating && showConfetti && (
          <>
            {/* Confetti pieces */}
            {[...Array(50)].map((_, i) => {
              const startX = 50 + (Math.random() - 0.5) * 20;
              const startY = 30;
              const endX = startX + (Math.random() - 0.5) * 80;
              const endY = startY + Math.random() * 60 + 20;
              const rotation = Math.random() * 720 - 360;
              const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
              const size = Math.random() * 8 + 4;
              const isCircle = Math.random() > 0.5;

              return (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute"
                  style={{
                    left: `${startX}%`,
                    top: `${startY}%`,
                    width: isCircle ? size : size * 0.4,
                    height: size,
                    backgroundColor: color,
                    borderRadius: isCircle ? '50%' : '2px',
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0.5],
                    x: `${(endX - startX)}%`,
                    y: `${(endY - startY)}%`,
                    rotate: rotation,
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              );
            })}

            {/* Sparkle stars */}
            {[...Array(12)].map((_, i) => {
              const x = 30 + Math.random() * 40;
              const y = 20 + Math.random() * 30;

              return (
                <motion.div
                  key={`star-${i}`}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2 + Math.random() * 0.5,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Frase final */}
      <AnimatePresence>
        {isAnimating && showQuote && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[280px] text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.25 }}
          >
            <p className="text-xs text-rose-300/80 font-medium">
              "Quem aprende agora escolhe onde quer estar nessa cena"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge decorativo */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
        transition={{ delay: isAnimating ? 2.5 : 0 }}
      >
        <Rocket className="w-3 h-3 text-rose-400" />
        <span className="text-[9px] text-rose-300">Novas carreiras</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              (phase === 'enter' && i === 0) ||
              (phase === 'silhouettes' && i <= visibleProfessions && i <= 2) ||
              ((phase === 'rocket' || phase === 'ignite') && i <= 3) ||
              (phase === 'complete' && i <= 4)
                ? 'bg-rose-400'
                : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectNewProfessions;
