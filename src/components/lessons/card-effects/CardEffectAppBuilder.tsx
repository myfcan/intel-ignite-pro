'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Smartphone } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectAppBuilder - "A I.A. que monta um app do zero"
 *
 * Efeito cinematográfico:
 * 1. Smartphone 3D desliza da esquerda para o centro
 * 2. Fundo escurece criando foco
 * 3. Tela começa vazia, linhas de código/UI surgem de baixo para cima
 * 4. Cada bloco tem efeito de "digitação"
 * 5. Ícone de IA envia "pulsos de energia" para os blocos
 * 6. Ícone de app se forma no final com "pop" e glow
 * 7. Loop: animação repete enquanto card estiver ativo
 *
 * 🆕 MELHORIAS V5:
 * - isActive: animação só inicia quando card está em foco
 * - Durações 2.5x mais lentas para melhor experiência
 * - Loop contínuo enquanto ativo
 */
export const CardEffectAppBuilder: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'building' | 'complete' | 'idle'>('waiting');
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [showAppIcon, setShowAppIcon] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('enter');
    setVisibleBlocks(0);
    setShowAppIcon(false);

    // Durações mais lentas (2.5x)
    const ENTER_DELAY = 1000;      // era 400ms
    const BLOCK_DELAY = 450;       // era 180ms
    const COMPLETE_DELAY = 5500;   // era 2200ms
    const IDLE_DELAY = 7500;       // era 3000ms
    const LOOP_DELAY = 12000;      // tempo até reiniciar

    // Fase 1: Entrada
    timersRef.current.push(setTimeout(() => setPhase('building'), ENTER_DELAY));

    // Fase 2: Blocos aparecem um a um
    for (let i = 1; i <= 8; i++) {
      timersRef.current.push(setTimeout(() => setVisibleBlocks(i), ENTER_DELAY + i * BLOCK_DELAY));
    }

    // Fase 3: App icon aparece
    timersRef.current.push(setTimeout(() => {
      setShowAppIcon(true);
      setPhase('complete');
    }, COMPLETE_DELAY));

    // Fase 4: Idle state
    timersRef.current.push(setTimeout(() => setPhase('idle'), IDLE_DELAY));

    // 🔄 Loop: reiniciar animação após um tempo
    timersRef.current.push(setTimeout(() => {
      setLoopCount(prev => prev + 1);
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
      setVisibleBlocks(0);
      setShowAppIcon(false);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]); // loopCount força reinício do loop

  // Blocos de código/UI que serão "construídos"
  const codeBlocks = [
    { type: 'header', width: '90%', color: 'from-purple-500 to-indigo-500' },
    { type: 'nav', width: '60%', color: 'from-blue-400 to-cyan-400' },
    { type: 'hero', width: '85%', color: 'from-indigo-400 to-purple-400' },
    { type: 'button', width: '40%', color: 'from-pink-500 to-rose-500' },
    { type: 'list', width: '75%', color: 'from-cyan-400 to-blue-400' },
    { type: 'list', width: '70%', color: 'from-blue-400 to-indigo-400' },
    { type: 'card', width: '80%', color: 'from-purple-400 to-pink-400' },
    { type: 'footer', width: '65%', color: 'from-indigo-500 to-purple-500' },
  ];

  // Se não estiver ativo, mostrar estado inicial sutil
  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[500px] h-[60vh] max-h-[700px] overflow-hidden rounded-2xl">
      {/* Fundo que escurece */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
        animate={{
          opacity: isAnimating ? (phase === 'enter' ? 0.7 : 1) : 0.5,
        }}
        transition={{ duration: 0.8 }} // mais lento
      />

      {/* Grid de fundo tech */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 20px 20px, 20px 20px',
          }}
        />
      </div>

      {/* Partículas de energia flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
              y: [0, -30],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Ícone de IA com pulsos de energia */}
      <motion.div
        className="absolute top-8 right-10 z-30"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: isAnimating && phase !== 'enter' ? 1 : 0,
          scale: isAnimating && phase !== 'enter' ? 1 : 0,
        }}
        transition={{ duration: 0.6, type: 'spring' }} // mais lento
      >
        <div className="relative">
          {/* Glow pulsante */}
          <motion.div
            className="absolute inset-0 bg-purple-500 rounded-full blur-xl"
            animate={{
              opacity: phase === 'idle' ? [0.3, 0.6, 0.3] : [0.5, 0.8, 0.5],
              scale: phase === 'idle' ? [1, 1.2, 1] : [1, 1.4, 1],
            }}
            transition={{
              duration: phase === 'idle' ? 6 : 2.5, // mais lento
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Ícone */}
          <motion.div
            className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50"
            animate={{
              rotate: phase === 'building' ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 1.2, repeat: phase === 'building' ? Infinity : 0 }} // mais lento
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>

          {/* Pulsos de energia saindo do ícone */}
          <AnimatePresence>
            {phase === 'building' && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-400 rounded-full"
                    initial={{ x: '-50%', y: '-50%', opacity: 1, scale: 1 }}
                    animate={{
                      x: ['-50%', '-200%'],
                      y: ['-50%', `${50 + i * 30}%`],
                      opacity: [1, 0],
                      scale: [1, 0.5],
                    }}
                    transition={{
                      duration: 1.6, // mais lento
                      delay: i * 0.4,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Smartphone 3D - maior para o novo tamanho do card */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20"
        initial={{ x: '-150%', y: '-50%', rotateY: -30, opacity: 0 }}
        animate={{
          x: isAnimating ? '-50%' : '-150%',
          y: '-50%',
          rotateY: isAnimating ? 0 : -30,
          opacity: isAnimating ? 1 : 0,
        }}
        transition={{
          duration: 1, // mais lento (era 0.4)
          ease: [0.25, 0.46, 0.45, 0.94], // ease-out
        }}
        style={{ perspective: 1000 }}
      >
        {/* Sombra do celular */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/40 rounded-full blur-xl"
          animate={{
            scale: phase === 'complete' ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 3, repeat: Infinity }} // mais lento
        />

        {/* Frame do celular - MAIOR para novo tamanho do card */}
        <div className="relative w-56 h-96 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-[3rem] p-2.5 shadow-2xl shadow-purple-900/30">
          {/* Borda interna brilhante */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-slate-600 to-transparent opacity-30" />

          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-10">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-700 rounded-full" />
          </div>

          {/* Tela */}
          <div className="relative w-full h-full bg-slate-950 rounded-[2rem] overflow-hidden">
            {/* Gradiente da tela */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />

            {/* Área de código/UI sendo construída */}
            <div className="relative pt-12 px-4 space-y-3 h-full">
              {codeBlocks.map((block, i) => (
                <motion.div
                  key={i}
                  className="relative overflow-hidden"
                  initial={{ opacity: 0, y: 20, scaleX: 0 }}
                  animate={{
                    opacity: visibleBlocks > i ? 1 : 0,
                    y: visibleBlocks > i ? 0 : 20,
                    scaleX: visibleBlocks > i ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.5, // mais lento (era 0.2)
                    ease: 'easeOut',
                  }}
                  style={{ width: block.width, originX: 0 }}
                >
                  {/* Bloco de código - maior */}
                  <div className={`h-5 bg-gradient-to-r ${block.color} rounded-sm relative`}>
                    {/* Efeito de digitação - mais lento */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: visibleBlocks > i ? '200%' : '-100%' }}
                      transition={{ duration: 0.8, delay: 0.2 }} // mais lento
                    />

                    {/* "Código" dentro do bloco */}
                    <div className="absolute inset-0 flex items-center px-1.5 gap-1.5">
                      {[...Array(Math.floor(Math.random() * 4) + 2)].map((_, j) => (
                        <motion.div
                          key={j}
                          className="h-2 bg-white/40 rounded-full"
                          style={{ width: `${10 + Math.random() * 20}%` }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: visibleBlocks > i ? 0.6 : 0 }}
                          transition={{ delay: j * 0.1 }} // mais lento
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* App Icon final */}
              <AnimatePresence>
                {showAppIcon && (
                  <motion.div
                    className="absolute bottom-20 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200, // mais suave (era 400)
                      damping: 12,
                    }}
                  >
                    {/* Glow circular */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 3, // mais lento (era 2)
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />

                    {/* Ícone do app - maior */}
                    <motion.div
                      className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-xl"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(168, 85, 247, 0.5)',
                          '0 0 40px rgba(168, 85, 247, 0.8)',
                          '0 0 20px rgba(168, 85, 247, 0.5)',
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }} // mais lento
                    >
                      <Smartphone className="w-10 h-10 text-white" />

                      {/* Checkmark de sucesso */}
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reflexo na tela */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"
              animate={{
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />
        </div>
      </motion.div>

      {/* Label inferior */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isAnimating ? 1 : 0.3, y: 0 }}
        transition={{ delay: isAnimating ? 2 : 0, duration: 0.5 }}
      >
        <p className="text-base font-medium text-purple-300/80">
          {phase === 'waiting'
            ? 'Aguardando...'
            : phase === 'complete' || phase === 'idle'
              ? 'App pronto para validação'
              : 'Construindo seu app...'
          }
        </p>
      </motion.div>
    </div>
  );
};

export default CardEffectAppBuilder;
