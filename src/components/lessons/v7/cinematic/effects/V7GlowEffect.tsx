// V7 Glow Effect - Animated glow and pulse effects for emphasis
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface V7GlowEffectProps {
  children: ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  pulse?: boolean;
  className?: string;
}

export const V7GlowEffect = ({
  children,
  color = '#22D3EE',
  intensity = 'medium',
  pulse = false,
  className = '',
}: V7GlowEffectProps) => {
  const intensityMap = {
    low: { blur: 10, spread: 5, opacity: 0.3 },
    medium: { blur: 20, spread: 10, opacity: 0.5 },
    high: { blur: 30, spread: 15, opacity: 0.7 },
  };

  const { blur, spread, opacity } = intensityMap[intensity];

  const pulseAnimation = pulse
    ? {
        filter: [
          `drop-shadow(0 0 ${blur}px ${color}) drop-shadow(0 0 ${spread}px ${color})`,
          `drop-shadow(0 0 ${blur * 1.5}px ${color}) drop-shadow(0 0 ${spread * 1.5}px ${color})`,
          `drop-shadow(0 0 ${blur}px ${color}) drop-shadow(0 0 ${spread}px ${color})`,
        ],
        opacity: [opacity, opacity * 1.2, opacity],
      }
    : {
        filter: `drop-shadow(0 0 ${blur}px ${color}) drop-shadow(0 0 ${spread}px ${color})`,
        opacity,
      };

  const transition = pulse
    ? {
        duration: 2,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
      }
    : {};

  return (
    <motion.div
      className={`relative ${className}`}
      animate={pulseAnimation}
      transition={transition}
      style={{
        filter: `drop-shadow(0 0 ${blur}px ${color}) drop-shadow(0 0 ${spread}px ${color})`,
      }}
    >
      {children}
    </motion.div>
  );
};

// Preset: Cyan glow (default V7 brand color)
export const V7CyanGlow = ({
  children,
  pulse = false,
  className = '',
}: {
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) => (
  <V7GlowEffect color="#22D3EE" intensity="medium" pulse={pulse} className={className}>
    {children}
  </V7GlowEffect>
);

// Preset: Purple dramatic glow
export const V7PurpleGlow = ({
  children,
  pulse = false,
  className = '',
}: {
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) => (
  <V7GlowEffect color="#A855F7" intensity="high" pulse={pulse} className={className}>
    {children}
  </V7GlowEffect>
);

// Preset: Success green glow
export const V7SuccessGlow = ({
  children,
  pulse = false,
  className = '',
}: {
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) => (
  <V7GlowEffect color="#10B981" intensity="medium" pulse={pulse} className={className}>
    {children}
  </V7GlowEffect>
);

// Preset: Danger red glow
export const V7DangerGlow = ({
  children,
  pulse = true,
  className = '',
}: {
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) => (
  <V7GlowEffect color="#EF4444" intensity="high" pulse={pulse} className={className}>
    {children}
  </V7GlowEffect>
);
