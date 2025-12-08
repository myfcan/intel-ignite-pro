import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Check, X, AlertCircle, Sparkles, ThumbsUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectPostChecklistProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectPostChecklist = ({ isActive = false, duration }: CardEffectPostChecklistProps) => {
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

  const checklistItems = [
    { text: "Gancho chamativo?", checked: true },
    { text: "CTA claro?", checked: true },
    { text: "Valor entregue?", checked: true }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-lime-950 via-green-900 to-emerald-950" />

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
                className="w-20 h-20 bg-lime-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <CheckSquare className="w-10 h-10 text-lime-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Checklist Antes de Postar
              </motion.h3>

              <div className="space-y-3 w-full">
                {checklistItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0,
                      scale: scene === i + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-lime-500/30"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: scene >= i + 1 ? 1 : 0 }}
                      className="w-6 h-6 bg-lime-600 rounded-md flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                    <span className="text-white text-sm sm:text-base">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <span className="text-lime-300 text-sm">Nunca mais post sem revisar</span>
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
                ✅
              </motion.div>
              <h3 className="text-2xl font-bold text-lime-400">Qualidade garantida</h3>
              <p className="text-lime-300 mt-2">em cada post</p>
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
              <div className="flex items-center justify-center gap-6 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-red-900/50 rounded-xl flex items-center justify-center"
                >
                  <X className="w-8 h-8 text-red-400" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl"
                >
                  →
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-16 h-16 bg-lime-900/50 rounded-xl flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-lime-400" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-green-400">De amador a profissional</h3>
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
                  boxShadow: ["0 0 20px rgba(132,204,22,0.3)", "0 0 60px rgba(132,204,22,0.6)", "0 0 20px rgba(132,204,22,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <AlertCircle className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-lime-400">Evite erros comuns</h3>
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
                📋
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Lista simples</h3>
              <p className="text-lime-300 mt-2">Resultados consistentes</p>
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
                <ThumbsUp className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-400">Confiança para postar</h3>
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
                  boxShadow: ["0 0 30px rgba(132,204,22,0.3)", "0 0 60px rgba(132,204,22,0.5)", "0 0 30px rgba(132,204,22,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-lime-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-lime-400">Pronto para postar!</h3>
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
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-lime-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-lime-700/50"
      >
        <span className="text-lime-300 text-xs font-medium">Checklist</span>
      </motion.div>
    </div>
  );
};
