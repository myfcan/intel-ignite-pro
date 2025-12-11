import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Clapperboard, Video, Camera, Megaphone, Star, Users, CheckCircle, Sparkles, Crown } from 'lucide-react';

interface CardEffectProps {
  isActive: boolean;
  duration?: number;
}

export const CardEffectDirectorRule: React.FC<CardEffectProps> = ({ isActive, duration = 36 }) => {
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

  const directorRules = [
    { icon: Film, label: 'Visão Geral', color: '#8B5CF6' },
    { icon: Camera, label: 'Direção Clara', color: '#06B6D4' },
    { icon: Megaphone, label: 'Comando Firme', color: '#F59E0B' },
    { icon: Users, label: 'Liderar Equipe', color: '#10B981' },
  ];

  return (
    <div className="relative w-full min-h-[480px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-gray-900 to-zinc-950">
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
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <Film className="w-6 h-6 text-gray-500" />
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
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: scene >= 1 ? 1 : 0, rotate: 0 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-gray-600 to-slate-700 flex items-center justify-center shadow-lg shadow-gray-500/30"
              >
                <Clapperboard className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : 20 }}
                className="text-xl sm:text-2xl font-bold text-white text-center"
              >
                Regra do Diretor
              </motion.h2>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-2 sm:mt-4">
                {directorRules.map((rule, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: scene >= idx + 3 ? 1 : 0, 
                      y: scene >= idx + 3 ? 0 : 20 
                    }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-600/30"
                  >
                    <rule.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" style={{ color: rule.color }} />
                    <p className="text-xs sm:text-sm text-white/90">{rule.label}</p>
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
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clapperboard className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto" />
                  </motion.div>
                  <p className="text-lg sm:text-xl text-white font-semibold mt-3">Ação!</p>
                </motion.div>
              )}
              {scene === 8 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Camera className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-400" />
                  </motion.div>
                  <Video className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  >
                    <Film className="w-12 h-12 sm:w-14 sm:h-14 text-purple-400" />
                  </motion.div>
                </motion.div>
              )}
              {scene === 9 && (
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="text-center">
                  <Crown className="w-12 h-12 sm:w-14 sm:h-14 text-yellow-400 mx-auto mb-2" />
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white">
                    VOCÊ
                  </div>
                  <p className="text-white/80 mt-1 text-sm sm:text-base">É o Diretor</p>
                </motion.div>
              )}
              {scene === 10 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex gap-3">
                  {[Megaphone, Crown, Star].map((Icon, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-gray-700/50 to-slate-700/50 flex items-center justify-center border border-gray-600/30"
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {scene === 11 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-gray-700 to-slate-700 rounded-xl px-4 sm:px-6 py-3 sm:py-4"
                >
                  <Clapperboard className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">Controle Total</p>
                    <p className="text-gray-300 text-xs sm:text-sm">Você Decide</p>
                  </div>
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
                  <p className="text-lg sm:text-xl font-bold text-white mt-3">Diretor Pronto!</p>
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
                i + 1 === scene ? 'bg-gray-400 scale-125' : i + 1 < scene ? 'bg-gray-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gray-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full"
        >
          <span className="text-white text-xs font-medium">Diretor</span>
        </motion.div>
      )}
    </div>
  );
};

export default CardEffectDirectorRule;
