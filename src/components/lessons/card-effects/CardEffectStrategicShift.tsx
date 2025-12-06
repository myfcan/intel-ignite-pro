import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, Target, Compass, ArrowRight, CheckCircle } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectStrategicShift = ({ isActive = true, duration = 15 }: CardEffectProps) => {
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

  const shifts = [
    { before: "Trabalho manual", after: "Trabalho estratégico", color: "#3b82f6" },
    { before: "Execução lenta", after: "Execução rápida", color: "#22c55e" },
    { before: "Recursos limitados", after: "Escala ilimitada", color: "#a855f7" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-4">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-300 text-sm font-medium">Mudança Estratégica</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          O <span className="text-indigo-400">Novo Paradigma</span> com I.A.
        </h2>
      </motion.div>

      {/* Shifts */}
      <div className="flex-1 flex flex-col justify-center gap-4">
        {shifts.map((shift, idx) => {
          const shouldShow = phase >= idx + 1;
          const isActive = phase === idx + 1;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ 
                opacity: shouldShow ? 1 : 0.3,
                x: shouldShow ? 0 : -30
              }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-4">
                {/* Before */}
                <motion.div
                  className="flex-1 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                >
                  <p className="text-red-300 text-sm font-medium text-center">{shift.before}</p>
                </motion.div>

                {/* Arrow */}
                <motion.div
                  animate={shouldShow ? { x: [0, 5, 0] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-white/60" />
                </motion.div>

                {/* After */}
                <motion.div
                  className="flex-1 p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: `${shift.color}20`,
                    borderColor: `${shift.color}40`
                  }}
                  animate={shouldShow ? { 
                    boxShadow: [`0 0 0px ${shift.color}`, `0 0 15px ${shift.color}`, `0 0 0px ${shift.color}`]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: shift.color }} />
                    <p className="text-sm font-medium" style={{ color: shift.color }}>{shift.after}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Conclusion */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center"
        >
          <Target className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Foco no que importa</p>
          <p className="text-indigo-300 text-sm">I.A. executa, você direciona e decide</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-indigo-400' : 'bg-indigo-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
