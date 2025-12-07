import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, Target, Compass, ArrowRight, CheckCircle, Sparkles, Zap, Users, Brain } from "lucide-react";
import { CardEffectProps } from "./index";

export const CardEffectStrategicShift = ({ isActive = true, duration = 27 }: CardEffectProps) => {
  const [phase, setPhase] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const maxLoops = 2;
  const totalPhases = 9;
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
    { before: "Trabalho manual", after: "Trabalho estratégico", color: "#3b82f6", icon: Brain },
    { before: "Execução lenta", after: "Execução rápida", color: "#22c55e", icon: Zap },
    { before: "Recursos limitados", after: "Escala ilimitada", color: "#a855f7", icon: Users },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-3 sm:mb-4">
          <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
          <span className="text-indigo-300 text-xs sm:text-sm font-medium">Mudança Estratégica</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          O <span className="text-indigo-400">Novo Paradigma</span> com I.A.
        </h2>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Phase 0-4: Shifts Grid */}
          {phase >= 0 && phase < 5 && (
            <motion.div
              key="shifts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md space-y-3 sm:space-y-4"
            >
              {shifts.map((shift, idx) => {
                const shouldShow = phase >= idx + 1;
                const isCurrentlyActive = phase === idx + 1;
                const ShiftIcon = shift.icon;
                
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
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Before */}
                      <motion.div
                        className="flex-1 p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                        animate={isCurrentlyActive ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ duration: 1, repeat: isCurrentlyActive ? Infinity : 0 }}
                      >
                        <p className="text-red-300 text-xs sm:text-sm font-medium text-center">{shift.before}</p>
                      </motion.div>

                      {/* Arrow */}
                      <motion.div
                        animate={shouldShow ? { x: [0, 3, 0] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="flex-shrink-0"
                      >
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                      </motion.div>

                      {/* After */}
                      <motion.div
                        className="flex-1 p-2.5 sm:p-3 rounded-lg border"
                        style={{ 
                          backgroundColor: `${shift.color}20`,
                          borderColor: `${shift.color}40`
                        }}
                        animate={shouldShow ? { 
                          boxShadow: [`0 0 0px ${shift.color}`, `0 0 15px ${shift.color}`, `0 0 0px ${shift.color}`]
                        } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          <ShiftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: shift.color }} />
                          <p className="text-xs sm:text-sm font-medium" style={{ color: shift.color }}>{shift.after}</p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Summary after all shifts */}
              {phase === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center"
                >
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm sm:text-base">Foco no que importa</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 5: Impact Visualization */}
          {phase === 5 && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/50 flex items-center justify-center mb-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: ['0 0 0px #6366f1', '0 0 40px #6366f1', '0 0 0px #6366f1']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />
              </motion.div>
              
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Impacto Real
              </h3>
              <p className="text-indigo-300 text-sm sm:text-base max-w-xs mb-4">
                Profissionais com I.A. entregam 10x mais em menos tempo
              </p>

              {/* Stats */}
              <div className="flex gap-4 sm:gap-6">
                {[
                  { label: "Produtividade", value: "+300%" },
                  { label: "Velocidade", value: "10x" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-center"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-indigo-400">{stat.value}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 6: Vantagem Competitiva */}
          {phase === 6 && (
            <motion.div
              key="competitive"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center px-4 w-full max-w-sm"
            >
              <motion.div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center mb-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: ['0 0 0px #10b981', '0 0 30px #10b981', '0 0 0px #10b981']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
              </motion.div>
              
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                Sua <span className="text-emerald-400">Vantagem</span> Competitiva
              </h3>

              <div className="space-y-2 w-full">
                {[
                  { text: "Entregar mais em menos tempo", icon: Zap },
                  { text: "Resolver problemas complexos", icon: Brain },
                  { text: "Se destacar no mercado", icon: TrendingUp },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 text-xs sm:text-sm">{item.text}</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 7: O Momento é Agora */}
          {phase === 7 && (
            <motion.div
              key="moment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-amber-500/40 flex items-center justify-center mb-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center"
                >
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
                </motion.div>
              </motion.div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                O <span className="text-amber-400">Momento</span> é Agora
              </h3>
              
              <p className="text-gray-300 text-xs sm:text-sm max-w-xs mb-4">
                Quem domina I.A. hoje será líder amanhã
              </p>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full max-w-[200px]"
              />
              
              <p className="text-amber-400/80 text-xs mt-2">Não fique para trás</p>
            </motion.div>
          )}

          {/* Phase 8: Final Call */}
          {phase === 8 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40 flex items-center justify-center mb-5"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  boxShadow: ['0 0 0px #a855f7', '0 0 30px #a855f7', '0 0 0px #a855f7']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Compass className="w-12 h-12 sm:w-14 sm:h-14 text-purple-400" />
              </motion.div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                A <span className="text-purple-400">Escolha</span> é Sua
              </h3>
              
              <p className="text-gray-300 text-sm sm:text-base max-w-sm mb-4">
                Você pode resistir à mudança ou liderar a transformação
              </p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-purple-500/50"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold text-sm sm:text-base">Lidere com I.A.</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-4">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${i <= phase ? 'bg-indigo-400' : 'bg-indigo-800'}`}
            animate={{ scale: i === phase ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
