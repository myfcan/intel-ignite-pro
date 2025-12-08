import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, Eye, Users, Zap, ArrowRight, Clock, Target, Lightbulb, Shield, CheckCircle } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectWakeUpCall = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const alertItems = [
    { icon: Users, text: "Alguém já foi substituído", color: "text-red-400" },
    { icon: Clock, text: "E você não percebeu", color: "text-amber-400" },
    { icon: Eye, text: "Está acontecendo agora", color: "text-violet-400" },
  ];

  const awarenessCards = [
    { icon: Target, text: "Reconheça os sinais", color: "text-emerald-400" },
    { icon: Lightbulb, text: "Entenda a mudança", color: "text-amber-400" },
    { icon: Shield, text: "Prepare-se para agir", color: "text-violet-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-red-950 via-rose-950 to-orange-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-red-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
          <Bell className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm font-medium">Despertar</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          O <span className="text-red-400">Chamado</span> da Realidade
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Alert Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {alertItems.map((item, idx) => {
                const Icon = item.icon;
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      x: shouldShow ? 0 : -50,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <p className="text-white font-medium">{item.text}</p>
                    {scene === idx && (
                      <motion.div
                        className="ml-auto"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      </motion.div>
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
                  <p className="text-red-300 text-lg font-medium">A I.A. já está agindo...</p>
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
                  scale: [1, 1.1, 1],
                  boxShadow: ['0 0 0px rgba(239, 68, 68, 0.3)', '0 0 60px rgba(239, 68, 68, 0.6)', '0 0 0px rgba(239, 68, 68, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center"
              >
                <Bell className="w-16 h-16 text-red-400" />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mt-6">Hora de Acordar!</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">Ferramentas de Consciência</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {awarenessCards.map((card, idx) => {
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-4 border-t-red-500 border-r-amber-500 border-b-emerald-500 border-l-violet-500 mb-6"
              />
              <p className="text-white text-xl font-medium text-center">Processando a Nova Realidade</p>
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
                  <p className="text-4xl font-bold text-red-400">85%</p>
                  <p className="text-red-300 text-sm mt-2">Não perceberam</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <p className="text-4xl font-bold text-emerald-400">15%</p>
                  <p className="text-emerald-300 text-sm mt-2">Já acordaram</p>
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
              <Zap className="w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">A Mudança é Real</h3>
              <p className="text-amber-300 text-center max-w-sm">Quem não acordar, ficará para trás</p>
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
                  boxShadow: ['0 0 0px rgba(239, 68, 68, 0.3)', '0 0 40px rgba(239, 68, 68, 0.6)', '0 0 0px rgba(239, 68, 68, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-md"
              >
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Você Acordou!</h3>
                <p className="text-red-300">
                  Agora você faz parte dos que entendem o que está acontecendo
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
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-red-400' : 'bg-red-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
