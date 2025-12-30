/**
 * ============================================================================
 * V7 CINEMATIC LESSON SCHEMA v7.2
 * ============================================================================
 *
 * Este arquivo define o CONTRATO ÚNICO para todo o sistema V7:
 * - Pipeline (backend) GERA este formato
 * - Banco de dados ARMAZENA este formato
 * - Admin EDITA este formato
 * - Player CONSOME este formato
 *
 * REGRA DE OURO: Se não está definido aqui, não existe no sistema.
 *
 * MUDANÇA PRINCIPAL v7.1: WORD-BASED timing em vez de TIME-BASED
 * - Cada fase define `pauseKeyword` (palavra que dispara a pausa)
 * - O pipeline calcula `startTime`/`endTime` BASEADO nos word_timestamps
 * - Não mais durações arbitrárias que são "escaladas"
 *
 * MUDANÇA v7.2: MÚLTIPLOS VISUAIS POR ATO
 * - Cada ato pode ter N visuais sincronizados com o áudio
 * - Pipeline calcula quantidade de visuais baseado na duração
 * - Cada visual tem startTime/endTime relativo ao ato
 *
 * @version 7.2.0
 * @date 2024-12-28
 */

// ============================================================================
// ENUMS E CONSTANTES
// ============================================================================

/**
 * Tipos de fase/ato suportados pelo sistema
 */
export const V7_PHASE_TYPES = [
  'dramatic',     // Impacto visual (98%, números grandes)
  'narrative',    // Comparação/explicação
  'comparison',   // Comparação lado a lado
  'interaction',  // Quiz interativo
  'playground',   // Comparação amador vs profissional
  'revelation',   // Revelação do método + CTA
  'gamification', // Conquistas finais
  'secret-reveal', // Revelação secreta com animação gold
] as const;

export type V7PhaseType = typeof V7_PHASE_TYPES[number];

/**
 * Tipos de ação para anchor points
 */
export const ANCHOR_ACTION_TYPES = [
  'pause',      // Pausa o áudio
  'resume',     // Retoma o áudio
  'show',       // Mostra elemento
  'hide',       // Esconde elemento
  'highlight',  // Destaca elemento
  'trigger',    // Dispara callback
] as const;

export type AnchorActionType = typeof ANCHOR_ACTION_TYPES[number];

/**
 * Comportamentos de áudio durante interações
 */
export const AUDIO_START_BEHAVIORS = ['pause', 'fadeToBackground', 'continue'] as const;
export const AUDIO_COMPLETE_BEHAVIORS = ['resume', 'fadeIn', 'next'] as const;

export type AudioStartBehavior = typeof AUDIO_START_BEHAVIORS[number];
export type AudioCompletesBehavior = typeof AUDIO_COMPLETE_BEHAVIORS[number];

/**
 * Moods visuais
 */
export const V7_MOODS = ['neutral', 'danger', 'success', 'dramatic', 'warning'] as const;
export type V7Mood = typeof V7_MOODS[number];

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

/**
 * Timestamp de palavra do ElevenLabs
 * CRÍTICO: Usado para sincronização word-based
 */
export interface WordTimestamp {
  word: string;
  start: number;  // Segundos
  end: number;    // Segundos
}

/**
 * Anchor Action - dispara ação quando palavra é falada
 */
export interface V7AnchorAction {
  id: string;
  keyword: string;           // Palavra que dispara a ação
  type: AnchorActionType;
  targetId?: string;         // ID do elemento alvo (para show/hide/highlight)
  payload?: Record<string, unknown>;
  delayMs?: number;          // Delay após detectar a palavra
}

/**
 * Contextual Loop - áudio de dica durante interação
 */
export interface V7ContextualLoop {
  triggerAfter: number;      // Segundos após início da interação
  text: string;              // Texto para TTS ou URL de áudio
  volume: number;            // 0-1
  voice?: 'main' | 'whisper' | 'thought';
}

/**
 * Comportamento de áudio durante interação
 */
export interface V7AudioBehavior {
  onStart: AudioStartBehavior;
  duringInteraction: {
    mainVolume: number;      // 0-1
    ambientVolume: number;   // 0-1
    contextualLoops?: V7ContextualLoop[];
  };
  onComplete: AudioCompletesBehavior;
}

/**
 * Configuração de timeout progressivo
 */
export interface V7TimeoutConfig {
  soft: number;              // Primeira dica (segundos)
  medium: number;            // Segunda dica (segundos)
  hard: number;              // Ação automática (segundos)
  hints: [string, string, string];  // Mensagens de dica
  autoAction?: 'skip' | 'selectDefault' | 'continue';
}

// ============================================================================
// TIPOS DE CENA (MICRO-SCENES)
// ============================================================================

export const V7_SCENE_TYPES = [
  'letterbox',        // Cinematic bars com texto
  'text-reveal',      // Texto revelado progressivamente
  'number-reveal',    // Número grande com contador
  'comparison',       // Lado a lado
  'split-screen',     // Tela dividida
  'particle-effect',  // Efeito de partículas
  'quiz',             // Interface de quiz
  'quiz-intro',       // Introdução do quiz
  'quiz-question',    // Pergunta do quiz
  'quiz-options',     // Opções do quiz
  'quiz-result',      // Resultado do quiz
  'playground',       // Interface de playground
  'playground-intro', // Introdução do playground
  'playground-code',  // Código digitando
  'playground-result',// Resultado do playground
  'cta',              // Call-to-action
  'result',           // Resultado/gamificação
] as const;

export type V7SceneType = typeof V7_SCENE_TYPES[number];

export const V7_ANIMATIONS = [
  'fade',
  'slide-up',
  'slide-left',
  'slide-right',
  'scale-up',
  'zoom-in',
  'letterbox',
  'count-up',
  'letter-by-letter',
  'particle-burst',
  'explode',
  'glitch',
] as const;

export type V7Animation = typeof V7_ANIMATIONS[number];

/**
 * Cena individual dentro de uma fase
 * CADA CENA = 2-5 segundos de conteúdo visual sincronizado com narração
 */
export interface V7Scene {
  id: string;
  type: V7SceneType;
  startTime?: number;        // Calculado pelo pipeline
  duration?: number;         // Calculado pelo pipeline
  animation: V7Animation;
  content: V7SceneContent;
}

/**
 * Conteúdo de uma cena (campos disponíveis dependem do tipo)
 */
export interface V7SceneContent {
  // === CAMPOS DE TEXTO ===
  mainText?: string;
  subtitle?: string;
  hookQuestion?: string;
  highlightWord?: string;
  title?: string;

  // === CAMPOS NUMÉRICOS ===
  number?: string;           // "98%"
  secondaryNumber?: string;  // "2%"

  // === LISTAS ===
  items?: V7ListItem[];
  options?: V7QuizOption[];
  metrics?: V7Metric[];

  // === QUIZ ===
  correctFeedback?: string;
  incorrectFeedback?: string;
  explanation?: string;

  // === PLAYGROUND ===
  challenge?: string;
  context?: string;
  amateurPrompt?: string;
  professionalPrompt?: string;
  amateurResult?: V7PlaygroundResult;
  professionalResult?: V7PlaygroundResult;
  amateurScore?: number;
  professionalScore?: number;

  // === CTA ===
  ctaTitle?: string;
  ctaOptions?: V7CTAOption[];

  // === EFEITOS VISUAIS ===
  backgroundColor?: string;
  glowEffect?: boolean;
  glowColor?: string;
  countUpAnimation?: boolean;
  particleEffect?: string;
  particleColor?: string;
  letterByLetter?: boolean;
  typewriterSpeed?: number;
  cameraZoom?: boolean;
  cameraShake?: boolean;
  pulseEffect?: boolean;
  pulseColor?: string;

  // === METADADOS ===
  narration?: string;        // Texto da narração (para referência)
  tip?: string;
  warning?: string;
}

export interface V7ListItem {
  id?: string;
  emoji?: string;
  text: string;
  isPositive?: boolean;
  isNegative?: boolean;
}

export interface V7QuizOption {
  id: string;
  text: string;
  label?: string;
  isCorrect?: boolean;
  feedback?: string;
  category?: 'good' | 'bad' | 'neutral';
}

export interface V7Metric {
  label: string;
  value: string;
}

export interface V7PlaygroundResult {
  title: string;
  content: string;
  score: number;
  maxScore: number;
  verdict: 'bad' | 'ok' | 'good' | 'excellent';
}

export interface V7CTAOption {
  label: string;
  emoji?: string;
  variant: 'primary' | 'secondary';
  action?: string;
}

// ============================================================================
// FASE (PHASE) - UNIDADE PRINCIPAL
// ============================================================================

/**
 * Uma fase da aula cinematográfica
 *
 * WORD-BASED TIMING:
 * - `pauseKeyword`: Palavra da narração que INICIA esta fase
 * - `endKeyword`: Palavra da narração que TERMINA esta fase (opcional)
 * - `startTime`/`endTime`: Calculados pelo pipeline a partir dos word_timestamps
 */
export interface V7Phase {
  // === IDENTIFICAÇÃO ===
  id: string;
  type: V7PhaseType;
  title: string;

  // === TIMING (calculado pelo pipeline) ===
  startTime: number;         // Segundos - calculado de pauseKeyword
  endTime: number;           // Segundos - calculado de endKeyword ou próxima fase

  // === WORD-BASED SYNC (v7.1 - NOVO!) ===
  pauseKeyword?: string;     // Palavra que dispara pausa (para interaction/playground)
  endKeyword?: string;       // Palavra que marca fim da fase
  anchorActions?: V7AnchorAction[];

  // === VISUAL ===
  mood?: V7Mood;
  scenes: V7Scene[];

  // === COMPORTAMENTO ===
  autoAdvance?: boolean;     // Avançar automaticamente? (false para interações)
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;

  // === METADADOS ===
  narration?: string;        // Texto completo da narração desta fase
}

// ============================================================================
// LESSON SCRIPT - ESTRUTURA COMPLETA DA AULA
// ============================================================================

/**
 * Script completo de uma aula cinematográfica V7
 * Este é o formato que o Player consome
 */
export interface V7LessonScript {
  // === IDENTIFICAÇÃO ===
  id: string;
  title: string;
  subtitle?: string;

  // === DURAÇÃO ===
  totalDuration: number;     // Segundos - duração total do áudio

  // === ÁUDIO ===
  audioUrl: string;
  wordTimestamps: WordTimestamp[];
  audioConfig?: V7AudioConfig;

  // === FASES ===
  phases: V7Phase[];

  // === FALLBACKS ===
  fallbacks?: V7FallbacksConfig;

  // === ANCHOR POINTS GLOBAIS ===
  anchorPoints?: V7AnchorAction[];
}

export interface V7AudioConfig {
  mainAudioUrl?: string;
  ambientAudioUrl?: string;
  soundEffects?: Record<string, string>;
}

export interface V7FallbacksConfig {
  noWordTimestamps?: {
    pauseAfterSeconds: number;
    pauseAfterProgress: number;
  };
  audioLoadError?: 'continue' | 'stop' | 'retry';
}

// ============================================================================
// CINEMATIC FLOW - FORMATO DO BANCO/PIPELINE
// ============================================================================

/**
 * Estrutura de um ato no formato do pipeline/banco
 * Diferente de V7Phase - este é o formato de ARMAZENAMENTO
 */
export interface V7PipelineAct {
  // === IDENTIFICAÇÃO ===
  id: string;
  type: V7PhaseType;
  title: string;

  // === TIMING (calculado pelo pipeline) ===
  startTime: number;
  endTime: number;
  duration?: number;         // Duração em segundos (para cálculo de visuals)

  // === NARRAÇÃO ===
  narration: string;         // Texto da narração EXATO

  // === WORD-BASED SYNC (v7.1) ===
  pauseKeyword?: string;     // Palavra que dispara pausa
  pauseKeywords?: string[];  // Alternativas (backward compat)
  anchorActions?: V7AnchorAction[];

  // === VISUAL (v7.2 - suporta múltiplos visuais) ===
  visual?: V7VisualConfig;           // Compatibilidade: visual único
  visuals?: V7TimedVisual[];         // NOVO: array de visuais sincronizados

  // === INTERAÇÃO ===
  interaction?: V7InteractionConfig;
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;

  // === TRANSIÇÕES ===
  transitions?: {
    enter?: V7Animation;
    exit?: V7Animation;
  };
}

/**
 * Visual sincronizado com timestamp
 * Permite múltiplos visuais dentro de um único ato
 */
export interface V7TimedVisual {
  id: string;
  startTime: number;         // Início relativo ao ato (segundos)
  endTime: number;           // Fim relativo ao ato (segundos)
  type: 'number' | 'text' | 'icon' | 'image' | 'comparison' | 'list';
  animation: V7Animation;
  content: V7VisualContent;
}

/**
 * Conteúdo de um visual (usado por V7TimedVisual)
 */
export interface V7VisualContent {
  // Texto/Número principal
  value?: string;            // "98%", "BRINCADEIRA", etc.
  label?: string;            // Label secundário
  subtitle?: string;         // Subtítulo

  // Estilo
  mood?: V7Mood;
  color?: string;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  // Efeitos
  glow?: boolean;
  shake?: boolean;
  pulse?: boolean;
  particles?: {
    enabled: boolean;
    type: 'ember' | 'confetti' | 'stars' | 'sparks';
    intensity?: number;
  };
}

export interface V7VisualConfig {
  // Dramatic
  mainValue?: string;
  subtitle?: string;
  highlightWord?: string;
  hookQuestion?: string;
  secondaryNumber?: string;
  mood?: V7Mood;

  // Narrative/Comparison
  title?: string;
  leftCard?: V7ComparisonCard;
  rightCard?: V7ComparisonCard;
  items?: V7ListItem[];

  // General
  instruction?: string;      // Direção de cena para o visual
}

export interface V7ComparisonCard {
  label: string;
  value: string;
  details: string[];
  isPositive?: boolean;
  icon?: string;
}

export interface V7InteractionConfig {
  type: 'quiz' | 'playground' | 'cta';

  // Quiz
  question?: string;
  options?: V7QuizOption[];
  correctFeedback?: string;
  incorrectFeedback?: string;

  // Playground
  challenge?: string;
  context?: string;
  amateurPrompt?: string;
  professionalPrompt?: string;
  amateurResult?: V7PlaygroundResult;
  professionalResult?: V7PlaygroundResult;

  // CTA
  ctaTitle?: string;
  ctaOptions?: V7CTAOption[];
}

/**
 * Estrutura completa armazenada no banco (v7_lessons.data ou lessons.content)
 */
export interface V7CinematicLesson {
  // === METADADOS ===
  version: '7.1' | '7.2';    // Versão do schema (7.2 suporta múltiplos visuais)
  model: 'v7-cinematic';

  // === CONTEÚDO ===
  cinematic_flow: {
    acts: V7PipelineAct[];
    timeline: {
      totalDuration: number;
    };
  };

  // === ÁUDIO ===
  audioConfig?: V7AudioConfig;
  fallbacks?: V7FallbacksConfig;

  // === ANCHOR POINTS GLOBAIS ===
  anchorPoints?: V7AnchorAction[];
}

// ============================================================================
// PIPELINE INPUT - O QUE O ADMIN ENVIA PARA O PIPELINE
// ============================================================================

/**
 * Input para o pipeline V7
 * O pipeline transforma isso em V7CinematicLesson
 */
export interface V7PipelineInput {
  // === METADADOS ===
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];

  // === CONTEÚDO ===
  narrativeScript: string;   // Script narrativo completo

  // === ESTRUTURA DE ATOS (obrigatório em v7.1) ===
  acts: V7PipelineActInput[];

  // === CONFIGURAÇÃO DE ÁUDIO ===
  voice_id?: string;
  generate_audio?: boolean;
  audioConfig?: {
    voiceSettings?: Record<string, unknown>;
    backgroundMusic?: string;
  };

  // === TRAIL/ORDERING ===
  trail_id?: string;
  order_index?: number;
}

/**
 * Input de um ato para o pipeline
 */
export interface V7PipelineActInput {
  type: V7PhaseType;
  title: string;
  narration: string;         // Texto EXATO da narração deste ato

  // === WORD-BASED SYNC ===
  pauseKeyword?: string;     // Palavra que dispara pausa (obrigatório para interaction/playground)

  // === VISUAL ===
  visual: Partial<V7VisualConfig>;

  // === INTERAÇÃO ===
  interaction?: Partial<V7InteractionConfig>;

  // === COMPORTAMENTO ===
  audioBehavior?: Partial<V7AudioBehavior>;
  timeout?: Partial<V7TimeoutConfig>;
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_AUDIO_BEHAVIOR_QUIZ: V7AudioBehavior = {
  onStart: 'pause',
  duringInteraction: {
    mainVolume: 0,
    ambientVolume: 0.3,
    contextualLoops: [
      { triggerAfter: 10, text: 'Pense com calma...', volume: 0.3, voice: 'whisper' },
      { triggerAfter: 20, text: 'Reflita sobre sua resposta...', volume: 0.3, voice: 'whisper' },
    ],
  },
  onComplete: 'resume',
};

export const DEFAULT_AUDIO_BEHAVIOR_PLAYGROUND: V7AudioBehavior = {
  onStart: 'pause',
  duringInteraction: {
    mainVolume: 0,
    ambientVolume: 0,
    contextualLoops: [],
  },
  onComplete: 'resume',
};

export const DEFAULT_AUDIO_BEHAVIOR_CTA: V7AudioBehavior = {
  onStart: 'fadeToBackground',
  duringInteraction: {
    mainVolume: 0.3,
    ambientVolume: 0.4,
    contextualLoops: [],
  },
  onComplete: 'next',
};

export const DEFAULT_TIMEOUT_CONFIG: V7TimeoutConfig = {
  soft: 7,
  medium: 15,
  hard: 30,
  hints: [
    'Pense com calma...',
    'Não há resposta errada, seja honesto!',
    'Vamos continuar? Você pode voltar depois.',
  ],
  autoAction: 'continue',
};

// ============================================================================
// VALIDAÇÃO
// ============================================================================

/**
 * Valida se um objeto é um V7CinematicLesson válido
 */
export function validateV7CinematicLesson(data: unknown): data is V7CinematicLesson {
  if (!data || typeof data !== 'object') return false;

  const lesson = data as Partial<V7CinematicLesson>;

  // Versão obrigatória (7.1 ou 7.2)
  if (lesson.version !== '7.1' && lesson.version !== '7.2') {
    console.warn('[V7Schema] Invalid version:', lesson.version);
    return false;
  }

  // cinematic_flow obrigatório
  if (!lesson.cinematic_flow?.acts || !Array.isArray(lesson.cinematic_flow.acts)) {
    console.warn('[V7Schema] Missing cinematic_flow.acts');
    return false;
  }

  // Validar cada ato
  for (const act of lesson.cinematic_flow.acts) {
    if (!act.id || !act.type || !act.narration) {
      console.warn('[V7Schema] Invalid act:', act);
      return false;
    }

    if (!V7_PHASE_TYPES.includes(act.type as V7PhaseType)) {
      console.warn('[V7Schema] Invalid act type:', act.type);
      return false;
    }

    // Fases interativas DEVEM ter pauseKeyword
    if ((act.type === 'interaction' || act.type === 'playground') && !act.pauseKeyword) {
      console.warn('[V7Schema] Interactive act missing pauseKeyword:', act.id);
      // Warning, não erro - pode ser gerado automaticamente
    }
  }

  return true;
}

/**
 * Valida input do pipeline
 */
export function validateV7PipelineInput(input: unknown): input is V7PipelineInput {
  if (!input || typeof input !== 'object') return false;

  const data = input as Partial<V7PipelineInput>;

  if (!data.title || typeof data.title !== 'string') {
    console.warn('[V7Schema] Missing title');
    return false;
  }

  if (!data.narrativeScript || typeof data.narrativeScript !== 'string') {
    console.warn('[V7Schema] Missing narrativeScript');
    return false;
  }

  if (!data.acts || !Array.isArray(data.acts) || data.acts.length === 0) {
    console.warn('[V7Schema] Missing or empty acts array');
    return false;
  }

  return true;
}
