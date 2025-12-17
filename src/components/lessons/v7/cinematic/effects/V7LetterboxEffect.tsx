// V7 Letterbox Effect - Cinematic aspect ratio overlay (Netflix Bandersnatch-inspired)
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface V7LetterboxEffectProps {
  children: ReactNode;
  aspectRatio?: 'cinematic' | 'ultrawide' | 'standard';
  backgroundColor?: string;
  animate?: boolean;
  className?: string;
}

export const V7LetterboxEffect = ({
  children,
  aspectRatio = 'cinematic',
  backgroundColor = 'black',
  animate = true,
  className = '',
}: V7LetterboxEffectProps) => {
  // Aspect ratio heights (as percentage of screen height to crop)
  const aspectHeights = {
    cinematic: '12%', // 2.39:1 (like movies)
    ultrawide: '8%', // 21:9
    standard: '0%', // 16:9 (no letterbox)
  };

  const barHeight = aspectHeights[aspectRatio];

  const barVariants = animate
    ? {
        initial: { scaleY: 0 },
        animate: { scaleY: 1 },
        exit: { scaleY: 0 },
      }
    : {};

  const transition = {
    duration: 0.6,
    ease: [0.83, 0, 0.17, 1], // Cinematic easing
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Top bar */}
      {aspectRatio !== 'standard' && (
        <motion.div
          className="absolute top-0 left-0 right-0 z-40 origin-top"
          style={{
            height: barHeight,
            backgroundColor,
          }}
          {...(animate ? barVariants : {})}
          transition={transition}
        />
      )}

      {/* Content */}
      <div className="relative w-full h-full">{children}</div>

      {/* Bottom bar */}
      {aspectRatio !== 'standard' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-40 origin-bottom"
          style={{
            height: barHeight,
            backgroundColor,
          }}
          {...(animate ? barVariants : {})}
          transition={transition}
        />
      )}
    </div>
  );
};

// Preset: Cinematic letterbox with fade animation
export const V7CinematicLetterbox = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <V7LetterboxEffect aspectRatio="cinematic" animate={true} className={className}>
    {children}
  </V7LetterboxEffect>
);

// Preset: Ultrawide letterbox
export const V7UltrawideLetterbox = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <V7LetterboxEffect aspectRatio="ultrawide" animate={true} className={className}>
    {children}
  </V7LetterboxEffect>
);
