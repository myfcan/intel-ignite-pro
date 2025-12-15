// src/types/v7-cinematic.types.ts
// Type definitions for V7 Cinematic Lesson System

// ============================================================================
// CORE LESSON STRUCTURE
// ============================================================================

export interface V7CinematicLesson {
  id: string;
  model: 'v7-cinematic';
  title: string;
  subtitle?: string;
  duration: number; // Total duration in seconds
  metadata: V7Metadata;
  cinematicFlow: CinematicFlow;
  audioTrack: AudioTrack;
  interactionPoints: InteractionPoint[];
  gamification: GamificationConfig;
  analytics?: AnalyticsConfig;
}

export interface V7Metadata {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  description: string;
  learningObjectives: string[];
  prerequisites?: string[];
  estimatedTime: number; // in minutes
  version: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

// ============================================================================
// CINEMATIC FLOW
// ============================================================================

export interface CinematicFlow {
  acts: CinematicAct[];
  timeline: Timeline;
  transitions: TransitionConfig[];
  theme?: ThemeConfig;
}

export interface CinematicAct {
  id: string;
  type: 'narrative' | 'interactive' | 'challenge' | 'revelation' | 'outro';
  title: string;
  startTime: number; // in seconds
  duration: number; // in seconds
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

export interface VisualLayer {
  id: string;
  type: 'text' | 'image' | 'code' | 'playground' | 'comparison' | 'animation';
  zIndex: number;
  position: {
    x: number | string; // pixels or percentage
    y: number | string;
    width: number | string;
    height: number | string;
  };
  content: any; // Specific content based on type
  animation?: LayerAnimation;
  interactive?: boolean;
  style?: Record<string, string | number>; // Custom inline styles for the layer
}

export interface LayerAnimation {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
  duration: number; // in milliseconds
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  keyframes?: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  time: number; // 0-1 (percentage of animation)
  properties: Record<string, any>;
}

// ============================================================================
// AUDIO SYSTEM
// ============================================================================

export interface AudioTrack {
  narration: AudioFile;
  backgroundMusic?: AudioFile;
  soundEffects?: SoundEffect[];
  syncPoints: SyncPoint[];
  volume?: {
    narration: number; // 0-1
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
    text?: string; // For subtitles
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
  timestamp: number; // in seconds
  actId: string;
  type: 'act-start' | 'act-end' | 'interaction' | 'highlight' | 'transition';
  action?: SyncAction;
}

export interface SyncAction {
  type: 'pause' | 'highlight' | 'zoom' | 'reveal' | 'execute';
  target?: string;
  duration?: number;
  parameters?: Record<string, any>;
}

// ============================================================================
// INTERACTIONS
// ============================================================================

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
  parameters?: Record<string, any>;
}

export interface InteractionContent {
  question?: string;
  options?: InteractionOption[];
  codeTemplate?: string;
  expectedCode?: string; // Expected code for AI comparison
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
  rule: string | ((value: any) => boolean);
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

// ============================================================================
// COMPARATIVE PLAYGROUND
// ============================================================================

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

export interface EditorAnnotation {
  line: number;
  type: 'info' | 'warning' | 'error' | 'success';
  text: string;
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
  weight: number; // 0-1
}

export interface PlaygroundFeedback {
  type: 'live' | 'on-submit' | 'continuous';
  aiEnabled: boolean;
  showDiff: boolean;
  suggestions: string[];
}

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================

export interface TransitionConfig {
  id: string;
  fromActId: string;
  toActId: string;
  effect: TransitionEffect;
  duration: number; // in milliseconds
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

// ============================================================================
// TIMELINE SYSTEM
// ============================================================================

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

// ============================================================================
// GAMIFICATION
// ============================================================================

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
  reward: number; // XP amount
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCondition {
  type: 'complete-all-acts' | 'perfect-score' | 'speed-run' | 'no-hints' | 'custom';
  parameters?: Record<string, any>;
}

export interface ScoringConfig {
  maxScore: number;
  criteria: ScoreCriterion[];
  penalties?: Penalty[];
}

export interface ScoreCriterion {
  id: string;
  name: string;
  weight: number; // 0-1
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

// ============================================================================
// ANALYTICS
// ============================================================================

export interface AnalyticsConfig {
  enabled: boolean;
  events: AnalyticsEvent[];
  metrics: AnalyticsMetric[];
}

export interface AnalyticsEvent {
  type: 'act-start' | 'act-complete' | 'interaction' | 'pause' | 'seek' | 'complete';
  timestamp: number;
  data?: Record<string, any>;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
}

// ============================================================================
// PLAYER STATE
// ============================================================================

export interface V7PlayerState {
  currentActId: string | null;
  currentTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
  playbackRate: number;
  completedActs: string[];
  interactionResults: Record<string, any>;
  score: number;
  xp: number;
  achievements: string[];
}

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  fonts?: {
    heading: string;
    body: string;
    code: string;
  };
  borderRadius?: number;
  shadows?: boolean;
}

// ============================================================================
// V7 PIPELINE INPUT
// ============================================================================

export interface V7PipelineInput {
  title: string;
  subtitle?: string;
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  narrativeScript: string; // Raw narrative text for AI processing
  codeExamples?: CodeExample[];
  interactionPoints?: PipelineInteraction[];
  duration?: number; // Suggested duration
  theme?: Partial<ThemeConfig>;
}

export interface CodeExample {
  id: string;
  type: 'amateur' | 'professional';
  language: string;
  code: string;
  explanation?: string;
}

export interface PipelineInteraction {
  timestamp: number;
  type: 'quiz' | 'code-challenge' | 'choice';
  content: any;
}
