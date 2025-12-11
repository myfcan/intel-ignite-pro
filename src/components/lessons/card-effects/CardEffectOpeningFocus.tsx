import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, Focus, Crosshair, Sunrise, Lightbulb, Star, Sparkles, Zap, Target } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectOpeningFocus: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
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

  const openingElements = [
    { icon: Eye, label: 'Captar Atenção', color: '#F59E0B' },
    { icon: Lightbulb, label: 'Despertar Interesse', color: '#10B981' },
    { icon: Target, label: 'Definir Expectativa', color: '#8B5CF6' },
    { icon: Zap, label: 'Gerar Engajamento', color: '#EF4444' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950 via-orange-900 to-yellow-950">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.4) 0%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
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
                initial={{ scale: 0 }}
                animate={{ scale: scene >= 1 ? 1 : 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50"
              >
                <Sunrise className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Foco na Abertura
              </motion.h2>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {openingElements.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      scale: scene >= idx + 3 ? 1 : 0 
                    }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-amber-400/30 text-center"
                  >
                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" style={{ color: item.color }} />
                    <p className="text-xs sm:text-sm text-white/90">{item.label}</p>
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
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Play className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-lg sm:text-xl text-white font-semibold">Início Impactante</p>
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                  <motion.div
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400"
                    animate={{ boxShadow: ['0 0 0 0 rgba(251,191,36,0.4)', '0 0 0 20px rgba(251,191,36,0)', '0 0 0 0 rgba(251,191,36,0.4)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Focus className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300" />
                  </div>
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                    3s
                  </div>
                  <p className="text-white/80 mt-2 text-sm sm:text-base">Para Capturar Atenção</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex gap-3">
                  {[Crosshair, Eye, Star].map((Icon, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center border border-amber-400/30"
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-4 sm:p-6 text-center"
                >
                  <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-sm sm:text-base">Gancho Poderoso</p>
                </motion.div>
              )}
              {scene === 12 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-lg sm:text-xl font-bold text-white">Abertura Perfeita!</p>
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
          <span className="text-white text-xs font-medium">Abertura</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectOpeningFocus;
