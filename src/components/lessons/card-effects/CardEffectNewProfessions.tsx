'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Rocket, Sparkles, Settings, BookOpen, Cpu } from 'lucide-react';

/**
 * CardEffectNewProfessions - "Novas profissões com I.A."
 *
 * Efeito cinematográfico:
 * 1. Fundo escurece, feixe de luz vertical surge no centro
 * 2. Silhuetas de pessoas aparecem com rótulos flutuantes
 * 3. Rótulos entram com slide-in alternado (esquerda/direita)
 * 4. Foguete é desenhado com linha neon
 * 5. Foguete faz "ignite" e sobe com rastro de partículas
 * 6. Frase final aparece na parte inferior
 */
export const CardEffectNewProfessions: React.FC = () => {
  const [phase, setPhase] = useState<'enter' | 'silhouettes' | 'rocket' | 'ignite' | 'complete'>('enter');
  const [visibleProfessions, setVisibleProfessions] = useState(0);
  const [rocketDrawn, setRocketDrawn] = useState(false);
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  const professions = [
    { id: 1, label: 'Configurador de Agentes', icon: Settings, side: 'left' },
    { id: 2, label: 'Consultor de Automações', icon: Cpu, side: 'right' },
    { id: 3, label: 'Criador de Cursos com I.A.', icon: BookOpen, side: 'left' },
    { id: 4, label: 'Especialista em Prompt', icon: Sparkles, side: 'right' },
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Fase silhouettes
    timers.push(setTimeout(() => setPhase('silhouettes'), 500));

    // Profissões aparecem
    professions.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleProfessions(i + 1), 800 + i * 400));
    });

    // Foguete desenha
    timers.push(setTimeout(() => {
      setPhase('rocket');
      setRocketDrawn(true);
    }, 2800));

    // Ignite
    timers.push(setTimeout(() => {
      setPhase('ignite');
      setRocketLaunched(true);
    }, 3500));

    // Quote
    timers.push(setTimeout(() => {
      setPhase('complete');
      setShowQuote(true);
    }, 4200));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full h-72 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/20">
      {/* Background que escurece */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== 'enter' ? 0.3 : 0 }}
        transition={{ duration: 0.5 }}
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
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Feixe de luz central */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase !== 'enter' ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(to top, rgba(244, 63, 94, 0.3), rgba(244, 63, 94, 0.1), transparent)',
          }}
        />
      </motion.div>

      {/* Silhuetas com rótulos */}
      <div className="absolute inset-x-0 bottom-16 flex justify-center items-end gap-2">
        {professions.map((prof, i) => {
          const Icon = prof.icon;
          const isVisible = visibleProfessions > i;

          return (
            <motion.div
              key={prof.id}
              className="relative flex flex-col items-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{
                y: isVisible ? 0 : 20,
                opacity: isVisible ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {/* Silhueta */}
              <div className="w-8 h-12 bg-gradient-to-b from-slate-600/80 to-slate-800/80 rounded-t-full flex items-center justify-center">
                <User className="w-4 h-4 text-white/50" />
              </div>

              {/* Rótulo flutuante */}
              <motion.div
                className={`absolute -top-8 ${prof.side === 'left' ? '-left-2' : '-right-2'} px-2 py-1 bg-rose-500/20 border border-rose-500/40 rounded-lg backdrop-blur-sm whitespace-nowrap`}
                initial={{
                  x: prof.side === 'left' ? -20 : 20,
                  opacity: 0,
                }}
                animate={{
                  x: isVisible ? 0 : (prof.side === 'left' ? -20 : 20),
                  opacity: isVisible ? 1 : 0,
                }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-3 h-3 text-rose-400" />
                  <span className="text-[8px] text-rose-300 font-medium">{prof.label}</span>
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
          bottom: rocketLaunched ? '100%' : '35%',
        }}
        transition={{
          duration: rocketLaunched ? 1 : 0,
          ease: 'easeIn',
        }}
      >
        {/* Corpo do foguete */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: rocketDrawn ? 1 : 0,
            scale: rocketDrawn ? 1 : 0,
          }}
          transition={{ type: 'spring' }}
        >
          {/* Glow do foguete */}
          <motion.div
            className="absolute inset-0 bg-rose-500 rounded-full blur-xl"
            animate={rocketLaunched ? {
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.3, 1],
            } : { opacity: 0.3 }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />

          {/* Foguete SVG simplificado */}
          <div className="relative w-12 h-20">
            {/* Corpo */}
            <div className="absolute inset-x-2 top-0 bottom-4 bg-gradient-to-b from-slate-200 to-slate-400 rounded-t-full" />

            {/* Janela */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-300" />

            {/* Asas */}
            <div className="absolute bottom-4 left-0 w-3 h-6 bg-rose-500 rounded-tl-full transform -skew-x-12" />
            <div className="absolute bottom-4 right-0 w-3 h-6 bg-rose-500 rounded-tr-full transform skew-x-12" />

            {/* Base */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-4 bg-slate-500 rounded-b-lg" />
          </div>

          {/* Chama/Ignite */}
          <AnimatePresence>
            {rocketLaunched && (
              <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Chama principal */}
                <div className="w-6 h-12 bg-gradient-to-b from-yellow-400 via-orange-500 to-transparent rounded-b-full" />

                {/* Faíscas */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    style={{
                      left: `${40 + Math.random() * 20}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      y: [0, 20 + Math.random() * 20],
                      opacity: [1, 0],
                      scale: [1, 0.5],
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      delay: Math.random() * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Rastro de partículas do foguete */}
      <AnimatePresence>
        {rocketLaunched && [...Array(15)].map((_, i) => (
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
              duration: 0.8,
              delay: i * 0.05,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Frase final */}
      <AnimatePresence>
        {showQuote && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[280px] text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Rocket className="w-3 h-3 text-rose-400" />
        <span className="text-[9px] text-rose-300">Novas carreiras</span>
      </motion.div>
    </div>
  );
};

export default CardEffectNewProfessions;
