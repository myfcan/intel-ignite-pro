/**
 * V7MicroVisualOverlay - Renders micro-visuals as animated overlays
 *
 * V7-vv-v2: This component displays micro-visuals (icon, text, image, etc.)
 * that are triggered by specific words in the narration. Each micro-visual
 * appears at its triggerTime and fades out after its duration.
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { V7MicroVisual } from '../phases/V7PhaseController';

interface V7MicroVisualOverlayProps {
  microVisuals: V7MicroVisual[];
  currentTime: number;
  isPlaying: boolean;
}

// Position mapping for micro-visuals
const positionStyles: Record<string, React.CSSProperties> = {
  center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  top: { top: '15%', left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: '20%', left: '50%', transform: 'translateX(-50%)' },
  left: { top: '50%', left: '15%', transform: 'translateY(-50%)' },
  right: { top: '50%', right: '15%', transform: 'translateY(-50%)' },
};

// Animation variants for different micro-visual types
const animationVariants = {
  icon: {
    initial: { scale: 0, opacity: 0, rotate: -180 },
    animate: { scale: 1, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 15 } },
    exit: { scale: 0, opacity: 0, rotate: 180, transition: { duration: 0.3 } },
  },
  text: {
    initial: { y: 50, opacity: 0, scale: 0.8 },
    animate: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 20 } },
    exit: { y: -30, opacity: 0, scale: 0.9, transition: { duration: 0.4 } },
  },
  number: {
    initial: { scale: 3, opacity: 0, filter: 'blur(20px)' },
    animate: { scale: 1, opacity: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 100, damping: 12 } },
    exit: { scale: 0.5, opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } },
  },
  image: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 15 } },
    exit: { scale: 1.2, opacity: 0, transition: { duration: 0.4 } },
  },
  badge: {
    initial: { scale: 0, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 18 } },
    exit: { scale: 0, opacity: 0, y: -20, transition: { duration: 0.3 } },
  },
  highlight: {
    initial: { opacity: 0, boxShadow: '0 0 0 0 rgba(34, 211, 238, 0)' },
    animate: {
      opacity: 1,
      boxShadow: ['0 0 0 0 rgba(34, 211, 238, 0.4)', '0 0 30px 15px rgba(34, 211, 238, 0.3)', '0 0 0 0 rgba(34, 211, 238, 0)'],
      transition: { duration: 1.5, repeat: Infinity }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  },
};

export const V7MicroVisualOverlay: React.FC<V7MicroVisualOverlayProps> = ({
  microVisuals,
  currentTime,
  isPlaying,
}) => {
  // Determine which micro-visuals should be visible based on current time
  const visibleMicroVisuals = useMemo(() => {
    return microVisuals.filter(mv => {
      const isAfterTrigger = currentTime >= mv.triggerTime;
      const isBeforeEnd = currentTime < mv.triggerTime + mv.duration;
      return isAfterTrigger && isBeforeEnd;
    });
  }, [microVisuals, currentTime]);

  if (visibleMicroVisuals.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence mode="popLayout">
        {visibleMicroVisuals.map((mv) => (
          <MicroVisualItem key={mv.id} microVisual={mv} currentTime={currentTime} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface MicroVisualItemProps {
  microVisual: V7MicroVisual;
  currentTime: number;
}

const MicroVisualItem: React.FC<MicroVisualItemProps> = ({ microVisual, currentTime }) => {
  const position = microVisual.content.position || 'center';
  const variants = animationVariants[microVisual.type] || animationVariants.text;

  // Calculate progress within this micro-visual's lifetime
  const progress = (currentTime - microVisual.triggerTime) / microVisual.duration;

  const renderContent = () => {
    switch (microVisual.type) {
      case 'icon':
        return (
          <div
            className="flex flex-col items-center gap-2"
            style={{ color: microVisual.content.color || '#22D3EE' }}
          >
            <span className="text-6xl md:text-8xl drop-shadow-[0_0_20px_currentColor]">
              {microVisual.content.icon || '✨'}
            </span>
            {microVisual.content.description && (
              <span className="text-lg md:text-xl font-medium text-white/90 text-center max-w-xs">
                {microVisual.content.description}
              </span>
            )}
          </div>
        );

      case 'text':
        return (
          <div
            className="px-6 py-4 rounded-xl backdrop-blur-md border border-white/20"
            style={{
              backgroundColor: `${microVisual.content.color || '#22D3EE'}20`,
              boxShadow: `0 0 30px ${microVisual.content.color || '#22D3EE'}40`
            }}
          >
            <p className="text-2xl md:text-4xl font-bold text-white text-center">
              {microVisual.content.value}
            </p>
            {microVisual.content.description && (
              <p className="text-sm md:text-base text-white/70 text-center mt-2">
                {microVisual.content.description}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="flex flex-col items-center">
            <span
              className="text-7xl md:text-9xl font-black"
              style={{
                color: microVisual.content.color || '#22D3EE',
                textShadow: `0 0 40px ${microVisual.content.color || '#22D3EE'}80`
              }}
            >
              {microVisual.content.value}
            </span>
            {microVisual.content.description && (
              <span className="text-xl md:text-2xl text-white/80 mt-2">
                {microVisual.content.description}
              </span>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="relative">
            <div
              className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2"
              style={{ borderColor: microVisual.content.color || '#22D3EE' }}
            >
              {/* Placeholder for image - could be extended to load actual images */}
              <div
                className="w-full h-full flex items-center justify-center text-6xl"
                style={{ backgroundColor: `${microVisual.content.color || '#22D3EE'}20` }}
              >
                {microVisual.content.icon || '📷'}
              </div>
            </div>
            {microVisual.content.description && (
              <p className="text-center text-white/90 mt-3 text-lg">
                {microVisual.content.description}
              </p>
            )}
          </div>
        );

      case 'badge':
        return (
          <div
            className="px-6 py-3 rounded-full flex items-center gap-3"
            style={{
              backgroundColor: microVisual.content.color || '#22D3EE',
              boxShadow: `0 0 25px ${microVisual.content.color || '#22D3EE'}60`
            }}
          >
            {microVisual.content.icon && (
              <span className="text-2xl">{microVisual.content.icon}</span>
            )}
            <span className="text-lg md:text-xl font-bold text-black">
              {microVisual.content.value}
            </span>
          </div>
        );

      case 'highlight':
        return (
          <div
            className="px-8 py-4 rounded-lg border-2"
            style={{
              borderColor: microVisual.content.color || '#22D3EE',
              backgroundColor: `${microVisual.content.color || '#22D3EE'}10`
            }}
          >
            <span
              className="text-2xl md:text-3xl font-bold"
              style={{ color: microVisual.content.color || '#22D3EE' }}
            >
              {microVisual.content.value}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      key={microVisual.id}
      className="absolute"
      style={positionStyles[position]}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      {renderContent()}
    </motion.div>
  );
};

export default V7MicroVisualOverlay;
