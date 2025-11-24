export interface WordTimestamp {
  word: string;
  start: number; // em segundos
  end: number; // em segundos
}

export type LessonSectionType = 'text' | 'playground' | 'end-audio';

export type PlaygroundType = 
  | 'real-playground'
  | 'multiple-choice-with-feedback'
  | 'interactive-simulation';

export interface RealPlaygroundConfig {
  type: 'real-playground';
  title: string;
  maiaMessage: string;
  scenario: {
    title: string;
    description: string;
  };
  prefilledText: string;
  userPlaceholder: string;
  validation: {
    minLength: number;
    requiredKeywords?: string[][];
    feedback: {
      tooShort: string;
      good: string;
      excellent: string;
    };
  };
}

export interface InteractiveSimulationStep {
  step: number;
  week?: string;
  context?: string;
  iaKnowledge?: string;
  prompt: string;
  options: Array<{ id: string; title: string; genre: string; emoji: string; description?: string }> | 'dynamic';
  logic?: string;
  feedback: string | {
    title: string;
    learning: string[];
    confidence?: string;
    visual?: string;
  };
}

export interface InteractiveSimulationConfig {
  type: 'interactive-simulation';
  title: string;
  intro?: {
    icon: string;
    title: string;
    description: string;
    visual: string;
  };
  scenario: { icon: string; text: string };
  steps: InteractiveSimulationStep[];
  completion: {
    visual: string;
    chart?: {
      type: string;
      data: any[];
    };
    summary?: {
      icon: string;
      title: string;
      insights: string[];
      realWorldContext?: {
        title: string;
        points: string[];
      };
    };
    message: string;
    badge: { id: string; title: string; icon: string };
  };
}

export interface PlaygroundConfig {
  instruction?: string;  // 🆕 Opcional para compatibilidade com diferentes formatos
  type: PlaygroundType;
  triggerKeyword?: string;
  triggerAfterSection?: number;
  playgroundDelay?: number; // Delay adicional em segundos antes de mostrar o playground (útil para dar tempo da frase completar)
  options?: string[];
  feedback?: Record<string, string>;
  realConfig?: RealPlaygroundConfig;
  simulationConfig?: InteractiveSimulationConfig;
}

export interface ExerciseConfig {
  id: string;
  type: 'drag-drop' | 'complete-sentence' | 'scenario-selection' | 'fill-in-blanks' | 'true-false' | 'platform-match' | 'data-collection' | 'multiple-choice';
  title: string;
  instruction: string;
  data: any;
  passingScore?: number; // Nota mínima para passar (default: 70)
  maxAttempts?: number; // Máximo de tentativas permitidas (default: ilimitado)
}

export interface FinalPlaygroundStep {
  stepNumber: number;
  title: string;
  type: 'radio' | 'textarea' | 'prompt-builder';
  question: string;
  options?: Array<{ value: string; label: string; description: string; icon: string }>;
  placeholder?: string;
  minLength?: number;
  template?: {
    parts: Array<{
      id: string;
      label: string;
      placeholder: string;
      hint: string;
    }>;
  };
}

export interface FinalPlaygroundConfig {
  id: string;
  type: 'guided-prompt-builder';
  title: string;
  maiaIntro: string;
  steps: FinalPlaygroundStep[];
}

export interface LessonSection {
  id: string;
  title?: string; // título descritivo para exibição na sidebar
  timestamp: number; // segundo em que esta seção começa
  type?: LessonSectionType; // tipo da seção (text, playground, end-audio)
  speechBubbleText: string; // frase curta para balão da MAIA (1-2 linhas)
  visualContent?: string; // texto visual com markdown e emojis (exibido na tela E usado para áudio)
  content?: string; // campo alternativo de conteúdo (usado em algumas aulas antigas)
  playgroundConfig?: PlaygroundConfig; // configuração do playground mid-lesson
  showPlaygroundCall?: boolean; // se deve mostrar card de convite do playground
  audio_url?: string; // 🆕 V2: URL do áudio específico desta seção
}

// 🎬 V3: Slide com imagem gerada por IA
export interface V3Slide {
  id: string;
  slideNumber: number;
  contentIdea: string; // Texto livre: "Mostrar uma pessoa trabalhando com IA"
  imagePrompt?: string; // Gerado pela IA a partir de contentIdea
  imageUrl?: string; // URL da imagem gerada (Base64 ou URL pública)
  timestamp?: number; // Timestamp calculado automaticamente
}

// 🎬 V3: Dados da lição no modelo de apresentação
export interface V3LessonData {
  id: string;
  title: string;
  trackId: string;
  trackName: string;
  duration: number;
  audioUrl: string; // Áudio único contínuo
  wordTimestamps?: WordTimestamp[]; // Timestamps de palavras (opcional)
  slides: V3Slide[]; // Até 7 slides com imagens
  exercisesConfig?: ExerciseConfig[];
  finalPlaygroundConfig?: PlaygroundConfig; // V3 sempre usa playground genérico padrão
  contentVersion?: number; // Para cache-busting
  schemaVersion?: number; // Versão da estrutura
}

// 🎬 V3: Props para componente de renderização
export interface V3LessonProps {
  lessonData: V3LessonData;
  onComplete: (data?: { audioProgress?: number; allExercisesCompleted?: boolean }) => void;
  onMarkComplete?: () => void | Promise<void>;
  nextLessonId?: string;
  nextLessonType?: string;
  trailId?: string;
}

export interface GuidedLessonData {
  id: string;
  title: string;
  trackId: string;
  trackName: string;
  duration: number;
  sections: LessonSection[];
  exercisesConfig?: ExerciseConfig[];
  finalPlaygroundConfig?: FinalPlaygroundConfig | PlaygroundConfig; // V1/V2: FinalPlaygroundConfig (customizado) | V3: PlaygroundConfig (genérico)
  contentVersion?: number; // Para cache-busting: incrementa quando conteúdo mudar
  schemaVersion?: number; // 🆕 Para FASE 4 - controlar versão da estrutura
}

export interface GuidedLessonProps {
  lessonData: GuidedLessonData;
  onComplete: (data?: { audioProgress?: number; allExercisesCompleted?: boolean }) => void;
  onMarkComplete?: () => void | Promise<void>; // Marcar aula como completa sem navegar (usado pelo ConclusionScreen)
  audioUrl?: string; // URL do áudio gerado (opcional, pode ser gerado dinamicamente)
  wordTimestamps?: WordTimestamp[]; // timestamps de palavras para sincronização precisa
  nextLessonId?: string; // ID da próxima lição (opcional)
  nextLessonType?: string; // Tipo da próxima lição (opcional)
  trailId?: string; // ID da trilha (para navegação correta do botão voltar)
}
