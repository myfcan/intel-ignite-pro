import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog, FileText, RefreshCw, Layers, Zap, Settings, CheckCircle, Sparkles, Box, ArrowRight } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectDraftMachine: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
  const [scene, setScene] = useState(1);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const scale = useMemo(() => Math.max(0.8, Math.min(1.5, duration / 36)), [duration]);
  const sceneTime = 3000 * scale;

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1);
    for (let i = 1; i <= 12; i++) {
      timerRef.current.push(setTimeout(() => setScene(i), (i - 1) * sceneTime));
    }
    timerRef.current.push(setTimeout(() => startAnimation(), 12 * sceneTime));
  };

  useEffect(() => {
    if (isActive) startAnimation();
    else { clearTimers(); setScene(1); }
    return clearTimers;
  }, [isActive]);

  const machineSteps = [
    { icon: Box, label: 'Input: Ideias', color: '#8B5CF6' },
    { icon: Cog, label: 'Processamento', color: '#06B6D4' },
    { icon: Layers, label: 'Estruturação', color: '#10B981' },
    { icon: FileText, label: 'Output: Rascunho', color: '#F59E0B' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950">
      <div className="absolute inset-0 opacity-20">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              left: `${10 + i * 12}%`, 
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
            >
              <Cog className="w-8 h-8 text-zinc-600" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md sm:max-w-2xl px-4 sm:px-8">
        <AnimatePresence mode="wait">
          {scene <= 6 ? (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 sm:gap-4 w-full"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: scene >= 1 ? 1 : 0, rotate: 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-zinc-600 to-slate-700 flex items-center justify-center shadow-lg shadow-zinc-500/30"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Cog className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Máquina de Rascunhos
              </motion.h2>

              <div className="flex flex-col gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {machineSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      x: scene >= idx + 3 ? 0 : -40 
                    }}
                    className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-zinc-600/30"
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}30` }}
                    >
                      <step.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: step.color }} />
                    </div>
                    <p className="text-sm sm:text-base text-white">{step.label}</p>
                    {idx < 3 && scene >= idx + 4 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto">
                        <ArrowRight className="w-4 h-4 text-zinc-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="phase2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 sm:gap-6 w-full"
            >
              {scene === 7 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg sm:text-xl text-white font-semibold mt-3">Processando...</p>
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scaleY: [1, 1.5, 1],
                        backgroundColor: ['#3f3f46', '#06B6D4', '#3f3f46']
                      }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-3 h-12 sm:h-16 rounded-full bg-zinc-700"
                    />
                  ))}
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                    Auto
                  </div>
                  <p className="text-white/80 mt-2 text-sm sm:text-base">Geração Automática</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex gap-3">
                  {[Settings, Cog, Zap].map((Icon, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: i === 1 ? 360 : 0 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-zinc-700/50 to-slate-700/50 flex items-center justify-center border border-zinc-600/30"
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-zinc-700 to-slate-700 rounded-xl p-4 sm:p-6 text-center"
                >
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-sm sm:text-base">Rascunho Gerado</p>
                </motion.div>
              )}
              {scene === 12 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div className="relative">
                    <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 mx-auto" />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  </motion.div>
                  <p className="text-lg sm:text-xl font-bold text-white mt-3">Máquina Completa!</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-1.5 mt-6 sm:mt-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i + 1 === scene ? 'bg-cyan-400 scale-125' : i + 1 < scene ? 'bg-cyan-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-zinc-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full"
        >
          <span className="text-white text-xs font-medium">Máquina</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectDraftMachine;
