import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bone, Building, Layers, Box, Hammer, Wrench, CheckCircle, Sparkles, ArrowUp, Grid3X3 } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectSkeletonBuilder: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
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

  const buildingBlocks = [
    { icon: Box, label: 'Base', color: '#8B5CF6' },
    { icon: Layers, label: 'Camadas', color: '#06B6D4' },
    { icon: Grid3X3, label: 'Grade', color: '#10B981' },
    { icon: Building, label: 'Estrutura', color: '#F59E0B' },
  ];

  return (
    <div className="relative w-full min-h-[480px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-stone-950 via-amber-950 to-orange-950">
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 border-2 border-amber-500/30"
            style={{ 
              left: `${(i % 4) * 25 + 10}%`, 
              top: `${Math.floor(i / 4) * 30 + 20}%` 
            }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
          />
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
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: scene >= 1 ? 1 : 0, y: 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50"
              >
                <Bone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Construtor de Esqueleto
              </motion.h2>

              <div className="flex flex-col gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {buildingBlocks.map((block, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -40, scale: 0.8 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      x: scene >= idx + 3 ? 0 : -40,
                      scale: scene >= idx + 3 ? 1 : 0.8
                    }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-amber-400/30"
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${block.color}30` }}
                    >
                      <block.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: block.color }} />
                    </div>
                    <p className="text-sm sm:text-base text-white">{block.label}</p>
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
                  <div className="flex items-end justify-center gap-1">
                    {[3, 5, 4, 6, 5].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: h * 12 }}
                        transition={{ delay: i * 0.15 }}
                        className="w-6 sm:w-8 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t"
                      />
                    ))}
                  </div>
                  <p className="text-lg sm:text-xl text-white font-semibold mt-4">Construindo Base</p>
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -20, 20, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Hammer className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
                  >
                    <Wrench className="w-12 h-12 sm:w-14 sm:h-14 text-orange-400" />
                  </motion.div>
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      >
                        <ArrowUp className="w-6 h-6 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-white/80 text-sm sm:text-base">Levantando Estrutura</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative">
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded border border-amber-400/30"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-4 sm:p-6 text-center"
                >
                  <Building className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-sm sm:text-base">Esqueleto Montado</p>
                </motion.div>
              )}
              {scene === 12 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div className="relative">
                    <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 mx-auto" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  </motion.div>
                  <p className="text-lg sm:text-xl font-bold text-white mt-3">Construção Completa!</p>
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
                i + 1 === scene ? 'bg-amber-400 scale-125' : i + 1 < scene ? 'bg-amber-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-amber-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full"
        >
          <span className="text-white text-xs font-medium">Construtor</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectSkeletonBuilder;
