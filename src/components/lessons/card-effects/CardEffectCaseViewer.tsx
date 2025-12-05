'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Store, Cpu, CheckCircle, ShoppingCart } from 'lucide-react';
import { CardEffectProps } from './index';

export const CardEffectCaseViewer: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [step, setStep] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const steps = [
    { label: 'Cliente conta o que vende', icon: User },
    { label: 'IA sugere estrutura', icon: Cpu },
    { label: 'João ajusta e entrega', icon: Store },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setStep(0);
    
    setScene(1);
    
    timersRef.current.push(setTimeout(() => { setScene(2); setStep(1); }, 2000));
    timersRef.current.push(setTimeout(() => setStep(2), 3500));
    timersRef.current.push(setTimeout(() => setStep(3), 5000));
    timersRef.current.push(setTimeout(() => setScene(3), 7000));
    timersRef.current.push(setTimeout(() => setScene(4), 9500));
    
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < maxLoops) {
        setScene(0);
        setTimeout(() => startAnimation(), 500);
      }
    }, 12000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setStep(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-blue-900/30 to-indigo-950">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="w-14 h-14 rounded-full bg-blue-500/30 border-2 border-blue-400 flex items-center justify-center">
                <User className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Caso: João</h3>
                <p className="text-blue-300 text-sm">Criador de E-commerces</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 2 && (
            <motion.div
              className="w-full max-w-sm mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                {steps.map((s, index) => {
                  const isActiveStep = step > index;
                  const isCurrent = step === index + 1;
                  const Icon = s.icon;
                  
                  return (
                    <React.Fragment key={index}>
                      <motion.div className="flex flex-col items-center" animate={{ scale: isCurrent ? 1.1 : 1 }}>
                        <motion.div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                            isActiveStep || isCurrent ? 'bg-blue-500/30 border-2 border-blue-400' : 'bg-slate-700/30 border border-slate-600'
                          }`}
                          animate={{ boxShadow: isCurrent ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none' }}
                        >
                          <Icon className={`w-6 h-6 ${isActiveStep || isCurrent ? 'text-blue-300' : 'text-slate-500'}`} />
                        </motion.div>
                        <span className={`text-[10px] text-center max-w-[70px] ${isActiveStep || isCurrent ? 'text-blue-300' : 'text-slate-500'}`}>
                          {s.label}
                        </span>
                      </motion.div>
                      {index < steps.length - 1 && (
                        <motion.div
                          className={`flex-1 h-1 mx-2 rounded ${step > index + 1 ? 'bg-blue-400' : 'bg-slate-700'}`}
                          style={{ marginTop: '-30px' }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 3 && (
            <motion.div
              className="w-full max-w-sm bg-slate-800/50 border border-blue-400/30 rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-blue-300 font-medium">Loja Pronta</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[1, 2, 3].map((item) => (
                  <motion.div
                    key={item}
                    className="aspect-square bg-blue-500/10 border border-blue-400/20 rounded-lg flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: item * 0.15 }}
                  >
                    <Store className="w-6 h-6 text-blue-400/50" />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blue-400/20">
                <span className="text-xs text-slate-400">Valor cobrado:</span>
                <span className="text-lg font-bold text-emerald-400">R$ 100</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              className="mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/30"
                animate={{ boxShadow: ['0 0 15px rgba(16,185,129,0.2)', '0 0 30px rgba(16,185,129,0.4)', '0 0 15px rgba(16,185,129,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-semibold text-sm">Loja entregue + R$100 ganhos!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{ backgroundColor: scene >= s ? '#3b82f6' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
      >
        <Store className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[10px] text-blue-300 font-medium">Caso Real</span>
      </motion.div>
    </div>
  );
};

export default CardEffectCaseViewer;
