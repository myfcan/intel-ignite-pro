// V7 Scene Effect Wrapper - Intelligently applies effects based on scene metadata
import { ReactNode, useState, useEffect } from 'react';
import { V7ParticleSystem, V7Confetti, V7Sparks } from './V7ParticleSystem';
import { V7LetterboxEffect } from './V7LetterboxEffect';
import { V7TypewriterText } from './V7TypewriterText';
import { V7GlitchText } from './V7GlitchText';
import { V7GlowEffect } from './V7GlowEffect';
import type { V7Scene } from '../phases/V7PhaseController';

interface V7SceneEffectWrapperProps {
  scene: V7Scene;
  children: ReactNode;
  className?: string;
}

export const V7SceneEffectWrapper = ({ scene, children, className = '' }: V7SceneEffectWrapperProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const content = scene.content as any;

  // Trigger particles on scene load if specified
  useEffect(() => {
    if (content?.particleEffect || content?.particles) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [content?.particleEffect, content?.particles]);

  let wrappedContent = children;

  // Apply Letterbox effect
  if (scene.type === 'letterbox' || content?.aspectRatio === 'cinematic') {
    wrappedContent = (
      <V7LetterboxEffect aspectRatio={content?.aspectRatio || 'cinematic'} animate={true}>
        {wrappedContent}
      </V7LetterboxEffect>
    );
  }

  // Apply Glitch effect
  if (content?.glitchEffect || scene.animation === 'glitch') {
    wrappedContent = <V7GlitchText intensity={5}>{wrappedContent}</V7GlitchText>;
  }

  // Apply Glow effect
  if (content?.glowEffect) {
    const glowColor = content?.glowColor || '#22D3EE';
    wrappedContent = (
      <V7GlowEffect color={glowColor} intensity="medium" pulse={content?.pulseEffect}>
        {wrappedContent}
      </V7GlowEffect>
    );
  }

  // Apply Pulse effect (without glow)
  if (content?.pulseEffect && !content?.glowEffect) {
    wrappedContent = (
      <V7GlowEffect color={content?.glowColor || '#22D3EE'} intensity="low" pulse={true}>
        {wrappedContent}
      </V7GlowEffect>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {wrappedContent}

      {/* Particle effects */}
      {showParticles && content?.particleEffect === 'confetti' && <V7Confetti trigger={showParticles} />}
      {showParticles && content?.particleEffect === 'sparks' && <V7Sparks trigger={showParticles} />}
      {showParticles && content?.particles === 'confetti' && <V7Confetti trigger={showParticles} />}
      {showParticles && content?.particles === 'sparks' && <V7Sparks trigger={showParticles} />}
    </div>
  );
};

// Export individual effects for manual use
export { V7ParticleSystem, V7Confetti, V7Sparks } from './V7ParticleSystem';
export { V7LetterboxEffect, V7CinematicLetterbox } from './V7LetterboxEffect';
export { V7TypewriterText, V7FastTypewriter, V7SlowTypewriter } from './V7TypewriterText';
export { V7GlitchText, V7IntenseGlitch, V7SubtleGlitch } from './V7GlitchText';
export {
  V7GlowEffect,
  V7CyanGlow,
  V7PurpleGlow,
  V7SuccessGlow,
  V7DangerGlow,
} from './V7GlowEffect';
