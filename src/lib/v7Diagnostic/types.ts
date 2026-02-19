/**
 * V7 Diagnostic Engine - Types
 * =============================
 * 
 * Sistema de diagnóstico profundo para aulas V7.
 * Identifica causas raiz e gera ações de correção executáveis.
 */

// ============================================================================
// FINDING TYPES
// ============================================================================

export type FindingType = 
  // Âncoras
  | 'anchor_not_found'           // Keyword não existe em nenhum timestamp
  | 'anchor_wrong_phase'         // Keyword existe mas em fase diferente
  | 'anchor_duplicate'           // Múltiplas ocorrências da keyword
  | 'anchor_no_pause_at'         // Fase interativa sem pauseAt
  
  // Timing
  | 'phase_overlap'              // Fases se sobrepõem
  | 'phase_gap'                  // Espaço vazio entre fases
  | 'phase_negative_duration'    // endTime < startTime
  | 'phase_too_short'            // Duração < mínimo requerido
  
  // MicroVisuais
  | 'microvisual_orphan'         // Trigger fora do range da fase
  | 'microvisual_invalid_index'  // Index maior que palavra
  | 'microvisual_missing_asset'  // URL de imagem faltando
  | 'microvisual_wrong_phase'    // MicroVisual na fase errada
  
  // Áudio
  | 'audio_truncated'            // Narração cortada
  | 'audio_leaked_tags'          // Tags [pause] faladas
  | 'audio_missing_timestamps'   // Sem word_timestamps
  | 'audio_gap'                  // Silêncio inesperado
  
  // Interações
  | 'quiz_no_correct_option'     // Quiz sem resposta correta
  | 'quiz_missing_feedback'      // Opção sem áudio de feedback
  | 'playground_no_prompt'       // Playground sem instrução
  | 'cta_invalid_action'         // CTA com ação inválida
  
  // Estrutura
  | 'missing_required_field'     // Campo obrigatório faltando
  | 'invalid_phase_type'         // Tipo de fase não suportado
  | 'invalid_visual_type'        // Tipo visual não suportado
  | 'duplicate_id';              // IDs duplicados

export type Severity = 'critical' | 'error' | 'warning' | 'info';

// ============================================================================
// ROOT CAUSE TYPES
// ============================================================================

export type RootCauseType = 
  | 'json_structure_error'       // Erro na estrutura do JSON de entrada
  | 'narration_mismatch'         // Narração não corresponde à cena
  | 'pipeline_calculation'       // Erro de cálculo no pipeline
  | 'timing_desync'              // Dessincronização de tempo
  | 'missing_data';              // Dados faltando

// ============================================================================
// ACTION TYPES
// ============================================================================

export type ActionType = 
  | 'move_element'               // Mover elemento de cena A para B
  | 'add_field'                  // Adicionar campo ao JSON
  | 'fix_timing'                 // Corrigir timing
  | 'regenerate_phase'           // Reprocessar fase específica
  | 'manual_review';             // Requer análise humana

// ============================================================================
// FINDING (Problema Encontrado)
// ============================================================================

export interface V7Finding {
  id: string;
  type: FindingType;
  severity: Severity;
  
  location: {
    phaseId?: string;
    sceneId?: string;
    elementId?: string;
    field?: string;
  };
  
  problem: string;
  evidence: {
    expected: string;
    actual: string;
    data: Record<string, unknown>;
  };
}

// ============================================================================
// ROOT CAUSE (Causa Raiz)
// ============================================================================

export interface V7RootCause {
  type: RootCauseType;
  description: string;
  affectedFindings: string[];
  evidence: string[];
}

// ============================================================================
// CORRECTION ACTION (Ação de Correção)
// ============================================================================

export interface V7CorrectionAction {
  id: string;
  priority: 1 | 2 | 3;
  type: ActionType;
  
  instruction: string;
  
  target?: {
    from: string;
    to: string;
  };
  
  suggestedPatch?: {
    op: 'add' | 'remove' | 'move' | 'replace';
    path: string;
    value?: unknown;
    from?: string;
  };
  
  resolvesFindings: string[];
}

// ============================================================================
// DIAGNOSTIC REPORT
// ============================================================================

export interface V7DiagnosticReport {
  lessonId: string;
  lessonTitle: string;
  analyzedAt: string;
  
  inputs: {
    hasPhases: boolean;
    phaseCount: number;
    hasWordTimestamps: boolean;
    timestampCount: number;
    hasAudio: boolean;
    audioDuration: number;
  };
  
  findings: V7Finding[];
  rootCauses: V7RootCause[];
  actions: V7CorrectionAction[];
  
  summary: {
    healthScore: number;
    totalFindings: number;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
    canAutoFix: boolean;
    primaryAction: string;
  };
}

// ============================================================================
// INTERNAL TYPES
// ============================================================================

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  start_time?: number;
  end_time?: number;
}

export interface NormalizedWordTimestamp {
  word: string;
  start: number;
  end: number;
  index: number;
}

export interface KeywordMatch {
  keyword: string;
  timestamp: number;
  wordIndex: number;
  phaseId?: string;
}

export interface PhaseData {
  id: string;
  type: string;
  title?: string;
  startTime: number;
  endTime: number;
  visual?: {
    type?: string;
    content?: Record<string, unknown>;
  };
  interaction?: {
    type?: string;
    options?: Array<{
      id: string;
      text: string;
      isCorrect?: boolean;
      feedback?: {
        audioUrl?: string;
      };
    }>;
  };
  anchorText?: {
    pauseAt?: string;
    transitionAt?: string;
  };
  anchorActions?: Array<{
    id: string;
    keyword?: string;
    anchorText?: string;
    type?: string;
    actionType?: string;
    timestamp?: number;
  }>;
  microVisuals?: Array<{
    id: string;
    anchorText?: string;
    type?: string;
    triggerTime?: number;
    duration?: number;
    content?: Record<string, unknown>;
  }>;
  narration?: string;
}

export interface LessonData {
  id: string;
  title: string;
  content: Record<string, unknown>;
  word_timestamps?: WordTimestamp[] | null;
  audio_url?: string | null;
}

// ============================================================================
// VALID TYPES
// ============================================================================

export const VALID_PHASE_TYPES = [
  'dramatic',
  'narrative', 
  'comparison',
  'interaction',
  'playground',
  'revelation',
  'secret-reveal',
  'cta',
  'gamification',
  'loading'
] as const;

export const VALID_VISUAL_TYPES = [
  'number-reveal',
  'text-reveal',
  'split-screen',
  'letter-reveal',
  'cards-reveal',
  'quiz',
  'quiz-feedback',
  'playground',
  'result',
  'cta',
  'loading',
  'image',
  'video',
  'effects-only',
  'image-sequence'
] as const;

export const VALID_MICROVISUAL_TYPES = [
  'icon',
  'text',
  'number',
  'image',
  'badge',
  'highlight',
  'letter-reveal'
] as const;

export const VALID_INTERACTION_TYPES = [
  'quiz',
  'playground',
  'cta-button',
  'challenge'
] as const;

export const INTERACTIVE_PHASE_TYPES = [
  'interaction',
  'playground',
  'cta',
  'secret-reveal'
] as const;
