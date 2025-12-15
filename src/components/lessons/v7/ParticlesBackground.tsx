// src/components/lessons/v7/ParticlesBackground.tsx
// Advanced animated particles background for V7 cinematic lessons

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  targetAlpha: number;
  pulse: number;
  pulseSpeed: number;
}

interface ParticlesBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  colorScheme?: 'blue' | 'purple' | 'cyan' | 'warm' | 'rainbow';
  interactive?: boolean;
  speed?: number;
  connected?: boolean;
  className?: string;
}

const COLOR_SCHEMES = {
  blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#6d28d9'],
  cyan: ['#06b6d4', '#22d3ee', '#67e8f9', '#0891b2'],
  warm: ['#f59e0b', '#fbbf24', '#fcd34d', '#d97706'],
  rainbow: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'],
};

export const ParticlesBackground = ({
  intensity = 'medium',
  colorScheme = 'purple',
  interactive = true,
  speed = 1,
  connected = true,
  className = '',
}: ParticlesBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  const getParticleCount = useCallback(() => {
    const base = typeof window !== 'undefined' ? Math.min(window.innerWidth, 1920) / 15 : 80;
    switch (intensity) {
      case 'low': return Math.floor(base * 0.5);
      case 'high': return Math.floor(base * 1.5);
      default: return Math.floor(base);
    }
  }, [intensity]);

  const createParticle = useCallback((width: number, height: number): Particle => {
    const colors = COLOR_SCHEMES[colorScheme];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed * 0.5,
      vy: (Math.random() - 0.5) * speed * 0.5,
      radius: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
      targetAlpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    };
  }, [colorScheme, speed]);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const count = getParticleCount();
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width, canvas.height)
    );
  }, [getParticleCount, createParticle]);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    const maxDistance = 120;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    // Draw connections first (behind particles)
    if (connected) {
      drawConnections(ctx, particles);
    }

    // Update and draw particles
    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx * speed;
      particle.y += particle.vy * speed;

      // Pulse effect
      particle.pulse += particle.pulseSpeed;
      const pulseFactor = Math.sin(particle.pulse) * 0.3 + 1;

      // Interactive mouse effect
      if (interactive && mouse.x > 0 && mouse.y > 0) {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;

        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          particle.vx -= (dx / distance) * force * 0.02;
          particle.vy -= (dy / distance) * force * 0.02;
          particle.targetAlpha = Math.min(1, particle.alpha + force * 0.5);
        } else {
          particle.targetAlpha = particle.alpha;
        }
      }

      // Smooth alpha transition
      particle.alpha += (particle.targetAlpha - particle.alpha) * 0.05;

      // Boundary bounce with dampening
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -0.8;
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy *= -0.8;
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
      }

      // Apply friction
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Add slight random movement
      particle.vx += (Math.random() - 0.5) * 0.01;
      particle.vy += (Math.random() - 0.5) * 0.01;

      // Draw particle with glow
      const radius = particle.radius * pulseFactor;
      
      // Glow effect
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, radius * 3
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.5, `${particle.color}40`);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.globalAlpha = particle.alpha * 0.3;
      ctx.fill();

      // Core particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.alpha;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    animationRef.current = requestAnimationFrame(animate);
  }, [speed, interactive, connected, drawConnections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
          initParticles();
        }
      }, 100);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    // Initial setup
    handleResize();

    window.addEventListener('resize', handleResize);
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [animate, initParticles, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ background: 'transparent' }}
    />
  );
};
