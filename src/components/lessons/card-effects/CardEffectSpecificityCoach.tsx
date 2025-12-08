import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Focus, Target, Crosshair, Microscope, Glasses, Sparkles, ArrowRight, CheckCircle, Zap, Award, Eye } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectSpecificityCoach = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const levels = [
    { text: "Me ajude com marketing", level: "Vago", color: "text-red-400", quality: 1 },
    { text: "Crie posts para Instagram", level: "Médio", color: "text-amber-400", quality: 2 },
    { text: "Crie 5 posts de carrossel sobre dicas de skincare para mulheres 25-35 anos", level: "Específico", color: "text-emerald-400", quality: 3 },
  ];

  const tips = [
    { icon: Target, text: "Defina o objetivo", color: "text-cyan-400" },
    { icon: Glasses, text: "Adicione detalhes", color: "text-violet-400" },
    { icon: Microscope, text: "Seja preciso", color: "text-rose-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-rose-950 via-pink-950 to-fuchsia-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-rose-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 border border-rose-500/30 mb-4">
          <Focus className="w-4 h-4 text-rose-400" />
          <span className="text-rose-300 text-sm font-medium">Coach de Especificidade</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Seja <span className="text-rose-400">Específico</span>
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Specificity Levels (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-3"
            >
              {levels.map((level, idx) => {
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      scale: shouldShow ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className={`p-4 rounded-xl border ${
                      idx === 0 ? 'bg-red-500/10 border-red-500/30' :
                      idx === 1 ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        idx === 0 ? 'bg-red-500/20 text-red-300' :
                        idx === 1 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {level.level}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((star) => (
                          <motion.div
                            key={star}
                            animate={scene === idx && star <= level.quality ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3, delay: star * 0.1 }}
                          >
                            <Sparkles className={`w-4 h-4 ${star <= level.quality ? level.color : 'text-white/20'}`} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <p className="text-white text-sm italic">"{level.text}"</p>
                  </motion.div>
                );
              })}

              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <p className="text-rose-300 text-lg font-medium">Quanto mais específico, melhor!</p>
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
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-32 h-32 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center">
                  <Crosshair className="w-16 h-16 text-rose-400" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-rose-400/50"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mt-6">Foco no Alvo!</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">Dicas de Ouro</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {tips.map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${tip.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{tip.text}</p>
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
              <div className="relative w-40 h-40">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-rose-500/20"
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-4 border-rose-500/40"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-8 rounded-full border-4 border-rose-500/60"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                  className="absolute inset-12 rounded-full bg-rose-500 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <p className="text-white text-lg mt-6">Refinando o Foco</p>
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
                  className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-center"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-red-300 text-2xl font-bold">?</p>
                  <p className="text-red-300 text-xs mt-1">Vago</p>
                </motion.div>
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-8 h-8 text-white/50" />
                </motion.div>
                <motion.div
                  className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-emerald-300 text-2xl font-bold">✓</p>
                  <p className="text-emerald-300 text-xs mt-1">Específico</p>
                </motion.div>
              </div>
              <p className="text-white text-lg mt-6">Transformação do Pedido</p>
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
              <Award className="w-16 h-16 text-rose-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Seja Preciso</h3>
              <p className="text-rose-300 text-center max-w-sm">Prompts específicos geram resultados extraordinários</p>
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
                  boxShadow: ['0 0 0px rgba(244, 63, 94, 0.3)', '0 0 40px rgba(244, 63, 94, 0.6)', '0 0 0px rgba(244, 63, 94, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center max-w-md"
              >
                <Focus className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Coach Ativado!</h3>
                <p className="text-rose-300">
                  Você está treinado para criar prompts específicos e obter resultados incríveis
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
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-rose-400' : 'bg-rose-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
