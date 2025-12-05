'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { CardEffectProps } from './index';

const BASE_DURATION = 12;

export const CardEffectNeedDetector: React.FC<CardEffectProps> = ({ isActive = false, duration }) => {
  const [scene, setScene] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedNeeds, setDetectedNeeds] = useState<string[]>([]);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  const needs = [
    { text: 'Posts para redes sociais', urgency: 'alta' },
    { text: 'Organização de aulas', urgency: 'média' },
    { text: 'Comunicados', urgency: 'alta' },
    { text: 'Cardápio semanal', urgency: 'baixa' }
  ];

  const scale = useMemo(() => {
    if (!duration || duration <= 0) return 1;
    return duration / BASE_DURATION;
  }, [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScanProgress(0);
    setDetectedNeeds([]);
    
    setScene(1);
    
    timersRef.current.push(setTimeout(() => {
      setScene(2);
      let progress = 0;
      const scanInterval = setInterval(() => {
        progress += 10;
        setScanProgress(progress);
        if (progress >= 100) clearInterval(scanInterval);
      }, 200 * scale);
      intervalsRef.current.push(scanInterval);
    }, 2500 * scale));
    
    timersRef.current.push(setTimeout(() => {
      setScene(3);
      needs.forEach((_, i) => {
        timersRef.current.push(setTimeout(() => {
          setDetectedNeeds(prev => [...prev, needs[i].text]);
        }, i * 400 * scale));
      });
    }, 5000 * scale));
    
    timersRef.current.push(setTimeout(() => setScene(4), 9000 * scale));
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setScanProgress(0);
      setDetectedNeeds([]);
    }
    return () => clearTimers();
  }, [isActive, scale]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='2' fill='%23fff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)' }}
        animate={scene > 0 ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 4 * scale, repeat: 0 }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-start px-6 pt-8 pb-16">
        <AnimatePresence>
          {scene >= 1 && (
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 * scale }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">Detector de Necessidades</h3>
              <p className="text-orange-300 text-sm">Problemas = oportunidades</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 1 && scene < 3 && (
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 150 / scale }}
            >
              <motion.div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-400/50 flex items-center justify-center"
                animate={{ 
                  boxShadow: ['0 0 20px rgba(251,146,60,0.3)', '0 0 40px rgba(251,146,60,0.5)', '0 0 20px rgba(251,146,60,0.3)']
                }}
                transition={{ duration: 2 * scale, repeat: 0 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3 * scale, repeat: 0, ease: 'linear' }}
                >
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" />
                </motion.div>
              </motion.div>
              
              <motion.div
                className="absolute inset-0 rounded-full border border-orange-400/50"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2 * scale, repeat: 0 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene === 2 && (
            <motion.div
              className="w-full max-w-xs mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 * scale }}
            >
              <p className="text-center text-orange-200 text-sm mb-2">Escaneando oportunidades...</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-center text-orange-300 text-xs mt-1">{scanProgress}%</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 3 && (
            <motion.div
              className="w-full max-w-sm space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 * scale }}
            >
              {needs.map((need, i) => (
                <motion.div
                  key={need.text}
                  className="flex items-center justify-between px-4 py-2.5 bg-white/10 backdrop-blur rounded-xl border border-white/20"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ 
                    x: detectedNeeds.includes(need.text) ? 0 : -30, 
                    opacity: detectedNeeds.includes(need.text) ? 1 : 0 
                  }}
                  transition={{ duration: 0.4 * scale, delay: i * 0.1 * scale }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm font-medium">{need.text}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    need.urgency === 'alta' ? 'bg-rose-500/30 text-rose-300' :
                    need.urgency === 'média' ? 'bg-amber-500/30 text-amber-300' :
                    'bg-green-500/30 text-green-300'
                  }`}>
                    {need.urgency}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene >= 4 && (
            <motion.div
              className="mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 * scale }}
            >
              <motion.div
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"
                animate={{
                  boxShadow: ['0 0 15px rgba(34,197,94,0.2)', '0 0 30px rgba(34,197,94,0.4)', '0 0 15px rgba(34,197,94,0.2)']
                }}
                transition={{ duration: 2 * scale, repeat: 0 }}
              >
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold text-sm">4 oportunidades encontradas!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-auto pt-4">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className="w-2.5 h-2.5 rounded-full"
              animate={{
                backgroundColor: scene >= s ? '#f97316' : 'rgba(255,255,255,0.2)',
                scale: scene === s ? 1.3 : 1
              }}
              transition={{ duration: 0.4 * scale }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: scene > 0 ? 1 : 0, x: scene > 0 ? 0 : 20 }}
        transition={{ duration: 0.6 * scale }}
      >
        <Target className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-[10px] text-orange-300 font-medium">Scan</span>
      </motion.div>
    </div>
  );
};

export default CardEffectNeedDetector;
