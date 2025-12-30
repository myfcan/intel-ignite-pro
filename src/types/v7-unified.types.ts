/**
 * V7-v2 Unified Types
 * ====================
 *
 * Central type definitions for the V7 Cinematic Lesson System.
 * This file consolidates types from multiple sources to provide
 * a single source of truth for the type system.
 *
 * USAGE:
 * import type { V7Phase, V7AudioBehavior, AnchorAction } from '@/types/v7-unified.types';
 *
 * ARCHITECTURE:
 * - Pipeline (backend) outputs: cinematic_flow.acts
 * - Frontend transforms to: V7LessonScript.phases
 * - Types here bridge both worlds
 */

// ============================================================================
// RE-EXPORTS FROM EXISTING TYPE FILES
// ============================================================================

export type {
  V7ActType,
  V7AnimationType,
  V7SceneType,
  V7InteractionType,
  V7Mood,
  V7AudioTrack,
  V7SoundEffect,
  V7ParticleEffect,
  V7Animation,
  V7TransitionType,
  V7Transition,
  V7SyncPoint,
  V7Timeline,
  V7QuizOption,
  V7PlaygroundConfig,
  V7PlayerState,
  V7Analytics,
  V7InteractionResult,
  V7SessionAnalytics,
  V7LessonData,
} from './v7.types';

export {
  DEFAULT_TIMEOUT_CONFIG,
  DEFAULT_AUDIO_BEHAVIORS,
} from './v7.types';

// ============================================================================
// ANCHOR ACTIONS (for keyword-based pause sync)
// ============================================================================

export type AnchorActionType = 'pause' | 'resume' | 'show' | 'hide' | 'highlight' | 'trigger';

export interface AnchorAction {
  id: string;
  keyword: string;
  type: AnchorActionType;
  targetId?: string;
  payload?: any;
  once?: boolean;       // Default: true - action triggers only once
  delayMs?: number;     // Delay before executing action
}

export interface AnchorEvent {
  action: AnchorAction;
  timestamp: number;
  wordTimestamp: WordTimestamp;
}

// ============================================================================
// WORD TIMESTAMPS
// ============================================================================

export interface WordTimestamp {
  word: string;
  start: number;    // Start time in seconds
  end: number;      // End time in seconds
}

// Alias for backward compatibility
export type V7WordTimestamp = WordTimestamp;

// ============================================================================
// AUDIO BEHAVIOR (V7-v2)
// ============================================================================

export interface V7ContextualLoop {
  triggerAfter: number;   // Seconds after interaction starts
  text: string;           // Text to speak (TTS) or audio URL
  volume: number;         // Volume level (0-1)
  loop?: boolean;         // Whether to loop
  voice?: 'main' | 'whisper' | 'thought';
}

export interface V7AudioBehavior {
  onStart: 'pause' | 'fadeToBackground' | 'continue' | 'switch';
  duringInteraction: {
    mainVolume: number;       // Main narration volume (0-1)
    ambientVolume: number;    // Ambient audio volume (0-1)
    contextualLoops?: V7ContextualLoop[];
  };
  onComplete: 'resume' | 'fadeIn' | 'next';
}

// ============================================================================
// TIMEOUT CONFIG (V7-v2 Progressive Hints)
// ============================================================================

export interface V7TimeoutConfig {
  soft: number;           // First hint (seconds), default: 7
  medium: number;         // Second hint (seconds), default: 15
  hard: number;           // Auto-action (seconds), default: 30
  hints: string[];        // Hint messages [soft, medium, hard]
  autoAction?: 'skip' | 'selectDefault' | 'continue';
}

// ============================================================================
// INTERACTION CONFIG
// ============================================================================

export interface V7InteractionConfig {
  type: 'quiz' | 'playground' | 'checkboxes' | 'button';
  config: any;            // Type-specific config
  audioBehavior: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
}

// ============================================================================
// SCENE CONTENT (comprehensive)
// ============================================================================

export interface V7SceneContent {
  // Basic text fields
  mainText?: string;
  subtitle?: string;
  number?: string;
  secondaryNumber?: string;
  highlightWord?: string;
  title?: string;
  hookQuestion?: string;

  // Lists and collections
  items?: any[];
  options?: any[];
  metrics?: any[];
  hints?: string[];
  successCriteria?: string[];

  // Playground comparison
  challenge?: string;
  context?: string;
  amateurPrompt?: string;
  professionalPrompt?: string;
  amateurResult?: V7PlaygroundResult | string;
  professionalResult?: V7PlaygroundResult | string;
  amateurScore?: number;
  professionalScore?: number;

  // Quiz/Interaction
  correctFeedback?: string;
  incorrectFeedback?: string;
  revealGoodMessage?: string;
  revealBadMessage?: string;

  // Additional context
  narration?: string;
  explanation?: string;
  tip?: string;
  warning?: string;
  ctaTitle?: string;
  ctaOptions?: any[];

  // Animation/Visual effects
  backgroundColor?: string;
  aspectRatio?: string;
  glowEffect?: boolean;
  glowColor?: string;
  countUpAnimation?: boolean | string;
  particleType?: string;
  particleColor?: string;
  letterByLetter?: boolean;
  cameraZoom?: boolean;
  cameraShake?: boolean;
  particleEffect?: string;
  pulseEffect?: boolean;
  pulseColor?: string;
  glitchEffect?: boolean;
  typewriterSpeed?: number;
  particles?: boolean | string;
  confettiOnSelect?: boolean;
}

export interface V7PlaygroundResult {
  title?: string;
  content?: string;
  score?: number;
  maxScore?: number;
  verdict?: string;
}

// ============================================================================
// SCENE
// ============================================================================

export type V7SceneTypeExtended =
  | 'text-reveal' | 'number-reveal' | 'split-screen' | 'comparison'
  | 'quiz' | 'result' | 'playground' | 'cards-reveal' | 'cta' | 'gamification'
  | 'letterbox' | 'particle-effect'
  // Quiz sub-scenes
  | 'quiz-intro' | 'quiz-question' | 'quiz-options' | 'quiz-result'
  // Playground sub-scenes
  | 'playground-intro' | 'playground-code' | 'playground-result';

export type V7AnimationTypeExtended =
  | 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'explode'
  | 'count-up' | 'letter-by-letter' | 'scale-up' | 'particle-burst'
  | 'zoom-in' | 'letterbox' | 'glitch';

export interface V7Scene {
  id: string;
  startWord?: number;       // Word index to start
  startTime?: number;       // Time in seconds
  duration?: number;
  type: V7SceneTypeExtended;
  content: V7SceneContent;
  animation: V7AnimationTypeExtended;
}

// ============================================================================
// PHASE (Frontend representation of Acts)
// ============================================================================

export type V7PhaseType =
  | 'loading' | 'dramatic' | 'narrative' | 'comparison' | 'interaction'
  | 'playground' | 'revelation' | 'gamification' | 'secret-reveal';

export interface V7Phase {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  type: V7PhaseType;
  scenes: V7Scene[];
  mood?: 'danger' | 'success' | 'warning' | 'neutral' | 'dramatic';
  autoAdvance?: boolean;

  // Anchor-based synchronization
  anchorActions?: AnchorAction[];
  pauseKeywords?: string[];     // Legacy
  resumeKeywords?: string[];    // Legacy

  // V7-v2 interaction configuration
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
}

// ============================================================================
// AUDIO CONFIG (Lesson-level)
// ============================================================================

export interface V7SoundEffectsConfig {
  click?: string;
  select?: string;
  success?: string;
  error?: string;
  hint?: string;
  timeout?: string;
  whoosh?: string;
  reveal?: string;
}

export interface V7AudioConfig {
  mainAudioUrl?: string;
  ambientAudioUrl?: string;
  soundEffects?: V7SoundEffectsConfig;
}

// ============================================================================
// V7.1: NO FALLBACKS - AnchorText is the ONLY sync mechanism
// ============================================================================
// Fallback config has been removed. Interactive phases MUST have:
// 1. wordTimestamps (from ElevenLabs TTS)
// 2. anchorActions or pauseKeywords (to define when to pause)
// Without these, the phase will play through without pausing.

// ============================================================================
// GLOBAL ANCHOR POINTS
// ============================================================================

export interface V7AnchorPoint {
  id: string;
  keyword: string;
  phaseId: string;
  action: 'pause' | 'show' | 'highlight' | 'trigger';
  targetId?: string;
  once?: boolean;
}

// ============================================================================
// LESSON SCRIPT (Frontend main interface)
// ============================================================================

export interface V7LessonScript {
  id: string;
  title: string;
  totalDuration: number;
  phases: V7Phase[];
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];

  // V7.1 configuration (NO FALLBACKS - AnchorText only)
  audioConfig?: V7AudioConfig;
  anchorPoints?: V7AnchorPoint[];
}

// ============================================================================
// PIPELINE TYPES (Backend → Frontend bridge)
// ============================================================================

/**
 * Input to the V7 Pipeline edge function.
 * This is what the admin sends when creating a lesson.
 */
export interface V7PipelineInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  narrativeScript?: string;
  duration: number;
  trail_id?: string;
  order_index?: number;
  voice_id?: string;
  generate_audio?: boolean;

  // V7.1 audio config (NO FALLBACKS - AnchorText only)
  audioConfig?: {
    narrationVoice?: string;
    voiceSettings?: any;
    backgroundMusic?: any;
    soundEffects?: any[];
  };

  anchorPoints?: V7AnchorPoint[];

  // Rich cinematic flow (V7-v2 format)
  cinematic_flow?: {
    acts: V7PipelineAct[];
    timeline?: { totalDuration?: number; chapters?: any[] };
  };
}

/**
 * Act structure as sent to/from the pipeline.
 * Supports both V7-v2 (direct) and legacy (nested) formats.
 */
export interface V7PipelineAct {
  id?: string;
  type: string;
  title?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;

  // V7-v2 format (direct at act level)
  narration?: string;
  visual?: any;
  audio?: any;
  transitions?: any;
  anchorPoints?: any[];
  interaction?: any;
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
  tracking?: any;

  // Legacy format (nested in content)
  content?: {
    visual?: any;
    audio?: { narration?: string; narrationSegment?: { text: string } };
    interaction?: any;
    audioBehavior?: V7AudioBehavior;
    timeout?: V7TimeoutConfig;
    [key: string]: any;
  };
}

/**
 * Response from the V7 Pipeline.
 */
export interface V7PipelineResponse {
  success: boolean;
  lessonId?: string;
  content?: any;
  audioUrl?: string;
  wordTimestampsCount?: number;
  warnings?: V7PipelineWarning[];
  stats?: V7PipelineStats;
  aiSummary?: string;
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
// AUDIO MANAGER TYPES
// ============================================================================

export type InteractionState =
  | 'idle'
  | 'waiting'
  | 'thinking'
  | 'stuck'
  | 'struggling'
  | 'abandoned';

export type SoundEffectType =
  | 'click' | 'select' | 'success' | 'error'
  | 'hint' | 'timeout' | 'whoosh' | 'reveal';

// ============================================================================
// VISUAL CONTENT (from v7.types.ts)
// ============================================================================

export interface V7VisualContent {
  title?: string;
  mainText?: string;
  subtitle?: string;
  number?: string;
  secondaryNumber?: string;
  highlightWord?: string;
  hookQuestion?: string;
  items?: any[];
  options?: any[];
  backgroundColor?: string;
  mood?: 'danger' | 'success' | 'neutral' | 'warning';
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isV7Phase(obj: any): obj is V7Phase {
  return obj && typeof obj.id === 'string' && typeof obj.startTime === 'number' && Array.isArray(obj.scenes);
}

export function isWordTimestamp(obj: any): obj is WordTimestamp {
  return obj && typeof obj.word === 'string' && typeof obj.start === 'number' && typeof obj.end === 'number';
}

export function hasV7v2Format(act: any): boolean {
  return !!(act.narration || act.audioBehavior || act.timeout);
}

export function hasLegacyFormat(act: any): boolean {
  return !!(act.content?.audio?.narration || act.content?.audio?.narrationSegment);
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract narration from act (supports both V7-v2 and legacy formats)
 */
export function extractNarration(act: V7PipelineAct): string {
  return act.narration ||
         act.content?.audio?.narration ||
         act.content?.audio?.narrationSegment?.text ||
         '';
}

/**
 * Normalize word timestamps to consistent format
 */
export function normalizeTimestamp(ts: any): WordTimestamp {
  return {
    word: ts.word || '',
    start: ts.start ?? ts.start_time ?? 0,
    end: ts.end ?? ts.end_time ?? 0,
  };
}
