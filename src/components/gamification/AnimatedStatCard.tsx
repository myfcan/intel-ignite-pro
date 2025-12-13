import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface AnimatedStatCardProps {
  value: number;
  label: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  delay?: number;
  isLoading?: boolean;
}

// Sparkle component
const Sparkle = ({ delay, size, x, y }: { delay: number; size: number; x: number; y: number }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 0.5,
    }}
  />
);

// Counter hook - animates from 0 to end value when end changes
// FIXED: Ignores intermediate 0 values from loading states to prevent flicker
const useCounter = (end: number, isLoading: boolean, duration: number = 1.5, startDelay: number = 0) => {
  const [count, setCount] = useState(0);
  const lastValidValueRef = useRef<number>(0);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    // If loading, don't do anything - keep showing current count
    if (isLoading) return;
    
    // If end is 0 and we've never animated, just set to 0
    if (end === 0 && !hasAnimatedRef.current) {
      setCount(0);
      return;
    }
    
    // If end is same as last valid value, skip (prevent re-animation on re-renders)
    if (end === lastValidValueRef.current && hasAnimatedRef.current) return;
    
    // Only update if we have a real value (not 0 from loading)
    if (end > 0) {
      lastValidValueRef.current = end;
      hasAnimatedRef.current = true;
      
      // Start animation from 0 to end
      setCount(0);

      const timeout = setTimeout(() => {
        const startTime = Date.now();

        const updateCount = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / (duration * 1000), 1);
          
          // Easing function for smooth deceleration
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const newCount = Math.floor(easeOut * end);
          
          setCount(newCount);

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            setCount(end); // Ensure we end at exact value
          }
        };

        requestAnimationFrame(updateCount);
      }, startDelay * 1000);

      return () => clearTimeout(timeout);
    }
  }, [end, isLoading, duration, startDelay]);

  return count;
};

export const AnimatedStatCard = ({
  value,
  label,
  icon: Icon,
  gradientFrom,
  gradientTo,
  delay = 0,
  isLoading = false,
}: AnimatedStatCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const animatedValue = useCounter(value, isLoading, 1.5, delay + 0.3);

  // Generate sparkle positions
  const sparkles = [
    { delay: 0, size: 4, x: 10, y: 20 },
    { delay: 0.2, size: 3, x: 85, y: 15 },
    { delay: 0.4, size: 5, x: 90, y: 70 },
    { delay: 0.6, size: 3, x: 15, y: 80 },
    { delay: 0.8, size: 4, x: 50, y: 10 },
    { delay: 1.0, size: 3, x: 5, y: 50 },
    { delay: 1.2, size: 4, x: 95, y: 45 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="group relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow background */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to bottom right, ${gradientFrom}15, transparent, ${gradientTo}08)`
        }}
      />
      
      {/* Sparkles - only visible on hover */}
      {isHovered && sparkles.map((sparkle, i) => (
        <Sparkle key={i} {...sparkle} />
      ))}
      
      <div className="relative flex flex-col items-center gap-3 sm:gap-4">
        {/* Icon with glow and floating sparkles */}
        <div className="relative">
          {/* Blur glow */}
          <motion.div 
            className="absolute inset-0 rounded-2xl blur-lg transition-opacity"
            style={{
              background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
              opacity: isHovered ? 0.7 : 0.4,
            }}
            animate={isHovered ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Icon container */}
          <motion.div 
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`
            }}
            animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
            
            {/* Orbiting sparkles on hover */}
            {isHovered && (
              <>
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-white/80"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ 
                    transformOrigin: "center center",
                    left: "50%",
                    top: "-8px",
                    marginLeft: "-4px"
                  }}
                />
                <motion.div
                  className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
                  animate={{
                    rotate: -360,
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ 
                    transformOrigin: "center center",
                    right: "-6px",
                    top: "50%",
                    marginTop: "-3px"
                  }}
                />
              </>
            )}
          </motion.div>
        </div>
        
        <div className="text-center">
          <motion.div 
            className="text-3xl sm:text-4xl font-bold mb-1"
            style={{
              background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          >
            {isLoading ? (
              <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
            ) : (
              animatedValue
            )}
          </motion.div>
          <div className="text-xs sm:text-sm font-medium text-gray-500">
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
