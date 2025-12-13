'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, DollarSign, Users, Store, Coffee, GraduationCap, Building, TrendingUp, Sparkles, Target, Lightbulb } from 'lucide-react';
import { CardEffectProps } from './index';

const totalScenes = 11;

export const CardEffectHiddenMarket: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<number>(0);
  const [revealedOpportunities, setRevealedOpportunities] = useState<number[]>([]);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const opportunities = [
    { icon: Store, label: 'Padaria', need: 'Posts para redes' },
    { icon: GraduationCap, label: 'Professor', need: 'Organizar aulas' },
    { icon: Building, label: 'Síndico', need: 'Comunicados' },
    { icon: Coffee, label: 'Café', need: 'Cardápio semanal' },
    { icon: Users, label: 'Família', need: 'Planejamento' },
  ];

  const sceneTime = useMemo(() => {
    const effectiveDuration = duration && duration > 0 ? duration : 33;
    return (effectiveDuration * 1000) / totalScenes;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setRevealedOpportunities([]);
    setScene(1);
    
    for (let i = 2; i <= totalScenes; i++) {
      timersRef.current.push(setTimeout(() => {
        setScene(i);
        // Reveal opportunities during scenes 3-7
        if (i >= 3 && i <= 7) {
          setRevealedOpportunities(prev => [...prev, i - 3]);
        }
      }, (i - 1) * sceneTime));
    }
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setRevealedOpportunities([]);
    }
    return () => clearTimers();
  }, [isActive, sceneTime]);

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%23fff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        
        {/* ========== FASE 1: ELEMENTOS EMPILHADOS (Cenas 1-6) ========== */}
        <AnimatePresence>
          {scene >= 1 && scene <= 6 && (
            <motion.div
              className="flex flex-col items-center gap-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cena 1: Título */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-4"
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Mercado Oculto</h3>
                <p className="text-orange-300 text-sm">Oportunidades que ninguém vê</p>
              </motion.div>

              {/* Cena 2: Olho */}
              {scene >= 2 && (
                <motion.div
                  className="mb-4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150 }}
                >
                  <motion.div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-400/50 flex items-center justify-center"
                    animate={{ 
                      boxShadow: scene >= 3 ? '0 0 30px rgba(251, 146, 60, 0.5)' : '0 0 10px rgba(251, 146, 60, 0.2)'
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <AnimatePresence mode="wait">
                      {scene === 2 ? (
                        <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <EyeOff className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" />
                        </motion.div>
                      ) : (
                        <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                          <Eye className="w-10 h-10 sm:w-12 sm:h-12 text-orange-300" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}

              {/* Cenas 3-6: Grid de oportunidades reveladas */}
              {scene >= 3 && (
                <motion.div
                  className="grid grid-cols-5 gap-3 w-full max-w-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {opportunities.map((opp, index) => {
                    const isRevealed = revealedOpportunities.includes(index);
                    const Icon = opp.icon;
                    
                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                      >
                        <motion.div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all ${
                            isRevealed 
                              ? 'bg-orange-500/30 border border-orange-400/50' 
                              : 'bg-white/5 border border-white/10'
                          }`}
                          animate={{
                            boxShadow: isRevealed ? '0 0 15px rgba(251, 146, 60, 0.4)' : 'none'
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isRevealed ? 'text-orange-300' : 'text-white/30'}`} />
                        </motion.div>
                        <span className={`text-[10px] mt-1 ${isRevealed ? 'text-orange-200' : 'text-white/30'}`}>
                          {opp.label}
                        </span>
                        {isRevealed && (
                          <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-[8px] text-green-400 mt-0.5"
                          >
                            {opp.need}
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== FASE 2: TELA LIMPA (Cenas 7-11) ========== */}
        <AnimatePresence>
          {scene >= 7 && (
            <motion.div
              className="flex flex-col items-center justify-center h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Cena 7: Grande ícone de sucesso */}
              {scene === 7 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto"
                    animate={{ boxShadow: ['0 0 30px rgba(34,197,94,0.3)', '0 0 60px rgba(34,197,94,0.6)', '0 0 30px rgba(34,197,94,0.3)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <DollarSign className="w-14 h-14 text-white" />
                  </motion.div>
                  <p className="text-xl font-bold text-white mt-4">5 Oportunidades</p>
                </motion.div>
              )}

              {/* Cena 8: Stats */}
              {scene === 8 && (
                <motion.div
                  className="grid grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {[
                    { icon: Target, label: 'Nichos', value: '5' },
                    { icon: TrendingUp, label: 'Potencial', value: 'Alto' },
                    { icon: Users, label: 'Clientes', value: '∞' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/30"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2 }}
                      >
                        <Icon className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-400">{stat.value}</p>
                        <p className="text-xs text-slate-400">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Cena 9: Lightbulb */}
              {scene === 9 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Lightbulb className="w-20 h-20 text-yellow-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg font-bold text-white mt-4">Visão Diferenciada</p>
                  <p className="text-sm text-orange-300 mt-2">Enxergar onde outros não veem</p>
                </motion.div>
              )}

              {/* Cena 10: Sparkles */}
              {scene === 10 && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-white/80 mt-4 text-lg">Oportunidades Reveladas</p>
                </motion.div>
              )}

              {/* Cena 11: Mensagem Final */}
              {scene === 11 && (
                <motion.div
                  className="text-center max-w-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div
                    className="p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl"
                    animate={{ boxShadow: ['0 0 20px rgba(251,146,60,0.2)', '0 0 40px rgba(251,146,60,0.4)', '0 0 20px rgba(251,146,60,0.2)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-lg font-medium text-white">
                      O mercado oculto existe para quem sabe <span className="text-orange-400 font-bold">onde olhar</span>.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-1.5 mt-auto pt-4">
          {Array.from({ length: totalScenes }).map((_, s) => (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: scene >= s + 1 ? '#f97316' : 'rgba(255,255,255,0.2)',
                scale: scene === s + 1 ? 1.3 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 }}
      >
        <Eye className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Visão</span>
      </motion.div>
    </div>
  );
};

export default CardEffectHiddenMarket;
