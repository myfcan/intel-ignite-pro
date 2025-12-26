// V7TransitionParticles - Burst particle effect for phase transitions
// Creates dramatic particle explosion effect between phases

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface V7TransitionParticlesProps {
  isActive: boolean;
  color?: 'cyan' | 'gold' | 'emerald' | 'purple';
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  angle: number;
  distance: number;
  opacity: number;
}

const colorMap = {
  cyan: { primary: '#00d9a6', secondary: '#22D3EE', glow: 'rgba(0, 217, 166, 0.6)' },
  gold: { primary: '#FFD700', secondary: '#FFA500', glow: 'rgba(255, 215, 0, 0.6)' },
  emerald: { primary: '#10B981', secondary: '#34D399', glow: 'rgba(16, 185, 129, 0.6)' },
  purple: { primary: '#A855F7', secondary: '#C084FC', glow: 'rgba(168, 85, 247, 0.6)' },
};

export const V7TransitionParticles = ({
  isActive,
  color = 'cyan',
  particleCount = 40,
}: V7TransitionParticlesProps) => {
  const colors = colorMap[color];

  // Generate particles with random properties
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20, // Start near center
      y: 50 + (Math.random() - 0.5) * 20,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.3,
      duration: Math.random() * 0.8 + 0.6,
      angle: Math.random() * 360,
      distance: Math.random() * 60 + 40,
      opacity: Math.random() * 0.5 + 0.5,
    }));
  }, [particleCount]);

  // Generate sparkles (smaller, faster particles)
  const sparkles = useMemo<Particle[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 100,
      x: 50 + (Math.random() - 0.5) * 10,
      y: 50 + (Math.random() - 0.5) * 10,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 0.2,
      duration: Math.random() * 0.5 + 0.3,
      angle: Math.random() * 360,
      distance: Math.random() * 80 + 50,
      opacity: 1,
    }));
  }, []);

  if (!isActive) return null;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Central glow burst */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Main particles */}
      {particles.map((particle) => {
        const endX = particle.x + Math.cos((particle.angle * Math.PI) / 180) * particle.distance;
        const endY = particle.y + Math.sin((particle.angle * Math.PI) / 180) * particle.distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 ${particle.size * 2}px ${colors.glow}`,
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: `${(endX - particle.x) * 10}px`,
              y: `${(endY - particle.y) * 10}px`,
              scale: [0, 1.5, 0],
              opacity: [0, particle.opacity, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}

      {/* Sparkles */}
      {sparkles.map((sparkle) => {
        const endX = sparkle.x + Math.cos((sparkle.angle * Math.PI) / 180) * sparkle.distance;
        const endY = sparkle.y + Math.sin((sparkle.angle * Math.PI) / 180) * sparkle.distance;

        return (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{
              width: sparkle.size,
              height: sparkle.size,
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              background: '#fff',
              borderRadius: '50%',
              boxShadow: `0 0 ${sparkle.size * 3}px #fff`,
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: `${(endX - sparkle.x) * 12}px`,
              y: `${(endY - sparkle.y) * 12}px`,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}

      {/* Ring expansion */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          width: 100,
          height: 100,
          borderColor: colors.primary,
          boxShadow: `0 0 30px ${colors.glow}, inset 0 0 30px ${colors.glow}`,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 6, opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
      />

      {/* Second ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          width: 80,
          height: 80,
          borderColor: colors.secondary,
          boxShadow: `0 0 20px ${colors.glow}`,
        }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 5, opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />
    </motion.div>
  );
};

export default V7TransitionParticles;
