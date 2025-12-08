'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, Heart, Brain, Zap, CheckCircle } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 15;

export const CardEffectStabilityMap: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState(0);
  const [activeElement, setActiveElement] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const stabilityPillars = [
    { icon: Shield, label: 'Segurança', description: 'Base sólida primeiro', color: 'text-blue-400' },
    { icon: TrendingUp, label: 'Crescimento', description: 'Evolução gradual', color: 'text-green-400' },
    { icon: Heart, label: 'Propósito', description: 'Conexão com valores', color: 'text-pink-400' },
    { icon: Brain, label: 'Aprendizado', description: 'Melhoria contínua', color: 'text-purple-400' },
  ];

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(0);
    setActiveElement(0);

    timersRef.current.push(setTimeout(() => setScene(1), 400 * scale));
    timersRef.current.push(setTimeout(() => setScene(2), 3000 * scale));
    timersRef.current.push(setTimeout(() => setActiveElement(1), 4000 * scale));
    timersRef.current.push(setTimeout(() => setActiveElement(2), 5500 * scale));
    timersRef.current.push(setTimeout(() => setActiveElement(3), 7000 * scale));
    timersRef.current.push(setTimeout(() => setActiveElement(4), 8500 * scale));
    timersRef.current.push(setTimeout(() => setScene(3), 10000 * scale));
    timersRef.current.push(setTimeout(() => setScene(4), 12000 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setActiveElement(0);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <motion.div 
        className="absolute inset-0"
        animate={{ background: ['radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)', 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.25) 0%, transparent 60%)', 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'] }}
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {scene === 1 && (
            <motion.div key="title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 * scale }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 * scale }} className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-3">Mapa da Estabilidade</h2>
              <p className="text-indigo-200 text-lg">Construa sua jornada com bases sólidas</p>
            </motion.div>
          )}

          {scene === 2 && (
            <motion.div key="pillars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 * scale }} className="w-full max-w-md">
              <h3 className="text-xl font-semibold text-white text-center mb-8">Os 4 Pilares da Estabilidade</h3>
              <div className="grid grid-cols-2 gap-4">
                {stabilityPillars.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  const isActiveItem = activeElement > idx;
                  return (
                    <motion.div key={pillar.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: isActiveItem ? 1.05 : 1, boxShadow: isActiveItem ? '0 0 30px rgba(99, 102, 241, 0.4)' : 'none' }} transition={{ delay: idx * 0.2 * scale, duration: 0.4 * scale }} className={`p-4 rounded-xl border transition-all duration-300 ${isActiveItem ? 'bg-indigo-900/50 border-indigo-400' : 'bg-slate-800/50 border-slate-700'}`}>
                      <Icon className={`w-8 h-8 mb-2 ${isActiveItem ? pillar.color : 'text-slate-500'}`} />
                      <p className={`font-semibold ${isActiveItem ? 'text-white' : 'text-slate-400'}`}>{pillar.label}</p>
                      <p className={`text-xs mt-1 ${isActiveItem ? 'text-indigo-200' : 'text-slate-500'}`}>{pillar.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {scene === 3 && (
            <motion.div key="map" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 * scale }} className="text-center">
              <motion.div className="relative w-48 h-48 mx-auto mb-6" animate={{ rotate: 360 }} transition={{ duration: 20 * scale, repeat: 0, ease: 'linear' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2 * scale, repeat: 0 }} className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Tudo Conectado</h3>
              <p className="text-indigo-200">Cada pilar fortalece o outro</p>
            </motion.div>
          )}

          {scene === 4 && (
            <motion.div key="final" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 * scale }} className="text-center max-w-sm">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2 * scale, repeat: 0 }} className="text-6xl mb-6">🏆</motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">Estabilidade é Estratégia</h3>
              <p className="text-indigo-200">Não é sobre correr, é sobre construir algo que dura</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 * scale }} className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-500/30">
        <span className="text-xs font-medium text-indigo-200">Estabilidade</span>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <motion.div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${scene >= s ? 'bg-indigo-400' : 'bg-slate-600'}`} animate={scene === s ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5 * scale }} />
        ))}
      </div>
    </div>
  );
};

export default CardEffectStabilityMap;
