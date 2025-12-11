import { motion, AnimatePresence } from "framer-motion";
import { Play, Video, Monitor, CheckCircle, Sparkles } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface CardEffectVideoCourseViewProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectVideoCourseView = ({ isActive = false, duration = 33 }: CardEffectVideoCourseViewProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const scale = useMemo(() => Math.max(0.5, Math.min(2, duration / 33)), [duration]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(1);
    loopCountRef.current = 0;

    const baseTime = 3000 * scale;
    const scheduleScene = (sceneNum: number, delay: number) => {
      const timer = setTimeout(() => setScene(sceneNum), delay);
      timersRef.current.push(timer);
    };

    for (let i = 2; i <= 11; i++) {
      scheduleScene(i, baseTime * (i - 1));
    }
  };

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      loopCountRef.current = 0;
    }
    return () => clearTimers();
  }, [isActive, scale]);

  const modules = [
    { title: "Módulo 1", desc: "Introdução" },
    { title: "Módulo 2", desc: "Fundamentos" },
    { title: "Módulo 3", desc: "Prática" },
    { title: "Módulo 4", desc: "Avançado" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(0 70% 50%/0.3), transparent 60%)" }}
      />

      <AnimatePresence mode="wait">
        {/* FASE 1: Elementos empilhados (Cenas 1-6) */}
        {scene >= 1 && scene <= 6 && (
          <motion.div
            key="phase-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center w-full max-w-md sm:max-w-lg px-4 sm:px-6"
          >
            {scene >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Curso em Vídeo</h2>
                <p className="text-red-200/80 text-sm sm:text-base">Aulas curtas, claras e aplicáveis</p>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
              {modules.map((mod, index) => (
                scene >= index + 2 && (
                  <motion.div
                    key={mod.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-white/5 border border-red-500/30"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    </div>
                    <span className="text-white text-sm sm:text-base font-medium">{mod.title}</span>
                    <span className="text-red-300/70 text-xs">{mod.desc}</span>
                  </motion.div>
                )
              ))}
            </div>

            {scene >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 sm:mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40"
              >
                <CheckCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm font-medium">Curso estruturado!</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* FASE 2: Tela limpa com efeitos únicos (Cenas 7-11) */}
        {scene >= 7 && (
          <motion.div
            key="phase-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center w-full max-w-md sm:max-w-lg px-4 sm:px-6"
          >
            {scene === 7 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="relative w-48 h-28 sm:w-64 sm:h-36 rounded-xl bg-slate-800 border-2 border-red-500/50 overflow-hidden mb-6"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
                    </motion.div>
                  </div>
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Player Interativo</h3>
              </motion.div>
            )}

            {scene === 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30"
                >
                  <Monitor className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Demonstrações</h3>
                <p className="text-red-200/80 text-sm sm:text-base">Mostre na prática como fazer</p>
              </motion.div>
            )}

            {scene === 9 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex gap-2 mb-6">
                  {["5min", "8min", "6min", "10min"].map((time, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40"
                    >
                      <span className="text-red-300 text-sm font-medium">{time}</span>
                    </motion.div>
                  ))}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Aulas Curtas</h3>
                <p className="text-red-200/80 text-sm">Conteúdo direto ao ponto</p>
              </motion.div>
            )}

            {scene === 10 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Exemplos Reais</h3>
                <p className="text-amber-200/80 text-sm sm:text-base">Orientações claras e práticas</p>
              </motion.div>
            )}

            {scene === 11 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center mb-6 shadow-xl"
                >
                  <Video className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Curso Pronto!</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xs">Módulos organizados com aulas práticas e demonstrações claras</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 mt-4">
        {Array.from({ length: 11 }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scene >= i + 1 ? 'bg-red-400' : 'bg-white/20'}`}
            animate={{ scale: scene === i + 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {isActive && scene >= 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-red-500/20 border border-red-500/40"
        >
          <span className="text-red-300 text-xs sm:text-sm font-medium">Curso em Vídeo</span>
        </motion.div>
      )}
    </div>
  );
};
