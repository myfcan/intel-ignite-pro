import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Zap, FastForward, Clock, ArrowRight, Timer, Gauge, Sparkles, TrendingUp, CheckCircle, Target, Rocket } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectShortcutEngine = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const shortcuts = [
    { icon: Timer, task: "Pesquisa de mercado", before: "3 dias", after: "30 min", color: "text-cyan-400" },
    { icon: Clock, task: "Criar apresentação", before: "4 horas", after: "15 min", color: "text-violet-400" },
    { icon: Gauge, task: "Análise de dados", before: "1 semana", after: "1 hora", color: "text-emerald-400" },
  ];

  const boostCards = [
    { icon: Zap, text: "Velocidade", color: "text-amber-400" },
    { icon: Target, text: "Precisão", color: "text-rose-400" },
    { icon: TrendingUp, text: "Escala", color: "text-emerald-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 p-4 sm:p-6 md:p-8 flex flex-col">
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
          <FastForward className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-sm font-medium">Motor de Atalhos</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          <span className="text-amber-400">Atalhos</span> que Multiplicam Resultados
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Shortcut Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {shortcuts.map((shortcut, idx) => {
                const Icon = shortcut.icon;
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      x: shouldShow ? 0 : 30,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 ${shortcut.color}`} />
                      <p className="text-white font-medium">{shortcut.task}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs line-through">{shortcut.before}</span>
                      <motion.div
                        animate={scene === idx ? { x: [0, 5, 0] } : {}}
                        transition={{ duration: 0.3, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </motion.div>
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">{shortcut.after}</span>
                    </div>
                  </motion.div>
                );
              })}

              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <p className="text-amber-300 text-lg font-medium">Tempo é dinheiro!</p>
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
                  rotate: 360,
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative w-32 h-32"
              >
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/30" />
                <div className="absolute inset-2 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-amber-400" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mt-6">Turbo Ativado!</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">Superpoderes</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {boostCards.map((card, idx) => {
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
              <div className="relative w-48">
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <motion.div
                  className="absolute -top-8 right-0"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </motion.div>
              </div>
              <p className="text-white text-lg mt-6">Processando em Alta Velocidade</p>
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
                  <p className="text-4xl font-bold text-red-400">100h</p>
                  <p className="text-red-300 text-sm mt-2">Modo tradicional</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <p className="text-4xl font-bold text-emerald-400">10h</p>
                  <p className="text-emerald-300 text-sm mt-2">Com atalhos I.A.</p>
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
              <Rocket className="w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">10x Mais Rápido</h3>
              <p className="text-amber-300 text-center max-w-sm">Atalhos transformam horas em minutos</p>
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
                <FastForward className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Motor Ligado!</h3>
                <p className="text-amber-300">
                  Você está pronto para usar os atalhos e multiplicar sua produtividade
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
