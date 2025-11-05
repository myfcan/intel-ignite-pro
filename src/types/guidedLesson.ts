export interface WordTimestamp {
  word: string;
  start: number; // em segundos
  end: number; // em segundos
}

export type LessonSectionType = 'text' | 'playground' | 'end-audio';

export type PlaygroundType = 
  | 'real-playground'
  | 'multiple-choice-with-feedback';

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

export interface PlaygroundConfig {
  instruction: string;
  type: PlaygroundType;
  options?: string[];
  feedback?: Record<string, string>;
  realConfig?: RealPlaygroundConfig;
}

export interface ExerciseConfig {
  id: string;
  type: 'drag-drop' | 'complete-sentence' | 'scenario-selection';
  title: string;
  instruction: string;
  data: any;
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
  timestamp: number; // segundo em que esta seção começa
  type?: LessonSectionType; // tipo da seção (text, playground, end-audio)
  speechBubbleText: string; // frase curta para balão da MAIA (1-2 linhas)
  visualContent: string; // texto visual com markdown e emojis (exibido na tela)
  spokenContent: string; // texto puro falado pela MAIA (para sincronização de áudio)
  playgroundConfig?: PlaygroundConfig; // configuração do playground mid-lesson
}

export interface GuidedLessonData {
  id: string;
  title: string;
  trackId: string;
  trackName: string;
  duration: number;
  sections: LessonSection[];
  exercisesConfig?: ExerciseConfig[];
  finalPlaygroundConfig?: FinalPlaygroundConfig;
}

export interface GuidedLessonProps {
  lessonData: GuidedLessonData;
  onComplete: () => void;
  audioUrl?: string; // URL do áudio gerado (opcional, pode ser gerado dinamicamente)
  wordTimestamps?: WordTimestamp[]; // timestamps de palavras para sincronização precisa
}
