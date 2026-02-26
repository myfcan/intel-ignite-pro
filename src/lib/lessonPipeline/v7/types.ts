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
   * @deprecated Agora é sempre true. eleven_v3 é mandatório para V7-vv.
   * Mantido apenas para backward compatibility.
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
  /**
   * Tipo de ação — alinhado com o contrato C06 da Edge Function.
   * 'show' = exibir microVisual (substitui 'show-visual' do pipeline legado)
   * 'pause' = pausar áudio para interação
   * 'transition' = transição entre fases
   * 'trigger' = gatilho genérico (ex: frameIndex slideshow)
   */
  type: 'pause' | 'show' | 'transition' | 'trigger';
  /** Palavra-chave na narração que dispara a ação (C06: campo 'keyword') */
  keyword: string;
  /** Timestamp calculado (segundos) — alias C06: keywordTime */
  keywordTime: number;
  /** ID do elemento alvo (microVisual.id para type='show') */
  targetId?: string;
  /** Fase alvo para type='pause' ou 'transition' */
  targetPhaseId?: string;
  /** Dados adicionais da ação */
  payload?: {
    targetPhaseId?: string;
    visualType?: string;
    interactionType?: string;
    microVisualId?: string;
    triggerTime?: number;
    frameIndex?: number;
  };

  // ── CAMPOS LEGADOS (backward compat — NÃO usar em código novo) ──
  /** @deprecated Use keyword */
  anchorText?: string;
  /** @deprecated Use type */
  actionType?: 'pause' | 'transition' | 'show-visual' | 'trigger-interaction';
  /** @deprecated Use keywordTime */
  timestamp?: number;
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
