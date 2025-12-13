'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Shuffle, ArrowRight, CheckCircle, XCircle, Clock, Target, Sparkles } from 'lucide-react';
import { CardEffectProps } from './types';

/**
 * 📊 TREND VS CHANGE
 * Aula: Introdução à I.A.
 * Conceito: Diferenciar tendência passageira de mudança real
 * Ajuste X2: 11 cenas (~33 segundos)
 */
export function CardEffectTrendVsChange({ isActive = true, duration = 33 }: CardEffectProps) {
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

  const trendItems = ["Surge rápido", "Muita promessa", "Pode desaparecer", "Modinha"];
  const realItems = ["Transforma processos", "Cria novos mercados", "Veio para ficar", "Impacto duradouro"];

  const examples = [
    { trend: "Fidget Spinner", real: "Smartphones" },
    { trend: "Google Glass v1", real: "Cloud Computing" },
    { trend: "Segway", real: "E-commerce" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 p-4 sm:p-6 flex flex-col">
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.4) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        {/* Cenas 0-2: Título e intro */}
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
              animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.8 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-2xl"
            >
              <Shuffle className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
            >
              <span className="text-amber-400">Tendência</span> vs <span className="text-emerald-400">Mudança</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-amber-200 text-sm"
            >
              Como identificar o que veio para ficar
            </motion.p>
          </motion.div>
        )}

        {/* Cenas 3-5: Comparação lado a lado */}
        {scene >= 3 && scene <= 5 && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 grid grid-cols-2 gap-3"
          >
            {/* Tendência */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3 text-center">
                <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <h3 className="text-amber-400 font-bold text-sm">TENDÊNCIA</h3>
              </div>
              <div className="space-y-2 flex-1">
                {trendItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: scene >= 4 ? 1 : 0.3, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-amber-500/60" />
                    <span className="text-amber-200/80 text-xs">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mudança Real */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3 text-center">
                <Shuffle className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <h3 className="text-emerald-400 font-bold text-sm">MUDANÇA REAL</h3>
              </div>
              <div className="space-y-2 flex-1">
                {realItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: scene >= 5 ? 1 : 0.3, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-200 text-xs">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cenas 6-7: Exemplos históricos */}
        {scene >= 6 && scene <= 7 && (
          <motion.div
            key="examples"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-bold text-white mb-4">Exemplos Históricos:</h3>
            <div className="space-y-3 w-full max-w-sm">
              {examples.map((ex, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-xs">{ex.trend}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/50" />
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300 text-xs">{ex.real}</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cena 8: Teste do tempo */}
        {scene === 8 && (
          <motion.div
            key="timetest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full border-4 border-amber-500/30 flex items-center justify-center mb-6"
            >
              <Clock className="w-12 h-12 text-amber-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">O Teste do Tempo</h3>
            <p className="text-amber-300 text-center text-sm max-w-xs">
              Mudanças reais resistem ao tempo
            </p>
          </motion.div>
        )}

        {/* Cena 9: Veredicto da I.A. */}
        {scene === 9 && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(16, 185, 129, 0.3)', '0 0 50px rgba(16, 185, 129, 0.6)', '0 0 0px rgba(16, 185, 129, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mb-4"
            >
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">I.A. = Mudança Real</h3>
            <p className="text-white/80 text-center text-sm">Não é modinha, é transformação</p>
          </motion.div>
        )}

        {/* Cena 10: Mensagem final */}
        {scene >= 10 && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0px rgba(245, 158, 11, 0)', '0 0 50px rgba(245, 158, 11, 0.5)', '0 0 0px rgba(245, 158, 11, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-white/10 text-center max-w-sm"
            >
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Quem entender primeiro, sai na frente</h3>
              <p className="text-amber-300 text-sm">
                I.A. é mudança estrutural, não passageira
              </p>
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

export default CardEffectTrendVsChange;
