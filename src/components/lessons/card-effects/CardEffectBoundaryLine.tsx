import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, AlertTriangle, Shield, Lock, Ban, CheckCircle, Sparkles, X, AlertCircle, Eye } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectBoundaryLine: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
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

  const boundaries = [
    { icon: Shield, label: 'Proteger Escopo', color: '#10B981' },
    { icon: Lock, label: 'Limitar Promessas', color: '#8B5CF6' },
    { icon: Ban, label: 'Evitar Excessos', color: '#EF4444' },
    { icon: Eye, label: 'Manter Foco', color: '#06B6D4' },
  ];

  return (
    <div className="relative w-full min-h-[480px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-red-950 via-rose-900 to-pink-950">
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-full bg-gradient-to-r from-transparent via-red-400 to-transparent"
            style={{ top: `${20 + i * 15}%` }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
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
                initial={{ scale: 0 }}
                animate={{ scale: scene >= 1 ? 1 : 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/50"
              >
                <Minus className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={4} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Linha de Limite
              </motion.h2>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {boundaries.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      scale: scene >= idx + 3 ? 1 : 0.8 
                    }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-red-400/30"
                  >
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" style={{ color: item.color }} />
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
                    animate={{ x: [-5, 5, -5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 mx-auto" />
                  </motion.div>
                  <p className="text-lg sm:text-xl text-white font-semibold mt-3">Definindo Limites</p>
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-full max-w-xs">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1 }}
                    className="h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                  />
                  <div className="flex justify-between mt-2">
                    <X className="w-5 h-5 text-red-400" />
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
                    STOP
                  </div>
                  <p className="text-white/80 mt-2 text-sm sm:text-base">Onde Parar</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex gap-3">
                  {[Shield, Lock, Ban].map((Icon, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-red-500/30 to-rose-500/30 flex items-center justify-center border border-red-400/30"
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-red-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl p-4 sm:p-6 text-center"
                >
                  <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-sm sm:text-base">Limites Definidos</p>
                </motion.div>
              )}
              {scene === 12 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                  <motion.div className="relative">
                    <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 mx-auto" />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  </motion.div>
                  <p className="text-lg sm:text-xl font-bold text-white mt-3">Fronteiras Claras!</p>
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
                i + 1 === scene ? 'bg-red-400 scale-125' : i + 1 < scene ? 'bg-red-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full"
        >
          <span className="text-white text-xs font-medium">Limite</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectBoundaryLine;
