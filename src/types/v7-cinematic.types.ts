/**
 * V7 Cinematic Types - DEPRECATED
 * ================================
 * 
 * @deprecated This file is maintained for backward compatibility only.
 * All types have been moved to V7Contract.ts which is the single source of truth.
 * 
 * Please update your imports to use:
 * import type { ... } from '@/types/V7Contract';
 * 
 * Or use the compatibility layer:
 * import type { ... } from '@/types/v7-unified.types';
 */

// Re-export everything from V7Contract for backward compatibility
export * from './V7Contract';

// ============================================================================
// LEGACY CINEMATIC TYPES (Mapped to V7Contract types)
// ============================================================================

import type { 
  V7LessonData,
  V7Phase,
  V7PhaseType,
  V7Mood,
  V7AudioConfig,
  V7Interaction,
  V7TimeoutConfig,
  V7AudioBehavior,
  V7Analytics
} from './V7Contract';

// Legacy interface - maps to V7LessonData
export interface V7CinematicLesson {
  id: string;
  model: 'v7-cinematic';
  title: string;
  subtitle?: string;
  duration: number;
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    tags: string[];
    description: string;
    learningObjectives: string[];
    prerequisites?: string[];
    estimatedTime: number;
    version: string;
    createdAt: string;
    updatedAt: string;
    author?: string;
  };
  cinematicFlow: {
    acts: CinematicAct[];
    timeline: Timeline;
    transitions: TransitionConfig[];
    theme?: ThemeConfig;
  };
  audioTrack: AudioTrack;
  interactionPoints: InteractionPoint[];
  gamification: GamificationConfig;
  analytics?: AnalyticsConfig;
}

// Legacy act structure
export interface CinematicAct {
  id: string;
  type: 'narrative' | 'interactive' | 'challenge' | 'revelation' | 'outro';
  title: string;
  startTime: number;
  duration: number;
  content: ActContent;
  interactions?: ActInteraction[];
  transitions: {
    in: TransitionEffect;
    out: TransitionEffect;
  };
  metadata?: {
    importance: 'low' | 'medium' | 'high';
    skipable: boolean;
  };
}

export interface ActContent {
  visual: VisualContent;
  audio: AudioContent;
  animations: Animation[];
  particles?: ParticleEffect[];
  overlay?: OverlayContent;
}

export interface VisualContent {
  type: 'slide' | 'video' | 'canvas' | 'split-screen' | 'interactive';
  background?: {
    type: 'color' | 'gradient' | 'image' | 'video';
    value: string;
    blur?: number;
    opacity?: number;
  };
  layers: VisualLayer[];
}

export interface VisualLayerContent {
  // Text content
  text?: string;
  html?: string;
  // Image content
  url?: string;
  alt?: string;
  // Code content
  code?: string;
  language?: string;
  // Playground content
  playgroundId?: string;
  // Quiz content
  question?: string;
  options?: unknown[];
  choices?: unknown[];
  // Generic
  [key: string]: unknown;
}

export interface VisualLayer {
  id: string;
  type: 'text' | 'image' | 'code' | 'playground' | 'comparison' | 'animation';
  zIndex: number;
  position: {
    x: number | string;
    y: number | string;
    width: number | string;
    height: number | string;
  };
  // Use 'any' for backward compatibility with existing code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  animation?: LayerAnimation;
  interactive?: boolean;
  style?: Record<string, string | number>;
}

export interface LayerAnimation {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
  duration: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  keyframes?: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  time: number;
  properties: Record<string, unknown>;
}

export interface AudioTrack {
  narration: AudioFile;
  backgroundMusic?: AudioFile;
  soundEffects?: SoundEffect[];
  syncPoints: SyncPoint[];
  volume?: {
    narration: number;
    music: number;
    effects: number;
  };
}

export interface AudioFile {
  url: string;
  duration: number;
  format: 'mp3' | 'wav' | 'ogg';
  transcription?: string;
}

export interface AudioContent {
  narrationSegment?: {
    start: number;
    end: number;
    text?: string;
  };
  musicVolume?: number;
  effects?: SoundEffect[];
}

export interface SoundEffect {
  id: string;
  url: string;
  triggerTime: number;
  volume?: number;
  loop?: boolean;
}

export interface SyncPoint {
  id: string;
  timestamp: number;
  actId: string;
  type: 'act-start' | 'act-end' | 'interaction' | 'highlight' | 'transition';
  action?: SyncAction;
}

export interface SyncAction {
  type: 'pause' | 'highlight' | 'zoom' | 'reveal' | 'execute';
  target?: string;
  duration?: number;
  parameters?: Record<string, unknown>;
}

export interface InteractionPoint {
  id: string;
  timestamp: number;
  actId: string;
  type: 'quiz' | 'code-challenge' | 'choice' | 'feedback' | 'reflection';
  required: boolean;
  content: InteractionContent;
  validation?: ValidationRule[];
  feedback?: FeedbackConfig;
  points?: number;
}

export interface ActInteraction {
  id: string;
  type: 'click' | 'hover' | 'input' | 'drag' | 'choice';
  trigger: InteractionTrigger;
  response: InteractionResponse;
  validation?: ValidationRule[];
}

export interface InteractionTrigger {
  element?: string;
  condition?: string;
  delay?: number;
}

export interface InteractionResponse {
  type: 'visual' | 'audio' | 'navigation' | 'feedback';
  action: string;
  parameters?: Record<string, unknown>;
}

export interface InteractionContent {
  question?: string;
  options?: InteractionOption[];
  codeTemplate?: string;
  expectedCode?: string;
  placeholder?: string;
  hint?: string;
}

export interface InteractionOption {
  id: string;
  text: string;
  correct?: boolean;
  feedback?: string;
}

export interface ValidationRule {
  type: 'regex' | 'function' | 'comparison' | 'custom';
  rule: string | ((value: unknown) => boolean);
  message: string;
}

export interface FeedbackConfig {
  onSuccess?: FeedbackMessage;
  onError?: FeedbackMessage;
  realTime?: boolean;
  aiAnalysis?: boolean;
}

export interface FeedbackMessage {
  type: 'text' | 'audio' | 'visual' | 'combined';
  content: string;
  duration?: number;
  animation?: string;
}

export interface TransitionConfig {
  id: string;
  fromActId: string;
  toActId: string;
  effect: TransitionEffect;
  duration: number;
  timing?: string;
}

export interface TransitionEffect {
  type: 'fade' | 'slide' | 'zoom' | 'dissolve' | 'wipe' | 'custom';
  direction?: 'up' | 'down' | 'left' | 'right';
  easing?: string;
  customCSS?: string;
}

export interface Animation {
  id: string;
  target: string;
  type: 'entrance' | 'emphasis' | 'exit' | 'motion';
  effect: string;
  duration: number;
  delay?: number;
  iteration?: number | 'infinite';
}

export interface ParticleEffect {
  id: string;
  type: 'confetti' | 'sparkles' | 'snow' | 'stars' | 'custom';
  density: number;
  colors?: string[];
  velocity?: { x: number; y: number };
  lifetime?: number;
}

export interface OverlayContent {
  type: 'subtitle' | 'caption' | 'tooltip' | 'notification';
  content: string;
  position: 'top' | 'bottom' | 'center' | 'custom';
  style?: React.CSSProperties;
}

export interface Timeline {
  totalDuration: number;
  acts: TimelineAct[];
  markers: TimelineMarker[];
  chapters?: TimelineChapter[];
}

export interface TimelineAct {
  actId: string;
  startTime: number;
  endTime: number;
  thumbnail?: string;
  color?: string;
}

export interface TimelineMarker {
  id: string;
  timestamp: number;
  type: 'interaction' | 'checkpoint' | 'highlight' | 'bookmark';
  label?: string;
  icon?: string;
}

export interface TimelineChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  thumbnail?: string;
}

export interface GamificationConfig {
  enabled: boolean;
  xpRewards: XPReward[];
  achievements: Achievement[];
  scoring: ScoringConfig;
  leaderboard?: LeaderboardConfig;
}

export interface XPReward {
  id: string;
  event: 'act-complete' | 'interaction-success' | 'challenge-complete' | 'perfect-score';
  amount: number;
  multiplier?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  condition: AchievementCondition;
  reward: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCondition {
  type: 'complete-all-acts' | 'perfect-score' | 'speed-run' | 'no-hints' | 'custom';
  parameters?: Record<string, unknown>;
}

export interface ScoringConfig {
  maxScore: number;
  criteria: ScoreCriterion[];
  penalties?: Penalty[];
}

export interface ScoreCriterion {
  id: string;
  name: string;
  weight: number;
  maxPoints: number;
}

export interface Penalty {
  type: 'time' | 'hint' | 'attempt' | 'skip';
  amount: number;
}

export interface LeaderboardConfig {
  enabled: boolean;
  scope: 'global' | 'trail' | 'lesson';
  refreshInterval?: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  events: AnalyticsEvent[];
  metrics: AnalyticsMetric[];
}

export interface AnalyticsEvent {
  type: 'act-start' | 'act-complete' | 'interaction' | 'pause' | 'seek' | 'complete';
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
}

export interface ThemeConfig {
  // Flat format (used in some places)
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  accent?: string;
  // Nested format (legacy)
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    accent?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
    code?: string;
  };
  spacing?: {
    base?: number;
    scale?: number;
  };
  borderRadius?: string | number;
  shadows?: string | boolean;
}

// V7 Player State (legacy - used by V7CinematicPlayer)
export interface V7CinematicPlayerState {
  status: 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';
  currentActIndex: number;
  currentTime: number;
  isInteracting: boolean;
  audioState: 'playing' | 'paused' | 'background' | 'muted';
  fullscreen: boolean;
  progress: number;
}

// ============================================================================
// MISSING TYPES FOR BACKWARD COMPATIBILITY
// ============================================================================

// V7PlayerState used by V7CinematicPlayer (different from V7Contract.V7PlayerState)
export interface V7PlayerState {
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

// V7PipelineInput for pipeline services
export interface V7PipelineInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  narrativeScript?: string;
  duration?: number;
  trail_id?: string;
  order_index?: number;
  voice_id?: string;
  generate_audio?: boolean;
  audioConfig?: {
    narrationVoice?: string;
    voiceSettings?: unknown;
    backgroundMusic?: unknown;
    soundEffects?: unknown[];
  };
  anchorPoints?: Array<{
    id: string;
    keyword: string;
    phaseId: string;
    action: string;
    targetId?: string;
  }>;
  cinematic_flow?: {
    acts: unknown[];
    timeline?: { totalDuration?: number; chapters?: unknown[] };
  };
  theme?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    accent?: string;
    fonts?: {
      heading?: string;
      body?: string;
      code?: string;
    };
    borderRadius?: string;
    shadows?: string;
  };
}

// EditorAnnotation for CodeEditor
export interface EditorAnnotation {
  line: number;
  type: 'info' | 'warning' | 'error' | 'success';
  text: string;
}

// ComparativePlayground for ComparativePlaygroundSplit
export interface ComparativePlayground {
  id: string;
  type: 'amateur-vs-professional';
  layout: 'split-vertical' | 'split-horizontal' | 'overlay';
  amateur: PlaygroundPane;
  professional: PlaygroundPane;
  comparison: ComparisonConfig;
  feedback: PlaygroundFeedback;
}

export interface PlaygroundPane {
  id: string;
  title: string;
  description?: string;
  editor: EditorConfig;
  preview: PreviewConfig;
  guidance?: GuidanceConfig;
}

export interface EditorConfig {
  language: string;
  initialCode: string;
  readOnly: boolean;
  highlightLines?: number[];
  annotations?: EditorAnnotation[];
  theme?: string;
}

export interface PreviewConfig {
  type: 'iframe' | 'canvas' | 'console' | 'none';
  autoRefresh: boolean;
  showConsole?: boolean;
}

export interface GuidanceConfig {
  hints: string[];
  bestPractices: string[];
  commonMistakes: string[];
  aiAssistance?: boolean;
}

export interface ComparisonConfig {
  metrics: ComparisonMetric[];
  highlights: ComparisonHighlight[];
  analysis: AnalysisConfig;
}

export interface ComparisonMetric {
  id: string;
  name: string;
  amateurValue: number | string;
  professionalValue: number | string;
  unit?: string;
  description?: string;
}

export interface ComparisonHighlight {
  id: string;
  title: string;
  description: string;
  amateurLines?: number[];
  professionalLines?: number[];
  importance: 'low' | 'medium' | 'high';
}

export interface AnalysisConfig {
  enabled: boolean;
  realTime: boolean;
  aspects: AnalysisAspect[];
}

export interface AnalysisAspect {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface PlaygroundFeedback {
  type: 'live' | 'on-submit' | 'continuous';
  aiEnabled: boolean;
  showDiff: boolean;
  suggestions: string[];
}
