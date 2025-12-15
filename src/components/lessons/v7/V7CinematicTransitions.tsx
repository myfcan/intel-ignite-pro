// src/components/lessons/v7/V7CinematicTransitions.tsx
// Advanced cinematic transitions using Framer Motion

import { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'dissolve' | 'wipe' | 'blur';
export type SlideDirection = 'up' | 'down' | 'left' | 'right';

interface V7CinematicTransitionsProps {
  children: ReactNode;
  isVisible: boolean;
  type: TransitionType;
  direction?: SlideDirection;
  duration?: number;
  delay?: number;
  className?: string;
}

// Transition variants for each type
const createVariants = (
  type: TransitionType,
  direction: SlideDirection,
  duration: number
): Variants => {
  const baseTransition = {
    duration,
    ease: 'easeInOut' as const,
  };

  switch (type) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: baseTransition },
        exit: { opacity: 0, transition: { ...baseTransition, duration: duration * 0.7 } },
      };

    case 'slide':
      const slideOffset = 100;
      const slideInitial = {
        up: { y: slideOffset, opacity: 0 },
        down: { y: -slideOffset, opacity: 0 },
        left: { x: slideOffset, opacity: 0 },
        right: { x: -slideOffset, opacity: 0 },
      };
      return {
        initial: slideInitial[direction],
        animate: { x: 0, y: 0, opacity: 1, transition: baseTransition },
        exit: { 
          ...slideInitial[direction === 'up' ? 'down' : direction === 'down' ? 'up' : direction === 'left' ? 'right' : 'left'],
          transition: { ...baseTransition, duration: duration * 0.7 } 
        },
      };

    case 'zoom':
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { 
          scale: 1, 
          opacity: 1, 
          transition: { 
            ...baseTransition,
            scale: { type: 'spring', stiffness: 300, damping: 25 }
          } 
        },
        exit: { 
          scale: 1.1, 
          opacity: 0, 
          transition: { ...baseTransition, duration: duration * 0.5 } 
        },
      };

    case 'dissolve':
      return {
        initial: { opacity: 0, filter: 'blur(20px)' },
        animate: { 
          opacity: 1, 
          filter: 'blur(0px)',
          transition: baseTransition
        },
        exit: { 
          opacity: 0, 
          filter: 'blur(20px)',
          transition: { ...baseTransition, duration: duration * 0.8 } 
        },
      };

    case 'wipe':
      return {
        initial: { 
          clipPath: direction === 'right' 
            ? 'inset(0 100% 0 0)' 
            : direction === 'left'
              ? 'inset(0 0 0 100%)'
              : direction === 'down'
                ? 'inset(0 0 100% 0)'
                : 'inset(100% 0 0 0)',
          opacity: 0.5
        },
        animate: { 
          clipPath: 'inset(0 0 0 0)',
          opacity: 1,
          transition: baseTransition
        },
        exit: { 
          clipPath: direction === 'right' 
            ? 'inset(0 0 0 100%)' 
            : direction === 'left'
              ? 'inset(0 100% 0 0)'
              : direction === 'down'
                ? 'inset(100% 0 0 0)'
                : 'inset(0 0 100% 0)',
          opacity: 0.5,
          transition: { ...baseTransition, duration: duration * 0.7 }
        },
      };

    case 'blur':
      return {
        initial: { opacity: 0, filter: 'blur(30px) saturate(0.5)' },
        animate: { 
          opacity: 1, 
          filter: 'blur(0px) saturate(1)',
          transition: { ...baseTransition, duration: duration * 1.2 }
        },
        exit: { 
          opacity: 0, 
          filter: 'blur(30px) saturate(0.5)',
          transition: { ...baseTransition, duration: duration * 0.6 } 
        },
      };

    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: baseTransition },
        exit: { opacity: 0, transition: baseTransition },
      };
  }
};

export const V7CinematicTransition = ({
  children,
  isVisible,
  type,
  direction = 'up',
  duration = 0.5,
  delay = 0,
  className = '',
}: V7CinematicTransitionsProps) => {
  const variants = createVariants(type, direction, duration);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="cinematic-content"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ delay }}
          className={`v7-cinematic-transition ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Compound transition for complex sequences
interface SequenceTransitionProps {
  children: ReactNode[];
  isVisible: boolean;
  staggerDelay?: number;
  type?: TransitionType;
  className?: string;
}

export const V7SequenceTransition = ({
  children,
  isVisible,
  staggerDelay = 0.1,
  type = 'fade',
  className = '',
}: SequenceTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
        >
          {children.map((child, index) => (
            <motion.div
              key={index}
              variants={createVariants(type, 'up', 0.4)}
              transition={{ delay: index * staggerDelay }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Page transition wrapper for act changes
interface ActTransitionProps {
  actId: string;
  children: ReactNode;
  type?: TransitionType;
  direction?: SlideDirection;
  className?: string;
}

export const V7ActTransition = ({
  actId,
  children,
  type = 'dissolve',
  direction = 'left',
  className = '',
}: ActTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={actId}
        variants={createVariants(type, direction, 0.6)}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`absolute inset-0 ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
