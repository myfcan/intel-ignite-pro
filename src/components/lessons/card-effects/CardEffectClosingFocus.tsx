import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, CheckCircle, Trophy, Sunset, ArrowRight, Star, Gift, Sparkles, Medal, Target } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectClosingFocus: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
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

  const closingElements = [
    { icon: CheckCircle, label: 'Resumir Aprendizado', color: '#10B981' },
    { icon: Target, label: 'Reforçar Mensagem', color: '#8B5CF6' },
    { icon: ArrowRight, label: 'Chamar para Ação', color: '#06B6D4' },
    { icon: Gift, label: 'Deixar Inspiração', color: '#F59E0B' },
  ];

  return (
    <div className="relative w-full min-h-[480px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950 via-pink-900 to-purple-950">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.4) 0%, transparent 70%)'
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
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
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/50"
              >
                <Sunset className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Foco no Fechamento
              </motion.h2>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {closingElements.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      y: scene >= idx + 3 ? 0 : 20 
                    }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-rose-400/30 text-center"
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
                  <Flag className="w-16 h-16 sm:w-20 sm:h-20 text-rose-400 mx-auto mb-3" />
                  <p className="text-lg sm:text-xl text-white font-semibold">Chegada Memorável</p>
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-rose-500/30 flex items-center justify-center"
                    >
                      <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-rose-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
                    CTA
                  </div>
                  <p className="text-white/80 mt-2 text-sm sm:text-base">Chamada para Ação Clara</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-rose-500/40 to-pink-500/40 flex items-center justify-center"
                  >
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />
                  </motion.div>
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl px-4 sm:px-6 py-3 sm:py-4"
                >
                  <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Conclusão Forte</p>
                    <p className="text-rose-200 text-xs sm:text-sm">Deixar Marca</p>
                  </div>
                </motion.div>
              )}
              {scene === 12 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div className="flex justify-center gap-2 mb-3">
                    {[Star, Sparkles, Star].map((Icon, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      >
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="text-lg sm:text-xl font-bold text-white">Fechamento Perfeito!</p>
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
                i + 1 === scene ? 'bg-rose-400 scale-125' : i + 1 < scene ? 'bg-rose-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-rose-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full"
        >
          <span className="text-white text-xs font-medium">Fechamento</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectClosingFocus;
