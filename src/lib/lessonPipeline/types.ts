// Types for the lesson creation pipeline

export type LessonModel = 'v1' | 'v2' | 'v3';

export type PipelineStatus = 'idle' | 'intake' | 'exercises' | 'clean-text' | 'draft' | 'generating-audio' | 'calculating-timestamps' | 'activating' | 'completed' | 'failed';

export interface LessonSection {
  id: string;
  title?: string;
  visualContent: string;
  speechBubbleText?: string;
  playgroundConfig?: {
    type: 'real-playground' | 'interactive-simulation';
    config: any; // Aceita JSON ou string
  };
}

export interface V3SlideSection extends LessonSection {
  imageUrl?: string; // URL da imagem do slide
  slideNumber?: number; // Número do slide (1-7)
}

export interface ExerciseInput {
  type: string; // Pode ser 'prompt' ou um dos 8 tipos específicos
  prompt?: string; // Campo de texto livre
  question?: string; // Compatibilidade
  instruction?: string; // Compatibilidade
  data?: any; // Estrutura específica do tipo (opcional se type='prompt')
}

export interface PipelineInput {
  model: LessonModel;
  title: string;
  trackId: string;
  trackName: string;
  orderIndex: number;
  sections: LessonSection[];
  exercises: ExerciseInput[];
  estimatedTimeMinutes?: number;
}

export interface PipelineState {
  status: PipelineStatus;
  currentStep: number;
  totalSteps: number;
  lessonId?: string;
  audioUrl?: string;
  audioUrls?: string[];
  error?: string;
  logs: string[];
}

export interface Step1Output {
  model: LessonModel;
  title: string;
  trackId: string;
  trackName: string;
  orderIndex: number;
  sections: LessonSection[];
  exercises: ExerciseInput[];
  estimatedTimeMinutes: number;
}

export interface Step2Output extends Step1Output {
  exercisesConfig: any[];
}

export interface Step3Output extends Step2Output {
  audioText: string;
  sectionTexts: string[];
}

export interface Step4Output extends Step3Output {
  lessonId: string;
}

export interface Step6Output extends Step4Output {
  audioUrl?: string;
  audioUrls?: string[];
  wordTimestamps?: any[];
  durations?: number[];
}

export interface Step7Output extends Step6Output {
  structuredContent: any;
  totalDuration: number;
  exercisesVersion?: number; // FASE 5: Versão independente dos exercises
}

export interface PipelineResult {
  success: boolean;
  lessonId?: string;
  status: 'draft' | 'active';
  error?: string;
  logs: string[];
}
