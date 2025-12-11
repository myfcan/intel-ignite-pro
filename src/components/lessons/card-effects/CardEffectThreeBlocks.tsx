import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Layers, Grid3X3, Package, Puzzle, Boxes, CheckSquare, Sparkles, Zap, ArrowRight } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectThreeBlocks: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
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

  const blocks = [
    { icon: Box, label: 'Bloco 1', subtitle: 'Fundamento', color: '#8B5CF6' },
    { icon: Layers, label: 'Bloco 2', subtitle: 'Desenvolvimento', color: '#06B6D4' },
    { icon: Package, label: 'Bloco 3', subtitle: 'Aplicação', color: '#10B981' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950">
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 border border-purple-400/30 rounded"
            style={{ 
              left: `${(i % 4) * 25 + 10}%`, 
              top: `${Math.floor(i / 4) * 35 + 15}%` 
            }}
            animate={{ rotate: [0, 90, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
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
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: scene >= 1 ? 1 : 0, rotate: 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/50"
              >
                <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Os 3 Blocos Essenciais
              </motion.h2>

              <div className="flex flex-col gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {blocks.map((block, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      scale: scene >= idx + 3 ? 1 : 0.8,
                      y: scene >= idx + 3 ? 0 : 20
                    }}
                    className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-purple-400/30"
                  >
                    <div 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${block.color}30` }}
                    >
                      <block.icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: block.color }} />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">{block.label}</p>
                      <p className="text-xs sm:text-sm text-white/60">{block.subtitle}</p>
                    </div>
                    {scene >= idx + 4 && idx < 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-auto"
                      >
                        <ArrowRight className="w-5 h-5 text-purple-400" />
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex gap-3 sm:gap-4">
                  {blocks.map((block, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${block.color}40` }}
                    >
                      <block.icon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: block.color }} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <Puzzle className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400 mx-auto mb-3" />
                  <p className="text-lg sm:text-xl text-white font-semibold">Encaixe Perfeito</p>
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <div className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                    3
                  </div>
                  <p className="text-white/80 mt-2 text-sm sm:text-base">Blocos = 1 Curso Completo</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-dashed border-purple-400/50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Boxes className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300" />
                  </div>
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl px-4 sm:px-6 py-3 sm:py-4"
                >
                  <CheckSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Estrutura Montada</p>
                    <p className="text-purple-200 text-xs sm:text-sm">3 Blocos Conectados</p>
                  </div>
                </motion.div>
              )}
              {scene === 12 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div className="flex justify-center gap-2 mb-3">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      >
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="text-lg sm:text-xl font-bold text-white">Blocos Completos!</p>
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
                i + 1 === scene ? 'bg-purple-400 scale-125' : i + 1 < scene ? 'bg-purple-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-purple-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full"
        >
          <span className="text-white text-xs font-medium">3 Blocos</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectThreeBlocks;
