import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Rocket, Globe, Wifi, Smartphone, Users, AppWindow, Brain, Sparkles } from "lucide-react";
import { CardEffectProps } from "./index";

const timelineData = [
  { year: "1990", label: "Internet", icon: Globe, color: "#3b82f6" },
  { year: "2000", label: "Banda Larga", icon: Wifi, color: "#10b981" },
  { year: "2007", label: "Smartphones", icon: Smartphone, color: "#f59e0b" },
  { year: "2011", label: "Redes Sociais", icon: Users, color: "#ec4899" },
  { year: "2015", label: "Apps", icon: AppWindow, color: "#8b5cf6" },
  { year: "2025", label: "I.A.", icon: Brain, color: "#d946ef" },
];

export const CardEffectGameChangers = ({ isActive = true, duration = 15 }: CardEffectProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showInsight, setShowInsight] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const maxLoops = 2;

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setActiveIndex(-1);
    setShowInsight(false);

    timelineData.forEach((_, index) => {
      timersRef.current.push(setTimeout(() => setActiveIndex(index), 400 + index * 1200));
    });

    timersRef.current.push(setTimeout(() => setShowInsight(true), 400 + timelineData.length * 1200 + 400));

    timersRef.current.push(setTimeout(() => {
      setLoopCount(prev => prev + 1);
    }, 400 + timelineData.length * 1200 + 2500));
  };

  useEffect(() => {
    if (!isActive || loopCount >= maxLoops) return;
    startAnimation();
    return () => clearTimers();
  }, [isActive, loopCount]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 sm:p-6 flex flex-col"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-3">
          <Rocket className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">Mudanças de Jogo</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Tecnologias que <span className="text-blue-400">Transformaram</span> o Mundo
        </h2>
      </motion.div>

      {/* Timeline Grid */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto py-4">
        <div className="flex items-end gap-3 sm:gap-4 px-2">
          {timelineData.map((item, index) => {
            const Icon = item.icon;
            const isShown = activeIndex >= index;
            const isCurrent = activeIndex === index;
            const isLast = index === timelineData.length - 1;

            return (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: isShown ? 1 : 0.2,
                  y: isShown ? 0 : 30,
                }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                {/* Card */}
                <motion.div
                  animate={{ 
                    scale: isCurrent ? 1.08 : 1,
                    boxShadow: isCurrent ? `0 0 25px ${item.color}50` : 'none'
                  }}
                  className={`
                    relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 min-w-[70px] sm:min-w-[85px]
                    ${isLast 
                      ? 'bg-gradient-to-br from-fuchsia-900/60 to-purple-900/60 border-fuchsia-400/60' 
                      : 'bg-slate-800/70 border-slate-600/40'}
                    ${isCurrent ? 'border-opacity-100' : ''}
                  `}
                  style={{ borderColor: isCurrent ? item.color : undefined }}
                >
                  {/* Icon */}
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: `${item.color}30` }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: item.color }} />
                  </div>
                  
                  {/* Label */}
                  <p className={`text-xs sm:text-sm font-bold text-center ${isLast ? 'text-fuchsia-200' : 'text-white'}`}>
                    {item.label}
                  </p>

                  {/* Pulse for current */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute inset-0 rounded-xl border-2"
                      style={{ borderColor: item.color }}
                    />
                  )}

                  {/* Star for last */}
                  {isLast && isShown && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Year below */}
                <motion.div
                  animate={{ opacity: isShown ? 1 : 0.3 }}
                  className="mt-2 px-2 py-1 rounded-md"
                  style={{ backgroundColor: isShown ? `${item.color}20` : 'transparent' }}
                >
                  <span 
                    className="text-xs sm:text-sm font-bold"
                    style={{ color: isShown ? item.color : '#64748b' }}
                  >
                    {item.year}
                  </span>
                </motion.div>

                {/* Connection dot */}
                <motion.div
                  animate={{ 
                    scale: isShown ? 1 : 0,
                    backgroundColor: item.color
                  }}
                  className="w-2.5 h-2.5 rounded-full mt-2"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Timeline base line */}
      <div className="relative h-1 mx-8 mb-4">
        <div className="absolute inset-0 bg-slate-700/50 rounded-full" />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: activeIndex >= 0 ? (activeIndex + 1) / timelineData.length : 0 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 rounded-full origin-left"
        />
      </div>

      {/* Insight */}
      {showInsight && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 text-center"
        >
          <p className="text-fuchsia-200 text-sm font-medium">
            🚀 Cada revolução trouxe quem agiu primeiro. Você está na próxima!
          </p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="flex justify-center gap-2 mt-4">
        {timelineData.map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${activeIndex >= i ? 'bg-blue-400' : 'bg-blue-900'}`}
            animate={{ scale: activeIndex === i ? 1.4 : 1 }}
          />
        ))}
      </div>
    </motion.div>
  );
};