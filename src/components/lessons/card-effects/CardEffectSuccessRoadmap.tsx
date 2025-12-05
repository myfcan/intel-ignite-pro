'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Flag, Rocket, Star, Sparkles } from 'lucide-react';
import { CardEffectProps } from './index';

export const CardEffectSuccessRoadmap: React.FC<CardEffectProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [activeStep, setActiveStep] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setActiveStep(0);
    
    setScene(1);
    
    timersRef.current.push(setTimeout(() => { setScene(2); setActiveStep(1); }, 2500));
    timersRef.current.push(setTimeout(() => setActiveStep(2), 4500));
    timersRef.current.push(setTimeout(() => setActiveStep(3), 6500));
    timersRef.current.push(setTimeout(() => setScene(3), 8500));
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
      setActiveStep(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-fuchsia-900/30 to-purple-950">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-fuchsia-400 rounded-full"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(217, 70, 239, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Mapa do Sucesso</h3>
              <p className="text-fuchsia-300 text-sm">Comece agora</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="relative w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ height: '180px' }}
            >
              <svg className="absolute inset-0 w-full h-full">
                <motion.path
                  d="M 50 30 Q 130 30 130 70 Q 130 110 210 110 Q 290 110 290 150"
                  fill="none"
                  stroke="rgba(217, 70, 239, 0.2)"
                  strokeWidth="3"
                  strokeDasharray="8"
                />
                <motion.path
                  d="M 50 30 Q 130 30 130 70 Q 130 110 210 110 Q 290 110 290 150"
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: activeStep / 3 }}
                  transition={{ duration: 0.8 }}
                />
              </svg>

              <div className="relative h-full">
                <motion.div
                  className="absolute left-6 top-4"
                  animate={{ scale: activeStep >= 1 ? 1 : 0.9, opacity: activeStep >= 1 ? 1 : 0.5 }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-fuchsia-500' : 'bg-slate-700'}`}>
                    <Flag className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-fuchsia-300 mt-1 text-center font-medium">Comece</p>
                </motion.div>

                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 top-16"
                  animate={{ scale: activeStep >= 2 ? 1 : 0.9, opacity: activeStep >= 2 ? 1 : 0.5 }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-fuchsia-500' : 'bg-slate-700'}`}>
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-fuchsia-300 mt-1 text-center font-medium">Pratique</p>
                </motion.div>

                <motion.div
                  className="absolute right-6 bottom-4"
                  animate={{ scale: activeStep >= 3 ? 1.1 : 0.9, opacity: activeStep >= 3 ? 1 : 0.5 }}
                >
                  <motion.div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${activeStep >= 3 ? 'bg-gradient-to-br from-fuchsia-500 to-purple-500' : 'bg-slate-700'}`}
                    animate={{ boxShadow: activeStep >= 3 ? '0 0 40px rgba(217, 70, 239, 0.6)' : 'none' }}
                  >
                    <Rocket className="w-7 h-7 text-white" />
                  </motion.div>
                  <p className="text-xs text-fuchsia-300 mt-1 text-center font-bold">Sucesso!</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-2"
            >
              <motion.div
                className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 rounded-xl border border-fuchsia-500/40"
                animate={{ boxShadow: ['0 0 20px rgba(217,70,239,0.2)', '0 0 40px rgba(217,70,239,0.4)', '0 0 20px rgba(217,70,239,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-fuchsia-400" />
                <div>
                  <p className="text-base font-bold text-white">HOJE MESMO!</p>
                  <p className="text-xs text-fuchsia-300">Seu primeiro passo define tudo</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{ backgroundColor: scene >= s ? '#d946ef' : 'rgba(255,255,255,0.2)', scale: scene === s ? 1.3 : 1 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
      >
        <Map className="w-3.5 h-3.5 text-fuchsia-400" />
        <span className="text-[10px] text-fuchsia-300 font-medium">Roadmap</span>
      </motion.div>
    </div>
  );
};

export default CardEffectSuccessRoadmap;
