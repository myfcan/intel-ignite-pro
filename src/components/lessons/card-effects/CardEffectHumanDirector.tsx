import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User, Bot, ArrowRight, Crown, Handshake, Sparkles } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectHumanDirector = ({ isActive = true, duration = 28 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const maxLoops = 2;
  const totalPhases = 7;
  const phaseTime = (duration * 1000) / totalPhases;

  useEffect(() => {
    if (!isActive || loopCount >= maxLoops) return;
    const interval = setInterval(() => {
      setPhase(prev => {
        if (prev >= totalPhases - 1) {
          setLoopCount(l => l + 1);
          return 0;
        }
        return prev + 1;
      });
    }, phaseTime);
    return () => clearInterval(interval);
  }, [isActive, loopCount, phaseTime]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-yellow-950 to-orange-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-sm font-medium">Papel do Humano</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Você é o <span className="text-amber-400">Diretor</span>
        </h2>
      </motion.div>

      {/* Director Visualization */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-md">
          {/* Human Director */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase >= 1 ? 1 : 0.3, y: phase >= 1 ? 0 : 30 }}
            className="flex flex-col items-center mb-8"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center border-2 border-amber-500/50"
              animate={phase >= 1 ? { 
                boxShadow: ['0 0 0px #f59e0b', '0 0 30px #f59e0b', '0 0 0px #f59e0b']
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <User className="w-10 h-10 text-amber-400" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: phase >= 1 ? 1 : 0 }}
              className="mt-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30"
            >
              <span className="text-amber-300 text-sm font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" /> VOCÊ
              </span>
            </motion.div>
          </motion.div>

          {/* Connection */}
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-amber-400" />
                </motion.div>
                <span className="text-amber-300 text-sm">Direciona</span>
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-amber-400" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* AI Assistant */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: phase >= 2 ? 1 : 0.3, y: phase >= 2 ? 0 : -30 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border border-cyan-500/50"
              animate={phase >= 3 ? { rotate: 360 } : {}}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Bot className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: phase >= 2 ? 1 : 0 }}
              className="mt-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30"
            >
              <span className="text-cyan-300 text-sm">I.A. Assistente</span>
            </motion.div>
          </motion.div>

          {/* Tasks */}
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 grid grid-cols-2 gap-2"
            >
              {[
                { human: "Define objetivos", ai: "Executa tarefas" },
                { human: "Avalia resultados", ai: "Processa dados" },
              ].map((pair, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="col-span-2 flex items-center gap-2"
                >
                  <div className="flex-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-amber-300 text-xs">{pair.human}</span>
                  </div>
                  <Handshake className="w-5 h-5 text-white/40" />
                  <div className="flex-1 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <span className="text-cyan-300 text-xs">{pair.ai}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Insight */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-cyan-500/10 border border-amber-500/20 text-center"
        >
          <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Humano + I.A. = Superpoder</p>
          <p className="text-amber-300 text-sm">Você dirige, a I.A. executa em escala</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-amber-400' : 'bg-amber-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
