/**
 * V7 Phase Contracts - Standardized interfaces for all Phase components
 * 
 * This file defines the common props and types shared across all V7 Phase components
 * to ensure consistency between the Pipeline (generator) and Player (consumer).
 * 
 * USAGE:
 * import { V7PhaseBaseProps, V7PhaseWithAudio, V7PhaseDramaticProps } from './v7-phase-contracts';
 */

// ============================================================================
// AUDIO CONTROL INTERFACE - Shared across all interactive phases
// ============================================================================

/**
 * Standard audio control interface for phases that need to pause/resume narration
 */
export interface V7AudioControl {
  pause: () => void;
  play: () => void;
  togglePlayPause: () => void;
  isPlaying: boolean;
  // V7-v2: Fade methods for smooth transitions
  fadeToVolume?: (volume: number, duration?: number) => Promise<void>;
  pauseWithFade?: (duration?: number) => Promise<void>;
  resumeWithFade?: (duration?: number) => Promise<void>;
  // V7-v2.1: Interaction states and sound effects
  interactionState?: V7InteractionState;
  updateInteractionState?: (state: V7InteractionState) => void;
  playSoundEffect?: (effect: V7SoundEffectType, volume?: number) => void;
  // V7-v2.2: TTS for contextual hints
  speakText?: (text: string, volume?: number) => Promise<void>;
  stopSpeech?: () => void;
}

/**
 * Interaction state for tracking user engagement
 */
export type V7InteractionState = 
  | 'idle'
  | 'waiting'
  | 'thinking'
  | 'stuck'
  | 'struggling'
  | 'abandoned';

/**
 * Available sound effect types
 * NOTE: Must match SoundEffectType in useV7AudioManager.ts
 */
export type V7SoundEffectType = 
  | 'click'
  | 'select'
  | 'success'
  | 'error'
  | 'hint'
  | 'timeout'
  | 'whoosh'
  | 'reveal';

// ============================================================================
// BASE PROPS - Common to ALL Phase components
// ============================================================================

/**
 * Base props shared by all Phase components
 */
export interface V7PhaseBaseProps {
  /** Current scene index within the phase (0-based) */
  sceneIndex: number;
  /** Progress within the phase (0-1) */
  phaseProgress: number;
}

/**
 * Extended base props for phases with audio control
 */
export interface V7PhaseWithAudio extends V7PhaseBaseProps {
  /** Audio control object for pausing/resuming narration */
  audioControl?: V7AudioControl;
  /** Whether the phase is paused by an anchor action */
  isPausedByAnchor?: boolean;
}

/**
 * Extended base props for phases that complete with a callback
 */
export interface V7PhaseWithCompletion extends V7PhaseWithAudio {
  /** Callback when phase interaction is complete */
  onComplete?: () => void;
}

// ============================================================================
// TIMEOUT CONFIGURATION - For interactive phases
// ============================================================================

/**
 * Progressive timeout/hint configuration
 */
export interface V7TimeoutConfig {
  /** Soft hint delay in seconds (first hint) */
  soft: number;
  /** Medium hint delay in seconds (second hint) */
  medium: number;
  /** Hard timeout in seconds (auto-advance) */
  hard: number;
  /** Array of hint messages to show progressively */
  hints: string[];
}

/**
 * Default timeout configuration
 */
export const DEFAULT_TIMEOUT_CONFIG: V7TimeoutConfig = {
  soft: 7,
  medium: 15,
  hard: 30,
  hints: [
    '👆 Estou esperando sua resposta...',
    '🤔 Pense com calma...',
    '⏰ Vamos continuar...'
  ]
};

/**
 * TTS contextual loop configuration
 */
export interface V7ContextualLoopConfig {
  /** Seconds after interaction starts to trigger */
  triggerAfter: number;
  /** Text to speak */
  text: string;
  /** Volume (0-1) */
  volume: number;
}

// ============================================================================
// DRAMATIC PHASE - Number reveal with effects
// ============================================================================

export type V7DramaticMood = 'danger' | 'success' | 'neutral';

export interface V7PhaseDramaticProps extends V7PhaseBaseProps {
  /** Main number to display (e.g., "98%") */
  mainNumber: string;
  /** Secondary number for comparison (e.g., "2%") */
  secondaryNumber?: string;
  /** Subtitle text revealed letter by letter */
  subtitle: string;
  /** Word to highlight in subtitle */
  highlightWord?: string;
  /** Impact word shown at end */
  impactWord?: string;
  /** Hook question shown during letterbox (e.g., "VOCÊ SABIA?") */
  hookQuestion?: string;
  /** Color mood for effects */
  mood?: V7DramaticMood;
  /** Show secondary number as main */
  showSecondaryAsMain?: boolean;
}

// ============================================================================
// NARRATIVE PHASE - Split screen comparison
// ============================================================================

export interface V7ComparisonData {
  label: string;
  leftValue: string;
  rightValue: string;
  leftColor?: string;
  rightColor?: string;
}

export interface V7PhaseNarrativeProps extends V7PhaseBaseProps {
  /** Left side title (e.g., "98%") */
  leftTitle: string;
  /** Right side title (e.g., "2%") */
  rightTitle: string;
  /** Left side emoji */
  leftEmoji: string;
  /** Right side emoji */
  rightEmoji: string;
  /** Comparison rows data */
  comparisons: V7ComparisonData[];
  /** Warning section title */
  warningTitle?: string;
  /** Warning section subtitle */
  warningSubtitle?: string;
  /** Center prompt text */
  centerPrompt?: string;
  /** Center prompt emoji */
  centerEmoji?: string;
}

// ============================================================================
// QUIZ PHASE - Interactive self-assessment
// ============================================================================

export type V7QuizCategory = 'good' | 'bad';

export interface V7QuizOption {
  id: string;
  text: string;
  category: V7QuizCategory;
}

export interface V7PhaseQuizProps extends V7PhaseWithAudio {
  /** Quiz title */
  title: string;
  /** Quiz subtitle */
  subtitle?: string;
  /** Quiz options */
  options: V7QuizOption[];
  /** Reveal title after answering */
  revealTitle: string;
  /** Reveal message after answering */
  revealMessage: string;
  /** Reveal value (optional) */
  revealValue?: string;
  /** Feedback for correct answers */
  correctFeedback?: string;
  /** Feedback for incorrect answers */
  incorrectFeedback?: string;
  /** Callback when quiz is complete with selected option IDs */
  onComplete?: (selectedIds: string[]) => void;
  /** Callback when result is shown */
  onResultShow?: (isShowing: boolean) => void;
  /** Timeout configuration */
  timeoutConfig?: V7TimeoutConfig;
  /** TTS contextual loops */
  contextualLoops?: V7ContextualLoopConfig[];
}

// ============================================================================
// PLAYGROUND PHASE - Split comparison with user challenge
// ============================================================================

export type V7PlaygroundVerdict = 'bad' | 'good' | 'excellent';

export interface V7PlaygroundResult {
  title: string;
  content: string;
  score: number;
  maxScore: number;
  verdict: V7PlaygroundVerdict;
}

export interface V7UserChallenge {
  instruction: string;
  challengePrompt: string;
  hints: string[];
}

export interface V7PhasePlaygroundProps extends V7PhaseWithCompletion {
  /** Challenge title */
  challengeTitle: string;
  /** Challenge subtitle */
  challengeSubtitle?: string;
  /** Amateur prompt text */
  amateurPrompt: string;
  /** Amateur result data */
  amateurResult: V7PlaygroundResult;
  /** Professional prompt text */
  professionalPrompt: string;
  /** Professional result data */
  professionalResult: V7PlaygroundResult;
  /** User challenge (optional step 6) */
  userChallenge?: V7UserChallenge;
  /** Lesson ID for saving sessions */
  lessonId?: string;
  /** Timeout configuration */
  timeoutConfig?: {
    perStep: number;
    hints: string[];
  };
}

// ============================================================================
// SECRET REVEAL PHASE - Method reveal with audio
// ============================================================================

export interface V7PhaseSecretRevealProps extends V7PhaseWithCompletion {
  /** Method name (e.g., "PERFEITO") */
  methodName: string;
  /** Method letters for animation */
  methodLetters: string[];
  /** Meanings for each letter */
  meanings: Array<{
    letter: string;
    word: string;
    description: string;
  }>;
  /** Audio URL for secret reveal */
  audioUrl?: string;
}

// ============================================================================
// CTA PHASE - Call to action
// ============================================================================

export interface V7PhaseCTAProps extends V7PhaseBaseProps {
  /** CTA headline */
  headline: string;
  /** CTA subheadline */
  subheadline?: string;
  /** Button text */
  buttonText: string;
  /** Button action */
  onAction?: () => void;
  /** Benefits list */
  benefits?: string[];
  /** Urgency text */
  urgencyText?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const hasAudioControl = (props: any): props is V7PhaseWithAudio => {
  return 'audioControl' in props;
};

export const hasCompletion = (props: any): props is V7PhaseWithCompletion => {
  return 'onComplete' in props;
};
