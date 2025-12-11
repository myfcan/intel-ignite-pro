import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileText, Bookmark, CheckCircle, List } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface CardEffectEbookViewProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffectEbookView = ({ isActive = false, duration = 33 }: CardEffectEbookViewProps) => {
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

  const chapters = [
    { title: "Cap. 1", desc: "Fundamentos" },
    { title: "Cap. 2", desc: "Técnicas" },
    { title: "Cap. 3", desc: "Aplicação" },
    { title: "Cap. 4", desc: "Resultados" },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(circle at 50% 50%, hsl(170 70% 40%/0.3), transparent 60%)" }}
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Versão em eBook</h2>
                <p className="text-teal-200/80 text-sm sm:text-base">O mesmo conteúdo em formato de leitura</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-2 sm:gap-3 w-full">
              {chapters.map((chap, index) => (
                scene >= index + 2 && (
                  <motion.div
                    key={chap.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/5 border border-teal-500/30"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm sm:text-base font-medium block">{chap.title}</span>
                      <span className="text-teal-300/70 text-xs">{chap.desc}</span>
                    </div>
                    <Bookmark className="w-4 h-4 text-teal-400/50 flex-shrink-0" />
                  </motion.div>
                )
              ))}
            </div>

            {scene >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 sm:mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-500/40"
              >
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span className="text-teal-300 text-sm font-medium">eBook organizado!</span>
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
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="flex flex-col items-center"
              >
                <div className="relative w-32 h-44 sm:w-40 sm:h-56 mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 shadow-xl"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="absolute inset-2 bg-white/10 rounded flex flex-col items-center justify-center p-2">
                      <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-2" />
                      <div className="w-full space-y-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-1 bg-white/30 rounded" style={{ width: `${100 - i * 15}%` }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Livro Digital</h3>
              </motion.div>
            )}

            {scene === 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <List className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Sumário Claro</h3>
                <p className="text-teal-200/80 text-sm sm:text-base">Capítulos bem organizados</p>
              </motion.div>
            )}

            {scene === 9 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="space-y-2 mb-6 w-full max-w-xs">
                  {["Texto explicativo", "Checklists", "Imagens simples"].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-teal-500/20"
                    >
                      <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                      <span className="text-white text-sm">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Elementos do eBook</h3>
              </motion.div>
            )}

            {scene === 10 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg"
                >
                  <Bookmark className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Leitura Guiada</h3>
                <p className="text-cyan-200/80 text-sm sm:text-base">Progresso visível e marcadores</p>
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
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 flex items-center justify-center mb-6 shadow-xl"
                >
                  <BookOpen className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">eBook Completo!</h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-xs">Mesmo conhecimento do curso, agora em formato de leitura independente</p>
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
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scene >= i + 1 ? 'bg-teal-400' : 'bg-white/20'}`}
            animate={{ scale: scene === i + 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {isActive && scene >= 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-teal-500/20 border border-teal-500/40"
        >
          <span className="text-teal-300 text-xs sm:text-sm font-medium">eBook</span>
        </motion.div>
      )}
    </div>
  );
};
