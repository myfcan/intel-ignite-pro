import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Shuffle, Briefcase, ArrowRight, TrendingDown, TrendingUp, AlertTriangle, Bot, User, Zap, Shield, RefreshCw } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectJobShifter = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const shifts = [
    { from: "Digitador", to: "Prompt Engineer", icon: TrendingUp, color: "text-emerald-400" },
    { from: "Atendente", to: "Gestor de Chatbots", icon: TrendingUp, color: "text-cyan-400" },
    { from: "Designer Jr", to: "Director de IA Visual", icon: TrendingUp, color: "text-violet-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-amber-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
          <Shuffle className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-sm font-medium">Transformação</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          <span className="text-amber-400">Empregos</span> em Mutação
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Shift Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {shifts.map((shift, idx) => {
                const Icon = shift.icon;
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
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-2 rounded-lg bg-red-500/10 text-center">
                        <p className="text-red-300 text-sm line-through">{shift.from}</p>
                      </div>
                      <motion.div
                        animate={scene === idx ? { x: [0, 5, 0] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5 text-amber-400" />
                      </motion.div>
                      <div className="flex-1 p-2 rounded-lg bg-emerald-500/10 text-center">
                        <p className={`text-sm font-medium ${shift.color}`}>{shift.to}</p>
                      </div>
                    </div>
                    {scene === idx && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full mt-3"
                      />
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
                  <p className="text-amber-300 text-lg font-medium">A evolução é inevitável...</p>
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
              <div className="flex items-center gap-8">
                <motion.div
                  animate={{ x: [0, -20, 0], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-6 rounded-2xl bg-red-500/20 border border-red-500/30"
                >
                  <User className="w-12 h-12 text-red-400" />
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-8 h-8 text-amber-400" />
                </motion.div>
                <motion.div
                  animate={{ x: [0, 20, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/30"
                >
                  <Bot className="w-12 h-12 text-emerald-400" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-white mt-6">Transformação em Curso</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">O Que Muda?</h3>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center"
                >
                  <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-300 text-sm">Tarefas Repetitivas</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center"
                >
                  <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-300 text-sm">Pensamento Estratégico</p>
                </motion.div>
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
                {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute w-8 h-8 rounded-full bg-amber-500/30"
                    style={{
                      left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * 60}px - 16px)`,
                      top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * 60}px - 16px)`,
                    }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shuffle className="w-10 h-10 text-amber-400" />
                </div>
              </motion.div>
              <p className="text-white text-lg mt-4">Funções em Rotação</p>
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
                  <p className="text-4xl font-bold text-red-400">65%</p>
                  <p className="text-red-300 text-sm mt-2">Funções alteradas</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30"
                >
                  <p className="text-4xl font-bold text-amber-400">2025</p>
                  <p className="text-amber-300 text-sm mt-2">Ponto de virada</p>
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
              <AlertTriangle className="w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Adapte-se ou Fique Para Trás</h3>
              <p className="text-amber-300 text-center max-w-sm">Seu emprego atual pode não existir amanhã</p>
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
                  boxShadow: ['0 0 0px rgba(245, 158, 11, 0.3)', '0 0 40px rgba(245, 158, 11, 0.6)', '0 0 0px rgba(245, 158, 11, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center max-w-md"
              >
                <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Prepare Sua Transição!</h3>
                <p className="text-amber-300">
                  Quem entende a mudança, lidera a transformação
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
            className={`w-2.5 h-2.5 rounded-full ${i <= scene ? 'bg-amber-400' : 'bg-amber-800'}`}
            animate={{ scale: i === scene ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};
