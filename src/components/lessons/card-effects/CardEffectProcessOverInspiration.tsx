import { motion, AnimatePresence } from "framer-motion";
import { Settings, Lightbulb, ArrowRight, Cog, Repeat, Trophy } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectProcessOverInspirationProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectProcessOverInspiration = ({ isActive = false, duration }: CardEffectProcessOverInspirationProps) => {
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

  const comparison = [
    { icon: Lightbulb, text: "Inspiração", desc: "Incerta", color: "text-yellow-400", bg: "bg-yellow-800/30" },
    { icon: Settings, text: "Processo", desc: "Consistente", color: "text-blue-400", bg: "bg-blue-800/30" },
    { icon: Cog, text: "Sistema", desc: "Escalável", color: "text-purple-400", bg: "bg-purple-800/30" }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950" />

      {/* Animated gears background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              left: `${20 + i * 20}%`, 
              top: `${30 + (i % 2) * 30}%`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
          >
            <Cog className="w-16 h-16 text-white" />
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
                animate={{ scale: 1, rotate: 360 }}
                transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
                className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <Settings className="w-10 h-10 text-slate-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Processo &gt; Inspiração
              </motion.h3>

              <div className="space-y-3 w-full">
                {comparison.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0,
                      scale: scene === i + 1 ? 1.05 : 1
                    }}
                    transition={{ delay: i * 0.2 }}
                    className={`flex items-center justify-between ${item.bg} backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-white text-sm sm:text-base">{item.text}</span>
                    </div>
                    <span className={`text-xs ${item.color}`}>{item.desc}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <span className="text-slate-400 text-sm">Não dependa da inspiração</span>
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
              <div className="flex items-center justify-center gap-4 mb-6">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-yellow-900/50 rounded-xl flex items-center justify-center"
                >
                  <Lightbulb className="w-10 h-10 text-yellow-400" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <ArrowRight className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 bg-blue-900/50 rounded-xl flex items-center justify-center"
                >
                  <Settings className="w-10 h-10 text-blue-400" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-white">Da inspiração ao sistema</h3>
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
                animate={{ 
                  rotate: 360,
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Cog className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-blue-400">Sistema automático</h3>
              <p className="text-blue-300 mt-2">funciona mesmo sem você</p>
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
                  boxShadow: ["0 0 20px rgba(99,102,241,0.3)", "0 0 60px rgba(99,102,241,0.6)", "0 0 20px rgba(99,102,241,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Repeat className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-indigo-400">Repetível</h3>
              <p className="text-indigo-300 mt-2">Resultados consistentes</p>
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
                ⚙️
              </motion.div>
              <h3 className="text-2xl font-bold text-white">I.A. é seu processo</h3>
              <p className="text-purple-300 mt-2">Sempre pronta, sempre consistente</p>
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
                <Trophy className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-amber-400">Resultados previsíveis</h3>
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
                  rotate: 360,
                  boxShadow: ["0 0 30px rgba(99,102,241,0.3)", "0 0 60px rgba(99,102,241,0.5)", "0 0 30px rgba(99,102,241,0.3)"]
                }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Settings className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-blue-400">Processo vence inspiração</h3>
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
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700/50"
      >
        <span className="text-slate-300 text-xs font-medium">Mindset</span>
      </motion.div>
    </div>
  );
};
