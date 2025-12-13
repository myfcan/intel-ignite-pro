'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Video, CheckCircle, TrendingUp, Sparkles, Trophy, Star } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🏆 CONSISTENCY WINS
 * Aula: Vídeos simples com I.A.
 * Conceito: Consistência vence perfeição
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectConsistencyWins({ isActive = true, duration = 33 }: CardEffectProps) {
  const [scene, setScene] = useState(0);
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  useEffect(() => {
    if (!isActive) return;
    setScene(0);
    const interval = setInterval(() => {
      setScene(prev => (prev < totalScenes - 1 ? prev + 1 : prev));
    }, sceneTime);
    return () => clearInterval(interval);
  }, [isActive, sceneTime]);

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-yellow-950 p-4 sm:p-6 flex flex-col">
      
      {/* Celebration particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400 rounded-full"
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: '110%',
              opacity: 0 
            }}
            animate={{ 
              y: '-10%',
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Título */}
        {scene <= 2 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Consistência vence <span className="text-amber-400">perfeição</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-orange-200 text-sm"
            >
              Um vídeo simples hoje, outro amanhã
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Calendário sendo preenchido */}
        {scene >= 3 && scene <= 6 && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-6"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Sua semana de vídeos</span>
            </motion.div>
            
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const hasVideo = scene >= 3 + idx * 0.5;
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1
                    }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-slate-400 text-[10px] mb-1">{day}</div>
                    <motion.div
                      animate={hasVideo ? { 
                        scale: [1, 1.2, 1],
                        backgroundColor: ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.4)', 'rgba(245, 158, 11, 0.2)']
                      } : {}}
                      transition={{ duration: 0.5 }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        hasVideo ? 'bg-amber-500/30 border border-amber-500/50' : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      {hasVideo ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Video className="w-4 h-4 text-amber-400" />
                        </motion.div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-8: Crescimento */}
        {scene >= 7 && scene <= 8 && (
          <motion.div
            key="growth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-3 mb-6"
            >
              <TrendingUp className="w-10 h-10 text-green-400" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">7</div>
                <div className="text-green-300 text-xs">vídeos/semana</div>
              </div>
            </motion.div>
            
            {/* Growth bars */}
            <div className="flex items-end gap-2 h-24">
              {[20, 35, 50, 65, 85, 100, 120].map((height, idx) => (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="w-6 rounded-t-lg bg-gradient-to-t from-amber-600 to-yellow-400"
                />
              ))}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-amber-200 text-sm text-center"
            >
              Presença consistente gera resultados
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 9-10: Mensagem final */}
        {scene >= 9 && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(245, 158, 11, 0)', '0 0 50px rgba(245, 158, 11, 0.5)', '0 0 0px rgba(245, 158, 11, 0)'],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6"
            >
              <Star className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              O hábito de repetir
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-orange-200 text-sm max-w-xs mb-4"
            >
              Vale mais do que o vídeo perfeito isolado
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 text-amber-400 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Clareza, constância e coragem</span>
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-amber-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectConsistencyWins;
