import { motion, AnimatePresence } from "framer-motion";
import { FileEdit, Pencil, ArrowRight, Sparkles, CheckCircle, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectFirstDraftProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectFirstDraft = ({ isActive = false, duration }: CardEffectFirstDraftProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const baseSceneDuration = 3000;
  const totalScenes = 11;
  const baseTotalDuration = baseSceneDuration * totalScenes;
  const scaleFactor = duration ? (duration * 1000) / baseTotalDuration : 1;
  const sceneDuration = baseSceneDuration * scaleFactor;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);

    for (let i = 1; i <= totalScenes; i++) {
      timersRef.current.push(setTimeout(() => setScene(i), sceneDuration * i));
    }

    if (loopCountRef.current < 2) {
      timersRef.current.push(setTimeout(() => startAnimation(), sceneDuration * (totalScenes + 1)));
    }
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
    }
    return () => clearTimers();
  }, [isActive, duration]);

  const draftSteps = [
    { text: "I.A. gera rascunho", icon: Zap },
    { text: "Você revisa e ajusta", icon: Pencil },
    { text: "Versão final pronta", icon: CheckCircle }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 max-w-md w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <FileEdit className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Primeiro Rascunho Instantâneo
              </motion.h3>

              <div className="space-y-3 w-full">
                {draftSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0,
                      scale: scene === i + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-emerald-500/30"
                  >
                    <div className="w-8 h-8 bg-emerald-800/50 rounded-full flex items-center justify-center">
                      <span className="text-emerald-400 text-sm font-bold">{i + 1}</span>
                    </div>
                    <step.icon className="w-5 h-5 text-emerald-400" />
                    <span className="text-white text-sm sm:text-base">{step.text}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <span className="text-emerald-300 text-sm">Começar é mais fácil que continuar</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 2: Full Screen Effects */}
          {scene === 5 && (
            <motion.div
              key="scene5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                📝
              </motion.div>
              <h3 className="text-2xl font-bold text-emerald-400">O mais difícil é começar</h3>
              <p className="text-emerald-300 mt-2">I.A. começa por você</p>
            </motion.div>
          )}

          {scene === 6 && (
            <motion.div
              key="scene6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="w-20 h-20 bg-gray-800/50 rounded-xl flex items-center justify-center"
                >
                  <span className="text-gray-400 text-3xl">📄</span>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <ArrowRight className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="w-20 h-20 bg-emerald-800/50 rounded-xl flex items-center justify-center"
                >
                  <span className="text-emerald-400 text-3xl">✨</span>
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-teal-400">De vazio a pronto</h3>
            </motion.div>
          )}

          {scene === 7 && (
            <motion.div
              key="scene7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ["0 0 20px rgba(16,185,129,0.3)", "0 0 60px rgba(16,185,129,0.6)", "0 0 20px rgba(16,185,129,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Zap className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-emerald-400">Em segundos</h3>
              <p className="text-emerald-300 mt-2">não em horas</p>
            </motion.div>
          )}

          {scene === 8 && (
            <motion.div
              key="scene8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                ✏️
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Você só refina</h3>
              <p className="text-teal-300 mt-2">O trabalho pesado já foi feito</p>
            </motion.div>
          )}

          {scene === 9 && (
            <motion.div
              key="scene9"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-400">Sua voz, sua revisão</h3>
            </motion.div>
          )}

          {scene >= 10 && (
            <motion.div
              key="scene10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ["0 0 30px rgba(16,185,129,0.3)", "0 0 60px rgba(16,185,129,0.5)", "0 0 30px rgba(16,185,129,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-emerald-400">Rascunho pronto, sempre</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="relative z-10 flex justify-center gap-2 mt-4 pb-6">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${scene >= i + 1 ? 'bg-white' : 'bg-white/30'}`}
            animate={{ scale: scene === i + 1 ? 1.3 : 1 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-emerald-700/50"
      >
        <span className="text-emerald-300 text-xs font-medium">Rascunho</span>
      </motion.div>
    </div>
  );
};
