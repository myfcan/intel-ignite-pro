import { motion, AnimatePresence } from "framer-motion";
import { Globe, Cpu, ArrowRight, Clock, Sparkles, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectHistoryParallelProps {
  isActive?: boolean;
}

export const CardEffectHistoryParallel = ({ isActive = false }: CardEffectHistoryParallelProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => setScene(2), 3000));
    timersRef.current.push(setTimeout(() => setScene(3), 6000));
    timersRef.current.push(setTimeout(() => setScene(4), 9000));
    timersRef.current.push(setTimeout(() => setScene(5), 12000));

    if (loopCountRef.current < 2) {
      timersRef.current.push(setTimeout(() => startAnimation(), 15000));
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
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Timeline effect */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scene >= 1 ? 1 : 0 }}
        className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600 rounded-full origin-left"
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Title */}
          {scene >= 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-10 text-center"
            >
              <h3 className="text-violet-300 text-xl font-bold flex items-center gap-2 justify-center">
                <Clock className="w-5 h-5" />
                A História Se Repete
              </h3>
            </motion.div>
          )}

          {/* Scene 2: Internet era */}
          {scene >= 2 && (
            <motion.div
              key="internet"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: scene >= 3 ? 0.5 : 1, x: 0 }}
              className="absolute left-8 top-1/2 -translate-y-1/2"
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  scene >= 3 ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                }`}>
                  <Globe className={`w-8 h-8 ${scene >= 3 ? 'text-gray-400' : 'text-white'}`} />
                </div>
                <p className={`text-sm font-medium mt-2 ${scene >= 3 ? 'text-gray-500' : 'text-blue-300'}`}>Internet</p>
                <p className={`text-xs ${scene >= 3 ? 'text-gray-600' : 'text-blue-400/70'}`}>~1995</p>
                
                <div className={`mt-3 text-xs text-center max-w-24 ${scene >= 3 ? 'text-gray-500' : 'text-gray-300'}`}>
                  "É modinha"
                </div>
                <div className={`mt-1 text-xs text-center max-w-24 ${scene >= 3 ? 'text-gray-600' : 'text-gray-400'}`}>
                  → Negócios construídos
                </div>
              </div>
            </motion.div>
          )}

          {/* Center arrow */}
          {scene >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-8 h-8 text-purple-400" />
              </motion.div>
            </motion.div>
          )}

          {/* Scene 3: AI era */}
          {scene >= 3 && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-8 top-1/2 -translate-y-1/2"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <p className="text-fuchsia-300 text-sm font-medium mt-2">I.A.</p>
                <p className="text-fuchsia-400/70 text-xs">Agora</p>
                
                <div className="mt-3 text-xs text-center max-w-24 text-fuchsia-200">
                  Acesso simples
                </div>
                <div className="mt-1 text-xs text-center max-w-24 text-fuchsia-300/70">
                  Não precisa programar
                </div>
              </div>
            </motion.div>
          )}

          {/* Scene 4: Key difference */}
          {scene >= 4 && (
            <motion.div
              key="difference"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 bg-fuchsia-900/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-fuchsia-500/30"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-fuchsia-400" />
                <p className="text-fuchsia-300 font-medium">
                  Diferença: acesso muito mais simples
                </p>
              </div>
            </motion.div>
          )}

          {/* Scene 5: Insight */}
          {scene >= 5 && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-8"
            >
              <p className="text-violet-400/70 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Precisa aprender a pedir e usar
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-violet-400' : 'bg-violet-900'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-violet-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-violet-400/30"
      >
        <span className="text-violet-300 text-xs font-medium">Paralelo</span>
      </motion.div>
    </div>
  );
};
