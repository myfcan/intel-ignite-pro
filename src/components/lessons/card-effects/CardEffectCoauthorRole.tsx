import { motion, AnimatePresence } from "framer-motion";
import { Users, Brain, Sparkles, CheckCircle, Heart, Zap } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface CardEffectCoauthorRoleProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectCoauthorRole = ({ isActive = false, duration = 33 }: CardEffectCoauthorRoleProps) => {
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

  const coauthorBenefits = [
    { icon: Zap, text: "Acelera rascunhos" },
    { icon: Brain, text: "Organiza ideias" },
    { icon: Sparkles, text: "Sugere caminhos" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(40 70% 50%/0.3), transparent 60%)" }}
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Papel da I.A.</h2>
                <p className="text-amber-200/80 text-sm sm:text-base">Coautora que acelera, não substitui você</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {coauthorBenefits.map((benefit, index) => (
                scene >= index + 2 && (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 border border-amber-500/30"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                    </div>
                    <span className="text-white text-sm sm:text-base font-medium">{benefit.text}</span>
                    <CheckCircle className="w-4 h-4 text-amber-400/50 ml-auto flex-shrink-0" />
                  </motion.div>
                )
              ))}
            </div>

            {scene >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40"
              >
                <Heart className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">Parceria, não substituição</span>
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
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg"
                  >
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-2xl sm:text-3xl text-amber-400"
                  >
                    +
                  </motion.div>
                  <motion.div
                    animate={{ x: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg"
                  >
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Você + I.A.</h3>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30"
                >
                  <Zap className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Acelera</h3>
                <p className="text-amber-200/80 text-sm sm:text-base">Rascunhos em minutos, não horas</p>
              </motion.div>
            )}

            {scene === 9 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <Brain className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Organiza</h3>
                <p className="text-orange-200/80 text-sm sm:text-base">Estrutura suas ideias soltas</p>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Sugere</h3>
                <p className="text-yellow-200/80 text-sm sm:text-base">Caminhos que você pode não ter visto</p>
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
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center mb-6 shadow-xl"
                >
                  <Heart className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Coautora Fiel!</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xs">I.A. acelera seu trabalho, mas você continua no comando criativo</p>
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
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scene >= i + 1 ? 'bg-amber-400' : 'bg-white/20'}`}
            animate={{ scale: scene === i + 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {isActive && scene >= 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40"
        >
          <span className="text-amber-300 text-xs sm:text-sm font-medium">Coautora</span>
        </motion.div>
      )}
    </div>
  );
};
