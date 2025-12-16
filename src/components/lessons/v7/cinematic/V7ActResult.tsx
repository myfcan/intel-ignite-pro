// V7ActResult - 100% Cinematic Result/Revelation Act
// Features: Animated metrics, celebration effects, CTA button, personalized message

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MetricBox {
  label: string;
  value: string | number;
  suffix?: string;
  icon?: string;
  isHighlight?: boolean;
}

interface V7ActResultProps {
  emoji: string;
  title: string;
  message: string;
  metrics: MetricBox[];
  ctaText?: string;
  ctaAction?: () => void;
  celebrationLevel?: "low" | "medium" | "high";
  onSoundTrigger?: (type: "reveal" | "celebration" | "click") => void;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

const CONFETTI_COLORS = ["#f093fb", "#f5576c", "#4ecdc4", "#667eea", "#ffd93d"];

export const V7ActResult = ({
  emoji,
  title,
  message,
  metrics,
  ctaText,
  ctaAction,
  celebrationLevel = "medium",
  onSoundTrigger,
}: V7ActResultProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [animatedValues, setAnimatedValues] = useState<Map<number, number>>(new Map());

  // Reveal sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => {
      setIsRevealed(true);
      onSoundTrigger?.("reveal");
    }, 300));

    timers.push(setTimeout(() => {
      setShowMetrics(true);
      if (celebrationLevel !== "low") {
        launchConfetti();
        onSoundTrigger?.("celebration");
      }
    }, 1000));

    timers.push(setTimeout(() => {
      setShowCta(true);
    }, 2000));

    return () => timers.forEach(clearTimeout);
  }, [celebrationLevel, onSoundTrigger]);

  // Animate numeric metric values
  useEffect(() => {
    if (!showMetrics) return;

    metrics.forEach((metric, index) => {
      const numericValue = typeof metric.value === "number" 
        ? metric.value 
        : parseInt(String(metric.value).replace(/\D/g, "")) || 0;

      if (numericValue > 0) {
        let current = 0;
        const increment = numericValue / 40;
        const interval = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            setAnimatedValues(prev => new Map(prev).set(index, numericValue));
            clearInterval(interval);
          } else {
            setAnimatedValues(prev => new Map(prev).set(index, Math.floor(current)));
          }
        }, 30);
      }
    });
  }, [showMetrics, metrics]);

  // Confetti launcher
  const launchConfetti = useCallback(() => {
    const count = celebrationLevel === "high" ? 50 : celebrationLevel === "medium" ? 30 : 15;
    
    const newConfetti: Confetti[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 40,
      rotation: Math.random() * 360,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 8 + Math.random() * 8,
      velocity: {
        x: (Math.random() - 0.5) * 8,
        y: -(5 + Math.random() * 8),
      },
    }));

    setConfetti(newConfetti);
  }, [celebrationLevel]);

  // Animate confetti
  useEffect(() => {
    if (confetti.length === 0) return;

    const interval = setInterval(() => {
      setConfetti(prev =>
        prev
          .map(c => ({
            ...c,
            x: c.x + c.velocity.x * 0.3,
            y: c.y + c.velocity.y * 0.3,
            rotation: c.rotation + 5,
            velocity: {
              x: c.velocity.x * 0.99,
              y: c.velocity.y + 0.3, // gravity
            },
          }))
          .filter(c => c.y < 110)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [confetti.length]);

  const getDisplayValue = (metric: MetricBox, index: number): string => {
    if (typeof metric.value === "number") {
      const animated = animatedValues.get(index) ?? 0;
      return `${animated}${metric.suffix || ""}`;
    }
    return String(metric.value);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map(c => (
        <motion.div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}

      {/* Background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isRevealed ? 1 : 0 }}
        style={{
          background: "radial-gradient(circle at center, rgba(102, 126, 234, 0.15) 0%, transparent 60%)",
        }}
      />

      <div className="text-center max-w-2xl relative z-10">
        {/* Emoji Badge */}
        <motion.div
          className="relative inline-block mb-6 sm:mb-8"
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={isRevealed ? { scale: 1, opacity: 1, rotate: 0 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.5))",
              filter: "blur(20px)",
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative text-6xl sm:text-8xl block">{emoji}</span>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6"
          style={{
            background: "linear-gradient(90deg, #f093fb, #f5576c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {title}
        </motion.h2>

        {/* Message */}
        <motion.p
          className="text-base sm:text-lg lg:text-xl leading-relaxed text-white/80 mb-8 sm:mb-10"
          initial={{ opacity: 0 }}
          animate={isRevealed ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          dangerouslySetInnerHTML={{ __html: message }}
        />

        {/* Metrics Grid */}
        <AnimatePresence>
          {showMetrics && (
            <motion.div
              className="grid grid-cols-2 gap-3 sm:gap-5 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  className={`
                    relative bg-white/[0.03] p-4 sm:p-5 rounded-xl 
                    border overflow-hidden
                    ${metric.isHighlight
                      ? "border-[#4ecdc4]/50 bg-[#4ecdc4]/5"
                      : "border-white/10"
                    }
                  `}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.2)" }}
                >
                  {/* Icon */}
                  {metric.icon && (
                    <span className="text-2xl mb-2 block">{metric.icon}</span>
                  )}

                  {/* Label */}
                  <div className="text-xs sm:text-sm text-white/50 mb-1">
                    {metric.label}
                  </div>

                  {/* Value */}
                  <motion.div
                    className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                      metric.isHighlight ? "text-[#4ecdc4]" : "text-white"
                    }`}
                    style={{
                      textShadow: metric.isHighlight
                        ? "0 0 20px rgba(78, 205, 196, 0.5)"
                        : "none",
                    }}
                  >
                    {getDisplayValue(metric, index)}
                  </motion.div>

                  {/* Highlight shimmer */}
                  {metric.isHighlight && (
                    <motion.div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(78, 205, 196, 0.3) 50%, transparent 60%)",
                      }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <AnimatePresence>
          {showCta && ctaText && (
            <motion.button
              className="px-10 sm:px-16 py-4 sm:py-5 text-lg sm:text-xl text-white 
                         rounded-full relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 15px 50px rgba(102, 126, 234, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSoundTrigger?.("click");
                ctaAction?.();
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative z-10 font-semibold">{ctaText}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
