// V7PhaseDramatic - Dramatic entry phase with number reveal and text animation
// Based on the spec: 98% appears giant, text reveals letter by letter

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { V7LetterboxEffect } from '../effects/V7LetterboxEffect';
import { V7Confetti } from '../effects/V7ParticleSystem';
import { V7GlowEffect } from '../effects/V7GlowEffect';

interface V7PhaseDramaticProps {
  mainNumber: string;
  subtitle: string;
  highlightWord?: string;
  impactWord?: string;
  sceneIndex: number;
  phaseProgress: number;
  mood?: 'danger' | 'success' | 'neutral';
}

const MOOD_COLORS = {
  danger: {
    gradient: 'linear-gradient(45deg, #ff0040, #ff6b6b)',
    glow: 'rgba(255, 0, 64, 0.5)',
    particle: '#ff0040',
  },
  success: {
    gradient: 'linear-gradient(45deg, #00d9a6, #4ecdc4)',
    glow: 'rgba(78, 205, 196, 0.5)',
    particle: '#4ecdc4',
  },
  neutral: {
    gradient: 'linear-gradient(45deg, #667eea, #764ba2)',
    glow: 'rgba(102, 126, 234, 0.5)',
    particle: '#667eea',
  },
};

export const V7PhaseDramatic = ({
  mainNumber,
  subtitle,
  highlightWord,
  impactWord,
  sceneIndex,
  phaseProgress,
  mood = 'danger',
}: V7PhaseDramaticProps) => {
  const colors = MOOD_COLORS[mood];
  const [countValue, setCountValue] = useState('0');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);
  const [showLetterbox, setShowLetterbox] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // Scene 0: Fade in with number counting up
  // Scene 1: Show subtitle letter by letter
  // Scene 2: Show impact word with explosion

  useEffect(() => {
    if (sceneIndex >= 0) {
      // Count up animation
      const numericMatch = mainNumber.match(/^(\d+)/);
      if (numericMatch) {
        const targetNum = parseInt(numericMatch[1]);
        const suffix = mainNumber.replace(/^\d+/, '');
        let current = 0;
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = Math.floor(eased * targetNum);
          setCountValue(`${current}${suffix}`);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCountValue(mainNumber);
          }
        };
        requestAnimationFrame(animate);
      } else {
        setCountValue(mainNumber);
      }
    }
  }, [mainNumber, sceneIndex]);

  // Reveal subtitle letter by letter
  useEffect(() => {
    if (sceneIndex >= 1) {
      setShowSubtitle(true);
      let letterIndex = 0;
      const interval = setInterval(() => {
        letterIndex++;
        setRevealedLetters(letterIndex);
        if (letterIndex >= subtitle.length) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [sceneIndex, subtitle]);

  // Show impact word with particles
  useEffect(() => {
    if (sceneIndex >= 2) {
      setShowImpact(true);
      // Trigger confetti effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Create particle burst
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: 50,
        y: 60,
        angle: (i / 30) * Math.PI * 2,
      }));
      setParticles(newParticles);
    }
  }, [sceneIndex]);

  // Hide letterbox after initial scene
  useEffect(() => {
    if (sceneIndex >= 1) {
      const timer = setTimeout(() => setShowLetterbox(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [sceneIndex]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + Math.cos(p.angle) * 2,
          y: p.y + Math.sin(p.angle) * 2,
        })).filter(p => p.x > -10 && p.x < 110 && p.y > -10 && p.y < 110)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles.length]);

  const revealedSubtitle = useMemo(() => {
    return subtitle.slice(0, revealedLetters);
  }, [subtitle, revealedLetters]);

  const renderHighlightedSubtitle = () => {
    if (!highlightWord || !revealedSubtitle.includes(highlightWord)) {
      return <span className="text-white/80">{revealedSubtitle}</span>;
    }
    
    const parts = revealedSubtitle.split(highlightWord);
    return (
      <>
        <span className="text-white/80">{parts[0]}</span>
        <span className="text-white font-bold">{highlightWord}</span>
        <span className="text-white/80">{parts[1] || ''}</span>
      </>
    );
  };

  const content = (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: sceneIndex >= 0 ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        style={{
          background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 60%)`,
        }}
      />

      {/* Pulsing rings on impact */}
      <AnimatePresence>
        {showImpact && [1, 2, 3].map(ring => (
          <motion.div
            key={ring}
            className="absolute rounded-full border-2 left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2"
            style={{ borderColor: colors.particle }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{
              width: [0, 400 + ring * 100],
              height: [0, 400 + ring * 100],
              opacity: [0.6, 0],
            }}
            transition={{ duration: 1.5, delay: ring * 0.15 }}
          />
        ))}
      </AnimatePresence>

      {/* Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-3 h-3 rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: colors.particle,
            boxShadow: `0 0 12px ${colors.particle}`,
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 1 }}
        />
      ))}

      {/* Main content */}
      <div className="relative text-center z-10">
        {/* Main Number */}
        <motion.div
          className="text-[20vw] sm:text-[25vw] font-black leading-none select-none"
          style={{
            background: colors.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: sceneIndex >= 1 ? `drop-shadow(0 0 60px ${colors.glow})` : 'none',
          }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{
            scale: sceneIndex >= 1 ? [1, 1.02, 1] : 1,
            opacity: 1,
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.8 },
          }}
        >
          {countValue}
        </motion.div>

        {/* Subtitle - reveals letter by letter */}
        <AnimatePresence>
          {showSubtitle && (
            <motion.div
              className="mt-4 text-lg sm:text-2xl md:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {renderHighlightedSubtitle()}
              <motion.span
                className="inline-block w-[2px] h-6 bg-white/80 ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Impact word - explodes on screen */}
        <AnimatePresence>
          {showImpact && impactWord && (
            <motion.div
              className="mt-8 text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-widest"
              style={{
                background: colors.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 30px ${colors.glow})`,
              }}
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: 1,
                rotate: 0,
              }}
              transition={{ 
                duration: 0.6,
                type: 'spring',
                stiffness: 200,
              }}
            >
              {impactWord.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow underline */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 h-1 rounded-full mt-4"
          style={{ backgroundColor: colors.particle }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: sceneIndex >= 1 ? '50%' : 0, 
            opacity: sceneIndex >= 1 ? 1 : 0 
          }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Confetti effect on impact */}
      {showConfetti && <V7Confetti trigger={showConfetti} />}

      {/* Letterbox effect for cinematic feel */}
      {showLetterbox ? (
        <V7LetterboxEffect aspectRatio="cinematic" animate={true}>
          {content}
        </V7LetterboxEffect>
      ) : (
        content
      )}
    </>
  );
};

export default V7PhaseDramatic;
