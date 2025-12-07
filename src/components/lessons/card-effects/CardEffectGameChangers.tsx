import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Rocket, Globe, Wifi, Smartphone, Users, AppWindow, Brain, Sparkles } from "lucide-react";
import { CardEffectProps } from "./index";

const timelineData = [
  { year: "1990", label: "Internet", icon: Globe, color: "#3b82f6", bg: "from-blue-500/20 to-blue-600/20" },
  { year: "2000", label: "Banda Larga", icon: Wifi, color: "#10b981", bg: "from-emerald-500/20 to-emerald-600/20" },
  { year: "2007", label: "Smartphones", icon: Smartphone, color: "#f59e0b", bg: "from-orange-500/20 to-amber-600/20" },
  { year: "2011", label: "Redes Sociais", icon: Users, color: "#ec4899", bg: "from-pink-500/20 to-rose-600/20" },
  { year: "2015", label: "Apps", icon: AppWindow, color: "#8b5cf6", bg: "from-purple-500/20 to-violet-600/20" },
  { year: "2025", label: "Inteligência Artificial", icon: Brain, color: "#06b6d4", bg: "from-cyan-500/20 to-blue-600/20" },
];

export const CardEffectGameChangers = ({ isActive = true, duration = 32 }: CardEffectProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showInsight, setShowInsight] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const maxLoops = 2;
  const itemDuration = 3500;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setActiveIndex(-1);
    setShowInsight(false);

    // Cada item aparece sequencialmente
    timelineData.forEach((_, index) => {
      timersRef.current.push(setTimeout(() => setActiveIndex(index), index * itemDuration));
    });

    // Insight final
    timersRef.current.push(setTimeout(() => {
      setShowInsight(true);
    }, timelineData.length * itemDuration));

    // Loop
    timersRef.current.push(setTimeout(() => {
      setLoopCount(prev => prev + 1);
    }, timelineData.length * itemDuration + 3000));
  };

  useEffect(() => {
    if (!isActive || loopCount >= maxLoops) return;
    startAnimation();
    return () => clearTimers();
  }, [isActive, loopCount]);

  const currentItem = activeIndex >= 0 && activeIndex < timelineData.length ? timelineData[activeIndex] : null;
  const isLast = activeIndex === timelineData.length - 1;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[550px] sm:min-h-[600px] h-[75vh] max-h-[700px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 sm:p-6 md:p-8 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 sm:mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-3 sm:mb-4">
          <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
          <span className="text-blue-300 text-xs sm:text-sm font-medium">Mudanças de Jogo</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Tecnologias que <span className="text-blue-400">Transformaram</span> o Mundo
        </h2>
      </motion.div>

      {/* Central Carousel - Um item por vez */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.5, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon Container */}
              <motion.div 
                className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br ${currentItem.bg} border border-white/20 flex items-center justify-center mb-4 sm:mb-6`}
                animate={isLast ? { 
                  boxShadow: ['0 0 0px rgba(6, 182, 212, 0.3)', '0 0 50px rgba(6, 182, 212, 0.6)', '0 0 0px rgba(6, 182, 212, 0.3)']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: `0 0 30px ${currentItem.color}40` }}
              >
                <currentItem.icon 
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" 
                  style={{ color: currentItem.color }} 
                />
              </motion.div>

              {/* Label */}
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3"
              >
                {currentItem.label}
              </motion.h3>

              {/* Year Badge */}
              <motion.div 
                className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold text-lg sm:text-xl text-white"
                style={{ backgroundColor: currentItem.color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {currentItem.year}
              </motion.div>

              {/* Special message for AI (last item) */}
              {isLast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-300 text-sm sm:text-base font-medium">
                    A próxima grande revolução é AGORA!
                  </span>
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Insight Message (after all items) */}
          {showInsight && activeIndex >= timelineData.length - 1 && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center p-4 sm:p-6"
            >
              <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-lg sm:text-xl text-white font-semibold mb-2">
                Cada revolução trouxe quem agiu primeiro.
              </p>
              <p className="text-blue-300 text-sm sm:text-base">
                Você está na próxima!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 sm:gap-3 mt-4">
        {timelineData.map((item, i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: i === activeIndex 
                ? item.color 
                : i < activeIndex 
                  ? `${item.color}60` 
                  : 'rgba(255,255,255,0.15)'
            }}
            animate={i === activeIndex ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      {/* Timeline Progress Bar */}
      <div className="mt-3 sm:mt-4 flex justify-center">
        <div className="w-48 sm:w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((activeIndex + 1) / timelineData.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};
