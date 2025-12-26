// V7 Cinematic Types - Tipos completos para o sistema V7
// Modelo cinematográfico com áudio inteligente e interações contextuais
//
// NOTA: Este arquivo está sendo mantido para compatibilidade.
// A FONTE PRINCIPAL é v7-schema.ts (versão 7.1)
// Use os tipos de v7-schema.ts para novos desenvolvimentos.

// ==========================================
// TIPOS BASE (Alinhados com v7-schema.ts v7.1)
// ==========================================

export type V7ActType =
  | 'dramatic'      // Números impactantes (98%, 2%)
  | 'narrative'     // Narrativa/explicação
  | 'comparison'    // Comparação lado a lado
  | 'interaction'   // Quiz interativo (v7.1 naming)
  | 'interactive'   // Alias para compatibilidade
  | 'quiz'          // Alias para interaction
  | 'playground'    // Prática com prompts
  | 'revelation'    // Revelação do método
  | 'cta'           // Call-to-action
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

// Alinhado com v7-schema.ts V7_MOODS
export type V7Mood = 'danger' | 'success' | 'neutral' | 'warning' | 'dramatic';

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
  autoAction?: 'skip' | 'selectDefault' | 'continue';  // Alinhado com v7-schema.ts
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

  // V7.1: Word-based sync (alinhado com v7-schema.ts)
  narration?: string;           // Texto da narração diretamente no act
  pauseKeyword?: string;        // Palavra que dispara pausa (OBRIGATÓRIO para interações)
  pauseKeywords?: string[];     // Alternativas para compatibilidade
  pauseTime?: number;           // Tempo em segundos quando pauseKeyword é falado
  anchorActions?: Array<{
    id: string;
    keyword: string;
    type: 'pause' | 'resume' | 'show' | 'hide' | 'highlight' | 'trigger';
    targetId?: string;
  }>;

  scenes: V7Scene[];

  content?: {
    visual: V7VisualContent;
    audio?: V7AudioConfig;
    animations?: V7Animation[];
    particles?: V7ParticleEffect[];
  };

  interaction?: V7InteractionConfig;
  audioBehavior?: V7AudioBehavior;  // Alinhado com v7-schema.ts
  timeout?: V7TimeoutConfig;        // Alinhado com v7-schema.ts

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
  version: '7.1' | '2.0';  // 7.1 é a versão atual, 2.0 para compatibilidade
  title: string;
  description?: string;
  duration: number; // segundos totais

  // Suporta ambos os formatos para compatibilidade
  cinematicFlow?: {
    acts: V7Act[];
    timeline?: V7Timeline;
    transitions?: V7Transition[];
  };
  // snake_case é o formato preferido (alinhado com v7-schema.ts)
  cinematic_flow?: {
    acts: V7Act[];
    timeline?: V7Timeline;
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
    'Pense com calma...',
    'Não há resposta errada, seja honesto!',
    'Vamos continuar? Você pode voltar depois.'
  ],
  autoAction: 'continue'  // Alinhado com v7-schema.ts
};

// Alinhado com v7-schema.ts DEFAULT_AUDIO_BEHAVIOR_*
export const DEFAULT_AUDIO_BEHAVIORS: Record<V7InteractionType, V7AudioBehavior> = {
  quiz: {
    onStart: 'pause',  // Pausa completa para quiz (alinhado com v7-schema.ts)
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
      ambientVolume: 0,  // Silêncio total para playground (alinhado com v7-schema.ts)
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
    onStart: 'fadeToBackground',  // CTA mantém áudio de fundo (alinhado com v7-schema.ts)
    duringInteraction: {
      mainVolume: 0.3,
      ambientVolume: 0.4,
      contextualLoops: []
    },
    onComplete: 'next'
  }
};
