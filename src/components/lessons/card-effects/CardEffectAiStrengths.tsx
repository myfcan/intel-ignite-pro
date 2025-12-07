import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Zap, Clock, Scale, RefreshCw, CheckCircle, TrendingUp, Sparkles } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectAiStrengths = ({ isActive = true, duration = 28 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [activeStrength, setActiveStrength] = useState(0);
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

  const strengths = [
    { icon: Zap, title: "Velocidade", desc: "Milhões de dados em segundos", color: "#eab308" },
    { icon: Clock, title: "24/7", desc: "Sem parar, sem cansaço", color: "#22c55e" },
    { icon: Scale, title: "Escala", desc: "1000x sem custo extra", color: "#3b82f6" },
    { icon: RefreshCw, title: "Consistência", desc: "Mesma qualidade sempre", color: "#a855f7" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-5"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-3">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
          <span className="text-green-300 text-xs sm:text-sm font-medium">Pontos Fortes</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Onde a I.A. é <span className="text-green-400">Imbatível</span>
        </h2>
      </motion.div>

      {/* Strengths Grid - Compacto 2x2 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-sm">
          {strengths.map((strength, idx) => {
            const Icon = strength.icon;
            const shouldShow = phase >= idx + 1;
            const isCurrentlyActive = phase === idx + 1;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: shouldShow ? 1 : 0.3,
                  scale: shouldShow ? 1 : 0.9
                }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                <motion.div
                  className="p-3 sm:p-4 rounded-xl border flex flex-col items-center text-center h-full"
                  style={{ 
                    backgroundColor: `${strength.color}10`,
                    borderColor: shouldShow ? `${strength.color}40` : 'transparent'
                  }}
                  animate={isCurrentlyActive ? { 
                    boxShadow: [`0 0 0px ${strength.color}`, `0 0 20px ${strength.color}`, `0 0 0px ${strength.color}`]
                  } : {}}
                  transition={{ duration: 0.8, repeat: isCurrentlyActive ? Infinity : 0 }}
                >
                  <motion.div
                    animate={shouldShow ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3"
                    style={{ backgroundColor: `${strength.color}20` }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: strength.color }} />
                  </motion.div>
                  
                  <h3 className="font-bold text-white text-sm sm:text-base mb-0.5 sm:mb-1">{strength.title}</h3>
                  <p className="text-gray-400 text-[10px] sm:text-xs leading-tight">{strength.desc}</p>
                  
                  {shouldShow && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: strength.color }} />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {phase >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <p className="text-white font-semibold text-sm sm:text-base">I.A. supera humanos em tarefas repetitivas!</p>
          </div>
          <p className="text-green-300 text-xs sm:text-sm">Velocidade, escala e consistência sem igual</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i <= phase ? 'bg-green-400' : 'bg-green-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
