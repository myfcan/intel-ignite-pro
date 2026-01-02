// V7PhaseDramatic - Dramatic entry phase with number reveal and text animation
// 6 CINEMATIC SCENES: letterbox → number-glow → count-up → explosion → subtitle → impact

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface V7PhaseDramaticProps {
  mainNumber: string;
  secondaryNumber?: string; // "2%" - shown as contrast during impact scene
  subtitle: string;
  highlightWord?: string;
  impactWord?: string;
  hookQuestion?: string; // "VOCÊ SABIA?" - shown during letterbox
  sceneIndex: number;
  phaseProgress: number;
  mood?: 'danger' | 'success' | 'neutral';
  // ✅ V7-v24: Switch to show secondaryNumber as main in certain scenes
  showSecondaryAsMain?: boolean;
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

const SUCCESS_COLORS = {
  gradient: 'linear-gradient(45deg, #00d9a6, #22D3EE)',
  glow: 'rgba(34, 211, 238, 0.5)',
  particle: '#22D3EE',
};

export const V7PhaseDramatic = ({
  mainNumber,
  secondaryNumber,
  subtitle,
  highlightWord,
  impactWord,
  hookQuestion,
  sceneIndex,
  phaseProgress,
  mood = 'danger',
  showSecondaryAsMain = false,
}: V7PhaseDramaticProps) => {
  // ✅ V7-v24: Determine which number to show as main based on prop
  const displayNumber = showSecondaryAsMain && secondaryNumber ? secondaryNumber : mainNumber;
  const displayColors = showSecondaryAsMain ? MOOD_COLORS.success : MOOD_COLORS[mood];
  const colors = displayColors;
  const [countValue, setCountValue] = useState(displayNumber);
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);
  const [countUpStarted, setCountUpStarted] = useState(false);
  const [subtitleStarted, setSubtitleStarted] = useState(false);
  const [explosionTriggered, setExplosionTriggered] = useState(false);

  // 🎬 V7-v2 CORRIGIDO: EXPLOSÃO VISUAL IMEDIATA - SEM TELA PRETA!
  // Scene 0: Número 98% EXPLODE imediatamente com partículas
  // Scene 1: Hook question "VOCÊ SABIA?" aparece junto
  // Scene 2: Count-up animation
  // Scene 3: Particle explosion intensifica
  // Scene 4: Subtitle reveals letter by letter
  // Scene 5: Impact (98% VS 2%)
  //
  // ❌ REMOVIDO: letterbox inicial (era tela preta)
  // ✅ CORRIGIDO: Número visível desde o início

  const showHookQuestion = sceneIndex <= 1; // Show "VOCÊ SABIA?" during scenes 0 and 1
  const showLetterbox = false; // ✅ CORRIGIDO: NUNCA mostrar letterbox na abertura!
  const showNumberGlow = sceneIndex >= 0; // ✅ CORRIGIDO: Número visível IMEDIATAMENTE!
  const showCountUp = sceneIndex >= 1; // ✅ Count-up começa mais cedo
  const showExplosion = sceneIndex >= 0; // ✅ Partículas desde o início!
  const showSubtitle = sceneIndex >= 3;
  // ✅ FIX: Mostrar o 2% (secondaryNumber) a partir da cena 2, não apenas no impact (cena 4)
  const showSecondaryNumber = sceneIndex >= 2 && secondaryNumber;
  const showImpact = sceneIndex >= 4;

  // Debug log for scene transitions
  useEffect(() => {
    console.log(`[V7PhaseDramatic] Scene ${sceneIndex}: letterbox=${showLetterbox}, number=${showNumberGlow}, countUp=${showCountUp}, explosion=${showExplosion}, subtitle=${showSubtitle}, impact=${showImpact}`);
  }, [sceneIndex, showLetterbox, showNumberGlow, showCountUp, showExplosion, showSubtitle, showImpact]);

  // Scene 2: Count-up animation (only trigger once)
  useEffect(() => {
    if (showCountUp && !countUpStarted) {
      setCountUpStarted(true);
      const numericMatch = displayNumber.match(/^(\d+)/);
      if (numericMatch) {
        const targetNum = parseInt(numericMatch[1]);
        const suffix = displayNumber.replace(/^\d+/, '');
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
            setCountValue(displayNumber);
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
      {/* Scene 0-1: Hook Question "VOCÊ SABIA?" - shown prominently */}
      <AnimatePresence>
        {showHookQuestion && hookQuestion && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h2
              className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-wide text-center px-4"
              style={{
                textShadow: `0 0 60px ${colors.glow}, 0 0 120px ${colors.glow}`,
              }}
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  `0 0 60px ${colors.glow}, 0 0 120px ${colors.glow}`,
                  `0 0 80px ${colors.glow}, 0 0 160px ${colors.glow}`,
                  `0 0 60px ${colors.glow}, 0 0 120px ${colors.glow}`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {hookQuestion}
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letterbox cinematic bars */}
      <AnimatePresence>
        {showLetterbox && (
          <>
            <motion.div
              className="absolute top-0 left-0 right-0 bg-black z-50"
              initial={{ height: '50%' }}
              animate={{ height: '10%' }}
              exit={{ height: 0 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-black z-50"
              initial={{ height: '50%' }}
              animate={{ height: '10%' }}
              exit={{ height: 0 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
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

        {/* Secondary Number (2%) - ✅ FIX: shows earlier during scene 2+ */}
        <AnimatePresence>
          {showSecondaryNumber && (
            <motion.div
              className="mt-6 flex items-center justify-center gap-4 sm:gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Main number shrinks and moves left */}
              <motion.div
                className="text-4xl sm:text-6xl md:text-7xl font-black"
                style={{
                  background: colors.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 20px ${colors.glow})`,
                }}
                initial={{ scale: 1 }}
                animate={{ scale: showImpact ? 0.6 : 0.8, opacity: showImpact ? 0.7 : 0.9 }}
              >
                {mainNumber}
              </motion.div>

              {/* VS divider */}
              <motion.span
                className="text-white/50 text-2xl font-bold"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                VS
              </motion.span>

              {/* Secondary number appears with success colors */}
              <motion.div
                className="text-5xl sm:text-7xl md:text-8xl font-black"
                style={{
                  background: SUCCESS_COLORS.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 30px ${SUCCESS_COLORS.glow})`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
              >
                {secondaryNumber}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Impact word - explodes on screen (only if no secondary number) */}
        <AnimatePresence>
          {showImpact && impactWord && !secondaryNumber && (
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
