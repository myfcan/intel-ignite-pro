import { motion, AnimatePresence } from "framer-motion";
import { XCircle, AlertTriangle, CheckCircle, ArrowRight, Lightbulb, Target } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectContentMistakesProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectContentMistakes = ({ isActive = false, duration }: CardEffectContentMistakesProps) => {
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

  const mistakes = [
    { wrong: "Postar sem objetivo", right: "Definir intenção clara" },
    { wrong: "Copiar outros", right: "Adaptar ao seu estilo" },
    { wrong: "Ignorar seu público", right: "Conhecer suas dores" }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-950 via-amber-900 to-yellow-950" />

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
                className="w-20 h-20 bg-orange-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <AlertTriangle className="w-10 h-10 text-orange-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Erros Comuns de Conteúdo
              </motion.h3>

              <div className="space-y-3 w-full">
                {mistakes.map((mistake, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-3 rounded-xl border border-white/20"
                  >
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-xs sm:text-sm line-through">{mistake.wrong}</span>
                    <ArrowRight className="w-4 h-4 text-white/50 flex-shrink-0" />
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 text-xs sm:text-sm">{mistake.right}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <span className="text-amber-300 text-sm">Aprenda com os erros dos outros</span>
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
                ❌
              </motion.div>
              <h3 className="text-2xl font-bold text-red-400">Erros custam caro</h3>
              <p className="text-red-300 mt-2">Tempo e energia perdidos</p>
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
              <div className="flex items-center justify-center gap-8 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-red-900/50 rounded-xl flex items-center justify-center"
                >
                  <XCircle className="w-10 h-10 text-red-400" />
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
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="w-20 h-20 bg-emerald-900/50 rounded-xl flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-white">Transforme erros em acertos</h3>
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
                  boxShadow: ["0 0 20px rgba(245,158,11,0.3)", "0 0 60px rgba(245,158,11,0.6)", "0 0 20px rgba(245,158,11,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Lightbulb className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-amber-400">Conhecimento é poder</h3>
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
                🎯
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Foco no que funciona</h3>
              <p className="text-orange-300 mt-2">Não no que todo mundo faz</p>
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
                <Target className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-purple-400">I.A. te mostra o caminho</h3>
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
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-emerald-400">Menos erros, mais resultados</h3>
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
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-orange-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-orange-700/50"
      >
        <span className="text-orange-300 text-xs font-medium">Erros Comuns</span>
      </motion.div>
    </div>
  );
};
