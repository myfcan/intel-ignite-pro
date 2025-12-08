import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Loader2, Clock, Brain, Sparkles, Lightbulb } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectBlankScreenProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectBlankScreen = ({ isActive = false, duration }: CardEffectBlankScreenProps) => {
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

  const problems = [
    { icon: Clock, text: "Horas olhando a tela", color: "text-red-400" },
    { icon: Brain, text: "Bloqueio criativo", color: "text-orange-400" },
    { icon: Loader2, text: "Cursor piscando...", color: "text-yellow-400" }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-gray-900 to-zinc-950" />
      
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Problem Cards (Scenes 0-4) */}
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
                className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4"
              >
                <Monitor className="w-10 h-10 text-slate-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-6"
              >
                A Tela em Branco
              </motion.h3>

              <div className="space-y-3 w-full">
                {problems.map((problem, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3, 
                      x: 0,
                      scale: scene === i + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3 bg-slate-800/40 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-700/50"
                  >
                    <problem.icon className={`w-5 h-5 ${problem.color}`} />
                    <span className="text-slate-200 text-sm sm:text-base">{problem.text}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <span className="text-slate-400 text-sm">Todo mundo já passou por isso...</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 2: Full Screen Effects (Scenes 5-10) */}
          {scene === 5 && (
            <motion.div
              key="scene5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-6"
              >
                <Loader2 className="w-24 h-24 text-slate-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-400">Esperando a inspiração...</h3>
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Lightbulb className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-amber-400">E se houvesse outro caminho?</h3>
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
                  boxShadow: ["0 0 20px rgba(147,51,234,0.3)", "0 0 60px rgba(147,51,234,0.6)", "0 0 20px rgba(147,51,234,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-purple-400">A I.A. como parceira</h3>
            </motion.div>
          )}

          {scene === 8 && (
            <motion.div
              key="scene8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-8"
            >
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-red-900/50 rounded-xl flex items-center justify-center mb-2">
                  <Monitor className="w-10 h-10 text-red-400" />
                </div>
                <span className="text-red-400 text-sm">Antes</span>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl"
              >
                →
              </motion.div>
              
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-emerald-900/50 rounded-xl flex items-center justify-center mb-2">
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>
                <span className="text-emerald-400 text-sm">Depois</span>
              </motion.div>
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
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                ⚡
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Ideias em segundos</h3>
              <p className="text-slate-400 mt-2">Não em horas</p>
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
                  boxShadow: ["0 0 30px rgba(34,197,94,0.3)", "0 0 60px rgba(34,197,94,0.5)", "0 0 30px rgba(34,197,94,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Lightbulb className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-emerald-400">Tela em branco? Nunca mais.</h3>
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

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700/50"
      >
        <span className="text-slate-300 text-xs font-medium">O Problema</span>
      </motion.div>
    </div>
  );
};
