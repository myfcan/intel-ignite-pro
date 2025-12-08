import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Sparkles, Brain, Zap, RefreshCw, Infinity as InfinityIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectIdeaGeneratorProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectIdeaGenerator = ({ isActive = false, duration }: CardEffectIdeaGeneratorProps) => {
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

  const ideaExamples = [
    "Post sobre produtividade",
    "Story do dia a dia",
    "Carrossel educativo"
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-yellow-900 to-orange-950" />

      {/* Floating lightbulbs */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          >
            <Lightbulb className="w-6 h-6 text-yellow-400/40" />
          </motion.div>
        ))}
      </div>

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
                className="w-20 h-20 bg-yellow-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Lightbulb className="w-10 h-10 text-yellow-400" />
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Gerador de Ideias
              </motion.h3>

              <div className="space-y-3 w-full">
                {ideaExamples.map((idea, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0,
                      scale: scene === i + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-yellow-500/30"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-white text-sm sm:text-base">{idea}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-300 text-sm">Infinitas possibilidades</span>
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
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Brain className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-yellow-400">Nunca sem ideias</h3>
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
              <div className="grid grid-cols-3 gap-3 mb-6">
                {["💡", "✨", "🎯", "📱", "🎨", "💬"].map((emoji, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                    className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-3xl"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-amber-400">Tipos variados</h3>
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
                  boxShadow: ["0 0 20px rgba(250,204,21,0.3)", "0 0 60px rgba(250,204,21,0.6)", "0 0 20px rgba(250,204,21,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Zap className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-yellow-400">Instantâneo</h3>
              <p className="text-yellow-300 mt-2">Ideias em segundos</p>
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
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-6"
              >
                🔄
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Gerar novamente</h3>
              <p className="text-amber-300 mt-2">Até encontrar a perfeita</p>
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
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <InfinityIcon className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-purple-400">Sem limites</h3>
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
                  boxShadow: ["0 0 30px rgba(250,204,21,0.3)", "0 0 60px rgba(250,204,21,0.5)", "0 0 30px rgba(250,204,21,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Lightbulb className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-yellow-400">Ideias infinitas, sempre</h3>
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
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-yellow-700/50"
      >
        <span className="text-yellow-300 text-xs font-medium">Gerador</span>
      </motion.div>
    </div>
  );
};
