// Types for the lesson creation pipeline

export type LessonModel = 'v1' | 'v2';

export type PipelineStatus = 'idle' | 'intake' | 'exercises' | 'clean-text' | 'draft' | 'generating-audio' | 'calculating-timestamps' | 'activating' | 'completed' | 'failed';

export interface LessonSection {
  id: string;
  title?: string;
  visualContent: string;
  speechBubbleText?: string;
}

export interface ExerciseInput {
  type: 'multiple-choice' | 'true-false' | 'fill-blanks' | 'complete-sentence' | 'data-collection' | 'scenario-selection' | 'platform-match' | 'drag-drop';
  question?: string;
  instruction?: string;
  data: any;
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
  exercisesVersion?: number; // 🆕 FASE 5: Versão independente dos exercises
}

export interface PipelineResult {
  success: boolean;
  lessonId?: string;
  status: 'draft' | 'active';
  error?: string;
  logs: string[];
}
