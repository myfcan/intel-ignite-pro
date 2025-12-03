'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, FileText, Highlighter } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectContentCreator - "A I.A. como coautora de livros e cursos"
 *
 * Efeito cinematográfico:
 * 1. Páginas digitais caem em slow-motion como folhas
 * 2. Empilham em três blocos: Sumário, Capítulos, Exemplos
 * 3. Palavras-chave são "escritas" em tempo real
 * 4. Marcador neon roxo destaca trechos
 * 5. Páginas se unem em livro que "fecha" e vira de lado
 * 6. Player de vídeo miniatura aparece com botão play pulsando
 *
 * 🆕 MELHORIAS V5:
 * - isActive: animação só inicia quando card está em foco
 * - Durações 2.5x mais lentas para melhor experiência
 * - Loop contínuo enquanto ativo
 */
export const CardEffectContentCreator: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'falling' | 'stacking' | 'writing' | 'highlight' | 'book' | 'complete'>('waiting');
  const [fallenPages, setFallenPages] = useState(0);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const pageTypes = [
    { id: 1, label: 'Sumário', color: 'from-blue-500/80 to-cyan-500/80', keywords: ['Título', 'Introdução', 'Módulo 1'] },
    { id: 2, label: 'Capítulos', color: 'from-purple-500/80 to-indigo-500/80', keywords: ['Aula 1', 'Conceito', 'Prática'] },
    { id: 3, label: 'Exemplos', color: 'from-pink-500/80 to-rose-500/80', keywords: ['Exemplo', 'Exercício', 'Quiz'] },
  ];

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('falling');
    setFallenPages(0);
    setShowHighlight(false);
    setShowBook(false);
    setShowPlayer(false);

    // Durações mais lentas (2.5x)
    const FALL_DELAY = 500;         // era 200ms
    const FALL_INTERVAL = 500;      // era 200ms
    const STACKING_DELAY = 4500;    // era 1800ms
    const WRITING_DELAY = 5500;     // era 2200ms
    const HIGHLIGHT_DELAY = 7500;   // era 3000ms
    const BOOK_DELAY = 9500;        // era 3800ms
    const COMPLETE_DELAY = 11250;   // era 4500ms
    const LOOP_DELAY = 15000;       // tempo até reiniciar

    // Páginas caem
    for (let i = 0; i < 8; i++) {
      timersRef.current.push(setTimeout(() => setFallenPages(i + 1), FALL_DELAY + i * FALL_INTERVAL));
    }

    // Fase stacking
    timersRef.current.push(setTimeout(() => setPhase('stacking'), STACKING_DELAY));

    // Fase writing
    timersRef.current.push(setTimeout(() => setPhase('writing'), WRITING_DELAY));

    // Marcador destaca
    timersRef.current.push(setTimeout(() => {
      setPhase('highlight');
      setShowHighlight(true);
    }, HIGHLIGHT_DELAY));

    // Livro se forma
    timersRef.current.push(setTimeout(() => {
      setPhase('book');
      setShowBook(true);
    }, BOOK_DELAY));

    // Player aparece
    timersRef.current.push(setTimeout(() => {
      setPhase('complete');
      setShowPlayer(true);
    }, COMPLETE_DELAY));

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
      setFallenPages(0);
      setShowHighlight(false);
      setShowBook(false);
      setShowPlayer(false);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]); // loopCount força reinício do loop

  // Se não estiver ativo, mostrar estado inicial sutil
  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[500px] h-[60vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)
            `,
          }}
        />
      </div>

      {/* Páginas caindo */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => {
          const isVisible = isAnimating && fallenPages > i;
          const stackIndex = i % 3;
          const isStacked = isAnimating && phase !== 'falling';

          return (
            <motion.div
              key={i}
              className="absolute w-16 h-20 bg-white/90 rounded shadow-lg"
              style={{
                left: `${15 + Math.random() * 70}%`,
              }}
              initial={{
                y: -100,
                x: 0,
                rotate: -20 + Math.random() * 40,
                opacity: 0,
              }}
              animate={{
                y: isStacked
                  ? 140 + stackIndex * 5 // Empilhado
                  : isVisible
                    ? 80 + Math.random() * 60 // Caindo
                    : -100,
                x: isStacked
                  ? (stackIndex === 0 ? -80 : stackIndex === 1 ? 0 : 80)
                  : 0,
                rotate: isStacked ? 0 : isVisible ? -10 + Math.random() * 20 : -20,
                opacity: isVisible ? 1 : 0,
                scale: isStacked ? 0.8 : 1,
              }}
              transition={{
                duration: isStacked ? 1.25 : 3.0, // 2.5x mais lento
                ease: isStacked ? 'easeOut' : [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {/* Linhas de texto na página */}
              <div className="p-2 space-y-1">
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="h-1 bg-slate-300 rounded"
                    style={{ width: `${50 + Math.random() * 40}%` }}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Três blocos empilhados com labels */}
      <AnimatePresence>
        {isAnimating && phase !== 'falling' && !showBook && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-8">
            {pageTypes.map((type, i) => (
              <motion.div
                key={type.id}
                className="relative"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
              >
                {/* Stack de páginas */}
                <div className={`relative w-20 h-24 bg-gradient-to-b ${type.color} rounded-lg shadow-xl`}>
                  {/* Páginas empilhadas atrás */}
                  <div className="absolute -bottom-1 -right-1 w-full h-full bg-white/40 rounded-lg -z-10" />
                  <div className="absolute -bottom-2 -right-2 w-full h-full bg-white/20 rounded-lg -z-20" />

                  {/* Keywords sendo escritas */}
                  <div className="p-2 space-y-1">
                    {type.keywords.map((kw, ki) => (
                      <motion.div
                        key={ki}
                        className="text-[8px] text-white/90 font-medium"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: isAnimating ? 1 : 0, x: 0 }}
                        transition={{ delay: 5.5 + ki * 0.5 }} // 2.5x mais lento
                      >
                        {kw}
                        <motion.span
                          className="inline-block w-1 h-2 bg-white ml-0.5"
                          animate={{ opacity: isAnimating ? [1, 0, 1] : 0 }}
                          transition={{ duration: 1.25, repeat: 3 }} // 2.5x mais lento
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Marcador neon passando */}
                  {isAnimating && showHighlight && i === 1 && (
                    <motion.div
                      className="absolute top-3 left-1 w-16 h-3 bg-purple-400/40 rounded-sm"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.75 }} // 2.5x mais lento
                      style={{ originX: 0 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-purple-400/60 blur-sm"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 1.25, repeat: Infinity }} // 2.5x mais lento
                      />
                    </motion.div>
                  )}
                </div>

                {/* Label */}
                <motion.span
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  {type.label}
                </motion.span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Livro fechado */}
      <AnimatePresence>
        {isAnimating && showBook && (
          <motion.div
            className="absolute left-1/3 top-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Capa do livro */}
            <div className="relative w-28 h-36 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-r-lg shadow-2xl transform perspective-500 rotateY-10">
              {/* Lombada */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-purple-800 to-purple-600 rounded-l-sm" />

              {/* Páginas laterais */}
              <div className="absolute right-0 top-1 bottom-1 w-1 bg-gradient-to-l from-slate-200 to-slate-100 rounded-r-sm">
                <div className="w-full h-full flex flex-col justify-evenly">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-slate-300" />
                  ))}
                </div>
              </div>

              {/* Título na capa */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <BookOpen className="w-8 h-8 text-white/80 mb-2" />
                <motion.span
                  className="text-xs text-white/90 font-bold text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Seu Curso
                </motion.span>
                <motion.span
                  className="text-[8px] text-white/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  com I.A.
                </motion.span>
              </div>

              {/* Brilho */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-r-lg"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 5, repeat: Infinity }} // 2.5x mais lento
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player de vídeo miniatura */}
      <AnimatePresence>
        {isAnimating && showPlayer && (
          <motion.div
            className="absolute right-8 top-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="relative w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
              {/* Thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-slate-900" />

              {/* Linhas de vídeo */}
              <div className="absolute inset-2 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Botão play pulsando */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3.75, repeat: Infinity }} // 2.5x mais lento
              >
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-purple-600 ml-0.5" fill="currentColor" />
                </div>
              </motion.div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                <motion.div
                  className="h-full bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: '30%' }}
                  transition={{ delay: 1.25, duration: 2.5 }} // 2.5x mais lento
                />
              </div>
            </div>

            {/* Label */}
            <motion.span
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Também em vídeo
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label inferior */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-purple-300/70 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: isAnimating ? 1 : 0 }}
        transition={{ delay: 11.25 }} // 2.5x mais lento
      >
        Conteúdo pronto para publicar
      </motion.div>
    </div>
  );
};

export default CardEffectContentCreator;
