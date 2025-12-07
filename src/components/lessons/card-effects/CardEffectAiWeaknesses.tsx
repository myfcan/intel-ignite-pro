import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AlertTriangle, Heart, Lightbulb, Compass, XCircle, Brain } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectAiWeaknesses = ({ isActive = true, duration = 15 }: CardEffectProps) => {
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

  const weaknesses = [
    { icon: Heart, title: "Empatia", desc: "Não sente, não compreende emoções", color: "#ef4444" },
    { icon: Lightbulb, title: "Criatividade Real", desc: "Recombina, mas não inventa do zero", color: "#f59e0b" },
    { icon: Compass, title: "Julgamento Ético", desc: "Sem noção de certo ou errado", color: "#ec4899" },
    { icon: Brain, title: "Contexto Humano", desc: "Não entende nuances culturais", color: "#8b5cf6" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-red-950 via-rose-950 to-pink-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm font-medium">Limitações</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Onde a I.A. <span className="text-red-400">Falha</span>
        </h2>
      </motion.div>

      {/* Weaknesses Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {weaknesses.map((weakness, idx) => {
          const Icon = weakness.icon;
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
                  backgroundColor: `${weakness.color}10`,
                  borderColor: shouldShow ? `${weakness.color}50` : 'transparent'
                }}
                animate={isActive ? { 
                  boxShadow: [`0 0 0px ${weakness.color}`, `0 0 25px ${weakness.color}`, `0 0 0px ${weakness.color}`]
                } : {}}
                transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
              >
                <motion.div
                  animate={shouldShow ? { rotate: [0, -5, 5, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${weakness.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: weakness.color }} />
                </motion.div>
                
                <h3 className="font-bold text-white mb-1">{weakness.title}</h3>
                <p className="text-gray-400 text-xs">{weakness.desc}</p>
                
                {shouldShow && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <XCircle className="w-5 h-5" style={{ color: weakness.color }} />
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
          className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center"
        >
          <p className="text-white font-semibold">Humanos ainda são essenciais!</p>
          <p className="text-rose-300 text-sm">Empatia, ética e criatividade genuína são nossas</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-red-400' : 'bg-red-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
