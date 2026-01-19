/**
 * V7 Debug Schema - Sistema de Debug Automático Hardcore
 * ========================================================
 * 
 * Este arquivo define TODAS as estruturas de diagnóstico para:
 * - Pipeline (geração)
 * - Player (execução)
 * - Renderização (visual)
 * - Sincronização (áudio + eventos)
 * 
 * O objetivo é permitir que qualquer engenheiro/IA identifique
 * a causa raiz de um problema SEM precisar ver/rodar a aula.
 * 
 * @version 1.0.0
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export type V7DebugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type V7EventStatus = 'executed' | 'delayed' | 'not_fired' | 'error' | 'skipped';
export type V7AssetStatus = 'loaded' | 'loading' | 'failed' | 'not_found' | 'timeout';
export type V7TriggerType = 'time' | 'anchor_text' | 'fallback' | 'manual' | 'auto';

// ============================================================================
// NÍVEL 1: ÁUDIO (Fonte da Verdade)
// ============================================================================

export interface V7DebugAudio {
  /** URL do áudio gerado */
  audioUrl: string | null;
  /** Duração real do áudio (segundos) */
  actualDuration: number;
  /** Duração esperada baseada no texto */
  expectedDuration: number;
  /** Texto original enviado para ElevenLabs */
  inputText: string;
  /** Número de caracteres enviados */
  inputTextLength: number;
  /** Texto efetivamente narrado (derivado dos timestamps) */
  spokenText: string;
  /** Número de caracteres narrados */
  spokenTextLength: number;
  /** Número de palavras nos timestamps */
  wordCount: number;
  /** Primeira palavra nos timestamps */
  firstWord: { word: string; start: number; end: number } | null;
  /** Última palavra nos timestamps */
  lastWord: { word: string; start: number; end: number } | null;
  /** Audio foi truncado? */
  isTruncated: boolean;
  /** Diferença entre texto enviado vs narrado */
  truncationDetails: {
    missingWords: string[];
    percentageSpoken: number;
  } | null;
  /** Tags/marcadores que podem ter vazado para TTS */
  leakedTags: string[];
  /** Problemas detectados */
  issues: V7DebugIssue[];
}

// ============================================================================
// NÍVEL 2: TIMELINE PLANEJADA
// ============================================================================

export interface V7DebugTimelineEvent {
  /** ID único do evento */
  eventId: string;
  /** Tipo do evento */
  eventType: 'phase_start' | 'phase_end' | 'anchor_pause' | 'anchor_show' | 'anchor_trigger' | 
             'micro_visual' | 'interaction_start' | 'feedback_play' | 'scene_change';
  /** ID da fase onde o evento deveria ocorrer */
  phaseId: string;
  /** Tipo do gatilho */
  triggerType: V7TriggerType;
  /** Timestamp esperado (segundos) */
  expectedAt: number;
  /** Texto âncora (se aplicável) */
  anchorText: string | null;
  /** Target do evento (se aplicável) */
  targetId: string | null;
  /** Payload/dados adicionais */
  payload: Record<string, unknown> | null;
}

export interface V7DebugTimeline {
  /** Lista de todos eventos planejados */
  plannedEvents: V7DebugTimelineEvent[];
  /** Total de fases */
  totalPhases: number;
  /** Total de eventos */
  totalEvents: number;
  /** Fases com interação */
  interactivePhases: string[];
  /** Resumo por tipo de evento */
  eventsByType: Record<string, number>;
  /** Problemas na timeline */
  issues: V7DebugIssue[];
}

// ============================================================================
// NÍVEL 3: EXECUÇÃO REAL (Capturado pelo Player)
// ============================================================================

export interface V7DebugExecutedEvent {
  /** ID do evento (deve corresponder ao planejado) */
  eventId: string;
  /** Status da execução */
  status: V7EventStatus;
  /** Timestamp real do disparo */
  actualAt: number | null;
  /** Diferença entre esperado e real (ms) */
  driftMs: number | null;
  /** Tempo de execução (ms) */
  executionTimeMs: number | null;
  /** Erro (se houver) */
  error: string | null;
  /** Metadata da execução */
  metadata: {
    /** Tentativas de disparo */
    attempts: number;
    /** O evento foi acionado por fallback? */
    usedFallback: boolean;
    /** Motivo do status */
    reason: string | null;
  };
}

export interface V7DebugExecution {
  /** Eventos realmente executados */
  executedEvents: V7DebugExecutedEvent[];
  /** Eventos que não dispararam */
  missedEvents: string[];
  /** Eventos atrasados (>100ms de drift) */
  delayedEvents: string[];
  /** Total de eventos executados */
  executed: number;
  /** Total de eventos falhados */
  failed: number;
  /** Drift médio (ms) */
  averageDriftMs: number;
  /** Maior drift (ms) */
  maxDriftMs: number;
  /** Problemas de execução */
  issues: V7DebugIssue[];
}

// ============================================================================
// NÍVEL 4: RENDERIZAÇÃO
// ============================================================================

export interface V7DebugAsset {
  /** ID do asset */
  assetId: string;
  /** Tipo do asset */
  assetType: 'audio' | 'image' | 'video' | 'animation' | 'component';
  /** URL do asset */
  url: string | null;
  /** Status de carregamento */
  status: V7AssetStatus;
  /** Tempo de carregamento (ms) */
  loadTimeMs: number | null;
  /** Tamanho do asset (bytes) */
  sizeBytes: number | null;
  /** Fallback foi usado? */
  usedFallback: boolean;
  /** Erro de carregamento */
  error: string | null;
}

export interface V7DebugRender {
  /** ID da fase/cena */
  targetId: string;
  /** Tipo de visual */
  visualType: string;
  /** Render foi aplicado? */
  rendered: boolean;
  /** Tempo para primeira renderização (ms) */
  firstRenderMs: number | null;
  /** Tempo de renderização completa (ms) */
  fullRenderMs: number | null;
  /** Assets utilizados */
  assets: V7DebugAsset[];
  /** Animações aplicadas */
  animations: string[];
  /** Erro de renderização */
  error: string | null;
}

export interface V7DebugRendering {
  /** Renderizações por fase/cena */
  renders: V7DebugRender[];
  /** Assets que falharam ao carregar */
  failedAssets: V7DebugAsset[];
  /** Assets que usaram fallback */
  fallbackAssets: V7DebugAsset[];
  /** Tempo médio de carregamento */
  averageLoadTimeMs: number;
  /** Tempo máximo de carregamento */
  maxLoadTimeMs: number;
  /** Problemas de renderização */
  issues: V7DebugIssue[];
}

// ============================================================================
// NÍVEL 5: PLAYER / UX
// ============================================================================

export interface V7DebugPlayerEvent {
  /** Tipo do evento */
  eventType: 'play' | 'pause' | 'seek' | 'phase_change' | 'interaction_start' | 
             'interaction_end' | 'error' | 'complete';
  /** Timestamp do evento */
  timestamp: number;
  /** Dados do evento */
  data: Record<string, unknown> | null;
}

export interface V7DebugPlayerState {
  /** Status atual */
  status: string;
  /** Fase atual */
  currentPhaseIndex: number;
  /** Tempo atual */
  currentTime: number;
  /** Tempo do áudio HTML5 */
  audioCurrentTime: number | null;
  /** Diferença entre tempo do player e áudio */
  audioSyncDriftMs: number;
}

export interface V7DebugPlayer {
  /** Histórico de eventos do player */
  eventHistory: V7DebugPlayerEvent[];
  /** Estados capturados (snapshot a cada 1s) */
  stateSnapshots: V7DebugPlayerState[];
  /** Eventos que dispararam fora do viewport */
  eventsOutsideViewport: string[];
  /** Eventos que dispararam antes do asset estar pronto */
  eventsBeforeAssetReady: string[];
  /** Eventos que só funcionaram após seek/rewind */
  eventsOnlyAfterSeek: string[];
  /** Problemas de UX */
  issues: V7DebugIssue[];
}

// ============================================================================
// ISSUES & CAUSES
// ============================================================================

export interface V7DebugIssue {
  /** ID único da issue */
  id: string;
  /** Nível da issue */
  level: V7DebugSeverity;
  /** Categoria da issue */
  category: 'audio' | 'timing' | 'rendering' | 'interaction' | 'sync' | 'data';
  /** Mensagem curta */
  message: string;
  /** Descrição detalhada */
  details: string;
  /** Causa raiz provável */
  possibleCause: string;
  /** Sugestão de fix */
  suggestedFix: string;
  /** Dados relacionados */
  relatedData: Record<string, unknown> | null;
}

export type V7RootCause =
  | 'timestamp_drift'           // ElevenLabs timestamps desalinhados
  | 'audio_truncation'          // Áudio cortado/incompleto
  | 'tag_leak'                  // Tags [pause:X] vazaram para TTS
  | 'race_condition'            // Asset não estava pronto
  | 'phase_overlap'             // Fases se sobrepõem no tempo
  | 'anchor_not_found'          // Palavra âncora não encontrada
  | 'fallback_used'             // Fallback foi acionado (timing estimado)
  | 'seek_required'             // Evento só funcionou após seek
  | 'cache_stale'               // Dados em cache desatualizados
  | 'network_error'             // Falha de rede
  | 'component_error'           // Erro no componente React
  | 'unknown';

// ============================================================================
// RELATÓRIO FINAL
// ============================================================================

export interface V7DebugReport {
  /** ID da lição */
  lessonId: string;
  /** Título da lição */
  lessonTitle: string;
  /** Timestamp da geração do relatório */
  generatedAt: string;
  /** Versão do schema */
  schemaVersion: string;
  /** Fonte do relatório */
  source: 'pipeline' | 'player' | 'combined';
  
  // === NÍVEIS DE DEBUG ===
  
  /** Nível 1: Áudio */
  audio: V7DebugAudio;
  /** Nível 2: Timeline Planejada */
  timeline: V7DebugTimeline;
  /** Nível 3: Execução Real */
  execution: V7DebugExecution;
  /** Nível 4: Renderização */
  rendering: V7DebugRendering;
  /** Nível 5: Player/UX */
  player: V7DebugPlayer;
  
  // === SUMÁRIO ===
  
  /** Sumário executivo */
  summary: {
    /** Severidade geral */
    severity: V7DebugSeverity;
    /** Número total de issues */
    totalIssues: number;
    /** Issues por severidade */
    issuesBySeverity: Record<V7DebugSeverity, number>;
    /** Issues por categoria */
    issuesByCategory: Record<string, number>;
    /** Causas raiz candidatas */
    rootCauseCandidates: V7RootCause[];
    /** Recomendação principal */
    primaryRecommendation: string;
    /** Score de saúde (0-100) */
    healthScore: number;
  };
  
  /** Todas as issues agregadas */
  allIssues: V7DebugIssue[];
}

// ============================================================================
// HELPERS PARA CRIAÇÃO DE DEBUG
// ============================================================================

export function createEmptyDebugAudio(): V7DebugAudio {
  return {
    audioUrl: null,
    actualDuration: 0,
    expectedDuration: 0,
    inputText: '',
    inputTextLength: 0,
    spokenText: '',
    spokenTextLength: 0,
    wordCount: 0,
    firstWord: null,
    lastWord: null,
    isTruncated: false,
    truncationDetails: null,
    leakedTags: [],
    issues: [],
  };
}

export function createEmptyDebugTimeline(): V7DebugTimeline {
  return {
    plannedEvents: [],
    totalPhases: 0,
    totalEvents: 0,
    interactivePhases: [],
    eventsByType: {},
    issues: [],
  };
}

export function createEmptyDebugExecution(): V7DebugExecution {
  return {
    executedEvents: [],
    missedEvents: [],
    delayedEvents: [],
    executed: 0,
    failed: 0,
    averageDriftMs: 0,
    maxDriftMs: 0,
    issues: [],
  };
}

export function createEmptyDebugRendering(): V7DebugRendering {
  return {
    renders: [],
    failedAssets: [],
    fallbackAssets: [],
    averageLoadTimeMs: 0,
    maxLoadTimeMs: 0,
    issues: [],
  };
}

export function createEmptyDebugPlayer(): V7DebugPlayer {
  return {
    eventHistory: [],
    stateSnapshots: [],
    eventsOutsideViewport: [],
    eventsBeforeAssetReady: [],
    eventsOnlyAfterSeek: [],
    issues: [],
  };
}

export function createEmptyDebugReport(lessonId: string, lessonTitle: string): V7DebugReport {
  return {
    lessonId,
    lessonTitle,
    generatedAt: new Date().toISOString(),
    schemaVersion: '1.0.0',
    source: 'combined',
    audio: createEmptyDebugAudio(),
    timeline: createEmptyDebugTimeline(),
    execution: createEmptyDebugExecution(),
    rendering: createEmptyDebugRendering(),
    player: createEmptyDebugPlayer(),
    summary: {
      severity: 'info',
      totalIssues: 0,
      issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      issuesByCategory: {},
      rootCauseCandidates: [],
      primaryRecommendation: '',
      healthScore: 100,
    },
    allIssues: [],
  };
}

// ============================================================================
// ISSUE FACTORY
// ============================================================================

let issueCounter = 0;

export function createIssue(
  level: V7DebugSeverity,
  category: V7DebugIssue['category'],
  message: string,
  details: string,
  possibleCause: string,
  suggestedFix: string,
  relatedData?: Record<string, unknown>
): V7DebugIssue {
  return {
    id: `issue_${++issueCounter}_${Date.now()}`,
    level,
    category,
    message,
    details,
    possibleCause,
    suggestedFix,
    relatedData: relatedData || null,
  };
}

// ============================================================================
// ANÁLISE AUTOMÁTICA
// ============================================================================

export function analyzeDebugReport(report: V7DebugReport): void {
  const allIssues: V7DebugIssue[] = [
    ...report.audio.issues,
    ...report.timeline.issues,
    ...report.execution.issues,
    ...report.rendering.issues,
    ...report.player.issues,
  ];
  
  report.allIssues = allIssues;
  report.summary.totalIssues = allIssues.length;
  
  // Contar por severidade
  report.summary.issuesBySeverity = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  allIssues.forEach(issue => {
    report.summary.issuesBySeverity[issue.level]++;
  });
  
  // Contar por categoria
  report.summary.issuesByCategory = {};
  allIssues.forEach(issue => {
    report.summary.issuesByCategory[issue.category] = 
      (report.summary.issuesByCategory[issue.category] || 0) + 1;
  });
  
  // Determinar severidade geral
  if (report.summary.issuesBySeverity.critical > 0) {
    report.summary.severity = 'critical';
  } else if (report.summary.issuesBySeverity.high > 0) {
    report.summary.severity = 'high';
  } else if (report.summary.issuesBySeverity.medium > 0) {
    report.summary.severity = 'medium';
  } else if (report.summary.issuesBySeverity.low > 0) {
    report.summary.severity = 'low';
  } else {
    report.summary.severity = 'info';
  }
  
  // Identificar causas raiz
  const rootCauses: Set<V7RootCause> = new Set();
  
  if (report.audio.isTruncated) {
    rootCauses.add('audio_truncation');
  }
  if (report.audio.leakedTags.length > 0) {
    rootCauses.add('tag_leak');
  }
  if (report.execution.missedEvents.length > 0) {
    rootCauses.add('anchor_not_found');
  }
  if (report.execution.delayedEvents.length > 0) {
    rootCauses.add('timestamp_drift');
  }
  if (report.player.eventsBeforeAssetReady.length > 0) {
    rootCauses.add('race_condition');
  }
  if (report.player.eventsOnlyAfterSeek.length > 0) {
    rootCauses.add('seek_required');
  }
  if (report.rendering.failedAssets.length > 0) {
    rootCauses.add('network_error');
  }
  
  report.summary.rootCauseCandidates = Array.from(rootCauses);
  
  // Calcular health score
  let score = 100;
  score -= report.summary.issuesBySeverity.critical * 25;
  score -= report.summary.issuesBySeverity.high * 10;
  score -= report.summary.issuesBySeverity.medium * 5;
  score -= report.summary.issuesBySeverity.low * 2;
  report.summary.healthScore = Math.max(0, score);
  
  // Recomendação principal
  if (rootCauses.has('audio_truncation')) {
    report.summary.primaryRecommendation = 
      'Áudio está truncado. Verificar findNarrationRange() e endTime calculation.';
  } else if (rootCauses.has('tag_leak')) {
    report.summary.primaryRecommendation = 
      'Tags de pausa vazaram para TTS. Verificar cleanTextForTTS() no pipeline.';
  } else if (rootCauses.has('phase_overlap')) {
    report.summary.primaryRecommendation = 
      'Fases se sobrepõem. Verificar generatePhases() e ordenação sequencial.';
  } else if (rootCauses.has('race_condition')) {
    report.summary.primaryRecommendation = 
      'Race condition detectada. Verificar preload de assets antes dos eventos.';
  } else if (report.summary.totalIssues === 0) {
    report.summary.primaryRecommendation = 'Nenhum problema detectado. Aula saudável!';
  } else {
    report.summary.primaryRecommendation = 
      `${report.summary.totalIssues} issues encontradas. Revisar relatório completo.`;
  }
}
