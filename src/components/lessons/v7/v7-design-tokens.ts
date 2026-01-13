/**
 * V7 Design Tokens - Single source of truth for V7 Player visual styling
 * 
 * USAGE:
 * import { V7_COLORS, V7_SPACING, V7_EFFECTS } from './v7-design-tokens';
 * 
 * All V7 components MUST use these tokens for consistency.
 */

// ============================================================================
// COLORS - HSL format for Tailwind compatibility
// ============================================================================

export const V7_COLORS = {
  // Primary accent (cyan/teal)
  accent: {
    primary: 'rgb(34, 211, 238)',      // cyan-400
    secondary: 'rgb(6, 182, 212)',      // cyan-500
    muted: 'rgba(34, 211, 238, 0.5)',   // cyan-400/50
    subtle: 'rgba(34, 211, 238, 0.2)',  // cyan-400/20
    glow: 'rgba(34, 211, 238, 0.15)',   // For shadows/glows
  },
  
  // Backgrounds
  bg: {
    solid: 'rgba(0, 0, 0, 0.85)',       // Main containers
    medium: 'rgba(0, 0, 0, 0.70)',      // Secondary containers
    light: 'rgba(0, 0, 0, 0.50)',       // Hover states
    overlay: 'rgba(0, 0, 0, 0.40)',     // Light overlays
    blur: 'rgba(0, 0, 0, 0.80)',        // With backdrop-blur
  },
  
  // Text
  text: {
    primary: 'rgba(255, 255, 255, 1)',
    secondary: 'rgba(255, 255, 255, 0.70)',
    muted: 'rgba(255, 255, 255, 0.50)',
    subtle: 'rgba(255, 255, 255, 0.30)',
    disabled: 'rgba(255, 255, 255, 0.20)',
  },
  
  // Borders
  border: {
    primary: 'rgba(255, 255, 255, 0.20)',
    secondary: 'rgba(255, 255, 255, 0.10)',
    accent: 'rgba(34, 211, 238, 0.50)',
    accentStrong: 'rgba(34, 211, 238, 0.70)',
  },
  
  // Gradients (for progress bars, etc)
  gradient: {
    progress: 'linear-gradient(to right, rgb(34, 211, 238), rgb(6, 182, 212))',
    progressAlt: 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))',
  },
  
  // Feedback colors
  feedback: {
    success: 'rgb(34, 197, 94)',        // green-500
    error: 'rgb(239, 68, 68)',          // red-500
    warning: 'rgb(234, 179, 8)',        // yellow-500
  }
} as const;

// ============================================================================
// SPACING - Consistent spacing with safe area support
// ============================================================================

export const V7_SPACING = {
  // Safe area CSS values (use with inline styles)
  safeArea: {
    top: 'max(1rem, env(safe-area-inset-top, 1rem))',
    bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
    left: 'max(1rem, env(safe-area-inset-left, 0px))',
    right: 'max(1rem, env(safe-area-inset-right, 0px))',
  },
  
  // Component-specific safe positions
  positions: {
    exitButton: {
      top: 'max(1rem, env(safe-area-inset-top, 1rem))',
      left: 'max(1rem, env(safe-area-inset-left, 1rem))',
    },
    controlBar: {
      bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
      paddingX: 'max(1rem, env(safe-area-inset-left, 0px))',
    },
    captions: {
      bottom: 'max(clamp(120px, 18vh, 160px), calc(env(safe-area-inset-bottom, 0px) + 120px))',
    },
  },
  
  // Padding values (Tailwind classes)
  padding: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-6',
  },
  
  // Gap values (Tailwind classes)
  gap: {
    xs: 'gap-1',
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-3',
    xl: 'gap-4',
  },
} as const;

// ============================================================================
// EFFECTS - Visual effects, shadows, animations
// ============================================================================

export const V7_EFFECTS = {
  // Box shadows
  shadow: {
    glow: '0 0 20px rgba(34, 211, 238, 0.15)',
    glowStrong: '0 0 30px rgba(34, 211, 238, 0.25)',
    soft: '0 4px 20px rgba(0, 0, 0, 0.3)',
    elevated: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  
  // Backdrop blur
  blur: {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  },
  
  // Border radius (Tailwind classes)
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
  
  // Transitions
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },
} as const;

// ============================================================================
// TYPOGRAPHY - Font sizes and weights
// ============================================================================

export const V7_TYPOGRAPHY = {
  // Font sizes (Tailwind classes)
  size: {
    xs: 'text-xs',           // 12px
    sm: 'text-sm',           // 14px
    base: 'text-base',       // 16px
    lg: 'text-lg',           // 18px
    xl: 'text-xl',           // 20px
    '2xl': 'text-2xl',       // 24px
    '3xl': 'text-3xl',       // 30px
  },
  
  // Responsive font sizes
  responsive: {
    caption: 'text-xs sm:text-sm',
    body: 'text-sm sm:text-base',
    title: 'text-lg sm:text-xl md:text-2xl',
    display: 'text-2xl sm:text-3xl md:text-4xl',
  },
  
  // Mono for time displays
  mono: 'font-mono tabular-nums',
} as const;

// ============================================================================
// Z-INDEX - Layering system
// ============================================================================

export const V7_LAYERS = {
  background: 0,
  content: 10,
  overlay: 20,
  captions: 50,
  controls: 100,
  exitButton: 150,
  modal: 200,
  toast: 250,
} as const;

// ============================================================================
// TAILWIND CLASS BUILDERS - Pre-built component classes
// ============================================================================

export const V7_CLASSES = {
  // Control bar container
  controlBar: `
    bg-black/80 backdrop-blur-xl rounded-2xl 
    border border-white/10 overflow-hidden shadow-2xl
  `.trim().replace(/\s+/g, ' '),
  
  // Primary button (play/pause)
  buttonPrimary: `
    w-12 h-12 rounded-full flex items-center justify-center
    bg-white hover:bg-white/90 active:scale-95
    transition-all duration-200 shadow-lg
  `.trim().replace(/\s+/g, ' '),
  
  // Secondary button (skip, volume)
  buttonSecondary: `
    w-9 h-9 rounded-full flex items-center justify-center
    text-white/70 hover:text-white hover:bg-white/10
    active:scale-95 transition-all duration-200
  `.trim().replace(/\s+/g, ' '),
  
  // Disabled button
  buttonDisabled: `
    text-white/20 cursor-not-allowed
  `.trim().replace(/\s+/g, ' '),
  
  // Exit button
  exitButton: `
    w-10 h-10 rounded-full 
    bg-black/40 backdrop-blur-md border border-white/10
    flex items-center justify-center
    text-white/60 hover:text-white hover:bg-black/60
    transition-all duration-200
  `.trim().replace(/\s+/g, ' '),
  
  // Caption container
  captionContainer: `
    bg-black/85 backdrop-blur-lg rounded-xl 
    px-4 py-2 sm:px-5 sm:py-2.5 
    max-w-[90vw] sm:max-w-lg md:max-w-xl 
    border border-white/10 shadow-lg
  `.trim().replace(/\s+/g, ' '),
  
  // Progress bar background
  progressBg: 'h-1 bg-white/10 cursor-pointer',
  
  // Progress bar fill (use cyan gradient)
  progressFill: 'bg-gradient-to-r from-cyan-400 to-cyan-500',
  
  // Input field (for prompts)
  inputField: `
    w-full bg-black/60 
    border-2 border-cyan-400/50 rounded-xl 
    p-3 sm:p-4 
    text-white placeholder-white/50 
    font-mono text-sm sm:text-base 
    resize-none 
    focus:outline-none focus:border-cyan-400 focus:bg-black/70 
    transition-all duration-200 
    disabled:opacity-50 
    shadow-[0_0_20px_rgba(34,211,238,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]
  `.trim().replace(/\s+/g, ' '),
  
  // Audio indicator bars
  audioIndicator: 'w-1 rounded-sm bg-cyan-400/70',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build inline style object for safe area positioning
 */
export const buildSafeAreaStyle = (position: 'top' | 'bottom' | 'left' | 'right') => ({
  [position]: V7_SPACING.safeArea[position],
});

/**
 * Get word highlight class based on state
 * @deprecated Mantido para compatibilidade - novo modelo usa frases completas
 */
export const getCaptionWordClass = (state: 'past' | 'current' | 'future') => {
  // Novo modelo: texto uniforme sem destaque palavra por palavra
  return 'text-white font-medium';
};

/**
 * Caption sentence container classes
 */
export const V7_CAPTION_SENTENCE = {
  container: `
    bg-black/75 backdrop-blur-md rounded-lg
    px-5 py-3 sm:px-6 sm:py-3.5
    max-w-[85vw] sm:max-w-2xl md:max-w-3xl
    border border-white/10 shadow-lg
  `.trim().replace(/\s+/g, ' '),
  text: `
    text-center text-white font-medium
    text-base sm:text-lg md:text-xl
    leading-relaxed tracking-wide
  `.trim().replace(/\s+/g, ' '),
} as const;
