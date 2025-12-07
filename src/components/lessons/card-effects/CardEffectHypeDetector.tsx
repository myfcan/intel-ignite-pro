import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, AlertCircle, CheckCircle, Target, Zap } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectHypeDetector = ({ isActive = true, duration = 15 }: CardEffectProps) => {
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

  const hypeItems = [
    { text: "IA vai substituir todos!", icon: AlertCircle, isHype: true },
    { text: "Assistente para tarefas", icon: CheckCircle, isHype: false },
    { text: "IA é magia!", icon: AlertCircle, isHype: true },
    { text: "Ferramenta que aprende", icon: CheckCircle, isHype: false },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-4">
          <Target className="w-4 h-4 text-violet-400" />
          <span className="text-violet-300 text-sm font-medium">Detector de Hype</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Separando <span className="text-violet-400">Realidade</span> do Hype
        </h2>
      </motion.div>

      {/* Scanner Area */}
      <div className="flex-1 relative">
        <div className="grid grid-cols-2 gap-4 h-full">
          {hypeItems.map((item, idx) => {
            const Icon = item.icon;
            const shouldShow = phase >= idx;
            const isScanning = phase === idx;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: shouldShow ? 1 : 0.3,
                  scale: shouldShow ? 1 : 0.8,
                  borderColor: isScanning ? (item.isHype ? '#ef4444' : '#22c55e') : 'transparent'
                }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  item.isHype 
                    ? 'bg-red-500/10' 
                    : 'bg-green-500/10'
                }`}
              >
                {isScanning && (
                  <motion.div 
                    className="absolute inset-0 rounded-xl"
                    animate={{ 
                      boxShadow: [
                        `0 0 0px ${item.isHype ? '#ef4444' : '#22c55e'}40`,
                        `0 0 30px ${item.isHype ? '#ef4444' : '#22c55e'}60`,
                        `0 0 0px ${item.isHype ? '#ef4444' : '#22c55e'}40`
                      ]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                
                <div className="flex items-start gap-3">
                  <Icon className={`w-6 h-6 ${item.isHype ? 'text-red-400' : 'text-green-400'}`} />
                  <div>
                    <p className="text-white font-medium text-sm">{item.text}</p>
                    <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                      item.isHype 
                        ? 'bg-red-500/20 text-red-300' 
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {item.isHype ? 'HYPE' : 'REAL'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Scanning Line */}
        {phase < totalPhases - 1 && (
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Result */}
      {phase >= totalPhases - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-violet-500/20 border border-violet-500/30 text-center"
        >
          <Zap className="w-8 h-8 text-violet-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Análise Completa!</p>
          <p className="text-violet-300 text-sm">Aprenda a identificar o que realmente importa</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i <= phase ? 'bg-violet-400' : 'bg-violet-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
