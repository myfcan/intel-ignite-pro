'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Lightbulb, CheckCircle, MapPin, Star } from 'lucide-react';

interface CardEffectOpportunityIdentifierProps {
  isActive?: boolean;
}

export const CardEffectOpportunityIdentifier: React.FC<CardEffectOpportunityIdentifierProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [foundOpportunities, setFoundOpportunities] = useState<number[]>([]);

  const opportunities = [
    { area: 'Ao redor', example: 'Amigos, família, vizinhos' },
    { area: 'Online', example: 'Grupos, comunidades' },
    { area: 'Local', example: 'Comércios do bairro' },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => setScene(2), 1500),
      setTimeout(() => setFoundOpportunities([0]), 2200),
      setTimeout(() => setFoundOpportunities([0, 1]), 3000),
      setTimeout(() => setFoundOpportunities([0, 1, 2]), 3800),
      setTimeout(() => setScene(3), 5000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 border border-amber-500/30">
      {/* Radar de busca */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <motion.div
          className="w-40 h-40 border border-amber-400 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3"
        >
          <h3 className="text-base font-bold text-white mb-1">Identificador</h3>
          <p className="text-[10px] text-amber-300">Encontre sua oportunidade</p>
        </motion.div>

        {/* Ícone central de busca */}
        <motion.div
          className="mb-3"
          animate={{
            rotate: scene === 2 ? [0, 10, -10, 0] : 0,
          }}
          transition={{ duration: 0.5, repeat: scene === 2 ? Infinity : 0, repeatDelay: 1 }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center">
            <Search className="w-6 h-6 text-amber-300" />
          </div>
        </motion.div>

        {/* Áreas de oportunidade */}
        <div className="w-full max-w-xs space-y-2">
          {opportunities.map((opp, index) => {
            const isFound = foundOpportunities.includes(index);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1,
                  x: 0,
                }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                  isFound
                    ? 'bg-amber-500/20 border border-amber-400/40'
                    : 'bg-slate-800/30 border border-slate-700/30'
                }`}
              >
                <motion.div
                  animate={{
                    scale: isFound ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isFound ? (
                    <Lightbulb className="w-5 h-5 text-amber-400 fill-amber-400/30" />
                  ) : (
                    <MapPin className="w-5 h-5 text-slate-500" />
                  )}
                </motion.div>

                <div className="flex-1">
                  <p className={`text-[11px] font-medium ${isFound ? 'text-amber-300' : 'text-slate-500'}`}>
                    {opp.area}
                  </p>
                  <p className={`text-[9px] ${isFound ? 'text-amber-400/70' : 'text-slate-600'}`}>
                    {opp.example}
                  </p>
                </div>

                {isFound && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mensagem final */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-lg px-3 py-1.5"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs text-amber-300 font-medium">
                Oportunidades estão ao redor!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-3">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 rounded-full px-2 py-0.5"
      >
        <Search className="w-3 h-3 text-amber-400" />
        <span className="text-[9px] text-amber-300 font-medium">Busca</span>
      </motion.div>
    </div>
  );
};

export default CardEffectOpportunityIdentifier;
