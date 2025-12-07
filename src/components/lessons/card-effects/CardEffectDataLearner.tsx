import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Database, Brain, TrendingUp, Sparkles, FileText } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectDataLearner = ({ isActive = true, duration = 28 }: CardEffectProps) => {
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

  const learningStages = [
    { label: "Textos", icon: "📝", color: "emerald" },
    { label: "Gráficos", icon: "📊", color: "teal" },
    { label: "Imagens", icon: "🖼️", color: "cyan" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">Aprendizado de Dados</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          I.A. <span className="text-emerald-400">Aprende</span> com Dados
        </h2>
      </motion.div>

      {/* Main Visualization */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-md">
          {/* Data Flow Animation */}
          <div className="relative h-52">
            {/* Data Sources */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: phase >= 1 ? 1 : 0.3, x: phase >= 1 ? 0 : -50 }}
              className="absolute left-0 top-1/2 -translate-y-1/2"
            >
              <div className="flex flex-col gap-2">
                {learningStages.map((item, idx) => (
                  <motion.div
                    key={idx}
                    animate={phase >= 2 ? { x: [0, 80, 160] } : {}}
                    transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                    className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl"
                  >
                    {item.icon}
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
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center"
                animate={phase >= 2 ? { 
                  boxShadow: ['0 0 0px #10b981', '0 0 40px #10b981', '0 0 0px #10b981']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Brain className="w-10 h-10 text-emerald-400" />
              </motion.div>
              
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <span className="text-emerald-300 text-xs font-medium">Processando...</span>
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
                className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30"
              >
                <Sparkles className="w-7 h-7 text-cyan-400 mx-auto mb-1" />
                <span className="text-cyan-300 text-xs">Conhecimento</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Phase 5: Pattern Recognition Examples */}
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 grid grid-cols-3 gap-2"
            >
              {[
                { label: "Padrões", icon: "🔍", value: "1.2M" },
                { label: "Conexões", icon: "🔗", value: "500K" },
                { label: "Insights", icon: "💡", value: "10K" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.15 }}
                  className="p-2 rounded-lg bg-teal-500/15 border border-teal-500/20 text-center"
                >
                  <span className="text-lg">{stat.icon}</span>
                  <p className="text-teal-300 font-bold text-sm">{stat.value}</p>
                  <p className="text-teal-400/70 text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Phase 6: Self-Improvement Loop */}
          {phase >= 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
            >
              <div className="flex items-center justify-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </motion.div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Auto-Aprimoramento</p>
                  <p className="text-emerald-300 text-xs">A cada iteração, fica mais inteligente</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Insight */}
      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div className="text-center">
              <p className="text-white font-semibold text-sm">Quanto mais dados, melhor a I.A.</p>
              <p className="text-emerald-300 text-xs">Ela encontra padrões que humanos não veem</p>
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
