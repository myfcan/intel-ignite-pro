// V7PhaseDramatic - Dramatic entry phase with number reveal and text animation
// 6 CINEMATIC SCENES: letterbox → number-glow → count-up → explosion → subtitle → impact

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface V7PhaseDramaticProps {
  mainNumber: string;
  subtitle: string;
  highlightWord?: string;
  impactWord?: string;
  hookQuestion?: string; // "VOCÊ SABIA?" - shown during letterbox
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
  hookQuestion,
  sceneIndex,
  phaseProgress,
  mood = 'danger',
}: V7PhaseDramaticProps) => {
  const colors = MOOD_COLORS[mood];
  const [countValue, setCountValue] = useState(mainNumber);
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);
  const [countUpStarted, setCountUpStarted] = useState(false);
  const [subtitleStarted, setSubtitleStarted] = useState(false);
  const [explosionTriggered, setExplosionTriggered] = useState(false);

  // 🎬 DERIVE VISIBILITY DIRECTLY FROM sceneIndex (no complex useEffects)
  // Scene 0: Letterbox black fade in (cinematic aspect ratio)
  // Scene 1: Number appears with glow effect
  // Scene 2: Number count-up animation
  // Scene 3: Particle explosion transition
  // Scene 4: Subtitle reveals letter by letter
  // Scene 5: Impact word with camera zoom + shake

  const showLetterbox = sceneIndex < 1;
  const showNumberGlow = sceneIndex >= 1;
  const showCountUp = sceneIndex >= 2;
  const showExplosion = sceneIndex >= 3;
  const showSubtitle = sceneIndex >= 4;
  const showImpact = sceneIndex >= 5;

  // Debug log for scene transitions
  useEffect(() => {
    console.log(`[V7PhaseDramatic] Scene ${sceneIndex}: letterbox=${showLetterbox}, number=${showNumberGlow}, countUp=${showCountUp}, explosion=${showExplosion}, subtitle=${showSubtitle}, impact=${showImpact}`);
  }, [sceneIndex, showLetterbox, showNumberGlow, showCountUp, showExplosion, showSubtitle, showImpact]);

  // Scene 2: Count-up animation (only trigger once)
  useEffect(() => {
    if (showCountUp && !countUpStarted) {
      setCountUpStarted(true);
      const numericMatch = mainNumber.match(/^(\d+)/);
      if (numericMatch) {
        const targetNum = parseInt(numericMatch[1]);
        const suffix = mainNumber.replace(/^\d+/, '');
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * targetNum);
          setCountValue(`${current}${suffix}`);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCountValue(mainNumber);
          }
        };
        requestAnimationFrame(animate);
      }
    }
  }, [showCountUp, countUpStarted, mainNumber]);

  // Scene 3: Particle explosion (only trigger once)
  useEffect(() => {
    if (showExplosion && !explosionTriggered) {
      setExplosionTriggered(true);
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: 50,
        y: 50,
        angle: (i / 40) * Math.PI * 2,
      }));
      setParticles(newParticles);
    }
  }, [showExplosion, explosionTriggered]);

  // Scene 4: Subtitle letter-by-letter reveal (only trigger once)
  useEffect(() => {
    if (showSubtitle && !subtitleStarted) {
      setSubtitleStarted(true);
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
  }, [showSubtitle, subtitleStarted, subtitle]);

  // Scene 5: Impact particles
  useEffect(() => {
    if (showImpact) {
      const impactParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i + 100,
        x: 50,
        y: 60,
        angle: (i / 50) * Math.PI * 2,
      }));
      setParticles(prev => {
        // Only add if not already added
        if (prev.some(p => p.id >= 100)) return prev;
        return [...prev, ...impactParticles];
      });
    }
  }, [showImpact]);

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

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Scene 0: Letterbox cinematic bars + Hook Question */}
      <AnimatePresence>
        {showLetterbox && (
          <>
            <motion.div
              className="absolute top-0 left-0 right-0 bg-black z-50"
              initial={{ height: '50%' }}
              animate={{ height: '12%' }}
              exit={{ height: 0 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-black z-50"
              initial={{ height: '50%' }}
              animate={{ height: '12%' }}
              exit={{ height: 0 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Hook Question - appears during letterbox */}
            {hookQuestion && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-40"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2
                  className="text-3xl sm:text-5xl md:text-6xl font-bold text-white/90 tracking-wide"
                  style={{ textShadow: `0 0 40px ${colors.glow}` }}
                >
                  {hookQuestion}
                </h2>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Background glow - appears in scene 1 */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: showNumberGlow ? 1 : 0 }}
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
        {/* Main Number - appears in scene 1, animates in scene 2 */}
        <AnimatePresence>
          {showNumberGlow && (
            <motion.div
              className="text-[20vw] sm:text-[25vw] font-black leading-none select-none"
              style={{
                background: colors.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: showCountUp ? `drop-shadow(0 0 60px ${colors.glow})` : `drop-shadow(0 0 30px ${colors.glow})`,
              }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{
                scale: showCountUp ? [1, 1.02, 1] : 1,
                opacity: 1,
              }}
              transition={{
                scale: { duration: 2, repeat: showCountUp ? Infinity : 0, ease: 'easeInOut' },
                opacity: { duration: 0.8 },
              }}
            >
              {countValue}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtitle - reveals letter by letter */}
        <AnimatePresence>
          {showSubtitle && subtitle && subtitle.length > 0 && (
            <motion.div
              className="mt-4 text-lg sm:text-2xl md:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {renderHighlightedSubtitle()}
              {/* Cursor ONLY shows while actively typing (not after completion) */}
              {subtitleStarted && revealedLetters > 0 && revealedLetters < subtitle.length && (
                <motion.span
                  className="inline-block w-[2px] h-6 bg-white/80 ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
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
};

export default V7PhaseDramatic;
