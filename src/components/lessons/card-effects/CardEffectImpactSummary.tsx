import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { BarChart3, TrendingUp, Users, Zap, Clock, DollarSign, Target, Award, Star, CheckCircle, Trophy } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectImpactSummary = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const impacts = [
    { icon: Clock, metric: "Tempo economizado", value: "10h/semana", color: "text-cyan-400" },
    { icon: DollarSign, metric: "Potencial de ganho", value: "+200%", color: "text-emerald-400" },
    { icon: Target, metric: "Produtividade", value: "5x mais", color: "text-violet-400" },
  ];

  const achievements = [
    { icon: Star, text: "Habilidades", color: "text-amber-400" },
    { icon: Users, text: "Rede", color: "text-rose-400" },
    { icon: Trophy, text: "Resultados", color: "text-emerald-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-indigo-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-4">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-300 text-sm font-medium">Resumo de Impacto</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          O <span className="text-indigo-400">Impacto</span> Real
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Impact Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {impacts.map((impact, idx) => {
                const Icon = impact.icon;
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
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
                  >
                    <motion.div 
                      className={`w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Icon className={`w-7 h-7 ${impact.color}`} />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-white/60 text-sm">{impact.metric}</p>
                      <p className={`text-xl font-bold ${impact.color}`}>{impact.value}</p>
                    </div>
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
                  <p className="text-indigo-300 text-lg font-medium">Resultados comprovados!</p>
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
              <div className="flex items-end gap-3">
                {[40, 60, 80, 100, 120].map((height, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="w-8 rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-400"
                  />
                ))}
              </div>
              <TrendingUp className="w-12 h-12 text-emerald-400 mt-4" />
              <h3 className="text-2xl font-bold text-white mt-4">Crescimento Exponencial</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">Conquistas</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {achievements.map((ach, idx) => {
                  const Icon = ach.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${ach.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{ach.text}</p>
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
              <motion.div
                className="relative w-40 h-40"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[0, 72, 144, 216, 288].map((angle, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute w-6 h-6 rounded-full bg-indigo-500"
                    style={{
                      left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * 60}px - 12px)`,
                      top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * 60}px - 12px)`,
                    }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: idx * 0.2 }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-indigo-400" />
                </div>
              </motion.div>
              <p className="text-white text-lg mt-6">Métricas em Ação</p>
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30"
                >
                  <p className="text-3xl font-bold text-cyan-400">10h</p>
                  <p className="text-cyan-300 text-xs mt-1">Tempo/semana</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <p className="text-3xl font-bold text-emerald-400">200%</p>
                  <p className="text-emerald-300 text-xs mt-1">Ganho</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30"
                >
                  <p className="text-3xl font-bold text-violet-400">5x</p>
                  <p className="text-violet-300 text-xs mt-1">Produtividade</p>
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
              <Award className="w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Impacto Comprovado</h3>
              <p className="text-indigo-300 text-center max-w-sm">Esses são os resultados reais de quem domina I.A.</p>
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
                  boxShadow: ['0 0 0px rgba(99, 102, 241, 0.3)', '0 0 40px rgba(99, 102, 241, 0.6)', '0 0 0px rgba(99, 102, 241, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center max-w-md"
              >
                <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Seu Potencial!</h3>
                <p className="text-indigo-300">
                  Você está pronto para alcançar resultados extraordinários com I.A.
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
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-indigo-400' : 'bg-indigo-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
