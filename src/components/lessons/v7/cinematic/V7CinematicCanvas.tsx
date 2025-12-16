// V7CinematicCanvas - Advanced cinematic canvas with multiple layers
// Includes: particles, glow, blur, light rays, and dynamic effects

import { useEffect, useRef, useCallback, memo } from "react";

interface V7CinematicCanvasProps {
  intensity?: "low" | "medium" | "high";
  mood?: "dramatic" | "calm" | "energetic" | "mysterious";
  accentColor?: string;
  enableGlow?: boolean;
  enableBlur?: boolean;
  enableRays?: boolean;
  pulseOnBeat?: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface LightRay {
  angle: number;
  length: number;
  width: number;
  alpha: number;
  speed: number;
}

const MOOD_COLORS = {
  dramatic: { primary: "#ff0040", secondary: "#ff6b6b", glow: "rgba(255, 0, 64, 0.3)" },
  calm: { primary: "#4ecdc4", secondary: "#45b7aa", glow: "rgba(78, 205, 196, 0.3)" },
  energetic: { primary: "#f39c12", secondary: "#f1c40f", glow: "rgba(243, 156, 18, 0.3)" },
  mysterious: { primary: "#9b59b6", secondary: "#8e44ad", glow: "rgba(155, 89, 182, 0.3)" },
};

export const V7CinematicCanvas = memo(({
  intensity = "medium",
  mood = "dramatic",
  accentColor,
  enableGlow = true,
  enableBlur = true,
  enableRays = true,
  pulseOnBeat = false,
  className = "",
}: V7CinematicCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const raysRef = useRef<LightRay[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const pulseRef = useRef(0);

  const colors = accentColor
    ? { primary: accentColor, secondary: accentColor, glow: `${accentColor}50` }
    : MOOD_COLORS[mood];

  const getParticleCount = useCallback(() => {
    switch (intensity) {
      case "low": return 30;
      case "high": return 100;
      default: return 60;
    }
  }, [intensity]);

  const createParticle = useCallback((width: number, height: number, fromCenter = false): Particle => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    return {
      x: fromCenter ? centerX + (Math.random() - 0.5) * 100 : Math.random() * width,
      y: fromCenter ? centerY + (Math.random() - 0.5) * 100 : Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? colors.primary : colors.secondary,
      alpha: Math.random() * 0.6 + 0.2,
      life: 0,
      maxLife: Math.random() * 200 + 100,
    };
  }, [colors]);

  const createRay = useCallback((): LightRay => ({
    angle: Math.random() * Math.PI * 2,
    length: Math.random() * 300 + 200,
    width: Math.random() * 40 + 10,
    alpha: Math.random() * 0.15 + 0.05,
    speed: (Math.random() - 0.5) * 0.005,
  }), []);

  const initEffects = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const count = getParticleCount();
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width, canvas.height)
    );

    if (enableRays) {
      raysRef.current = Array.from({ length: 6 }, () => createRay());
    }
  }, [getParticleCount, createParticle, createRay, enableRays]);

  const drawGlow = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!enableGlow) return;

    const pulse = Math.sin(timeRef.current * 0.02) * 0.1 + 0.9;
    const centerX = width / 2;
    const centerY = height / 2;

    // Central glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, width * 0.5 * pulse
    );
    gradient.addColorStop(0, colors.glow);
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Pulsing outer ring
    if (pulseOnBeat) {
      const ringPulse = pulseRef.current;
      if (ringPulse > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, width * 0.3 * ringPulse, 0, Math.PI * 2);
        ctx.strokeStyle = `${colors.primary}${Math.floor((1 - ringPulse) * 60).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }, [enableGlow, colors, pulseOnBeat]);

  const drawRays = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!enableRays) return;

    const centerX = width / 2;
    const centerY = height / 2;

    raysRef.current.forEach((ray) => {
      ray.angle += ray.speed;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(ray.angle);

      const gradient = ctx.createLinearGradient(0, 0, ray.length, 0);
      gradient.addColorStop(0, `${colors.primary}${Math.floor(ray.alpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -ray.width / 2);
      ctx.lineTo(ray.length, 0);
      ctx.lineTo(0, ray.width / 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }, [enableRays, colors]);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    particlesRef.current.forEach((particle, index) => {
      // Update
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Fade in/out based on life
      const lifeProgress = particle.life / particle.maxLife;
      const fadeAlpha = lifeProgress < 0.1 
        ? lifeProgress * 10 
        : lifeProgress > 0.8 
          ? (1 - lifeProgress) * 5 
          : 1;

      // Respawn
      if (particle.life >= particle.maxLife || 
          particle.x < -50 || particle.x > width + 50 ||
          particle.y < -50 || particle.y > height + 50) {
        particlesRef.current[index] = createParticle(width, height, Math.random() > 0.7);
        return;
      }

      // Draw with glow
      if (enableGlow && particle.radius > 2) {
        const glowRadius = particle.radius * 4;
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowRadius
        );
        glowGradient.addColorStop(0, `${particle.color}40`);
        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glowGradient;
        ctx.fillRect(
          particle.x - glowRadius,
          particle.y - glowRadius,
          glowRadius * 2,
          glowRadius * 2
        );
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.alpha * fadeAlpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }, [createParticle, enableGlow]);

  const drawBlurOverlay = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!enableBlur) return;

    // Vignette effect
    const vignetteGradient = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.3,
      width / 2, height / 2, height * 0.8
    );
    vignetteGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignetteGradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);
  }, [enableBlur]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    timeRef.current++;
    if (pulseRef.current > 0) {
      pulseRef.current -= 0.02;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Clear with slight trail effect
    ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
    ctx.fillRect(0, 0, width, height);

    // Draw layers
    drawGlow(ctx, width, height);
    drawRays(ctx, width, height);
    drawParticles(ctx, width, height);
    drawBlurOverlay(ctx, width, height);

    animationRef.current = requestAnimationFrame(animate);
  }, [drawGlow, drawRays, drawParticles, drawBlurOverlay]);

  // Pulse trigger (can be called externally)
  const triggerPulse = useCallback(() => {
    pulseRef.current = 1;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;

        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);

        initEffects();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate, initEffects]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ background: "transparent" }}
      aria-hidden="true"
    />
  );
});

V7CinematicCanvas.displayName = "V7CinematicCanvas";
