'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Store, Cpu, ArrowRight, CheckCircle, ShoppingCart } from 'lucide-react';

interface CardEffectCaseViewerProps {
  isActive?: boolean;
}

export const CardEffectCaseViewer: React.FC<CardEffectCaseViewerProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [step, setStep] = useState(0);

  const steps = [
    { label: 'Cliente conta o que vende', icon: User },
    { label: 'IA sugere estrutura', icon: Cpu },
    { label: 'João ajusta e entrega', icon: Store },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    const timers = [
      setTimeout(() => { setScene(2); setStep(1); }, 1500),
      setTimeout(() => setStep(2), 2500),
      setTimeout(() => setStep(3), 3500),
      setTimeout(() => setScene(3), 5000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 border border-blue-500/30">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-4 pb-12 h-full px-4">
        {/* Header com foto do João */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-3"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/30 border border-blue-400 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Caso: João</h3>
            <p className="text-[9px] text-blue-300">Criador de E-commerces</p>
          </div>
        </motion.div>

        {/* Timeline do processo */}
        <div className="w-full max-w-xs mb-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, index) => {
              const isActive = step > index;
              const isCurrent = step === index + 1;
              const Icon = s.icon;
              
              return (
                <React.Fragment key={index}>
                  <motion.div
                    className="flex flex-col items-center"
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                  >
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        isActive || isCurrent
                          ? 'bg-blue-500/30 border border-blue-400'
                          : 'bg-slate-700/30 border border-slate-600'
                      }`}
                      animate={{
                        boxShadow: isCurrent ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
                      }}
                    >
                      <Icon className={`w-4 h-4 ${isActive || isCurrent ? 'text-blue-300' : 'text-slate-500'}`} />
                    </motion.div>
                    <span className={`text-[7px] text-center max-w-[60px] ${
                      isActive || isCurrent ? 'text-blue-300' : 'text-slate-500'
                    }`}>
                      {s.label}
                    </span>
                  </motion.div>

                  {index < steps.length - 1 && (
                    <motion.div
                      className={`flex-1 h-0.5 mx-1 ${
                        step > index + 1 ? 'bg-blue-400' : 'bg-slate-700'
                      }`}
                      style={{ marginTop: '-20px' }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Visualização da loja */}
        <motion.div
          className="w-full max-w-xs bg-slate-800/50 border border-blue-400/30 rounded-xl p-3"
          animate={{
            opacity: scene >= 2 ? 1 : 0.5,
            scale: scene >= 2 ? 1 : 0.95,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] text-blue-300 font-medium">Loja Pronta</span>
          </div>

          {/* Miniatura de e-commerce */}
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="aspect-square bg-blue-500/10 border border-blue-400/20 rounded-lg flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: scene >= 2 ? 1 : 0.3,
                  scale: scene >= 2 ? 1 : 0.8
                }}
                transition={{ delay: item * 0.2 }}
              >
                <Store className="w-4 h-4 text-blue-400/50" />
              </motion.div>
            ))}
          </div>

          {/* Preço */}
          <AnimatePresence>
            {scene >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center justify-between"
              >
                <span className="text-[9px] text-slate-400">Valor cobrado:</span>
                <span className="text-sm font-bold text-emerald-400">R$ 100</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Resultado final */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-lg px-3 py-1.5"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">
                Loja entregue + R$100 ganhos!
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
                backgroundColor: scene >= s ? '#3b82f6' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-blue-500/20 border border-blue-400/30 rounded-full px-2 py-0.5"
      >
        <Store className="w-3 h-3 text-blue-400" />
        <span className="text-[9px] text-blue-300 font-medium">Caso Real</span>
      </motion.div>
    </div>
  );
};

export default CardEffectCaseViewer;
