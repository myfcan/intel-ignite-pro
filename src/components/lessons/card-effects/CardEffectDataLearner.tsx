import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Database, Brain, TrendingUp, Sparkles, FileText } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectDataLearner = ({ isActive = true, duration = 15 }: CardEffectProps) => {
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

  const dataPoints = Array.from({ length: 12 }, (_, i) => ({
    x: 20 + (i * 25),
    y: 100 + Math.sin(i * 0.8) * 40 + Math.random() * 20
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">Aprendizado de Dados</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          I.A. <span className="text-emerald-400">Aprende</span> com Dados
        </h2>
      </motion.div>

      {/* Visualization */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-md">
          {/* Data Flow Animation */}
          <div className="relative h-48">
            {/* Data Sources */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: phase >= 1 ? 1 : 0.3, x: phase >= 1 ? 0 : -50 }}
              className="absolute left-0 top-1/2 -translate-y-1/2"
            >
              <div className="flex flex-col gap-2">
                {['📝', '📊', '🖼️'].map((emoji, idx) => (
                  <motion.div
                    key={idx}
                    animate={phase >= 2 ? { x: [0, 100, 200] } : {}}
                    transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                    className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Brain Processing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: phase >= 2 ? 1 : 0.3, 
                scale: phase >= 2 ? 1 : 0.5 
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center"
                animate={phase >= 2 ? { 
                  boxShadow: ['0 0 0px #10b981', '0 0 40px #10b981', '0 0 0px #10b981']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Brain className="w-12 h-12 text-emerald-400" />
              </motion.div>
              
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <span className="text-emerald-300 text-sm font-medium">Processando...</span>
                </motion.div>
              )}
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: phase >= 3 ? 1 : 0.3, x: phase >= 3 ? 0 : 50 }}
              className="absolute right-0 top-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={phase >= 4 ? { 
                  scale: [1, 1.1, 1],
                  boxShadow: ['0 0 0px #06b6d4', '0 0 20px #06b6d4', '0 0 0px #06b6d4']
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/30"
              >
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <span className="text-cyan-300 text-sm">Conhecimento</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <div className="text-center">
              <p className="text-white font-semibold">Quanto mais dados, melhor a I.A.</p>
              <p className="text-emerald-300 text-sm">Ela encontra padrões que humanos não veem</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-emerald-400' : 'bg-emerald-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
