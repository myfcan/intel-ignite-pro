// V7ActDramatic - 100% Cinematic Hook Act with dramatic number reveal
// Features: Pulsing number, particles burst, glow effects, dramatic entrance

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface V7ActDramaticProps {
  mainValue: string;
  subtitle: string;
  highlightWord?: string;
  mood?: "danger" | "success" | "warning" | "neutral";
  onAnimationComplete?: () => void;
}

const MOOD_STYLES = {
  danger: {
    gradient: "linear-gradient(45deg, #ff0040, #ff6b6b)",
    glow: "rgba(255, 0, 64, 0.4)",
    particleColor: "#ff0040",
  },
  success: {
    gradient: "linear-gradient(45deg, #00d9a6, #4ecdc4)",
    glow: "rgba(78, 205, 196, 0.4)",
    particleColor: "#4ecdc4",
  },
  warning: {
    gradient: "linear-gradient(45deg, #f39c12, #f1c40f)",
    glow: "rgba(243, 156, 18, 0.4)",
    particleColor: "#f39c12",
  },
  neutral: {
    gradient: "linear-gradient(45deg, #667eea, #764ba2)",
    glow: "rgba(102, 126, 234, 0.4)",
    particleColor: "#667eea",
  },
};

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
  opacity: number;
}

export const V7ActDramatic = ({
  mainValue,
  subtitle,
  highlightWord,
  mood = "danger",
  onAnimationComplete,
}: V7ActDramaticProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [countValue, setCountValue] = useState("0");
  const containerRef = useRef<HTMLDivElement>(null);
  const styles = MOOD_STYLES[mood];

  // Count up animation for numeric values
  useEffect(() => {
    const numericMatch = mainValue.match(/^(\d+)/);
    if (numericMatch) {
      const targetNum = parseInt(numericMatch[1]);
      const suffix = mainValue.replace(/^\d+/, "");
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function for dramatic effect
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * targetNum);
        setCountValue(`${current}${suffix}`);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCountValue(mainValue);
          setIsRevealed(true);
        }
      };

      const timer = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setCountValue(mainValue);
      setTimeout(() => setIsRevealed(true), 800);
    }
  }, [mainValue]);

  // Particle burst on reveal
  useEffect(() => {
    if (isRevealed) {
      const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: 50,
        y: 50,
        angle: (i / 30) * Math.PI * 2,
        velocity: 3 + Math.random() * 5,
        size: 4 + Math.random() * 8,
        opacity: 1,
      }));
      setParticles(newParticles);
      
      // Show subtitle after burst
      setTimeout(() => setShowSubtitle(true), 300);
      setTimeout(() => onAnimationComplete?.(), 2000);
    }
  }, [isRevealed, onAnimationComplete]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.velocity * 0.5,
            y: p.y + Math.sin(p.angle) * p.velocity * 0.5,
            opacity: p.opacity - 0.02,
            velocity: p.velocity * 0.98,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  const renderSubtitle = () => {
    if (!highlightWord) return subtitle;
    const parts = subtitle.split(highlightWord);
    if (parts.length === 1) return subtitle;
    return (
      <>
        {parts[0]}
        <strong className="text-white font-bold">{highlightWord}</strong>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          background: `radial-gradient(circle at center, ${styles.glow} 0%, transparent 60%)`,
        }}
      />

      {/* Pulsing rings */}
      <AnimatePresence>
        {isRevealed && (
          <>
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute rounded-full border-2"
                style={{ borderColor: styles.particleColor }}
                initial={{ width: 0, height: 0, opacity: 0.8 }}
                animate={{
                  width: [0, 600 + ring * 100],
                  height: [0, 600 + ring * 100],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: ring * 0.2,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: styles.particleColor,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${styles.particleColor}`,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative text-center z-10">
        {/* Main Number */}
        <motion.div
          className="text-[18vw] sm:text-[20vw] font-black leading-none select-none"
          style={{
            background: styles.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: isRevealed ? `drop-shadow(0 0 40px ${styles.glow})` : "none",
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: isRevealed ? [1, 1.05, 1] : 1,
            opacity: 1,
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 },
          }}
        >
          {countValue}
        </motion.div>

        {/* Subtitle */}
        <AnimatePresence>
          {showSubtitle && (
            <motion.div
              className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center 
                         text-lg sm:text-2xl md:text-3xl text-white/80 whitespace-nowrap"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {renderSubtitle()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow underline */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              className="absolute top-[90%] left-1/2 -translate-x-1/2 h-1 rounded-full"
              style={{ backgroundColor: styles.particleColor }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "60%", opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
