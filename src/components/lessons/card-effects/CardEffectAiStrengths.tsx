import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Zap, Clock, Scale, RefreshCw, CheckCircle, TrendingUp } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectAiStrengths = ({ isActive = true, duration = 15 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const maxLoops = 2;
  const totalPhases = 5;
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

  const strengths = [
    { icon: Zap, title: "Velocidade", desc: "Processa milhões de dados em segundos", color: "#eab308" },
    { icon: Clock, title: "24/7", desc: "Trabalha sem parar, sem cansaço", color: "#22c55e" },
    { icon: Scale, title: "Escala", desc: "Faz 1000x sem custo extra", color: "#3b82f6" },
    { icon: RefreshCw, title: "Consistência", desc: "Mesma qualidade toda vez", color: "#a855f7" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-green-300 text-sm font-medium">Pontos Fortes</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Onde a I.A. é <span className="text-green-400">Imbatível</span>
        </h2>
      </motion.div>

      {/* Strengths Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {strengths.map((strength, idx) => {
          const Icon = strength.icon;
          const shouldShow = phase >= idx + 1;
          const isActive = phase === idx + 1;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: shouldShow ? 1 : 0.3,
                scale: shouldShow ? 1 : 0.8,
                y: shouldShow ? 0 : 20
              }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <motion.div
                className="h-full p-4 rounded-xl border flex flex-col items-center text-center"
                style={{ 
                  backgroundColor: `${strength.color}10`,
                  borderColor: shouldShow ? `${strength.color}50` : 'transparent'
                }}
                animate={isActive ? { 
                  boxShadow: [`0 0 0px ${strength.color}`, `0 0 25px ${strength.color}`, `0 0 0px ${strength.color}`]
                } : {}}
                transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
              >
                <motion.div
                  animate={shouldShow ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${strength.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: strength.color }} />
                </motion.div>
                
                <h3 className="font-bold text-white mb-1">{strength.title}</h3>
                <p className="text-gray-400 text-xs">{strength.desc}</p>
                
                {shouldShow && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: strength.color }} />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {phase >= totalPhases - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
        >
          <p className="text-white font-semibold">I.A. supera humanos em tarefas repetitivas!</p>
          <p className="text-green-300 text-sm">Velocidade, escala e consistência sem igual</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-green-400' : 'bg-green-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
