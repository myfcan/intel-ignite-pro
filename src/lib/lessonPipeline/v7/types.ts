/**
 * Tipos do Pipeline V7-VV
 */

import { 
  V7ScriptInput, 
  V7SceneInput, 
  V7Visual, 
  V7Interaction,
  V7AnchorText 
} from '@/types/V7ScriptInput';
import { V7PipelineLogger } from './logger';

// ============================================================================
// OPÇÕES E CONTEXTO
// ============================================================================

export interface V7PipelineOptions {
  failOnAudioError: boolean;
  voiceId: string;
  generateAudio: boolean;
  /**
   * Se true, usa eleven_v3 e processa audio tags emocionais ([excited], [calm], etc.)
   * Se false, usa eleven_multilingual_v2 (padrão) e ignora audio tags.
   */
  useEmotionTags?: boolean;
}

export interface V7PipelineContext {
  input: V7ScriptInput;
  options: V7PipelineOptions;
  executionId: string;
  logger: V7PipelineLogger;
}

// ============================================================================
// WORD TIMESTAMP
// ============================================================================

export interface V7WordTimestamp {
  word: string;
  start_time: number;
  end_time: number;
  index: number;
}

// ============================================================================
// ANCHOR ACTION (Ação sincronizada com áudio)
// ============================================================================

export interface V7AnchorAction {
  id: string;
  /** Palavra-chave que dispara a ação */
  anchorText: string;
  /** Tipo de ação */
  actionType: 'pause' | 'transition' | 'show-visual' | 'trigger-interaction';
  /** Timestamp calculado (segundos) */
  timestamp: number;
  /** Dados adicionais da ação */
  payload?: {
    targetPhaseId?: string;
    visualType?: string;
    interactionType?: string;
    microVisualId?: string;
    triggerTime?: number;
    frameIndex?: number;
  };

}

// ============================================================================
// PHASE (Fase da aula - unidade de exibição)
// ============================================================================

export interface V7Phase {
  id: string;
  title: string;
  type: string;
  /** Timestamp de início (segundos) */
  startTime: number;
  /** Timestamp de fim (segundos) */
  endTime: number;
  /** Narração desta fase */
  narration: string;
  /** Configuração visual */
  visual: V7Visual;
  /** Interação (se houver) */
  interaction?: V7Interaction;
  /** Anchor actions desta fase */
  anchorActions: V7AnchorAction[];
  /** Índice da cena de origem */
  sceneIndex: number;
}

// ============================================================================
// CONTENT FINAL (Estrutura salva no banco)
// ============================================================================

export interface V7LessonContent {
  contentVersion: 'v7-vv';
  metadata: {
    title: string;
    subtitle?: string;
    difficulty: string;
    category: string;
    tags: string[];
    learningObjectives: string[];
    totalDuration: number;
    phasesCount: number;
  };
  audio: {
    mainAudio: {
      id: string;
      url: string;
      wordTimestamps: V7WordTimestamp[];
      duration: number;
    };
    feedbackAudios?: Record<string, { url: string; duration: number }>;
  };
  phases: V7Phase[];
  /** Anchor actions globais (ordenados por timestamp) */
  anchorActions: V7AnchorAction[];
  /** Exercícios pós-aula (se houver) */
  postLessonExercises?: any[];
}

// ============================================================================
// OUTPUTS DOS STEPS
// ============================================================================

export interface V7Step1Output {
  validatedInput: V7ScriptInput;
  validationWarnings: string[];
}

export interface V7Step2Output {
  fullNarration: string;
  sceneNarrations: Array<{
    sceneId: string;
    narration: string;
    wordCount: number;
  }>;
  totalWords: number;
}

export interface V7Step3Output {
  audioUrl: string;
  wordTimestamps: V7WordTimestamp[];
  totalDuration: number;
}

export interface V7Step4Output {
  phases: V7Phase[];
  anchorActions: V7AnchorAction[];
}

export interface V7Step5Output {
  content: V7LessonContent;
}

export interface V7Step6Output {
  lessonId: string;
}

export interface V7Step7Output {
  lessonId: string;
  activated: boolean;
}

// ============================================================================
// RESULTADO FINAL
// ============================================================================

export interface V7PipelineResult {
  success: boolean;
  lessonId?: string;
  status: 'active' | 'draft' | 'failed';
  error?: string;
  metadata?: {
    duration: number;
    phasesCount: number;
    scenesCount: number;
    audioUrl: string;
    wordTimestampsCount: number;
  };
  logs: string[];
}
