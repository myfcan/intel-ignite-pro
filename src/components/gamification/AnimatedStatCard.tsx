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
}: AnimatedStatCardProps) => {
  const animatedValue = useCounter(value, isLoading);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group"
      style={{
        background: '#FFFFFF',
        border: '1px solid hsl(220 13% 91%)',
        boxShadow: '0 1px 3px hsl(0 0% 0% / 0.04), 0 4px 16px hsl(0 0% 0% / 0.03)',
      }}
    >
      {/* Subtle gradient accent on top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
      />

      {/* Content */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: `0 4px 12px ${gradientFrom}25`,
          }}
        >
          <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-white" />
        </div>

        {/* Value + Label */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="w-10 h-6 rounded animate-pulse" style={{ background: 'hsl(220 14% 96%)' }} />
          ) : (
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.15, type: 'spring', stiffness: 200 }}
              className="text-xl sm:text-2xl font-bold block leading-none"
              style={{ color: 'hsl(215 25% 12%)' }}
            >
              {animatedValue.toLocaleString('pt-BR')}
            </motion.span>
          )}
          <span
            className="text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5 block truncate"
            style={{ color: 'hsl(215 16% 52%)' }}
          >
            {label}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
