'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Film, Sliders, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

/**
 * CardEffectVideoStudio - "Vídeos criados com ajuda da I.A."
 *
 * Efeito cinematográfico:
 * 1. Player de vídeo grande aparece no centro
 * 2. Timeline na base se anima de 0% até 70% com marcadores de cena
 * 3. Cenas abstratas mudam dentro do player (pessoa, ambiente, produto)
 * 4. Painel lateral com parâmetros desliza da direita
 * 5. Sliders se movem automaticamente
 * 6. Botão "Renderizar" surge e dispara flash na timeline
 * 7. Loop: animação repete enquanto card estiver ativo
 *
 * 🆕 MELHORIAS V5:
 * - isActive: animação só inicia quando card está em foco
 * - Durações 2.5x mais lentas para melhor experiência
 * - Loop contínuo enquanto ativo
 */
export const CardEffectVideoStudio: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [phase, setPhase] = useState<'waiting' | 'enter' | 'scenes' | 'params' | 'render' | 'complete'>('waiting');
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const [showParams, setShowParams] = useState(false);
  const [showRender, setShowRender] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const scenes = [
    { color: 'from-blue-600 to-purple-600', label: 'Pessoa' },
    { color: 'from-green-600 to-teal-600', label: 'Ambiente' },
    { color: 'from-orange-600 to-red-600', label: 'Produto' },
  ];

  const params = [
    { label: 'Roteiro', value: 85 },
    { label: 'Tom', value: 70 },
    { label: 'Duração', value: 60 },
    { label: 'Estilo', value: 90 },
  ];

  // 🎬 Função para iniciar a sequência de animação
  const startAnimation = () => {
    // Limpar timers anteriores
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset estados
    setPhase('enter');
    setTimelineProgress(0);
    setCurrentScene(0);
    setShowParams(false);
    setShowRender(false);
    setIsRendered(false);

    // Durações mais lentas (2.5x)
    const ENTER_DELAY = 1250;      // era 500ms
    const PROGRESS_INTERVAL = 100; // era 40ms
    const SCENE_START = 2000;      // era 800ms
    const SCENE_INTERVAL = 1500;   // era 600ms
    const PARAMS_DELAY = 6250;     // era 2500ms
    const RENDER_DELAY = 8750;     // era 3500ms
    const COMPLETE_DELAY = 10500;  // era 4200ms
    const LOOP_DELAY = 15000;      // tempo até reiniciar

    // Timeline começa a preencher
    timersRef.current.push(setTimeout(() => {
      setPhase('scenes');
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        setTimelineProgress(progress);
        if (progress >= 70) clearInterval(progressInterval);
      }, PROGRESS_INTERVAL);
    }, ENTER_DELAY));

    // Cenas mudam
    scenes.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setCurrentScene(i), SCENE_START + i * SCENE_INTERVAL));
    });

    // Painel de parâmetros aparece
    timersRef.current.push(setTimeout(() => {
      setPhase('params');
      setShowParams(true);
    }, PARAMS_DELAY));

    // Botão render aparece
    timersRef.current.push(setTimeout(() => {
      setPhase('render');
      setShowRender(true);
    }, RENDER_DELAY));

    // Render completo
    timersRef.current.push(setTimeout(() => {
      setPhase('complete');
      setIsRendered(true);
      setTimelineProgress(100);
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
      setTimelineProgress(0);
      setCurrentScene(0);
      setShowParams(false);
      setShowRender(false);
      setIsRendered(false);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [isActive, loopCount]); // loopCount força reinício do loop

  // Se não estiver ativo, mostrar estado inicial sutil
  const isAnimating = phase !== 'waiting';

  return (
    <div className="relative w-full min-h-[500px] h-[60vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/20">
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.2) 0%, transparent 40%)
            `,
          }}
        />
      </div>

      {/* Player de vídeo principal */}
      <motion.div
        className="absolute left-4 sm:left-6 top-4 sm:top-6 bottom-20 sm:bottom-16 right-4 sm:right-32 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isAnimating ? 1 : 0.8,
          opacity: isAnimating ? 1 : 0,
        }}
        transition={{ duration: 1 }} // mais lento (era 0.4)
      >
        {/* Barra superior do player */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
          <span className="text-[10px] text-slate-500 ml-2">Preview</span>
        </div>

        {/* Área de preview - cenas mudando */}
        <div className="relative flex-1 h-[calc(100%-32px)]">
          {scenes.map((scene, i) => (
            <motion.div
              key={i}
              className={`absolute inset-0 bg-gradient-to-br ${scene.color}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isAnimating && currentScene === i ? 1 : 0 }}
              transition={{ duration: 0.75 }} // mais lento (era 0.3)
            >
              {/* Silhueta/forma abstrata */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-20 h-20 bg-white/20 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{ duration: 5, repeat: Infinity }} // mais lento (era 2)
                />
              </div>

              {/* Label da cena */}
              <motion.div
                className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 rounded text-[8px] text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: isAnimating && currentScene === i ? 1 : 0 }}
              >
                Cena: {scene.label}
              </motion.div>
            </motion.div>
          ))}

          {/* Overlay de scan */}
          {isAnimating && phase === 'scenes' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 3.75, repeat: Infinity }} // mais lento (era 1.5)
            />
          )}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        className="absolute bottom-2 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-32 h-8 sm:h-10 bg-slate-800/80 rounded-lg border border-slate-700/50 overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{
          y: isAnimating ? 0 : 20,
          opacity: isAnimating ? 1 : 0,
        }}
        transition={{ delay: 0.5 }} // mais lento (era 0.2)
      >
        {/* Track da timeline */}
        <div className="absolute top-2 left-2 right-2 h-3 bg-slate-700/50 rounded">
          {/* Progresso */}
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded"
            style={{ width: `${timelineProgress}%` }}
            animate={isRendered ? {
              boxShadow: ['0 0 0 rgba(239, 68, 68, 0)', '0 0 20px rgba(239, 68, 68, 0.5)', '0 0 0 rgba(239, 68, 68, 0)'],
            } : {}}
            transition={{ duration: 1.25 }} // mais lento (era 0.5)
          />

          {/* Marcadores de cena */}
          {[25, 50, 75].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute top-0 bottom-0 w-0.5 bg-white/30"
              style={{ left: `${pos}%` }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{
                opacity: isAnimating ? 1 : 0,
                scaleY: isAnimating ? 1 : 0,
              }}
              transition={{ delay: 1.25 + i * 0.75 }} // mais lento (era 0.5 + i * 0.3)
            />
          ))}
        </div>

        {/* Timecodes */}
        <div className="absolute bottom-1 left-2 right-2 flex justify-between">
          <span className="text-[8px] text-slate-500">00:00</span>
          <span className="text-[8px] text-slate-500">01:30</span>
        </div>
      </motion.div>

      {/* Painel de parâmetros - escondido em mobile, visível em sm+ */}
      <AnimatePresence>
        {showParams && (
          <motion.div
            className="hidden sm:block absolute right-4 top-6 bottom-16 w-24 bg-slate-800/90 rounded-lg border border-slate-700/50 p-2 space-y-2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120 }} // mais lento (era 200)
          >
            <div className="flex items-center gap-1 mb-2">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span className="text-[9px] text-slate-400">Parâmetros</span>
            </div>

            {params.map((param, i) => (
              <motion.div
                key={param.label}
                className="space-y-0.5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.25 }} // mais lento (era i * 0.1)
              >
                <span className="text-[8px] text-slate-500">{param.label}</span>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${param.value}%` }}
                    transition={{ delay: 0.75 + i * 0.375, duration: 1.25 }} // mais lento (era 0.3 + i * 0.15, duration 0.5)
                  />
                </div>
              </motion.div>
            ))}

            {/* Ícone de IA */}
            <motion.div
              className="flex items-center justify-center gap-1 pt-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3.75, repeat: Infinity }} // mais lento (era 1.5)
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[8px] text-cyan-400">I.A.</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Renderizar */}
      <AnimatePresence>
        {showRender && (
          <motion.div
            className="absolute right-4 bottom-12 sm:bottom-4 w-20 sm:w-24"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 150 }} // mais lento (era spring padrão)
          >
            <motion.button
              className={`w-full py-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-all ${
                isRendered
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
              }`}
              animate={!isRendered ? {
                boxShadow: ['0 0 0 rgba(239, 68, 68, 0)', '0 0 15px rgba(239, 68, 68, 0.4)', '0 0 0 rgba(239, 68, 68, 0)'],
              } : {}}
              transition={{ duration: 2.5, repeat: isRendered ? 0 : Infinity }} // mais lento (era 1)
            >
              {isRendered ? (
                <>✓ Pronto</>
              ) : (
                <>
                  <Film className="w-3 h-3" />
                  Renderizar
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash de render */}
      <AnimatePresence>
        {isRendered && (
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.75 }} // mais lento (era 0.3)
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardEffectVideoStudio;
