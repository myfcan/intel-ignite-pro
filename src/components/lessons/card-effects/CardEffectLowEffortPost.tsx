import { motion, AnimatePresence } from "framer-motion";
import { ThumbsDown, Eye, MessageCircle, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectLowEffortPostProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectLowEffortPost = ({ isActive = false, duration }: CardEffectLowEffortPostProps) => {
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

  const badMetrics = [
    { icon: Eye, value: "23", label: "views", color: "text-red-400" },
    { icon: ThumbsDown, value: "2", label: "likes", color: "text-orange-400" },
    { icon: MessageCircle, value: "0", label: "comentários", color: "text-yellow-400" }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-rose-900 to-orange-950" />

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
                className="w-20 h-20 bg-red-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <TrendingDown className="w-10 h-10 text-red-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Post Sem Esforço = Sem Resultado
              </motion.h3>

              {/* Fake post card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full" />
                  <span className="text-white/70 text-sm">@usuario</span>
                </div>
                <p className="text-white/50 text-sm italic mb-4">"Bom dia! 🌞"</p>
                
                <div className="flex justify-around pt-3 border-t border-white/10">
                  {badMetrics.map((metric, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: scene >= i + 1 ? 1 : 0.3,
                        scale: scene >= i + 1 ? 1 : 0.8
                      }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-1"
                    >
                      <metric.icon className={`w-4 h-4 ${metric.color}`} />
                      <span className={`text-sm ${metric.color}`}>{metric.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 mt-4"
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Isso não conecta com ninguém</span>
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
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                😴
              </motion.div>
              <h3 className="text-2xl font-bold text-red-400">Conteúdo genérico...</h3>
              <p className="text-red-300 mt-2">...gera resultados genéricos</p>
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
              <div className="grid grid-cols-3 gap-4 mb-6">
                {["Bom dia!", "Feliz segunda!", "Boa semana!"].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.3, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="bg-white/10 px-3 py-2 rounded-lg"
                  >
                    <span className="text-white/50 text-xs">{text}</span>
                  </motion.div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-orange-400">Todo mundo faz igual</h3>
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
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-purple-400">Mas e se...</h3>
              <p className="text-purple-300 mt-2">você tivesse ideias que conectam?</p>
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
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                🎯
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Conteúdo que toca na dor</h3>
              <p className="text-emerald-400 mt-2">= Conteúdo que engaja</p>
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
              <div className="flex items-center justify-center gap-4 mb-6">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-900/50 px-4 py-2 rounded-lg"
                >
                  <span className="text-red-300">Genérico</span>
                </motion.div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  →
                </motion.span>
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-emerald-900/50 px-4 py-2 rounded-lg"
                >
                  <span className="text-emerald-300">Específico</span>
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-white">A diferença está nos detalhes</h3>
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
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-emerald-400">I.A. ajuda a ser específico</h3>
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
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-red-700/50"
      >
        <span className="text-red-300 text-xs font-medium">Problema Comum</span>
      </motion.div>
    </div>
  );
};
