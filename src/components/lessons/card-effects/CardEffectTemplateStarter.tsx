import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { LayoutTemplate, Copy, FileCode, Layers, Grid, Sparkles, CheckCircle, ArrowRight, Zap, Rocket, Palette } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectTemplateStarter = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const templates = [
    { icon: FileCode, name: "E-mails Profissionais", count: "50+", color: "text-blue-400" },
    { icon: Layers, name: "Posts para Redes", count: "100+", color: "text-rose-400" },
    { icon: Grid, name: "Apresentações", count: "30+", color: "text-violet-400" },
  ];

  const benefits = [
    { icon: Sparkles, text: "Economize tempo", color: "text-amber-400" },
    { icon: Copy, text: "Copie e adapte", color: "text-cyan-400" },
    { icon: Palette, text: "Personalize", color: "text-rose-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-violet-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-4">
          <LayoutTemplate className="w-4 h-4 text-violet-400" />
          <span className="text-violet-300 text-sm font-medium">Biblioteca de Templates</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          <span className="text-violet-400">Templates</span> Prontos Para Usar
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Template Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {templates.map((template, idx) => {
                const Icon = template.icon;
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      scale: shouldShow ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
                  >
                    <motion.div 
                      className={`w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Icon className={`w-7 h-7 ${template.color}`} />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{template.name}</p>
                      <p className="text-white/60 text-sm">Templates disponíveis</p>
                    </div>
                    <motion.div
                      className="px-3 py-1 rounded-full bg-violet-500/20"
                      animate={scene === idx ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <span className="text-violet-400 font-bold">{template.count}</span>
                    </motion.div>
                  </motion.div>
                );
              })}

              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <p className="text-violet-300 text-lg font-medium">Tudo pronto para você!</p>
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
              <div className="grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-16 h-20 rounded-lg bg-gradient-to-br from-violet-500/30 to-purple-500/30 border border-violet-500/30"
                  >
                    <div className="p-2 space-y-1">
                      <div className="h-1 w-full bg-white/30 rounded" />
                      <div className="h-1 w-3/4 bg-white/20 rounded" />
                      <div className="h-1 w-1/2 bg-white/10 rounded" />
                    </div>
                  </motion.div>
                ))}
              </div>
              <h3 className="text-2xl font-bold text-white mt-6">Biblioteca Completa!</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">Benefícios</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${benefit.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{benefit.text}</p>
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
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-24 h-32 rounded-lg bg-violet-500/20 border border-violet-500/30 p-2"
                  animate={{ x: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-white/30 rounded" />
                    <div className="h-1 w-3/4 bg-white/20 rounded" />
                  </div>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Copy className="w-8 h-8 text-violet-400" />
                </motion.div>
                <motion.div
                  className="w-24 h-32 rounded-lg bg-emerald-500/20 border border-emerald-500/30 p-2"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-emerald-400/50 rounded" />
                    <div className="h-1 w-3/4 bg-emerald-400/30 rounded" />
                  </div>
                </motion.div>
              </div>
              <p className="text-white text-lg mt-6">Copie → Personalize → Use</p>
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
              <div className="grid grid-cols-2 gap-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30"
                >
                  <p className="text-4xl font-bold text-red-400">2h</p>
                  <p className="text-red-300 text-sm mt-2">Sem templates</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <p className="text-4xl font-bold text-emerald-400">10min</p>
                  <p className="text-emerald-300 text-sm mt-2">Com templates</p>
                </motion.div>
              </div>
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
              <Rocket className="w-16 h-16 text-violet-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Comece Rápido</h3>
              <p className="text-violet-300 text-center max-w-sm">Templates são seu atalho para produtividade</p>
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
                  boxShadow: ['0 0 0px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.6)', '0 0 0px rgba(139, 92, 246, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-center max-w-md"
              >
                <LayoutTemplate className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Templates Desbloqueados!</h3>
                <p className="text-violet-300">
                  Você tem acesso a centenas de modelos para acelerar seu trabalho
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
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-violet-400' : 'bg-violet-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
