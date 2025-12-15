// src/components/lessons/v7/V7InteractionFeedback.tsx
// Feedback overlay component for V7 lesson interactions

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface V7InteractionFeedbackProps {
  type: 'success' | 'error' | 'partial';
  message: string;
  points?: number;
  xp?: number;
  duration?: number;
  onComplete?: () => void;
  showConfetti?: boolean;
}

export const V7InteractionFeedback = ({
  type,
  message,
  points,
  xp,
  duration = 2500,
  onComplete,
  showConfetti = true,
}: V7InteractionFeedbackProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    // Trigger confetti for success
    if (type === 'success' && showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      });
    }

    // Show rewards after initial animation
    const rewardsTimer = setTimeout(() => {
      if (points || xp) {
        setShowRewards(true);
      }
    }, 500);

    // Auto-hide and complete
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(rewardsTimer);
      clearTimeout(hideTimer);
    };
  }, [type, showConfetti, points, xp, duration, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-8 h-8" />;
      case 'error':
        return <X className="w-8 h-8" />;
      case 'partial':
        return <Star className="w-8 h-8" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500/30 to-emerald-500/30',
          border: 'border-green-500/50',
          icon: 'from-green-400 to-emerald-400',
          text: 'text-green-300',
          glow: 'shadow-green-500/30',
        };
      case 'error':
        return {
          bg: 'from-red-500/30 to-rose-500/30',
          border: 'border-red-500/50',
          icon: 'from-red-400 to-rose-400',
          text: 'text-red-300',
          glow: 'shadow-red-500/30',
        };
      case 'partial':
        return {
          bg: 'from-yellow-500/30 to-orange-500/30',
          border: 'border-yellow-500/50',
          icon: 'from-yellow-400 to-orange-400',
          text: 'text-yellow-300',
          glow: 'shadow-yellow-500/30',
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Feedback card */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className={`
              relative z-10 px-8 py-6 rounded-2xl
              bg-gradient-to-br ${colors.bg}
              border ${colors.border}
              shadow-2xl ${colors.glow}
              backdrop-blur-xl
            `}
          >
            {/* Animated background particles */}
            {type === 'success' && (
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: [0, (i % 2 ? 1 : -1) * (20 + i * 10)],
                      y: [0, -30 - i * 10],
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                    className="absolute left-1/2 top-1/2"
                  >
                    <Sparkles className="w-4 h-4 text-green-400" />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center gap-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className={`
                  w-16 h-16 rounded-full
                  bg-gradient-to-r ${colors.icon}
                  flex items-center justify-center
                  text-white shadow-lg
                `}
              >
                {getIcon()}
              </motion.div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-xl font-semibold ${colors.text} text-center max-w-xs`}
              >
                {message}
              </motion.p>

              {/* Rewards */}
              <AnimatePresence>
                {showRewards && (points || xp) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-4"
                  >
                    {points && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full border border-yellow-500/30"
                      >
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 font-bold">+{points}</span>
                      </motion.div>
                    )}

                    {xp && (
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30"
                      >
                        <Trophy className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 font-bold">+{xp} XP</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper component for inline feedback (non-modal)
export const V7InlineFeedback = ({
  type,
  message,
  className = '',
}: {
  type: 'success' | 'error' | 'partial' | 'info';
  message: string;
  className?: string;
}) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-300';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'partial':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'error':
        return <X className="w-5 h-5 text-red-400" />;
      case 'partial':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Sparkles className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 p-4 rounded-lg border ${getStyles()} ${className}`}
    >
      {getIcon()}
      <span>{message}</span>
    </motion.div>
  );
};
