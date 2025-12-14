'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, UserPlus, ExternalLink, MousePointer, Sparkles, CheckCircle, Target } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 🎯 CALL TO ACTION
 * Aula: Vídeos simples com I.A.
 * Conceito: O convite final que gera ação
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectCallToAction({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const ctaExamples = [
    { icon: UserPlus, text: '"Me siga para ver a parte 2"', color: '#8b5cf6' },
    { icon: MessageCircle, text: '"Comenta \'planilha\' que eu te mando"', color: '#3b82f6' },
    { icon: ExternalLink, text: '"Clica no link da bio"', color: '#22c55e' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 70% 70%, rgba(34, 197, 94, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(34, 197, 94, 0.4) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Target className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              E agora, o que a pessoa <span className="text-green-400">faz</span>?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-emerald-200 text-sm"
            >
              Convites simples que geram ação
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-6: Exemplos de CTA */}
        {scene >= 3 && scene <= 6 && (
          <motion.div
            key="examples"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {ctaExamples.map((cta, idx) => {
                const Icon = cta.icon;
                const shouldShow = scene >= 3 + idx;
                const isActive = scene === 3 + idx;
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3, 
                      x: shouldShow ? 0 : 50,
                      scale: isActive ? 1.02 : 1
                    }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <motion.div
                      animate={isActive ? {
                        boxShadow: [`0 0 0px ${cta.color}`, `0 0 25px ${cta.color}`, `0 0 0px ${cta.color}`]
                      } : {}}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                      className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: `${cta.color}15`,
                        borderColor: `${cta.color}40`
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${cta.color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: cta.color }} />
                      </div>
                      <span className="text-white text-sm flex-1">{cta.text}</span>
                      {shouldShow && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <ArrowRight className="w-5 h-5" style={{ color: cta.color }} />
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cenas 7-8: Setas convergindo */}
        {scene >= 7 && scene <= 8 && (
          <motion.div
            key="arrows"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="relative w-48 h-48">
              {/* Central target */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center"
              >
                <MousePointer className="w-8 h-8 text-green-400" />
              </motion.div>
              
              {/* Arrows pointing inward */}
              {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="absolute inset-0 m-auto w-6 h-6"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-60px)`
                  }}
                >
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: idx * 0.1 }}
                    style={{ transform: `rotate(${180 + angle}deg)` }}
                  >
                    <ArrowRight className="w-6 h-6 text-green-400" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-green-200 text-center text-sm"
            >
              Um caminho único e iluminado
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
                boxShadow: ['0 0 0px rgba(34, 197, 94, 0)', '0 0 50px rgba(34, 197, 94, 0.5)', '0 0 0px rgba(34, 197, 94, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Próximo passo claro
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-emerald-200 text-sm max-w-xs mb-4"
            >
              Todo vídeo precisa apontar uma ação específica
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 text-green-400 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>A I.A. te ajuda a escolher a chamada certa</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-green-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectCallToAction;
