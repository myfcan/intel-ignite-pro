import { motion, AnimatePresence } from "framer-motion";
import { Image, Palette, Layout, Sparkles, CheckCircle, Camera } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface CardEffectVisualToolsProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectVisualTools = ({ isActive = false, duration = 33 }: CardEffectVisualToolsProps) => {
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

  const visualUsages = [
    { icon: Camera, text: "Capa do curso ou eBook" },
    { icon: Layout, text: "Ilustrações de capítulos" },
    { icon: Palette, text: "Slides e materiais visuais" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-pink-950 to-slate-900">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(330 70% 50%/0.3), transparent 60%)" }}
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Image className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Ferramentas Visuais</h2>
                <p className="text-pink-200/80 text-sm sm:text-base">Gemini, DALL·E, Midjourney para imagens</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {visualUsages.map((usage, index) => (
                scene >= index + 2 && (
                  <motion.div
                    key={usage.text}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 border border-pink-500/30"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <usage.icon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                    </div>
                    <span className="text-white text-sm sm:text-base font-medium">{usage.text}</span>
                    <Sparkles className="w-4 h-4 text-pink-400/50 ml-auto flex-shrink-0" />
                  </motion.div>
                )
              ))}
            </div>

            {scene >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <p className="text-pink-300 text-sm">Design profissional sem ser designer</p>
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
                <div className="relative w-48 h-32 sm:w-56 sm:h-40 rounded-xl overflow-hidden mb-6 border-2 border-pink-500/50">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-blue-500/30"
                    animate={{ 
                      background: [
                        "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3), rgba(59,130,246,0.3))",
                        "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.3), rgba(236,72,153,0.3))",
                        "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(236,72,153,0.3), rgba(168,85,247,0.3))",
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Image className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </motion.div>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Gerando Imagem...</h3>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/30"
                >
                  <Camera className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Capa Profissional</h3>
                <p className="text-pink-200/80 text-sm sm:text-base">Identidade visual do seu produto</p>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <Layout className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ilustrações</h3>
                <p className="text-purple-200/80 text-sm sm:text-base">Imagens de apoio para capítulos</p>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <Palette className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Slides e Páginas</h3>
                <p className="text-fuchsia-200/80 text-sm sm:text-base">Material visual completo</p>
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
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 flex items-center justify-center mb-6 shadow-xl"
                >
                  <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Visual Pronto!</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xs">I.A. cria capas, ilustrações e slides profissionais para seu conteúdo</p>
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
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scene >= i + 1 ? 'bg-pink-400' : 'bg-white/20'}`}
            animate={{ scale: scene === i + 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {isActive && scene >= 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-pink-500/20 border border-pink-500/40"
        >
          <span className="text-pink-300 text-xs sm:text-sm font-medium">Visual</span>
        </motion.div>
      )}
    </div>
  );
};
