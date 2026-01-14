import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface V7MethodRevealGlowProps {
  enabled: boolean;
  intensity?: number;
}

/**
 * V7MethodRevealGlow - Subtle, elegant glow effect for "MÉTODO PERFEITO" revelation
 * Features:
 * - Soft golden/amber radial glow from center
 * - Floating golden particles (sparse, elegant)
 * - Subtle light rays
 * - Breathing ambient light
 */
export const V7MethodRevealGlow: React.FC<V7MethodRevealGlowProps> = ({
  enabled,
  intensity = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<GoldenParticle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!enabled || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize golden particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        particlesRef.current.push(createGoldenParticle(canvas.width, canvas.height));
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      
      timeRef.current += 0.016;
      const time = timeRef.current;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw subtle radial glow
      drawRadialGlow(ctx, centerX, centerY, canvas.width, canvas.height, time, intensity);

      // Draw subtle light rays
      drawLightRays(ctx, centerX, centerY, canvas.width, canvas.height, time, intensity);

      // Update and draw golden particles
      particlesRef.current.forEach(particle => {
        updateGoldenParticle(particle, canvas.width, canvas.height, time);
        drawGoldenParticle(ctx, particle, intensity);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, intensity]);

  return (
    <AnimatePresence>
      {enabled && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* CSS Ambient glow overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: `radial-gradient(ellipse at center, 
                rgba(255, 200, 100, 0.08) 0%, 
                rgba(255, 170, 50, 0.04) 30%, 
                rgba(200, 150, 50, 0.02) 50%, 
                transparent 70%
              )`,
            }}
          />

          {/* Subtle vignette for focus */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, 
                transparent 40%, 
                rgba(0, 0, 0, 0.3) 100%
              )`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface GoldenParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
  hue: number; // Gold variation
}

function createGoldenParticle(width: number, height: number): GoldenParticle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: -Math.random() * 0.5 - 0.2, // Gentle upward drift
    opacity: Math.random() * 0.6 + 0.2,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.01,
    hue: 35 + Math.random() * 15, // 35-50 for gold variations
  };
}

function updateGoldenParticle(particle: GoldenParticle, width: number, height: number, time: number) {
  particle.x += particle.speedX;
  particle.y += particle.speedY;
  particle.pulse += particle.pulseSpeed;

  // Gentle horizontal drift
  particle.x += Math.sin(time * 0.5 + particle.pulse) * 0.2;

  // Reset if out of bounds
  if (particle.y < -20) {
    particle.y = height + 20;
    particle.x = Math.random() * width;
  }
  if (particle.x < -20) particle.x = width + 20;
  if (particle.x > width + 20) particle.x = -20;
}

function drawGoldenParticle(ctx: CanvasRenderingContext2D, particle: GoldenParticle, intensity: number) {
  const pulseOpacity = particle.opacity * (0.7 + Math.sin(particle.pulse) * 0.3) * intensity;
  
  // Outer glow
  const gradient = ctx.createRadialGradient(
    particle.x, particle.y, 0,
    particle.x, particle.y, particle.size * 4
  );
  gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 60%, ${pulseOpacity})`);
  gradient.addColorStop(0.3, `hsla(${particle.hue}, 70%, 50%, ${pulseOpacity * 0.5})`);
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = `hsla(${particle.hue}, 90%, 70%, ${pulseOpacity})`;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
}

function drawRadialGlow(
  ctx: CanvasRenderingContext2D, 
  centerX: number, 
  centerY: number, 
  width: number, 
  height: number, 
  time: number,
  intensity: number
) {
  const breathe = 0.8 + Math.sin(time * 0.5) * 0.2;
  const radius = Math.max(width, height) * 0.4 * breathe;

  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius
  );
  
  gradient.addColorStop(0, `rgba(255, 200, 100, ${0.06 * intensity * breathe})`);
  gradient.addColorStop(0.3, `rgba(255, 180, 80, ${0.04 * intensity * breathe})`);
  gradient.addColorStop(0.6, `rgba(200, 150, 50, ${0.02 * intensity * breathe})`);
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawLightRays(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  time: number,
  intensity: number
) {
  const numRays = 8;
  const maxLength = Math.max(width, height) * 0.6;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(time * 0.02); // Very slow rotation

  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2;
    const rayLength = maxLength * (0.7 + Math.sin(time * 0.3 + i) * 0.3);
    const rayWidth = 0.02 + Math.sin(time * 0.5 + i * 0.5) * 0.01;

    ctx.save();
    ctx.rotate(angle);

    const gradient = ctx.createLinearGradient(0, 0, rayLength, 0);
    gradient.addColorStop(0, `rgba(255, 200, 100, ${0.03 * intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 180, 80, ${0.015 * intensity})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(rayLength, -rayLength * rayWidth);
    ctx.lineTo(rayLength, rayLength * rayWidth);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

export default V7MethodRevealGlow;
