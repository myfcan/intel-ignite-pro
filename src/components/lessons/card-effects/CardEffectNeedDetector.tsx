'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Target, AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface CardEffectNeedDetectorProps {
  isActive?: boolean;
}

export const CardEffectNeedDetector: React.FC<CardEffectNeedDetectorProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(1);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedNeeds, setDetectedNeeds] = useState<number[]>([]);

  const needs = [
    { label: 'Conteúdo', urgency: 'alta' },
    { label: 'Organização', urgency: 'média' },
    { label: 'Comunicação', urgency: 'alta' },
    { label: 'Automação', urgency: 'baixa' },
  ];

  useEffect(() => {
    if (!isActive) return;
    
    // Animação do scanner
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const timers = [
      setTimeout(() => setScene(2), 1500),
      setTimeout(() => setDetectedNeeds([0]), 2500),
      setTimeout(() => setDetectedNeeds([0, 1]), 3000),
      setTimeout(() => setDetectedNeeds([0, 1, 2]), 3500),
      setTimeout(() => setDetectedNeeds([0, 1, 2, 3]), 4000),
      setTimeout(() => setScene(3), 5000),
    ];

    return () => {
      clearInterval(scanInterval);
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900/30 to-slate-900 border border-cyan-500/30">
      {/* Radar background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <motion.div
          className="w-48 h-48 border-2 border-cyan-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-36 h-36 border border-cyan-400/50 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
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
          <h3 className="text-base font-bold text-white mb-1">Detector de Necessidades</h3>
          <p className="text-[10px] text-cyan-300">Escaneando oportunidades...</p>
        </motion.div>

        {/* Scanner visual */}
        <div className="relative w-32 h-32 mb-3">
          <motion.div
            className="absolute inset-0 border-2 border-cyan-400/30 rounded-full"
          />
          
          {/* Sweep line */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left"
            animate={{ rotate: scene >= 2 ? 360 : scanProgress * 3.6 }}
            transition={{ duration: scene >= 2 ? 2 : 0.1, repeat: scene >= 2 ? Infinity : 0, ease: 'linear' }}
          />

          {/* Centro */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center"
              animate={{
                boxShadow: scene >= 2 ? '0 0 20px rgba(6, 182, 212, 0.5)' : '0 0 5px rgba(6, 182, 212, 0.2)'
              }}
            >
              <Radar className="w-5 h-5 text-cyan-400" />
            </motion.div>
          </div>

          {/* Pontos detectados */}
          {detectedNeeds.map((needIndex, i) => {
            const angles = [45, 135, 225, 315];
            const angle = angles[needIndex] * (Math.PI / 180);
            const radius = 45;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={needIndex}
                className="absolute"
                style={{
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full ${
                    needs[needIndex].urgency === 'alta' ? 'bg-red-400' :
                    needs[needIndex].urgency === 'média' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  animate={{
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      '0 0 5px currentColor',
                      '0 0 15px currentColor',
                      '0 0 5px currentColor'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Lista de necessidades detectadas */}
        <div className="w-full max-w-xs space-y-1.5">
          {needs.map((need, index) => {
            const isDetected = detectedNeeds.includes(index);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isDetected ? 1 : 0.3,
                  x: isDetected ? 0 : -10
                }}
                className={`flex items-center justify-between px-2 py-1 rounded-lg ${
                  isDetected ? 'bg-cyan-500/20 border border-cyan-400/30' : 'bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isDetected ? (
                    <CheckCircle className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-slate-500" />
                  )}
                  <span className={`text-[10px] ${isDetected ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {need.label}
                  </span>
                </div>
                {isDetected && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                    need.urgency === 'alta' ? 'bg-red-500/30 text-red-300' :
                    need.urgency === 'média' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'
                  }`}>
                    {need.urgency}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mensagem final */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg px-3 py-1.5"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-300 font-medium">
                4 oportunidades encontradas!
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
                backgroundColor: scene >= s ? '#06b6d4' : 'rgba(255,255,255,0.2)',
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
        className="absolute top-3 right-3 flex items-center gap-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full px-2 py-0.5"
      >
        <Zap className="w-3 h-3 text-cyan-400" />
        <span className="text-[9px] text-cyan-300 font-medium">Scan</span>
      </motion.div>
    </div>
  );
};

export default CardEffectNeedDetector;
