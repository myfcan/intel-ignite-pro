// src/components/lessons/v7/V7CameraEffects.tsx
// Advanced camera effects: zoom, pan, dolly, shake, rotate

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

export type CameraEffectType = 
  | 'zoom-in' 
  | 'zoom-out' 
  | 'pan-left' 
  | 'pan-right' 
  | 'pan-up' 
  | 'pan-down'
  | 'dolly-in'
  | 'dolly-out'
  | 'shake'
  | 'rotate'
  | 'focus'
  | 'blur-focus'
  | 'ken-burns'
  | 'parallax'
  | 'none';

export interface CameraEffect {
  type: CameraEffectType;
  duration: number; // in seconds
  intensity?: number; // 0-1, strength of the effect
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  focusPoint?: { x: number; y: number }; // for zoom/focus effects (0-1 percentage)
}

interface V7CameraEffectsProps {
  children: ReactNode;
  effect: CameraEffect;
  isActive: boolean;
  className?: string;
  onComplete?: () => void;
}

// Spring configs for different effects
const springConfigs = {
  gentle: { stiffness: 100, damping: 30 },
  snappy: { stiffness: 300, damping: 25 },
  smooth: { stiffness: 50, damping: 20 },
  shake: { stiffness: 1000, damping: 5 },
};

export const V7CameraEffects = ({
  children,
  effect,
  isActive,
  className = '',
  onComplete,
}: V7CameraEffectsProps) => {
  const { type, duration, intensity = 0.5, delay = 0, easing = 'ease-in-out', focusPoint = { x: 0.5, y: 0.5 } } = effect;

  // Motion values for smooth animations
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const blur = useMotionValue(0);

  // Spring-based values for natural motion
  const springScale = useSpring(scale, springConfigs.gentle);
  const springX = useSpring(x, springConfigs.smooth);
  const springY = useSpring(y, springConfigs.smooth);
  const springRotate = useSpring(rotate, springConfigs.gentle);
  const springBlur = useSpring(blur, springConfigs.gentle);

  // Transform origin based on focus point
  const transformOrigin = `${focusPoint.x * 100}% ${focusPoint.y * 100}%`;

  // Calculate effect values based on intensity
  const getEffectValues = useCallback(() => {
    const baseZoom = 1 + (intensity * 0.3); // 1.0 to 1.3
    const basePan = intensity * 100; // 0 to 100px
    const baseRotate = intensity * 10; // 0 to 10 degrees
    const baseBlur = intensity * 10; // 0 to 10px

    switch (type) {
      case 'zoom-in':
        return { scale: baseZoom, x: 0, y: 0, rotate: 0, blur: 0 };
      case 'zoom-out':
        return { scale: 1 / baseZoom, x: 0, y: 0, rotate: 0, blur: 0 };
      case 'pan-left':
        return { scale: 1, x: -basePan, y: 0, rotate: 0, blur: 0 };
      case 'pan-right':
        return { scale: 1, x: basePan, y: 0, rotate: 0, blur: 0 };
      case 'pan-up':
        return { scale: 1, x: 0, y: -basePan, rotate: 0, blur: 0 };
      case 'pan-down':
        return { scale: 1, x: 0, y: basePan, rotate: 0, blur: 0 };
      case 'dolly-in':
        return { scale: baseZoom * 1.2, x: 0, y: 0, rotate: 0, blur: 0 };
      case 'dolly-out':
        return { scale: 1 / (baseZoom * 1.2), x: 0, y: 0, rotate: 0, blur: 0 };
      case 'shake':
        return { scale: 1, x: 0, y: 0, rotate: 0, blur: 0 }; // Handled separately
      case 'rotate':
        return { scale: 1, x: 0, y: 0, rotate: baseRotate, blur: 0 };
      case 'focus':
        return { scale: 1.05, x: 0, y: 0, rotate: 0, blur: 0 };
      case 'blur-focus':
        return { scale: 1, x: 0, y: 0, rotate: 0, blur: baseBlur };
      case 'ken-burns':
        return { scale: baseZoom, x: basePan * 0.3, y: basePan * 0.2, rotate: baseRotate * 0.3, blur: 0 };
      case 'parallax':
        return { scale: 1, x: basePan * 0.5, y: basePan * 0.3, rotate: 0, blur: 0 };
      default:
        return { scale: 1, x: 0, y: 0, rotate: 0, blur: 0 };
    }
  }, [type, intensity]);

  // Apply effects when active
  useEffect(() => {
    if (!isActive || type === 'none') {
      scale.set(1);
      x.set(0);
      y.set(0);
      rotate.set(0);
      blur.set(0);
      return;
    }

    const values = getEffectValues();

    // Apply with delay
    const timeoutId = setTimeout(() => {
      scale.set(values.scale);
      x.set(values.x);
      y.set(values.y);
      rotate.set(values.rotate);
      blur.set(values.blur);

      // Trigger onComplete after duration
      if (onComplete) {
        setTimeout(onComplete, duration * 1000);
      }
    }, delay * 1000);

    return () => clearTimeout(timeoutId);
  }, [isActive, type, getEffectValues, delay, duration, onComplete, scale, x, y, rotate, blur]);

  // Shake effect with oscillation
  useEffect(() => {
    if (!isActive || type !== 'shake') return;

    const shakeIntensity = intensity * 10;
    let animationFrame: number;
    let startTime = Date.now();

    const shake = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      if (elapsed < duration) {
        const decay = 1 - (elapsed / duration);
        const offsetX = (Math.random() - 0.5) * shakeIntensity * decay;
        const offsetY = (Math.random() - 0.5) * shakeIntensity * decay;
        const offsetRotate = (Math.random() - 0.5) * (shakeIntensity * 0.2) * decay;

        x.set(offsetX);
        y.set(offsetY);
        rotate.set(offsetRotate);

        animationFrame = requestAnimationFrame(shake);
      } else {
        x.set(0);
        y.set(0);
        rotate.set(0);
        if (onComplete) onComplete();
      }
    };

    const timeoutId = setTimeout(() => {
      shake();
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isActive, type, intensity, duration, delay, onComplete, x, y, rotate]);

  // Ken Burns continuous movement
  useEffect(() => {
    if (!isActive || type !== 'ken-burns') return;

    const values = getEffectValues();
    
    // Start position
    scale.set(1);
    x.set(-values.x);
    y.set(-values.y);
    rotate.set(-values.rotate);

    // End position with delay
    const timeoutId = setTimeout(() => {
      scale.set(values.scale);
      x.set(values.x);
      y.set(values.y);
      rotate.set(values.rotate);
    }, delay * 1000 + 100);

    return () => clearTimeout(timeoutId);
  }, [isActive, type, getEffectValues, delay, scale, x, y, rotate]);

  // Filter transform
  const filterBlur = useTransform(springBlur, (v) => `blur(${v}px)`);

  // Map easing to Framer Motion format
  const easingMap: Record<string, string> = {
    'linear': 'linear',
    'ease-in': 'easeIn',
    'ease-out': 'easeOut',
    'ease-in-out': 'easeInOut',
  };

  const motionEasing = easing === 'spring' ? undefined : (easingMap[easing] || 'easeInOut');

  return (
    <motion.div
      className={`v7-camera-effects relative overflow-hidden ${className}`}
      style={{
        scale: springScale,
        x: springX,
        y: springY,
        rotate: springRotate,
        filter: filterBlur,
        transformOrigin,
        willChange: 'transform, filter',
      }}
      transition={{
        type: easing === 'spring' ? 'spring' : 'tween',
        duration: easing === 'spring' ? undefined : duration,
        ease: motionEasing as any,
        ...( easing === 'spring' ? springConfigs.gentle : {}),
      }}
    >
      {children}
    </motion.div>
  );
};

// Preset camera movements for common cinematic scenarios
export const CameraPresets = {
  // Dramatic reveal
  dramaticZoomIn: {
    type: 'zoom-in' as CameraEffectType,
    duration: 2,
    intensity: 0.7,
    easing: 'ease-out' as const,
  },

  // Slow pan across scene
  slowPanRight: {
    type: 'pan-right' as CameraEffectType,
    duration: 4,
    intensity: 0.4,
    easing: 'linear' as const,
  },

  // Ken Burns documentary style
  kenBurns: {
    type: 'ken-burns' as CameraEffectType,
    duration: 8,
    intensity: 0.3,
    easing: 'linear' as const,
  },

  // Impact shake
  impactShake: {
    type: 'shake' as CameraEffectType,
    duration: 0.5,
    intensity: 0.6,
    easing: 'linear' as const,
  },

  // Subtle focus
  subtleFocus: {
    type: 'focus' as CameraEffectType,
    duration: 1.5,
    intensity: 0.3,
    easing: 'ease-in-out' as const,
    focusPoint: { x: 0.5, y: 0.4 },
  },

  // Dolly reveal
  dollyReveal: {
    type: 'dolly-in' as CameraEffectType,
    duration: 3,
    intensity: 0.5,
    easing: 'ease-out' as const,
  },

  // Blur focus transition
  blurTransition: {
    type: 'blur-focus' as CameraEffectType,
    duration: 1,
    intensity: 0.8,
    easing: 'ease-in-out' as const,
  },
};

// Hook for managing camera effects in a sequence
export const useCameraSequence = (initialEffects: CameraEffect[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentEffect = initialEffects[currentIndex] || { type: 'none' as CameraEffectType, duration: 0 };

  const start = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, []);

  const next = useCallback(() => {
    if (currentIndex < initialEffects.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, initialEffects.length]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  return {
    currentEffect,
    isPlaying,
    currentIndex,
    start,
    next,
    stop,
  };
};

// Layered parallax camera effect
interface ParallaxLayerProps {
  children: ReactNode;
  depth: number; // 0 = background (slowest), 1 = foreground (fastest)
  mouseX: number; // 0-1
  mouseY: number; // 0-1
  intensity?: number;
}

export const ParallaxLayer = ({
  children,
  depth,
  mouseX,
  mouseY,
  intensity = 20,
}: ParallaxLayerProps) => {
  const offsetX = (mouseX - 0.5) * intensity * depth;
  const offsetY = (mouseY - 0.5) * intensity * depth;

  return (
    <motion.div
      style={{
        x: offsetX,
        y: offsetY,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
};
