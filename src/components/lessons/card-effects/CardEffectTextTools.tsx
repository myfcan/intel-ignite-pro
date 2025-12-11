import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, FileText, List, Sparkles, CheckCircle, PenTool } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface CardEffectTextToolsProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectTextTools = ({ isActive = false, duration = 33 }: CardEffectTextToolsProps) => {
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

  const textUsages = [
    { icon: List, text: "Sumário organizado" },
    { icon: FileText, text: "Títulos e capítulos" },
    { icon: PenTool, text: "Roteiros e exercícios" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(180 70% 40%/0.3), transparent 60%)" }}
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Ferramentas de Texto</h2>
                <p className="text-cyan-200/80 text-sm sm:text-base">ChatGPT, Claude e outros para estruturar</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              {textUsages.map((usage, index) => (
                scene >= index + 2 && (
                  <motion.div
                    key={usage.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 border border-cyan-500/30"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <usage.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                    </div>
                    <span className="text-white text-sm sm:text-base font-medium">{usage.text}</span>
                    <CheckCircle className="w-4 h-4 text-cyan-400/50 ml-auto flex-shrink-0" />
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
                <p className="text-cyan-300 text-sm">Ideias soltas → Conteúdo estruturado</p>
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
                  className="relative w-48 h-32 sm:w-56 sm:h-40 rounded-xl bg-slate-800 border border-cyan-500/30 p-4 mb-6"
                >
                  <motion.div
                    className="h-2 bg-cyan-500/50 rounded mb-2"
                    initial={{ width: 0 }}
                    animate={{ width: "80%" }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                  <motion.div
                    className="h-2 bg-cyan-500/30 rounded mb-2"
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                  <motion.div
                    className="h-2 bg-cyan-500/20 rounded"
                    initial={{ width: 0 }}
                    animate={{ width: "70%" }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                  <motion.div
                    className="absolute bottom-4 right-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-cyan-400 text-lg">|</span>
                  </motion.div>
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Digitando Estrutura...</h3>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30"
                >
                  <List className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Sumário Pronto</h3>
                <p className="text-cyan-200/80 text-sm sm:text-base">Módulos e capítulos organizados</p>
              </motion.div>
            )}

            {scene === 9 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <FileText className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Textos Gerados</h3>
                <p className="text-blue-200/80 text-sm sm:text-base">Primeiras versões em segundos</p>
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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <PenTool className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Exercícios</h3>
                <p className="text-teal-200/80 text-sm sm:text-base">Perguntas e atividades práticas</p>
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
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 flex items-center justify-center mb-6 shadow-xl"
                >
                  <Sparkles className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Texto Estruturado!</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xs">Modelos de linguagem transformam ideias em conteúdo organizado</p>
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
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scene >= i + 1 ? 'bg-cyan-400' : 'bg-white/20'}`}
            animate={{ scale: scene === i + 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {isActive && scene >= 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40"
        >
          <span className="text-cyan-300 text-xs sm:text-sm font-medium">Texto</span>
        </motion.div>
      )}
    </div>
  );
};
