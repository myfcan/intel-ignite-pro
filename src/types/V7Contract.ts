/**
 * V7 Contract - Tipos compartilhados entre Pipeline e Player
 *
 * REGRA DE OURO: Se um tipo está aqui, Pipeline GERA e Player CONSOME.
 * Nenhum dos dois pode inventar tipos fora deste arquivo.
 *
 * @version 1.0.0
 * @author V7-vv Definitive
 */

// ============================================================================
// TIPOS DE VISUAL SUPORTADOS
// ============================================================================

/**
 * Todos os tipos de visual que o Player DEVE saber renderizar.
 * Se não está aqui, não é suportado.
 */
export type V7VisualType =
  | 'number-reveal'      // Número grande com animação (ex: "98%", "30M")
  | 'text-reveal'        // Texto com reveal progressivo
  | 'split-screen'       // Comparação lado a lado (98% vs 2%)
  | 'letter-reveal'      // Revela letra por letra (P-E-R-F-E-I-T-O)
  | 'cards-reveal'       // Cards que aparecem em sequência
  | 'quiz'               // Tela de quiz com opções
  | 'quiz-feedback'      // Feedback após responder quiz
  | 'playground'         // Comparação prompt amador vs profissional
  | 'result'             // Tela de resultado/gamificação
  | 'cta'                // Call to action
  // === 3D VISUAL TYPES ===
  | '3d-dual-monitors'   // Dois monitores 3D com conteúdo nas telas
  | '3d-abstract'        // Cena abstrata cinematográfica (background)
  | '3d-number-reveal';  // Número em 3D com efeitos cinematográficos

/**
 * Tipos de micro-visual (overlays que aparecem durante narração)
 */
export type V7MicroVisualType =
  | 'image-flash'        // Imagem que aparece e some rapidamente
  | 'text-pop'           // Texto que "popa" na tela
  | 'number-count'       // Número com animação de contagem
  | 'text-highlight'     // Destaca texto na tela
  | 'highlight'          // Destaque genérico (pulse, glow)
  | 'card-reveal'        // Revela um card específico
  | 'letter-reveal';     // Revela uma letra do acrônimo

/**
 * Tipos de fase/cena
 */
export type V7PhaseType =
  | 'dramatic'           // Impacto visual forte (números, estatísticas)
  | 'narrative'          // Narrativa com texto/itens
  | 'comparison'         // Comparação visual (split-screen)
  | 'interaction'        // Quiz ou escolha
  | 'playground'         // Desafio prático
  | 'revelation'         // Revelação (método PERFEITO)
  | 'gamification'       // Resultado/conquistas
  | 'secret-reveal';     // Revelação de segredo

// ============================================================================
// ESTRUTURA DO ÁUDIO
// ============================================================================

export interface V7WordTimestamp {
  word: string;
  start: number;  // segundos
  end: number;    // segundos
}

export interface V7AudioSegment {
  id: string;
  url: string;
  duration: number;
  wordTimestamps: V7WordTimestamp[];
}

/**
 * Configuração de áudio da aula.
 * O áudio principal contém a narração das cenas.
 * Os feedbackAudios contêm narrações específicas para cada opção do quiz.
 */
export interface V7AudioConfig {
  /** Áudio principal com todas as narrações das cenas */
  mainAudio: V7AudioSegment;

  /** Áudios de feedback do quiz, indexados por optionId */
  feedbackAudios?: Record<string, V7AudioSegment>;
}

// ============================================================================
// MICRO-VISUAIS
// ============================================================================

export interface V7MicroVisual {
  id: string;
  type: V7MicroVisualType;
  anchorText: string;       // Palavra que ativa o visual
  triggerTime: number;      // Tempo em segundos (calculado pelo pipeline)
  duration: number;         // Duração em segundos
  content: {
    // Para image-flash
    description?: string;
    imageUrl?: string;

    // Para text-pop
    text?: string;
    words?: string[];
    emoji?: string;

    // Para number-count
    from?: number;
    to?: number;
    prefix?: string;
    suffix?: string;

    // Para highlight
    side?: 'left' | 'right';
    pulse?: boolean;
    shake?: boolean;
    glow?: boolean;

    // Para card-reveal
    cardId?: string;

    // Para letter-reveal
    index?: number;

    // Comum
    animation?: string;
    color?: string;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
}

// ============================================================================
// QUIZ E INTERAÇÕES
// ============================================================================

export interface V7QuizFeedback {
  title: string;
  subtitle: string;
  mood: 'success' | 'warning' | 'danger' | 'neutral';
  /** ID do áudio de feedback (referencia feedbackAudios) */
  audioId?: string;
}

export interface V7QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: V7QuizFeedback;
}

export interface V7QuizInteraction {
  type: 'quiz';
  question: string;
  options: V7QuizOption[];
  timeout?: {
    soft: number;
    medium: number;
    hard: number;
    hints: string[];
    autoSelect?: string;  // optionId para auto-selecionar
  };
}

export interface V7PlaygroundInteraction {
  type: 'playground';
  amateurPrompt: string;
  professionalPrompt: string;
  amateurResult: {
    title: string;
    content: string;
    score: number;
    verdict: string;
  };
  professionalResult: {
    title: string;
    content: string;
    score: number;
    verdict: string;
  };
}

export interface V7CTAInteraction {
  type: 'cta-button';
  buttonText: string;
  action: 'next-phase' | 'complete';
}

export type V7Interaction = V7QuizInteraction | V7PlaygroundInteraction | V7CTAInteraction;

// ============================================================================
// CONTEÚDO VISUAL
// ============================================================================

export interface V7NumberRevealContent {
  hookQuestion?: string;      // "VOCÊ SABIA?"
  number: string;             // "98%"
  secondaryNumber?: string;   // "2%"
  subtitle?: string;
  mood?: 'danger' | 'success' | 'warning' | 'neutral';
  countUp?: boolean;
}

export interface V7TextRevealContent {
  mainText?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{
    icon?: string;
    text: string;
  }>;
  highlightWord?: string;
  mood?: 'danger' | 'success' | 'warning' | 'neutral' | 'dramatic';
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
  word: string;               // "PERFEITO"
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
  cta?: {
    text: string;
    action: string;
  };
}

export interface V7QuizContent {
  question: string;
  mood?: 'neutral' | 'dramatic';
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
  // === 3D Visual Types ===
  | { type: '3d-dual-monitors'; content: V73DDualMonitorsContent }
  | { type: '3d-abstract'; content: V73DAbstractContent }
  | { type: '3d-number-reveal'; content: V73DNumberRevealContent };

// ============================================================================
// ANCHOR ACTIONS
// ============================================================================

export interface V7AnchorAction {
  id: string;
  keyword: string;
  keywordTime: number;        // Tempo exato no áudio
  type: 'pause' | 'show' | 'highlight' | 'trigger';
  targetId?: string;          // ID do elemento alvo (para show/highlight)
}

// ============================================================================
// FASE (PHASE)
// ============================================================================

export interface V7Phase {
  id: string;
  title: string;
  type: V7PhaseType;

  /** Timing */
  startTime: number;          // segundos (relativo ao áudio principal)
  endTime: number;            // segundos

  /** Visual principal da fase */
  visual: V7VisualContent;

  /** Efeitos visuais */
  effects?: {
    mood?: 'danger' | 'success' | 'warning' | 'dramatic' | 'mysterious';
    particles?: 'confetti' | 'sparks' | 'ember' | 'stars' | 'none';
    glow?: boolean;
    shake?: boolean;
    vignette?: boolean;
  };

  /** Micro-visuais (overlays durante narração) */
  microVisuals?: V7MicroVisual[];

  /** Anchor actions (pausas, highlights, etc) */
  anchorActions?: V7AnchorAction[];

  /** Interação (se for fase interativa) */
  interaction?: V7Interaction;

  /** Comportamento do áudio durante interação */
  audioBehavior?: {
    onStart: 'pause' | 'fade' | 'continue';
    onComplete: 'resume' | 'next-phase';
  };
}

// ============================================================================
// AULA COMPLETA
// ============================================================================

export interface V7LessonMetadata {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  totalDuration: number;      // segundos
  phaseCount: number;
  createdAt: string;
  generatedBy: 'V7-vv';
}

/**
 * Estrutura completa da aula gerada pelo Pipeline.
 * O Player consome exatamente esta estrutura.
 */
export interface V7LessonData {
  model: 'v7-cinematic';
  version: 'vv';

  /** Metadados da aula */
  metadata: V7LessonMetadata;

  /** Fases da aula (em ordem) */
  phases: V7Phase[];

  /** Configuração de áudio */
  audio: V7AudioConfig;
}

// ============================================================================
// INPUT DO PIPELINE (roteiro)
// ============================================================================

/**
 * Estrutura de entrada do Pipeline (JSON de roteiro).
 * O Pipeline recebe isso e gera V7LessonData.
 */
export interface V7ScriptInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];

  /** Configuração de voz */
  voice_id?: string;
  generate_audio?: boolean;
  fail_on_audio_error?: boolean;

  /** Cenas do roteiro */
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
// ESTADO DO PLAYER
// ============================================================================

export type V7PlayerStatus =
  | 'loading'
  | 'playing'
  | 'paused'
  | 'waiting-interaction'
  | 'showing-feedback'
  | 'completed';

export interface V7PlayerState {
  status: V7PlayerStatus;
  currentPhaseIndex: number;
  currentTime: number;

  /** Interação ativa */
  activeInteraction?: {
    phaseId: string;
    selectedOptionId?: string;
    startedAt: number;
  };

  /** Resultados das interações */
  interactionResults: Record<string, {
    optionId: string;
    isCorrect: boolean;
    timestamp: number;
  }>;

  /** Progresso */
  completedPhases: string[];
  score: number;
}
