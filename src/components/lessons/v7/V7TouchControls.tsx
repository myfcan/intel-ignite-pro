// src/components/lessons/v7/V7TouchControls.tsx
// Touch controls for mobile navigation with swipe gestures

import { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface TouchControlsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
  onDoubleTap: () => void;
  isPlaying: boolean;
  currentActIndex: number;
  totalActs: number;
  children: React.ReactNode;
}

interface SwipeIndicatorProps {
  direction: 'left' | 'right';
  visible: boolean;
}

const SwipeIndicator = ({ direction, visible }: SwipeIndicatorProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
        className={`absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none
          ${direction === 'left' ? 'left-4' : 'right-4'}`}
        aria-hidden="true"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-full p-4">
          {direction === 'left' ? (
            <ChevronLeft className="w-8 h-8 text-white" />
          ) : (
            <ChevronRight className="w-8 h-8 text-white" />
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const PlayPauseIndicator = ({ isPlaying }: { isPlaying: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
    aria-hidden="true"
  >
    <div className="bg-black/50 backdrop-blur-md rounded-full p-6">
      {isPlaying ? (
        <Play className="w-12 h-12 text-white" fill="white" />
      ) : (
        <Pause className="w-12 h-12 text-white" fill="white" />
      )}
    </div>
  </motion.div>
);

export const V7TouchControls = ({
  onSwipeLeft,
  onSwipeRight,
  onTap,
  onDoubleTap,
  isPlaying,
  currentActIndex,
  totalActs,
  children,
}: TouchControlsProps) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // SWIPE THRESHOLD
  // ============================================================================
  
  const SWIPE_THRESHOLD = 80;
  const DOUBLE_TAP_DELAY = 300;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Show visual feedback during drag
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD / 2) {
      setSwipeDirection(info.offset.x > 0 ? 'left' : 'right');
    } else {
      setSwipeDirection(null);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      setSwipeDirection(null);

      const { offset, velocity } = info;

      // Check for swipe gesture
      if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
        if (offset.x > 0) {
          // Swipe right - go to previous act
          if (currentActIndex > 0) {
            onSwipeRight();
          }
        } else {
          // Swipe left - go to next act
          if (currentActIndex < totalActs - 1) {
            onSwipeLeft();
          }
        }
      }
    },
    [currentActIndex, totalActs, onSwipeLeft, onSwipeRight]
  );

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }

    if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      onDoubleTap();
      lastTapRef.current = 0;
    } else {
      // Single tap - wait to see if it's a double tap
      tapTimeoutRef.current = setTimeout(() => {
        onTap();
        setShowPlayPauseIndicator(true);
        setTimeout(() => setShowPlayPauseIndicator(false), 800);
      }, DOUBLE_TAP_DELAY);
      lastTapRef.current = now;
    }
  }, [onTap, onDoubleTap]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      ref={containerRef}
      className="v7-touch-controls relative w-full h-full touch-pan-y"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      role="region"
      aria-label="Área de controle por toque. Deslize para navegar entre atos, toque para pausar/reproduzir."
      tabIndex={0}
    >
      {/* Content */}
      {children}

      {/* Swipe indicators */}
      <SwipeIndicator direction="left" visible={swipeDirection === 'left' && currentActIndex > 0} />
      <SwipeIndicator direction="right" visible={swipeDirection === 'right' && currentActIndex < totalActs - 1} />

      {/* Play/Pause indicator on tap */}
      <AnimatePresence>
        {showPlayPauseIndicator && <PlayPauseIndicator isPlaying={isPlaying} />}
      </AnimatePresence>

      {/* Progress dots for mobile */}
      <div 
        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-40 sm:hidden"
        role="navigation"
        aria-label={`Ato ${currentActIndex + 1} de ${totalActs}`}
      >
        {Array.from({ length: totalActs }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentActIndex
                ? 'bg-white w-6'
                : index < currentActIndex
                ? 'bg-white/60'
                : 'bg-white/30'
            }`}
            aria-current={index === currentActIndex ? 'step' : undefined}
            aria-label={`Ato ${index + 1}`}
          />
        ))}
      </div>

      {/* Touch hint for first-time users */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center text-white/50 text-xs sm:hidden pointer-events-none">
        <p>Deslize para navegar • Toque para pausar</p>
      </div>
    </motion.div>
  );
};

// ============================================================================
// HOOK: useSwipeNavigation
// ============================================================================

interface UseSwipeNavigationOptions {
  onNext: () => void;
  onPrevious: () => void;
  enabled?: boolean;
}

export const useSwipeNavigation = ({
  onNext,
  onPrevious,
  enabled = true,
}: UseSwipeNavigationOptions) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          onPrevious();
        } else {
          onNext();
        }
      }

      touchStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onNext, onPrevious]);

  return containerRef;
};
