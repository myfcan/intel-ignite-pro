/**
 * V7 Contract - SINGLE SOURCE OF TRUTH
 * =====================================
 * 
 * This file defines ALL types shared between Pipeline (generator) and Player (consumer).
 * 
 * GOLDEN RULE: If a type is used by both Pipeline and Player, it MUST be defined here.
 * Neither Pipeline nor Player should define types outside this file.
 * 
 * ARCHITECTURE:
 * - Pipeline generates V7LessonData
 * - Player consumes V7LessonData
 * - Both use the same types from this file
 * 
 * @version 2.0.0 (Unified)
 * @author V7-vv Definitive
 */

// ============================================================================
// VISUAL TYPES
// ============================================================================

/**
 * All visual types the Player MUST know how to render.
 * If it's not here, it's not supported.
 */
export type V7VisualType =
  | 'number-reveal'      // Large animated number (e.g., "98%", "30M")
  | 'text-reveal'        // Progressive text reveal
  | 'split-screen'       // Side-by-side comparison (98% vs 2%)
  | 'letter-reveal'      // Letter by letter reveal (P-E-R-F-E-I-T-O)
  | 'cards-reveal'       // Cards appearing in sequence
  | 'quiz'               // Quiz screen with options
  | 'quiz-feedback'      // Feedback after answering quiz
  | 'playground'         // Amateur vs professional prompt comparison
  | 'result'             // Result/gamification screen
  | 'cta'                // Call to action
  | 'image-sequence'     // C12.1: Cinematic image sequence (up to 3 frames)
  // === 3D VISUAL TYPES ===
  | '3d-dual-monitors'   // Two 3D monitors with screen content
  | '3d-abstract'        // Cinematic abstract scene (background)
  | '3d-number-reveal';  // 3D number with cinematic effects

/**
 * Micro-visual types (overlays during narration)
 */
export type V7MicroVisualType =
  | 'image-flash'        // Image that appears and fades
  | 'text-pop'           // Text that "pops" on screen
  | 'number-count'       // Number with counting animation
  | 'text-highlight'     // Highlight text on screen
  | 'highlight'          // Generic highlight (pulse, glow)
  | 'card-reveal'        // Reveal a specific card
  | 'letter-reveal';     // Reveal a letter from acronym

/**
 * Phase/Scene types
 */
export type V7PhaseType =
  | 'loading'            // Loading screen
  | 'dramatic'           // Strong visual impact (numbers, statistics)
  | 'narrative'          // Narrative with text/items
  | 'comparison'         // Visual comparison (split-screen)
  | 'interaction'        // Quiz or choice
  | 'playground'         // Practical challenge
  | 'revelation'         // Revelation (PERFEITO method)
  | 'gamification'       // Result/achievements
  | 'secret-reveal';     // Secret reveal

/**
 * Animation types
 */
export type V7AnimationType =
  | 'fade'
  | 'slide-up'
  | 'slide-left'
  | 'slide-right'
  | 'explode'
  | 'count-up'
  | 'letter-by-letter'
  | 'scale-up'
  | 'particle-burst'
  | 'zoom-in'
  | 'letterbox'
  | 'glitch';

/**
 * Mood types for visual styling
 */
export type V7Mood = 'danger' | 'success' | 'neutral' | 'warning' | 'dramatic' | 'mysterious';

/**
 * Transition types
 */
export type V7TransitionType =
  | 'fadeFromBlack'
  | 'fadeToBlack'
  | 'fadeToNext'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'dissolve';

// ============================================================================
// AUDIO TYPES
// ============================================================================

export interface V7WordTimestamp {
  word: string;
  start: number;  // seconds
  end: number;    // seconds
}

export interface V7AudioSegment {
  id: string;
  url: string;
  duration: number;
  wordTimestamps: V7WordTimestamp[];
}

export interface V7AudioTrack {
  url?: string;
  text?: string;
  duration?: number;
  volume?: number;
}

export interface V7SoundEffect {
  id: string;
  url: string;
  triggerAt?: number;
  volume?: number;
}

export interface V7ContextualLoop {
  triggerAfter: number;
  text: string;
  voice?: 'main' | 'whisper' | 'thought';
  volume: number;
  loop?: boolean;
}

export interface V7AudioBehavior {
  onStart: 'pause' | 'fadeToBackground' | 'continue' | 'switch';
  duringInteraction: {
    mainVolume: number;
    ambientVolume: number;
    contextualLoops?: V7ContextualLoop[];
  };
  onComplete: 'resume' | 'fadeIn' | 'next';
}

/**
 * Lesson audio configuration.
 * Main audio contains scene narrations.
 * Feedback audios contain specific narrations for each quiz option.
 */
export interface V7AudioConfig {
  /** Main audio with all scene narrations */
  mainAudio: V7AudioSegment;
  /** Quiz feedback audios, indexed by optionId */
  feedbackAudios?: Record<string, V7AudioSegment>;
}

// ============================================================================
// MICRO-VISUALS
// ============================================================================

export interface V7MicroVisual {
  id: string;
  type: V7MicroVisualType;
  anchorText: string;
  triggerTime?: number;  // C06: Optional - source of truth is anchorActions[type='show'].keywordTime
  duration: number;
  content: {
    // For image-flash
    description?: string;
    imageUrl?: string;
    storagePath?: string;  // Image Lab C12: private bucket path → resolved via signed URL
    assetId?: string;      // Image Lab C12: asset reference for audit trail
    // For text-pop
    text?: string;
    words?: string[];
    emoji?: string;
    // For number-count
    from?: number;
    to?: number;
    prefix?: string;
    suffix?: string;
    // For highlight
    side?: 'left' | 'right';
    pulse?: boolean;
    shake?: boolean;
    glow?: boolean;
    // For card-reveal
    cardId?: string;
    // For letter-reveal
    index?: number;
    // Common
    animation?: string;
    color?: string;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
}

// ============================================================================
// ANCHOR ACTIONS
// ============================================================================

export type V7AnchorActionType = 'pause' | 'resume' | 'show' | 'hide' | 'highlight' | 'trigger';

export interface V7AnchorAction {
  id: string;
  keyword: string;
  keywordTime?: number;
  type: V7AnchorActionType;
  targetId?: string;
  payload?: unknown;
  once?: boolean;
  delayMs?: number;
}

// ============================================================================
// TIMEOUT CONFIGURATION
// ============================================================================

export interface V7TimeoutConfig {
  soft: number;
  medium: number;
  hard: number;
  hints: string[];
  autoAction?: 'skip' | 'selectDefault' | 'continue';
}

export const DEFAULT_TIMEOUT_CONFIG: V7TimeoutConfig = {
  soft: 7,
  medium: 15,
  hard: 30,
  hints: [
    'Pense com calma...',
    'Não há resposta errada, seja honesto!',
    'Vamos continuar? Você pode voltar depois.'
  ],
  autoAction: 'continue'
};

// ============================================================================
// QUIZ AND INTERACTIONS
// ============================================================================

export interface V7QuizFeedback {
  title: string;
  subtitle: string;
  mood: 'success' | 'warning' | 'danger' | 'neutral';
  audioId?: string;
}

export interface V7QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  category?: 'good' | 'bad';
  feedback?: V7QuizFeedback;
  emoji?: string;
}

export interface V7QuizInteraction {
  type: 'quiz';
  question: string;
  options: V7QuizOption[];
  correctFeedback?: string;
  incorrectFeedback?: string;
  timeout?: V7TimeoutConfig;
}

export interface V7PlaygroundResult {
  title: string;
  content: string;
  score: number;
  maxScore?: number;
  verdict: 'bad' | 'good' | 'excellent';
}

export interface V7PlaygroundInteraction {
  type: 'playground';
  amateurPrompt: string;
  professionalPrompt: string;
  amateurResult: V7PlaygroundResult;
  professionalResult: V7PlaygroundResult;
  userChallenge?: {
    instruction: string;
    challengePrompt: string;
    hints: string[];
  };
}

export interface V7CTAInteraction {
  type: 'cta-button';
  buttonText: string;
  action: 'next-phase' | 'complete';
}

export type V7Interaction = V7QuizInteraction | V7PlaygroundInteraction | V7CTAInteraction;

export type V7InteractionType = 'quiz' | 'playground' | 'checkboxes' | 'button';

// ============================================================================
// VISUAL CONTENT TYPES
// ============================================================================

export interface V7NumberRevealContent {
  hookQuestion?: string;
  number: string;
  secondaryNumber?: string;
  subtitle?: string;
  mood?: V7Mood;
  countUp?: boolean;
  effect?: string;
}

export interface V7TextRevealContent {
  mainText?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ icon?: string; text: string }>;
  highlightWord?: string;
  mood?: V7Mood;
}

export interface V7SplitScreenContent {
  left: {
    label: string;
    mood: 'danger' | 'success' | 'warning';
    items: string[];
    emoji?: string;
  };
  right: {
    label: string;
    mood: 'danger' | 'success' | 'warning';
    items: string[];
    emoji?: string;
  };
}

export interface V7LetterRevealContent {
  word: string;
  letters: Array<{
    letter: string;
    meaning: string;
    subtitle?: string;
  }>;
  finalStamp?: string;
}

export interface V7CardsRevealContent {
  title: string;
  subtitle?: string;
  cards: Array<{
    id: string;
    text: string;
    icon?: string;
  }>;
  cta?: { text: string; action: string };
}

export interface V7QuizContent {
  question: string;
  mood?: V7Mood;
}

export interface V7QuizFeedbackContent {
  title: string;
  subtitle: string;
  mood: 'success' | 'warning' | 'danger';
  isCorrect: boolean;
}

export interface V7PlaygroundContent {
  title: string;
  subtitle?: string;
  instruction?: string;
}

export interface V7ResultContent {
  emoji?: string;
  title: string;
  message?: string;
  items?: string[];
  metrics?: Array<{
    label: string;
    value: string;
    isHighlight?: boolean;
  }>;
  ctaText?: string;
}

export interface V7CTAContent {
  title: string;
  subtitle?: string;
  buttonText: string;
}

// ============================================================================
// IMAGE SEQUENCE CONTENT (C12.1)
// ============================================================================

/**
 * A single frame in a cinematic image sequence.
 * Max 3 frames per sequence. Each frame >= 2000ms.
 */
export interface V7ImageSequenceFrame {
  id: string;
  promptScene: string;
  durationMs: number;
  presetKey?: string;
  storagePath?: string;
  assetId?: string;
}

/**
 * Content for image-sequence visual type.
 * Total duration must be >= 6000ms (3 frames × 2000ms min).
 */
export interface V7ImageSequenceContent {
  frames: V7ImageSequenceFrame[];
  /**
   * CANONICAL: lives at visual root level (alongside frames).
   * NOT inside visual.content. Same pattern as frames[].
   * - fullscreen: object-cover, aspect-video (default, legacy compat)
   * - mockup: device frame with object-contain, 65/35 grid on desktop
   */
  displayMode?: 'fullscreen' | 'mockup';
}

// ============================================================================
// 3D VISUAL CONTENT TYPES
// ============================================================================

export interface V73DScreenContent {
  title: string;
  content: string;
  style: 'amateur' | 'professional';
}

export interface V73DDualMonitorsContent {
  leftScreen: V73DScreenContent;
  rightScreen: V73DScreenContent;
  animation?: 'float' | 'static' | 'pulse';
}

export interface V73DAbstractContent {
  variant?: 'geometric' | 'organic' | 'particles' | 'mixed';
  intensity?: 'subtle' | 'normal' | 'intense';
  primaryColor?: string;
  secondaryColor?: string;
}

export interface V73DNumberRevealContent {
  number: string;
  subtitle?: string;
  secondaryNumber?: string;
  hookQuestion?: string;
  countUp?: boolean;
  countUpDuration?: number;
}

export type V7VisualContent =
  | { type: 'number-reveal'; content: V7NumberRevealContent }
  | { type: 'text-reveal'; content: V7TextRevealContent }
  | { type: 'split-screen'; content: V7SplitScreenContent }
  | { type: 'letter-reveal'; content: V7LetterRevealContent }
  | { type: 'cards-reveal'; content: V7CardsRevealContent }
  | { type: 'quiz'; content: V7QuizContent }
  | { type: 'quiz-feedback'; content: V7QuizFeedbackContent }
  | { type: 'playground'; content: V7PlaygroundContent }
  | { type: 'result'; content: V7ResultContent }
  | { type: 'cta'; content: V7CTAContent }
  | { type: 'image-sequence'; content: V7ImageSequenceContent }  // C12.1
  // === 3D Visual Types ===
  | { type: '3d-dual-monitors'; content: V73DDualMonitorsContent }
  | { type: '3d-abstract'; content: V73DAbstractContent }
  | { type: '3d-number-reveal'; content: V73DNumberRevealContent };

// ============================================================================
// PHASE STRUCTURE
// ============================================================================

export interface V7PhaseEffects {
  mood?: V7Mood;
  particles?: 'confetti' | 'sparks' | 'ember' | 'stars' | 'none';
  glow?: boolean;
  shake?: boolean;
  vignette?: boolean;
  grain?: boolean;
}

export interface V7Phase {
  id: string;
  title: string;
  type: V7PhaseType;
  startTime: number;
  endTime: number;
  visual: V7VisualContent;        // Compiled artifact (derived from scene[0])
  scenes: V7Scene[];              // C03: Sub-scenes with granular timing (min 1 per phase)
  effects?: V7PhaseEffects;
  microVisuals?: V7MicroVisual[];
  anchorActions?: V7AnchorAction[];
  interaction?: V7Interaction;
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
}

// ============================================================================
// SCENE (Sub-unit of Phase for granular control)
// ============================================================================

export interface V7Scene {
  id: string;
  type: string;
  startTime: number;              // C03: Required (seconds)
  endTime: number;                // C03: Required (seconds)
  duration: number;               // C03: Required (endTime - startTime)
  narration: string;              // C03: Narration text for this scene
  content: Record<string, unknown>;
  animation?: V7AnimationType;
}

// ============================================================================
// LESSON METADATA
// ============================================================================

export interface V7LessonMetadata {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  totalDuration: number;
  phaseCount: number;
  createdAt: string;
  generatedBy: 'V7-vv' | string;
}

// ============================================================================
// COMPLETE LESSON DATA
// ============================================================================

/**
 * Complete lesson structure generated by Pipeline.
 * Player consumes exactly this structure.
 */
export interface V7LessonData {
  model: 'v7-cinematic';
  version: 'vv' | '2.0' | '7.1';
  id?: string;
  metadata: V7LessonMetadata;
  phases: V7Phase[];
  audio: V7AudioConfig;
  
  // Legacy compatibility
  cinematicFlow?: { acts: unknown[]; timeline?: unknown };
  cinematic_flow?: { acts: unknown[]; timeline?: unknown };
}

// ============================================================================
// LESSON SCRIPT (Frontend representation)
// ============================================================================

export interface V7LessonScript {
  id: string;
  title: string;
  totalDuration: number;
  phases: V7Phase[];
  audioUrl?: string;
  wordTimestamps?: V7WordTimestamp[];
  audioConfig?: {
    mainAudioUrl?: string;
    ambientAudioUrl?: string;
    soundEffects?: Record<string, string>;
  };
  anchorPoints?: Array<{
    id: string;
    keyword: string;
    phaseId: string;
    action: V7AnchorActionType;
    targetId?: string;
  }>;
}

// ============================================================================
// PIPELINE INPUT (Script)
// ============================================================================

export interface V7ScriptInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  voice_id?: string;
  generate_audio?: boolean;
  fail_on_audio_error?: boolean;
  scenes: V7ScriptScene[];
}

export interface V7ScriptScene {
  id: string;
  title: string;
  type: V7PhaseType;
  narration: string;
  anchorText?: {
    pauseAt?: string;
    transitionAt?: string;
  };
  visual: {
    type: string;
    content: Record<string, unknown>;
    effects?: Record<string, unknown>;
    microVisuals?: Array<{
      id: string;
      type: V7MicroVisualType;
      anchorText: string;
      content: Record<string, unknown>;
    }>;
  };
  interaction?: {
    type: 'quiz' | 'playground' | 'cta-button';
    options?: Array<{
      id: string;
      text: string;
      isCorrect?: boolean;
      feedback?: {
        title: string;
        subtitle: string;
        narration?: string;
        mood: string;
      };
    }>;
    amateurPrompt?: string;
    professionalPrompt?: string;
    amateurResult?: Record<string, unknown>;
    professionalResult?: Record<string, unknown>;
    timeout?: Record<string, unknown>;
    buttonText?: string;
    action?: string;
  };
}

// ============================================================================
// PIPELINE RESPONSE
// ============================================================================

export interface V7PipelineResponse {
  success: boolean;
  lessonId?: string;
  content?: V7LessonData;
  audioUrl?: string;
  wordTimestampsCount?: number;
  warnings?: V7PipelineWarning[];
  stats?: V7PipelineStats;
  error?: string;
}

export interface V7PipelineWarning {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  action?: string;
}

export interface V7PipelineStats {
  actCount: number;
  narrationCount: number;
  actTypes: Record<string, number>;
  totalDuration: number;
  hasAudio: boolean;
  hasWordTimestamps: boolean;
  audioSource: string;
  audioError?: string | null;
}

// ============================================================================
// PLAYER STATE
// ============================================================================

export type V7PlayerStatus =
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'waiting-interaction'
  | 'showing-feedback'
  | 'completed'
  | 'ended'
  | 'error';

/**
 * Player state for V7PhasePlayer (new unified state)
 */
export interface V7PlayerState {
  status: V7PlayerStatus;
  currentPhaseIndex: number;
  currentSceneIndex?: number;
  currentTime: number;
  isInteracting?: boolean;
  audioState?: 'playing' | 'paused' | 'background' | 'muted';
  fullscreen?: boolean;
  progress: number;
  activeInteraction?: {
    phaseId: string;
    selectedOptionId?: string;
    startedAt: number;
  };
  interactionResults: Record<string, {
    optionId: string;
    isCorrect: boolean;
    timestamp: number;
  }>;
  completedPhases: string[];
  score: number;
}

/**
 * Player state for V7CinematicPlayer (legacy format)
 * Used by the older cinematic player implementation
 */
export interface V7CinematicPlayerState {
  currentActId: string | null;
  currentTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
  playbackRate: number;
  completedActs: string[];
  interactionResults: Record<string, unknown>;
  score: number;
  xp: number;
  achievements: string[];
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface V7Analytics {
  trackInteractions: boolean;
  trackTime: boolean;
  trackSkips: boolean;
  webhookUrl?: string;
}

export interface V7InteractionResult {
  actId: string;
  type: V7InteractionType;
  selected: string | string[];
  timeToComplete: number;
  hadHints: boolean;
  autoCompleted: boolean;
}

export interface V7SessionAnalytics {
  sessionId: string;
  lessonId: string;
  startedAt: Date;
  completedAt?: Date;
  totalTime: number;
  interactions: V7InteractionResult[];
  skippedActs: string[];
  completionRate: number;
}

// ============================================================================
// DEFAULT AUDIO BEHAVIORS
// ============================================================================

export const DEFAULT_AUDIO_BEHAVIORS: Record<V7InteractionType, V7AudioBehavior> = {
  quiz: {
    onStart: 'pause',
    duringInteraction: {
      mainVolume: 0,
      ambientVolume: 0.3,
      contextualLoops: [
        { triggerAfter: 10, text: 'Pense com calma...', volume: 0.3, voice: 'whisper' },
        { triggerAfter: 20, text: 'Reflita sobre sua resposta...', volume: 0.3, voice: 'whisper' }
      ]
    },
    onComplete: 'resume'
  },
  playground: {
    onStart: 'pause',
    duringInteraction: {
      mainVolume: 0,
      ambientVolume: 0,
      contextualLoops: []
    },
    onComplete: 'resume'
  },
  checkboxes: {
    onStart: 'fadeToBackground',
    duringInteraction: {
      mainVolume: 0.3,
      ambientVolume: 0.3,
      contextualLoops: []
    },
    onComplete: 'fadeIn'
  },
  button: {
    onStart: 'fadeToBackground',
    duringInteraction: {
      mainVolume: 0.3,
      ambientVolume: 0.4,
      contextualLoops: []
    },
    onComplete: 'next'
  }
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isV7Phase(obj: unknown): obj is V7Phase {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'startTime' in obj
  );
}

export function isV7WordTimestamp(obj: unknown): obj is V7WordTimestamp {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'word' in obj &&
    'start' in obj &&
    'end' in obj
  );
}

export function isQuizInteraction(interaction: V7Interaction): interaction is V7QuizInteraction {
  return interaction.type === 'quiz';
}

export function isPlaygroundInteraction(interaction: V7Interaction): interaction is V7PlaygroundInteraction {
  return interaction.type === 'playground';
}

export function isCTAInteraction(interaction: V7Interaction): interaction is V7CTAInteraction {
  return interaction.type === 'cta-button';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize word timestamp to consistent format
 */
export function normalizeTimestamp(ts: Record<string, unknown>): V7WordTimestamp {
  return {
    word: (ts.word as string) || '',
    start: (ts.start as number) ?? (ts.start_time as number) ?? 0,
    end: (ts.end as number) ?? (ts.end_time as number) ?? 0,
  };
}

/**
 * Extract narration text from various formats
 */
export function extractNarration(act: Record<string, unknown>): string {
  if (typeof act.narration === 'string') return act.narration;
  const content = act.content as Record<string, unknown> | undefined;
  if (content?.audio) {
    const audio = content.audio as Record<string, unknown>;
    if (typeof audio.narration === 'string') return audio.narration;
    const segment = audio.narrationSegment as Record<string, unknown> | undefined;
    if (segment?.text && typeof segment.text === 'string') return segment.text;
  }
  return '';
}
