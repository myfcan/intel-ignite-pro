'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, User, MessageSquare, Hand, Sparkles, CheckCircle, Camera } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 📄 SCRIPT GUIDE
 * Aula: Vídeos simples com I.A.
 * Conceito: Use o roteiro como guia, não como teleprompter
 * Ajuste X: 11 cenas (~33 segundos)
 */
export function CardEffectScriptGuide({ isActive = true, duration = 33 }: CardEffectProps) {
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

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-4 sm:p-6 flex flex-col">
      
      {/* Soft glow */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 50%, rgba(20, 184, 166, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
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
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <FileText className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              Roteiro, não <span className="text-emerald-400">teleprompter</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-teal-200 text-sm"
            >
              Guia que te ajuda sem engessar
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Pessoa com cartão */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="person"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="relative flex items-center gap-6">
              {/* Person */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-2">
                  <User className="w-10 h-10 text-white" />
                </div>
                <Camera className="w-6 h-6 text-teal-400" />
              </motion.div>
              
              {/* Script card in hand */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-32 rounded-lg bg-white/10 border border-white/20 p-2"
                >
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2 bg-white/20 rounded mb-1.5" style={{ width: `${80 - i * 10}%` }} />
                  ))}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-2 -left-2"
                >
                  <Hand className="w-8 h-8 text-amber-400" />
                </motion.div>
              </motion.div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-teal-200 text-sm text-center"
            >
              Consulta o cartão, mas fala com suas palavras
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 6-7: Alternância de foco */}
        {scene >= 6 && scene <= 7 && (
          <motion.div
            key="alternating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-8">
              {/* Looking at camera */}
              <motion.div
                animate={{ 
                  opacity: scene === 6 ? 1 : 0.4,
                  scale: scene === 6 ? 1.1 : 1
                }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/30 flex items-center justify-center mb-2">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <span className="text-emerald-300 text-xs">Falando</span>
              </motion.div>
              
              <motion.div
                animate={{ 
                  x: scene === 6 ? -10 : 10
                }}
                transition={{ duration: 1 }}
              >
                <MessageSquare className="w-6 h-6 text-teal-400" />
              </motion.div>
              
              {/* Looking at script */}
              <motion.div
                animate={{ 
                  opacity: scene === 7 ? 1 : 0.4,
                  scale: scene === 7 ? 1.1 : 1
                }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-teal-500/30 flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-teal-400" />
                </div>
                <span className="text-teal-300 text-xs">Consultando</span>
              </motion.div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-teal-200 text-sm text-center"
            >
              Alterna naturalmente entre falar e consultar
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 8-9: Dicas */}
        {scene >= 8 && scene <= 9 && (
          <motion.div
            key="tips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {[
                'Deixe o roteiro perto, não na mão',
                'Fale com suas próprias palavras',
                'Consulte quando enroscar'
              ].map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white text-sm">{tip}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cena 10: Mensagem final */}
        {scene >= 10 && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(16, 185, 129, 0)', '0 0 50px rgba(16, 185, 129, 0.5)', '0 0 0px rgba(16, 185, 129, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-2"
            >
              Leveza e naturalidade
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-teal-200 text-sm max-w-xs"
            >
              O roteiro é apoio, não prisão. Você continua sendo você.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full ${i <= scene ? 'bg-emerald-400' : 'bg-slate-700'}`}
            initial={{ width: 6 }}
            animate={{ width: i === scene ? 20 : 6 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardEffectScriptGuide;
