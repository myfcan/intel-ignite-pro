import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, CheckSquare, Repeat, Sparkles, Target } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectWeeklyRoutineProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectWeeklyRoutine = ({ isActive = false, duration }: CardEffectWeeklyRoutineProps) => {
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

  const weekDays = [
    { day: "Seg", task: "Ideias da semana", color: "bg-blue-800/30" },
    { day: "Qua", task: "Criar conteúdo", color: "bg-purple-800/30" },
    { day: "Sex", task: "Agendar posts", color: "bg-pink-800/30" }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-blue-900 to-indigo-950" />

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
                className="w-20 h-20 bg-sky-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <Calendar className="w-10 h-10 text-sky-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Rotina Semanal de Conteúdo
              </motion.h3>

              <div className="space-y-3 w-full">
                {weekDays.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0,
                      scale: scene === i + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className={`flex items-center gap-3 ${item.color} backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20`}
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{item.day}</span>
                    </div>
                    <span className="text-white text-sm sm:text-base">{item.task}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <Repeat className="w-5 h-5 text-sky-400" />
                  <span className="text-sky-300 text-sm">Consistência é a chave</span>
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
                  rotate: [0, 360],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Clock className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-sky-400">Tempo organizado</h3>
              <p className="text-sky-300 mt-2">= Mais resultados</p>
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
              <div className="grid grid-cols-7 gap-1 mb-6">
                {["S", "T", "Q", "Q", "S", "S", "D"].map((day, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      [0, 2, 4].includes(i) ? 'bg-sky-600' : 'bg-white/10'
                    }`}
                  >
                    <span className="text-white text-xs font-bold">{day}</span>
                  </motion.div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-blue-400">3 dias por semana</h3>
              <p className="text-blue-300 mt-2">Simples e eficiente</p>
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
                  boxShadow: ["0 0 20px rgba(14,165,233,0.3)", "0 0 60px rgba(14,165,233,0.6)", "0 0 20px rgba(14,165,233,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <CheckSquare className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-blue-400">Checklist pronto</h3>
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
                📅
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Planeje uma vez</h3>
              <p className="text-sky-300 mt-2">Execute a semana toda</p>
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
                className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Target className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-indigo-400">Metas claras</h3>
              <p className="text-indigo-300 mt-2">Resultados consistentes</p>
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
                  boxShadow: ["0 0 30px rgba(14,165,233,0.3)", "0 0 60px rgba(14,165,233,0.5)", "0 0 30px rgba(14,165,233,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-sky-400">Rotina que funciona</h3>
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
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-sky-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-sky-700/50"
      >
        <span className="text-sky-300 text-xs font-medium">Rotina</span>
      </motion.div>
    </div>
  );
};
