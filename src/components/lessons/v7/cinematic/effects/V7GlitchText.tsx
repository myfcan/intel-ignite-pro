// V7 Glitch Effect - Digital glitch animation for dramatic reveals
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface V7GlitchTextProps {
  children: ReactNode;
  intensity?: number; // 1-10
  duration?: number;
  repeat?: number;
  className?: string;
}

export const V7GlitchText = ({
  children,
  intensity = 5,
  duration = 0.2,
  repeat = 3,
  className = '',
}: V7GlitchTextProps) => {
  const glitchDistance = intensity * 2;

  return (
    <div className={`relative ${className}`}>
      {/* Main text */}
      <motion.div
        className="relative z-10"
        animate={{
          x: [0, -glitchDistance, glitchDistance, -glitchDistance, 0],
          y: [0, glitchDistance, -glitchDistance, glitchDistance, 0],
        }}
        transition={{
          duration: duration * repeat,
          repeat: repeat,
          ease: 'linear',
        }}
      >
        {children}
      </motion.div>

      {/* Red glitch layer */}
      <motion.div
        className="absolute top-0 left-0 z-0 text-red-500 mix-blend-screen"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}
        animate={{
          x: [-glitchDistance, glitchDistance, -glitchDistance, glitchDistance, 0],
          opacity: [0.8, 0, 0.8, 0, 0.8],
        }}
        transition={{
          duration: duration * repeat,
          repeat: repeat,
          ease: 'linear',
        }}
      >
        {children}
      </motion.div>

      {/* Cyan glitch layer */}
      <motion.div
        className="absolute top-0 left-0 z-0 text-cyan-500 mix-blend-screen"
        style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)' }}
        animate={{
          x: [glitchDistance, -glitchDistance, glitchDistance, -glitchDistance, 0],
          opacity: [0, 0.8, 0, 0.8, 0.8],
        }}
        transition={{
          duration: duration * repeat,
          repeat: repeat,
          ease: 'linear',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Preset: Intense glitch for dramatic moments
export const V7IntenseGlitch = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <V7GlitchText intensity={8} duration={0.15} repeat={5} className={className}>
    {children}
  </V7GlitchText>
);

// Preset: Subtle glitch for titles
export const V7SubtleGlitch = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <V7GlitchText intensity={3} duration={0.2} repeat={2} className={className}>
    {children}
  </V7GlitchText>
);
