import { motion, AnimatePresence } from "framer-motion";
import { Wrench, MessageSquare, Image, Video, Sparkles, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface CardEffectToolGroupsProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectToolGroups = ({ isActive = false, duration = 33 }: CardEffectToolGroupsProps) => {
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

  const toolGroups = [
    { icon: MessageSquare, label: "Texto", desc: "ChatGPT, Claude", color: "from-blue-500 to-indigo-600" },
    { icon: Image, label: "Visual", desc: "DALL·E, Midjourney", color: "from-pink-500 to-rose-600" },
    { icon: Video, label: "Vídeo", desc: "Descript, CapCut", color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(220 70% 50%/0.3), transparent 60%)" }}
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Três Grupos de I.A.</h2>
                <p className="text-blue-200/80 text-sm sm:text-base">Texto, visual e vídeo trabalhando juntos</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {toolGroups.map((group, index) => (
                scene >= index + 2 && (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r ${group.color} shadow-lg`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <group.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-white">{group.label}</h3>
                      <p className="text-white/80 text-xs sm:text-sm">{group.desc}</p>
                    </div>
                  </motion.div>
                )
              ))}
            </div>

            {scene >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/40"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">Ferramentas prontas!</span>
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
                <div className="flex gap-4 mb-6">
                  {toolGroups.map((group, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center shadow-lg`}
                    >
                      <group.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </motion.div>
                  ))}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Arsenal Completo</h3>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"
                >
                  <MessageSquare className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Modelos de Texto</h3>
                <p className="text-blue-200/80 text-sm sm:text-base">Estrutura, roteiros e exercícios</p>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/30"
                >
                  <Image className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">I.A. Visual</h3>
                <p className="text-pink-200/80 text-sm sm:text-base">Capas, ilustrações e slides</p>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30"
                >
                  <Video className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">I.A. para Vídeo</h3>
                <p className="text-amber-200/80 text-sm sm:text-base">Edição, legendas e cortes</p>
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
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 via-pink-500 to-amber-500 flex items-center justify-center mb-6 shadow-xl"
                >
                  <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ferramentas Integradas!</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xs">Texto + Visual + Vídeo trabalhando juntos para criar seu conteúdo</p>
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
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scene >= i + 1 ? 'bg-blue-400' : 'bg-white/20'}`}
            animate={{ scale: scene === i + 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {isActive && scene >= 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40"
        >
          <span className="text-blue-300 text-xs sm:text-sm font-medium">Ferramentas</span>
        </motion.div>
      )}
    </div>
  );
};
