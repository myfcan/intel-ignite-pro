import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { FileText, Pen, Sparkles, Lightbulb, Zap, Edit3, CheckCircle, ArrowRight, Type, MousePointer, Wand2 } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectBlankPageBreaker = ({ isActive = true, duration = 33 }: CardEffectProps) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);
  const maxLoops = 2;
  const totalScenes = 11;
  const sceneTime = (duration * 1000) / totalScenes;

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(0);

    for (let i = 1; i < totalScenes; i++) {
      const timer = setTimeout(() => {
        setScene(i);
        if (i === totalScenes - 1) {
          loopCountRef.current += 1;
          if (loopCountRef.current < maxLoops) {
            const restartTimer = setTimeout(() => startAnimation(), sceneTime);
            timersRef.current.push(restartTimer);
          }
        }
      }, i * sceneTime);
      timersRef.current.push(timer);
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
  }, [isActive]);

  const steps = [
    { icon: FileText, text: "Página em branco", status: "problema", color: "text-red-400" },
    { icon: Wand2, text: "Peça ajuda à I.A.", status: "ação", color: "text-amber-400" },
    { icon: Sparkles, text: "Ideias surgem!", status: "resultado", color: "text-emerald-400" },
  ];

  const techniques = [
    { icon: Lightbulb, text: "Brainstorm", color: "text-amber-400" },
    { icon: Type, text: "Rascunho", color: "text-cyan-400" },
    { icon: Edit3, text: "Refinamento", color: "text-violet-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-stone-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-cyan-600/10 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-4">
          <Pen className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">Quebrador de Bloqueio</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Adeus, <span className="text-cyan-400">Página em Branco</span>
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Step Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      x: shouldShow ? 0 : -30,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className={`p-4 rounded-xl border flex items-center gap-4 ${
                      step.status === 'problema' ? 'bg-red-500/10 border-red-500/30' :
                      step.status === 'ação' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </motion.div>
                    <p className="text-white font-medium flex-1">{step.text}</p>
                    {scene >= idx + 1 && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </motion.div>
                );
              })}

              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <p className="text-cyan-300 text-lg font-medium">Bloqueio superado!</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 2: Full Screen Effects (Scenes 5-10) */}
          {scene === 5 && (
            <motion.div
              key="scene5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="relative">
                <motion.div
                  className="w-40 h-52 bg-white rounded-lg shadow-2xl flex items-center justify-center overflow-hidden"
                  animate={{ boxShadow: ['0 0 20px rgba(34, 211, 238, 0.2)', '0 0 40px rgba(34, 211, 238, 0.4)', '0 0 20px rgba(34, 211, 238, 0.2)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-cyan-100 to-white"
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.5 }}
                  />
                  <motion.div
                    className="relative z-10 space-y-2 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {[1, 2, 3, 4].map((line) => (
                      <motion.div
                        key={line}
                        className="h-2 bg-slate-300 rounded"
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1 + line * 0.2, duration: 0.3 }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-white mt-6">Palavras Fluindo!</h3>
            </motion.div>
          )}

          {scene === 6 && (
            <motion.div
              key="scene6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Técnicas Poderosas</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {techniques.map((tech, idx) => {
                  const Icon = tech.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${tech.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{tech.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {scene === 7 && (
            <motion.div
              key="scene7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="relative w-48 h-32">
                <motion.div
                  className="absolute inset-0 border-2 border-dashed border-cyan-500/50 rounded-lg"
                  animate={{ borderColor: ['rgba(34, 211, 238, 0.3)', 'rgba(34, 211, 238, 0.6)', 'rgba(34, 211, 238, 0.3)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-2 left-2 right-2"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="h-1 bg-gradient-to-r from-cyan-500 to-transparent rounded" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MousePointer className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <p className="text-white text-lg mt-6">Cursor Ativo</p>
            </motion.div>
          )}

          {scene === 8 && (
            <motion.div
              key="scene8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-4 rounded-xl bg-red-500/20 border border-red-500/30"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FileText className="w-10 h-10 text-red-400" />
                  <p className="text-red-300 text-xs mt-2 text-center">Vazio</p>
                </motion.div>
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-8 h-8 text-white/50" />
                </motion.div>
                <motion.div
                  className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                  <p className="text-emerald-300 text-xs mt-2 text-center">Cheio</p>
                </motion.div>
              </div>
              <p className="text-white text-lg mt-6">Transformação Instantânea</p>
            </motion.div>
          )}

          {scene === 9 && (
            <motion.div
              key="scene9"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <Zap className="w-16 h-16 text-cyan-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Sem Mais Bloqueios</h3>
              <p className="text-cyan-300 text-center max-w-sm">A I.A. é sua parceira para começar qualquer projeto</p>
            </motion.div>
          )}

          {scene >= 10 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px rgba(34, 211, 238, 0.3)', '0 0 40px rgba(34, 211, 238, 0.6)', '0 0 0px rgba(34, 211, 238, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center max-w-md"
              >
                <Pen className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Bloqueio Quebrado!</h3>
                <p className="text-cyan-300">
                  Agora você sabe como nunca mais encarar uma página em branco sozinho
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-4 relative z-10">
        {Array.from({ length: totalScenes }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-cyan-400' : 'bg-cyan-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
