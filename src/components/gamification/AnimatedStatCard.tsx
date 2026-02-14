import { motion } from 'framer-motion';
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
  variant?: 'colored' | 'white';
}

const useCounter = (end: number, isLoading: boolean) => {
  const [count, setCount] = useState(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (count === end) return;
    if (animatingRef.current) return;

    animatingRef.current = true;
    const startValue = count;
    const startTime = Date.now();
    const duration = 1200;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newCount = Math.floor(startValue + (end - startValue) * easeOut);
      setCount(newCount);
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
        animatingRef.current = false;
      }
    };

    requestAnimationFrame(updateCount);
    return () => { animatingRef.current = false; };
  }, [end, isLoading, count]);

  return isLoading ? 0 : count;
};

export const AnimatedStatCard = ({
  value,
  label,
  icon: Icon,
  gradientFrom,
  gradientTo,
  delay = 0,
  isLoading = false,
  variant = 'white',
}: AnimatedStatCardProps) => {
  const animatedValue = useCounter(value, isLoading);
  const isColored = variant === 'colored';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl p-4 sm:p-5 transition-all duration-300"
      style={{
        background: isColored
          ? `linear-gradient(145deg, ${gradientFrom}, ${gradientTo})`
          : '#FFFFFF',
        border: isColored ? 'none' : '1px solid rgba(0,0,0,0.04)',
        boxShadow: isColored
          ? `0 8px 32px ${gradientFrom}30`
          : '0 8px 32px -4px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs sm:text-sm font-medium"
          style={{ color: isColored ? 'rgba(255,255,255,0.8)' : '#9CA3AF' }}
        >
          {label}
        </span>
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
          style={{
            background: isColored
              ? 'rgba(255,255,255,0.2)'
              : `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: isColored ? 'none' : `0 4px 12px ${gradientFrom}30`,
          }}
        >
          <Icon
            className="w-4 h-4 sm:w-5 sm:h-5"
            style={{ color: isColored ? 'white' : 'white' }}
          />
        </div>
      </div>

      {isLoading ? (
        <div
          className="w-12 h-8 rounded animate-pulse"
          style={{
            background: isColored ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
          }}
        />
      ) : (
        <motion.span
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.15, type: 'spring', stiffness: 200 }}
          className="text-2xl sm:text-3xl font-bold block"
          style={{
            color: isColored ? 'white' : gradientFrom,
          }}
        >
          {animatedValue}
        </motion.span>
      )}
    </motion.div>
  );
};
