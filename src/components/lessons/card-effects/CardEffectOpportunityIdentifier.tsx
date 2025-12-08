'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Lightbulb, CheckCircle, MapPin, Star } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 10;

export const CardEffectOpportunityIdentifier: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState(0);
  const [foundOpportunities, setFoundOpportunities] = useState<number[]>([]);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const opportunities = [
    { area: 'Ao redor', example: 'Amigos, família, vizinhos' },
    { area: 'Online', example: 'Grupos, comunidades' },
    { area: 'Local', example: 'Comércios do bairro' },
  ];

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setFoundOpportunities([]);
    setScene(1);

    timersRef.current.push(setTimeout(() => setScene(2), 1500 * scale));
    timersRef.current.push(setTimeout(() => setFoundOpportunities([0]), 2200 * scale));
    timersRef.current.push(setTimeout(() => setFoundOpportunities([0, 1]), 3000 * scale));
    timersRef.current.push(setTimeout(() => setFoundOpportunities([0, 1, 2]), 3800 * scale));
    timersRef.current.push(setTimeout(() => setScene(3), 5000 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setFoundOpportunities([]);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900">
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <motion.div
          className="w-40 h-40 border border-amber-400 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3 * scale, repeat: 0 }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start pt-8 pb-16 h-full px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 * scale }}
          className="text-center mb-6"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Identificador</h3>
          <p className="text-amber-300 text-sm">Encontre sua oportunidade</p>
        </motion.div>

        <motion.div
          className="mb-6"
          animate={{ rotate: scene === 2 ? [0, 10, -10, 0] : 0 }}
          transition={{ duration: 0.5 * scale, repeat: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
            <Search className="w-8 h-8 text-amber-300" />
          </div>
        </motion.div>

        <div className="w-full max-w-sm space-y-3">
          {opportunities.map((opp, index) => {
            const isFound = foundOpportunities.includes(index);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 * scale, duration: 0.4 * scale }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isFound ? 'bg-amber-500/20 border border-amber-400/40' : 'bg-slate-800/30 border border-slate-700/30'
                }`}
              >
                <motion.div animate={{ scale: isFound ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 * scale }}>
                  {isFound ? (
                    <Lightbulb className="w-6 h-6 text-amber-400 fill-amber-400/30" />
                  ) : (
                    <MapPin className="w-6 h-6 text-slate-500" />
                  )}
                </motion.div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isFound ? 'text-amber-300' : 'text-slate-500'}`}>{opp.area}</p>
                  <p className={`text-xs ${isFound ? 'text-amber-400/70' : 'text-slate-600'}`}>{opp.example}</p>
                </div>
                {isFound && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 * scale }}>
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 * scale }}
              className="mt-6 flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-xl px-5 py-3"
            >
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Oportunidades estão ao redor!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{ backgroundColor: scene >= s ? '#f59e0b' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 * scale }}
        className="absolute top-4 right-4 flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 rounded-full px-3 py-1.5"
      >
        <Search className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] text-amber-300 font-medium">Busca</span>
      </motion.div>
    </div>
  );
};

export default CardEffectOpportunityIdentifier;
