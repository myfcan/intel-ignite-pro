import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, MessageCircle, Share2, Target, Lightbulb } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectRelatableMomentsProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectRelatableMoments = ({ isActive = false, duration }: CardEffectRelatableMomentsProps) => {
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

  const relatableExamples = [
    { text: "Aquele momento que...", emoji: "😅" },
    { text: "Só eu que...", emoji: "🤔" },
    { text: "Ninguém fala, mas...", emoji: "🤫" }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-950 via-rose-900 to-fuchsia-950" />

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
                className="w-20 h-20 bg-pink-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <Heart className="w-10 h-10 text-pink-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Momentos que Conectam
              </motion.h3>

              <div className="space-y-3 w-full">
                {relatableExamples.map((example, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0,
                      scale: scene === i + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20"
                  >
                    <span className="text-2xl">{example.emoji}</span>
                    <span className="text-white text-sm sm:text-base">{example.text}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <Target className="w-5 h-5 text-pink-400" />
                  <span className="text-pink-300 text-sm">O segredo do engajamento</span>
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
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                🤝
              </motion.div>
              <h3 className="text-2xl font-bold text-pink-400">Conexão genuína</h3>
              <p className="text-pink-300 mt-2">faz toda a diferença</p>
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
              <div className="flex justify-center gap-4 mb-6">
                {[Heart, MessageCircle, Share2].map((Icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center"
                  >
                    <Icon className="w-8 h-8 text-pink-400" />
                  </motion.div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-fuchsia-400">Engajamento real</h3>
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
                  boxShadow: ["0 0 20px rgba(236,72,153,0.3)", "0 0 60px rgba(236,72,153,0.6)", "0 0 20px rgba(236,72,153,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Users className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-pink-400">Pessoas se identificam</h3>
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
                💬
              </motion.div>
              <h3 className="text-2xl font-bold text-white">"Isso sou eu!"</h3>
              <p className="text-rose-300 mt-2">A reação que você quer</p>
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
                className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Lightbulb className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-amber-400">I.A. te ajuda a encontrar</h3>
              <p className="text-amber-300 mt-2">esses momentos</p>
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
                  boxShadow: ["0 0 30px rgba(236,72,153,0.3)", "0 0 60px rgba(236,72,153,0.5)", "0 0 30px rgba(236,72,153,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Heart className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-pink-400">Conteúdo que toca corações</h3>
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
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-pink-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-pink-700/50"
      >
        <span className="text-pink-300 text-xs font-medium">Conexão</span>
      </motion.div>
    </div>
  );
};
