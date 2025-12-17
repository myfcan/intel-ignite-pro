// V7 Cinematic Effects Design System
// Inspirado em Netflix Bandersnatch, Apple Keynotes, e best practices de motion design

/**
 * DESIGN PRINCIPLES (Based on References):
 *
 * 1. Netflix Bandersnatch:
 *    - Seamless transitions (pre-cache next scenes)
 *    - Aspect ratio changes for dramatic moments
 *    - Letterboxing for focus/pressure
 *    - Clear UI without confusion
 *
 * 2. Apple Motion Design:
 *    - Smooth easing (easeOutCubic: [0.22, 1, 0.36, 1])
 *    - Micro-interactions with purpose
 *    - Minimal but impactful animations
 *    - Consistent timing (0.3s fast, 0.6s medium, 1.2s slow)
 *
 * 3. Duolingo Gamification:
 *    - Immediate visual feedback
 *    - Celebration animations
 *    - Progress indicators
 *    - Reward moments
 */

// ============================================================
// TIMING CONSTANTS (Apple-style)
// ============================================================
export const TIMING = {
  instant: 0.15,      // Micro-interactions (hover, focus)
  fast: 0.3,          // Quick transitions (fade, slide)
  medium: 0.6,        // Standard animations (reveal, scale)
  slow: 1.2,          // Dramatic moments (count-up, explode)
  cinematic: 2.0,     // Scene transitions (wipe, dissolve)
} as const;

// ============================================================
// EASING CURVES (Based on Apple Human Interface Guidelines)
// ============================================================
export const EASING = {
  // Standard easings
  easeOut: [0.22, 1, 0.36, 1],           // Default smooth exit
  easeIn: [0.55, 0, 1, 0.45],            // Smooth entrance
  easeInOut: [0.45, 0, 0.55, 1],         // Symmetrical

  // Special effects
  spring: [0.68, -0.55, 0.265, 1.55],    // Bounce effect
  dramatic: [0.87, 0, 0.13, 1],          // Slow start, fast end
  snappy: [0.25, 0.46, 0.45, 0.94],      // Quick and responsive

  // Cinematic
  cinematic: [0.83, 0, 0.17, 1],         // Movie-like smooth
} as const;

// ============================================================
// ANIMATION TYPES
// ============================================================
export type AnimationType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-up'
  | 'scale-down'
  | 'letter-by-letter'
  | 'count-up'
  | 'explode'
  | 'particle-burst'
  | 'wipe-horizontal'
  | 'wipe-vertical'
  | 'dissolve'
  | 'zoom-in'
  | 'zoom-out'
  | 'letterbox'
  | 'aspect-change'
  | 'glitch'
  | 'wave'
  | 'spotlight';

// ============================================================
// SCENE TRANSITION EFFECTS
// ============================================================
export const TRANSITIONS = {
  // Simple transitions (0.3-0.6s)
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: TIMING.fast, ease: EASING.easeOut },
  },

  slideUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -60 },
    transition: { duration: TIMING.medium, ease: EASING.easeOut },
  },

  slideLeft: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: TIMING.medium, ease: EASING.easeOut },
  },

  slideRight: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: TIMING.medium, ease: EASING.easeOut },
  },

  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: TIMING.medium, ease: EASING.spring },
  },

  // Cinematic transitions (1.2-2.0s)
  dissolve: {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: TIMING.cinematic, ease: EASING.cinematic },
  },

  zoomIn: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.5 },
    transition: { duration: TIMING.slow, ease: EASING.dramatic },
  },

  explode: {
    initial: { opacity: 0, scale: 0.3, rotate: -10 },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
    },
    exit: { opacity: 0, scale: 2, rotate: 10 },
    transition: { duration: TIMING.slow, ease: EASING.dramatic },
  },

  // Netflix Bandersnatch-style letterbox
  letterbox: {
    initial: { opacity: 0, scaleY: 0.6 },
    animate: { opacity: 1, scaleY: 1 },
    exit: { opacity: 0, scaleY: 0.6 },
    transition: { duration: TIMING.medium, ease: EASING.cinematic },
  },
} as const;

// ============================================================
// PARTICLE EFFECTS
// ============================================================
export const PARTICLE_EFFECTS = {
  confetti: {
    count: 50,
    colors: ['#22D3EE', '#A855F7', '#EC4899', '#F59E0B'],
    duration: 3000,
    spread: 360,
    gravity: 0.8,
  },

  sparks: {
    count: 20,
    colors: ['#22D3EE', '#06B6D4'],
    duration: 1500,
    spread: 180,
    velocity: 40,
  },

  glow: {
    blur: 20,
    color: 'rgba(34, 211, 238, 0.5)',
    spread: 10,
    pulse: true,
  },
} as const;

// ============================================================
// TEXT ANIMATION EFFECTS
// ============================================================
export const TEXT_EFFECTS = {
  letterByLetter: {
    staggerChildren: 0.03,
    delayChildren: 0.1,
  },

  wordByWord: {
    staggerChildren: 0.08,
    delayChildren: 0.2,
  },

  typewriter: {
    speed: 50, // ms per character
    cursor: true,
    cursorBlink: 530, // ms blink rate
  },

  glitch: {
    duration: 0.2,
    intensity: 5,
    repeat: 3,
  },

  wave: {
    amplitude: 10,
    frequency: 2,
    duration: 1.5,
  },
} as const;

// ============================================================
// SCENE-SPECIFIC EFFECTS LIBRARY
// ============================================================

/**
 * Dramatic Scene Effects (Netflix Bandersnatch-inspired)
 * 6 scenes total: black → number → count-up → explode → subtitle → impact
 */
export const DRAMATIC_EFFECTS = {
  blackFadeIn: {
    duration: TIMING.medium,
    backgroundColor: 'black',
    aspectRatio: 'letterbox', // Cinematic 2.39:1
  },

  numberAppear: {
    ...TRANSITIONS.scaleUp,
    particleEffect: PARTICLE_EFFECTS.glow,
  },

  countUp: {
    duration: TIMING.slow,
    easing: EASING.dramatic,
    numberAnimation: 'count-up',
  },

  particleExplosion: {
    ...TRANSITIONS.explode,
    particles: PARTICLE_EFFECTS.sparks,
  },

  subtitleReveal: {
    textEffect: TEXT_EFFECTS.letterByLetter,
    transition: TRANSITIONS.slideUp,
  },

  impactWord: {
    ...TRANSITIONS.zoomIn,
    cameraShake: { intensity: 5, duration: 0.3 },
    particleEffect: PARTICLE_EFFECTS.confetti,
  },
} as const;

/**
 * Narrative Scene Effects (Split-screen comparisons)
 * 6 scenes total
 */
export const NARRATIVE_EFFECTS = {
  titleLetterbox: {
    ...TRANSITIONS.letterbox,
    aspectRatio: 'cinematic',
  },

  splitScreenSlide: {
    ...TRANSITIONS.slideLeft,
    splitPosition: 0.5,
    dividerAnimation: true,
  },

  leftCardAnimate: {
    ...TRANSITIONS.slideLeft,
    delay: 0.2,
  },

  rightCardAnimate: {
    ...TRANSITIONS.slideRight,
    delay: 0.4,
  },

  comparisonHighlight: {
    pulseEffect: true,
    glowColor: '#22D3EE',
  },

  warningColorShift: {
    backgroundColor: 'from-black to-red-900/20',
    transition: TIMING.medium,
  },
} as const;

/**
 * Quiz Scene Effects (Interactive with feedback)
 * 5 scenes total
 */
export const QUIZ_EFFECTS = {
  titleBounce: {
    ...TRANSITIONS.scaleUp,
    bounce: true,
  },

  optionsStagger: {
    staggerChildren: 0.15,
    transition: TRANSITIONS.slideUp,
  },

  interactionPause: {
    highlightOnHover: true,
    scaleOnHover: 1.02,
  },

  resultReveal: {
    ...TRANSITIONS.explode,
    particles: PARTICLE_EFFECTS.confetti,
  },

  feedbackGlow: {
    glowEffect: PARTICLE_EFFECTS.glow,
    fadeIn: TIMING.fast,
  },
} as const;

/**
 * Playground Scene Effects (Code typing + results)
 * 6 scenes total
 */
export const PLAYGROUND_EFFECTS = {
  challengeCodeEffect: {
    textEffect: TEXT_EFFECTS.glitch,
    transition: TRANSITIONS.fade,
  },

  amateurTypewriter: {
    ...TEXT_EFFECTS.typewriter,
    speed: 50,
  },

  amateurScoreAnimation: {
    countUp: true,
    duration: TIMING.slow,
    color: 'red',
  },

  professionalTypewriter: {
    ...TEXT_EFFECTS.typewriter,
    speed: 30, // Faster = more professional
  },

  professionalScoreAnimation: {
    countUp: true,
    duration: TIMING.slow,
    color: 'green',
    particles: PARTICLE_EFFECTS.sparks,
  },

  comparisonBars: {
    raceAnimation: true,
    duration: TIMING.cinematic,
    winnerEffect: PARTICLE_EFFECTS.confetti,
  },
} as const;

/**
 * Revelation Scene Effects (Method reveal + CTA)
 * 5 scenes total
 */
export const REVELATION_EFFECTS = {
  dramaticPause: {
    backgroundColor: 'black',
    duration: TIMING.fast,
  },

  methodNameGlow: {
    ...TRANSITIONS.zoomIn,
    glowEffect: PARTICLE_EFFECTS.glow,
  },

  itemsSequential: {
    staggerChildren: 0.25,
    transition: TRANSITIONS.slideLeft,
    iconBounce: true,
  },

  ctaSlideIn: {
    ...TRANSITIONS.slideUp,
    staggerChildren: 0.15,
  },

  ctaPulse: {
    scale: [1, 1.05, 1],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: EASING.easeInOut,
    },
  },
} as const;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get transition config by animation type
 */
export function getTransitionByType(type: AnimationType) {
  const map: Record<AnimationType, any> = {
    'fade': TRANSITIONS.fade,
    'slide-up': TRANSITIONS.slideUp,
    'slide-down': { ...TRANSITIONS.slideUp, initial: { opacity: 0, y: -60 }, exit: { opacity: 0, y: 60 } },
    'slide-left': TRANSITIONS.slideLeft,
    'slide-right': { ...TRANSITIONS.slideLeft, initial: { opacity: 0, x: -100 }, exit: { opacity: 0, x: 100 } },
    'scale-up': TRANSITIONS.scaleUp,
    'scale-down': { ...TRANSITIONS.scaleUp, initial: { opacity: 0, scale: 1.2 }, exit: { opacity: 0, scale: 0.8 } },
    'letter-by-letter': TRANSITIONS.slideUp,
    'count-up': TRANSITIONS.scaleUp,
    'explode': TRANSITIONS.explode,
    'particle-burst': TRANSITIONS.explode,
    'wipe-horizontal': TRANSITIONS.slideLeft,
    'wipe-vertical': TRANSITIONS.slideUp,
    'dissolve': TRANSITIONS.dissolve,
    'zoom-in': TRANSITIONS.zoomIn,
    'zoom-out': { ...TRANSITIONS.zoomIn, initial: { opacity: 0, scale: 1.5 }, exit: { opacity: 0, scale: 0.5 } },
    'letterbox': TRANSITIONS.letterbox,
    'aspect-change': TRANSITIONS.letterbox,
    'glitch': TRANSITIONS.scaleUp,
    'wave': TRANSITIONS.slideUp,
    'spotlight': TRANSITIONS.zoomIn,
  };

  return map[type] || TRANSITIONS.fade;
}

/**
 * Get scene effects by phase type and scene index
 */
export function getSceneEffects(phaseType: string, sceneIndex: number) {
  switch (phaseType) {
    case 'dramatic':
      return Object.values(DRAMATIC_EFFECTS)[sceneIndex] || DRAMATIC_EFFECTS.blackFadeIn;

    case 'narrative':
      return Object.values(NARRATIVE_EFFECTS)[sceneIndex] || NARRATIVE_EFFECTS.titleLetterbox;

    case 'interaction':
      return Object.values(QUIZ_EFFECTS)[sceneIndex] || QUIZ_EFFECTS.titleBounce;

    case 'playground':
      return Object.values(PLAYGROUND_EFFECTS)[sceneIndex] || PLAYGROUND_EFFECTS.challengeCodeEffect;

    case 'revelation':
      return Object.values(REVELATION_EFFECTS)[sceneIndex] || REVELATION_EFFECTS.dramaticPause;

    default:
      return TRANSITIONS.fade;
  }
}

// ============================================================
// EXPORTS
// ============================================================
export default {
  TIMING,
  EASING,
  TRANSITIONS,
  PARTICLE_EFFECTS,
  TEXT_EFFECTS,
  DRAMATIC_EFFECTS,
  NARRATIVE_EFFECTS,
  QUIZ_EFFECTS,
  PLAYGROUND_EFFECTS,
  REVELATION_EFFECTS,
  getTransitionByType,
  getSceneEffects,
};
