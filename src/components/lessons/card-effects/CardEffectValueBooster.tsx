import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, Gem, Star, Sparkles, Rocket, Crown, ArrowUp, Zap, Target, Award, DollarSign } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectValueBooster = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const boosters = [
    { icon: Sparkles, text: "Domine ferramentas de I.A.", boost: "+50%", color: "text-violet-400" },
    { icon: Target, text: "Resolva problemas complexos", boost: "+80%", color: "text-emerald-400" },
    { icon: Crown, text: "Seja indispensável", boost: "+200%", color: "text-amber-400" },
  ];

  const valueCards = [
    { icon: Gem, text: "Expertise", color: "text-cyan-400" },
    { icon: Star, text: "Diferencial", color: "text-amber-400" },
    { icon: Rocket, text: "Crescimento", color: "text-rose-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-emerald-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">Amplificador de Valor</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Aumente Seu <span className="text-emerald-400">Valor</span> no Mercado
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Booster Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {boosters.map((booster, idx) => {
                const Icon = booster.icon;
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      y: shouldShow ? 0 : 30,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Icon className={`w-6 h-6 ${booster.color}`} />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{booster.text}</p>
                    </div>
                    <motion.div
                      className="px-3 py-1 rounded-full bg-emerald-500/20"
                      animate={scene === idx ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <span className="text-emerald-400 font-bold">{booster.boost}</span>
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
                  <p className="text-emerald-300 text-lg font-medium">Potencialize seu valor!</p>
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
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                  <Rocket className="w-16 h-16 text-emerald-400" />
                </div>
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div className="w-16 h-8 bg-gradient-to-t from-orange-500 to-transparent rounded-b-full blur-sm" />
                </motion.div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mt-8">Decolar seu Valor!</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">Pilares do Valor</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {valueCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${card.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{card.text}</p>
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
              <div className="flex items-end gap-4">
                {[1, 2, 3, 4, 5].map((level, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${level * 30}px` }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="w-10 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 flex items-start justify-center pt-2"
                  >
                    {idx === 4 && (
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Crown className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              <p className="text-white text-lg mt-6">Evolução Constante</p>
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
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <p className="text-4xl font-bold text-white">Antes</p>
                  <DollarSign className="w-10 h-10 text-white/50 mx-auto my-2" />
                  <p className="text-white/60 text-sm">Valor Básico</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <p className="text-4xl font-bold text-emerald-400">Depois</p>
                  <div className="flex justify-center my-2">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-emerald-300 text-sm">Valor Amplificado</p>
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
              <h3 className="text-2xl font-bold text-white mb-2">Seja Premium</h3>
              <p className="text-amber-300 text-center max-w-sm">Profissionais que dominam I.A. valem mais</p>
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
                  boxShadow: ['0 0 0px rgba(34, 197, 94, 0.3)', '0 0 40px rgba(34, 197, 94, 0.6)', '0 0 0px rgba(34, 197, 94, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center max-w-md"
              >
                <Zap className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Valor Multiplicado!</h3>
                <p className="text-emerald-300">
                  Você está pronto para aumentar significativamente seu valor de mercado
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
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-emerald-400' : 'bg-emerald-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
