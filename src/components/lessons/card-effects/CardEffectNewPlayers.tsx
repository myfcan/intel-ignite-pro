import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Users, Bot, Briefcase, TrendingUp, Zap, Star, Crown, ArrowRight, Shield, Target, Sparkles } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectNewPlayers = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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

  const players = [
    { icon: Bot, name: "Assistentes de I.A.", role: "Tarefas Operacionais", color: "text-cyan-400" },
    { icon: Briefcase, name: "Profissionais Híbridos", role: "Gestão + Automação", color: "text-violet-400" },
    { icon: TrendingUp, name: "Empreendedores Tech", role: "Negócios Escaláveis", color: "text-emerald-400" },
  ];

  const impactCards = [
    { icon: Target, text: "Menos vagas tradicionais", color: "text-red-400" },
    { icon: Star, text: "Novas oportunidades", color: "text-amber-400" },
    { icon: Crown, text: "Quem domina, lidera", color: "text-violet-400" },
  ];

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950 p-4 sm:p-6 md:p-8 flex flex-col">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-cyan-600/20 via-transparent to-transparent"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-4">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-sm font-medium">Novos Jogadores</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Quem São os <span className="text-cyan-400">Novos Players</span>?
        </h2>
      </motion.div>

      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Phase 1: Stacked Player Cards (Scenes 0-4) */}
          {scene >= 0 && scene <= 4 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col justify-center gap-4"
            >
              {players.map((player, idx) => {
                const Icon = player.icon;
                const shouldShow = scene >= idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      x: shouldShow ? 0 : 50,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
                  >
                    <motion.div 
                      className={`w-14 h-14 rounded-full bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Icon className={`w-7 h-7 ${player.color}`} />
                    </motion.div>
                    <div>
                      <p className="text-white font-bold">{player.name}</p>
                      <p className="text-white/60 text-sm">{player.role}</p>
                    </div>
                    {scene === idx && (
                      <motion.div
                        className="ml-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Sparkles className="w-5 h-5 text-amber-400" />
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
                  <p className="text-cyan-300 text-lg font-medium">O mercado mudou...</p>
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
                  rotate: [0, 360],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="relative w-40 h-40"
              >
                {players.map((player, idx) => {
                  const Icon = player.icon;
                  const angle = (idx * 120) * (Math.PI / 180);
                  const x = Math.cos(angle) * 60;
                  const y = Math.sin(angle) * 60;
                  return (
                    <motion.div
                      key={idx}
                      className="absolute w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
                      style={{ left: `calc(50% + ${x}px - 24px)`, top: `calc(50% + ${y}px - 24px)` }}
                    >
                      <Icon className={`w-6 h-6 ${player.color}`} />
                    </motion.div>
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-amber-400" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mt-6">Nova Dinâmica</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">O Impacto</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {impactCards.map((card, idx) => {
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
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ x: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-4 rounded-xl bg-red-500/20 border border-red-500/30"
                >
                  <Users className="w-8 h-8 text-red-400" />
                  <p className="text-red-300 text-xs mt-2">Tradicional</p>
                </motion.div>
                <ArrowRight className="w-8 h-8 text-white/50" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
                >
                  <Bot className="w-8 h-8 text-emerald-400" />
                  <p className="text-emerald-300 text-xs mt-2">Híbrido</p>
                </motion.div>
              </div>
              <p className="text-white text-lg mt-6">A transição está acontecendo</p>
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
                  <p className="text-4xl font-bold text-red-400">-40%</p>
                  <p className="text-red-300 text-sm mt-2">Funções tradicionais</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <p className="text-4xl font-bold text-emerald-400">+300%</p>
                  <p className="text-emerald-300 text-sm mt-2">Funções híbridas</p>
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
              <Crown className="w-16 h-16 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Quem Domina, Lidera</h3>
              <p className="text-amber-300 text-center max-w-sm">Os novos players já estão no jogo</p>
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
                <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Seja um Novo Player!</h3>
                <p className="text-cyan-300">
                  Você pode fazer parte dessa nova geração de profissionais
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
