// Types for the lesson creation pipeline

import { PlaygroundConfig } from '@/types/guidedLesson';

export type LessonModel = 'v1' | 'v2' | 'v3' | 'v4';

export type PipelineStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';

export interface LessonSection {
  id: string;
  title?: string;
  visualContent: string;
  speechBubbleText?: string;
  showPlaygroundCall?: boolean;
  playgroundConfig?: PlaygroundConfig;
}

export interface V3Slide {
  id: string;
  slideNumber: number;
  contentIdea: string; // Texto livre: "Mostrar uma pessoa trabalhando com IA"
  audioMarker?: string; // Trecho do audioText onde este slide deve entrar (para word matching)
  imagePrompt?: string; // Gerado pela IA a partir de contentIdea
  imageUrl?: string; // URL gerada após criar a imagem
  timestamp?: number; // Timestamp calculado no step 4
}

export interface V3Data {
  audioText: string; // Texto único para o áudio
  slides: V3Slide[]; // 7-15 slides
  finalPlaygroundConfig?: PlaygroundConfig; // V3 sempre usa playground genérico padrão
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
  
  // V1 e V2: múltiplas seções
  sections?: LessonSection[];
  
  // V3: 1 seção com múltiplos slides
  v3Data?: V3Data;
  
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
  sections?: LessonSection[];
  v3Data?: V3Data;
  exercises: ExerciseInput[];
  estimatedTimeMinutes: number;
}

// PHASE 2: Clean Text
export interface Step2Output extends Step1Output {
  audioText: string;
  sectionTexts: string[];
}

// PHASE 3: Generate Audio (com upload para Storage)
export interface Step3Output extends Step2Output {
  audioUrl?: string;
  audioUrls?: string[];
  wordTimestamps?: any[];
  durations?: number[];
  v3Data?: V3Data; // Slides com imageUrl após geração
}

// PHASE 4: Calculate Timestamps
export interface Step4Output extends Step3Output {
  structuredContent: any;
  totalDuration: number;
}

// PHASE 5: Generate Exercises
// 
// NOTA: Este tipo é usado tanto pelo Step 5 (Generate Exercises)
// quanto pelo Step 5.5 (Process Playground - NOVO 2025-11-15).
// 
// O Step 5.5 expande o campo 'playgroundConfig' dentro de 'sections'
// quando necessário, mas não muda a estrutura do tipo.
// 
export interface Step5Output extends Step4Output {
  exercisesConfig: any[];
}

// PHASE 6: Validate All (NOVO)
export interface Step6Output extends Step5Output {
  validationPassed: boolean;
  validationWarnings: string[];
  lessonId?: string; // Para idempotência (permite reexecução)
}

// PHASE 7: Consolidate (salvar no banco)
export interface Step7Output extends Step6Output {
  lessonId: string;
}

// PHASE 8: Activate (resultado final)
export interface PipelineResult {
  success: boolean;
  lessonId?: string;
  status: 'draft' | 'active' | 'failed';
  error?: string;
  logs: string[];
}
