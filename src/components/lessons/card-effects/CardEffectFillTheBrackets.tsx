import { motion, AnimatePresence } from "framer-motion";
import { Brackets, Edit3, Sparkles, Zap, CheckCircle, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectFillTheBracketsProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectFillTheBrackets = ({ isActive = false, duration }: CardEffectFillTheBracketsProps) => {
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

  const bracketExamples = [
    { template: "[NICHO]", filled: "Empreendedores" },
    { template: "[DOR]", filled: "Falta de tempo" },
    { template: "[SOLUÇÃO]", filled: "Automação com I.A." }
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-violet-950" />

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
                className="w-20 h-20 bg-indigo-800/50 rounded-full flex items-center justify-center mb-2"
              >
                <Brackets className="w-10 h-10 text-indigo-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold text-white text-center mb-4"
              >
                Preencha os Colchetes
              </motion.h3>

              <div className="space-y-3 w-full">
                {bracketExamples.map((example, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: scene >= i + 1 ? 1 : 0.3,
                      x: 0
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-indigo-500/30"
                  >
                    <span className="text-indigo-400 font-mono text-sm">{example.template}</span>
                    <span className="text-white/50">→</span>
                    <span className="text-white text-sm">{example.filled}</span>
                  </motion.div>
                ))}
              </div>

              {scene >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <span className="text-indigo-300 text-sm">Personalização instantânea</span>
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
                className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Edit3 className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-indigo-400">Template + Contexto</h3>
              <p className="text-indigo-300 mt-2">= Conteúdo personalizado</p>
            </motion.div>
          )}

          {scene === 6 && (
            <motion.div
              key="scene6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-sm"
            >
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 text-left font-mono text-sm"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-indigo-400"
                >
                  Se você é <span className="text-yellow-400">[NICHO]</span>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-indigo-400"
                >
                  e sofre com <span className="text-red-400">[DOR]</span>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-indigo-400"
                >
                  precisa conhecer <span className="text-emerald-400">[SOLUÇÃO]</span>
                </motion.p>
              </motion.div>
              <h3 className="text-lg font-bold text-violet-400">Estrutura pronta</h3>
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
                className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Zap className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-blue-400">Rápido e eficiente</h3>
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
                ✨
              </motion.div>
              <h3 className="text-2xl font-bold text-white">Só preencher</h3>
              <p className="text-indigo-300 mt-2">A estrutura já está pronta</p>
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
                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FileText className="w-16 h-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-purple-400">Dezenas de templates</h3>
              <p className="text-purple-300 mt-2">para cada situação</p>
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
                  boxShadow: ["0 0 30px rgba(99,102,241,0.3)", "0 0 60px rgba(99,102,241,0.5)", "0 0 30px rgba(99,102,241,0.3)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-indigo-400">Personalizado em segundos</h3>
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
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-indigo-700/50"
      >
        <span className="text-indigo-300 text-xs font-medium">Templates</span>
      </motion.div>
    </div>
  );
};
