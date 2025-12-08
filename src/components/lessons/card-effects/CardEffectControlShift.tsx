import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Settings, User, Bot, ArrowLeftRight, Crown, Shield, Zap, Target, Eye, CheckCircle, Sparkles } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectControlShift = ({ isActive = true, duration = 33 }: CardEffectProps) => {
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
    { icon: Settings, text: "Antes: Você faz tudo", type: "old", color: "text-red-400" },
    { icon: ArrowLeftRight, text: "Transição: Parceria", type: "transition", color: "text-amber-400" },
    { icon: Crown, text: "Agora: Você direciona", type: "new", color: "text-emerald-400" },
  ];

  const newRoles = [
    { icon: Eye, text: "Supervisor", color: "text-cyan-400" },
    { icon: Target, text: "Estrategista", color: "text-violet-400" },
    { icon: Sparkles, text: "Criador", color: "text-rose-400" },
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
          <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">Mudança de Controle</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Quem <span className="text-emerald-400">Controla</span> Agora?
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
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                    animate={{ 
                      opacity: shouldShow ? 1 : 0.3,
                      x: shouldShow ? 0 : (idx % 2 === 0 ? -30 : 30),
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className={`p-4 rounded-xl border flex items-center gap-4 ${
                      shift.type === 'old' ? 'bg-red-500/10 border-red-500/30' :
                      shift.type === 'transition' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <motion.div 
                      className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center`}
                      animate={scene === idx ? { rotate: [0, 180, 360] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Icon className={`w-6 h-6 ${shift.color}`} />
                    </motion.div>
                    <p className="text-white font-medium">{shift.text}</p>
                  </motion.div>
                );
              })}

              {scene >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <p className="text-emerald-300 text-lg font-medium">O poder mudou de mãos!</p>
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
                  animate={{ x: [0, -10, 0], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-2">
                    <User className="w-10 h-10 text-white/50" />
                  </div>
                  <p className="text-white/50 text-sm">Executor</p>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowLeftRight className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <motion.div
                  animate={{ x: [0, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-2">
                    <Crown className="w-10 h-10 text-emerald-400" />
                  </div>
                  <p className="text-emerald-400 text-sm font-bold">Diretor</p>
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-white mt-8">Você no Comando!</h3>
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
              <h3 className="text-xl font-bold text-white mb-4">Seus Novos Papéis</h3>
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {newRoles.map((role, idx) => {
                  const Icon = role.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <Icon className={`w-8 h-8 ${role.color} mx-auto mb-2`} />
                      <p className="text-white text-xs font-medium">{role.text}</p>
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
              <div className="relative">
                <motion.div
                  className="w-32 h-32 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
                  animate={{ boxShadow: ['0 0 0px rgba(16, 185, 129, 0.3)', '0 0 40px rgba(16, 185, 129, 0.6)', '0 0 0px rgba(16, 185, 129, 0.3)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <User className="w-16 h-16 text-emerald-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Bot className="w-6 h-6 text-cyan-400" />
                </motion.div>
              </div>
              <p className="text-white text-lg mt-6">Você + IA = Poder</p>
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
                  <p className="text-3xl font-bold text-red-400">Antes</p>
                  <p className="text-red-300 text-sm mt-2">Você fazia tudo</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <p className="text-3xl font-bold text-emerald-400">Agora</p>
                  <p className="text-emerald-300 text-sm mt-2">Você direciona</p>
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
              <Shield className="w-16 h-16 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Novo Paradigma</h3>
              <p className="text-emerald-300 text-center max-w-sm">O controle passou para quem sabe usar as ferramentas</p>
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
                  boxShadow: ['0 0 0px rgba(16, 185, 129, 0.3)', '0 0 40px rgba(16, 185, 129, 0.6)', '0 0 0px rgba(16, 185, 129, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center max-w-md"
              >
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Você no Comando!</h3>
                <p className="text-emerald-300">
                  Assuma o controle da sua carreira com I.A. como sua ferramenta
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
