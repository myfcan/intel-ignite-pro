import { motion, AnimatePresence } from "framer-motion";
import { Target, Users, Sparkles, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface CardEffectCoreTriangleProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectCoreTriangle = ({ isActive = false, duration = 33 }: CardEffectCoreTriangleProps) => {
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

    scheduleScene(2, baseTime);
    scheduleScene(3, baseTime * 2);
    scheduleScene(4, baseTime * 3);
    scheduleScene(5, baseTime * 4);
    scheduleScene(6, baseTime * 5);
    scheduleScene(7, baseTime * 6);
    scheduleScene(8, baseTime * 7);
    scheduleScene(9, baseTime * 8);
    scheduleScene(10, baseTime * 9);
    scheduleScene(11, baseTime * 10);
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

  const trianglePoints = [
    { icon: Target, label: "Tema", desc: "Sobre o que você vai falar?", color: "from-purple-500 to-purple-600" },
    { icon: Users, label: "Público", desc: "Para quem é esse conteúdo?", color: "from-blue-500 to-blue-600" },
    { icon: Sparkles, label: "Promessa", desc: "Qual transformação entrega?", color: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{ backgroundPosition: isActive ? ["0% 0%", "100% 100%"] : "0% 0%" }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.3), transparent 60%)" }}
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
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Tríade Central</h2>
                <p className="text-purple-200/80 text-sm sm:text-base">Três decisões que definem tudo</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {trianglePoints.map((point, index) => (
                scene >= index + 2 && (
                  <motion.div
                    key={point.label}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r ${point.color} shadow-lg`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-white">{point.label}</h3>
                      <p className="text-white/80 text-xs sm:text-sm truncate">{point.desc}</p>
                    </div>
                  </motion.div>
                )
              ))}
            </div>

            {scene >= 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 sm:mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40"
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-emerald-300 text-sm sm:text-base font-medium">Base definida!</span>
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
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="flex flex-col items-center"
              >
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                    <Target className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Clareza Total</h3>
              </motion.div>
            )}

            {scene === 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30"
                >
                  <Target className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tema Definido</h3>
                <p className="text-purple-200/80 text-sm sm:text-base">O assunto central do seu conteúdo</p>
              </motion.div>
            )}

            {scene === 9 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"
                >
                  <Users className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Público Claro</h3>
                <p className="text-blue-200/80 text-sm sm:text-base">Quem vai consumir esse conteúdo</p>
              </motion.div>
            )}

            {scene === 10 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
                >
                  <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Promessa Forte</h3>
                <p className="text-emerald-200/80 text-sm sm:text-base">A transformação que você entrega</p>
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
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 flex items-center justify-center mb-6 shadow-xl"
                >
                  <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tríade Completa!</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xs">Tema + Público + Promessa = Base sólida para qualquer conteúdo profundo</p>
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
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scene >= i + 1 ? 'bg-purple-400' : 'bg-white/20'}`}
            animate={{ scale: scene === i + 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {isActive && scene >= 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40"
        >
          <span className="text-purple-300 text-xs sm:text-sm font-medium">Tríade</span>
        </motion.div>
      )}
    </div>
  );
};
