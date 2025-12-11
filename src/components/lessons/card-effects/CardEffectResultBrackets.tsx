import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, TrendingUp, Award, Medal, Star, CheckCircle, Sparkles, Zap, Gift } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectResultBrackets: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
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

  const results = [
    { icon: Target, label: 'Objetivo Alcançado', color: '#10B981' },
    { icon: TrendingUp, label: 'Progresso Visível', color: '#06B6D4' },
    { icon: Trophy, label: 'Conquista Desbloqueada', color: '#F59E0B' },
    { icon: Award, label: 'Certificação', color: '#8B5CF6' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-950 via-amber-900 to-orange-950">
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          >
            <motion.div
              animate={{ 
                scale: [0.5, 1, 0.5],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
            >
              <Star className="w-4 h-4 text-yellow-400" />
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
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/50"
              >
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                [Resultados] Prometidos
              </motion.h2>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {results.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      scale: scene >= idx + 3 ? 1 : 0.5 
                    }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-yellow-400/30 text-center"
                  >
                    <result.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" style={{ color: result.color }} />
                    <p className="text-xs sm:text-sm text-white/90">{result.label}</p>
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
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg sm:text-xl text-white font-semibold mt-3">Resultados Garantidos</p>
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-yellow-500/30 flex items-center justify-center"
                    >
                      <Medal className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
                    +500%
                  </div>
                  <p className="text-white/80 mt-2 text-sm sm:text-base">Melhoria Esperada</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex gap-3">
                  {[Target, TrendingUp, Zap].map((Icon, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-500/30 flex items-center justify-center border border-yellow-400/30"
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl px-4 sm:px-6 py-3 sm:py-4"
                >
                  <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Transformação Real</p>
                    <p className="text-yellow-200 text-xs sm:text-sm">Resultados Comprovados</p>
                  </div>
                </motion.div>
              )}
              {scene === 12 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div className="flex justify-center gap-1 mb-3">
                    {[Star, Trophy, Star].map((Icon, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      >
                        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="text-lg sm:text-xl font-bold text-white">Resultados Definidos!</p>
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
                i + 1 === scene ? 'bg-yellow-400 scale-125' : i + 1 < scene ? 'bg-yellow-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-yellow-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full"
        >
          <span className="text-white text-xs font-medium">[Resultados]</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectResultBrackets;
