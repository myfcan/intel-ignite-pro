import { motion, AnimatePresence } from "framer-motion";
import { Layers, Video, BookOpen, FileText, Sparkles, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface CardEffectMultiFormatProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectMultiFormat = ({ isActive = false, duration = 33 }: CardEffectMultiFormatProps) => {
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

  const formats = [
    { icon: Video, label: "Curso em Vídeo", color: "from-red-500 to-orange-500" },
    { icon: BookOpen, label: "eBook", color: "from-teal-500 to-cyan-500" },
    { icon: FileText, label: "Apostila PDF", color: "from-blue-500 to-indigo-500" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(270 70% 50%/0.3), transparent 60%)" }}
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
                className="text-center mb-6 sm:mb-8"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Multiformato</h2>
                <p className="text-violet-200/80 text-sm sm:text-base">Um conhecimento, vários produtos</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {formats.map((format, index) => (
                scene >= index + 2 && (
                  <motion.div
                    key={format.label}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r ${format.color} shadow-lg`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <format.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-white text-sm sm:text-base font-medium">{format.label}</span>
                  </motion.div>
                )
              ))}
            </div>

            {scene >= 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 text-center"
              >
                <p className="text-violet-300 text-sm">Mesma base, formatos diferentes</p>
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
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-dashed border-violet-500/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  {formats.map((format, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${format.color} flex items-center justify-center shadow-lg`}
                      style={{
                        top: `${50 + 35 * Math.sin((i * 2 * Math.PI) / 3 - Math.PI / 2)}%`,
                        left: `${50 + 35 * Math.cos((i * 2 * Math.PI) / 3 - Math.PI / 2)}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                    >
                      <format.icon className="w-6 h-6 text-white" />
                    </motion.div>
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-violet-400" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Ecossistema de Formatos</h3>
              </motion.div>
            )}

            {scene === 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Uma Base</h3>
                <p className="text-violet-200/80 text-sm sm:text-base">Seu conhecimento estruturado</p>
              </motion.div>
            )}

            {scene === 9 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex gap-3 mb-6">
                  {formats.map((format, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.2, type: "spring" }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${format.color} flex items-center justify-center shadow-lg`}
                    >
                      <format.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                  ))}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Múltiplos Produtos</h3>
                <p className="text-violet-200/80 text-sm">Sem começar do zero toda vez</p>
              </motion.div>
            )}

            {scene === 10 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Eficiência Total</h3>
                <p className="text-emerald-200/80 text-sm sm:text-base">Mesmo esforço, mais resultados</p>
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
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-xl"
                >
                  <Layers className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Estratégia Multiformato!</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xs">Um único conhecimento vira vídeo, eBook, apostila e muito mais</p>
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
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scene >= i + 1 ? 'bg-violet-400' : 'bg-white/20'}`}
            animate={{ scale: scene === i + 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {isActive && scene >= 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-violet-500/20 border border-violet-500/40"
        >
          <span className="text-violet-300 text-xs sm:text-sm font-medium">Multiformato</span>
        </motion.div>
      )}
    </div>
  );
};
