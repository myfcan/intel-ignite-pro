// src/components/lessons/v7/OptimizedParticlesBackground.tsx
// Performance-optimized particles background with adaptive quality

import { useEffect, useRef, useCallback, memo } from 'react';
import { isLowEndDevice } from '@/hooks/useV7Performance';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface OptimizedParticlesBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  colorScheme?: 'blue' | 'purple' | 'cyan' | 'warm';
  interactive?: boolean;
  speed?: number;
  connected?: boolean;
  className?: string;
  reducedMotion?: boolean;
  isVisible?: boolean;
}

const COLOR_SCHEMES = {
  blue: ['#3b82f6', '#60a5fa', '#93c5fd'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
  cyan: ['#06b6d4', '#22d3ee', '#67e8f9'],
  warm: ['#f59e0b', '#fbbf24', '#fcd34d'],
};

// Memoized component to prevent unnecessary re-renders
export const OptimizedParticlesBackground = memo(({
  intensity = 'medium',
  colorScheme = 'purple',
  interactive = false, // Disabled by default for performance
  speed = 0.5,
  connected = false, // Disabled by default - expensive operation
  className = '',
  reducedMotion = false,
  isVisible = true,
}: OptimizedParticlesBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const isLowEnd = useRef(isLowEndDevice());
  const lastFrameTimeRef = useRef(0);
  const targetFPS = isLowEnd.current ? 30 : 60;
  const frameInterval = 1000 / targetFPS;

  // Get optimized particle count
  const getParticleCount = useCallback(() => {
    if (reducedMotion) return 0;
    if (isLowEnd.current) {
      return intensity === 'low' ? 15 : intensity === 'medium' ? 25 : 35;
    }
    
    const baseCount = typeof window !== 'undefined' 
      ? Math.min(window.innerWidth, 1920) / 20 
      : 60;
    
    switch (intensity) {
      case 'low': return Math.floor(baseCount * 0.4);
      case 'high': return Math.floor(baseCount * 1.2);
      default: return Math.floor(baseCount * 0.7);
    }
  }, [intensity, reducedMotion]);

  // Create particle
  const createParticle = useCallback((width: number, height: number): Particle => {
    const colors = COLOR_SCHEMES[colorScheme];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed * 0.3,
      vy: (Math.random() - 0.5) * speed * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.4 + 0.1,
    };
  }, [colorScheme, speed]);

  // Initialize particles
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const count = getParticleCount();
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width, canvas.height)
    );
  }, [getParticleCount, createParticle]);

  // Optimized animation loop with frame limiting
  const animate = useCallback((timestamp: number) => {
    if (!isVisible || reducedMotion) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Frame rate limiting
    const elapsed = timestamp - lastFrameTimeRef.current;
    if (elapsed < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    // Draw connections (only if enabled and not low-end)
    if (connected && !isLowEnd.current && particles.length < 50) {
      const maxDistance = 80;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i += 2) { // Skip every other particle
        for (let j = i + 2; j < particles.length; j += 2) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistance * maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // Update and draw particles
    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary wrap (more efficient than bounce)
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Draw simple particle (no glow for performance)
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.alpha;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    animationRef.current = requestAnimationFrame(animate);
  }, [isVisible, reducedMotion, frameInterval, connected]);

  // Setup effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Use device pixel ratio for crisp rendering, but limit for performance
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        
        initParticles();
      }
    };

    // Debounced resize
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    handleResize();
    window.addEventListener('resize', debouncedResize);
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, initParticles]);

  // Pause when not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      } else if (!document.hidden) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [animate]);

  if (reducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ background: 'transparent' }}
      aria-hidden="true"
    />
  );
});

OptimizedParticlesBackground.displayName = 'OptimizedParticlesBackground';
