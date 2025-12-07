import { motion, AnimatePresence } from "framer-motion";
import { Globe, Cpu, ArrowRight, Clock, Sparkles, Wifi, Smartphone, Users, AppWindow, Brain } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectHistoryParallelProps {
  isActive?: boolean;
}

const timelineData = [
  { year: "1990", label: "Internet", icon: Globe, color: "from-blue-500 to-cyan-500" },
  { year: "2000", label: "Banda Larga", icon: Wifi, color: "from-green-500 to-emerald-500" },
  { year: "2007", label: "Smartphones", icon: Smartphone, color: "from-orange-500 to-amber-500" },
  { year: "2011", label: "Redes Sociais", icon: Users, color: "from-pink-500 to-rose-500" },
  { year: "2015", label: "Apps", icon: AppWindow, color: "from-purple-500 to-violet-500" },
  { year: "2025", label: "I.A.", icon: Brain, color: "from-fuchsia-500 to-purple-600" },
];

export const CardEffectHistoryParallel = ({ isActive = false }: CardEffectHistoryParallelProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showInsight, setShowInsight] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setActiveIndex(-1);
    setShowInsight(false);

    // Animate each timeline item sequentially - increased to 2500ms for better readability
    timelineData.forEach((_, index) => {
      timersRef.current.push(setTimeout(() => setActiveIndex(index), 500 + index * 2500));
    });

    // Show insight after all items - increased timing
    timersRef.current.push(setTimeout(() => setShowInsight(true), 500 + timelineData.length * 2500 + 500));

    // Loop twice - increased timing
    if (loopCountRef.current < 2) {
      timersRef.current.push(setTimeout(() => startAnimation(), 500 + timelineData.length * 2500 + 4000));
    }
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setActiveIndex(-1);
      setShowInsight(false);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col h-full p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 bg-violet-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-400/30 mb-3">
            <Clock className="w-4 h-4 text-violet-300" />
            <span className="text-violet-300 text-sm font-medium">A História Se Repete</span>
          </div>
          <h3 className="text-white text-lg sm:text-xl font-bold">
            Tecnologias que{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Transformaram
            </span>{" "}
            o Mundo
          </h3>
        </motion.div>

        {/* Timeline */}
        <div className="flex-1 flex items-center justify-center overflow-x-auto">
          <div className="relative flex items-center gap-2 sm:gap-4 px-2">
            {/* Timeline line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: activeIndex >= 0 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 rounded-full origin-left -translate-y-1/2 z-0"
            />

            {timelineData.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeIndex >= index;
              const isCurrent = activeIndex === index;
              const isLast = index === timelineData.length - 1;

              return (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.3, 
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  {/* Card */}
                  <motion.div
                    animate={{ 
                      boxShadow: isCurrent 
                        ? `0 0 30px 5px rgba(168, 85, 247, 0.4)` 
                        : 'none'
                    }}
                    className={`
                      relative p-2 sm:p-3 rounded-xl border transition-all duration-300
                      ${isLast 
                        ? 'bg-gradient-to-br from-fuchsia-900/80 to-purple-900/80 border-fuchsia-400/50' 
                        : 'bg-slate-800/80 border-slate-600/50'}
                      ${isCurrent ? 'border-violet-400' : ''}
                    `}
                  >
                    {/* Icon container */}
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-1
                      bg-gradient-to-br ${item.color}
                    `}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    
                    {/* Label */}
                    <p className={`text-xs sm:text-sm font-semibold text-center ${isLast ? 'text-fuchsia-200' : 'text-white'}`}>
                      {item.label}
                    </p>
                    
                    {/* Year */}
                    <p className={`text-[10px] sm:text-xs text-center ${isLast ? 'text-fuchsia-300/70' : 'text-slate-400'}`}>
                      {item.year}
                    </p>

                    {/* Pulse effect for current */}
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 rounded-xl border-2 border-violet-400"
                      />
                    )}

                    {/* Star for last item */}
                    {isLast && isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Connection dot */}
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1 : 0,
                      backgroundColor: isCurrent ? '#a855f7' : '#6366f1'
                    }}
                    className="absolute -bottom-3 w-3 h-3 rounded-full"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Insight */}
        <AnimatePresence>
          {showInsight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center mt-4"
            >
              <div className="inline-flex items-center gap-2 bg-fuchsia-900/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-fuchsia-500/30">
                <ArrowRight className="w-4 h-4 text-fuchsia-400" />
                <p className="text-fuchsia-200 text-sm font-medium">
                  Cada revolução trouxe quem agiu primeiro
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 justify-center mt-4">
          {timelineData.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${activeIndex >= index ? 'bg-violet-400' : 'bg-violet-900'}`}
              animate={{ scale: activeIndex === index ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-violet-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-violet-400/30"
      >
        <span className="text-violet-300 text-xs font-medium">Paralelo</span>
      </motion.div>
    </div>
  );
};