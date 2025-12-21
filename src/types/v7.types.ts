// V7-v2 Cinematic Types - Tipos completos para o sistema V7
// Modelo cinematográfico com áudio inteligente e interações contextuais

// ==========================================
// TIPOS BASE
// ==========================================

export type V7ActType =
  | 'dramatic'      // Números impactantes (98%, 2%)
  | 'comparison'    // Comparação lado a lado
  | 'interactive'   // Quiz, checkboxes
  | 'playground'    // Prática com prompts
  | 'revelation'    // Revelação do método
  | 'gamification'; // Conquistas e XP

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

export type V7SceneType =
  | 'text-reveal'
  | 'number-reveal'
  | 'split-screen'
  | 'comparison'
  | 'quiz'
  | 'result'
  | 'playground'
  | 'cards-reveal'
  | 'cta'
  | 'gamification'
  | 'letterbox'
  | 'particle-effect';

export type V7InteractionType =
  | 'quiz'        // Pergunta com opções
  | 'playground'  // Exercício prático
  | 'checkboxes'  // Múltipla seleção
  | 'button';     // CTA simples

export type V7Mood = 'danger' | 'success' | 'neutral' | 'warning';

// ==========================================
// ÁUDIO
// ==========================================

export interface V7AudioTrack {
  url?: string;
  text?: string; // Para TTS
  duration?: number;
  volume?: number;
}

export interface V7ContextualLoop {
  triggerAfter: number; // segundos
  text: string;
  voice?: 'main' | 'whisper' | 'thought';
  volume: number;
  loop?: boolean;
}

export interface V7AudioBehavior {
  onStart: 'pause' | 'fadeToBackground' | 'continue' | 'switch';
  duringInteraction: {
    mainVolume: number;      // 0-1
    ambientVolume: number;   // 0-1
    contextualLoops?: V7ContextualLoop[];
  };
  onComplete: 'resume' | 'fadeIn' | 'next';
}

export interface V7AudioConfig {
  narration: V7AudioTrack;
  ambient?: V7AudioTrack;
  effects?: V7SoundEffect[];
  behavior?: V7AudioBehavior;
}

export interface V7SoundEffect {
  id: string;
  url: string;
  triggerAt?: number;
  volume?: number;
}

// ==========================================
// INTERAÇÕES
// ==========================================

export interface V7TimeoutConfig {
  soft: number;    // segundos para primeira dica (default: 7)
  medium: number;  // segundos para segunda dica (default: 15)
  hard: number;    // segundos para auto-avanço (default: 30)
  hints: string[];
}

export interface V7InteractionConfig {
  type: V7InteractionType;
  config: any; // Específico por tipo
  audioBehavior: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
}

export interface V7QuizOption {
  id: string;
  text: string;
  category: 'good' | 'bad';
  emoji?: string;
}

export interface V7PlaygroundConfig {
  amateurPrompt: string;
  amateurResult: {
    title: string;
    content: string;
    score: number;
    verdict: 'bad' | 'good' | 'excellent';
  };
  professionalPrompt: string;
  professionalResult: {
    title: string;
    content: string;
    score: number;
    verdict: 'bad' | 'good' | 'excellent';
  };
}

// ==========================================
// VISUAL
// ==========================================

export interface V7VisualContent {
  title?: string;
  mainText?: string;
  subtitle?: string;
  number?: string;
  secondaryNumber?: string;
  highlightWord?: string;
  hookQuestion?: string;
  items?: any[];
  options?: V7QuizOption[];
  backgroundColor?: string;
  mood?: V7Mood;
}

export interface V7ParticleEffect {
  type: 'sparks' | 'confetti' | 'stars' | 'fireworks';
  color?: string;
  count?: number;
  duration?: number;
}

export interface V7Animation {
  type: V7AnimationType;
  duration?: number;
  delay?: number;
  easing?: string;
}

// ==========================================
// TRANSIÇÕES
// ==========================================

export type V7TransitionType =
  | 'fadeFromBlack'
  | 'fadeToBlack'
  | 'fadeToNext'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'dissolve';

export interface V7Transition {
  in: V7TransitionType;
  out: V7TransitionType;
  duration?: number;
}

// ==========================================
// SCENES E ACTS
// ==========================================

export interface V7Scene {
  id: string;
  type: V7SceneType;
  startTime?: number;
  duration?: number;
  content: V7VisualContent;
  animation?: V7AnimationType;
}

export interface V7Act {
  id: string;
  type: V7ActType;
  title?: string;
  startTime: number;
  endTime: number;
  duration?: number;
  mood?: V7Mood;

  scenes: V7Scene[];

  content?: {
    visual: V7VisualContent;
    audio?: V7AudioConfig;
    animations?: V7Animation[];
    particles?: V7ParticleEffect[];
  };

  interaction?: V7InteractionConfig;

  transitions?: V7Transition;
}

// ==========================================
// TIMELINE
// ==========================================

export interface V7SyncPoint {
  time: number;
  action: string;
  target: string;
}

export interface V7Timeline {
  acts: {
    id: string;
    startTime: number;
    endTime: number;
    duration: number;
    hasInteraction: boolean;
  }[];
  totalDuration: number;
  syncPoints: V7SyncPoint[];
}

// ==========================================
// LESSON PRINCIPAL
// ==========================================

export interface V7LessonData {
  id: string;
  model: 'v7-cinematic';
  version: '2.0';
  title: string;
  description?: string;
  duration: number; // segundos totais

  cinematicFlow: {
    acts: V7Act[];
    timeline?: V7Timeline;
    transitions?: V7Transition[];
  };

  audioConfig?: {
    narrationUrl?: string;
    wordTimestamps?: V7WordTimestamp[];
    ambientUrl?: string;
    effects?: V7SoundEffect[];
  };

  interactionPoints?: V7InteractionConfig[];
  analyticsConfig?: V7Analytics;
}

export interface V7WordTimestamp {
  word: string;
  start: number;
  end: number;
}

// ==========================================
// PLAYER STATE
// ==========================================

export interface V7PlayerState {
  status: 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';
  currentActIndex: number;
  currentSceneIndex: number;
  currentTime: number;
  isInteracting: boolean;
  audioState: 'playing' | 'paused' | 'background' | 'muted';
  fullscreen: boolean;
  progress: number;
}

// ==========================================
// ANALYTICS
// ==========================================

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

// ==========================================
// DEFAULT CONFIGS
// ==========================================

export const DEFAULT_TIMEOUT_CONFIG: V7TimeoutConfig = {
  soft: 7,
  medium: 15,
  hard: 30,
  hints: [
    'Tome seu tempo para pensar...',
    'Qual opção mais combina com você?',
    'Vamos continuar a jornada...'
  ]
};

export const DEFAULT_AUDIO_BEHAVIORS: Record<V7InteractionType, V7AudioBehavior> = {
  quiz: {
    onStart: 'fadeToBackground',
    duringInteraction: {
      mainVolume: 0.15,
      ambientVolume: 0.4,
      contextualLoops: [
        { triggerAfter: 7, text: 'Pense com calma...', volume: 0.4 },
        { triggerAfter: 15, text: 'Qual mais combina com você?', volume: 0.4 },
        { triggerAfter: 25, text: 'Tome seu tempo...', volume: 0.3 }
      ]
    },
    onComplete: 'fadeIn'
  },

  playground: {
    onStart: 'pause',
    duringInteraction: {
      mainVolume: 0,
      ambientVolume: 0.3,
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
      mainVolume: 0.2,
      ambientVolume: 0.4,
      contextualLoops: [
        { triggerAfter: 5, text: 'A escolha é sua...', volume: 0.3 }
      ]
    },
    onComplete: 'next'
  }
};
