// V7 Particle System - Confetti, Sparks, and Explosion Effects
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
}

interface V7ParticleSystemProps {
  type: 'confetti' | 'sparks' | 'glow';
  trigger?: boolean;
  colors?: string[];
  count?: number;
  duration?: number;
  spread?: number;
  gravity?: number;
  velocity?: number;
  className?: string;
}

export const V7ParticleSystem = ({
  type,
  trigger = true,
  colors = ['#22D3EE', '#A855F7', '#EC4899', '#F59E0B'],
  count = 50,
  duration = 3000,
  spread = 360,
  gravity = 0.8,
  velocity = 40,
  className = '',
}: V7ParticleSystemProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    particlesRef.current = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
      const speed = Math.random() * velocity + velocity / 2;

      particlesRef.current.push({
        id: i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: type === 'confetti' ? Math.random() * 8 + 4 : Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        life: 1,
      });
    }

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += gravity; // Apply gravity
        particle.rotation += particle.rotationSpeed;

        // Fade out
        particle.life = 1 - progress;

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.life;

        if (type === 'confetti') {
          // Rectangle confetti
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 1.5);
        } else if (type === 'sparks') {
          // Circular sparks
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();

          // Add glow
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        } else if (type === 'glow') {
          // Glow particles (larger, slower)
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 3);
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trigger, type, colors, count, duration, spread, gravity, velocity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      style={{ mixBlendMode: type === 'glow' ? 'screen' : 'normal' }}
    />
  );
};

// Confetti preset
export const V7Confetti = ({ trigger = true }: { trigger?: boolean }) => (
  <V7ParticleSystem
    type="confetti"
    trigger={trigger}
    colors={['#22D3EE', '#A855F7', '#EC4899', '#F59E0B', '#10B981']}
    count={50}
    duration={3000}
    spread={360}
    gravity={0.8}
    velocity={40}
  />
);

// Sparks preset
export const V7Sparks = ({ trigger = true }: { trigger?: boolean }) => (
  <V7ParticleSystem
    type="sparks"
    trigger={trigger}
    colors={['#22D3EE', '#06B6D4']}
    count={20}
    duration={1500}
    spread={180}
    gravity={0.3}
    velocity={40}
  />
);

// Glow preset
export const V7Glow = ({ trigger = true, color = '#22D3EE' }: { trigger?: boolean; color?: string }) => (
  <V7ParticleSystem
    type="glow"
    trigger={trigger}
    colors={[color]}
    count={10}
    duration={2000}
    spread={360}
    gravity={0.1}
    velocity={20}
  />
);
