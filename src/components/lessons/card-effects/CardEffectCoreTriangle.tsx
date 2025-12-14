'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users, Award, Triangle, CheckCircle, Sparkles } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

/**
 * 🔺 CORE TRIANGLE - Aula 9
 * Contexto: "tema, público e promessa"
 * As 3 decisões fundamentais antes de criar conteúdo profundo
 */
export function CardEffectCoreTriangle({ isActive = true, duration = 33 }: CardEffectProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= totalScenes - 1) return prev;
        return prev + 1;
      });
    }, sceneTime);
    return () => clearInterval(interval);
  }, [isActive, sceneTime]);

  if (!isActive) return null;

  const vertices = [
    { id: 'tema', icon: Target, label: 'Tema', desc: 'O que você ensina', color: 'from-violet-500 to-purple-600' },
    { id: 'publico', icon: Users, label: 'Público', desc: 'Para quem é', color: 'from-blue-500 to-cyan-600' },
    { id: 'promessa', icon: Award, label: 'Promessa', desc: 'Qual transformação', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 rounded-2xl">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-8 flex-1">
        <AnimatePresence mode="wait">
          {/* Fase 1: Cenas 0-5 - Triângulo formando */}
          {currentScene <= 5 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 max-w-md w-full"
            >
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Tríade Central
              </motion.h2>

              {/* Triângulo visual */}
              <div className="relative w-64 h-56 sm:w-80 sm:h-72">
                {/* Linhas do triângulo */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="triangle-gradient-9" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  
                  {currentScene >= 1 && (
                    <motion.line
                      x1="50" y1="15" x2="15" y2="80"
                      stroke="url(#triangle-gradient-9)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                  {currentScene >= 2 && (
                    <motion.line
                      x1="15" y1="80" x2="85" y2="80"
                      stroke="url(#triangle-gradient-9)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                  {currentScene >= 3 && (
                    <motion.line
                      x1="85" y1="80" x2="50" y2="15"
                      stroke="url(#triangle-gradient-9)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </svg>

                {/* Vértices */}
                {vertices.map((vertex, idx) => {
                  const positions = [
                    { top: '0%', left: '50%', transform: 'translate(-50%, 0)' },
                    { bottom: '0%', left: '0%', transform: 'translate(0, 0)' },
                    { bottom: '0%', right: '0%', transform: 'translate(0, 0)' },
                  ];
                  return (
                    <motion.div
                      key={vertex.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: currentScene >= idx + 1 ? 1 : 0, 
                        opacity: currentScene >= idx + 1 ? 1 : 0 
                      }}
                      transition={{ delay: idx * 0.3, type: 'spring' }}
                      className="absolute flex flex-col items-center gap-1"
                      style={positions[idx]}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${vertex.color} flex items-center justify-center shadow-lg`}>
                        <vertex.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white">{vertex.label}</span>
                      <span className="text-[10px] text-white/60">{vertex.desc}</span>
                    </motion.div>
                  );
                })}
              </div>

              {currentScene >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-purple-200/70 text-sm text-center"
                >
                  Três decisões antes de criar qualquer conteúdo
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Fase 2: Cenas 6-10 - Triângulo completo */}
          {currentScene > 5 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center max-w-lg"
            >
              <motion.div
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                  <Triangle className="w-14 h-14 sm:w-18 sm:h-18 text-white" />
                </div>

                {/* Ícones orbitando */}
                {vertices.map((vertex, i) => (
                  <motion.div
                    key={vertex.id}
                    className="absolute"
                    style={{ top: '50%', left: '50%' }}
                    animate={{
                      x: Math.cos((i * 120 + currentScene * 20) * Math.PI / 180) * 70 - 15,
                      y: Math.sin((i * 120 + currentScene * 20) * Math.PI / 180) * 70 - 15,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${vertex.color} flex items-center justify-center`}>
                      <vertex.icon className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  Fundação Sólida
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-purple-200/80 text-sm sm:text-base"
                >
                  Tema + Público + Promessa = Base para qualquer conteúdo profundo que você criar
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-500/30"
              >
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Clareza antes da criação</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1.5 mt-4 pb-4 sm:pb-6">
        {Array.from({ length: totalScenes }).map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentScene ? 'w-6 bg-purple-400' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectCoreTriangle;