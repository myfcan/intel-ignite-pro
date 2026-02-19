/**
 * V7-v2 Pipeline - Cinematographic Lesson Generator
 *
 * CONTRATO CONGELADO v1.0 - Encerra divergências Pipeline ↔ Banco ↔ Renderer
 *
 * RESPONSABILIDADES:
 * 1. Validar input (JSON de roteiro)
 * 2. Gerar áudio principal (narrações das cenas)
 * 3. Gerar áudios de feedback (narrações dos feedbacks do quiz)
 * 4. Calcular timing baseado em wordTimestamps
 * 5. Gerar V7LessonData exato conforme contrato
 * 6. Gerar DEBUG REPORT automático para diagnóstico
 * 7. Converter microVisual.type moderno → legado antes de persistir
 * 8. Mapear scene.type → phase.type persistível (secret-reveal → revelation, gamification → narrative)
 *
 * @version V7-v2 (Contrato Congelado v1.0)
 * 
 * C05 CHANGELOG:
 * - Added pipeline_executions traceability (input→output)
 * - run_id idempotency for all execution modes
 * - SHA-256 output_content_hash for verification
 *
 * C06 CHANGELOG:
 * - Single Trigger Contract: anchorActions + keywordTime is canonical
 * - triggerTime removed from microVisuals before persist
 * - show actions created for all microVisuals with keywordTime
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";

// ============================================================================
// C05: PIPELINE VERSION & TRACEABILITY CONSTANTS
// ============================================================================
const PIPELINE_VERSION = 'v7-vv-1.1.4-forcetest-fix';
const COMMIT_HASH = 'forcetest-fix-r06-r08-r11-2026-02-09';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================================
// TIPOS DE DEBUG - Schema inline (Deno não suporta import do frontend)
// ============================================================================

interface V7DebugIssue {
  id: string;
  level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'audio' | 'timing' | 'rendering' | 'interaction' | 'sync' | 'data';
  message: string;
  details: string;
  possibleCause: string;
  suggestedFix: string;
  relatedData: Record<string, unknown> | null;
}

interface V7DebugTimelineEvent {
  eventId: string;
  eventType: string;
  phaseId: string;
  triggerType: 'time' | 'anchor_text' | 'fallback' | 'manual' | 'auto';
  expectedAt: number;
  anchorText: string | null;
  targetId: string | null;
  payload: Record<string, unknown> | null;
}

interface V7PipelineDebugReport {
  lessonId: string;
  lessonTitle: string;
  generatedAt: string;
  schemaVersion: string;
  source: 'pipeline';
  
  // Nível 1: Áudio
  audio: {
    audioUrl: string | null;
    actualDuration: number;
    expectedDuration: number;
    inputText: string;
    inputTextLength: number;
    spokenText: string;
    spokenTextLength: number;
    wordCount: number;
    firstWord: { word: string; start: number; end: number } | null;
    lastWord: { word: string; start: number; end: number } | null;
    isTruncated: boolean;
    truncationDetails: { missingWords: string[]; percentageSpoken: number } | null;
    leakedTags: string[];
    issues: V7DebugIssue[];
  };
  
  // Nível 2: Timeline Planejada
  timeline: {
    plannedEvents: V7DebugTimelineEvent[];
    totalPhases: number;
    totalEvents: number;
    interactivePhases: string[];
    eventsByType: Record<string, number>;
    phaseDetails: Array<{
      id: string;
      type: string;
      startTime: number;
      endTime: number;
      duration: number;
      hasOverlap: boolean;
      overlapsWith: string | null;
    }>;
    issues: V7DebugIssue[];
  };
  
  // Sumário
  summary: {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    totalIssues: number;
    issuesBySeverity: Record<string, number>;
    issuesByCategory: Record<string, number>;
    rootCauseCandidates: string[];
    primaryRecommendation: string;
    healthScore: number;
  };
  
  allIssues: V7DebugIssue[];
}

let debugIssueCounter = 0;

function createDebugIssue(
  level: V7DebugIssue['level'],
  category: V7DebugIssue['category'],
  message: string,
  details: string,
  possibleCause: string,
  suggestedFix: string,
  relatedData?: Record<string, unknown>
): V7DebugIssue {
  return {
    id: `issue_${++debugIssueCounter}_${Date.now()}`,
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
// GERADOR DE DEBUG AUTOMÁTICO
// ============================================================================

function generatePipelineDebug(
  lessonId: string,
  lessonTitle: string,
  inputScenes: ScriptScene[],
  mainAudio: AudioSegment,
  phases: Phase[],
  inputText: string,
  feedbackAudios: FeedbackAudiosObject = {}
): V7PipelineDebugReport {
  console.log('[DEBUG] Generating pipeline debug report...');
  
  const allIssues: V7DebugIssue[] = [];
  
  // ========== NÍVEL 1: ANÁLISE DE ÁUDIO ==========
  const audioDebug = analyzeAudio(inputText, mainAudio, allIssues);
  
  // ========== NÍVEL 2: ANÁLISE DE TIMELINE ==========
  const timelineDebug = analyzeTimeline(inputScenes, phases, mainAudio, allIssues);
  
  // ========== FASE 4: VALIDAÇÃO DE FEEDBACK AUDIOS ==========
  analyzeFeedbackAudios(inputScenes, feedbackAudios, allIssues);
  
  // ========== FASE 5: DETECÇÃO DE ANCHORS NÃO ENCONTRADOS ==========
  analyzeUnfoundAnchors(inputScenes, phases, mainAudio.wordTimestamps, allIssues);
  
  // ========== SUMÁRIO ==========
  const summary = calculateSummary(allIssues);
  
  const report: V7PipelineDebugReport = {
    lessonId,
    lessonTitle,
    generatedAt: new Date().toISOString(),
    schemaVersion: '1.0.0',
    source: 'pipeline',
    audio: audioDebug,
    timeline: timelineDebug,
    summary,
    allIssues,
  };
  
  console.log(`[DEBUG] ✅ Report generated: ${allIssues.length} issues, health score: ${summary.healthScore}`);
  return report;
}

function analyzeAudio(
  inputText: string,
  mainAudio: AudioSegment,
  allIssues: V7DebugIssue[]
): V7PipelineDebugReport['audio'] {
  const wordTimestamps = mainAudio.wordTimestamps || [];
  const spokenWords = wordTimestamps.map(wt => wt.word);
  const spokenText = spokenWords.join(' ');
  
  // Detectar tags que vazaram para TTS
  const tagPatterns = [
    /\[pause:\d+\.?\d*\]/gi,
    /\[contextual\]/gi,
    /\[sound:[^\]]+\]/gi,
    /\[effect:[^\]]+\]/gi,
  ];
  
  const leakedTags: string[] = [];
  for (const pattern of tagPatterns) {
    const matches = spokenText.match(pattern);
    if (matches) {
      leakedTags.push(...matches);
    }
  }
  
  // Detectar truncamento
  const inputWords = inputText.split(/\s+/).filter(w => w.length > 0);
  const expectedWordCount = inputWords.length;
  const actualWordCount = spokenWords.length;
  const percentageSpoken = expectedWordCount > 0 
    ? (actualWordCount / expectedWordCount) * 100 
    : 100;
  
  const isTruncated = percentageSpoken < 90;
  
  // Gerar issues
  const issues: V7DebugIssue[] = [];
  
  if (leakedTags.length > 0) {
    const issue = createDebugIssue(
      'critical',
      'audio',
      `${leakedTags.length} tag(s) vazaram para TTS`,
      `Tags detectadas na narração: ${leakedTags.join(', ')}`,
      'cleanTextForTTS não removeu todas as tags antes de enviar para ElevenLabs',
      'Verificar regex de limpeza em cleanTextForTTS',
      { leakedTags }
    );
    issues.push(issue);
    allIssues.push(issue);
  }
  
  if (isTruncated) {
    const missingCount = expectedWordCount - actualWordCount;
    const issue = createDebugIssue(
      'high',
      'audio',
      `Áudio truncado: ${percentageSpoken.toFixed(1)}% narrado`,
      `Esperado: ${expectedWordCount} palavras, Narrado: ${actualWordCount} palavras (faltam ${missingCount})`,
      'ElevenLabs pode ter cortado o texto por limite de caracteres ou erro de streaming',
      'Verificar limite de caracteres do ElevenLabs (5000) e qualidade da conexão',
      { expectedWordCount, actualWordCount, percentageSpoken }
    );
    issues.push(issue);
    allIssues.push(issue);
  }
  
  if (!mainAudio.url) {
    const issue = createDebugIssue(
      'critical',
      'audio',
      'Áudio não foi gerado',
      'mainAudio.url está vazio',
      'Falha na geração ou upload do áudio para Supabase Storage',
      'Verificar ELEVENLABS_API_KEY e bucket lesson-audios',
      {}
    );
    issues.push(issue);
    allIssues.push(issue);
  }
  
  if (mainAudio.duration === 0 && mainAudio.url) {
    const issue = createDebugIssue(
      'high',
      'audio',
      'Duração do áudio é zero',
      'mainAudio.duration = 0 mas URL existe',
      'wordTimestamps podem estar vazios ou mal processados',
      'Verificar processWordTimestamps e resposta do ElevenLabs',
      {}
    );
    issues.push(issue);
    allIssues.push(issue);
  }
  
  return {
    audioUrl: mainAudio.url || null,
    actualDuration: mainAudio.duration,
    expectedDuration: (inputWords.length / 2.5), // ~2.5 palavras por segundo
    inputText: inputText.substring(0, 500) + (inputText.length > 500 ? '...' : ''),
    inputTextLength: inputText.length,
    spokenText: spokenText.substring(0, 500) + (spokenText.length > 500 ? '...' : ''),
    spokenTextLength: spokenText.length,
    wordCount: actualWordCount,
    firstWord: wordTimestamps[0] || null,
    lastWord: wordTimestamps[wordTimestamps.length - 1] || null,
    isTruncated,
    truncationDetails: isTruncated ? {
      missingWords: inputWords.slice(actualWordCount),
      percentageSpoken,
    } : null,
    leakedTags,
    issues,
  };
}

function analyzeTimeline(
  inputScenes: ScriptScene[],
  phases: Phase[],
  mainAudio: AudioSegment,
  allIssues: V7DebugIssue[]
): V7PipelineDebugReport['timeline'] {
  const issues: V7DebugIssue[] = [];
  const plannedEvents: V7DebugTimelineEvent[] = [];
  const phaseDetails: V7PipelineDebugReport['timeline']['phaseDetails'] = [];
  
  // Analisar cada fase
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const nextPhase = phases[i + 1];
    
    const duration = phase.endTime - phase.startTime;
    const hasOverlap = nextPhase ? phase.endTime > nextPhase.startTime : false;
    
    phaseDetails.push({
      id: phase.id,
      type: phase.type,
      startTime: phase.startTime,
      endTime: phase.endTime,
      duration,
      hasOverlap,
      overlapsWith: hasOverlap ? nextPhase.id : null,
    });
    
    // Issue: Overlap
    if (hasOverlap) {
      const issue = createDebugIssue(
        'critical',
        'timing',
        `Fase ${phase.id} sobrepõe ${nextPhase.id}`,
        `${phase.id} termina em ${phase.endTime.toFixed(2)}s mas ${nextPhase.id} começa em ${nextPhase.startTime.toFixed(2)}s`,
        'calculateWordBasedTimings não respeitou limite de nextPhase.startTime',
        'Verificar lógica de cap no calculateWordBasedTimings',
        { phaseEndTime: phase.endTime, nextPhaseStartTime: nextPhase.startTime }
      );
      issues.push(issue);
      allIssues.push(issue);
    }
    
    // Issue: Duração inválida
    if (duration <= 0) {
      const issue = createDebugIssue(
        'critical',
        'timing',
        `Fase ${phase.id} tem duração inválida`,
        `startTime: ${phase.startTime.toFixed(2)}s, endTime: ${phase.endTime.toFixed(2)}s, duration: ${duration.toFixed(2)}s`,
        'endTime foi calculado antes ou igual ao startTime',
        'Verificar fallback de duração mínima em generatePhases',
        { startTime: phase.startTime, endTime: phase.endTime }
      );
      issues.push(issue);
      allIssues.push(issue);
    }
    
    // Adicionar eventos planejados
    plannedEvents.push({
      eventId: `phase_start_${phase.id}`,
      eventType: 'phase_start',
      phaseId: phase.id,
      triggerType: 'time',
      expectedAt: phase.startTime,
      anchorText: null,
      targetId: null,
      payload: { type: phase.type },
    });
    
    plannedEvents.push({
      eventId: `phase_end_${phase.id}`,
      eventType: 'phase_end',
      phaseId: phase.id,
      triggerType: 'time',
      expectedAt: phase.endTime,
      anchorText: null,
      targetId: null,
      payload: null,
    });
    
    // Eventos de anchor
    if (phase.anchorActions) {
      for (const anchor of phase.anchorActions) {
        plannedEvents.push({
          eventId: `anchor_${anchor.id}`,
          eventType: `anchor_${anchor.type}`,
          phaseId: phase.id,
          triggerType: 'anchor_text',
          expectedAt: anchor.keywordTime,
          anchorText: anchor.keyword,
          targetId: anchor.targetId || null,
          payload: null,
        });
      }
    }
    
    // Eventos de microVisuals
    if (phase.microVisuals) {
      for (const mv of phase.microVisuals) {
        plannedEvents.push({
          eventId: `micro_${mv.id}`,
          eventType: 'micro_visual',
          phaseId: phase.id,
          triggerType: 'anchor_text',
          expectedAt: mv.triggerTime,
          anchorText: mv.anchorText,
          targetId: mv.id,
          payload: { type: mv.type },
        });
      }
    }
  }
  
  // Verificar se última fase termina no fim do áudio
  const lastPhase = phases[phases.length - 1];
  if (lastPhase && Math.abs(lastPhase.endTime - mainAudio.duration) > 0.5) {
    const issue = createDebugIssue(
      'medium',
      'timing',
      'Última fase não termina no fim do áudio',
      `Última fase termina em ${lastPhase.endTime.toFixed(2)}s, áudio tem ${mainAudio.duration.toFixed(2)}s`,
      'Cálculo de timing não sincronizou com duração real do áudio',
      'Verificar atribuição de lastPhase.endTime = totalAudioDuration',
      { lastPhaseEndTime: lastPhase.endTime, audioDuration: mainAudio.duration }
    );
    issues.push(issue);
    allIssues.push(issue);
  }
  
  // Contar eventos por tipo
  const eventsByType: Record<string, number> = {};
  for (const event of plannedEvents) {
    eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
  }
  
  // Identificar fases interativas
  const interactivePhases = phases
    .filter(p => ['interaction', 'quiz', 'playground', 'secret-reveal'].includes(p.type))
    .map(p => p.id);
  
  return {
    plannedEvents,
    totalPhases: phases.length,
    totalEvents: plannedEvents.length,
    interactivePhases,
    eventsByType,
    phaseDetails,
    issues,
  };
}

function calculateSummary(allIssues: V7DebugIssue[]): V7PipelineDebugReport['summary'] {
  const issuesBySeverity: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  
  const issuesByCategory: Record<string, number> = {};
  const rootCauseCandidates: string[] = [];
  
  for (const issue of allIssues) {
    issuesBySeverity[issue.level]++;
    issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
    
    if (issue.possibleCause && !rootCauseCandidates.includes(issue.possibleCause)) {
      rootCauseCandidates.push(issue.possibleCause);
    }
  }
  
  // Determinar severidade geral
  let severity: V7PipelineDebugReport['summary']['severity'] = 'info';
  if (issuesBySeverity.critical > 0) {
    severity = 'critical';
  } else if (issuesBySeverity.high > 0) {
    severity = 'high';
  } else if (issuesBySeverity.medium > 0) {
    severity = 'medium';
  } else if (issuesBySeverity.low > 0) {
    severity = 'low';
  }
  
  // Calcular health score (100 - penalidades)
  let healthScore = 100;
  healthScore -= issuesBySeverity.critical * 30;
  healthScore -= issuesBySeverity.high * 15;
  healthScore -= issuesBySeverity.medium * 5;
  healthScore -= issuesBySeverity.low * 1;
  healthScore = Math.max(0, healthScore);
  
  // Recomendação principal
  let primaryRecommendation = 'Aula gerada sem problemas detectados.';
  if (severity === 'critical') {
    primaryRecommendation = 'CRÍTICO: Corrigir issues críticas antes de publicar.';
  } else if (severity === 'high') {
    primaryRecommendation = 'ATENÇÃO: Revisar issues de alta severidade.';
  } else if (severity === 'medium') {
    primaryRecommendation = 'Verificar issues de média severidade para melhor experiência.';
  }
  
  return {
    severity,
    totalIssues: allIssues.length,
    issuesBySeverity,
    issuesByCategory,
    rootCauseCandidates,
    primaryRecommendation,
    healthScore,
  };
}

// ============================================================================
// AUDIT FUNCTIONS - lesson_migrations_audit (v4.1)
// ============================================================================

const ANCHOR_EPS = 0.30; // Tolerância de 300ms para validação inRange

async function computeSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function computeStructureHash(phases: any[]): Promise<string> {
  // Ordenar antes de hashear para garantir determinismo
  const sortedPhases = [...phases]
    .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
    .map(p => ({
      id: p.id,
      type: p.type,
      anchors: [...(p.anchorActions || [])]
        .sort((a, b) => {
          const keyA = a.id || `${a.type}|${a.keyword}|${a.targetId || ''}`;
          const keyB = b.id || `${b.type}|${b.keyword}|${b.targetId || ''}`;
          return keyA.localeCompare(keyB);
        })
        .map((a: any) => ({
          id: a.id,
          type: a.type,
          keyword: a.keyword,
          targetId: a.targetId
          // keywordTime EXCLUÍDO propositalmente
        }))
    }));
  
  return computeSHA256(JSON.stringify(sortedPhases));
}

async function computeTimingHash(phases: any[]): Promise<string> {
  const sortedPhases = [...phases]
    .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
    .map(p => ({
      id: p.id,
      anchors: [...(p.anchorActions || [])]
        .sort((a, b) => {
          const keyA = a.id || `${a.type}|${a.keyword}|${a.targetId || ''}`;
          const keyB = b.id || `${b.type}|${b.keyword}|${b.targetId || ''}`;
          return keyA.localeCompare(keyB);
        })
        .map((a: any) => ({
          id: a.id,
          keywordTime: a.keywordTime
        }))
    }));
  
  return computeSHA256(JSON.stringify(sortedPhases));
}

function buildAnchorKey(phaseId: string, anchor: any, anchorIndex: number): string {
  // SEMPRE incluir phaseId para evitar colisões
  if (anchor.id) {
    return `phase:${phaseId}|id:${anchor.id}`;
  }
  // Fallback: incluir índice para evitar colisão em anchors repetidos
  if (anchor.targetId) {
    return `phase:${phaseId}|idx:${anchorIndex}|type:${anchor.type}|target:${anchor.targetId}|kw:${anchor.keyword}`;
  }
  return `phase:${phaseId}|idx:${anchorIndex}|type:${anchor.type}|kw:${anchor.keyword}`;
}

async function computeAnchorDiffStrong(oldContent: any, newContent: any): Promise<object> {
  const oldPhases = oldContent?.phases || [];
  const newPhases = newContent?.phases || [];
  
  // Calcular hashes
  const structureHashOld = await computeStructureHash(oldPhases);
  const structureHashNew = await computeStructureHash(newPhases);
  const timingHashOld = await computeTimingHash(oldPhases);
  const timingHashNew = await computeTimingHash(newPhases);
  
  const structureHashMatch = structureHashOld === structureHashNew;
  const timingHashMatch = timingHashOld === timingHashNew;
  
  const results: any = {
    hashes: {
      structureHashOld,
      structureHashNew,
      structureHashMatch,
      timingHashOld,
      timingHashNew,
      timingHashMatch,
      algorithm: 'SHA-256'
    },
    validationConfig: {
      anchorEps: ANCHOR_EPS,
      epsUnit: 'seconds'
    },
    anchorsComparedTotal: 0,
    anchorsOnlyInOld: 0,
    anchorsOnlyInNew: 0,
    anchorsUnchanged: 0,
    anchorsChangedKeywordTimeOnly: 0,
    anchorsChangedKeyword: 0,
    anchorsChangedType: 0,
    anchorsChangedOther: 0,
    keywordTimeChanges: [] as any[],
    invalidChanges: [] as any[],
    c01Valid: false,
    c01Reason: ''
  };
  
  // Construir mapas com chave corrigida (inclui phaseId + idx)
  const oldAnchorsMap = new Map<string, { phase: any, anchor: any, index: number }>();
  for (const phase of oldPhases) {
    const anchors = phase.anchorActions || [];
    anchors.forEach((anchor: any, idx: number) => {
      const key = buildAnchorKey(phase.id, anchor, idx);
      oldAnchorsMap.set(key, { phase, anchor, index: idx });
    });
  }
  
  const newAnchorsMap = new Map<string, { phase: any, anchor: any, index: number }>();
  for (const phase of newPhases) {
    const anchors = phase.anchorActions || [];
    anchors.forEach((anchor: any, idx: number) => {
      const key = buildAnchorKey(phase.id, anchor, idx);
      newAnchorsMap.set(key, { phase, anchor, index: idx });
    });
  }
  
  // Anchors só no OLD
  for (const [key, { phase, anchor }] of oldAnchorsMap) {
    if (!newAnchorsMap.has(key)) {
      results.anchorsOnlyInOld++;
      results.invalidChanges.push({
        type: 'ANCHOR_REMOVED',
        phaseId: phase.id,
        anchorId: anchor.id,
        keyword: anchor.keyword
      });
    }
  }
  
  // Comparar pareados + anchors só no NEW
  for (const [key, { phase: newPhase, anchor: newAnchor }] of newAnchorsMap) {
    const oldEntry = oldAnchorsMap.get(key);
    
    if (!oldEntry) {
      results.anchorsOnlyInNew++;
      results.invalidChanges.push({
        type: 'ANCHOR_ADDED',
        phaseId: newPhase.id,
        anchorId: newAnchor.id,
        keyword: newAnchor.keyword
      });
      continue;
    }
    
    results.anchorsComparedTotal++;
    const oldAnchor = oldEntry.anchor;
    
    const changes = {
      keywordChanged: oldAnchor.keyword !== newAnchor.keyword,
      typeChanged: oldAnchor.type !== newAnchor.type,
      targetIdChanged: oldAnchor.targetId !== newAnchor.targetId,
      keywordTimeChanged: oldAnchor.keywordTime !== newAnchor.keywordTime
    };
    
    if (!changes.keywordChanged && !changes.typeChanged && 
        !changes.targetIdChanged && !changes.keywordTimeChanged) {
      results.anchorsUnchanged++;
    } else if (changes.keywordTimeChanged && !changes.keywordChanged && 
               !changes.typeChanged && !changes.targetIdChanged) {
      results.anchorsChangedKeywordTimeOnly++;
      
      // Validação inRange com EPS
      const t = newAnchor.keywordTime;
      const start = newPhase.startTime;
      const end = newPhase.endTime;
      const isInRange = (t >= start - ANCHOR_EPS) && (t <= end + ANCHOR_EPS);
      
      results.keywordTimeChanges.push({
        phaseId: newPhase.id,
        anchorId: newAnchor.id,
        keyword: newAnchor.keyword,
        type: newAnchor.type,
        oldKeywordTime: oldAnchor.keywordTime,
        newKeywordTime: newAnchor.keywordTime,
        delta: newAnchor.keywordTime - oldAnchor.keywordTime,
        phaseRange: [start, end],
        isInRange,
        epsUsed: ANCHOR_EPS
      });
    } else {
      if (changes.keywordChanged) results.anchorsChangedKeyword++;
      if (changes.typeChanged) results.anchorsChangedType++;
      if (!changes.keywordChanged && !changes.typeChanged) results.anchorsChangedOther++;
      
      results.invalidChanges.push({
        type: 'INVALID_CHANGE',
        phaseId: newPhase.id,
        anchorId: newAnchor.id,
        changes
      });
    }
  }
  
  // Veredicto C01 com hash como prova primária
  if (!structureHashMatch) {
    results.c01Valid = false;
    results.c01Reason = 'Structure hash mismatch - non-timing properties changed';
  } else if (results.anchorsOnlyInOld > 0 || results.anchorsOnlyInNew > 0) {
    results.c01Valid = false;
    results.c01Reason = `Anchors added/removed: ${results.anchorsOnlyInNew} new, ${results.anchorsOnlyInOld} removed`;
  } else if (results.anchorsChangedKeywordTimeOnly === 0 && results.anchorsUnchanged > 0) {
    results.c01Valid = true;
    results.c01Reason = 'No changes needed - all anchors already correct (structureHashMatch=true)';
  } else if (results.anchorsChangedKeywordTimeOnly > 0 && structureHashMatch) {
    results.c01Valid = true;
    results.c01Reason = `Only keywordTime changed in ${results.anchorsChangedKeywordTimeOnly} anchors (structureHashMatch=true)`;
  } else {
    results.c01Valid = false;
    results.c01Reason = 'No anchors compared or unknown state';
  }
  
  return results;
}

// ============================================================================
// FASE 4: VALIDAÇÃO DE FEEDBACK AUDIOS
// ============================================================================

function analyzeFeedbackAudios(
  inputScenes: ScriptScene[],
  feedbackAudios: FeedbackAudiosObject,
  allIssues: V7DebugIssue[]
): void {
  // Coletar todos os feedbacks esperados das scenes interativas
  const expectedFeedbacks: Array<{ optionId: string; sceneId: string; hasNarration: boolean }> = [];
  
  for (const scene of inputScenes) {
    if (scene.interaction?.type === 'quiz' && scene.interaction.options) {
      for (const option of scene.interaction.options) {
        expectedFeedbacks.push({
          optionId: option.id,
          sceneId: scene.id,
          hasNarration: !!(option.feedback?.narration),
        });
      }
    }
  }
  
  // Verificar feedbacks que deveriam ter áudio mas não têm
  for (const expected of expectedFeedbacks) {
    if (expected.hasNarration) {
      const feedbackKey = `feedback-${expected.optionId}`;
      const audio = feedbackAudios[feedbackKey];
      
      if (!audio) {
        allIssues.push(createDebugIssue(
          'high',
          'audio',
          `Feedback audio não gerado para opção ${expected.optionId}`,
          `Scene ${expected.sceneId} tem narração de feedback mas audio não foi gerado`,
          'generateAudio falhou ou não foi chamado para este feedback',
          'Verificar logs de geração de feedback audios',
          { optionId: expected.optionId, sceneId: expected.sceneId }
        ));
      } else if (!audio.url) {
        allIssues.push(createDebugIssue(
          'high',
          'audio',
          `Feedback audio sem URL para opção ${expected.optionId}`,
          `Audio foi gerado mas URL está vazia`,
          'Upload para Supabase Storage falhou',
          'Verificar bucket lesson-audios e permissões',
          { optionId: expected.optionId, feedbackKey }
        ));
      } else if (audio.duration === 0) {
        allIssues.push(createDebugIssue(
          'medium',
          'audio',
          `Feedback audio com duração zero para opção ${expected.optionId}`,
          `Audio URL existe mas duration = 0`,
          'wordTimestamps vazios ou mal processados',
          'Verificar resposta do ElevenLabs para este feedback',
          { optionId: expected.optionId, url: audio.url }
        ));
      }
    }
  }
  
  // Log estatísticas
  const feedbackCount = Object.keys(feedbackAudios).length;
  const expectedWithNarration = expectedFeedbacks.filter(f => f.hasNarration).length;
  console.log(`[DEBUG] Feedback audios: ${feedbackCount}/${expectedWithNarration} gerados`);
}

// ============================================================================
// FASE 5: DETECÇÃO DE ANCHORS NÃO ENCONTRADOS
// ============================================================================

function analyzeUnfoundAnchors(
  inputScenes: ScriptScene[],
  phases: Phase[],
  wordTimestamps: WordTimestamp[],
  allIssues: V7DebugIssue[]
): void {
  if (wordTimestamps.length === 0) {
    console.log('[DEBUG] No wordTimestamps available for anchor analysis');
    return;
  }
  
  // ✅ V7-vv SYSTEMIC FIX: Normalização melhorada para match mais robusto
  const normalizeForSearch = (word: string): string => {
    return word
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[.,!?;:'"()[\]{}…\-]+/g, '')
      .trim();
  };
  
  // Normalizar palavras do áudio para busca
  const normalizedWords = wordTimestamps.map(wt => ({
    ...wt,
    normalized: normalizeForSearch(wt.word),
  }));
  
  // Coletar todos os anchors definidos nas scenes COM range de tempo
  const definedAnchors: Array<{ 
    sceneId: string; 
    anchorType: 'pauseAt' | 'transitionAt' | 'microVisual';
    anchorText: string;
    phaseStartTime?: number;
    phaseEndTime?: number;
  }> = [];
  
  for (let i = 0; i < inputScenes.length; i++) {
    const scene = inputScenes[i];
    const phase = phases[i]; // Fase correspondente para obter timing
    
    if (scene.anchorText?.pauseAt) {
      definedAnchors.push({
        sceneId: scene.id,
        anchorType: 'pauseAt',
        anchorText: scene.anchorText.pauseAt,
        phaseStartTime: phase?.startTime,
        phaseEndTime: phase?.endTime,
      });
    }
    if (scene.anchorText?.transitionAt) {
      definedAnchors.push({
        sceneId: scene.id,
        anchorType: 'transitionAt',
        anchorText: scene.anchorText.transitionAt,
        phaseStartTime: phase?.startTime,
        phaseEndTime: phase?.endTime,
      });
    }
    if (scene.visual?.microVisuals) {
      for (const mv of scene.visual.microVisuals) {
        definedAnchors.push({
          sceneId: scene.id,
          anchorType: 'microVisual',
          anchorText: mv.anchorText,
          phaseStartTime: phase?.startTime,
          phaseEndTime: phase?.endTime,
        });
      }
    }
  }
  
  // ✅ V7-vv: Busca de anchor DENTRO do range correto
  // IMPORTANTE: A narração do acrônimo DEVE estar na mesma cena que os microVisuals
  // Ver: docs/V7-JSON-TEMPLATE-LETTER-REVEAL.md
  const unfoundAnchors: Array<typeof definedAnchors[0] & { searchedRange?: string }> = [];
  
  for (const anchor of definedAnchors) {
    const anchorWords = anchor.anchorText.split(/\s+/).map(normalizeForSearch).filter(w => w.length > 0);
    
    if (anchorWords.length === 0) {
      unfoundAnchors.push({ ...anchor, searchedRange: 'invalid anchor text' });
      continue;
    }
    
    // Filtrar timestamps pelo range da fase (se disponível)
    const relevantWords = anchor.phaseStartTime !== undefined && anchor.phaseEndTime !== undefined
      ? normalizedWords.filter(wt => wt.start >= anchor.phaseStartTime! && wt.end <= anchor.phaseEndTime!)
      : normalizedWords;
    
    // Procurar todas as palavras do anchor na sequência
    let found = false;
    
    if (anchorWords.length === 1) {
      // Single word: busca exata ou parcial
      const target = anchorWords[0];
      found = relevantWords.some(wt => 
        wt.normalized === target || 
        wt.normalized.includes(target) || 
        target.includes(wt.normalized)
      );
    } else {
      // Multi-word: busca sequencial
      for (let i = 0; i <= relevantWords.length - anchorWords.length; i++) {
        const windowMatch = anchorWords.every((aw, offset) => {
          const wt = relevantWords[i + offset];
          return wt && (wt.normalized === aw || wt.normalized.includes(aw) || aw.includes(wt.normalized));
        });
        if (windowMatch) {
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      unfoundAnchors.push({
        ...anchor,
        searchedRange: anchor.phaseStartTime !== undefined 
          ? `${anchor.phaseStartTime.toFixed(1)}s-${anchor.phaseEndTime?.toFixed(1)}s (${relevantWords.length} words)`
          : 'full audio'
      });
    }
  }
  
  // Reportar anchors não encontrados com detalhes de range
  if (unfoundAnchors.length > 0) {
    const groupedByScene: Record<string, string[]> = {};
    
    for (const anchor of unfoundAnchors) {
      if (!groupedByScene[anchor.sceneId]) {
        groupedByScene[anchor.sceneId] = [];
      }
      groupedByScene[anchor.sceneId].push(
        `${anchor.anchorType}: "${anchor.anchorText}" (range: ${anchor.searchedRange})`
      );
    }
    
    for (const [sceneId, anchors] of Object.entries(groupedByScene)) {
      allIssues.push(createDebugIssue(
        'high',
        'sync',
        `${anchors.length} anchor(s) não encontrado(s) em ${sceneId}`,
        `Anchors: ${anchors.join('; ')}`,
        'anchor_not_found',
        'Verificar se a palavra existe exatamente no texto da narração e usar palavras mais distintivas. Considerar usar a última palavra de uma frase.',
        { sceneId, unfoundAnchors: anchors }
      ));
    }
  }
  
  // Log estatísticas detalhadas
  console.log(`[DEBUG] Anchors: ${definedAnchors.length} definidos, ${definedAnchors.length - unfoundAnchors.length} encontrados, ${unfoundAnchors.length} não encontrados`);
  if (unfoundAnchors.length > 0) {
    console.log(`[DEBUG] Unfound anchors:`, unfoundAnchors.map(a => `"${a.anchorText}" in ${a.sceneId}`));
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// C05: PIPELINE EXECUTION TRACEABILITY FUNCTIONS
// ============================================================================

interface C05ExecutionRecord {
  run_id: string;
  pipeline_version: string;
  commit_hash: string;
  mode: 'create' | 'reprocess' | 'dry_run';
  lesson_id?: string;
  lesson_title: string;
  input_data: any;
  normalized_input?: any;
  dry_run_result?: any;
  output_data?: any;  // C05.1: Full output data with content, lesson_id, meta
  output_content_hash?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error_message?: string;
}

/**
 * C05: Insere registro de execução do pipeline (status=in_progress)
 */
async function c05InsertExecution(
  supabase: any,
  record: Omit<C05ExecutionRecord, 'status'>
): Promise<{ success: boolean; error?: string }> {
  console.log(`[C05] Inserting execution record: run_id=${record.run_id}, mode=${record.mode}`);
  
  // C05.1: normalized_input defaults to input_data if not explicitly normalized
  const normalizedInput = record.normalized_input ?? record.input_data;
  
  const { error } = await supabase
    .from('pipeline_executions')
    .insert({
      id: record.run_id, // Use run_id as primary key for idempotency
      run_id: record.run_id,
      pipeline_version: record.pipeline_version,
      commit_hash: record.commit_hash,
      mode: record.mode,
      lesson_id: record.lesson_id || null,
      lesson_title: record.lesson_title,
      model: 'v7-vv',
      input_data: record.input_data,
      normalized_input: normalizedInput, // C05.1: Never NULL when status=completed
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
  
  if (error) {
    // Check for duplicate run_id (idempotency)
    if (error.code === '23505') {
      console.log(`[C05] Duplicate run_id ${record.run_id}, checking status...`);
      
      const { data: existing } = await supabase
        .from('pipeline_executions')
        .select('status')
        .eq('run_id', record.run_id)
        .single();
      
      if (existing?.status === 'completed') {
        return { success: false, error: 'ALREADY_COMPLETED' };
      }
      if (existing?.status === 'in_progress') {
        return { success: false, error: 'ALREADY_IN_PROGRESS' };
      }
      if (existing?.status === 'failed') {
        return { success: false, error: 'PREVIOUS_FAILED' };
      }
    }
    
    console.error(`[C05] Insert error:`, error);
    return { success: false, error: error.message };
  }
  
  console.log(`[C05] ✅ Execution record created with normalized_input`);
  return { success: true };
}

/**
 * C05: Atualiza normalized_input após validação
 */
async function c05UpdateNormalizedInput(
  supabase: any,
  runId: string,
  normalizedInput: any
): Promise<void> {
  console.log(`[C05] Updating normalized_input for run_id=${runId}`);
  
  await supabase
    .from('pipeline_executions')
    .update({
      normalized_input: normalizedInput,
      updated_at: new Date().toISOString(),
    })
    .eq('run_id', runId);
}

/**
 * C05: Atualiza dry_run_result e marca como completed (dry-run)
 */
async function c05CompleteDryRun(
  supabase: any,
  runId: string,
  dryRunResult: any
): Promise<void> {
  console.log(`[C05] Completing dry-run for run_id=${runId}`);
  
  await supabase
    .from('pipeline_executions')
    .update({
      dry_run_result: dryRunResult,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('run_id', runId);
}

/**
 * C05.3: Canonical JSON stringify - keys sorted alphabetically for deterministic hashing
 * This ensures hash computed in Edge Function matches hash computed in PostgreSQL
 * 
 * CRITICAL: PostgreSQL JSONB removes keys with NULL values when storing.
 * Therefore, we MUST exclude keys with null/undefined values to match PostgreSQL behavior.
 * 
 * Example:
 *   JS input:  {"a": 1, "b": null, "c": 3}
 *   PostgreSQL stores: {"a": 1, "c": 3}  (b removed)
 *   This function outputs: {"a":1,"c":3}  (matches PostgreSQL)
 */
/**
 * C05.3: Serialização canônica para hash - DEVE espelhar PostgreSQL canonical_jsonb_string()
 * 
 * REGRAS CRÍTICAS PARA PARIDADE JSONB:
 * 1. Ordenar chaves alfabeticamente em TODOS os níveis (recursivo)
 * 2. Não incluir chaves com valores null/undefined (JSONB não armazena)
 * 3. Números: usar toString() para evitar diferenças de precisão (1.0 vs 1)
 * 4. Strings: usar JSON.stringify para escape correto de caracteres especiais
 * 5. Booleanos: true/false literais
 * 
 * NOTA: JSONB no PostgreSQL normaliza números (1.0 → 1), então fazemos o mesmo
 */
function canonicalStringify(obj: any): string {
  // Null ou undefined → 'null' (JSONB retorna 'null' para SQL NULL ou json null)
  if (obj === null || obj === undefined) return 'null';
  
  // Booleanos → 'true' ou 'false' (igual ao PostgreSQL)
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  
  // Números → Converter para string da mesma forma que PostgreSQL JSONB
  // JSONB normaliza números: 1.0 vira 1, mas 1.5 continua 1.5
  // JSON.stringify faz o mesmo em JavaScript
  if (typeof obj === 'number') {
    // Verificar se é NaN ou Infinity (não são válidos em JSON)
    if (!Number.isFinite(obj)) return 'null';
    // Usar a representação padrão do JavaScript (igual ao PostgreSQL JSONB)
    return JSON.stringify(obj);
  }
  
  // Strings → JSON.stringify para escape correto de aspas, barras, etc.
  if (typeof obj === 'string') return JSON.stringify(obj);
  
  // Arrays → Recursivamente serializar cada elemento
  if (Array.isArray(obj)) {
    const parts = obj.map(item => canonicalStringify(item));
    return '[' + parts.join(',') + ']';
  }
  
  // Objetos → Ordenar chaves alfabeticamente e filtrar nulls
  // C05.3: CRÍTICO - ordenar TODAS as chaves, filtrar null/undefined
  const sortedKeys = Object.keys(obj).sort();
  const pairs: string[] = [];
  
  for (const key of sortedKeys) {
    const value = obj[key];
    
    // JSONB não armazena chaves com valor null ou undefined
    // Isso é CRÍTICO para paridade - se incluirmos, o hash vai divergir
    if (value === null || value === undefined) {
      continue;
    }
    
    // Chave é sempre string, usar JSON.stringify para escape
    pairs.push(JSON.stringify(key) + ':' + canonicalStringify(value));
  }
  
  return '{' + pairs.join(',') + '}';
}

/**
 * C05.3: Marca execução como completed com hash do output
 * 
 * CRITICAL INVARIANT: Hash é calculado a partir de output_data.content APÓS
 * construir o output_data completo. Isso garante paridade absoluta com:
 *   PostgreSQL: digest(convert_to(canonical_jsonb_string(output_data->'content'),'utf8'),'sha256')
 * 
 * ALGORITMO:
 * 1. Construir output_data = { content, lesson_id, meta } 
 * 2. Calcular hash = SHA-256(canonicalStringify(output_data.content))
 * 3. Persistir output_data + hash
 * 
 * A função canonicalStringify replica exatamente canonical_jsonb_string() do PostgreSQL:
 * - Ordena chaves alfabeticamente em TODOS os níveis
 * - Não adiciona espaços entre elementos
 * - Serializa arrays e valores primitivos de forma idêntica ao JSON.stringify
 */
async function c05CompleteExecution(
  supabase: any,
  runId: string,
  lessonId: string,
  outputContent: any,
  meta?: { 
    phasesCount?: number; 
    anchorsCount?: number; 
    audioDuration?: number;
    triggerContract?: string;
    hashAlgorithm?: string;
    hashComputedAfterGuards?: boolean;
    // ✅ ISOLAMENTO: Force test tracking
    forceTestBatchId?: string;
    forceTestRunTag?: string;
    // ✅ C15: Image Lab Bridge traceability
    imageLabBridge?: {
      bridgeCalled: boolean;
      scenesSubmitted: number;
      scenesResolved: number;
      scenesDegraded: number;
      scenesFailedSanitization: number;
      errors: string[];
      bridgeHttpStatus?: number;
    };
  }
): Promise<void> {
  console.log(`[C05.3] Completing execution for run_id=${runId}, lesson_id=${lessonId}`);
  
  // =========================================================================
  // IMPORT FROM CONTRACTS.TS — Single Source of Truth (no duplication)
  // =========================================================================
  const { CONTRACT_VERSION: CV, ACTIVE_CONTRACTS_LIST: AC } = await import('./contracts.ts');
  const { enforceContractMeta, enforceBoundaryInvariants } = await import('./contracts.ts');
  const CONTRACT_VERSION = CV;
  const ACTIVE_CONTRACTS = AC;
  
  // C05.3 STEP 1: Construir output_data
  const outputData = {
    content: outputContent,
    lesson_id: lessonId,
    meta: {
      phasesCount: meta?.phasesCount ?? outputContent?.phases?.length ?? 0,
      anchorsCount: meta?.anchorsCount ?? outputContent?.phases?.reduce((acc: number, p: any) => 
        acc + (p.anchorActions?.length ?? 0), 0) ?? 0,
      audioDuration: meta?.audioDuration ?? outputContent?.audio?.mainAudio?.duration ?? 
                     outputContent?.metadata?.totalDuration ?? 0,
      triggerContract: meta?.triggerContract ?? outputContent?.metadata?.triggerContract ?? 'anchorActions',
      hashAlgorithm: 'canonical_jsonb_string+sha256',
      hashComputedAfterGuards: true,
      hashComputedViaSqlRpc: true,
      contractVersion: CONTRACT_VERSION,
      contracts: ACTIVE_CONTRACTS,
      deprecatedContracts: [
        { id: 'C07', deprecated_by: 'C10', rationale: 'Deterministic pauseAt replaces heuristic c07OriginalTime' },
        { id: 'C09', deprecated_by: 'C10', rationale: 'Explicit pauseAt keyword replaces implicit last-word detection' },
      ],
      knownGaps: [
        { id: 'C03', rationale: 'scenes[] empty, Renderer uses visual fallback. Deferred to future version.' },
      ],
      ...(meta?.forceTestBatchId ? { forceTestBatchId: meta.forceTestBatchId } : {}),
      ...(meta?.forceTestRunTag ? { forceTestRunTag: meta.forceTestRunTag } : {}),
      // ✅ C15: Image Lab Bridge traceability
      ...(meta?.imageLabBridge ? { imageLabBridge: meta.imageLabBridge } : {}),
    }
  };
  
  // =========================================================================
  // ENFORCEMENT HARD: Use imported functions from contracts.ts (SSoT)
  // =========================================================================
  const metaCheck = enforceContractMeta(outputData.meta);
  if (!metaCheck.pass) {
    throw new Error(JSON.stringify({
      error_code: metaCheck.error_code,
      error_message: metaCheck.violations.join('; '),
      error_details: { violations: metaCheck.violations },
    }));
  }
  
  const phases = outputContent?.phases || [];
  const boundaryCheck = enforceBoundaryInvariants(phases);
  if (!boundaryCheck.pass) {
    throw new Error(JSON.stringify({
      error_code: boundaryCheck.error_code,
      error_message: boundaryCheck.violations.join('; '),
      error_details: { violations: boundaryCheck.violations },
    }));
  }
  console.log(`[ENFORCEMENT] ✅ All contract meta and boundary invariants validated (via contracts.ts SSoT)`);
  
  // C05.3 STEP 2: Persistir output_data (sem hash ainda)
  console.log(`[C05.3] Persisting output_data...`);
  
  const { error: persistError } = await supabase
    .from('pipeline_executions')
    .update({
      lesson_id: lessonId,
      output_data: outputData,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('run_id', runId);
  
  if (persistError) {
    console.error(`[C05.3] ERROR persisting output_data:`, persistError.message);
    throw new Error(`C05.3: Failed to persist output_data: ${persistError.message}`);
  }
  
  // C05.3 STEP 3: Calcular hash via RPC no PostgreSQL
  // Isso garante paridade ABSOLUTA porque o hash é calculado no mesmo ambiente que a verificação
  console.log(`[C05.3] Computing hash via SQL RPC (c05_compute_content_hash)...`);
  
  const { data: hashResult, error: rpcError } = await supabase
    .rpc('c05_compute_content_hash', { p_run_id: runId });
  
  if (rpcError) {
    console.error(`[C05.3] ERROR computing hash via RPC:`, rpcError.message);
    // Fallback: calcular no JavaScript (pode divergir, mas melhor que nada)
    console.warn(`[C05.3] FALLBACK: Computing hash in JavaScript...`);
    const fallbackHash = await computeSHA256(canonicalStringify(outputContent));
    await supabase
      .from('pipeline_executions')
      .update({ output_content_hash: fallbackHash })
      .eq('run_id', runId);
    console.log(`[C05.3] FALLBACK hash: ${fallbackHash}`);
    return;
  }
  
  const outputHash = hashResult as string;
  
  console.log(`[C05.3] ✅ Execution completed with SQL-computed hash.`);
  console.log(`[C05.3]   phases: ${outputData.meta.phasesCount}`);
  console.log(`[C05.3]   anchors: ${outputData.meta.anchorsCount}`);
  console.log(`[C05.3]   triggerContract: ${outputData.meta.triggerContract}`);
  console.log(`[C05.3]   hash: ${outputHash}`);
}

/**
 * C05: Marca execução como failed
 * C05.1: Garante normalized_input não NULL no fallback insert
 */
async function c05FailExecution(
  supabase: any,
  runId: string,
  errorMessage: string,
  inputData?: any
): Promise<void> {
  console.log(`[C05] Marking execution as failed: run_id=${runId}`);
  
  // Try UPDATE first
  const { error: updateError } = await supabase
    .from('pipeline_executions')
    .update({
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('run_id', runId);
  
  // If UPDATE failed (no record exists), do INSERT fallback
  if (updateError && inputData) {
    console.log(`[C05] Update failed, inserting fallback record`);
    
    await supabase
      .from('pipeline_executions')
      .upsert({
        id: runId,
        run_id: runId,
        pipeline_version: PIPELINE_VERSION,
        commit_hash: COMMIT_HASH,
        mode: inputData.reprocess ? 'reprocess' : (inputData.dry_run ? 'dry_run' : 'create'),
        lesson_title: inputData.title || 'unknown',
        model: 'v7-vv',
        input_data: inputData,
        normalized_input: inputData, // C05.1: Never NULL
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'run_id' });
  }
}

/**
 * C05: Gera run_id se não fornecido no input
 */
function c05GetOrGenerateRunId(input: any): string {
  if (input.run_id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(input.run_id)) {
      throw new Error('run_id must be a valid UUID');
    }
    return input.run_id;
  }
  // Generate new UUID
  return crypto.randomUUID();
}

// ============================================================================
// TIPOS - Importados conceitualmente do V7Contract.ts
// (Deno não suporta import direto do frontend)
// ============================================================================

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface AudioSegment {
  id: string;
  url: string;
  duration: number;
  wordTimestamps: WordTimestamp[];
}

interface MicroVisual {
  id: string;
  type: string;
  anchorText: string;
  triggerTime: number;
  duration: number;
  content: Record<string, unknown>;
}

interface AnchorAction {
  id: string;
  keyword: string;
  keywordTime: number;
  type: 'pause' | 'show' | 'highlight' | 'trigger';
  targetId?: string;
  payload?: Record<string, unknown>;
}

interface QuizFeedback {
  title: string;
  subtitle: string;
  mood: string;
  audioId?: string;
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: QuizFeedback;
}

interface Phase {
  id: string;
  title: string;
  type: string;
  startTime: number;
  endTime: number;
  visual: {
    type: string;
    content: Record<string, unknown>;
    // ✅ FASE C: storagePath e displayMode explícitos para visual.type='image'
    storagePath?: string;
    displayMode?: string;
    frames?: Array<{
      frameId: string;
      durationMs: number;
      storagePath?: string;
      promptScene?: string;
    }>;
  };
  effects?: Record<string, unknown>;
  microVisuals?: MicroVisual[];
  anchorActions?: AnchorAction[];
  interaction?: Record<string, unknown>;
  audioBehavior?: {
    onStart: 'pause' | 'fadeToBackground' | 'continue' | 'switch';
    onComplete: 'resume' | 'next' | 'none';
    duringInteraction: {
      mainVolume: number;
      ambientVolume: number;
      contextualLoops?: Array<{
        id: string;
        url?: string;
        type: string;
        volume: number;
        loop: boolean;
      }>;
    };
  };
}

interface LessonData {
  // ✅ FASE 2 FIX: Estrutura compatível com OUTPUT funcional
  schema: string;                    // Bug 7: era "model"
  version: string;                   // Bug 8: será "1.0.0"
  title: string;                     // Bug 9: title no root
  subtitle: string;                  // Bug 9: subtitle no root
  difficulty: string;
  category: string;
  tags: string[];
  learningObjectives: string[];
  estimatedDuration: number;
  metadata: {
    version: string;                 // Bug 10: metadata.version
    phaseCount: number;
    totalDuration: number;
    hasInteractivePhases: boolean;   // Bug 11: flags
    hasPlayground: boolean;          // Bug 11: flags
    hasPostLessonExercises: boolean; // Bug 11: flags
    triggerContract?: 'anchorActions'; // C06: Single Trigger Contract
  };
  phases: Phase[];
  audio: {
    mainAudio: AudioSegment;
    // ✅ FASE 4 FIX: feedbackAudios como OBJECT (Frontend acessa por key)
    feedbackAudios?: FeedbackAudiosObject;
  };
  // ✅ FASE 1 FIX: Campos passados direto do INPUT
  postLessonExercises?: any[];
  postLessonFlow?: Record<string, unknown>;
  gamification?: Record<string, unknown>;
}

// ✅ FASE 2 FIX: Interface para feedbackAudios como array
interface FeedbackAudioItem {
  id: string;
  url: string;
  wordTimestamps: WordTimestamp[];
  trigger: string;
  duration?: number;
}

// ✅ FASE 4 FIX: feedbackAudios como OBJECT para Frontend
// O Frontend acessa como: feedbackAudios?.[feedbackAudioKey]
// Então precisamos converter de array para objeto indexado por ID
interface FeedbackAudiosObject {
  [key: string]: {
    id: string;
    url: string;
    duration: number;
    wordTimestamps: WordTimestamp[];
    trigger: string;
  };
}

// ============================================================================
// TIPOS DE INPUT (Roteiro)
// ============================================================================

interface ScriptInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  voice_id?: string;
  generate_audio?: boolean;
  fail_on_audio_error?: boolean;
  scenes: ScriptScene[];
  // ✅ FASE 1 FIX: Campos que passam direto para OUTPUT
  postLessonExercises?: any[];
  postLessonFlow?: Record<string, unknown>;
  gamification?: Record<string, unknown>;
  // ✅ DRY-RUN MODE: Validação real sem gerar áudio
  dry_run?: boolean;
  // ✅ C01: REPROCESS MODE - Usar áudio existente
  reprocess?: boolean;
  existing_audio_url?: string;
  existing_word_timestamps?: WordTimestamp[];
  existing_lesson_id?: string;
}

interface ScriptScene {
  id: string;
  title: string;
  type: string;
  narration: string;
  anchorText?: {
    pauseAt?: string;
    transitionAt?: string;
  };
  anchorActions?: Array<{
    id: string;
    keyword: string;
    type: string;
    targetId?: string;
    payload?: Record<string, unknown>;
  }>;
  visual: {
    type: string;
    content: Record<string, unknown>;
    // ✅ FASE C: Campos explícitos para visual.type='image' e 'image-sequence'
    storagePath?: string;
    promptScene?: string;
    instruction?: string;
    displayMode?: string;
    presetKey?: string;
    presetVersion?: string;
    frames?: Array<{
      id?: string;
      durationMs: number;
      storagePath?: string;
      promptScene?: string;
    }>;
    effects?: Record<string, unknown>;
    microVisuals?: Array<{
      id: string;
      type: string;
      anchorText: string;
      content: Record<string, unknown>;
    }>;
  };
  interaction?: {
    type: string;
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
    [key: string]: unknown;
  };
}

// ============================================================================
// VALIDAÇÃO ROBUSTA - V7-vv Pipeline v1.0.0
// ============================================================================

interface ValidationError {
  scene: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// DRY-RUN TYPES - Resultado da validação pré-pipeline
// ============================================================================

interface DryRunIssue {
  severity: 'error' | 'warning' | 'info';
  scene: string;
  field: string;
  message: string;
  suggestion?: string;
}

interface DryRunAutoFix {
  scene: string;
  action: string;
  field: string;
  value: string;
}

interface DryRunSceneAnalysis {
  id: string;
  type: string;
  wordCount: number;
  estimatedDuration: number;
  hasInteraction: boolean;
  hasMicroVisuals: boolean;
  microVisualCount: number;
  hasPauseAt: boolean;
  pauseAtGenerated: boolean;
}

interface DryRunResult {
  canProcess: boolean;
  validationScore: number;
  issues: DryRunIssue[];
  autoFixes: DryRunAutoFix[];
  sceneAnalysis: DryRunSceneAnalysis[];
  summary: {
    totalScenes: number;
    totalWords: number;
    estimatedDuration: number;
    interactiveScenes: number;
    microVisualCount: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  recommendation: string;
}

// ============================================================================
// TIPOS DE MICROVISUAL — CONTRATO CONGELADO v1.0
// ============================================================================
// INPUT: aceita modernos + legados
// OUTPUT: SEMPRE legado (banco/renderer são canônicos)
const VALID_MICROVISUAL_TYPES = [
  // Modernos (aliases - serão convertidos antes de salvar)
  'text', 'number', 'image', 'badge', 'highlight', 'letter-reveal',
  // Legados (canônicos - passam direto)
  'image-flash', 'text-pop', 'number-count', 'text-highlight', 'card-reveal'
] as const;

// Mapping OBRIGATÓRIO: moderno → legado (nunca persistir moderno)
const MODERN_TO_LEGACY_MAP: Record<string, string> = {
  'image': 'image-flash',
  'text': 'text-pop',
  'number': 'number-count',
  'badge': 'card-reveal',
  // Passthrough (já são canônicos)
  'highlight': 'highlight',
  'letter-reveal': 'letter-reveal',
  'image-flash': 'image-flash',
  'text-pop': 'text-pop',
  'number-count': 'number-count',
  'text-highlight': 'text-highlight',
  'card-reveal': 'card-reveal'
};

// Tipos REJEITADOS (sem equivalente no renderer)
const INVALID_MICROVISUAL_TYPES_MAP: Record<string, string> = {
  'icon': 'Tipo "icon" não é suportado. Use "image" (imageUrl/emoji) ou "badge" (text/icon).'
};

// Warnings para legados no input (UX - não bloqueia)
const LEGACY_TYPE_WARNINGS: Record<string, string> = {
  'image-flash': 'Prefira usar "image" no input',
  'text-pop': 'Prefira usar "text" no input',
  'number-count': 'Prefira usar "number" no input',
  'card-reveal': 'Prefira usar "badge" no input',
  'text-highlight': 'Prefira usar "highlight" no input'
};

// ============================================================================
// TIPOS DE VISUAL — CONTRATO CONGELADO v1.0
// ============================================================================
const VALID_VISUAL_TYPES = [
  'number-reveal', 'text-reveal', 'split-screen', 'letter-reveal',
  'cards-reveal', 'quiz', 'quiz-feedback', 'playground', 'result', 'cta',
  '3d-dual-monitors', '3d-abstract', '3d-number-reveal', 'image-sequence',
  'effects-only', 'image'
] as const;

// Schema mínimo por visual.type
const VISUAL_CONTENT_SCHEMA: Record<string, { required: string[], optional: string[] }> = {
  'number-reveal': { required: ['number'], optional: ['secondaryNumber', 'subtitle', 'hookQuestion', 'mood', 'countUp'] },
  'text-reveal': { required: [], optional: ['title', 'mainText', 'items', 'highlightWord'] },
  'split-screen': { required: ['left', 'right'], optional: [] },
  'letter-reveal': { required: ['letters'], optional: ['word', 'finalStamp'] },
  'cards-reveal': { required: ['cards'], optional: ['title'] },
  'quiz': { required: [], optional: ['question', 'subtitle'] },
  'quiz-feedback': { required: [], optional: ['title', 'subtitle'] },
  'playground': { required: [], optional: ['title', 'subtitle'] },
  'result': { required: ['title'], optional: ['emoji', 'message', 'metrics'] },
  'cta': { required: ['buttonText'], optional: ['title', 'subtitle'] },
  '3d-dual-monitors': { required: ['leftScreen', 'rightScreen'], optional: [] },
  '3d-abstract': { required: [], optional: ['variant', 'intensity'] },
  '3d-number-reveal': { required: ['number'], optional: ['subtitle'] },
  'effects-only': { required: [], optional: ['instruction', 'effects', 'microVisuals'] },
  'image': { required: [], optional: ['storagePath', 'promptScene', 'instruction', 'effects', 'microVisuals'] },
  'image-sequence': { required: [], optional: ['frames', 'displayMode', 'presetKey', 'presetVersion', 'instruction', 'effects', 'microVisuals'] }
};

// ============================================================================
// MAPEAMENTO scene.type → phase.type PERSISTIDO — CONTRATO CONGELADO v1.0
// ============================================================================
// secret-reveal e gamification NÃO existem no banco — mapear para tipos válidos
const SCENE_TO_PHASE_MAP: Record<string, string> = {
  'secret-reveal': 'revelation',  // Semanticamente similar
  'gamification': 'narrative',    // Resultado é narrativo
};

// ============================================================================
// CENAS INTERATIVAS (ÚNICA DEFINIÇÃO - NUNCA DUPLICAR)
// ============================================================================
// Somente cenas que ESPERAM INPUT do usuário geram:
// - Auto pauseAt
// - Duração mínima de 5s
// - audioBehavior: { onStart: 'pause', onComplete: 'resume' }
const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground', 'secret-reveal'] as const;

// ============================================================================
// AUDIO BEHAVIOR BUILDER (P2 FIX — duringInteraction completo)
// ============================================================================
// Gera audioBehavior completo baseado no tipo de interação da cena.
// Alinhado com os defaults do renderer (useV7AudioManager.ts).
// ============================================================================

function buildAudioBehavior(scene: SceneInput): Phase['audioBehavior'] {
  const interactionType = scene.interaction?.type;

  // Quiz: pausa total, ambiente baixo para foco
  if (interactionType === 'quiz') {
    return {
      onStart: 'pause',
      onComplete: 'resume',
      duringInteraction: {
        mainVolume: 0,
        ambientVolume: 0.3,
        contextualLoops: [{
          id: `quiz-ambient-${scene.id}`,
          type: 'thinking-ambient',
          volume: 0.15,
          loop: true,
        }],
      },
    };
  }

  // Playground: silêncio total para digitação
  if (interactionType === 'playground') {
    return {
      onStart: 'pause',
      onComplete: 'resume',
      duringInteraction: {
        mainVolume: 0,
        ambientVolume: 0,
      },
    };
  }

  // Checkboxes: fade rápido, interação curta
  if (interactionType === 'checkboxes') {
    return {
      onStart: 'fadeToBackground',
      onComplete: 'resume',
      duringInteraction: {
        mainVolume: 0.2,
        ambientVolume: 0.3,
      },
    };
  }

  // CTA / Button: continua narração, sem pausa
  if (interactionType === 'button' || scene.type === 'secret-reveal') {
    return {
      onStart: 'fadeToBackground',
      onComplete: 'resume',
      duringInteraction: {
        mainVolume: 0.3,
        ambientVolume: 0.4,
      },
    };
  }

  // Default para qualquer interação não mapeada: pausa segura
  return {
    onStart: 'pause',
    onComplete: 'resume',
    duringInteraction: {
      mainVolume: 0,
      ambientVolume: 0.2,
    },
  };
}

function validateInput(input: ScriptInput): ValidationError[] {
  const errors: ValidationError[] = [];
  const allMicroVisualIds = new Set<string>();
  const allAnchorTexts = new Map<string, string>(); // anchorText -> sceneId

  console.log('[V7-vv:Validate] ========================================');
  console.log('[V7-vv:Validate] VALIDAÇÃO ROBUSTA - Iniciando...');
  console.log('[V7-vv:Validate] ========================================');

  // =========================================================================
  // 1. VALIDAÇÃO DE ESTRUTURA RAIZ
  // =========================================================================
  if (!input.title?.trim()) {
    errors.push({ 
      scene: 'root', 
      field: 'title', 
      message: 'Título é obrigatório',
      severity: 'error'
    });
  }

  if (!input.scenes || input.scenes.length === 0) {
    errors.push({ 
      scene: 'root', 
      field: 'scenes', 
      message: 'Pelo menos uma cena é obrigatória',
      severity: 'error'
    });
    return errors;
  }

  // =========================================================================
  // 2. VALIDAÇÃO DE CADA CENA
  // =========================================================================
  input.scenes.forEach((scene, index) => {
    const sceneId = scene.id || `scene-${index + 1}`;

    // ============================================================================
    // 2.0 REJEITAR scene.type='cta' (É visual.type, NÃO scene.type)
    // CONTRATO CONGELADO v1.0
    // ============================================================================
    if (scene.type === 'cta') {
      errors.push({
        scene: sceneId,
        field: 'type',
        message: '"cta" é visual.type, não scene.type. Use scene.type="narrative" com visual.type="cta".',
        severity: 'error'
      });
    }

    // 2.1 Narração obrigatória
    if (!scene.narration?.trim()) {
      errors.push({
        scene: sceneId,
        field: 'narration',
        message: `Cena "${sceneId}" não tem narração.`,
        severity: 'error'
      });
    }

    // 2.2 Visual obrigatório
    if (!scene.visual) {
      errors.push({
        scene: sceneId,
        field: 'visual',
        message: `Cena "${sceneId}" não tem configuração visual.`,
        severity: 'error'
      });
    }

    // =========================================================================
    // 2.2b VALIDAÇÃO PROFUNDA DE visual.content — CONTRATO CONGELADO v1.0
    // =========================================================================
    if (scene.visual?.type) {
      const vType = scene.visual.type;
      const content = scene.visual.content as Record<string, any> | undefined;

      // PASSO 1: visual.type válido
      if (!VALID_VISUAL_TYPES.includes(vType as any)) {
        errors.push({
          scene: sceneId,
          field: 'visual.type',
          message: `visual.type "${vType}" inválido. Tipos válidos: ${VALID_VISUAL_TYPES.join(', ')}`,
          severity: 'error'
        });
      } else {
        // PASSO 2: content obrigatório se schema.required.length > 0
        const schema = VISUAL_CONTENT_SCHEMA[vType];
        if (schema?.required?.length) {
          if (!content || typeof content !== 'object') {
            errors.push({
              scene: sceneId,
              field: 'visual.content',
              message: `visual.type "${vType}" requer "content" definido`,
              severity: 'error'
            });
          } else {
            // PASSO 3: validar cada campo required
            for (const field of schema.required) {
              if (!(field in content) || content[field] === undefined || content[field] === null) {
                errors.push({
                  scene: sceneId,
                  field: `visual.content.${field}`,
                  message: `visual.type "${vType}" requer campo "${field}" em content`,
                  severity: 'error'
                });
              }
            }
          }
        }

        // PASSO 4: validação profunda por tipo
        // text-reveal: SEMPRE requer title OU mainText (mesmo que content não exista)
        if (vType === 'text-reveal') {
          if (!content || (!content.title && !content.mainText)) {
            errors.push({
              scene: sceneId,
              field: 'visual.content',
              message: 'visual.type "text-reveal" requer "title" OU "mainText" em content',
              severity: 'error'
            });
          }
        }

        if (content) {

          // split-screen: estrutura completa
          if (vType === 'split-screen') {
            if (!content.left || typeof content.left !== 'object') {
              errors.push({ scene: sceneId, field: 'visual.content.left', message: '"split-screen" requer objeto "left"', severity: 'error' });
            } else {
              if (!content.left.label) errors.push({ scene: sceneId, field: 'visual.content.left.label', message: '"split-screen" requer "left.label"', severity: 'error' });
              if (!Array.isArray(content.left.items) || content.left.items.length === 0) errors.push({ scene: sceneId, field: 'visual.content.left.items', message: '"split-screen" requer "left.items[]" não vazio', severity: 'error' });
            }
            if (!content.right || typeof content.right !== 'object') {
              errors.push({ scene: sceneId, field: 'visual.content.right', message: '"split-screen" requer objeto "right"', severity: 'error' });
            } else {
              if (!content.right.label) errors.push({ scene: sceneId, field: 'visual.content.right.label', message: '"split-screen" requer "right.label"', severity: 'error' });
              if (!Array.isArray(content.right.items) || content.right.items.length === 0) errors.push({ scene: sceneId, field: 'visual.content.right.items', message: '"split-screen" requer "right.items[]" não vazio', severity: 'error' });
            }
          }

          // cards-reveal: cards[] com id e text
          if (vType === 'cards-reveal') {
            const cards = content.cards;
            if (!Array.isArray(cards) || cards.length === 0) {
              errors.push({ scene: sceneId, field: 'visual.content.cards', message: '"cards-reveal" requer "cards[]" não vazio', severity: 'error' });
            } else {
              cards.forEach((card: any, i: number) => {
                if (!card?.id) errors.push({ scene: sceneId, field: `visual.content.cards[${i}].id`, message: 'card.id é obrigatório', severity: 'error' });
                if (!card?.text) errors.push({ scene: sceneId, field: `visual.content.cards[${i}].text`, message: 'card.text é obrigatório', severity: 'error' });
              });
            }
          }

          // letter-reveal: letters[] com letter e meaning
          if (vType === 'letter-reveal') {
            const letters = content.letters;
            if (!Array.isArray(letters) || letters.length === 0) {
              errors.push({ scene: sceneId, field: 'visual.content.letters', message: '"letter-reveal" requer "letters[]" não vazio', severity: 'error' });
            } else {
              letters.forEach((item: any, i: number) => {
                if (!item?.letter) errors.push({ scene: sceneId, field: `visual.content.letters[${i}].letter`, message: 'letters[].letter é obrigatório', severity: 'error' });
                if (!item?.meaning) errors.push({ scene: sceneId, field: `visual.content.letters[${i}].meaning`, message: 'letters[].meaning é obrigatório', severity: 'error' });
              });
            }
          }

          // cta: buttonText string não vazia
          if (vType === 'cta') {
            if (!content.buttonText || typeof content.buttonText !== 'string' || !content.buttonText.trim()) {
              errors.push({ scene: sceneId, field: 'visual.content.buttonText', message: '"cta" requer "buttonText" string não vazia', severity: 'error' });
            }
          }

          // 3d-dual-monitors: leftScreen e rightScreen
          if (vType === '3d-dual-monitors') {
            if (!content.leftScreen) errors.push({ scene: sceneId, field: 'visual.content.leftScreen', message: '"3d-dual-monitors" requer "leftScreen"', severity: 'error' });
            if (!content.rightScreen) errors.push({ scene: sceneId, field: 'visual.content.rightScreen', message: '"3d-dual-monitors" requer "rightScreen"', severity: 'error' });
          }
        }
      }
    }

    // 2.3 Validar microVisuals
    if (scene.visual?.microVisuals) {
      scene.visual.microVisuals.forEach((mv, mvIndex) => {
        const mvId = mv.id || `mv-${sceneId}-${mvIndex}`;

        // 2.3.1 Validar tipo de microVisual
        if (!VALID_MICROVISUAL_TYPES.includes(mv.type as any)) {
          const suggestion = INVALID_MICROVISUAL_TYPES_MAP[mv.type];
          errors.push({
            scene: sceneId,
            field: `microVisuals[${mvIndex}].type`,
            message: `MicroVisual "${mvId}" tem tipo inválido "${mv.type}". ${suggestion ? `Use "${suggestion}" em vez disso.` : `Tipos válidos: ${VALID_MICROVISUAL_TYPES.join(', ')}`}`,
            severity: 'error'
          });
        }

        // 2.3.2 Validar ID único
        if (allMicroVisualIds.has(mvId)) {
          errors.push({
            scene: sceneId,
            field: `microVisuals[${mvIndex}].id`,
            message: `MicroVisual ID "${mvId}" está duplicado. IDs devem ser únicos.`,
            severity: 'error'
          });
        }
        allMicroVisualIds.add(mvId);

        // 2.3.3 Validar anchorText existe na narração
        if (mv.anchorText && scene.narration) {
          const normalizedAnchor = mv.anchorText.toLowerCase();
          const normalizedNarration = scene.narration.toLowerCase();
          
          if (!normalizedNarration.includes(normalizedAnchor)) {
            errors.push({
              scene: sceneId,
              field: `microVisuals[${mvIndex}].anchorText`,
              message: `MicroVisual "${mvId}": anchorText "${mv.anchorText}" NÃO existe na narração desta cena. A narração DEVE conter a palavra-chave.`,
              severity: 'error'
            });
          }
        }

        // 2.3.4 Verificar anchorText duplicado
        if (mv.anchorText) {
          const existingScene = allAnchorTexts.get(mv.anchorText.toLowerCase());
          if (existingScene && existingScene !== sceneId) {
            errors.push({
              scene: sceneId,
              field: `microVisuals[${mvIndex}].anchorText`,
              message: `AnchorText "${mv.anchorText}" já usado em "${existingScene}". Keywords devem ser únicas.`,
              severity: 'warning'
            });
          }
          allAnchorTexts.set(mv.anchorText.toLowerCase(), sceneId);
        }
      });
    }

    // 2.4 Validar Quiz
    if (scene.interaction?.type === 'quiz' && scene.interaction.options) {
      const optionIds = new Set<string>();
      let hasCorrectOption = false;

      scene.interaction.options.forEach((opt, optIndex) => {
        // ID único
        if (optionIds.has(opt.id)) {
          errors.push({
            scene: sceneId,
            field: `interaction.options[${optIndex}].id`,
            message: `Option ID "${opt.id}" está duplicado neste quiz.`,
            severity: 'error'
          });
        }
        optionIds.add(opt.id);

        // Verificar isCorrect
        if (opt.isCorrect) {
          hasCorrectOption = true;
        }
      });

      if (!hasCorrectOption) {
        errors.push({
          scene: sceneId,
          field: 'interaction.options',
          message: `Quiz "${sceneId}" não tem nenhuma opção marcada como correta (isCorrect: true).`,
          severity: 'warning'
        });
      }
    }

    // 2.5 Validar Playground
    if (scene.interaction?.type === 'playground') {
      if (!scene.interaction.amateurPrompt) {
        errors.push({
          scene: sceneId,
          field: 'interaction.amateurPrompt',
          message: `Playground "${sceneId}" não tem amateurPrompt definido.`,
          severity: 'error'
        });
      }
      if (!scene.interaction.professionalPrompt) {
        errors.push({
          scene: sceneId,
          field: 'interaction.professionalPrompt',
          message: `Playground "${sceneId}" não tem professionalPrompt definido.`,
          severity: 'error'
        });
      }
    }

    // 2.6 PREFLIGHT BLOQUEANTE para cenas interativas (PATCH C1)
    const isInteractive = INTERACTIVE_SCENE_TYPES.includes(scene.type as any);
    if (isInteractive) {
      // Regra 1: pauseAt OBRIGATÓRIO em cenas interativas
      if (!scene.anchorText?.pauseAt) {
        errors.push({
          scene: sceneId,
          field: 'anchorText.pauseAt',
          message: `Cena interativa "${sceneId}" DEVE ter anchorText.pauseAt`,
          severity: 'error'
        });
      } else {
        const pauseAt = scene.anchorText.pauseAt.trim();
        const narration = scene.narration?.trim() || '';

        // Regra 2: pauseAt deve existir literalmente na narração
        const normNarr = narration.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normPause = pauseAt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (!normNarr.includes(normPause)) {
          errors.push({
            scene: sceneId,
            field: 'anchorText.pauseAt',
            message: `pauseAt "${pauseAt}" NAO existe na narracao de "${sceneId}"`,
            severity: 'error'
          });
        }

        // Regra 3: pauseAt deve ser EXATAMENTE 1 palavra
        const pauseWords = pauseAt.split(/\s+/);
        if (pauseWords.length > 1) {
          errors.push({
            scene: sceneId,
            field: 'anchorText.pauseAt',
            message: `pauseAt deve ser 1 palavra, recebeu ${pauseWords.length}: "${pauseAt}"`,
            severity: 'error'
          });
        } else {
          // Regra 4: pauseAt deve ser a ÚLTIMA PALAVRA da narração
          const narrWords = narration
            .replace(/[.,!?;:'"()\[\]{}…\-–—]/g, '')
            .trim().split(/\s+/).filter(w => w.length > 0);
          const lastWord = narrWords[narrWords.length - 1] || '';
          const normLast = lastWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (normLast !== normPause) {
            errors.push({
              scene: sceneId,
              field: 'anchorText.pauseAt',
              message: `pauseAt "${pauseAt}" NAO e a ultima palavra da narracao (ultima: "${lastWord}")`,
              severity: 'error'
            });
          }
        }
      }
    }
  });

  // Regra 5: pauseAt NÃO pode ser ambíguo (repetido entre cenas interativas)
  const pauseAtMap: Record<string, string[]> = {};
  input.scenes.forEach((scene, idx) => {
    if (!INTERACTIVE_SCENE_TYPES.includes(scene.type as any)) return;
    const p = scene.anchorText?.pauseAt?.trim();
    if (!p) return;
    const normP = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    pauseAtMap[normP] = pauseAtMap[normP] || [];
    pauseAtMap[normP].push(scene.id || `scene-${idx + 1}`);
  });
  for (const [kw, ids] of Object.entries(pauseAtMap)) {
    if (ids.length > 1) {
      errors.push({
        scene: ids.join(', '),
        field: 'anchorText.pauseAt',
        message: `pauseAt "${kw}" repetido em ${ids.length} cenas interativas: ${ids.join(', ')}`,
        severity: 'error'
      });
    }
  }

  // =========================================================================
  // 3. LOG RESULTADO
  // =========================================================================
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  if (errorCount > 0) {
    console.error(`[V7-vv:Validate] ❌ FALHOU: ${errorCount} erro(s), ${warningCount} aviso(s)`);
    errors.forEach(e => {
      console.error(`[V7-vv:Validate]   [${e.severity.toUpperCase()}] ${e.scene}.${e.field}: ${e.message}`);
    });
  } else if (warningCount > 0) {
    console.warn(`[V7-vv:Validate] ⚠️ PASSOU com ${warningCount} aviso(s)`);
  } else {
    console.log('[V7-vv:Validate] ✅ PASSOU - Nenhum erro encontrado');
  }

  // Retornar apenas erros (warnings são informativos)
  return errors.filter(e => e.severity === 'error');
}

// ============================================================================
// AUTO-GERAÇÃO DE pauseAt PARA FASES INTERATIVAS
// ============================================================================
function autoGeneratePauseAt(scenes: ScriptScene[]): void {
  console.log('[V7-vv:AutoPauseAt] Verificando fases interativas...');

  scenes.forEach((scene, index) => {
    const isInteractive = INTERACTIVE_SCENE_TYPES.includes(scene.type as any);
    
    if (isInteractive && !scene.anchorText?.pauseAt && scene.narration) {
      // Extrair última palavra significativa da narração
      const words = scene.narration
        .replace(/[.,!?;:'"()[\]{}…]+/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);

      if (words.length > 0) {
        const lastWord = words[words.length - 1];
        
        // Garantir que anchorText existe
        if (!scene.anchorText) {
          scene.anchorText = {};
        }
        
        scene.anchorText.pauseAt = lastWord;
        console.log(`[V7-vv:AutoPauseAt] ✅ "${scene.id}": pauseAt gerado automaticamente = "${lastWord}"`);
      } else {
        console.warn(`[V7-vv:AutoPauseAt] ⚠️ "${scene.id}": Não foi possível extrair palavra para pauseAt`);
      }
    }
  });
}

// ============================================================================
// DRY-RUN MODE - Validação Real Sem Geração de Áudio
// ============================================================================

function executeDryRun(input: ScriptInput): DryRunResult {
  console.log('[V7-vv:DryRun] ========================================');
  console.log('[V7-vv:DryRun] MODO DRY-RUN - Validação Real');
  console.log('[V7-vv:DryRun] ========================================');

  const issues: DryRunIssue[] = [];
  const autoFixes: DryRunAutoFix[] = [];
  const sceneAnalysis: DryRunSceneAnalysis[] = [];

  // Guard: se não tem scenes, retornar erro imediato
  if (!input.scenes || !Array.isArray(input.scenes) || input.scenes.length === 0) {
    console.error('[V7-vv:DryRun] ❌ input.scenes está vazio ou undefined');
    return {
      valid: false,
      errorCount: 1,
      warningCount: 0,
      issues: [{
        severity: 'error',
        scene: 'root',
        field: 'scenes',
        message: 'Input não contém "scenes[]". Pelo menos uma cena é obrigatória.',
        suggestion: 'Adicione ao menos uma cena no array "scenes" do JSON de input.'
      }],
      autoFixes: [],
      sceneAnalysis: [],
      estimatedDuration: 0,
      summary: 'Input inválido: scenes[] ausente ou vazio'
    };
  }

  // Taxa de narração: ~150 palavras por minuto (2.5 palavras/segundo)
  const WORDS_PER_SECOND = 2.5;

  let totalWords = 0;
  let totalMicroVisuals = 0;
  let interactiveCount = 0;

  // =========================================================================
  // 1. ANÁLISE DETALHADA DE CADA CENA
  // =========================================================================
  input.scenes.forEach((scene, index) => {
    const sceneId = scene.id || `scene-${index + 1}`;
    
    // ✅ CONTRATO CONGELADO v1.0: Rejeitar scene.type='cta'
    if (scene.type === 'cta') {
      issues.push({
        severity: 'error',
        scene: sceneId,
        field: 'type',
        message: '"cta" é visual.type, não scene.type',
        suggestion: 'Use scene.type="narrative" com visual.type="cta"',
      });
    }
    
    const words = scene.narration?.split(/\s+/).filter(w => w.length > 0) || [];
    const wordCount = words.length;
    totalWords += wordCount;

    // Estimar duração baseado em word count
    let estimatedDuration = wordCount / WORDS_PER_SECOND;

    // Fases interativas têm duração mínima de 5s
    const isInteractive = INTERACTIVE_SCENE_TYPES.includes(scene.type as any);
    if (isInteractive) {
      estimatedDuration = Math.max(estimatedDuration, 5.0);
      interactiveCount++;
    }

    const microVisualCount = scene.visual?.microVisuals?.length || 0;
    totalMicroVisuals += microVisualCount;

    // Verificar se pauseAt será gerado
    const hasPauseAt = !!scene.anchorText?.pauseAt;
    let pauseAtGenerated = false;

    if (isInteractive && !hasPauseAt && scene.narration) {
      // Simular auto-geração
      const pauseWords = scene.narration
        .replace(/[.,!?;:'"()[\]{}…]+/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);

      if (pauseWords.length > 0) {
        const generatedPauseAt = pauseWords[pauseWords.length - 1];
        pauseAtGenerated = true;
        autoFixes.push({
          scene: sceneId,
          action: 'pauseAt será gerado automaticamente',
          field: 'anchorText.pauseAt',
          value: generatedPauseAt,
        });
      } else {
        issues.push({
          severity: 'warning',
          scene: sceneId,
          field: 'anchorText.pauseAt',
          message: 'Não foi possível extrair palavra para auto-gerar pauseAt',
          suggestion: 'Adicione manualmente um pauseAt ou melhore a narração',
        });
      }
    }

    // Validar microVisuals
    if (scene.visual?.microVisuals) {
      scene.visual.microVisuals.forEach((mv, mvIdx) => {
        // Tipo válido?
        if (!VALID_MICROVISUAL_TYPES.includes(mv.type as any)) {
          const suggestion = INVALID_MICROVISUAL_TYPES_MAP[mv.type];
          issues.push({
            severity: 'error',
            scene: sceneId,
            field: `microVisuals[${mvIdx}].type`,
            message: `Tipo inválido "${mv.type}"`,
            suggestion: suggestion || `Tipos válidos: ${VALID_MICROVISUAL_TYPES.join(', ')}`,
          });
        }

        // anchorText existe na narração?
        if (mv.anchorText && scene.narration) {
          const normalizedAnchor = mv.anchorText.toLowerCase();
          const normalizedNarration = scene.narration.toLowerCase();
          
          if (!normalizedNarration.includes(normalizedAnchor)) {
            issues.push({
              severity: 'error',
              scene: sceneId,
              field: `microVisuals[${mvIdx}].anchorText`,
              message: `anchorText "${mv.anchorText}" NÃO existe na narração desta cena`,
              suggestion: 'A narração DEVE conter a palavra-chave. Verifique se está na cena correta.',
            });
          }
        }
      });
    }

    // Validar Quiz
    if (scene.interaction?.type === 'quiz' && scene.interaction.options) {
      const hasCorrect = scene.interaction.options.some((opt: any) => opt.isCorrect);
      if (!hasCorrect) {
        issues.push({
          severity: 'warning',
          scene: sceneId,
          field: 'interaction.options',
          message: 'Nenhuma opção marcada como correta',
          suggestion: 'Adicione isCorrect: true em uma opção',
        });
      }

      // Verificar feedbacks
      scene.interaction.options.forEach((opt: any, optIdx: number) => {
        if (!opt.feedback?.narration && !opt.feedback?.title) {
          issues.push({
            severity: 'info',
            scene: sceneId,
            field: `interaction.options[${optIdx}].feedback`,
            message: `Opção "${opt.id}" sem texto de feedback`,
            suggestion: 'Adicione feedback.narration ou feedback.title para áudio de feedback',
          });
        } else if (!opt.feedback?.narration && opt.feedback?.title) {
          autoFixes.push({
            scene: sceneId,
            action: 'Narração de feedback será gerada automaticamente',
            field: `interaction.options[${optIdx}].feedback.narration`,
            value: opt.feedback.subtitle 
              ? `${opt.feedback.title}. ${opt.feedback.subtitle}`
              : opt.feedback.title,
          });
        }
      });
    }

    // Validar Playground
    if (scene.interaction?.type === 'playground') {
      if (!scene.interaction.amateurPrompt) {
        issues.push({
          severity: 'error',
          scene: sceneId,
          field: 'interaction.amateurPrompt',
          message: 'Playground sem amateurPrompt',
        });
      }
      if (!scene.interaction.professionalPrompt) {
        issues.push({
          severity: 'error',
          scene: sceneId,
          field: 'interaction.professionalPrompt',
          message: 'Playground sem professionalPrompt',
        });
      }
    }

    // =========================================================================
    // VALIDAÇÃO PROFUNDA DE visual.content — CONTRATO CONGELADO v1.0
    // =========================================================================
    if (scene.visual?.type) {
      const vType = scene.visual.type;
      const content = scene.visual.content as Record<string, any> | undefined;

      // PASSO 1: visual.type válido
      if (!VALID_VISUAL_TYPES.includes(vType as any)) {
        issues.push({
          severity: 'error',
          scene: sceneId,
          field: 'visual.type',
          message: `visual.type "${vType}" inválido`,
          suggestion: `Tipos válidos: ${VALID_VISUAL_TYPES.join(', ')}`,
        });
      } else {
        // PASSO 2: content obrigatório se schema.required.length > 0
        const schema = VISUAL_CONTENT_SCHEMA[vType];
        if (schema?.required?.length) {
          if (!content || typeof content !== 'object') {
            issues.push({
              severity: 'error',
              scene: sceneId,
              field: 'visual.content',
              message: `visual.type "${vType}" requer "content" definido`,
            });
          } else {
            // PASSO 3: validar cada campo required
            for (const field of schema.required) {
              if (!(field in content) || content[field] === undefined || content[field] === null) {
                issues.push({
                  severity: 'error',
                  scene: sceneId,
                  field: `visual.content.${field}`,
                  message: `visual.type "${vType}" requer campo "${field}"`,
                });
              }
            }
          }
        }

        // PASSO 4: validação profunda por tipo
        // text-reveal: SEMPRE requer title OU mainText (mesmo que content não exista)
        if (vType === 'text-reveal') {
          if (!content || (!content.title && !content.mainText)) {
            issues.push({
              severity: 'error',
              scene: sceneId,
              field: 'visual.content',
              message: '"text-reveal" requer "title" OU "mainText"',
            });
          }
        }

        if (content) {

          // split-screen: estrutura completa
          if (vType === 'split-screen') {
            if (!content.left || typeof content.left !== 'object') {
              issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.left', message: '"split-screen" requer objeto "left"' });
            } else {
              if (!content.left.label) issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.left.label', message: '"split-screen" requer "left.label"' });
              if (!Array.isArray(content.left.items) || content.left.items.length === 0) issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.left.items', message: '"split-screen" requer "left.items[]" não vazio' });
            }
            if (!content.right || typeof content.right !== 'object') {
              issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.right', message: '"split-screen" requer objeto "right"' });
            } else {
              if (!content.right.label) issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.right.label', message: '"split-screen" requer "right.label"' });
              if (!Array.isArray(content.right.items) || content.right.items.length === 0) issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.right.items', message: '"split-screen" requer "right.items[]" não vazio' });
            }
          }

          // cards-reveal: cards[] com id e text
          if (vType === 'cards-reveal') {
            const cards = content.cards;
            if (!Array.isArray(cards) || cards.length === 0) {
              issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.cards', message: '"cards-reveal" requer "cards[]" não vazio' });
            } else {
              cards.forEach((card: any, i: number) => {
                if (!card?.id) issues.push({ severity: 'error', scene: sceneId, field: `visual.content.cards[${i}].id`, message: 'card.id é obrigatório' });
                if (!card?.text) issues.push({ severity: 'error', scene: sceneId, field: `visual.content.cards[${i}].text`, message: 'card.text é obrigatório' });
              });
            }
          }

          // letter-reveal: letters[] com letter e meaning
          if (vType === 'letter-reveal') {
            const letters = content.letters;
            if (!Array.isArray(letters) || letters.length === 0) {
              issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.letters', message: '"letter-reveal" requer "letters[]" não vazio' });
            } else {
              letters.forEach((item: any, i: number) => {
                if (!item?.letter) issues.push({ severity: 'error', scene: sceneId, field: `visual.content.letters[${i}].letter`, message: 'letters[].letter é obrigatório' });
                if (!item?.meaning) issues.push({ severity: 'error', scene: sceneId, field: `visual.content.letters[${i}].meaning`, message: 'letters[].meaning é obrigatório' });
              });
            }
          }

          // cta: buttonText string não vazia
          if (vType === 'cta') {
            if (!content.buttonText || typeof content.buttonText !== 'string' || !content.buttonText.trim()) {
              issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.buttonText', message: '"cta" requer "buttonText" string não vazia' });
            }
          }

          // 3d-dual-monitors: leftScreen e rightScreen
          if (vType === '3d-dual-monitors') {
            if (!content.leftScreen) issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.leftScreen', message: '"3d-dual-monitors" requer "leftScreen"' });
            if (!content.rightScreen) issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.rightScreen', message: '"3d-dual-monitors" requer "rightScreen"' });
          }

          // C12.1: image-sequence validation
          if (vType === 'image-sequence') {
            if (scene.type !== 'narrative') {
              issues.push({ severity: 'error', scene: sceneId, field: 'visual.type', message: 'image-sequence só é permitido em scene.type="narrative"' });
            }
            const frames = content?.frames;
            if (!Array.isArray(frames) || frames.length === 0) {
              issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.frames', message: 'image-sequence requer frames[] não vazio' });
            } else {
              if (frames.length > 3) {
                issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.frames', message: `image-sequence permite máximo 3 frames (tem ${frames.length})` });
              }
              let totalDur = 0;
              frames.forEach((f: any, fi: number) => {
                if (!f.promptScene?.trim()) issues.push({ severity: 'error', scene: sceneId, field: `visual.content.frames[${fi}].promptScene`, message: 'promptScene obrigatório' });
                if (!f.durationMs || f.durationMs < 1000) issues.push({ severity: 'error', scene: sceneId, field: `visual.content.frames[${fi}].durationMs`, message: `durationMs >= 1000 (tem ${f.durationMs})` });
                totalDur += (f.durationMs || 0);
                // C13 PREP: Optional cameraSpec validation (warning only, tolerant parsing)
                if (f.cameraSpec !== undefined && f.cameraSpec !== null && typeof f.cameraSpec !== 'object') {
                  issues.push({ severity: 'warning', scene: sceneId, field: `visual.content.frames[${fi}].cameraSpec`, message: `cameraSpec deve ser um objeto (recebeu ${typeof f.cameraSpec})` });
                }
              });
              if (totalDur < 2000) issues.push({ severity: 'error', scene: sceneId, field: 'visual.content.frames', message: `Soma durationMs >= 2000 (tem ${totalDur})` });
            }
            // No coexistence with microVisual type="image"
            if (scene.visual?.microVisuals?.some((mv: any) => mv.type === 'image')) {
              issues.push({ severity: 'error', scene: sceneId, field: 'visual.microVisuals', message: 'image-sequence não coexiste com microVisual type="image"' });
            }

            // C12.1 WARNING: image-sequence with 2+ frames but no frame triggers (regresses to timer fallback)
            if (Array.isArray(frames) && frames.length >= 2) {
              const sceneAnchorActions = scene.anchorActions || [];
              const hasFrameTriggers = sceneAnchorActions.some(
                (a: any) => a.type === 'trigger' && typeof a.payload?.frameIndex === 'number'
              );
              if (!hasFrameTriggers) {
                issues.push({
                  severity: 'warning',
                  scene: sceneId,
                  field: 'anchorActions',
                  message: 'image-sequence com 2+ frames sem anchorActions trigger com payload.frameIndex -- usando fallback timer (recomendado: adicionar triggers)'
                });
              }
            }

            // C12.1 WARNING: promptScene with text indicators (text should be overlay via microVisual)
            if (Array.isArray(frames)) {
              for (const frame of frames) {
                const ps = (frame.promptScene || '').toLowerCase();
                const textIndicators = ['"', 'r$', '#', 'copy:', 'texto:', 'escrito'];
                const found = textIndicators.filter((t: string) => ps.includes(t));
                if (found.length > 0) {
                  issues.push({
                    severity: 'warning',
                    scene: sceneId,
                    field: `frames[${frame.id}].promptScene`,
                    message: `promptScene contem indicadores de texto (${found.join(', ')}) -- texto deve ser overlay via microVisual, nao imagem`
                  });
                }
              }
            }
          }
        }
      }
    }

    // Adicionar análise da cena
    sceneAnalysis.push({
      id: sceneId,
      type: scene.type,
      wordCount,
      estimatedDuration: Math.round(estimatedDuration * 10) / 10,
      hasInteraction: !!scene.interaction,
      hasMicroVisuals: microVisualCount > 0,
      microVisualCount,
      hasPauseAt: hasPauseAt || pauseAtGenerated,
      pauseAtGenerated,
    });
  });

  // =========================================================================
  // 2. VALIDAÇÕES GLOBAIS
  // =========================================================================
  
  // Título
  if (!input.title?.trim()) {
    issues.push({
      severity: 'error',
      scene: 'root',
      field: 'title',
      message: 'Título é obrigatório',
    });
  }

  // Mínimo de cenas
  if (input.scenes.length === 0) {
    issues.push({
      severity: 'error',
      scene: 'root',
      field: 'scenes',
      message: 'Pelo menos uma cena é obrigatória',
    });
  }

  // Duração muito curta
  const estimatedTotalDuration = sceneAnalysis.reduce((sum, s) => sum + s.estimatedDuration, 0);
  if (estimatedTotalDuration < 30) {
    issues.push({
      severity: 'warning',
      scene: 'root',
      field: 'duration',
      message: `Duração estimada muito curta: ${estimatedTotalDuration.toFixed(1)}s`,
      suggestion: 'Adicione mais conteúdo para uma experiência melhor (mínimo 30s recomendado)',
    });
  }

  // Duração muito longa
  if (estimatedTotalDuration > 600) {
    issues.push({
      severity: 'warning',
      scene: 'root',
      field: 'duration',
      message: `Duração estimada muito longa: ${(estimatedTotalDuration / 60).toFixed(1)} minutos`,
      suggestion: 'Considere dividir em múltiplas aulas (máximo 10min recomendado)',
    });
  }

  // =========================================================================
  // 3. CALCULAR SCORE E RESULTADO
  // =========================================================================
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  // Score: 100 - (erros * 20) - (warnings * 5) - (infos * 1)
  let validationScore = 100;
  validationScore -= errorCount * 20;
  validationScore -= warningCount * 5;
  validationScore -= infoCount * 1;
  validationScore = Math.max(0, Math.min(100, validationScore));

  // Pode processar apenas se não houver erros
  const canProcess = errorCount === 0;

  // Recomendação
  let recommendation = '';
  if (canProcess && warningCount === 0) {
    recommendation = '✅ JSON aprovado! Pode ser processado pelo Pipeline.';
  } else if (canProcess) {
    recommendation = `⚠️ JSON aprovado com ${warningCount} aviso(s). Revisar antes de processar.`;
  } else {
    recommendation = `❌ JSON reprovado. Corrija ${errorCount} erro(s) antes de processar.`;
  }

  const result: DryRunResult = {
    canProcess,
    validationScore,
    issues,
    autoFixes,
    sceneAnalysis,
    summary: {
      totalScenes: input.scenes.length,
      totalWords,
      estimatedDuration: Math.round(estimatedTotalDuration),
      interactiveScenes: interactiveCount,
      microVisualCount: totalMicroVisuals,
      errorCount,
      warningCount,
      infoCount,
    },
    recommendation,
  };

  console.log('[V7-vv:DryRun] ========================================');
  console.log(`[V7-vv:DryRun] Score: ${validationScore}`);
  console.log(`[V7-vv:DryRun] Pode Processar: ${canProcess}`);
  console.log(`[V7-vv:DryRun] Erros: ${errorCount}, Avisos: ${warningCount}, Info: ${infoCount}`);
  console.log(`[V7-vv:DryRun] AutoFixes: ${autoFixes.length}`);
  console.log('[V7-vv:DryRun] ========================================');

  return result;
}

// ============================================================================
// STEP 3.5: MICRO-VISUAL AUTO-ENRICHMENT
// Detecta padrões de stat (R$, %, mil) e step (Passo N, Etapa N) na narração
// e injeta microVisuals automáticos antes do cálculo de anchors (Step 4).
// NON-BREAKING: qualquer exceção é capturada e o pipeline continua normal.
// ============================================================================

interface EnrichedMicroVisual {
  type: 'stat' | 'step';
  anchorText: string;
  duration: number;
  position?: string;
  content: Record<string, unknown>;
  _autoGenerated: true;
}

function enrichMicroVisualsFromNarration(scenes: any[]): {
  totalInjected: number;
  statCount: number;
  stepCount: number;
} {
  const stats = { totalInjected: 0, statCount: 0, stepCount: 0 };

  // Tipos de cena onde auto-enriquecimento é permitido
  const ALLOWED_TYPES = new Set([
    'narrative', 'dramatic', 'comparison', 'secret-reveal',
    'hook', 'transition', 'resolution', 'revelation'
  ]);

  // Tipos de cena interativos — nunca enriquecer
  const INTERACTIVE_TYPES = new Set(['quiz', 'playground', 'interactive']);

  // Regex para STAT
  const STAT_PATTERNS = [
    // R$ 50.000 / R$ 3k / R$ 1,5 mil
    {
      re: /R\$\s*([\d.,]+\s*(?:mil|M|k)?)/gi,
      extract: (m: RegExpMatchArray) => ({
        value: m[1].trim(),
        prefix: 'R$',
        suffix: '',
        color: 'green',
        anchorWord: m[1].trim().split(/\s/)[0].replace(/[.,]/g, ''),
      }),
    },
    // 98% / 30%
    {
      re: /([\d.,]+)\s*%/gi,
      extract: (m: RegExpMatchArray) => ({
        value: m[1].trim(),
        prefix: '',
        suffix: '%',
        color: 'cyan',
        anchorWord: m[1].trim().replace(/[.,]/g, ''),
      }),
    },
    // 10 mil / 5k / 2M (sem R$ para evitar duplicata)
    {
      re: /([\d.,]+)\s*(mil|reais|k|M)\b/gi,
      extract: (m: RegExpMatchArray) => ({
        value: `${m[1].trim()} ${m[2]}`,
        prefix: '',
        suffix: '',
        color: 'green',
        anchorWord: m[2].toLowerCase() === 'reais' ? m[1].replace(/[.,]/g, '') : m[2],
      }),
    },
  ];

  // Regex para STEP
  const STEP_PATTERNS = [
    // Passo 1, Passo 2...
    {
      re: /Passo\s+(\d+)[:\s,–-]*([^.!?]{0,60})/gi,
      extract: (m: RegExpMatchArray) => ({
        stepNumber: parseInt(m[1]),
        text: m[2].trim().split(/\s+/).slice(0, 6).join(' '),
        anchorWord: 'Passo',
      }),
    },
    // Etapa 1, Etapa 2...
    {
      re: /Etapa\s+(\d+)[:\s,–-]*([^.!?]{0,60})/gi,
      extract: (m: RegExpMatchArray) => ({
        stepNumber: parseInt(m[1]),
        text: m[2].trim().split(/\s+/).slice(0, 6).join(' '),
        anchorWord: 'Etapa',
      }),
    },
    // 1. Defina / 2. Execute (lista numerada)
    {
      re: /(?:^|\n)(\d+)\.\s+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕ][^.!?\n]{0,50})/gm,
      extract: (m: RegExpMatchArray) => ({
        stepNumber: parseInt(m[1]),
        text: m[2].trim().split(/\s+/).slice(0, 6).join(' '),
        anchorWord: m[2].trim().split(/\s+/)[0],
      }),
    },
  ];

  for (const scene of scenes) {
    try {
      // Skip cenas interativas
      const sceneType = scene.type || scene.sceneType || '';
      if (INTERACTIVE_TYPES.has(sceneType)) continue;
      if (scene.interaction?.type && INTERACTIVE_TYPES.has(scene.interaction.type)) continue;

      // Apenas tipos permitidos (se o tipo não for definido, permite por padrão)
      if (sceneType && !ALLOWED_TYPES.has(sceneType)) continue;

      const narration: string = scene.narration || '';
      if (!narration.trim()) continue;

      // Garantir que scene.visual existe
      if (!scene.visual) scene.visual = {};
      if (!scene.visual.microVisuals) scene.visual.microVisuals = [];

      const existingMVs: any[] = scene.visual.microVisuals;

      // Set de anchorTexts já usados (manual ou auto) para evitar duplicatas
      const usedAnchors = new Set(
        existingMVs.map((mv: any) => (mv.anchorText || '').toLowerCase().trim())
      );

      // Dividir narração em sentenças (máx 1 auto-microVisual por sentença)
      const sentences = narration.split(/(?<=[.!?])\s+/);

      const toInject: EnrichedMicroVisual[] = [];

      for (const sentence of sentences) {
        if (!sentence.trim()) continue;

        let sentenceHasVisual = false; // máx 1 por sentença

        // ── STEP patterns (prioridade sobre stat dentro da mesma sentença) ──
        if (!sentenceHasVisual) {
          for (const pattern of STEP_PATTERNS) {
            if (sentenceHasVisual) break;
            const regex = new RegExp(pattern.re.source, pattern.re.flags);
            const match = regex.exec(sentence);
            if (!match) continue;

            const extracted = pattern.extract(match);
            const anchorLower = extracted.anchorWord.toLowerCase();

            if (usedAnchors.has(anchorLower)) continue;

            usedAnchors.add(anchorLower);
            sentenceHasVisual = true;

            toInject.push({
              type: 'step',
              anchorText: extracted.anchorWord,
              duration: 3.5,
              position: 'center',
              content: {
                stepNumber: extracted.stepNumber,
                text: extracted.text,
                color: 'accent',
              },
              _autoGenerated: true,
            });
          }
        }

        // ── STAT patterns ──
        if (!sentenceHasVisual) {
          for (const pattern of STAT_PATTERNS) {
            if (sentenceHasVisual) break;
            const regex = new RegExp(pattern.re.source, pattern.re.flags);
            const match = regex.exec(sentence);
            if (!match) continue;

            const extracted = pattern.extract(match);
            const anchorLower = extracted.anchorWord.toLowerCase();

            if (usedAnchors.has(anchorLower)) continue;

            usedAnchors.add(anchorLower);
            sentenceHasVisual = true;

            toInject.push({
              type: 'stat',
              anchorText: extracted.anchorWord,
              duration: 3.0,
              position: 'center',
              content: {
                value: extracted.value,
                prefix: extracted.prefix,
                suffix: extracted.suffix,
                color: extracted.color,
              },
              _autoGenerated: true,
            });
          }
        }
      }

      // Injetar no início da lista para que os manuais (definidos pelo autor) fiquem depois
      // → Step 4 (calculateAnchors) processa em ordem — OK
      if (toInject.length > 0) {
        scene.visual.microVisuals = [...toInject, ...existingMVs];
        const sceneStatCount = toInject.filter(m => m.type === 'stat').length;
        const sceneStepCount = toInject.filter(m => m.type === 'step').length;
        console.log(
          `[ENRICH] Cena "${scene.id || sceneType}": +${toInject.length} microVisuais injetados` +
          ` (stat: ${sceneStatCount}, step: ${sceneStepCount})`
        );
        stats.statCount += sceneStatCount;
        stats.stepCount += sceneStepCount;
        stats.totalInjected += toInject.length;
      }
    } catch (err) {
      // Degraded mode: erros de enriquecimento nunca quebram o pipeline
      console.warn(`[ENRICH] ⚠️ Erro ao enriquecer cena "${scene.id}": ${err}. Pipeline continua.`);
    }
  }

  return stats;
}

// ============================================================================
// GERAÇÃO DE ÁUDIO COM ELEVENLABS
// ============================================================================

async function generateAudio(
  text: string,
  voiceId: string,
  supabase: any,
  filePrefix: string
): Promise<{
  success: boolean;
  url?: string;
  wordTimestamps?: WordTimestamp[];
  duration?: number;
  error?: string;
}> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ELEVENLABS_API_KEY not configured' };
  }

  if (!text.trim()) {
    return { success: false, error: 'Empty text' };
  }

  console.log(`[Audio] Generating for: "${text.substring(0, 50)}..."`);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,          // 50%
            similarity_boost: 0.75,  // 75%
            style: 0.5,              // 50% - Alice engaging style
            use_speaker_boost: true, // Ativado
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Audio] ElevenLabs error:', response.status, errorText);
      return { success: false, error: `ElevenLabs API error: ${response.status}` };
    }

    const data = await response.json();
    const audioBase64 = data.audio_base64;
    const alignment = data.alignment;

    if (!audioBase64) {
      return { success: false, error: 'No audio in response' };
    }

    // Process word timestamps
    let wordTimestamps: WordTimestamp[] = [];
    let duration = 0;

    if (alignment?.characters && alignment?.character_start_times_seconds) {
      wordTimestamps = processWordTimestamps(
        alignment.characters,
        alignment.character_start_times_seconds
      );
      if (wordTimestamps.length > 0) {
        duration = wordTimestamps[wordTimestamps.length - 1].end;
      }
    }

    // Upload to Supabase Storage
    let url = '';
    if (supabase) {
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const fileName = `${filePrefix}-${Date.now()}.mp3`;

      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('[Audio] Upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('lesson-audios')
          .getPublicUrl(fileName);
        url = urlData.publicUrl;
      }
    }

    console.log(`[Audio] Generated: ${url} (${duration.toFixed(1)}s, ${wordTimestamps.length} words)`);

    return {
      success: true,
      url,
      wordTimestamps,
      duration,
    };

  } catch (error: any) {
    console.error('[Audio] Error:', error);
    return { success: false, error: error.message };
  }
}

function processWordTimestamps(
  characters: string[],
  characterStartTimes: number[]
): WordTimestamp[] {
  const words: WordTimestamp[] = [];
  let currentWord = '';
  let wordStartIndex = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];

    if (char === ' ' || char === '\n' || i === characters.length - 1) {
      if (i === characters.length - 1 && char !== ' ' && char !== '\n') {
        currentWord += char;
      }

      if (currentWord.trim().length > 0) {
        const cleanWord = currentWord.trim();
        const startTime = characterStartTimes[wordStartIndex];
        const endTime = i < characters.length - 1
          ? characterStartTimes[i]
          : characterStartTimes[characterStartTimes.length - 1];

        words.push({ word: cleanWord, start: startTime, end: endTime });
      }

      currentWord = '';
      wordStartIndex = i + 1;
    } else {
      currentWord += char;
    }
  }

  return words;
}

// ============================================================================
// BUSCA DE PALAVRAS NOS TIMESTAMPS
// ============================================================================

/**
 * ✅ R08 FIX: Normalização robusta de palavras para matching
 * 
 * Problemas resolvidos:
 * - Acentos: "opção" → "opcao"
 * - Pontuação: "opção," → "opcao"
 * - Case: "Opção" → "opcao"
 * - Caracteres especiais: "opção…" → "opcao"
 */
function normalizeWord(word: string): string {
  if (!word || typeof word !== 'string') return '';
  
  return word
    .toLowerCase()                              // Case insensitive
    .normalize('NFD')                           // Decompose accents
    .replace(/[\u0300-\u036f]/g, '')           // Remove diacritics
    .replace(/[.,!?;:'"()[\]{}…\-–—]+/g, '')  // Remove punctuation (including en/em dashes)
    .replace(/\s+/g, ' ')                       // Collapse whitespace
    .trim();
}

// ============================================================================
// ✅ FASE 6 ANCHOR FIX: Busca de keyword DENTRO do range da cena
// Similar ao V7 step4-calculate-anchors.ts
// ============================================================================

// ============================================================================
// ✅ C02 FIX: UNIFIED ANCHOR SELECTION - Deterministic with Strategies
// ============================================================================

type AnchorStrategy = 'FIRST_IN_RANGE' | 'LAST_IN_RANGE' | 'CLOSEST_TO_TARGET';

interface AnchorSelectionResult {
  selectedTime: number | null;
  matchedCount: number;
  selectedIndex: number;
  selectedWord: string | null;
  strategyUsed: AnchorStrategy;
  allMatches: Array<{ word: string; start: number; end: number; idx: number }>;
}

const ANCHOR_EPS_GLOBAL = 0.30; // 300ms tolerance - R1 RULES.md

/**
 * ✅ C02: Unified anchor selection function
 * STRATEGIES:
 * - FIRST_IN_RANGE: For microVisuals/show (trigger at first mention)
 * - LAST_IN_RANGE: For pauseAt/endTime (pause after last mention)
 * - CLOSEST_TO_TARGET: For specific time targeting (optional)
 * 
 * RULES (from RULES.md):
 * - R1: Range filter with EPS tolerance
 * - R2: Anchor missing → return null, NO fallbacks
 * - R3: Strategy per context
 * - R4: Post-validation
 */
function selectAnchorOccurrence(
  keyword: string,
  wordTimestamps: WordTimestamp[],
  afterTime: number,
  beforeTime: number,
  strategy: AnchorStrategy = 'FIRST_IN_RANGE',
  targetTime?: number
): AnchorSelectionResult {
  const keywordParts = keyword.split(/\s+/).map(normalizeWord).filter(w => w.length > 0);
  
  const emptyResult: AnchorSelectionResult = {
    selectedTime: null,
    matchedCount: 0,
    selectedIndex: -1,
    selectedWord: null,
    strategyUsed: strategy,
    allMatches: []
  };

  if (keywordParts.length === 0) return emptyResult;

  // ✅ R1: Range filter with EPS tolerance
  const relevantTimestamps = wordTimestamps.filter(
    wt => wt.start >= (afterTime - ANCHOR_EPS_GLOBAL) && wt.start <= beforeTime
  );

  if (relevantTimestamps.length === 0) {
    console.warn(`[selectAnchorOccurrence] ⚠️ No timestamps in range [${(afterTime - ANCHOR_EPS_GLOBAL).toFixed(2)}s, ${beforeTime.toFixed(2)}s]`);
    return emptyResult;
  }

  // Collect ALL matches
  const allMatches: AnchorSelectionResult['allMatches'] = [];
  const target = keywordParts[0];

  // Multi-word matching
  if (keywordParts.length > 1) {
    for (let i = 0; i < relevantTimestamps.length - keywordParts.length + 1; i++) {
      const windowWords = relevantTimestamps
        .slice(i, i + keywordParts.length)
        .map(wt => normalizeWord(wt.word));

      const windowJoined = windowWords.join(' ');
      const keywordJoined = keywordParts.join(' ');

      if (windowJoined.includes(keywordJoined) || keywordJoined.includes(windowJoined)) {
        const lastWordInSequence = relevantTimestamps[i + keywordParts.length - 1];
        allMatches.push({
          word: keyword,
          start: relevantTimestamps[i].start,
          end: lastWordInSequence.end,
          idx: i
        });
      }
    }
  } else {
    // Single word matching
    // =====================================================================
    // ✅ C08 FIX v3: Matching mais estrito para evitar false-positives
    // PROBLEMA: "target.includes(normalizedWord)" aceitava matches como:
    //   - "Otimização" inclui "o" → match em qualquer "o" no áudio
    //   - Isso causava triggers em 0.57s ao invés de 77.94s
    //
    // SOLUÇÃO: 
    //   1. Match exato: normalizedWord === target
    //   2. Match por prefixo: normalizedWord.startsWith(target) com min 3 chars
    //   3. Match por sufixo: normalizedWord.endsWith(target) com min 3 chars
    //   4. Match inclusivo: apenas se target tiver 4+ chars para evitar "o", "e", etc.
    // =====================================================================
    // ✅ R08 FIX: Melhor matching para palavras com acentos e curtas
    // REGRAS:
    //   1. Match exato (após normalização) - SEMPRE aceito, qualquer tamanho
    //   2. Match por prefixo - target >= 3 chars
    //   3. Match por sufixo - target >= 3 chars
    //   4. Match inclusivo - target >= 4 chars (evita "o", "e", "a")
    // =====================================================================
    const target = keywordParts[0]; // já normalizado
    const minInclusionLength = 4;
    
    // Log para debug
    console.log(`[selectAnchorOccurrence] Searching for target="${target}" (original="${keyword}") in ${relevantTimestamps.length} words, range [${afterTime.toFixed(2)}s, ${beforeTime.toFixed(2)}s]`);
    
    relevantTimestamps.forEach((ts, idx) => {
      const normalizedWord = normalizeWord(ts.word);
      
      // Match exato - SEMPRE aceito, mesmo para palavras curtas
      if (normalizedWord === target) {
        allMatches.push({ word: ts.word, start: ts.start, end: ts.end, idx });
        return;
      }
      
      // Match por prefixo (ex: "Persona" começa com "persona")
      // Reduzido para 3 chars para capturar "opção" → "opc"
      if (target.length >= 3 && normalizedWord.startsWith(target)) {
        allMatches.push({ word: ts.word, start: ts.start, end: ts.end, idx });
        return;
      }
      
      // Match por sufixo (ex: "Otimização" termina com "ação")
      // Reduzido para 3 chars
      if (target.length >= 3 && normalizedWord.endsWith(target)) {
        allMatches.push({ word: ts.word, start: ts.start, end: ts.end, idx });
        return;
      }
      
      // Match inclusivo APENAS se:
      // 1. Target for longo o suficiente (≥4 chars)
      // 2. A palavra do áudio CONTÉM o target
      // REMOVIDO: target.includes(normalizedWord) - causava falsos positivos
      if (target.length >= minInclusionLength && normalizedWord.includes(target)) {
        allMatches.push({ word: ts.word, start: ts.start, end: ts.end, idx });
        return;
      }
      
      // ✅ R08 EXTRA: Se target tem 3+ chars e a palavra é "quase igual" (fuzzy)
      // Isso captura casos onde a normalização pode ter falhado parcialmente
      if (target.length >= 3 && normalizedWord.length >= 3) {
        // Verificar se diferem em apenas 1 caractere (typo tolerance)
        const maxDiff = 1;
        let diff = Math.abs(target.length - normalizedWord.length);
        if (diff <= maxDiff) {
          const shorter = target.length <= normalizedWord.length ? target : normalizedWord;
          const longer = target.length > normalizedWord.length ? target : normalizedWord;
          let mismatches = 0;
          let j = 0;
          for (let i = 0; i < longer.length && mismatches <= maxDiff; i++) {
            if (j < shorter.length && longer[i] === shorter[j]) {
              j++;
            } else {
              mismatches++;
            }
          }
          if (mismatches <= maxDiff && j >= shorter.length - 1) {
            // Não adicionar automaticamente - apenas log para diagnóstico
            // console.log(`[selectAnchorOccurrence] Fuzzy match candidate: "${normalizedWord}" ~= "${target}"`);
          }
        }
      }
    });
  }

  if (allMatches.length === 0) {
    // ✅ R2: Anchor missing → NULL, no fallback
    console.warn(`[ANCHOR-MISSING] ${JSON.stringify({
      keyword,
      range: [afterTime, beforeTime],
      occurrencesInRange: 0,
      strategy,
      verdict: 'NULL_ASSIGNED'
    })}`);
    return emptyResult;
  }

  // ✅ R3: Apply strategy
  let selectedMatch = allMatches[0];
  let selectedIndex = 0;

  switch (strategy) {
    case 'FIRST_IN_RANGE':
      selectedMatch = allMatches[0];
      selectedIndex = 0;
      break;

    case 'LAST_IN_RANGE':
      selectedMatch = allMatches[allMatches.length - 1];
      selectedIndex = allMatches.length - 1;
      break;

    case 'CLOSEST_TO_TARGET':
      if (targetTime !== undefined) {
        let closestDist = Infinity;
        allMatches.forEach((m, idx) => {
          const dist = Math.abs(m.end - targetTime);
          if (dist < closestDist) {
            closestDist = dist;
            selectedMatch = m;
            selectedIndex = idx;
          }
        });
      }
      break;
  }

  // ✅ R4: Post-validation - ensure selected time is in range
  const selectedTime = selectedMatch.end; // Use END time for trigger precision
  if (selectedTime < (afterTime - ANCHOR_EPS_GLOBAL) || selectedTime > beforeTime + ANCHOR_EPS_GLOBAL) {
    console.error(`[ANCHOR-OUT-OF-RANGE] ${JSON.stringify({
      keyword,
      selectedTime,
      range: [afterTime, beforeTime],
      strategy,
      verdict: 'DISCARDED'
    })}`);
    return emptyResult;
  }

  console.log(`[selectAnchorOccurrence] ✓ "${keyword}" strategy=${strategy} → ${selectedTime.toFixed(2)}s (${allMatches.length} matches, selected #${selectedIndex + 1})`);

  return {
    selectedTime,
    matchedCount: allMatches.length,
    selectedIndex,
    selectedWord: selectedMatch.word,
    strategyUsed: strategy,
    allMatches
  };
}

// ============================================================================
// C02: REPROCESS FROM OLD CONTENT - Recalculate ONLY keywordTime
// ============================================================================

interface RecalculatedPhase {
  phase: any;
  anchorsRecalculated: number;
  multiMatchCases: Array<{
    anchorId: string;
    keyword: string;
    occurrencesInRange: number;
    strategyUsed: AnchorStrategy;
    selectedTime: number | null;
    wasInRange: boolean;
    allMatches: Array<{ word: string; start: number; end: number }>;
  }>;
}

/**
 * ✅ C02: Recalculate ONLY keywordTime for existing anchors
 * Preserves ALL structure (phase IDs, anchor IDs, types, etc.)
 * Only updates keywordTime using selectAnchorOccurrence with proper strategy
 */
function recalculateAnchorKeywordTimes(
  phases: any[],
  wordTimestamps: WordTimestamp[]
): { 
  updatedPhases: any[]; 
  totalAnchorsRecalculated: number;
  multiMatchReport: RecalculatedPhase['multiMatchCases'];
  t1Count: number;
  t2Count: number;
} {
  console.log('[C02] recalculateAnchorKeywordTimes: Starting...');
  
  const updatedPhases: any[] = [];
  let totalAnchorsRecalculated = 0;
  const multiMatchReport: RecalculatedPhase['multiMatchCases'] = [];
  let t1Count = 0; // Out of range
  let t2Count = 0; // Null/missing
  
  for (const phase of phases) {
    // Deep clone to avoid mutation
    const updatedPhase = JSON.parse(JSON.stringify(phase));
    
    if (!updatedPhase.anchorActions || !Array.isArray(updatedPhase.anchorActions)) {
      updatedPhases.push(updatedPhase);
      continue;
    }
    
    const phaseStartTime = updatedPhase.startTime || 0;
    const phaseEndTime = updatedPhase.endTime || Infinity;
    
    for (let i = 0; i < updatedPhase.anchorActions.length; i++) {
      const anchor = updatedPhase.anchorActions[i];
      
      if (!anchor.keyword) {
        continue;
      }
      
      // =========================================================================
      // ✅ C07.2 PRIORITY RULE GUARD: Pauses com c07OriginalTime NÃO são recalculados
      // Isso evita "keyword drift" onde uma palavra comum é matchada incorretamente
      // O c07OriginalTime já foi validado e deve ser respeitado
      // =========================================================================
      if (anchor.type === 'pause' && anchor.c07OriginalTime !== undefined && anchor.c07OriginalTime !== null) {
        const originalTime = anchor.c07OriginalTime;
        const isInRange = originalTime >= phaseStartTime && originalTime <= phaseEndTime;
        
        if (isInRange) {
          // ✅ PRIORIDADE ABSOLUTA: Usar c07OriginalTime, NÃO recalcular por keyword
          console.log(`[C02] Phase "${phase.id}" pause: SKIPPED recalculation - c07OriginalTime @ ${originalTime.toFixed(3)}s (C07.2 PRIORITY RULE)`);
          
          // Aplicar o tempo original como keywordTime
          anchor.keywordTime = originalTime;
          anchor.timestamp = originalTime;
          anchor.c07PriorityApplied = true;
          totalAnchorsRecalculated++;
          continue; // Não recalcular por keyword
        } else {
          console.log(`[C02] Phase "${phase.id}" pause: c07OriginalTime @ ${originalTime.toFixed(3)}s is OUT OF RANGE [${phaseStartTime.toFixed(3)}s-${phaseEndTime.toFixed(3)}s], will recalculate`);
        }
      }
      
      // ✅ C02: Apply correct strategy based on anchor type (R3)
      // pauseAt and endTime derivation → LAST_IN_RANGE
      // microVisuals (show) → FIRST_IN_RANGE
      const strategy: AnchorStrategy = anchor.type === 'pause' 
        ? 'LAST_IN_RANGE' 
        : 'FIRST_IN_RANGE';
      
      const result = selectAnchorOccurrence(
        anchor.keyword,
        wordTimestamps,
        phaseStartTime,
        phaseEndTime,
        strategy
      );
      
      const oldKeywordTime = anchor.keywordTime;
      const newKeywordTime = result.selectedTime;
      
      // Update keywordTime
      anchor.keywordTime = newKeywordTime;
      totalAnchorsRecalculated++;
      
      // Track metrics
      if (newKeywordTime === null) {
        t2Count++; // Anchor missing
      } else if (newKeywordTime < phaseStartTime - ANCHOR_EPS_GLOBAL || newKeywordTime > phaseEndTime + ANCHOR_EPS_GLOBAL) {
        t1Count++; // Out of range (should not happen with proper implementation)
      }
      
      // Report multi-match cases
      if (result.matchedCount >= 2 || result.matchedCount === 0) {
        multiMatchReport.push({
          anchorId: anchor.id || `${phase.id}_anchor_${i}`,
          keyword: anchor.keyword,
          occurrencesInRange: result.matchedCount,
          strategyUsed: result.strategyUsed,
          selectedTime: result.selectedTime,
          wasInRange: result.selectedTime !== null,
          allMatches: result.allMatches
        });
      }
      
      console.log(`[C02] Phase "${phase.id}" anchor "${anchor.keyword}": ${oldKeywordTime?.toFixed(2) || 'null'}s → ${newKeywordTime?.toFixed(2) || 'null'}s (strategy: ${strategy}, matches: ${result.matchedCount})`);
    }
    
    updatedPhases.push(updatedPhase);
  }
  
  console.log(`[C02] Recalculated ${totalAnchorsRecalculated} anchors. T1=${t1Count}, T2=${t2Count}, Multi-match cases=${multiMatchReport.length}`);
  
  return {
    updatedPhases,
    totalAnchorsRecalculated,
    multiMatchReport,
    t1Count,
    t2Count
  };
}

// ============================================================================
// C04: NORMALIZE PHASE TIMELINE (Global Hardening)
// Garante monotonicidade, ausência de overlap e clamp em audioDuration
// ============================================================================

// ✅ C04.1: Métricas estruturadas before/after
interface C04MetricsSnapshot {
  t4Overlap: number;
  t4NonMonotonicEnd: number;
  t4OutsideAudio: number;
  t4Gap: number;
}

interface C04TimelineStats {
  // ✅ C04.1: Estrutura hierárquica before/after
  metricsBefore: C04MetricsSnapshot;
  metricsAfter: C04MetricsSnapshot;
  fixesAppliedCount: number;               // Total de fases com fix aplicado
  overlapCreatedByDurationFixCount: number; // Overlaps criados por DURATION_FIX/fix anterior
  fixApplied: boolean;                     // true só se algo mudou
  audioDuration: number;
  phaseTimelineChanges: Array<{
    phaseId: string;
    phaseType: string;
    oldStartTime: number;
    oldEndTime: number;
    newStartTime: number;
    newEndTime: number;
    fixApplied: 'OVERLAP_FIX' | 'OVERLAP_FIX_CASCADED' | 'DURATION_FIX' | 'CLAMP_START_FIX' | 'CLAMP_END_FIX' | 'MICRO_AUDIO_LIMIT' | 'NONE';
    reason: string;
  }>;
  // ✅ C04.1: Compatibilidade com formato antigo (deprecated, usar metricsBefore/After)
  t4OverlapBefore: number;
  t4OverlapAfter: number;
  t4NonMonotonicEndBefore: number;
  t4NonMonotonicEndAfter: number;
  t4OutsideAudioBefore: number;
  t4OutsideAudioAfter: number;
  t4GapBefore: number;
  t4GapAfter: number;
}

const C04_EPS = 0.30;        // 300ms tolerance
const C04_GAP_EPS = 1.0;     // 1s gap tolerance for gap detection
const C04_MIN_DURATION_INTERACTIVE = 5.0;  // quiz/playground/pause
const C04_MIN_DURATION_NON_INTERACTIVE = 0.5;  // narrative/dramatic etc

/**
 * PHASE_DRIFT_FIX (REPROCESS MODE)
 * 
 * Corrige boundaries de fases quando a narração principal (visual.content.word, título)
 * aparece ANTES do startTime atual da fase.
 * 
 * Exemplo: Fase "PERFEITO" com startTime=76s, mas narração "PERFEITO" está em 60s
 * → Expandir startTime para 59.5s (0.5s antes do anchor)
 */
function applyPhaseDriftFixReprocess(
  phases: any[],
  wordTimestamps: WordTimestamp[]
): any[] {
  console.log('[PHASE_DRIFT_FIX] Checking phases for narration drift...');
  
  // JANELA DE BUSCA: Procurar apenas nos 30 segundos ANTES do startTime atual
  // Isso evita matches falsos muito distantes da fase
  const DRIFT_SEARCH_WINDOW = 30.0; // segundos
  const DRIFT_THRESHOLD = 0.5; // mínimo drift para corrigir
  
  // =========================================================================
  // PASS 1: Detectar drifts e calcular novos startTimes
  // =========================================================================
  const correctedPhases = phases.map((phase, idx) => {
    const corrected = JSON.parse(JSON.stringify(phase)); // Deep clone
    const currentStartTime = corrected.startTime ?? 0;
    let expandedStartTime = currentStartTime;
    let driftReason = '';
    
    // Definir janela de busca: [currentStartTime - WINDOW, currentStartTime]
    const searchStart = Math.max(0, currentStartTime - DRIFT_SEARCH_WINDOW);
    const searchEnd = currentStartTime; // Buscar apenas ANTES do startTime
    
    // CASO 1: visual.content.word (ex: "PERFEITO" para letter-reveal)
    const visualWord = corrected.visual?.content?.word;
    if (visualWord && typeof visualWord === 'string' && visualWord.length > 4) {
      // Usar LAST_IN_RANGE para pegar a ocorrência mais próxima do startTime
      const wordTriggerResult = selectAnchorOccurrence(
        visualWord,
        wordTimestamps,
        searchStart,
        searchEnd,
        'LAST_IN_RANGE' // Pegar a última ocorrência ANTES do startTime
      );
      
      if (wordTriggerResult.selectedTime !== null) {
        console.log(`[PHASE_DRIFT_FIX] Phase "${phase.id}": visual.word "${visualWord}" found @ ${wordTriggerResult.selectedTime.toFixed(2)}s (window: ${searchStart.toFixed(2)}s-${searchEnd.toFixed(2)}s)`);
        
        const proposedStartTime = Math.max(0, wordTriggerResult.selectedTime - DRIFT_THRESHOLD);
        if (proposedStartTime < expandedStartTime) {
          expandedStartTime = proposedStartTime;
          driftReason = `visual.content.word "${visualWord}" @ ${wordTriggerResult.selectedTime.toFixed(2)}s`;
        }
      }
    }
    
    // CASO 2: microVisuals com anchors ANTES da fase (foco em letter-reveal/card-reveal)
    // NÃO verificar títulos - muito propenso a falsos positivos
    if (corrected.microVisuals && Array.isArray(corrected.microVisuals)) {
      for (const mv of corrected.microVisuals) {
        const isVisualWithNarration = ['letter-reveal', 'card-reveal', 'text-reveal'].includes(mv.type);
        if (!isVisualWithNarration || !mv.anchorText || mv.anchorText.length < 4) continue;
        
        const mvResult = selectAnchorOccurrence(
          mv.anchorText,
          wordTimestamps,
          searchStart,
          searchEnd,
          'LAST_IN_RANGE'
        );
        
        if (mvResult.selectedTime !== null) {
          const proposedStartTime = Math.max(0, mvResult.selectedTime - DRIFT_THRESHOLD);
          if (proposedStartTime < expandedStartTime) {
            expandedStartTime = proposedStartTime;
            driftReason = `microVisual "${mv.anchorText}" @ ${mvResult.selectedTime.toFixed(2)}s`;
          }
        }
      }
    }
    
    // Aplicar correção se houve drift significativo (> 0.5s)
    if (currentStartTime - expandedStartTime > DRIFT_THRESHOLD) {
      console.log(`[PHASE_DRIFT_FIX] ✅ Phase "${phase.id}": startTime ${currentStartTime.toFixed(2)}s → ${expandedStartTime.toFixed(2)}s (reason: ${driftReason})`);
      corrected.startTime = expandedStartTime;
      corrected.phaseDriftFixed = true;
      corrected.phaseDriftReason = driftReason;
      corrected.phaseDriftOldStartTime = currentStartTime;
    }
    
    return corrected;
  });
  
  // =========================================================================
  // PASS 2: Ajustar endTime das fases anteriores para manter monotonicidade
  // CRÍTICO: Se expandimos startTime de fase N para T, então fase N-1.endTime 
  // deve ser <= T para que C04 não reverta nossa correção
  // =========================================================================
  console.log('[PHASE_DRIFT_FIX] PASS 2: Adjusting previous phase endTimes for monotonicity...');
  
  for (let i = 1; i < correctedPhases.length; i++) {
    const currentPhase = correctedPhases[i];
    const prevPhase = correctedPhases[i - 1];
    
    // Se esta fase teve drift fix E o endTime da fase anterior é maior que nosso novo startTime
    if (currentPhase.phaseDriftFixed && prevPhase.endTime > currentPhase.startTime) {
      const oldEndTime = prevPhase.endTime;
      const newEndTime = currentPhase.startTime;
      
      console.log(`[PHASE_DRIFT_FIX] ⚠️ Phase "${prevPhase.id}": endTime ${oldEndTime.toFixed(2)}s → ${newEndTime.toFixed(2)}s (to accommodate drift fix of "${currentPhase.id}")`);
      
      prevPhase.endTime = newEndTime;
      prevPhase.phaseDriftEndTimeAdjusted = true;
      prevPhase.phaseDriftOldEndTime = oldEndTime;
      
      // SEGURANÇA: Garantir que a fase anterior ainda tem duração positiva
      const prevDuration = prevPhase.endTime - prevPhase.startTime;
      if (prevDuration < 0.5) {
        console.warn(`[PHASE_DRIFT_FIX] ⚠️ WARN: Phase "${prevPhase.id}" duration after adjustment is only ${prevDuration.toFixed(2)}s`);
      }
    }
  }
  
  const fixedCount = correctedPhases.filter(p => p.phaseDriftFixed).length;
  const endTimeAdjustedCount = correctedPhases.filter(p => p.phaseDriftEndTimeAdjusted).length;
  console.log(`[PHASE_DRIFT_FIX] Complete. Fixed ${fixedCount} phases, adjusted ${endTimeAdjustedCount} previous endTimes.`);
  
  return correctedPhases;
}

/**
 * C04: Normalize Phase Timeline (Global Hardening)
 * 
 * ✅ C04.1: Tracking aprimorado de overlaps
 * - OVERLAP_FIX: overlap existia no input original
 * - OVERLAP_FIX_CASCADED: overlap criado por DURATION_FIX/CLAMP de fase anterior
 * 
 * Estratégia obrigatória:
 * - Manter ordem original das phases
 * - startTime = max(startTime, prevEndTime) [eliminates overlap]
 * - endTime = max(endTime, startTime + minDuration) [ensures positive duration]
 * - clamp em [0, audioDuration] e registrar reasons
 * - prevEndTime = endTime [monotonic chain]
 * 
 * Invariantes:
 * - Somente startTime/endTime podem mudar
 * - IDs/anchors/structure intactos
 */
function normalizePhaseTimeline(
  phases: any[],
  audioDuration: number,
  wordTimestamps: WordTimestamp[] = []  // C07.3: Required for PREPASS alignment
): {
  normalizedPhases: any[];
  c04Stats: C04TimelineStats;
} {
  console.log('[C04] normalizePhaseTimeline: Starting...');
  console.log(`[C04] Total phases: ${phases.length}, Audio duration: ${audioDuration.toFixed(2)}s`);
  
  // ✅ C04.1: Inicializar estrutura hierárquica
  const metricsBefore: C04MetricsSnapshot = {
    t4Overlap: 0,
    t4NonMonotonicEnd: 0,
    t4OutsideAudio: 0,
    t4Gap: 0
  };
  
  const metricsAfter: C04MetricsSnapshot = {
    t4Overlap: 0,
    t4NonMonotonicEnd: 0,
    t4OutsideAudio: 0,
    t4Gap: 0
  };
  
  const c04Stats: C04TimelineStats = {
    metricsBefore,
    metricsAfter,
    fixesAppliedCount: 0,
    overlapCreatedByDurationFixCount: 0,
    fixApplied: false,
    audioDuration,
    phaseTimelineChanges: [],
    // Compatibilidade (deprecated)
    t4OverlapBefore: 0,
    t4OverlapAfter: 0,
    t4NonMonotonicEndBefore: 0,
    t4NonMonotonicEndAfter: 0,
    t4OutsideAudioBefore: 0,
    t4OutsideAudioAfter: 0,
    t4GapBefore: 0,
    t4GapAfter: 0
  };
  
  // =====================================================================
  // PASSO 1: DIAGNÓSTICO BEFORE (sem modificar) + Mapa de overlaps originais
  // ✅ C04.1: Capturar quais fases têm overlap no INPUT para distinguir de cascaded
  // =====================================================================
  const originalOverlapPhases = new Set<number>(); // Índices de fases com overlap no input
  
  let prevEndBefore = 0;
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const start = phase.startTime ?? 0;
    const end = phase.endTime ?? 0;
    
    // T4 Overlap: startTime < prevEndTime - EPS
    if (start < prevEndBefore - C04_EPS) {
      metricsBefore.t4Overlap++;
      c04Stats.t4OverlapBefore++;
      originalOverlapPhases.add(i); // ✅ C04.1: Marcar que tinha overlap no input
    }
    
    // T4 Non-monotonic end: endTime < prevEndTime - EPS
    if (end < prevEndBefore - C04_EPS) {
      metricsBefore.t4NonMonotonicEnd++;
      c04Stats.t4NonMonotonicEndBefore++;
    }
    
    // T4 Outside audio: start < 0-EPS OR end > audioDuration+EPS
    if (start < 0 - C04_EPS || end > audioDuration + C04_EPS) {
      metricsBefore.t4OutsideAudio++;
      c04Stats.t4OutsideAudioBefore++;
    }
    
    // T4 Gap: startTime > prevEndTime + GAP_EPS
    if (start > prevEndBefore + C04_GAP_EPS) {
      metricsBefore.t4Gap++;
      c04Stats.t4GapBefore++;
    }
    
    prevEndBefore = end;
  }
  
  console.log(`[C04] BEFORE: Overlap=${metricsBefore.t4Overlap}, NonMonotonic=${metricsBefore.t4NonMonotonicEnd}, OutsideAudio=${metricsBefore.t4OutsideAudio}, Gap=${metricsBefore.t4Gap}`);
  
  // =====================================================================
  // PASSO 1.5: RESERVAR ESPAÇO PARA FASES INTERATIVAS NO FINAL DO ÁUDIO
  // =========================================================================
  // Problema: Fases interativas (quiz, playground) no final são "espremidas"
  // contra o audioDuration, ficando com duração < 5s e cortando narração.
  // 
  // Solução C07.3: PREPASS ALIGNMENT
  // 1. Detectar a PRIMEIRA PALAVRA DA NARRAÇÃO da fase interativa
  // 2. Alinhar startTime com essa palavra (não antes de firstWordTime - 0.2s)
  // 3. Garantir duration >= 5s ajustando startTime para trás ou "roubando" da anterior
  // =========================================================================
  const clonedForPrepass: any[] = phases.map(p => JSON.parse(JSON.stringify(p)));
  
  // C07.3: Para cada fase interativa, encontrar a primeira palavra da narração
  const findFirstWordOfPhase = (phase: any, phaseIndex: number): number | null => {
    // Estratégia 1: Buscar palavras-chave típicas de fases interativas
    const phaseKeywords: Record<string, string[]> = {
      'playground': ['Faça', 'Agora', 'Pratique', 'Tente', 'Digite', 'Experimente', 'Aplique'],
      'quiz': ['Qual', 'Responda', 'Escolha', 'Marque', 'Selecione'],
      'interaction': ['Qual', 'Responda', 'Escolha', 'Marque', 'Selecione', 'Agora'],
      'secret-reveal': ['Segredo', 'Revelação', 'Descubra', 'Agora'],
      'cta': ['Parabéns', 'Continue', 'Próxima', 'Avance', 'Clique'],
    };
    
    const typeKeywords = phaseKeywords[phase.type] || ['Agora'];
    
    // Janela de busca: startTime atual até endTime (ou +10s se não definido)
    const searchStart = phase.startTime ?? 0;
    const searchEnd = phase.endTime ?? (searchStart + 15);
    
    // Helper: Normalizar palavra (remover pontuação)
    const normalize = (w: string) => w.toLowerCase().replace(/[.,!?:;'"]/g, '').trim();
    
    // Buscar cada keyword na janela da fase
    for (const keyword of typeKeywords) {
      const normalizedKeyword = normalize(keyword);
      
      // C07.3 FIX: Keyword deve ter pelo menos 3 caracteres para evitar matches falsos
      if (normalizedKeyword.length < 3) continue;
      
      for (const wt of wordTimestamps) {
        const normalizedWord = normalize(wt.word);
        
        // C07.3 FIX: Match preciso - a palavra deve começar com o keyword ou ser igual
        // Evitar que "a" faça match com "Faça"
        const isExactMatch = normalizedWord === normalizedKeyword;
        const isStartMatch = normalizedWord.startsWith(normalizedKeyword) && normalizedKeyword.length >= 4;
        const isContainedMatch = normalizedWord.includes(normalizedKeyword) && normalizedKeyword.length >= 4;
        
        if (isExactMatch || isStartMatch || isContainedMatch) {
          // Verificar se está na janela da fase ou ligeiramente antes (até -5s)
          if (wt.start >= searchStart - 5 && wt.start <= searchEnd) {
            console.log(`[C07.3] Phase "${phase.id}": Found keyword "${keyword}" via word "${wt.word}" @ ${wt.start.toFixed(2)}s (exact=${isExactMatch})`);
            return wt.start;
          }
        }
      }
    }
    
    // Fallback: usar o startTime original se não encontrou palavra
    console.log(`[C07.3] Phase "${phase.id}": No keyword found in [${searchStart.toFixed(2)}s, ${searchEnd.toFixed(2)}s], using original startTime`);
    return null;
  };
  
  for (let i = clonedForPrepass.length - 1; i >= 0; i--) {
    const phase = clonedForPrepass[i];
    const isInteractive = ['interaction', 'playground', 'quiz', 'secret-reveal', 'cta'].includes(phase.type);
    
    if (!isInteractive) continue;
    
    const originalStartTime = phase.startTime ?? 0;
    const endTime = Math.min(phase.endTime ?? audioDuration, audioDuration);
    const currentDuration = endTime - originalStartTime;
    
    // C07.3: Encontrar a primeira palavra da fase
    const firstWordTime = findFirstWordOfPhase(phase, i);
    
    // C07.3 REGRA: startTime DEVE ser alinhado com firstWordTime
    // Permitir no máximo 0.2s ANTES da primeira palavra
    const MAX_LEAD_TIME = 0.2;
    let alignedStartTime = originalStartTime;
    
    if (firstWordTime !== null) {
      // startTime não pode ser mais de 0.2s antes da primeira palavra
      const earliestAllowed = Math.max(0, firstWordTime - MAX_LEAD_TIME);
      
      if (originalStartTime < earliestAllowed) {
        // startTime está MUITO antes da fala - ajustar para frente
        alignedStartTime = earliestAllowed;
        console.log(`[C07.3] Phase "${phase.id}": startTime ${originalStartTime.toFixed(2)}s is too early (firstWord @ ${firstWordTime.toFixed(2)}s), aligning to ${alignedStartTime.toFixed(2)}s`);
      } else if (originalStartTime > firstWordTime + MAX_LEAD_TIME) {
        // startTime está DEPOIS da primeira palavra - ajustar para trás
        alignedStartTime = earliestAllowed;
        console.log(`[C07.3] Phase "${phase.id}": startTime ${originalStartTime.toFixed(2)}s is after firstWord @ ${firstWordTime.toFixed(2)}s, aligning to ${alignedStartTime.toFixed(2)}s`);
      }
    }
    
    // Recalcular duração com startTime alinhado
    const alignedDuration = endTime - alignedStartTime;
    
    // C07.3 v2: A regra fundamental é que startTime DEVE ser alinhado com firstWord
    // Se não há espaço para 5s, "roubamos" da fase anterior, MAS o startTime
    // final NUNCA pode ser mais que 0.2s antes da primeira palavra
    
    // Se a fase interativa tem duração < 5s após alinhamento
    if (alignedDuration < C04_MIN_DURATION_INTERACTIVE) {
      const neededSpace = C04_MIN_DURATION_INTERACTIVE - alignedDuration;
      
      console.log(`[C07.3] Phase "${phase.id}": needs ${neededSpace.toFixed(2)}s more (aligned duration: ${alignedDuration.toFixed(2)}s)`);
      
      // C07.3 v2: "Roubar" tempo da fase anterior para que ela termine ANTES de firstWord
      // Isso NÃO muda o startTime desta fase, apenas encurta a anterior
      if (i > 0 && firstWordTime !== null) {
        const prevPhase = clonedForPrepass[i - 1];
        
        if (prevPhase && prevPhase.endTime) {
          // A fase anterior deve terminar no máximo em (firstWord - 0.2s)
          const maxPrevEndTime = firstWordTime - MAX_LEAD_TIME;
          
          if (prevPhase.endTime > maxPrevEndTime) {
            const oldPrevEnd = prevPhase.endTime;
            prevPhase.endTime = Math.max(prevPhase.startTime + 2.0, maxPrevEndTime); // Manter mínimo 2s
            console.log(`[C07.3] Phase "${phase.id}": Adjusting prev "${prevPhase.id}" endTime ${oldPrevEnd.toFixed(2)}s → ${prevPhase.endTime.toFixed(2)}s (firstWord @ ${firstWordTime.toFixed(2)}s)`);
          }
        }
      }
      
      // C07.3 v2: O startTime FINAL é SEMPRE o alinhado com firstWord, não o "roubado"
      phase.startTime = alignedStartTime;
      phase.endTime = endTime;
      
      // Metadados para debug
      phase.prepassApplied = true;
      phase.prepassFirstWordTime = firstWordTime;
      phase.prepassOriginalStartTime = originalStartTime;
      phase.prepassAlignedStartTime = alignedStartTime;
      phase.prepassFinalStartTime = alignedStartTime;
      phase.prepassDelta = firstWordTime !== null ? (alignedStartTime - firstWordTime).toFixed(3) : 'N/A';
      
      const finalDuration = endTime - alignedStartTime;
      console.log(`[C07.3] ✅ Phase "${phase.id}": FINAL startTime=${alignedStartTime.toFixed(2)}s, endTime=${endTime.toFixed(2)}s, duration=${finalDuration.toFixed(2)}s, firstWord=${firstWordTime?.toFixed(2) ?? 'N/A'}s, delta=${phase.prepassDelta}s`);
      
      // C07.3 v2: Se ainda não temos 5s, é uma limitação do áudio, não vamos forçar
      if (finalDuration < C04_MIN_DURATION_INTERACTIVE) {
        console.log(`[C07.3] ⚠️ Phase "${phase.id}": duration ${finalDuration.toFixed(2)}s < 5.0s - audio limitation, cannot expand further`);
      }
    } else if (alignedStartTime !== originalStartTime) {
      // Duração suficiente, mas precisou alinhar
      phase.startTime = alignedStartTime;
      phase.prepassApplied = true;
      phase.prepassFirstWordTime = firstWordTime;
      phase.prepassOriginalStartTime = originalStartTime;
      phase.prepassAlignedStartTime = alignedStartTime;
      phase.prepassFinalStartTime = alignedStartTime;
      phase.prepassDelta = firstWordTime !== null ? (alignedStartTime - firstWordTime).toFixed(3) : 'N/A';
      
      console.log(`[C07.3] ✅ Phase "${phase.id}": Aligned startTime=${alignedStartTime.toFixed(2)}s (was ${originalStartTime.toFixed(2)}s), firstWord=${firstWordTime?.toFixed(2) ?? 'N/A'}s, delta=${phase.prepassDelta}s`);
    }
  }
  
  // =====================================================================
  // PASSO 2: NORMALIZAÇÃO (deep clone, manter ordem original)
  // ✅ C04.1: Tracking de prevEndTime "esperado" vs "real" para detectar cascaded overlaps
  // =====================================================================
  const normalizedPhases: any[] = clonedForPrepass; // Usar resultado do prepass
  
  let prevEndTime = 0;           // prevEndTime APÓS aplicar fix (chain real)
  let prevOriginalEndTime = 0;   // prevEndTime do INPUT (para detectar cascaded)
  let anyChange = false;
  
  for (let i = 0; i < normalizedPhases.length; i++) {
    const phase = normalizedPhases[i];
    const isInteractive = ['interaction', 'playground', 'quiz', 'secret-reveal', 'pause'].includes(phase.type);
    const minDuration = isInteractive ? C04_MIN_DURATION_INTERACTIVE : C04_MIN_DURATION_NON_INTERACTIVE;
    
    const oldStartTime = phase.startTime ?? 0;
    const oldEndTime = phase.endTime ?? 0;
    
    let newStartTime = oldStartTime;
    let newEndTime = oldEndTime;
    let fixApplied: C04TimelineStats['phaseTimelineChanges'][0]['fixApplied'] = 'NONE';
    let fixReason = '';
    
    // =====================================================================
    // REGRA 1: startTime = max(startTime, prevEndTime) [elimina overlap]
    // ✅ C04.1: Distinguir OVERLAP_FIX (original) vs OVERLAP_FIX_CASCADED
    // =====================================================================
    if (newStartTime < prevEndTime) {
      newStartTime = prevEndTime;
      
      // ✅ C04.1: Verificar se o overlap existia no input original
      const hadOverlapInInput = originalOverlapPhases.has(i);
      
      // ✅ C04.1: Se não tinha overlap no input, mas tem agora, é cascaded
      // (causado por DURATION_FIX ou outro fix na fase anterior)
      const isCascadedOverlap = !hadOverlapInInput && oldStartTime >= prevOriginalEndTime - C04_EPS;
      
      if (fixApplied === 'NONE') {
        if (isCascadedOverlap) {
          fixApplied = 'OVERLAP_FIX_CASCADED';
          fixReason = `startTime (${oldStartTime.toFixed(2)}s) < prevEndTime (${prevEndTime.toFixed(2)}s) [cascaded from previous fix]`;
          c04Stats.overlapCreatedByDurationFixCount++;
          console.log(`[C04] FIX OVERLAP_CASCADED: "${phase.id}" startTime ${oldStartTime.toFixed(2)}s → ${newStartTime.toFixed(2)}s (caused by previous fix)`);
        } else {
          fixApplied = 'OVERLAP_FIX';
          fixReason = `startTime (${oldStartTime.toFixed(2)}s) < prevEndTime (${prevEndTime.toFixed(2)}s)`;
          console.log(`[C04] FIX OVERLAP: "${phase.id}" startTime ${oldStartTime.toFixed(2)}s → ${newStartTime.toFixed(2)}s`);
        }
      }
    }
    
    // =====================================================================
    // REGRA 2: Clamp startTime em [0, audioDuration]
    // =====================================================================
    if (newStartTime < 0) {
      newStartTime = 0;
      if (fixApplied === 'NONE') {
        fixApplied = 'CLAMP_START_FIX';
        fixReason = `startTime (${oldStartTime.toFixed(2)}s) < 0`;
      }
      console.log(`[C04] FIX CLAMP_START: "${phase.id}" startTime ${oldStartTime.toFixed(2)}s → 0`);
    }
    if (newStartTime > audioDuration) {
      // Se startTime > audioDuration, colocar no final com duração mínima
      newStartTime = Math.max(0, audioDuration - minDuration);
      if (fixApplied === 'NONE') {
        fixApplied = 'CLAMP_START_FIX';
        fixReason = `startTime (${oldStartTime.toFixed(2)}s) > audioDuration (${audioDuration.toFixed(2)}s)`;
      }
      console.log(`[C04] FIX CLAMP_START_BEYOND: "${phase.id}" startTime ${oldStartTime.toFixed(2)}s → ${newStartTime.toFixed(2)}s`);
    }
    
    // =====================================================================
    // REGRA 3: endTime = max(endTime, startTime + minDuration)
    // =====================================================================
    const currentDuration = newEndTime - newStartTime;
    if (currentDuration < minDuration) {
      const idealEndTime = newStartTime + minDuration;
      
      // Verificar se cabe no áudio
      if (idealEndTime <= audioDuration) {
        newEndTime = idealEndTime;
        if (fixApplied === 'NONE') {
          fixApplied = 'DURATION_FIX';
          fixReason = `duration (${currentDuration.toFixed(2)}s) < minDuration (${minDuration}s)`;
        }
      } else {
        // Não cabe a duração ideal, usar o que resta até o fim do áudio
        newEndTime = audioDuration;
        const actualDuration = newEndTime - newStartTime;
        if (actualDuration < minDuration && isInteractive) {
          // Documentar que ficou MICRO por limite do áudio
          if (fixApplied === 'NONE') {
            fixApplied = 'MICRO_AUDIO_LIMIT';
            fixReason = `interactive duration (${actualDuration.toFixed(2)}s) < ${minDuration}s devido a AUDIO_LIMIT`;
          }
        } else if (fixApplied === 'NONE') {
          fixApplied = 'DURATION_FIX';
          fixReason = `duration extended to audioDuration (${audioDuration.toFixed(2)}s)`;
        }
      }
      console.log(`[C04] FIX DURATION: "${phase.id}" endTime ${oldEndTime.toFixed(2)}s → ${newEndTime.toFixed(2)}s`);
    }
    
    // =====================================================================
    // REGRA 4: Clamp endTime em audioDuration
    // =====================================================================
    if (newEndTime > audioDuration) {
      newEndTime = audioDuration;
      if (fixApplied === 'NONE') {
        fixApplied = 'CLAMP_END_FIX';
        fixReason = `endTime (${oldEndTime.toFixed(2)}s) > audioDuration (${audioDuration.toFixed(2)}s)`;
      }
      console.log(`[C04] FIX CLAMP_END: "${phase.id}" endTime ${oldEndTime.toFixed(2)}s → ${audioDuration.toFixed(2)}s`);
    }
    
    // =====================================================================
    // REGRA 5: Garantir endTime > startTime (safety net)
    // =====================================================================
    if (newEndTime <= newStartTime) {
      newEndTime = Math.min(newStartTime + minDuration, audioDuration);
      if (fixApplied === 'NONE') {
        fixApplied = 'DURATION_FIX';
        fixReason = `endTime (${newEndTime.toFixed(2)}s) <= startTime (${newStartTime.toFixed(2)}s)`;
      }
      console.log(`[C04] FIX SAFETY_NET: "${phase.id}" endTime forced to ${newEndTime.toFixed(2)}s`);
    }
    
    // Aplicar mudanças
    phase.startTime = newStartTime;
    phase.endTime = newEndTime;
    
    // ✅ C04.1: Registrar mudança se houve fix + contar fixesAppliedCount
    const hasChanged = Math.abs(oldStartTime - newStartTime) > 0.001 || Math.abs(oldEndTime - newEndTime) > 0.001;
    if (hasChanged) {
      anyChange = true;
      c04Stats.fixesAppliedCount++;
      c04Stats.phaseTimelineChanges.push({
        phaseId: phase.id,
        phaseType: phase.type,
        oldStartTime,
        oldEndTime,
        newStartTime,
        newEndTime,
        fixApplied,
        reason: fixReason
      });
    }
    
    // Atualizar prevEndTime para próxima iteração
    prevOriginalEndTime = oldEndTime;  // ✅ C04.1: Track original chain
    prevEndTime = newEndTime;          // Track fixed chain
  }
  
  c04Stats.fixApplied = anyChange;
  
  // =====================================================================
  // PASSO 3: DIAGNÓSTICO AFTER
  // ✅ C04.1: Atualizar tanto metricsBefore/After quanto deprecated fields
  // =====================================================================
  let prevEndAfter = 0;
  for (const phase of normalizedPhases) {
    const start = phase.startTime ?? 0;
    const end = phase.endTime ?? 0;
    
    if (start < prevEndAfter - C04_EPS) {
      metricsAfter.t4Overlap++;
      c04Stats.t4OverlapAfter++;
    }
    if (end < prevEndAfter - C04_EPS) {
      metricsAfter.t4NonMonotonicEnd++;
      c04Stats.t4NonMonotonicEndAfter++;
    }
    if (start < 0 - C04_EPS || end > audioDuration + C04_EPS) {
      metricsAfter.t4OutsideAudio++;
      c04Stats.t4OutsideAudioAfter++;
    }
    if (start > prevEndAfter + C04_GAP_EPS) {
      metricsAfter.t4Gap++;
      c04Stats.t4GapAfter++;
    }
    
    prevEndAfter = end;
  }
  
  console.log(`[C04] AFTER: Overlap=${metricsAfter.t4Overlap}, NonMonotonic=${metricsAfter.t4NonMonotonicEnd}, OutsideAudio=${metricsAfter.t4OutsideAudio}, Gap=${metricsAfter.t4Gap}`);
  console.log(`[C04] fixApplied=${c04Stats.fixApplied}, fixesAppliedCount=${c04Stats.fixesAppliedCount}, overlapCreatedByDurationFixCount=${c04Stats.overlapCreatedByDurationFixCount}`);
  
  return {
    normalizedPhases,
    c04Stats
  };
}

// ============================================================================
// C06: SINGLE TRIGGER CONTRACT
// Normaliza output para usar APENAS anchorActions + keywordTime (canônico)
// Remove triggerTime de microVisuals, garante show actions para todos
// ============================================================================

interface C06NormalizationStats {
  triggerContract: 'anchorActions';
  removedTriggerTimeCount: number;
  showActionsCreated: number;
  showActionsExisting: number;
  microVisualsProcessed: number;
  phasesProcessed: number;
}

interface C06BeforeAfter {
  hasTriggerTime: boolean;
  hasShowActions: boolean;
  triggerTimeCount: number;
  showActionCount: number;
}

interface C06DiffSummary {
  triggerContractBefore: C06BeforeAfter;
  triggerContractAfter: C06BeforeAfter;
  removedTriggerTimeCount: number;
  showActionsCreated: number;
}

/**
 * C06: Single Trigger Contract Normalization
 * 
 * REGRAS:
 * 1. anchorActions + keywordTime é a fonte canônica de timing
 * 2. triggerTime em microVisuals NÃO DEVE ser persistido
 * 3. Cada microVisual DEVE ter um anchorAction type='show' correspondente
 * 
 * PROCESSO:
 * 1. Analisar estado BEFORE (contagem de triggerTime e showActions)
 * 2. Para cada microVisual com triggerTime:
 *    - Se não existe anchorAction type='show' para esse microVisual, criar
 *    - Remover campo triggerTime do microVisual
 * 3. Analisar estado AFTER (deve ter hasTriggerTime=false, hasShowActions=true)
 * 
 * @param phases - Array de fases do content
 * @returns Fases normalizadas + estatísticas
 */
function c06NormalizeTriggerContract(
  phases: any[]
): {
  normalizedPhases: any[];
  c06Stats: C06NormalizationStats;
  c06Diff: C06DiffSummary;
} {
  console.log('[C06] c06NormalizeTriggerContract: Starting...');
  console.log(`[C06] Processing ${phases.length} phases`);
  
  // =====================================================================
  // PASSO 1: Análise BEFORE
  // =====================================================================
  let beforeTriggerTimeCount = 0;
  let beforeShowActionCount = 0;
  
  for (const phase of phases) {
    // Contar microVisuals com triggerTime
    if (phase.microVisuals && Array.isArray(phase.microVisuals)) {
      for (const mv of phase.microVisuals) {
        if (mv.triggerTime !== undefined && mv.triggerTime !== null) {
          beforeTriggerTimeCount++;
        }
      }
    }
    
    // Contar anchorActions type='show'
    if (phase.anchorActions && Array.isArray(phase.anchorActions)) {
      for (const aa of phase.anchorActions) {
        if (aa.type === 'show') {
          beforeShowActionCount++;
        }
      }
    }
  }
  
  const triggerContractBefore: C06BeforeAfter = {
    hasTriggerTime: beforeTriggerTimeCount > 0,
    hasShowActions: beforeShowActionCount > 0,
    triggerTimeCount: beforeTriggerTimeCount,
    showActionCount: beforeShowActionCount
  };
  
  console.log(`[C06] BEFORE: triggerTimeCount=${beforeTriggerTimeCount}, showActionCount=${beforeShowActionCount}`);
  
  // =====================================================================
  // PASSO 2: Normalização (deep clone)
  // =====================================================================
  const normalizedPhases: any[] = phases.map(p => JSON.parse(JSON.stringify(p)));
  
  let removedTriggerTimeCount = 0;
  let showActionsCreated = 0;
  let showActionsExisting = 0;
  let microVisualsProcessed = 0;
  let phasesProcessed = 0;
  
  for (const phase of normalizedPhases) {
    if (!phase.microVisuals || !Array.isArray(phase.microVisuals) || phase.microVisuals.length === 0) {
      continue;
    }
    
    phasesProcessed++;
    
    // Garantir que anchorActions existe
    if (!phase.anchorActions) {
      phase.anchorActions = [];
    }
    
    // Criar Set de targetIds existentes para evitar duplicatas
    const existingShowTargets = new Set<string>();
    for (const aa of phase.anchorActions) {
      if (aa.type === 'show' && aa.targetId) {
        existingShowTargets.add(aa.targetId);
        showActionsExisting++;
      }
    }
    
    // Processar cada microVisual
    for (const mv of phase.microVisuals) {
      microVisualsProcessed++;
      
      const mvId = mv.id || `mv-${phase.id}-unknown`;
      const mvTriggerTime = mv.triggerTime;
      const mvAnchorText = mv.anchorText || '';
      
      // 2.1: Se não existe show action para este microVisual, criar
      if (!existingShowTargets.has(mvId)) {
        // Usar keywordTime do triggerTime existente ou null
        const keywordTime = mvTriggerTime ?? null;
        
        const newShowAction = {
          id: `show-${mvId}`,
          keyword: mvAnchorText,
          keywordTime: keywordTime,
          type: 'show',
          targetId: mvId,
          phaseId: phase.id
        };
        
        phase.anchorActions.push(newShowAction);
        showActionsCreated++;
        
        console.log(`[C06] Created show action for "${mvId}" @ ${keywordTime?.toFixed(2) || 'null'}s`);
      }
      
      // 2.2: Remover triggerTime do microVisual
      if (mv.triggerTime !== undefined) {
        delete mv.triggerTime;
        removedTriggerTimeCount++;
        console.log(`[C06] Removed triggerTime from microVisual "${mvId}"`);
      }
    }
  }
  
  // =====================================================================
  // PASSO 3: Análise AFTER
  // =====================================================================
  let afterTriggerTimeCount = 0;
  let afterShowActionCount = 0;
  
  for (const phase of normalizedPhases) {
    if (phase.microVisuals && Array.isArray(phase.microVisuals)) {
      for (const mv of phase.microVisuals) {
        if (mv.triggerTime !== undefined && mv.triggerTime !== null) {
          afterTriggerTimeCount++;
        }
      }
    }
    
    if (phase.anchorActions && Array.isArray(phase.anchorActions)) {
      for (const aa of phase.anchorActions) {
        if (aa.type === 'show') {
          afterShowActionCount++;
        }
      }
    }
  }
  
  const triggerContractAfter: C06BeforeAfter = {
    hasTriggerTime: afterTriggerTimeCount > 0,
    hasShowActions: afterShowActionCount > 0,
    triggerTimeCount: afterTriggerTimeCount,
    showActionCount: afterShowActionCount
  };
  
  console.log(`[C06] AFTER: triggerTimeCount=${afterTriggerTimeCount}, showActionCount=${afterShowActionCount}`);
  
  // Validar resultado esperado
  if (afterTriggerTimeCount > 0) {
    console.error(`[C06] ⚠️ VALIDATION FAILED: Still has ${afterTriggerTimeCount} triggerTime fields!`);
  }
  
  const c06Stats: C06NormalizationStats = {
    triggerContract: 'anchorActions',
    removedTriggerTimeCount,
    showActionsCreated,
    showActionsExisting,
    microVisualsProcessed,
    phasesProcessed
  };
  
  const c06Diff: C06DiffSummary = {
    triggerContractBefore,
    triggerContractAfter,
    removedTriggerTimeCount,
    showActionsCreated
  };
  
  console.log(`[C06] STATS: removed=${removedTriggerTimeCount} triggerTime, created=${showActionsCreated} showActions, existing=${showActionsExisting}`);
  console.log('[C06] c06NormalizeTriggerContract: Complete');
  
  return {
    normalizedPhases,
    c06Stats,
    c06Diff
  };
}

// ============================================================================
// C07: ENSURE PAUSE FOR INTERACTIVE PHASES
// Garante que toda fase interativa tenha ao menos 1 anchorAction type='pause'
// para que o renderer possa habilitar cliques (isPausedByAnchor)
// ============================================================================

interface C07Stats {
  interactivePhases: number;
  phasesWithPause: number;
  phasesWithoutPause: number;
  pausesInserted: number;
  details: Array<{
    phaseId: string;
    phaseType: string;
    hadPause: boolean;
    pauseInserted: boolean;
    insertedPauseKeywordTime: number | null;
  }>;
}

/**
 * C07: Ensure every interactive phase has at least one pause action
 * 
 * REGRAS:
 * 1. Fases com interaction (quiz/cta) ou type='interaction'|'playground' SÃO interativas
 * 2. Se não existe anchorAction type='pause' na fase, inserir um no startTime + ε
 * 3. ID do pause inserido é determinístico: `pause-{phaseId}-c07-auto`
 * 4. Keyword é "auto" para diferenciar de pauses manuais
 * 
 * @param phases - Array de fases do content
 * @returns Fases com pauses garantidos + estatísticas
 */
/**
 * C07.2 + C09 - Pause at Last Word
 * =================================
 * Garante que fases interativas tenham pauseAction NO FIM DA ÚLTIMA PALAVRA:
 * 
 * - QUIZ/PLAYGROUND/INTERACTION: Pause NO FIM da última palavra da fase
 *   pauseTime = min(lastWordEnd + 0.15, phase.endTime)
 *   Isso GARANTE que toda a narração toque COMPLETA antes de pausar
 * 
 * ============================================================================
 * C10 HARD PAUSE ANCHOR CONTRACT (2026-02-07) + C10B EDITORIAL VALIDATION
 * ============================================================================
 * 
 * REGRA MESTRE: Pausas em fases interativas são 100% DETERMINÍSTICAS.
 * 
 * A) anchorText.pauseAt do input é OBRIGATÓRIO para fases interativas
 * B) pauseAt deve existir literalmente na narração da fase
 * C) pauseTime = END da palavra encontrada (LAST_IN_RANGE)
 * D) Se não encontrar → throw PAUSE_ANCHOR_NOT_FOUND (run FALHA)
 * E) ZERO heurísticas (removido: endTime-0.20, pause-near-end, clamps)
 * 
 * C10B EDITORIAL VALIDATION (v1.1):
 * F) pauseAt DEVE estar nos últimos 1.5s da narração da fase
 * G) Se pauseTime < (lastWordEnd - 1.5s) → FAIL com PAUSE_ANCHOR_NOT_AT_END
 * H) Isso garante que o usuário não perde narração importante
 * 
 * CTA: Exceção - botão deve ser clicável SEMPRE (pause opcional)
 */
const C10B_MAX_NARRATION_AFTER_PAUSE = 1.5; // Max 1.5s of narration after pause

function c07EnsurePauseForInteractivePhases(
  phases: any[],
  wordTimestamps: WordTimestamp[] = [],
  inputScenes: any[] = [] // ← C10: Receber scenes do input para pegar pauseAt original
): {
  updatedPhases: any[];
  c07Stats: C07Stats;
} {
  console.log('[C10] c07EnsurePauseForInteractivePhases: Starting (HARD PAUSE ANCHOR CONTRACT v1.1 + C10B)...');
  console.log(`[C10] Processing ${phases.length} phases, ${wordTimestamps.length} wordTimestamps, ${inputScenes.length} inputScenes`);
  
  const c07Stats: C07Stats = {
    interactivePhases: 0,
    phasesWithPause: 0,
    phasesWithoutPause: 0,
    pausesInserted: 0,
    details: []
  };
  
  // Extended stats for C10
  let c10HardPauses = 0;
  let c10bViolations = 0;
  let ctaPhases = 0;
  
  // Tipos de fase que são interativas (exceto CTA que é tratado separadamente)
  const INTERACTIVE_PHASE_TYPES = ['interaction', 'playground', 'quiz'];
  const CTA_PHASE_TYPES = ['cta'];
  
  // Build scene lookup map by ID for fast access
  const sceneMap = new Map<string, any>();
  inputScenes.forEach(scene => {
    if (scene.id) sceneMap.set(scene.id, scene);
  });
  
  // Deep clone para não mutar o original
  const updatedPhases: any[] = phases.map(p => JSON.parse(JSON.stringify(p)));
  
  for (const phase of updatedPhases) {
    // Determinar se a fase é interativa
    const isInteractiveByType = INTERACTIVE_PHASE_TYPES.includes(phase.type);
    const isCTAByType = CTA_PHASE_TYPES.includes(phase.type);
    const hasInteractionContent = phase.interaction !== undefined && phase.interaction !== null;
    const isInteractive = isInteractiveByType || hasInteractionContent;
    
    // CTA: não precisa de pause obrigatório (botão sempre clicável)
    if (isCTAByType) {
      ctaPhases++;
      console.log(`[C10] Phase "${phase.id}" is CTA - pause optional (button always clickable)`);
      continue;
    }
    
    if (!isInteractive) {
      continue; // Pular fases não interativas
    }
    
    c07Stats.interactivePhases++;
    
    // Garantir que anchorActions existe
    if (!phase.anchorActions) {
      phase.anchorActions = [];
    }
    
    const startTime = phase.startTime ?? 0;
    const endTime = phase.endTime ?? startTime + 1;
    
    // ============================================================================
    // C10 RULE A: Buscar anchorText.pauseAt do INPUT ORIGINAL
    // ============================================================================
    const inputScene = sceneMap.get(phase.id);
    const pauseAtKeyword = inputScene?.anchorText?.pauseAt;
    
    // ============================================================================
    // C10 RULE B: Encontrar pause existente (do generatePhases)
    // ============================================================================
    const existingPauseIndex = phase.anchorActions.findIndex(
      (aa: any) => aa.type === 'pause'
    );
    const existingPause = existingPauseIndex >= 0 ? phase.anchorActions[existingPauseIndex] : null;
    
    const detail: C07Stats['details'][0] = {
      phaseId: phase.id,
      phaseType: phase.type,
      hadPause: existingPause !== null,
      pauseInserted: false,
      insertedPauseKeywordTime: null
    };
    
    // ============================================================================
    // C10 RULE C: Calcular pauseTime DETERMINÍSTICO
    // Usar LAST_IN_RANGE + END time da palavra
    // ============================================================================
    if (existingPause && existingPause.keywordTime > 0) {
      // Já tem pause calculado em generatePhases - validar
      const pauseTime = existingPause.keywordTime;
      const isInRange = pauseTime >= startTime && pauseTime <= endTime;
      
      if (isInRange) {
        // ============================================================================
        // C10B EDITORIAL VALIDATION: pauseAt DEVE estar nos últimos 1.5s da narração
        // ============================================================================
        // IMPORTANTE: Usar a narração ORIGINAL da cena para calcular lastWordEnd
        // Isso evita o problema de boundary onde endTime inclui palavras da próxima cena
        const sceneNarration = inputScene?.narration || '';
        const sceneNarrationWords = sceneNarration.split(/\s+/).filter((w: string) => w.length > 0);
        const wordCountFromNarration = sceneNarrationWords.length;
        
        // Encontrar as palavras desta cena nos wordTimestamps usando busca sequencial
        // Começar de startTime e pegar apenas as N palavras da narração original
        let wordsForThisScene: WordTimestamp[] = [];
        let foundStartIndex = -1;
        
        // Encontrar a primeira palavra da cena (mais próxima de startTime)
        for (let i = 0; i < wordTimestamps.length; i++) {
          if (wordTimestamps[i].start >= startTime - 0.5) {
            foundStartIndex = i;
            break;
          }
        }
        
        if (foundStartIndex >= 0 && wordCountFromNarration > 0) {
          // Pegar exatamente N palavras a partir do índice encontrado
          wordsForThisScene = wordTimestamps.slice(foundStartIndex, foundStartIndex + wordCountFromNarration);
        }
        
        const lastWordEnd = wordsForThisScene.length > 0 
          ? Math.max(...wordsForThisScene.map(wt => wt.end)) 
          : endTime;
        const narrationAfterPause = lastWordEnd - pauseTime;
        
        console.log(`[C10B] Phase "${phase.id}": sceneWords=${wordCountFromNarration}, wordsFound=${wordsForThisScene.length}, pauseTime=${pauseTime.toFixed(3)}s, lastWordEnd=${lastWordEnd.toFixed(3)}s, delta=${narrationAfterPause.toFixed(3)}s`);
        
        // Se há mais de 1.5s de narração APÓS o pauseAt, é erro editorial
        if (narrationAfterPause > C10B_MAX_NARRATION_AFTER_PAUSE) {
          c10bViolations++;
          console.error(`[C10B][ERROR] Phase "${phase.id}": existing pause is NOT at end of narration!`);
          console.error(`[C10B][ERROR]   pauseTime=${pauseTime.toFixed(3)}s, lastWordEnd=${lastWordEnd.toFixed(3)}s, delta=${narrationAfterPause.toFixed(3)}s > ${C10B_MAX_NARRATION_AFTER_PAUSE}s`);
          
          // Encontrar as palavras que serão cortadas
          const wordsCut = wordsForThisScene.filter(wt => wt.start > pauseTime).map(wt => wt.word);
          
          throw new Error(JSON.stringify({
            error_code: 'PAUSE_ANCHOR_NOT_AT_END',
            error_details: {
              phase_id: phase.id,
              pauseAt: existingPause.keyword,
              pauseTime,
              lastWordEnd,
              narrationAfterPause,
              maxAllowed: C10B_MAX_NARRATION_AFTER_PAUSE,
              wordCountExpected: wordCountFromNarration,
              wordCountFound: wordsForThisScene.length,
              wordsCut: wordsCut.slice(0, 10),
              fix: `Move pauseAt to a word near ${lastWordEnd.toFixed(2)}s or split narration into separate scenes`
            }
          }));
        }
        
        // ✅ C10: Pause existente está OK - marcar como C10 validated
        phase.anchorActions[existingPauseIndex] = {
          ...existingPause,
          c10Validated: true,
          c10Version: '1.1',
          c10bValidated: true,
          c10bNarrationAfterPause: narrationAfterPause,
          c07Reason: 'C10_HARD_PAUSE_ANCHOR'
        };
        
        c07Stats.phasesWithPause++;
        c10HardPauses++;
        detail.insertedPauseKeywordTime = pauseTime;
        
        console.log(`[C10] Phase "${phase.id}": Validated existing pause @ ${pauseTime.toFixed(3)}s (keyword="${existingPause.keyword}") [C10B OK: ${narrationAfterPause.toFixed(3)}s after]`);
      } else {
        // Pause existente está fora do range - recalcular
        console.warn(`[C10] Phase "${phase.id}": Existing pause @ ${pauseTime.toFixed(3)}s is OUT OF RANGE [${startTime.toFixed(3)}, ${endTime.toFixed(3)}]`);
        
        if (pauseAtKeyword && wordTimestamps.length > 0) {
          const result = selectAnchorOccurrence(pauseAtKeyword, wordTimestamps, startTime, endTime, 'LAST_IN_RANGE');
          
          if (result.selectedTime !== null) {
            phase.anchorActions[existingPauseIndex] = {
              ...existingPause,
              keyword: pauseAtKeyword,
              keywordTime: result.selectedTime,
              timestamp: result.selectedTime,
              c10Validated: true,
              c10Version: '1.0',
              c07Reason: 'C10_RECALCULATED'
            };
            
            c07Stats.phasesWithPause++;
            c10HardPauses++;
            detail.pauseInserted = true;
            detail.insertedPauseKeywordTime = result.selectedTime;
            
            console.log(`[C10] Phase "${phase.id}": Recalculated pause @ ${result.selectedTime.toFixed(3)}s (keyword="${pauseAtKeyword}")`);
          } else {
            // ============================================================================
            // ✅ R06 FIX: Verificar se a palavra existe globalmente antes de falhar
            // ============================================================================
            const globalResult = selectAnchorOccurrence(pauseAtKeyword, wordTimestamps, 0, Infinity, 'LAST_IN_RANGE');
            
            if (globalResult.selectedTime !== null) {
              // A palavra existe no áudio mas fora do range da fase
              console.error(`[C10][ERROR] Phase "${phase.id}": pauseAt="${pauseAtKeyword}" exists @ ${globalResult.selectedTime.toFixed(3)}s but is OUTSIDE phase range [${startTime.toFixed(3)}, ${endTime.toFixed(3)}]`);
              
              throw new Error(JSON.stringify({
                error_code: 'PAUSE_ANCHOR_NOT_AT_END',
                error_details: {
                  phase_id: phase.id,
                  pauseAt: pauseAtKeyword,
                  pauseTime: globalResult.selectedTime,
                  globalMatch: true,
                  foundInPhaseRange: false,
                  phaseRange: [startTime, endTime],
                  fix: `The pauseAt word "${pauseAtKeyword}" exists at ${globalResult.selectedTime.toFixed(2)}s but is outside the phase range.`
                }
              }));
            }
            
            // Keyword realmente não existe
            console.error(`[C10][ERROR] Phase "${phase.id}": pauseAt="${pauseAtKeyword}" NOT FOUND anywhere in audio`);
            throw new Error(JSON.stringify({
              error_code: 'PAUSE_ANCHOR_NOT_FOUND',
              error_details: {
                phase_id: phase.id,
                pauseAt: pauseAtKeyword,
                startTime,
                endTime,
                globalSearch: true,
                message: `The word "${pauseAtKeyword}" does not exist anywhere in the audio wordTimestamps`
              }
            }));
          }
        } else {
          // Sem pauseAt no input e pause existente inválido
          console.warn(`[C10] Phase "${phase.id}": No pauseAt in input and existing pause invalid - keeping as-is`);
          c07Stats.phasesWithoutPause++;
        }
      }
    } else if (pauseAtKeyword && wordTimestamps.length > 0) {
      // Não tem pause existente, mas tem pauseAt no input - calcular
      const result = selectAnchorOccurrence(pauseAtKeyword, wordTimestamps, startTime, endTime, 'LAST_IN_RANGE');
      
      if (result.selectedTime !== null) {
        const pauseTime = result.selectedTime;
        
        // ============================================================================
        // C10B EDITORIAL VALIDATION: pauseAt DEVE estar nos últimos 1.5s da narração
        // ============================================================================
        // IMPORTANTE: Usar a narração ORIGINAL da cena para calcular lastWordEnd
        const sceneNarration = inputScene?.narration || '';
        const sceneNarrationWords = sceneNarration.split(/\s+/).filter((w: string) => w.length > 0);
        const wordCountFromNarration = sceneNarrationWords.length;
        
        // Encontrar as palavras desta cena nos wordTimestamps usando busca sequencial
        let wordsForThisScene: WordTimestamp[] = [];
        let foundStartIndex = -1;
        
        for (let i = 0; i < wordTimestamps.length; i++) {
          if (wordTimestamps[i].start >= startTime - 0.5) {
            foundStartIndex = i;
            break;
          }
        }
        
        if (foundStartIndex >= 0 && wordCountFromNarration > 0) {
          wordsForThisScene = wordTimestamps.slice(foundStartIndex, foundStartIndex + wordCountFromNarration);
        }
        
        const lastWordEnd = wordsForThisScene.length > 0 
          ? Math.max(...wordsForThisScene.map(wt => wt.end)) 
          : endTime;
        const narrationAfterPause = lastWordEnd - pauseTime;
        
        console.log(`[C10B] Phase "${phase.id}": sceneWords=${wordCountFromNarration}, wordsFound=${wordsForThisScene.length}, pauseTime=${pauseTime.toFixed(3)}s, lastWordEnd=${lastWordEnd.toFixed(3)}s, delta=${narrationAfterPause.toFixed(3)}s`);
        
        // Se há mais de 1.5s de narração APÓS o pauseAt, é erro editorial
        if (narrationAfterPause > C10B_MAX_NARRATION_AFTER_PAUSE) {
          c10bViolations++;
          console.error(`[C10B][ERROR] Phase "${phase.id}": pauseAt="${pauseAtKeyword}" is NOT at end of narration!`);
          console.error(`[C10B][ERROR]   pauseTime=${pauseTime.toFixed(3)}s, lastWordEnd=${lastWordEnd.toFixed(3)}s, delta=${narrationAfterPause.toFixed(3)}s > ${C10B_MAX_NARRATION_AFTER_PAUSE}s`);
          
          // Encontrar as palavras que serão cortadas para ajudar o autor a corrigir
          const wordsCut = wordsForThisScene.filter(wt => wt.start > pauseTime).map(wt => wt.word);
          
          throw new Error(JSON.stringify({
            error_code: 'PAUSE_ANCHOR_NOT_AT_END',
            error_details: {
              phase_id: phase.id,
              pauseAt: pauseAtKeyword,
              pauseTime,
              lastWordEnd,
              narrationAfterPause,
              maxAllowed: C10B_MAX_NARRATION_AFTER_PAUSE,
              wordCountExpected: wordCountFromNarration,
              wordCountFound: wordsForThisScene.length,
              wordsCut: wordsCut.slice(0, 10),
              fix: `Move pauseAt to a word near ${lastWordEnd.toFixed(2)}s or split narration into separate scenes`
            }
          }));
        }
        
        const newPauseAction = {
          id: `pause-${phase.id}-c10`,
          keyword: pauseAtKeyword,
          keywordTime: pauseTime,
          timestamp: pauseTime,
          type: 'pause',
          phaseId: phase.id,
          c10Generated: true,
          c10Version: '1.1',
          c10bValidated: true,
          c10bNarrationAfterPause: narrationAfterPause,
          c07Reason: 'C10_HARD_PAUSE_ANCHOR'
        };
        
        phase.anchorActions.push(newPauseAction);
        c07Stats.pausesInserted++;
        c07Stats.phasesWithPause++;
        c10HardPauses++;
        detail.pauseInserted = true;
        detail.insertedPauseKeywordTime = pauseTime;
        
        console.log(`[C10] Phase "${phase.id}": Created pause @ ${pauseTime.toFixed(3)}s (keyword="${pauseAtKeyword}") [C10B OK: ${narrationAfterPause.toFixed(3)}s after]`);
      } else {
        // ============================================================================
        // ✅ R06 FIX: Antes de falhar como NOT_FOUND, verificar se a palavra existe
        // GLOBALMENTE no áudio. Se existir, é um problema de timing (NOT_AT_END),
        // não de matching (NOT_FOUND).
        // ============================================================================
        const globalResult = selectAnchorOccurrence(pauseAtKeyword, wordTimestamps, 0, Infinity, 'LAST_IN_RANGE');
        
        if (globalResult.selectedTime !== null) {
          // A palavra EXISTE no áudio, mas está fora do range da fase
          // Isso significa que é um problema de timing/editorial, não de matching
          console.error(`[C10][ERROR] Phase "${phase.id}": pauseAt="${pauseAtKeyword}" exists @ ${globalResult.selectedTime.toFixed(3)}s but is OUTSIDE phase range [${startTime.toFixed(3)}, ${endTime.toFixed(3)}]`);
          
          // Calcular lastWordEnd para contexto
          const sceneNarration = inputScene?.narration || '';
          const sceneNarrationWords = sceneNarration.split(/\s+/).filter((w: string) => w.length > 0);
          const wordCountFromNarration = sceneNarrationWords.length;
          
          let wordsForThisScene: WordTimestamp[] = [];
          let foundStartIndex = -1;
          for (let i = 0; i < wordTimestamps.length; i++) {
            if (wordTimestamps[i].start >= startTime - 0.5) {
              foundStartIndex = i;
              break;
            }
          }
          if (foundStartIndex >= 0 && wordCountFromNarration > 0) {
            wordsForThisScene = wordTimestamps.slice(foundStartIndex, foundStartIndex + wordCountFromNarration);
          }
          
          const lastWordEnd = wordsForThisScene.length > 0 
            ? Math.max(...wordsForThisScene.map(wt => wt.end)) 
            : endTime;
          const narrationAfterPause = lastWordEnd - globalResult.selectedTime;
          
          throw new Error(JSON.stringify({
            error_code: 'PAUSE_ANCHOR_NOT_AT_END',
            error_details: {
              phase_id: phase.id,
              pauseAt: pauseAtKeyword,
              pauseTime: globalResult.selectedTime,
              globalMatch: true,
              foundInPhaseRange: false,
              phaseRange: [startTime, endTime],
              lastWordEnd,
              narrationAfterPause,
              maxAllowed: C10B_MAX_NARRATION_AFTER_PAUSE,
              fix: `The pauseAt word "${pauseAtKeyword}" exists at ${globalResult.selectedTime.toFixed(2)}s but is outside the phase range. Move it to a word within [${startTime.toFixed(2)}s, ${endTime.toFixed(2)}s] or adjust phase boundaries.`
            }
          }));
        }
        
        // ✅ C10 RULE D: Keyword realmente não existe no áudio → FAIL
        console.error(`[C10][ERROR] Phase "${phase.id}": pauseAt="${pauseAtKeyword}" NOT FOUND anywhere in audio`);
        throw new Error(JSON.stringify({
          error_code: 'PAUSE_ANCHOR_NOT_FOUND',
          error_details: {
            phase_id: phase.id,
            pauseAt: pauseAtKeyword,
            startTime,
            endTime,
            globalSearch: true,
            message: `The word "${pauseAtKeyword}" does not exist anywhere in the audio wordTimestamps`
          }
        }));
      }
    } else {
      // ============================================================================
      // C10 RULE A: Sem pauseAt e sem pause existente
      // - Se temos inputScenes (CREATE mode) → FAIL (pauseAt é obrigatório)
      // - Se não temos inputScenes (REPROCESS mode) → WARNING (tolerante)
      // ============================================================================
      const isCreateMode = inputScenes.length > 0;
      
      if (isCreateMode && !pauseAtKeyword) {
        console.error(`[C10][ERROR] Phase "${phase.id}" (${phase.type}) is INTERACTIVE but has NO anchorText.pauseAt in input!`);
        throw new Error(JSON.stringify({
          error_code: 'PAUSE_ANCHOR_REQUIRED',
          error_details: {
            phase_id: phase.id,
            phase_type: phase.type,
            message: 'Interactive phases MUST have anchorText.pauseAt in input'
          }
        }));
      }
      
      // REPROCESS mode without pauseAt: tolerante - apenas warning
      console.warn(`[C10] Phase "${phase.id}": No pauseAt and no existing pause - REPROCESS mode, skipping (legacy content)`);
      c07Stats.phasesWithoutPause++;
    }
    
    c07Stats.details.push(detail);
  }
  
  console.log(`[C10] STATS: interactive=${c07Stats.interactivePhases}, hardPauses=${c10HardPauses}, c10bViolations=${c10bViolations}, inserted=${c07Stats.pausesInserted}, cta=${ctaPhases}`);
  console.log('[C10] c07EnsurePauseForInteractivePhases: Complete (v1.1 + C10B)');
  
  return {
    updatedPhases,
    c07Stats
  };
}

// ============================================================================
// C03: PHASE TIMING CORRECTION
// Corrige fases com duração negativa/zero durante reprocess
// ============================================================================

interface C03TimingStats {
  t3Negative: number;      // Fases com endTime < startTime (BEFORE)
  t3Zero: number;          // Fases com endTime = startTime (BEFORE)
  t3Micro: number;         // Fases interativas com duration < 5s (BEFORE)
  t3NegativeAfter: number; // Após correção (deve ser 0)
  t3ZeroAfter: number;     // Após correção (deve ser 0)
  t3MicroAfter: number;    // Após correção (deve ser 0)
  t3Fixed: number;         // Total de fases com correção REAL aplicada
  audioDuration: number;   // Duração total do áudio para contexto
  phaseTimingChanges: Array<{
    phaseId: string;
    phaseType: string;
    oldStartTime: number;
    oldEndTime: number;
    oldDuration: number;
    newStartTime: number;
    newEndTime: number;
    newDuration: number;
    fixApplied: 'NEGATIVE_FIX' | 'ZERO_FIX' | 'MICRO_FIX' | 'OVERLAP_FIX' | 'LAST_PHASE_FIX' | 'NONE';
    reason: string;
  }>;
}

/**
 * C03: Recalcula e corrige timings de fases com durações inválidas
 * 
 * Regras:
 * - R1: endTime DEVE ser > startTime (nunca negativo ou zero)
 * - R2: Fases interativas DEVEM ter duração >= 5.0s
 * - R3: Fases não sobrepostas: Phase[N].endTime <= Phase[N+1].startTime
 * - R4: Última fase termina em totalAudioDuration
 * 
 * @param phases - Array de fases do content
 * @param totalAudioDuration - Duração total do áudio
 * @returns Fases corrigidas + estatísticas
 */
function recalculatePhaseTimings(
  phases: any[],
  totalAudioDuration: number
): {
  updatedPhases: any[];
  c03Stats: C03TimingStats;
} {
  console.log('[C03] recalculatePhaseTimings: Starting...');
  console.log(`[C03] Total phases: ${phases.length}, Audio duration: ${totalAudioDuration.toFixed(2)}s`);
  
  const c03Stats: C03TimingStats = {
    t3Negative: 0,
    t3Zero: 0,
    t3Micro: 0,
    t3NegativeAfter: 0,
    t3ZeroAfter: 0,
    t3MicroAfter: 0,
    t3Fixed: 0,
    audioDuration: totalAudioDuration,
    phaseTimingChanges: []
  };
  
  // Primeiro passo: Identificar problemas (BEFORE metrics)
  for (const phase of phases) {
    const duration = (phase.endTime || 0) - (phase.startTime || 0);
    const isInteractive = ['interaction', 'playground', 'quiz', 'secret-reveal'].includes(phase.type);
    
    if (duration < 0) {
      c03Stats.t3Negative++;
      console.log(`[C03] ⚠️ NEGATIVE: "${phase.id}" duration=${duration.toFixed(2)}s (${phase.startTime?.toFixed(2)}s - ${phase.endTime?.toFixed(2)}s)`);
    } else if (duration === 0) {
      c03Stats.t3Zero++;
      console.log(`[C03] ⚠️ ZERO: "${phase.id}" duration=0s`);
    } else if (isInteractive && duration < 5.0) {
      c03Stats.t3Micro++;
      console.log(`[C03] ⚠️ MICRO: Interactive "${phase.id}" duration=${duration.toFixed(2)}s < 5.0s`);
    }
  }
  
  console.log(`[C03] BEFORE: T3_NEGATIVE=${c03Stats.t3Negative}, T3_ZERO=${c03Stats.t3Zero}, T3_MICRO=${c03Stats.t3Micro}`);
  
  // Segundo passo: Corrigir fases (deep clone)
  const updatedPhases: any[] = phases.map(p => JSON.parse(JSON.stringify(p)));
  
  // Ordenar por startTime para garantir sequência correta
  updatedPhases.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
  
  let lastValidEndTime = 0;
  
  for (let i = 0; i < updatedPhases.length; i++) {
    const phase = updatedPhases[i];
    const nextPhase = i < updatedPhases.length - 1 ? updatedPhases[i + 1] : null;
    const isLastPhase = i === updatedPhases.length - 1;
    const isInteractive = ['interaction', 'playground', 'quiz', 'secret-reveal'].includes(phase.type);
    
    const oldStartTime = phase.startTime || 0;
    const oldEndTime = phase.endTime || 0;
    const oldDuration = oldEndTime - oldStartTime;
    
    let newStartTime = oldStartTime;
    let newEndTime = oldEndTime;
    let fixApplied: C03TimingStats['phaseTimingChanges'][0]['fixApplied'] = 'NONE';
    let fixReason = '';
    
    // ✅ C03 FIX: Se startTime > totalAudioDuration, precisamos ajustar
    // Isso acontece quando a fase foi calculada incorretamente
    if (newStartTime >= totalAudioDuration) {
      // Colocar no final do áudio com duração mínima
      const minDuration = isInteractive ? 5.0 : 1.0;
      newStartTime = Math.max(lastValidEndTime + 0.05, totalAudioDuration - minDuration);
      newEndTime = totalAudioDuration;
      fixApplied = 'NEGATIVE_FIX';
      fixReason = `startTime (${oldStartTime.toFixed(2)}s) > audioDuration (${totalAudioDuration.toFixed(2)}s)`;
      console.log(`[C03] FIX BEYOND_AUDIO: "${phase.id}" startTime ${oldStartTime.toFixed(2)}s > audioEnd ${totalAudioDuration.toFixed(2)}s`);
      console.log(`[C03] FIX BEYOND_AUDIO: Adjusted to ${newStartTime.toFixed(2)}s - ${newEndTime.toFixed(2)}s`);
    }
    
    // R3: Garantir que não há overlap com fase anterior
    if (newStartTime < lastValidEndTime && fixApplied === 'NONE') {
      newStartTime = lastValidEndTime + 0.05; // 50ms gap
      fixApplied = 'OVERLAP_FIX';
      fixReason = `overlap com fase anterior (lastEnd=${lastValidEndTime.toFixed(2)}s)`;
      console.log(`[C03] FIX OVERLAP: "${phase.id}" startTime ${oldStartTime.toFixed(2)}s → ${newStartTime.toFixed(2)}s`);
    }
    
    // Calcular maxEndTime (limite para não sobrepor próxima fase)
    const maxEndTime = nextPhase ? (nextPhase.startTime || totalAudioDuration) : totalAudioDuration;
    
    // R1: Corrigir duração negativa ou zero (se ainda não foi corrigido)
    let currentDuration = newEndTime - newStartTime;
    
    if (currentDuration < 0 && fixApplied === 'NONE') {
      // NEGATIVE: endTime < startTime
      // Solução: usar mínimo entre maxEndTime e startTime + duração mínima
      const minDuration = isInteractive ? 5.0 : 1.0;
      newEndTime = Math.min(newStartTime + minDuration, maxEndTime);
      fixApplied = 'NEGATIVE_FIX';
      fixReason = `endTime (${oldEndTime.toFixed(2)}s) < startTime (${newStartTime.toFixed(2)}s)`;
      console.log(`[C03] FIX NEGATIVE: "${phase.id}" endTime ${oldEndTime.toFixed(2)}s → ${newEndTime.toFixed(2)}s`);
    } else if (currentDuration === 0) {
      // ZERO: endTime = startTime
      const minDuration = isInteractive ? 5.0 : 1.0;
      newEndTime = Math.min(newStartTime + minDuration, maxEndTime);
      fixApplied = 'ZERO_FIX';
      fixReason = `duration=0 (startTime=endTime=${oldStartTime.toFixed(2)}s)`;
      console.log(`[C03] FIX ZERO: "${phase.id}" endTime ${oldEndTime.toFixed(2)}s → ${newEndTime.toFixed(2)}s`);
    }
    
    // R2: Garantir duração mínima para interativas
    currentDuration = newEndTime - newStartTime;
    if (isInteractive && currentDuration < 5.0 && fixApplied === 'NONE') {
      newEndTime = Math.min(newStartTime + 5.0, maxEndTime);
      fixApplied = 'MICRO_FIX';
      fixReason = `interactive duration (${currentDuration.toFixed(2)}s) < 5.0s`;
      console.log(`[C03] FIX MICRO: Interactive "${phase.id}" endTime ${oldEndTime.toFixed(2)}s → ${newEndTime.toFixed(2)}s`);
    }
    
    // R4: Última fase termina no fim do áudio
    if (isLastPhase && Math.abs(newEndTime - totalAudioDuration) > 0.01) {
      const oldEndBeforeLastFix = newEndTime;
      newEndTime = totalAudioDuration;
      if (fixApplied === 'NONE') {
        fixApplied = 'LAST_PHASE_FIX';
        fixReason = `última fase: endTime (${oldEndBeforeLastFix.toFixed(2)}s) → audioDuration (${totalAudioDuration.toFixed(2)}s)`;
      }
      console.log(`[C03] LAST PHASE: "${phase.id}" endTime ${oldEndBeforeLastFix.toFixed(2)}s → ${totalAudioDuration.toFixed(2)}s`);
    }
    
    // Aplicar correções
    phase.startTime = newStartTime;
    phase.endTime = newEndTime;
    
    const newDuration = newEndTime - newStartTime;
    
    // ✅ C03.1: Só registrar mudança se houve fix REAL (não NONE com delta negligível)
    const hasRealChange = fixApplied !== 'NONE';
    const hasSignificantDelta = Math.abs(oldStartTime - newStartTime) > 0.01 || Math.abs(oldEndTime - newEndTime) > 0.01;
    
    if (hasRealChange) {
      c03Stats.t3Fixed++;
      c03Stats.phaseTimingChanges.push({
        phaseId: phase.id,
        phaseType: phase.type,
        oldStartTime,
        oldEndTime,
        oldDuration,
        newStartTime,
        newEndTime,
        newDuration,
        fixApplied,
        reason: fixReason
      });
    } else if (hasSignificantDelta) {
      // Delta sem fix explícito - registrar mas não contar como t3Fixed
      c03Stats.phaseTimingChanges.push({
        phaseId: phase.id,
        phaseType: phase.type,
        oldStartTime,
        oldEndTime,
        oldDuration,
        newStartTime,
        newEndTime,
        newDuration,
        fixApplied: 'NONE',
        reason: 'delta < threshold (não contabilizado em t3Fixed)'
      });
    }
    
    // Atualizar lastValidEndTime para próxima iteração
    lastValidEndTime = newEndTime;
  }
  
  // ✅ C03.1: Calcular métricas AFTER
  for (const phase of updatedPhases) {
    const duration = (phase.endTime || 0) - (phase.startTime || 0);
    const isInteractive = ['interaction', 'playground', 'quiz', 'secret-reveal'].includes(phase.type);
    
    if (duration < 0) {
      c03Stats.t3NegativeAfter++;
    } else if (duration === 0) {
      c03Stats.t3ZeroAfter++;
    } else if (isInteractive && duration < 5.0) {
      c03Stats.t3MicroAfter++;
    }
  }
  
  console.log(`[C03] AFTER: T3_FIXED=${c03Stats.t3Fixed}, T3_NEGATIVE_AFTER=${c03Stats.t3NegativeAfter}, T3_ZERO_AFTER=${c03Stats.t3ZeroAfter}, T3_MICRO_AFTER=${c03Stats.t3MicroAfter}`);
  console.log('[C03] recalculatePhaseTimings: Complete');
  
  return {
    updatedPhases,
    c03Stats
  };
}

/**
 * ✅ Backward-compatible wrapper (FIRST_IN_RANGE for microVisuals)
 * @param keyword - Palavra-chave a buscar
 * @param wordTimestamps - Array de timestamps
 * @param afterTime - Tempo mínimo (início do range)
 * @param beforeTime - Tempo máximo (fim do range)
 * @returns start time da keyword ou null
 */
function findKeywordTime(
  keyword: string,
  wordTimestamps: WordTimestamp[],
  afterTime: number = 0,
  beforeTime: number = Infinity
): number | null {
  const result = selectAnchorOccurrence(keyword, wordTimestamps, afterTime, beforeTime, 'FIRST_IN_RANGE');
  // Return START time for backward compatibility with microVisuals
  if (result.selectedTime !== null && result.allMatches.length > 0) {
    return result.allMatches[result.selectedIndex].start;
  }
  return null;
}

function findNarrationRange(
  narration: string,
  wordTimestamps: WordTimestamp[],
  startSearchIndex: number
): { startIdx: number; endIdx: number; startTime: number; endTime: number } | null {
  const narrationWords = narration.split(/\s+/).map(normalizeWord).filter(w => w.length > 0);

  if (narrationWords.length === 0) return null;

  // Encontrar primeira palavra
  let startIdx = -1;
  for (let i = startSearchIndex; i < wordTimestamps.length; i++) {
    if (normalizeWord(wordTimestamps[i].word) === narrationWords[0]) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) return null;

  // ✅ FASE 6 FIX: Encontrar ÚLTIMA palavra da narração com busca mais ampla
  // Antes: buscava apenas em estimatedEndIdx, falhava em narrações longas
  const estimatedEndIdx = Math.min(startIdx + narrationWords.length + 20, wordTimestamps.length - 1);
  let endIdx = startIdx;

  const lastNarrationWord = narrationWords[narrationWords.length - 1];

  // Buscar a última palavra começando do fim estimado até o startIdx
  for (let i = estimatedEndIdx; i >= startIdx; i--) {
    if (normalizeWord(wordTimestamps[i].word) === lastNarrationWord) {
      endIdx = i;
      break;
    }
  }

  // ✅ FASE 6 FIX: Se não encontrou, tentar buscar palavras próximas do fim da narração
  if (endIdx === startIdx && narrationWords.length > 3) {
    // Tentar penúltima ou antepenúltima palavra
    for (let wordOffset = 2; wordOffset <= 4; wordOffset++) {
      const alternateWord = narrationWords[narrationWords.length - wordOffset];
      if (!alternateWord) continue;

      for (let i = estimatedEndIdx; i >= startIdx; i--) {
        if (normalizeWord(wordTimestamps[i].word) === alternateWord) {
          endIdx = i + wordOffset - 1; // Ajustar para incluir palavras restantes
          if (endIdx >= wordTimestamps.length) endIdx = wordTimestamps.length - 1;
          console.log(`[findNarrationRange] ✅ Found alternate end word "${alternateWord}" at idx ${i}, adjusted endIdx to ${endIdx}`);
          break;
        }
      }
      if (endIdx > startIdx) break;
    }
  }

  // ✅ FASE 6 FIX: Margem maior para garantir que a narração completa seja incluída
  const marginAfterEnd = 0.5; // 500ms de margem

  return {
    startIdx,
    endIdx,
    startTime: wordTimestamps[startIdx].start,
    endTime: wordTimestamps[endIdx].end + marginAfterEnd,
  };
}

// ============================================================================
// GERAÇÃO DE FASES
// ============================================================================

function generatePhases(
  scenes: ScriptScene[],
  wordTimestamps: WordTimestamp[],
  totalDuration: number
): Phase[] {
  const phases: Phase[] = [];
  let lastSearchIdx = 0;

  console.log(`\n[Phases] ✅ FASE 6: Generating ${scenes.length} phases from ${wordTimestamps.length} words`);

  for (const scene of scenes) {
    console.log(`\n[Phase] ${scene.id} (${scene.type})`);

    // Encontrar range da narração
    const range = findNarrationRange(scene.narration, wordTimestamps, lastSearchIdx);

    let startTime: number;
    let endTime: number;

    if (range) {
      // ✅ FASE 6 FIX: USAR O startTime REAL da narração!
      // ANTES: startTime = Math.max(range.startTime, lastEndTime) ← ERRADO! Pulava início
      // AGORA: startTime = range.startTime ← CORRETO! Mantém posição real no áudio
      startTime = range.startTime;
      endTime = range.endTime;
      lastSearchIdx = range.endIdx + 1;
      console.log(`[Phase] ✅ REAL Timing: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`);
    } else {
      // Fallback: estimar baseado em palavras
      const wordCount = scene.narration.split(/\s+/).length;
      const estimatedDuration = wordCount / 2.5;
      // Para fallback, usar o endTime da última fase (se existir)
      const lastPhase = phases[phases.length - 1];
      startTime = lastPhase ? lastPhase.endTime : 0;
      endTime = startTime + estimatedDuration;
      console.warn(`[Phase] ⚠️ Using estimated timing: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`);
    }

    // Anchor Actions
    const anchorActions: AnchorAction[] = [];

    // ✅ CONTRATO CONGELADO v1.0: Usar constante GLOBAL (definida no topo)
    // NUNCA duplicar a lista aqui - referencia a INTERACTIVE_SCENE_TYPES global
    const isInteractiveScene = INTERACTIVE_SCENE_TYPES.includes(scene.type as any);

    if (scene.anchorText?.pauseAt) {
      // ✅ GUARD: Se a cena NÃO é interativa, ignorar pauseAt
      if (!isInteractiveScene) {
        console.warn(`[Phase] ⚠️ ${scene.id}: pauseAt IGNORADO - cena tipo "${scene.type}" não é interativa`);
      } else {
        // ✅ C02 FIX: Usar selectAnchorOccurrence com LAST_IN_RANGE para pauseAt
        const pauseResult = selectAnchorOccurrence(scene.anchorText.pauseAt, wordTimestamps, startTime, endTime, 'LAST_IN_RANGE');
        
        if (pauseResult.selectedTime !== null) {
          anchorActions.push({
            id: `pause-${scene.id}`,
            keyword: scene.anchorText.pauseAt,
            keywordTime: pauseResult.selectedTime,
            type: 'pause',
          });
          console.log(`[Phase] ✓ pauseAt "${scene.anchorText.pauseAt}" @ ${pauseResult.selectedTime.toFixed(2)}s (strategy=LAST, ${pauseResult.matchedCount} matches)`);
        } else {
          // ✅ R2: Anchor missing → NULL, NO fallback (80% REMOVED!)
          console.warn(`[Phase] ⚠️ pauseAt "${scene.anchorText.pauseAt}" NOT FOUND - NO ANCHOR CREATED (R2 compliance)`);
          // NÃO criar anchor com tempo inventado - viola R5 de RULES.md
        }
      }
    }

    // ✅ FASE 6 ANCHOR FIX: Processar transitionAt DENTRO do range
    if (scene.anchorText?.transitionAt) {
      const transitionTime = findKeywordTime(scene.anchorText.transitionAt, wordTimestamps, startTime, endTime);
      if (transitionTime !== null) {
        anchorActions.push({
          id: `transition-${scene.id}`,
          keyword: scene.anchorText.transitionAt,
          keywordTime: transitionTime,
          type: 'trigger',
          targetId: 'next-phase',
        });
        console.log(`[Phase] ✓ transitionAt "${scene.anchorText.transitionAt}" @ ${transitionTime.toFixed(2)}s`);
      } else {
        console.warn(`[Phase] ⚠️ transitionAt "${scene.anchorText.transitionAt}" não encontrado no range`);
      }
    }

    // Micro-visuais
    // ✅ V7-vv FIX: Duration dinâmico baseado no tipo e input
    const getDefaultDuration = (type: string): number => {
      switch (type) {
        case 'image-flash': return 0.8;
        case 'text-pop': return 2.0;
        case 'number-count': return 1.5;
        case 'highlight': return 2.5;
        case 'text-highlight': return 2.0;
        case 'card-reveal': return 3.0;
        case 'letter-reveal': return 1.0;
        default: return 2.0;
      }
    };

    const microVisuals: MicroVisual[] = [];
    
    // =========================================================================
    // ✅ PHASE DRIFT FIX v2: Detectar se narração principal está ANTES da fase
    // 
    // CASO 1: microVisuals com anchors antes do startTime
    // CASO 2: visual.content.word (ex: "PERFEITO") aparece antes do startTime
    // CASO 3: título da fase contém palavra-chave que aparece antes
    // =========================================================================
    let expandedStartTime = startTime;
    let driftReason = '';
    
    // CASO 1: microVisuals com anchors antes
    scene.visual?.microVisuals?.forEach((mv, idx) => {
      const globalTriggerTime = findKeywordTime(mv.anchorText, wordTimestamps, 0, wordTimestamps[wordTimestamps.length - 1]?.end || 0);
      
      if (globalTriggerTime !== null && globalTriggerTime < startTime) {
        const isVisualWithNarration = ['letter-reveal', 'card-reveal', 'text-reveal'].includes(mv.type);
        
        if (isVisualWithNarration) {
          console.log(`[PHASE_DRIFT_FIX] MicroVisual "${mv.id}" anchorText "${mv.anchorText}" found at ${globalTriggerTime.toFixed(2)}s, BEFORE phase startTime ${startTime.toFixed(2)}s`);
          
          const proposedStartTime = Math.max(0, globalTriggerTime - 0.5);
          if (proposedStartTime < expandedStartTime) {
            expandedStartTime = proposedStartTime;
            driftReason = `microVisual "${mv.anchorText}" @ ${globalTriggerTime.toFixed(2)}s`;
          }
        }
      }
    });
    
    // CASO 2: visual.content.word (PERFEITO, etc.) - buscar palavra principal do visual
    const visualWord = scene.visual?.content?.word;
    if (visualWord && typeof visualWord === 'string') {
      const wordTriggerTime = findKeywordTime(visualWord, wordTimestamps, 0, wordTimestamps[wordTimestamps.length - 1]?.end || 0);
      
      if (wordTriggerTime !== null && wordTriggerTime < startTime) {
        console.log(`[PHASE_DRIFT_FIX] Visual word "${visualWord}" found at ${wordTriggerTime.toFixed(2)}s, BEFORE phase startTime ${startTime.toFixed(2)}s`);
        
        const proposedStartTime = Math.max(0, wordTriggerTime - 0.5);
        if (proposedStartTime < expandedStartTime) {
          expandedStartTime = proposedStartTime;
          driftReason = `visual.content.word "${visualWord}" @ ${wordTriggerTime.toFixed(2)}s`;
        }
      }
    }
    
    // CASO 3: Título da fase contém palavra-chave que aparece antes
    // Extrair palavras significativas do título (ignorar artigos e preposições)
    const titleWords = (scene.title || '').split(/\s+/).filter(w => w.length > 4);
    for (const titleWord of titleWords) {
      const titleWordTime = findKeywordTime(titleWord, wordTimestamps, 0, wordTimestamps[wordTimestamps.length - 1]?.end || 0);
      
      if (titleWordTime !== null && titleWordTime < startTime) {
        console.log(`[PHASE_DRIFT_FIX] Title word "${titleWord}" found at ${titleWordTime.toFixed(2)}s, BEFORE phase startTime ${startTime.toFixed(2)}s`);
        
        const proposedStartTime = Math.max(0, titleWordTime - 0.5);
        if (proposedStartTime < expandedStartTime) {
          expandedStartTime = proposedStartTime;
          driftReason = `title word "${titleWord}" @ ${titleWordTime.toFixed(2)}s`;
        }
      }
    }
    
    // Aplicar expansão se necessário
    if (expandedStartTime < startTime) {
      console.log(`[Phase] ✅ PHASE_DRIFT_FIX: "${scene.id}" startTime ${startTime.toFixed(2)}s → ${expandedStartTime.toFixed(2)}s (reason: ${driftReason})`);
      startTime = expandedStartTime;
    }
    
    // Agora processar microVisuals normalmente com o startTime potencialmente expandido
    scene.visual?.microVisuals?.forEach((mv, idx) => {
      // =====================================================================
      // ✅ C08 FIX v2: Buscar anchorText GLOBALMENTE primeiro, depois validar range
      // PROBLEMA: Se o PHASE_DRIFT_FIX expandiu startTime, a keyword pode estar
      // no range expandido mas a busca antiga falhava por usar range original.
      // 
      // SOLUÇÃO: Buscar globalmente, aceitar se estiver no range [expandedStartTime, endTime]
      // =====================================================================
      
      // Primeiro: busca GLOBAL para encontrar onde a palavra realmente está
      const audioEnd = wordTimestamps[wordTimestamps.length - 1]?.end || endTime;
      const globalTriggerTime = findKeywordTime(mv.anchorText, wordTimestamps, 0, audioEnd);
      
      // Segundo: validar se está no range expandido da fase
      let triggerTime: number | null = null;
      if (globalTriggerTime !== null) {
        // Aceitar se estiver dentro do range expandido OU até 0.5s antes (margem de segurança)
        const acceptableStart = Math.max(0, startTime - 0.5);
        if (globalTriggerTime >= acceptableStart && globalTriggerTime <= endTime) {
          triggerTime = globalTriggerTime;
          console.log(`[C08] ✅ "${mv.anchorText}" found at ${globalTriggerTime.toFixed(2)}s - within expanded range [${startTime.toFixed(2)}s, ${endTime.toFixed(2)}s]`);
        } else {
          console.log(`[C08] ⚠️ "${mv.anchorText}" found at ${globalTriggerTime.toFixed(2)}s - OUTSIDE range [${startTime.toFixed(2)}s, ${endTime.toFixed(2)}s]`);
        }
      } else {
        console.log(`[C08] ⚠️ "${mv.anchorText}" NOT FOUND in audio`);
      }
      
      // ✅ CONTRATO CONGELADO v1.0: Converter moderno → legado ANTES de salvar
      const canonicalType = MODERN_TO_LEGACY_MAP[mv.type] || mv.type;
      
      // ✅ triggerTime: NUNCA undefined (fallback determinístico)
      const fallbackTriggerTime = startTime + (endTime - startTime) * ((idx + 1) / (scene.visual.microVisuals!.length + 1));
      const safeTriggerTime = triggerTime ?? fallbackTriggerTime;
      
      // ✅ duration: NUNCA undefined (fallback por tipo canônico)
      const safeDuration = (mv.content as any)?.duration || getDefaultDuration(canonicalType);
      
      microVisuals.push({
        id: mv.id || `mv-${scene.id}-${idx}`,
        type: canonicalType,  // ← TIPO CANÔNICO (legado)
        anchorText: mv.anchorText,
        triggerTime: safeTriggerTime,  // ← NUNCA undefined
        duration: safeDuration,         // ← NUNCA undefined
        content: mv.content,
      });
      
      console.log(`[MicroVisual] ${mv.id || `mv-${scene.id}-${idx}`}: ${mv.type} → ${canonicalType} @ ${safeTriggerTime.toFixed(2)}s (${safeDuration}s) [triggerTime=${triggerTime !== null ? 'FOUND' : 'FALLBACK'}]`);

      if (triggerTime !== null) {
        anchorActions.push({
          id: mv.id || `mv-${scene.id}-${idx}`,
          keyword: mv.anchorText,
          keywordTime: triggerTime,
          type: 'show',
          targetId: mv.id,
        });
      }
    });

    // =========================================================================
    // ✅ C12.1 FIX: Process scene.anchorActions (frame triggers for image-sequence)
    // These are explicit trigger actions defined in the input JSON that need
    // keywordTime resolution from wordTimestamps.
    // =========================================================================
    if (scene.anchorActions && Array.isArray(scene.anchorActions)) {
      for (const inputAction of scene.anchorActions) {
        // Only process 'trigger' type actions (frame triggers, etc.)
        if (inputAction.type !== 'trigger') continue;
        
        // Resolve keywordTime from wordTimestamps
        const keywordTime = findKeywordTime(inputAction.keyword, wordTimestamps, startTime, endTime);
        
        if (keywordTime !== null) {
          anchorActions.push({
            id: inputAction.id || `trigger-${scene.id}-${inputAction.keyword}`,
            keyword: inputAction.keyword,
            keywordTime,
            type: 'trigger',
            targetId: inputAction.targetId,
            payload: inputAction.payload,
          });
          console.log(`[Phase] ✅ C12.1 FRAME TRIGGER: "${inputAction.keyword}" @ ${keywordTime.toFixed(2)}s payload=${JSON.stringify(inputAction.payload)}`);
        } else {
          console.warn(`[Phase] ⚠️ C12.1 FRAME TRIGGER: keyword "${inputAction.keyword}" NOT FOUND in range [${startTime.toFixed(2)}s, ${endTime.toFixed(2)}s]`);
        }
      }
    }

    // Determinar comportamento de áudio (usa isInteractiveScene definido acima)

    // ✅ INTERACTIVE FLOOR FIX: Garantir mínimo de 5 segundos para fases interativas
    // Isso permite tempo suficiente para o usuário interagir com quiz/playground
    const MIN_INTERACTIVE_DURATION = 5.0;
    if (isInteractiveScene) {
      const currentDuration = endTime - startTime;
      if (currentDuration < MIN_INTERACTIVE_DURATION) {
        const newEndTime = startTime + MIN_INTERACTIVE_DURATION;
        console.log(`[Phase] ✅ INTERACTIVE FLOOR: ${scene.id} duration ${currentDuration.toFixed(2)}s < ${MIN_INTERACTIVE_DURATION}s, extended endTime ${endTime.toFixed(2)}s → ${newEndTime.toFixed(2)}s`);
        endTime = newEndTime;
      }
    }

    // ✅ CONTRATO CONGELADO v1.0: Mapear scene.type → phase.type persistível
    // secret-reveal e gamification NÃO existem no banco
    const persistiblePhaseType = SCENE_TO_PHASE_MAP[scene.type] || scene.type;

    // ✅ FASE A: Resolve storagePath defensivo de TODAS as fontes possíveis
    // O parser pode normalizar visual para apenas {type, content}, descartando campos root.
    // Lemos de todas as fontes antes de construir o Phase para garantir preservação.
    const resolvedImageStoragePath: string | undefined =
      scene.visual.type === 'image'
        ? (() => {
            const fromRoot = typeof scene.visual.storagePath === 'string' && scene.visual.storagePath
              ? scene.visual.storagePath
              : undefined;
            const fromContent = typeof (scene.visual.content as any)?.storagePath === 'string' && (scene.visual.content as any).storagePath
              ? (scene.visual.content as any).storagePath as string
              : undefined;
            const resolved = fromRoot || fromContent;
            console.log(`[Phase] IMAGE_RESOLVE: scene=${scene.id} fromRoot=${fromRoot ?? 'MISSING'} fromContent=${fromContent ?? 'MISSING'} resolved=${resolved ?? 'NOT_FOUND'}`);
            return resolved;
          })()
        : undefined;
    
    // Construir fase
    const phase: Phase = {
      id: scene.id,
      title: scene.title,
      type: persistiblePhaseType,  // ← TIPO MAPEADO PARA PERSISTÊNCIA
      startTime,
      endTime,
      visual: {
        type: scene.visual.type,
        // ✅ FASE A: Usar resolvedImageStoragePath (lido defensivamente de ambas as fontes)
        content: scene.visual.type === 'image'
          ? {
              ...(scene.visual.content || {}),
              // Usa o valor resolvido — não leitura inline que pode ser undefined
              ...(resolvedImageStoragePath ? { storagePath: resolvedImageStoragePath } : {}),
              ...(scene.visual.promptScene ? { promptScene: scene.visual.promptScene } : {}),
              ...(scene.visual.instruction ? { instruction: scene.visual.instruction } : {}),
            }
          : (scene.visual.content || {}),
        // C12.1: Propagate displayMode from input to output
        ...(scene.visual.displayMode ? { displayMode: scene.visual.displayMode } : {}),
        // C12.1: Propagate presetKey from input to output
        ...(scene.visual.presetKey ? { presetKey: scene.visual.presetKey } : {}),
        // ✅ FASE A: Root-level storagePath via resolvedImageStoragePath (Player lê visual.storagePath || visual.content.storagePath)
        ...(resolvedImageStoragePath ? { storagePath: resolvedImageStoragePath } : {}),
        // C12.1: Preserve frames[] for image-sequence visuals
        // Check both visual.frames (hoisted) and visual.content.frames (nested input)
        ...(scene.visual.type === 'image-sequence' 
          ? (() => {
              const hoistedFrames = scene.visual.frames;
              const contentFrames = (scene.visual.content as any)?.frames;
              const frames = (Array.isArray(hoistedFrames) && hoistedFrames.length > 0) 
                ? hoistedFrames 
                : (Array.isArray(contentFrames) && contentFrames.length > 0) 
                  ? contentFrames 
                  : null;
              return frames ? { frames } : {};
            })()
          : {}),
      },
      // C03: Populate scenes[] — 1:1 with phase (single scene per phase)
      scenes: [{
        id: `${scene.id}-s1`,
        type: scene.type,
        startTime,
        endTime,
        duration: endTime - startTime,
        narration: scene.narration || '',
        content: scene.visual.content || {},
        animation: scene.visual.effects?.particles ? 'particle-burst' : 'fade',
      }],
      effects: scene.visual.effects,
      microVisuals: microVisuals.length > 0 ? microVisuals : undefined,
      anchorActions: anchorActions.length > 0 ? anchorActions : undefined,
      audioBehavior: isInteractiveScene ? buildAudioBehavior(scene) : undefined,
    };

    // Interação
    if (scene.interaction) {
      if (scene.interaction.type === 'quiz' && scene.interaction.options) {
        phase.interaction = {
          type: 'quiz',
          question: scene.interaction.question || scene.visual.content.question as string || '',
          options: scene.interaction.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
            feedback: {
              title: opt.feedback?.title || '',
              subtitle: opt.feedback?.subtitle || '',
              mood: opt.feedback?.mood || 'neutral',
              audioId: opt.feedback?.narration ? `feedback-${opt.id}` : undefined,
            },
          })),
          timeout: scene.interaction.timeout,
        };
      } else if (scene.interaction.type === 'playground') {
        // ✅ FASE 3 FIX: Converter estrutura INPUT para formato V7Contract.ts
        // INPUT usa: amateurScore, comparison.amateur.response
        // OUTPUT espera: amateurResult { title, content, score, verdict }
        // ✅ FASE 4 FIX: Frontend também procura amateurScore/professionalScore no nível raiz!

        const comparison = scene.interaction.comparison as { amateur?: { label?: string; response?: string; mood?: string }; professional?: { label?: string; response?: string; mood?: string } } | undefined;
        const moodToVerdict = (mood: string): string => {
          switch (mood) {
            case 'danger': return 'Genérico e sem direcionamento';
            case 'warning': return 'Parcialmente estruturado';
            case 'success': return 'Específico, actionável, com números reais';
            default: return mood;
          }
        };

        // ✅ FASE 4 FIX: Extrair scores do INPUT (podem vir de vários lugares)
        const inputAmateurScore = scene.interaction.amateurScore ??
                                  (scene.interaction as any).amateurResult?.score ??
                                  10; // Default baixo para amador
        const inputProfessionalScore = scene.interaction.professionalScore ??
                                       (scene.interaction as any).professionalResult?.score ??
                                       95; // Default alto para profissional

        phase.interaction = {
          type: 'playground',
          amateurPrompt: scene.interaction.amateurPrompt,
          professionalPrompt: scene.interaction.professionalPrompt,
          // ✅ FASE 4 FIX: Scores no nível raiz (Frontend procura aqui!)
          amateurScore: inputAmateurScore,
          professionalScore: inputProfessionalScore,
          // ✅ Estrutura correta para Frontend (V7Contract.ts)
          amateurResult: scene.interaction.amateurResult || (comparison?.amateur ? {
            title: comparison.amateur.label || 'Resultado Amador',
            content: comparison.amateur.response || '',
            score: inputAmateurScore,
            verdict: moodToVerdict(comparison.amateur.mood || 'danger'),
          } : undefined),
          professionalResult: scene.interaction.professionalResult || (comparison?.professional ? {
            title: comparison.professional.label || 'Resultado Profissional',
            content: comparison.professional.response || '',
            score: inputProfessionalScore,
            verdict: moodToVerdict(comparison.professional.mood || 'success'),
          } : undefined),
          // Manter userChallenge para interatividade
          userChallenge: scene.interaction.userChallenge,
        };

        console.log(`[V7-vv:Playground] Phase "${scene.id}" scores: amateur=${inputAmateurScore}, professional=${inputProfessionalScore}`);
      } else if (scene.interaction.type === 'cta-button') {
        phase.interaction = {
          type: 'cta-button',
          buttonText: scene.interaction.buttonText,
          action: scene.interaction.action,
        };
      }
    }

    phases.push(phase);
    // ✅ FASE 6: Removido lastEndTime - cada fase tem seu timing REAL
  }

  // ============================================================================
  // ✅ FASE 7 CRITICAL FIX: Garantir que phases NÃO se sobreponham
  // ============================================================================
  // PROBLEMA DESCOBERTO: Phase N+1 pode começar ANTES de Phase N terminar
  // Isso faz o Player pular phases porque ele usa startTime para determinar fase ativa
  //
  // EXEMPLO DO BUG:
  // - Phase 9: startTime=75.976s, endTime=80.976s
  // - Phase 10: startTime=75.72s (ANTES da Phase 9!)
  // → Player encontra Phase 10 primeiro e PULA Phase 9!
  //
  // SOLUÇÃO: Garantir ordem sequencial - Phase N+1.startTime >= Phase N.endTime
  // ============================================================================

  console.log('\n[Phases] ✅ FASE 7: Garantindo ordem SEQUENCIAL das phases...');

  // ============================================================================
  // ✅ FASE 7 v2: NÃO ordenar por startTime! Manter ordem do INPUT.
  // ============================================================================
  // PROBLEMA DO sort():
  // - Phase 9: startTime=75.629s
  // - Phase 10: startTime=75.373s
  // - sort() colocaria Phase 10 ANTES de Phase 9, quebrando a ordem da aula!
  //
  // SOLUÇÃO: Manter ordem do INPUT e ajustar startTime sequencialmente
  // Phase[N+1].startTime deve ser >= Phase[N].endTime
  // ============================================================================

  // NÃO USAR: phases.sort((a, b) => a.startTime - b.startTime);

  // ✅ CONTRATO CONGELADO v1.0: Usar constante GLOBAL
  const MIN_INTERACTIVE_DURATION_CHECK = 5.0;
  
  if (phases.length > 0 && INTERACTIVE_SCENE_TYPES.includes(phases[0].type as any)) {
    const firstPhase = phases[0];
    const duration = firstPhase.endTime - firstPhase.startTime;
    if (duration < MIN_INTERACTIVE_DURATION_CHECK) {
      console.log(`[Phases] ✅ INTERACTIVE FIX (first): "${firstPhase.id}" duration ${duration.toFixed(2)}s → ${MIN_INTERACTIVE_DURATION_CHECK}s`);
      firstPhase.endTime = firstPhase.startTime + MIN_INTERACTIVE_DURATION_CHECK;
    }
  }

  // Garantir que cada phase começa DEPOIS da anterior terminar
  for (let i = 1; i < phases.length; i++) {
    const prevPhase = phases[i - 1];
    const currPhase = phases[i];

    // Se a phase atual começa ANTES da anterior terminar, ajustar
    if (currPhase.startTime < prevPhase.endTime) {
      const overlap = prevPhase.endTime - currPhase.startTime;
      console.log(`[Phases] ⚠️ OVERLAP: "${currPhase.id}" startTime(${currPhase.startTime.toFixed(2)}s) < "${prevPhase.id}" endTime(${prevPhase.endTime.toFixed(2)}s) - overlap: ${overlap.toFixed(2)}s`);

      // CORREÇÃO: Phase atual começa após a anterior + pequena margem
      const newStartTime = prevPhase.endTime + 0.05; // 50ms de margem
      console.log(`[Phases] ✅ FIX: "${currPhase.id}" startTime ${currPhase.startTime.toFixed(2)}s → ${newStartTime.toFixed(2)}s`);
      currPhase.startTime = newStartTime;
    }

    // Se o endTime ficou menor/igual ao startTime, ajustar
    if (currPhase.endTime <= currPhase.startTime) {
      const minDuration = 3.0; // Duração mínima de 3 segundos
      currPhase.endTime = currPhase.startTime + minDuration;
      console.log(`[Phases] ✅ FIX: "${currPhase.id}" endTime ajustado para ${currPhase.endTime.toFixed(2)}s (min duration)`);
    }
    
    // ✅ CONTRATO CONGELADO v1.0: Usar constante GLOBAL
    if (INTERACTIVE_SCENE_TYPES.includes(currPhase.type as any)) {
      const currDuration = currPhase.endTime - currPhase.startTime;
      const MIN_INTERACTIVE_DURATION = 5.0; // 5 segundos mínimo para interação
      
      if (currDuration < MIN_INTERACTIVE_DURATION) {
        const oldEndTime = currPhase.endTime;
        currPhase.endTime = currPhase.startTime + MIN_INTERACTIVE_DURATION;
        console.log(`[Phases] ✅ INTERACTIVE FIX: "${currPhase.id}" (${currPhase.type}) duration ${currDuration.toFixed(2)}s → ${MIN_INTERACTIVE_DURATION}s (endTime: ${oldEndTime.toFixed(2)}s → ${currPhase.endTime.toFixed(2)}s)`);
      }
    }
  }

  // Log do resultado final
  console.log('\n[Phases] ✅ FASE 7: Ordem SEQUENCIAL garantida:');
  phases.forEach((p, i) => {
    const duration = p.endTime - p.startTime;
    console.log(`  [${i}] "${p.id}" (${p.type}): ${p.startTime.toFixed(2)}s → ${p.endTime.toFixed(2)}s (${duration.toFixed(2)}s)`);
  });

  // ✅ FASE 6: Calcular duração total baseado na última fase
  const lastPhaseEndTime = phases.length > 0 ? phases[phases.length - 1].endTime : 0;
  console.log(`\n[Phases] ✅ Generated ${phases.length} phases, total duration: ${lastPhaseEndTime.toFixed(2)}s`);

  return phases;
}

// ============================================================================
// BOUNDARY_FIX_GUARD - Invariantes invioláveis de timeline (C10B-BOUNDARYFIX)
// ============================================================================
// 
// Invariantes:
// 1. Para cada fase: endTime >= startTime + MIN_DURATION
// 2. Para cada par de fases: phases[i].endTime <= phases[i+1].startTime (monotonicidade)
// 3. Todas as durações > 0
//
// Se violar, aplica correção automática e loga o ajuste.
// Se ainda violar após correção, retorna lista de falhas para FAIL do run.
// ============================================================================

interface BoundaryFixResult {
  fixedPhases: Phase[];
  boundaryFixesApplied: number;
  failedBoundaries: string[];
}

function applyBoundaryFixGuard(
  phases: Phase[],
  totalDuration: number
): BoundaryFixResult {
  const MIN_PHASE_DURATION = 0.05; // 50ms mínimo absoluto
  const MIN_INTERACTIVE_DURATION = 5.0; // 5s para fases interativas
  
  let boundaryFixesApplied = 0;
  const failedBoundaries: string[] = [];
  const fixedPhases = phases.map(phase => ({ ...phase }));

  console.log('[BOUNDARY_FIX_GUARD] ========================================');
  console.log(`[BOUNDARY_FIX_GUARD] Validando ${fixedPhases.length} fases...`);

  // PASS 1: Garantir duração mínima para cada fase
  for (let i = 0; i < fixedPhases.length; i++) {
    const phase = fixedPhases[i];
    const isInteractive = INTERACTIVE_SCENE_TYPES.includes(phase.type as any);
    const minDuration = isInteractive ? MIN_INTERACTIVE_DURATION : MIN_PHASE_DURATION;
    
    // Invariante 1: endTime >= startTime + minDuration
    const currentDuration = phase.endTime - phase.startTime;
    
    if (currentDuration < minDuration) {
      const oldEndTime = phase.endTime;
      phase.endTime = phase.startTime + minDuration;
      
      // Clamp ao totalDuration
      if (phase.endTime > totalDuration) {
        phase.endTime = totalDuration;
      }
      
      boundaryFixesApplied++;
      console.log(`[BOUNDARY_FIX_GUARD] 🔧 FIX: ${phase.id} endTime ${oldEndTime.toFixed(3)}s → ${phase.endTime.toFixed(3)}s (duration was ${currentDuration.toFixed(3)}s)`);
    }
  }

  // PASS 2: Garantir monotonicidade (endTime <= next.startTime)
  for (let i = 0; i < fixedPhases.length - 1; i++) {
    const current = fixedPhases[i];
    const next = fixedPhases[i + 1];
    
    // Invariante 2: phases[i].endTime <= phases[i+1].startTime
    if (current.endTime > next.startTime) {
      const oldNextStart = next.startTime;
      
      // Estratégia: ajustar next.startTime para current.endTime (shift forward)
      next.startTime = current.endTime;
      
      boundaryFixesApplied++;
      console.log(`[BOUNDARY_FIX_GUARD] 🔧 MONOTONICITY_FIX: ${next.id} startTime ${oldNextStart.toFixed(3)}s → ${next.startTime.toFixed(3)}s (was overlapping ${current.id})`);
    }
  }

  // PASS 3: Validação final - nenhuma duração pode ser <= 0
  for (const phase of fixedPhases) {
    const duration = phase.endTime - phase.startTime;
    if (duration <= 0) {
      failedBoundaries.push(`${phase.id}: duration=${duration.toFixed(3)}s (CRITICAL)`);
      console.error(`[BOUNDARY_FIX_GUARD] ❌ CRITICAL: ${phase.id} has invalid duration ${duration.toFixed(3)}s`);
    }
  }

  // PASS 4: Sync scenes[] timing to match fixed phase bounds (C03 compliance)
  for (const phase of fixedPhases) {
    if (phase.scenes && phase.scenes.length > 0) {
      for (const scene of phase.scenes) {
        const oldStart = scene.startTime;
        const oldEnd = scene.endTime;
        scene.startTime = Math.max(scene.startTime, phase.startTime);
        scene.endTime = Math.min(scene.endTime, phase.endTime);
        scene.duration = scene.endTime - scene.startTime;
        if (oldStart !== scene.startTime || oldEnd !== scene.endTime) {
          boundaryFixesApplied++;
          console.log(`[BOUNDARY_FIX_GUARD] 🔧 C03_SCENE_SYNC: ${scene.id} timing ${oldStart.toFixed(3)}-${oldEnd.toFixed(3)}s → ${scene.startTime.toFixed(3)}-${scene.endTime.toFixed(3)}s (clamped to phase ${phase.id})`);
        }
      }
    }
  }

  // Log resultado
  if (failedBoundaries.length === 0) {
    console.log(`[BOUNDARY_FIX_GUARD] ✅ Todas as fases passaram nas invariantes`);
  } else {
    console.error(`[BOUNDARY_FIX_GUARD] ❌ ${failedBoundaries.length} fases falharam nas invariantes`);
  }
  console.log('[BOUNDARY_FIX_GUARD] ========================================');

  return { fixedPhases, boundaryFixesApplied, failedBoundaries };
}


/**
 * ✅ FASE 6 FINAL: Calculate phase timings based on KEYWORDS in wordTimestamps
 *
 * CAUSA RAIZ DOS BUGS ANTERIORES:
 * - generatePhases() usava: startTime = Math.max(range.startTime, lastEndTime)
 * - Isso PULAVA o início da narração quando lastEndTime > range.startTime
 * - calculateWordBasedTimings() adicionava margens de 3s que causavam overlap
 *
 * SOLUÇÃO FASE 6:
 * 1. generatePhases() agora usa startTime = range.startTime (REAL)
 * 2. endTime NUNCA ultrapassa nextPhase.startTime (sem overlap)
 * 3. Margens mínimas (0.3s-0.5s) em vez de excessivas (3s)
 *
 * RESULTADO:
 * - Frontend faz seekTo(nextPhase.startTime) e encontra o início REAL da narração
 * - Nenhuma parte da narração é pulada
 * - Fases não se sobrepõem
 */
function calculateWordBasedTimings(
  phases: Phase[],
  wordTimestamps: WordTimestamp[],
  inputScenes: ScriptScene[]
): void {
  if (phases.length === 0 || wordTimestamps.length === 0) return;

  console.log('[V7-vv:WordBased] ✅ FASE 6 FINAL: Calculating WORD-BASED timings...');
  console.log('[V7-vv:WordBased] Total words:', wordTimestamps.length);

  const totalAudioDuration = wordTimestamps[wordTimestamps.length - 1].end;

  // Normalize function for word matching
  const normalize = (word: string): string =>
    word.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:'"()[\]{}…]+/g, '')
      .trim();

  // ✅ FASE 6: Encontrar ÚLTIMA ocorrência de uma palavra após um tempo
  // ⚠️ PATCH 1+2: beforeTime OBRIGATÓRIO (sem default global) + EPS tolerance
  const ANCHOR_EPS = 0.30; // 300ms tolerance for edge cases
  
  const findLastKeywordTime = (keyword: string, afterTime: number, beforeTime: number): number | null => {
    // PATCH 1: Validação obrigatória de beforeTime
    if (beforeTime === undefined || beforeTime === null || beforeTime === totalAudioDuration) {
      console.error(`[V7-vv:CRITICAL] findLastKeywordTime called without proper beforeTime! keyword="${keyword}", afterTime=${afterTime}, beforeTime=${beforeTime}`);
      // NÃO fazer fallback global - retornar null
    }
    
    const keywordParts = keyword.split(/\s+/).map(normalize).filter(w => w.length > 0);
    if (keywordParts.length === 0) return null;

    // Multi-word: busca sequência (última ocorrência)
    if (keywordParts.length > 1) {
      const MAX_GAP = 3;
      let lastFound: number | null = null;

      for (let i = 0; i < wordTimestamps.length; i++) {
        // PATCH 2: Aplicar EPS tolerance no afterTime
        if (wordTimestamps[i].start < (afterTime - ANCHOR_EPS)) continue;
        if (wordTimestamps[i].start > beforeTime) break;

        const firstWordNorm = normalize(wordTimestamps[i].word);
        if (firstWordNorm !== keywordParts[0]) continue;

        let matchPositions: number[] = [i];
        let searchStart = i + 1;

        for (let partIdx = 1; partIdx < keywordParts.length; partIdx++) {
          const targetPart = keywordParts[partIdx];
          let found = false;

          for (let j = searchStart; j <= Math.min(searchStart + MAX_GAP, wordTimestamps.length - 1); j++) {
            if (normalize(wordTimestamps[j].word) === targetPart) {
              matchPositions.push(j);
              searchStart = j + 1;
              found = true;
              break;
            }
          }

          if (!found) {
            matchPositions = [];
            break;
          }
        }

        if (matchPositions.length === keywordParts.length) {
          const lastIdx = matchPositions[matchPositions.length - 1];
          lastFound = wordTimestamps[lastIdx].end;
        }
      }

      if (lastFound !== null) {
        console.log(`[V7-vv:WordBased] ✓ Found multi-word "${keyword}" (last) at ${lastFound.toFixed(2)}s [range: ${afterTime.toFixed(2)}s-${beforeTime.toFixed(2)}s]`);
      } else {
        console.warn(`[V7-vv:WordBased] ⚠️ Multi-word "${keyword}" NOT found in range [${afterTime.toFixed(2)}s-${beforeTime.toFixed(2)}s]`);
      }
      return lastFound;
    }

    // Single word: busca última ocorrência NO RANGE
    const target = keywordParts[0];
    let lastFound: number | null = null;
    let matchCount = 0;

    for (const ts of wordTimestamps) {
      // PATCH 2: Aplicar EPS tolerance no afterTime
      if (ts.start < (afterTime - ANCHOR_EPS)) continue;
      if (ts.start > beforeTime) break;

      const normalizedWord = normalize(ts.word);

      if (normalizedWord === target) {
        lastFound = ts.end;
        matchCount++;
      }
    }

    if (lastFound !== null) {
      console.log(`[V7-vv:WordBased] ✓ Found keyword "${keyword}" (last of ${matchCount}) at ${lastFound.toFixed(2)}s [range: ${afterTime.toFixed(2)}s-${beforeTime.toFixed(2)}s]`);
    } else {
      console.warn(`[V7-vv:WordBased] ⚠️ Keyword "${keyword}" NOT found in range [${afterTime.toFixed(2)}s-${beforeTime.toFixed(2)}s] (0 matches)`);
    }

    return lastFound;
  };

  // ✅ FASE 6: Encontrar PRIMEIRA ocorrência de uma palavra após um tempo
  const findFirstKeywordTime = (keyword: string, afterTime: number = 0): { start: number; end: number } | null => {
    const target = normalize(keyword);
    if (!target) return null;

    for (const ts of wordTimestamps) {
      if (ts.start < afterTime) continue;

      const normalizedWord = normalize(ts.word);

      if (normalizedWord === target) {
        return { start: ts.start, end: ts.end };
      }
    }

    return null;
  };

  // ✅ FASE 6: Encontrar o FIM REAL de uma narração
  // ⚠️ PATCH 1: Agora recebe beforeTime obrigatório para evitar busca global
  const findNarrationEndTime = (narration: string, afterTime: number, beforeTime: number): number | null => {
    const words = narration.split(/\s+/).map(normalize).filter(w => w.length > 0);
    if (words.length === 0) return null;

    // Tentar encontrar a última palavra da narração
    const lastWord = words[words.length - 1];
    let endTime = findLastKeywordTime(lastWord, afterTime, beforeTime);

    // Se não encontrou, tentar penúltima palavra
    if (endTime === null && words.length > 1) {
      const penultimateWord = words[words.length - 2];
      const found = findLastKeywordTime(penultimateWord, afterTime, beforeTime);
      if (found !== null) {
        endTime = found + 0.5; // Adicionar margem para palavra final
      }
    }

    // Se ainda não encontrou, tentar antepenúltima
    if (endTime === null && words.length > 2) {
      const antepenultimateWord = words[words.length - 3];
      const found = findLastKeywordTime(antepenultimateWord, afterTime, beforeTime);
      if (found !== null) {
        endTime = found + 1.0; // Adicionar margem para palavras finais
      }
    }

    return endTime;
  };

  // ✅ FASE 6: Processar cada fase com nova lógica
  phases.forEach((phase, index) => {
    const inputScene = inputScenes[index];
    const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(phase.type);
    const narration = inputScene?.narration || '';

    console.log(`\n[V7-vv:WordBased] === Phase ${index + 1}: "${phase.id}" (${phase.type}) ===`);

    // ✅ FASE 6 FIX: NÃO forçar startTime para lastEndTime
    // O startTime REAL é baseado em quando a narração dessa fase começa no áudio
    // O phase.startTime já foi calculado em generatePhases baseado na narração
    const originalStartTime = phase.startTime;
    console.log(`[V7-vv:WordBased] Original startTime: ${originalStartTime.toFixed(2)}s`);

    // ⚠️ PATCH 1 FIX: Calcular maxEndTime ANTES de usar nas buscas
    const nextPhase = index < phases.length - 1 ? phases[index + 1] : null;
    const maxEndTime = nextPhase ? nextPhase.startTime : totalAudioDuration;
    console.log(`[V7-vv:WordBased] maxEndTime (limit): ${maxEndTime.toFixed(2)}s`);

    // ✅ FASE 6: Encontrar o FIM REAL da narração dessa fase
    // ⚠️ PATCH 1: Passar maxEndTime como limite de busca
    const narrationEndTime = findNarrationEndTime(narration, originalStartTime, maxEndTime);
    if (narrationEndTime !== null) {
      console.log(`[V7-vv:WordBased] Narration ends at: ${narrationEndTime.toFixed(2)}s`);
    }

    // ✅ FASE 6: Para fases interativas, encontrar o pauseAt
    let pauseKeywordTime: number | null = null;

    if (isInteractive && inputScene?.anchorText?.pauseAt) {
      const pauseKeyword = inputScene.anchorText.pauseAt;
      // ⚠️ PATCH 1 FIX: Buscar pauseAt DENTRO do range dessa fase (com maxEndTime)
      pauseKeywordTime = findLastKeywordTime(pauseKeyword, originalStartTime, maxEndTime);

      if (pauseKeywordTime !== null) {
        // ⚠️ PATCH 3: Validação pós-cálculo - garantir que está no range
        if (pauseKeywordTime < (originalStartTime - ANCHOR_EPS) || pauseKeywordTime > maxEndTime) {
          console.error(`[ANCHOR-OUT-OF-RANGE] ${JSON.stringify({
            phaseId: phase.id,
            keyword: pauseKeyword,
            keywordTime: pauseKeywordTime,
            range: [originalStartTime, maxEndTime],
            verdict: 'DISCARDED'
          })}`);
          pauseKeywordTime = null;
        } else {
          console.log(`[V7-vv:WordBased] ✓ pauseAt "${pauseKeyword}" at ${pauseKeywordTime.toFixed(2)}s [VALID]`);

          // Atualizar anchorActions com tempo preciso
          if (phase.anchorActions) {
            const pauseAction = phase.anchorActions.find(a => a.type === 'pause');
            if (pauseAction) {
              pauseAction.keywordTime = pauseKeywordTime;
            }
          }
        }
      } else {
        // ⚠️ PATCH 3: Log estruturado para ANCHOR-MISSING
        console.warn(`[ANCHOR-MISSING] ${JSON.stringify({
          phaseId: phase.id,
          keyword: pauseKeyword,
          range: [originalStartTime, maxEndTime],
          occurrencesInRange: 0,
          verdict: 'NULL_ASSIGNED'
        })}`);
      }
    }

    // ✅ FASE 6: Calcular endTime CORRETO
    // REGRA SIMPLES: endTime = quando a narração DESSA FASE termina
    // NÃO adicionar margens excessivas que causam overlap com próxima fase

    let calculatedEndTime = phase.endTime;

    // ✅ FASE 6: maxEndTime já foi calculado acima (linha ~2699-2700)

    if (narrationEndTime !== null) {
      // O endTime base é quando a narração termina + pequena margem
      const baseEndTime = narrationEndTime + 0.3;

      if (isInteractive && pauseKeywordTime !== null) {
        // Para fases interativas: endTime deve cobrir até o pauseAt + pequena margem
        // O Frontend vai pausar no pauseAt, então só precisamos garantir que o áudio
        // PODE tocar até esse ponto
        const minEndForPause = pauseKeywordTime + 0.5; // Apenas 0.5s de margem (não 3s!)
        calculatedEndTime = Math.max(baseEndTime, minEndForPause);
        console.log(`[V7-vv:WordBased] ✅ Interactive phase: endTime = MAX(${baseEndTime.toFixed(2)}s, ${minEndForPause.toFixed(2)}s) = ${calculatedEndTime.toFixed(2)}s`);
      } else {
        calculatedEndTime = baseEndTime;
        console.log(`[V7-vv:WordBased] Normal phase: endTime = ${calculatedEndTime.toFixed(2)}s`);
      }
    } else {
      // ✅ FASE 6: Fallback quando narrationEndTime não foi encontrado
      // Usar o endTime original calculado em generatePhases
      console.warn(`[V7-vv:WordBased] ⚠️ narrationEndTime not found, using original endTime: ${calculatedEndTime.toFixed(2)}s`);

      // Se tiver pauseAt, garantir que endTime cobre até ele
      if (isInteractive && pauseKeywordTime !== null) {
        const minEndForPause = pauseKeywordTime + 0.5;
        if (calculatedEndTime < minEndForPause) {
          calculatedEndTime = minEndForPause;
          console.log(`[V7-vv:WordBased] ✅ Adjusted endTime to cover pauseAt: ${calculatedEndTime.toFixed(2)}s`);
        }
      }
    }

    // ✅ FASE 6 CRÍTICO: NUNCA extender endTime além do startTime da próxima fase
    // Isso causava o problema do "pulo" - o Frontend fazia seek para nextPhase.startTime
    // mas o áudio já estava além desse ponto por causa do endTime estendido
    if (nextPhase && calculatedEndTime > maxEndTime) {
      console.log(`[V7-vv:WordBased] ⚠️ FASE 6 FIX: endTime ${calculatedEndTime.toFixed(2)}s > nextPhase.startTime ${maxEndTime.toFixed(2)}s`);
      console.log(`[V7-vv:WordBased] ⚠️ Capping to ${maxEndTime.toFixed(2)}s to prevent overlap`);
      calculatedEndTime = maxEndTime;
    }

    // Última fase: termina no fim do áudio
    if (!nextPhase) {
      calculatedEndTime = totalAudioDuration;
    }

    // ✅ V7-vv SYSTEMIC FIX: Garantir duração mínima para fases interativas
    // Problema: playground/interaction phases com duração < 1s são inutilizáveis
    // Solução: Fases interativas DEVEM ter pelo menos 5s para permitir interação
    const minPhaseDuration = isInteractive ? 5.0 : 1.0;
    const currentDuration = calculatedEndTime - phase.startTime;
    
    if (currentDuration < minPhaseDuration) {
      console.warn(`[V7-vv:WordBased] ⚠️ Phase "${phase.id}" too short: ${currentDuration.toFixed(2)}s < min ${minPhaseDuration}s`);
      
      // Para fases interativas, NÃO é problema se áudio é curto
      // O áudio pausa na interação e só continua após user responder
      // Então podemos estender endTime sem problemas de overlap de áudio
      if (isInteractive) {
        // Estender até o mínimo, respeitando limite do áudio
        calculatedEndTime = Math.min(phase.startTime + minPhaseDuration, totalAudioDuration);
        console.log(`[V7-vv:WordBased] ✅ Interactive phase extended to: ${calculatedEndTime.toFixed(2)}s`);
      } else {
        // Para fases não-interativas, usar fallback mínimo
        calculatedEndTime = phase.startTime + minPhaseDuration;
        console.warn(`[V7-vv:WordBased] ⚠️ Using fallback endTime: ${calculatedEndTime.toFixed(2)}s`);
      }
    }

    // Garantir endTime > startTime (safety net)
    if (calculatedEndTime <= phase.startTime) {
      calculatedEndTime = phase.startTime + 5.0;
      console.warn(`[V7-vv:WordBased] ⚠️ CRITICAL: endTime <= startTime, forced to: ${calculatedEndTime.toFixed(2)}s`);
    }

    // ✅ Aplicar o endTime calculado
    phase.endTime = calculatedEndTime;

    console.log(`[V7-vv:WordBased] ✅ Final: ${phase.startTime.toFixed(2)}s - ${phase.endTime.toFixed(2)}s (duration: ${(phase.endTime - phase.startTime).toFixed(2)}s)`);
  });

  // Garantir que última fase termina exatamente no fim do áudio
  if (phases.length > 0) {
    phases[phases.length - 1].endTime = totalAudioDuration;
    console.log(`\n[V7-vv:WordBased] ✅ Last phase endTime set to totalAudioDuration: ${totalAudioDuration.toFixed(2)}s`);
  }

  // ✅ FASE 6: Log summary
  console.log('\n[V7-vv:WordBased] === FASE 6 TIMING SUMMARY ===');
  phases.forEach((phase, index) => {
    const duration = phase.endTime - phase.startTime;
    const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(phase.type);
    console.log(`  Phase ${index + 1} (${phase.type}${isInteractive ? ' 🎮' : ''}): ${phase.startTime.toFixed(2)}s - ${phase.endTime.toFixed(2)}s (${duration.toFixed(2)}s)`);
  });
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

// ============================================================================
// EXECUTION STATE CONTRACT ERROR TYPES
// ============================================================================
interface GuardrailError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

function isGuardrailError(error: unknown): error is { code: string; details?: Record<string, unknown> } {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    try {
      const parsed = JSON.parse((error as Error).message);
      return typeof parsed === 'object' && 'error_code' in parsed;
    } catch {
      return false;
    }
  }
  return false;
}

function parseGuardrailError(error: Error): { code: string; message: string; details?: Record<string, unknown> } {
  try {
    const parsed = JSON.parse(error.message);
    return {
      code: parsed.error_code || 'UNKNOWN_ERROR',
      message: parsed.error_message || error.message,
      details: parsed.error_details || undefined,
    };
  } catch {
    return {
      code: 'UNSTRUCTURED_ERROR',
      message: error.message,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // =========================================================================
  // EXECUTION STATE CONTRACT: Variables defined OUTSIDE try for catch access
  // =========================================================================
  let supabase: ReturnType<typeof createClient> | null = null;
  let runId: string | null = null;
  let input: ScriptInput | null = null;
  let executionInserted = false;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    input = await req.json();
    
    // =========================================================================
    // C05: INITIALIZE TRACEABILITY
    // =========================================================================
    runId = c05GetOrGenerateRunId(input);
    const mode: 'create' | 'reprocess' | 'dry_run' = 
      input.dry_run ? 'dry_run' : 
      input.reprocess ? 'reprocess' : 'create';
    
    console.log('================================================');
    console.log('[V7-vv] Pipeline Start');
    console.log(`[V7-vv] Title: ${input.title}`);
    console.log(`[V7-vv] Scenes: ${input.scenes?.length || 0}`);
    console.log(`[V7-vv] Voice ID: ${input.voice_id || 'default'}`);
    console.log(`[V7-vv] Dry Run: ${input.dry_run || false}`);
    console.log(`[V7-vv] C05 run_id: ${runId}`);
    console.log(`[V7-vv] C05 mode: ${mode}`);
    console.log(`[V7-vv] C05 pipeline_version: ${PIPELINE_VERSION}`);
    console.log('================================================');

    // =========================================================================
    // C05: INSERT EXECUTION RECORD (status=in_progress)
    // =========================================================================
    const c05InsertResult = await c05InsertExecution(supabase, {
      run_id: runId,
      pipeline_version: PIPELINE_VERSION,
      commit_hash: COMMIT_HASH,
      mode,
      lesson_id: (input as any).existing_lesson_id,
      lesson_title: input.title || 'untitled',
      input_data: input,
    });
    
    // Mark that we have an execution record to update on failure
    executionInserted = true;
    
    if (!c05InsertResult.success) {
      // Handle idempotency cases
      if (c05InsertResult.error === 'ALREADY_COMPLETED') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Pipeline execution already completed (idempotent)',
          runId,
          mode,
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (c05InsertResult.error === 'ALREADY_IN_PROGRESS') {
        return new Response(JSON.stringify({
          success: false,
          error: 'Another execution is already in progress for this run_id',
          runId,
          recommendation: 'Wait for completion or use a new run_id',
        }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (c05InsertResult.error === 'PREVIOUS_FAILED') {
        return new Response(JSON.stringify({
          success: false,
          error: 'Previous execution with this run_id failed. Use a new run_id for retry.',
          runId,
          recommendation: 'Generate a new run_id',
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      // Other insert errors - continue but log warning
      console.warn(`[C05] Insert warning: ${c05InsertResult.error}`);
    }

    // =========================================================================
    // DRY-RUN MODE: Validação Real Sem Geração de Áudio
    // =========================================================================
    if (input.dry_run === true) {
      console.log('[V7-vv] 🔍 DRY-RUN MODE ATIVADO');
      
      const dryRunResult = executeDryRun(input);
      
      // C05: Complete dry-run with result
      await c05CompleteDryRun(supabase, runId, dryRunResult);
      
      return new Response(
        JSON.stringify({
          success: true,
          mode: 'dry_run',
          runId,
          ...dryRunResult,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // =========================================================================
    // PASSO 1: VALIDAÇÃO ROBUSTA (Modo Normal)
    // ✅ C02: Skip validation when reprocess_preserve_structure=true (uses old_content)
    // =========================================================================
    const preserveStructureMode = input.reprocess === true && (input as any).reprocess_preserve_structure === true;
    
    if (!preserveStructureMode) {
      const validationErrors = validateInput(input);
      if (validationErrors.length > 0) {
        console.error('[V7-vv] ❌ Validation failed:', validationErrors);
        
        // CANONICAL JSON FORMAT (v7-vv-1.1.3)
        const errorMessages = validationErrors.map(e => `[${e.scene}] ${e.field}: ${e.message}`);
        const fullErrorMessage = JSON.stringify({
          error_code: 'VALIDATION_ERROR',
          error_message: `JSON inválido: ${errorMessages.join('; ')}`,
          error_details: validationErrors,
        });
        
        // =========================================================================
        // EXECUTION STATE CONTRACT: Mark as failed BEFORE returning
        // =========================================================================
        if (supabase && runId && executionInserted) {
          await supabase
            .from('pipeline_executions')
            .update({
              status: 'failed',
              error_message: fullErrorMessage,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('run_id', runId);
          console.log(`[EXECUTION_STATE_CONTRACT] ✅ Validation failure recorded for run ${runId}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'JSON inválido - Validação falhou',
            error_code: 'VALIDATION_ERROR',
            validationErrors,
            errorMessages,
            runId,
            helpUrl: 'https://docs.ailiv.app/v7-json-template-definitivo'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('[V7-vv] ✅ Validation passed');
    } else {
      console.log('[V7-vv] ✅ Validation SKIPPED (reprocess_preserve_structure mode)');
    }

    // =========================================================================
    // PASSO 1.5: AUTO-GERAÇÃO DE pauseAt PARA FASES INTERATIVAS
    // ✅ C02: Skip when preserve_structure (uses existing anchors)
    // =========================================================================
    if (!preserveStructureMode) {
      autoGeneratePauseAt(input.scenes);
    }

    // =========================================================================
    // PASSO 2: GERAR OU REUSAR ÁUDIO PRINCIPAL
    // =========================================================================
    const voiceId = input.voice_id || 'Xb7hH8MSUJpSbSDYk0k2'; // Usa voice_id do input!
    const shouldGenerateAudio = input.generate_audio !== false && !input.reprocess;
    const isReprocess = input.reprocess === true;

    let mainAudio: AudioSegment = {
      id: 'main',
      url: '',
      duration: 0,
      wordTimestamps: [],
    };

    // ✅ C01: REPROCESS MODE - Buscar áudio e timestamps do banco automaticamente
    if (isReprocess && input.existing_lesson_id) {
      console.log(`[V7-vv] 🔄 REPROCESS MODE: Buscando dados da lição ${input.existing_lesson_id}`);
      
      // Buscar dados existentes do banco
      const { data: existingLesson, error: fetchError } = await supabase
        .from('lessons')
        .select('audio_url, word_timestamps')
        .eq('id', input.existing_lesson_id)
        .single();
      
      if (fetchError || !existingLesson) {
        throw new Error(`Falha ao buscar lição existente: ${fetchError?.message || 'Lição não encontrada'}`);
      }
      
      if (!existingLesson.audio_url || !existingLesson.word_timestamps) {
        throw new Error(`Lição ${input.existing_lesson_id} não possui audio_url ou word_timestamps`);
      }
      
      const wordTimestampsFromDB = existingLesson.word_timestamps as WordTimestamp[];
      const lastTs = wordTimestampsFromDB[wordTimestampsFromDB.length - 1];
      
      mainAudio = {
        id: 'main',
        url: existingLesson.audio_url,
        duration: lastTs?.end || 0,
        wordTimestamps: wordTimestampsFromDB,
      };
      
      console.log(`[V7-vv]    Audio URL: ${mainAudio.url.substring(0, 60)}...`);
      console.log(`[V7-vv]    Word timestamps: ${mainAudio.wordTimestamps.length} palavras`);
      console.log(`[V7-vv] ✅ Dados existentes carregados: ${mainAudio.duration.toFixed(1)}s`);
    } else if (isReprocess && input.existing_audio_url && input.existing_word_timestamps) {
      // Fallback: usar dados passados no input (mantém compatibilidade)
      console.log('[V7-vv] 🔄 REPROCESS MODE: Usando áudio e timestamps do input');
      const lastTs = input.existing_word_timestamps[input.existing_word_timestamps.length - 1];
      mainAudio = {
        id: 'main',
        url: input.existing_audio_url,
        duration: lastTs?.end || 0,
        wordTimestamps: input.existing_word_timestamps,
      };
      console.log(`[V7-vv] ✅ Áudio existente carregado: ${mainAudio.duration.toFixed(1)}s, ${mainAudio.wordTimestamps.length} palavras`);
    } else if (shouldGenerateAudio) {
      console.log('[V7-vv] Step 2: Generating main audio...');

      // Concatenar todas as narrações
      const fullNarration = input.scenes
        .map(s => s.narration.trim())
        .filter(n => n.length > 0)
        .join('\n\n');

      const audioResult = await generateAudio(fullNarration, voiceId, supabase, 'v7-main');

      if (!audioResult.success) {
        if (input.fail_on_audio_error) {
          throw new Error(`Audio generation failed: ${audioResult.error}`);
        }
        console.warn('[V7-vv] ⚠️ Main audio failed, continuing without audio');
      } else {
        mainAudio = {
          id: 'main',
          url: audioResult.url || '',
          duration: audioResult.duration || 0,
          wordTimestamps: audioResult.wordTimestamps || [],
        };
        console.log(`[V7-vv] ✅ Main audio: ${mainAudio.duration.toFixed(1)}s, ${mainAudio.wordTimestamps.length} words`);
      }
    }

    // =========================================================================
    // PASSO 3: GERAR ÁUDIOS DE FEEDBACK DO QUIZ (AUTOMÁTICO)
    // ✅ C02: Skip when preserve_structure (no scenes input)
    // =========================================================================
    const feedbackAudios: FeedbackAudiosObject = {};
    
    if (!preserveStructureMode) {
      console.log('[V7-vv] Step 3: Generating feedback audios (automatic)...');

      // ✅ V7-vv v1.0.0: feedbackAudios como OBJECT + AUTO-GERAÇÃO
      // Se feedback.narration não existe, gera narração baseada em title/subtitle
      for (const scene of input.scenes) {
        if (scene.interaction?.type === 'quiz' && scene.interaction.options) {
          for (const option of scene.interaction.options) {
            // ✅ AUTO-GERAÇÃO: Se não tem narration, gerar a partir de title/subtitle
            let feedbackNarration = option.feedback?.narration;
            
            if (!feedbackNarration && option.feedback?.title) {
              // Gerar narração automaticamente
              feedbackNarration = option.feedback.subtitle 
                ? `${option.feedback.title}. ${option.feedback.subtitle}`
                : option.feedback.title;
              
              console.log(`[V7-vv] ℹ️ Auto-generated narration for ${option.id}: "${feedbackNarration.substring(0, 50)}..."`);
            }

            if (feedbackNarration) {
              console.log(`[V7-vv] Generating feedback audio for option ${option.id}`);

              const feedbackResult = await generateAudio(
                feedbackNarration,
                voiceId,
                supabase,
                `v7-feedback-${option.id}`
              );

              if (feedbackResult.success) {
                // ✅ FASE 4 FIX: Determinar trigger baseado em isCorrect
                const trigger = option.isCorrect ? 'quiz-correct-answer' : 'quiz-incorrect-answer';
                const feedbackKey = `feedback-${option.id}`;

                // ✅ FASE 4 FIX: Armazenar como objeto indexado por key
                feedbackAudios[feedbackKey] = {
                  id: feedbackKey,
                  url: feedbackResult.url || '',
                  duration: feedbackResult.duration || 0,
                  wordTimestamps: feedbackResult.wordTimestamps || [],
                  trigger,
                };
                console.log(`[V7-vv] ✅ Feedback audio for ${option.id}: ${feedbackResult.duration?.toFixed(1)}s (${trigger})`);
              } else {
                console.warn(`[V7-vv] ⚠️ Failed to generate feedback audio for ${option.id}: ${feedbackResult.error}`);
              }
            } else {
              console.warn(`[V7-vv] ⚠️ Option ${option.id} has no feedback text to generate audio`);
            }
          }
        }
      }

      console.log(`[V7-vv] Generated ${Object.keys(feedbackAudios).length} feedback audios`);
    } else {
      console.log('[V7-vv] Step 3: SKIPPED (preserve_structure mode - no new feedback audios)');
    }

    // =========================================================================
    // PASSO 3.5: MICRO-VISUAL AUTO-ENRICHMENT
    // Analisa narração e injeta microVisuals automáticos (stat, step)
    // NON-BREAKING: erros internos nunca interrompem o pipeline
    // =========================================================================
    if (!preserveStructureMode && input.scenes?.length > 0) {
      try {
        console.log('[V7-vv] Step 3.5: MicroVisual Auto-Enrichment...');
        const enrichStats = enrichMicroVisualsFromNarration(input.scenes);
        console.log(
          `[V7-vv] Step 3.5 DONE: ${enrichStats.totalInjected} microVisuais injetados` +
          ` (stat: ${enrichStats.statCount}, step: ${enrichStats.stepCount})`
        );
      } catch (enrichErr) {
        console.warn(`[V7-vv] ⚠️ Step 3.5 falhou silenciosamente: ${enrichErr}. Pipeline continua.`);
      }
    } else {
      console.log('[V7-vv] Step 3.5: SKIPPED (preserve_structure mode ou sem cenas)');
    }

    // =========================================================================
    // PASSO 4: GERAR FASES
    // ✅ C02: Skip when preserve_structure (uses existing phases from DB)
    // =========================================================================
    let phases: Phase[] = [];
    
    if (!preserveStructureMode) {
      console.log('[V7-vv] Step 4: Generating phases...');
      phases = generatePhases(input.scenes, mainAudio.wordTimestamps, mainAudio.duration);

      // =========================================================================
      // PASSO 4.5: RECALCULAR TIMINGS COM BASE EM KEYWORDS (FASE 1 FIX)
      // =========================================================================
      if (mainAudio.wordTimestamps.length > 0) {
        console.log('[V7-vv] Step 4.5: Recalculating word-based timings...');
        calculateWordBasedTimings(phases, mainAudio.wordTimestamps, input.scenes);
      }
      
      // =========================================================================
      // PASSO 4.6: C06 SINGLE TRIGGER CONTRACT - Normalizar antes de build
      // =========================================================================
      console.log('[V7-vv] Step 4.6: Applying C06 Single Trigger Contract...');
      const c06Result = c06NormalizeTriggerContract(phases);
      phases = c06Result.normalizedPhases;
      console.log(`[V7-vv] C06: Removed ${c06Result.c06Stats.removedTriggerTimeCount} triggerTime, created ${c06Result.c06Stats.showActionsCreated} show actions`);

      // =========================================================================
      // PASSO 4.7: BOUNDARY_FIX_GUARD - Invariantes invioláveis de timeline
      // =========================================================================
      console.log('[V7-vv] Step 4.7: Applying BOUNDARY_FIX_GUARD...');
      const boundaryResult = applyBoundaryFixGuard(phases, mainAudio.duration);
      phases = boundaryResult.fixedPhases;
      
      if (boundaryResult.failedBoundaries.length > 0) {
        const errorMsg = `BOUNDARY_FIX_GUARD FALHOU: ${boundaryResult.failedBoundaries.join(', ')}`;
        console.error(`[V7-vv] ❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      if (boundaryResult.boundaryFixesApplied > 0) {
        console.log(`[V7-vv] ⚠️ BOUNDARY_FIX: ${boundaryResult.boundaryFixesApplied} correções aplicadas`);
      } else {
        console.log('[V7-vv] ✅ BOUNDARY_FIX: Boundaries válidos, sem correções');
      }

      // =========================================================================
      // PASSO 4.8: ANCHOR_BOUNDARY_REVALIDATION - Filtrar anchors show fora do range
      // =========================================================================
      console.log('[V7-vv] Step 4.8: ANCHOR_BOUNDARY_REVALIDATION...');
      const ANCHOR_REVALIDATION_EPS = 0.30; // mesma tolerancia do Step 4.5
      let totalAnchorsRemoved = 0;
      let totalAnchorsKept = 0;

      for (const phase of phases) {
        if (!phase.anchorActions || !Array.isArray(phase.anchorActions)) continue;

        const validAnchors: any[] = [];
        for (const anchor of phase.anchorActions) {
          // Anchors que NAO sao show: manter sempre (pause, transition, etc.)
          if (anchor.type !== 'show') {
            validAnchors.push(anchor);
            continue;
          }
          // Show anchors sem keywordTime: manter (serao resolvidos pelo renderer)
          if (anchor.keywordTime == null) {
            validAnchors.push(anchor);
            continue;
          }
          // Validar: keywordTime deve estar dentro de [startTime - EPS, endTime]
          const inRange =
            anchor.keywordTime >= (phase.startTime - ANCHOR_REVALIDATION_EPS) &&
            anchor.keywordTime <= phase.endTime;

          if (inRange) {
            validAnchors.push(anchor);
            totalAnchorsKept++;
          } else {
            totalAnchorsRemoved++;
            console.warn(
              `[ANCHOR_BOUNDARY_REVALIDATION] REMOVED: "${anchor.id}" ` +
              `keywordTime=${anchor.keywordTime.toFixed(3)}s ` +
              `OUTSIDE phase "${phase.id}" [${phase.startTime.toFixed(3)}s, ${phase.endTime.toFixed(3)}s]`
            );
          }
        }
        phase.anchorActions = validAnchors;
      }

      console.log(
        `[V7-vv] Step 4.8: ANCHOR_BOUNDARY_REVALIDATION complete. ` +
        `Kept=${totalAnchorsKept}, Removed=${totalAnchorsRemoved}`
      );
    } else {
      console.log('[V7-vv] Step 4: SKIPPED (preserve_structure mode - uses existing phases)');
    }

    // =========================================================================
    // PASSO 4.9: IMAGE GENERATION VIA IMAGE LAB BRIDGE (NON-BLOCKING)
    // Scans microVisuals type=image with content.promptScene but no url/storagePath.
    // Calls image-lab-pipeline-bridge (service_role_key) to generate images.
    // Fallback: if bridge fails, pipeline continues without images (warning only).
    // =========================================================================
    // === C15: Bridge traceability report ===
    const bridgeReport: {
      bridgeCalled: boolean;
      scenesSubmitted: number;
      scenesResolved: number;
      scenesDegraded: number;
      scenesFailedSanitization: number;
      errors: string[];
      bridgeHttpStatus?: number;
    } = {
      bridgeCalled: false,
      scenesSubmitted: 0,
      scenesResolved: 0,
      scenesDegraded: 0,
      scenesFailedSanitization: 0,
      errors: [],
    };

    if (!preserveStructureMode) {
      const imageScenesForBridge: Array<{ scene_id: string; prompt_scene: string; style_hints?: string; phaseIdx: number; mvIdx: number }> = [];
      // Track image-sequence frames separately for injection
      const imageSequenceFrames: Array<{ frameId: string; prompt_scene: string; phaseIdx: number; frameIdx: number }> = [];
      // ✅ NEW: Track visual.type='image' narrative phases for bridge generation
      const imageNarrativeScenes: Array<{ scene_id: string; prompt_scene: string; style_hints?: string; phaseIdx: number }> = [];

      for (let pi = 0; pi < phases.length; pi++) {
        const phase = phases[pi];
        
        // ✅ C12.1: Scan image-sequence frames for bridge generation
        if (phase.visual?.type === 'image-sequence' && Array.isArray(phase.visual.frames)) {
          for (let fi = 0; fi < phase.visual.frames.length; fi++) {
            const frame = phase.visual.frames[fi];
            if (
              frame.promptScene &&
              typeof frame.promptScene === 'string'
              // Always generate — the bridge has cache dedup via prompt hash
            ) {
              imageSequenceFrames.push({
                frameId: frame.frameId || `frame-${fi}`,
                prompt_scene: frame.promptScene,
                phaseIdx: pi,
                frameIdx: fi,
              });
            }
          }

          // ✅ NEW: Scan visual.type='image' narrative phases for bridge generation
          // Only when phase has promptScene AND no valid storagePath yet (PENDING or missing)
          if (
            phase.visual?.type === 'image' &&
            phase.visual.promptScene &&
            typeof phase.visual.promptScene === 'string' &&
            (
              !phase.visual.storagePath ||
              (phase.visual.storagePath as string).startsWith('PENDING:')
            )
          ) {
            imageNarrativeScenes.push({
              scene_id: phase.id,
              prompt_scene: phase.visual.promptScene as string,
              style_hints: (phase.visual as any).styleHints || undefined,
              phaseIdx: pi,
            });
            console.log(`[V7-vv] Step 4.9: NARRATIVE_IMAGE_SCENE queued for bridge: phase=${phase.id} promptScene="${(phase.visual.promptScene as string).substring(0, 60)}..."`);
          }
        }
        
        // Original: Scan microVisuals
        if (!phase.microVisuals) continue;
        for (let mi = 0; mi < phase.microVisuals.length; mi++) {
          const mv = phase.microVisuals[mi];
          const content = mv.content as Record<string, unknown>;
          if (
            (mv.type === 'image' || mv.type === 'image-flash') &&
            content.promptScene &&
            typeof content.promptScene === 'string' &&
            !content.url &&
            !content.imageUrl &&
            !content.storagePath
          ) {
            imageScenesForBridge.push({
              scene_id: mv.id,
              prompt_scene: content.promptScene as string,
              style_hints: (content.styleHints as string) || undefined,
              phaseIdx: pi,
              mvIdx: mi,
            });
          }
        }
      }

      // Combine both sources for bridge call
      const allScenesForBridge = [
        ...imageScenesForBridge.map(s => ({
          scene_id: s.scene_id,
          prompt_scene: s.prompt_scene,
          style_hints: s.style_hints,
        })),
        ...imageSequenceFrames.map(f => ({
          scene_id: f.frameId,
          prompt_scene: f.prompt_scene,
          style_hints: undefined as string | undefined,
        })),
        // ✅ NEW: visual.type='image' narrative phases
        ...imageNarrativeScenes.map(s => ({
          scene_id: s.scene_id,
          prompt_scene: s.prompt_scene,
          style_hints: s.style_hints,
        })),
      ];

      if (allScenesForBridge.length > 0) {
        bridgeReport.scenesSubmitted = allScenesForBridge.length;
        console.log(`[V7-vv] Step 4.9: IMAGE_LAB_BRIDGE — ${imageScenesForBridge.length} microVisual(s) + ${imageSequenceFrames.length} sequence frame(s) + ${imageNarrativeScenes.length} narrative image(s) to generate`);
        try {
          const bridgeUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/image-lab-pipeline-bridge`;
          const bridgeServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

          // Use preset from input or from the first scene's visual
          const firstSequencePhase = phases.find(p => p.visual?.type === 'image-sequence');
          const presetKey = (input as any).image_preset_key 
            || (firstSequencePhase?.visual as any)?.presetKey 
            || 'cinematic-01';

          const bridgePayload = {
            scenes: allScenesForBridge,
            preset_key: presetKey,
            size: (input as any).image_size || '1536x1024',
            provider: (input as any).image_provider || 'gemini',
          };

          const bridgeController = new AbortController();
          const bridgeTimeout = setTimeout(() => bridgeController.abort(), 180_000);

          let bridgeResp: Response;
          bridgeReport.bridgeCalled = true;
          try {
            bridgeResp = await fetch(bridgeUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${bridgeServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(bridgePayload),
              signal: bridgeController.signal,
            });
          } finally {
            clearTimeout(bridgeTimeout);
          }

          bridgeReport.bridgeHttpStatus = bridgeResp.status;

          if (bridgeResp.ok) {
            const bridgeData = await bridgeResp.json();
            const results = bridgeData.results || [];
            let injectedMv = 0;
            let injectedFrames = 0;

            for (const result of results) {
              // ✅ P3 FIX: Handle degraded results explicitly
              if (result.status === 'degraded' || !result.storage_path) {
                bridgeReport.scenesDegraded++;
                console.warn(`[V7-vv] Step 4.9: ⚠️ Scene ${result.scene_id} returned degraded — will sanitize storagePath`);
                continue;
              }

              if (result.storage_path) {
                // Try to match microVisual first
                const mvMatch = imageScenesForBridge.find(s => s.scene_id === result.scene_id);
                if (mvMatch) {
                  const mv = phases[mvMatch.phaseIdx].microVisuals![mvMatch.mvIdx];
                  (mv.content as Record<string, unknown>).storagePath = result.storage_path;
                  (mv.content as Record<string, unknown>).assetId = result.asset_id;
                  injectedMv++;
                  continue;
                }

                // Try to match image-sequence frame
                const frameMatch = imageSequenceFrames.find(f => f.frameId === result.scene_id);
                if (frameMatch && phases[frameMatch.phaseIdx].visual?.frames) {
                  const frame = phases[frameMatch.phaseIdx].visual.frames![frameMatch.frameIdx];
                  frame.storagePath = result.storage_path;
                  injectedFrames++;
                  continue;
                }

                // ✅ NEW: Try to match visual.type='image' narrative scene
                const narrativeMatch = imageNarrativeScenes.find(s => s.scene_id === result.scene_id);
                if (narrativeMatch) {
                  const targetPhase = phases[narrativeMatch.phaseIdx];
                  // Inject at root level (Player reads visual.storagePath first)
                  (targetPhase.visual as Record<string, unknown>).storagePath = result.storage_path;
                  // Also inject in content for Player fallback path
                  if (targetPhase.visual.content && typeof targetPhase.visual.content === 'object') {
                    (targetPhase.visual.content as Record<string, unknown>).storagePath = result.storage_path;
                    (targetPhase.visual.content as Record<string, unknown>).assetId = result.asset_id;
                  }
                  console.log(`[V7-vv] Step 4.9: ✅ NARRATIVE_IMAGE injected: phase=${targetPhase.id} storagePath=${result.storage_path}`);
                  injectedMv++; // reuse counter — represents all visual injections
                }
              }
            }

            bridgeReport.scenesResolved = injectedMv + injectedFrames;
            console.log(`[V7-vv] Step 4.9: ✅ IMAGE_LAB_BRIDGE complete. MicroVisuals=${injectedMv}, SequenceFrames=${injectedFrames}, Degraded=${bridgeReport.scenesDegraded}`);
          } else {
            const errText = await bridgeResp.text();
            bridgeReport.errors.push(`HTTP ${bridgeResp.status}: ${errText.substring(0, 300)}`);
            console.warn(`[V7-vv] Step 4.9: ⚠️ IMAGE_LAB_BRIDGE returned ${bridgeResp.status}: ${errText.substring(0, 300)}`);
            console.warn('[V7-vv] Step 4.9: Pipeline continues without images (non-blocking fallback)');
          }
        } catch (bridgeErr: any) {
          bridgeReport.errors.push(bridgeErr.message);
          console.warn(`[V7-vv] Step 4.9: ⚠️ IMAGE_LAB_BRIDGE error: ${bridgeErr.message}`);
          console.warn('[V7-vv] Step 4.9: Pipeline continues without images (non-blocking fallback)');
        }

        // =====================================================================
        // ✅ P3 FIX (C13): SANITIZE FICTITIOUS storagePaths POST-BRIDGE
        // Any storagePath that doesn't match the valid format {uuid}/{uuid}/N.png
        // is marked as PENDING:bridge-failed to prevent silent renderer failures.
        // =====================================================================
        const VALID_STORAGE_PATH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/\d+\.png$/i;

        for (const phase of phases) {
          // Sanitize image-sequence frames
          if (phase.visual?.type === 'image-sequence' && Array.isArray(phase.visual.frames)) {
            for (const frame of phase.visual.frames) {
              if (frame.storagePath && !VALID_STORAGE_PATH_RE.test(frame.storagePath)) {
                console.warn(`[V7-vv] Step 4.9: C13_SANITIZE — Replacing fictitious storagePath: ${frame.storagePath}`);
                frame.storagePath = `PENDING:bridge-failed:${frame.storagePath}`;
                bridgeReport.scenesFailedSanitization++;
              }
            }
          }
          // Sanitize microVisuals
          if (phase.microVisuals) {
            for (const mv of phase.microVisuals) {
              const content = mv.content as Record<string, unknown>;
              if (
                (mv.type === 'image' || mv.type === 'image-flash') &&
                content.storagePath &&
                typeof content.storagePath === 'string' &&
                !VALID_STORAGE_PATH_RE.test(content.storagePath as string)
              ) {
                console.warn(`[V7-vv] Step 4.9: C13_SANITIZE — Replacing fictitious storagePath in microVisual: ${content.storagePath}`);
                content.storagePath = `PENDING:bridge-failed:${content.storagePath}`;
                bridgeReport.scenesFailedSanitization++;
              }
            }
          }
        }

        if (bridgeReport.scenesFailedSanitization > 0) {
          console.warn(`[V7-vv] Step 4.9: C13_SANITIZE — ${bridgeReport.scenesFailedSanitization} storagePath(s) replaced with PENDING marker`);
        }
      } else {
        console.log('[V7-vv] Step 4.9: No image microVisuals or sequence frames with promptScene found — skipping');
      }
    }

    // =========================================================================
    // ✅ FASE B: C13_IMAGE — Sanitize visual.type='image' storagePaths
    // Roda SEMPRE, fora do bloco bridge (que pode ser pulado se não há promptScene)
    // Converte paths fictícios em PENDING:bridge-failed: para rastreabilidade
    // =========================================================================
    {
      const IMAGE_VALID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/\d+\.png$/i;
      let imageSanitizedCount = 0;

      for (const phase of phases) {
        if (phase.visual?.type !== 'image') continue;

        // Sanitizar root-level storagePath
        if (phase.visual.storagePath && typeof phase.visual.storagePath === 'string') {
          if (!IMAGE_VALID_RE.test(phase.visual.storagePath)) {
            const original = phase.visual.storagePath;
            phase.visual.storagePath = `PENDING:bridge-failed:${original}`;
            console.warn(`[V7-vv] C13_IMAGE: phase=${phase.id} root storagePath fictício: "${original}" → PENDING`);
            imageSanitizedCount++;
          }
        }

        // Sincronizar content.storagePath para consistência (Player lê ambos)
        const contentSP = (phase.visual.content as any)?.storagePath;
        if (contentSP && typeof contentSP === 'string') {
          if (!IMAGE_VALID_RE.test(contentSP)) {
            const originalContent = contentSP;
            (phase.visual.content as any).storagePath = `PENDING:bridge-failed:${originalContent}`;
            console.warn(`[V7-vv] C13_IMAGE: phase=${phase.id} content.storagePath fictício: "${originalContent}" → PENDING`);
            imageSanitizedCount++;
          }
        }
      }

      if (imageSanitizedCount > 0) {
        console.warn(`[V7-vv] C13_IMAGE: ${imageSanitizedCount} storagePath(s) sanitizados para visual.type='image'`);
      } else {
        console.log('[V7-vv] C13_IMAGE: Nenhum storagePath fictício encontrado em fases visual.type=image');
      }
    }

    // =========================================================================
    // PASSO 5: CONSTRUIR OUTPUT
    // ✅ C02: Skip when preserve_structure (lessonData not needed - uses DB content)
    // =========================================================================
    // totalDuration precisa ser calculado aqui para uso posterior
    const totalDuration = phases.length > 0 ? phases[phases.length - 1].endTime : mainAudio.duration;
    let lessonData: LessonData | null = null;
    let debugReport: V7PipelineDebugReport | null = null;
    
    if (!preserveStructureMode) {
      console.log('[V7-vv] Step 5: Building output...');

      // ✅ P4 FIX: Removed duplicate totalDuration declaration (uses outer scope)

      // ✅ FASE 2 FIX: Calcular flags para metadata
      const hasInteractivePhases = phases.some(p => ['interaction', 'quiz'].includes(p.type));
      const hasPlayground = phases.some(p => p.type === 'playground');
      const hasPostLessonExercises = !!(input.postLessonExercises && input.postLessonExercises.length > 0);

      lessonData = {
        // ✅ P5 FIX (C14): contentVersion no root do content JSON
        contentVersion: 'v7-vv',
        // ✅ FASE 2 FIX: Estrutura compatível com OUTPUT funcional
        schema: 'v7-vv',                           // Bug 7: era "model"
        version: '1.0.0',                          // Bug 8: formato correto
        title: input.title,                        // Bug 9: title no root
        subtitle: input.subtitle || '',            // Bug 9: subtitle no root
        difficulty: input.difficulty,
        category: input.category,
        tags: input.tags,
        learningObjectives: input.learningObjectives,
        estimatedDuration: Math.ceil(totalDuration),
        metadata: {
          version: 'v7-vv',                        // Bug 10: metadata.version
          phaseCount: phases.length,
          totalDuration,
          hasInteractivePhases,                    // Bug 11: flag
          hasPlayground,                           // Bug 11: flag
          hasPostLessonExercises,                  // Bug 11: flag
          // ✅ C06: Trigger contract metadata
          triggerContract: 'anchorActions',
        },
        phases,
        audio: {
          mainAudio,
          // ✅ FASE 4 FIX: feedbackAudios como objeto (Frontend acessa por key)
          feedbackAudios: Object.keys(feedbackAudios).length > 0 ? feedbackAudios : undefined,
        },
        // ✅ FASE 1 FIX: Passar campos direto do INPUT para OUTPUT
        postLessonExercises: input.postLessonExercises,
        postLessonFlow: input.postLessonFlow,
        gamification: input.gamification,
      };

      // =========================================================================
      // PASSO 5.5: GERAR DEBUG REPORT AUTOMÁTICO
      // =========================================================================
      console.log('[V7-vv] Step 5.5: Generating debug report...');
      
      const fullNarrationForDebug = input.scenes
        .map(s => s.narration.trim())
        .filter(n => n.length > 0)
        .join('\n\n');
      
      debugReport = generatePipelineDebug(
        'pending', // ID será preenchido após salvar
        input.title,
        input.scenes,
        mainAudio,
        phases,
        fullNarrationForDebug,
        feedbackAudios // ✅ FASE 4: Incluir para validação
      );
    } else {
      console.log('[V7-vv] Step 5: SKIPPED (preserve_structure mode - uses DB content)');
      console.log('[V7-vv] Step 5.5: SKIPPED (preserve_structure mode - no debug report)');
    }

    // =========================================================================
    // PASSO 6: SALVAR NO BANCO (INSERT ou UPDATE para reprocess)
    // =========================================================================
    console.log('[V7-vv] Step 6: Saving to database...');

    let lessonId: string;
    // C05.2: Variável para rastrear o content FINAL que foi persistido
    // Isso garante que o hash seja calculado do EXATO objeto salvo no banco
    let persistedContent: any = null;
    
    // ✅ C02: REPROCESS MODE - UPDATE na lição existente COM AUDITORIA v4.1
    // Suporta dois modos:
    // 1. reprocess_preserve_structure: true → usa phases existentes, recalcula APENAS keywordTime
    // 2. reprocess_preserve_structure: false (default) → regenera phases a partir de scenes
    const preserveStructure = (input as any).reprocess_preserve_structure === true;
    
    if (isReprocess && input.existing_lesson_id) {
      console.log(`[V7-vv] 🔄 REPROCESS: Atualizando lição existente ${input.existing_lesson_id}`);
      console.log(`[V7-vv] 🔄 REPROCESS MODE: ${preserveStructure ? 'PRESERVE_STRUCTURE (C02)' : 'REGENERATE (C01)'}`);
      
      // Validar run_id obrigatório (idempotency key)
      const runId = (input as any).run_id;
      if (!runId) {
        throw new Error('run_id is required for reprocess (idempotency key)');
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(runId)) {
        throw new Error('run_id must be a valid UUID');
      }
      
      // ✅ C04: Determinar migration_version baseado no modo (c04 quando preserveStructure)
      const migrationVersion = preserveStructure ? 'v2.4-c04-fix' : 'v2.1-c01-fix';
      
      let oldContent: any = null;
      let c02MultiMatchReport: RecalculatedPhase['multiMatchCases'] = [];
      let c02Stats = { t1: 0, t2: 0, totalAnchors: 0 };
      let c04Stats: C04TimelineStats | null = null;
      let c06Stats: C06NormalizationStats | null = null;
      let c06Diff: C06DiffSummary | null = null;
      
      try {
        // 1. Buscar content atual para snapshot
        console.log(`[V7-vv] AUDIT: Fetching current lesson content...`);
        const { data: currentLesson, error: fetchError } = await supabase
          .from('lessons')
          .select('content')
          .eq('id', input.existing_lesson_id)
          .single();
        
        if (fetchError || !currentLesson) {
          throw new Error(`Failed to fetch current lesson: ${fetchError?.message || 'Not found'}`);
        }
        
        oldContent = currentLesson.content;
        
        // 2. Inserir audit com status in_progress
        console.log(`[V7-vv] AUDIT: Creating audit record with run_id ${runId}...`);
        const { error: auditInsertError } = await supabase
          .from('lesson_migrations_audit')
          .insert({
            lesson_id: input.existing_lesson_id,
            run_id: runId,
            migration_version: migrationVersion,
            migration_status: 'in_progress',
            old_content: oldContent,
            triggered_by: preserveStructure ? 'v7-vv-c02-preserve' : 'v7-vv-reprocess'
          });
        
        // Tratamento do erro 23505 (duplicate key - idempotência)
        if (auditInsertError) {
          if (auditInsertError.code === '23505') {
            console.log(`[V7-vv] AUDIT: Duplicate run_id ${runId}, checking existing status...`);
            
            const { data: existingAudit } = await supabase
              .from('lesson_migrations_audit')
              .select('migration_status')
              .eq('lesson_id', input.existing_lesson_id)
              .eq('run_id', runId)
              .single();
            
            if (existingAudit?.migration_status === 'completed') {
              console.log(`[V7-vv] AUDIT: Already completed for run_id ${runId}`);
              return new Response(JSON.stringify({
                success: true,
                lessonId: input.existing_lesson_id,
                message: 'Reprocess already completed (idempotent)',
                auditStatus: 'already_completed',
                runId
              }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            
            if (existingAudit?.migration_status === 'in_progress') {
              console.log(`[V7-vv] AUDIT: Already in progress for run_id ${runId}`);
              return new Response(JSON.stringify({
                success: false,
                error: 'Another reprocess is already in progress for this run_id',
                auditStatus: 'already_in_progress',
                runId,
                recommendation: 'Wait for completion or use a new run_id'
              }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            
            if (existingAudit?.migration_status === 'failed') {
              console.log(`[V7-vv] AUDIT: Previous run failed for run_id ${runId}`);
              return new Response(JSON.stringify({
                success: false,
                error: 'Previous reprocess with this run_id failed. Use a new run_id for retry.',
                auditStatus: 'previous_failed',
                runId,
                recommendation: 'Generate a new run_id for retry'
              }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
          } else {
            throw new Error(`Audit insert failed: ${auditInsertError.message}`);
          }
        }
        
        // ✅ C02 + C03 + C04: PRESERVE_STRUCTURE MODE
        // C04: Timeline global hardening (monotonicidade, overlap, clamp)
        // C03: Corrigir durações negativas/zero
        // C02: Recalcular keywordTime
        let finalLessonData: any;
        let c03Stats: C03TimingStats | null = null;
        
        if (preserveStructure && oldContent?.phases) {
          console.log(`[V7-vv] C02+C03+C04: Using PRESERVE_STRUCTURE mode`);
          
          // =========================================================================
          // ✅ PHASE_DRIFT_FIX (REPROCESS): Corrigir boundaries baseado em word timestamps
          // Isso DEVE rodar ANTES do C04 para que os boundaries sejam corrigidos
          // antes da normalização de timeline
          // =========================================================================
          console.log(`[V7-vv] PHASE_DRIFT_FIX: Checking for narration drift...`);
          const driftCorrectedPhases = applyPhaseDriftFixReprocess(
            oldContent.phases,
            mainAudio.wordTimestamps
          );
          
          // ✅ C04: PRIMEIRO normalizar timeline global (monotonicidade, overlap, clamp)
          // ✅ C07.3: Agora passa wordTimestamps para PREPASS alignment
          console.log(`[V7-vv] C04: Normalizing global phase timeline...`);
          const c04Result = normalizePhaseTimeline(
            driftCorrectedPhases, // ← Usar phases com DRIFT FIX aplicado
            mainAudio.duration,
            mainAudio.wordTimestamps // ✅ C07.3: Para alinhamento com primeira palavra
          );
          c04Stats = c04Result.c04Stats;
          
          // ✅ C03: DEPOIS corrigir durações individuais (negativo/zero/micro)
          console.log(`[V7-vv] C03: Correcting phase timings...`);
          const c03Result = recalculatePhaseTimings(
            c04Result.normalizedPhases,  // Usar fases já normalizadas pelo C04
            mainAudio.duration
          );
          c03Stats = c03Result.c03Stats;
          
          // ✅ C02: POR FIM recalcular keywordTime usando fases com timing corrigido
          console.log(`[V7-vv] C02: Recalculating anchor keywordTime...`);
          const recalcResult = recalculateAnchorKeywordTimes(
            c03Result.updatedPhases, // Usar fases com timing já corrigido por C04+C03
            mainAudio.wordTimestamps
          );
          
          c02MultiMatchReport = recalcResult.multiMatchReport;
          c02Stats = {
            t1: recalcResult.t1Count,
            t2: recalcResult.t2Count,
            totalAnchors: recalcResult.totalAnchorsRecalculated
          };
          
          // ✅ C06: Aplicar Single Trigger Contract
          console.log(`[V7-vv] C06: Applying Single Trigger Contract...`);
          const c06Result = c06NormalizeTriggerContract(recalcResult.updatedPhases);
          c06Stats = c06Result.c06Stats;
          c06Diff = c06Result.c06Diff;
          console.log(`[V7-vv] C06: Removed ${c06Stats.removedTriggerTimeCount} triggerTime, created ${c06Stats.showActionsCreated} show actions`);
          
          // ✅ C03 COMPAT GUARD: Auto-convert legacy phases without scenes[]
          const c03CompatPhases = c06Result.normalizedPhases.map((phase: any) => ({
            ...phase,
            scenes: phase.scenes?.length > 0 ? phase.scenes : [{
              id: `${phase.id}-s1-auto`,
              type: phase.type,
              startTime: phase.startTime,
              endTime: phase.endTime,
              duration: phase.endTime - phase.startTime,
              narration: '',
              content: phase.visual?.content || {},
              animation: 'fade',
            }],
          }));
          const c03AutoConverted = c03CompatPhases.filter((p: any, i: number) => 
            !c06Result.normalizedPhases[i]?.scenes?.length
          ).length;
          if (c03AutoConverted > 0) {
            console.log(`[C03_COMPAT] Auto-converted ${c03AutoConverted} legacy phases without scenes[]`);
          }

          // Preservar estrutura completa com correções C02 + C03 + C04 + C06
          finalLessonData = {
            ...oldContent,
            phases: c03CompatPhases, // ← Usar phases com C03 compat guard
            // Atualizar metadata
            metadata: {
              ...oldContent.metadata,
              lastRecalculatedAt: new Date().toISOString(),
              triggerContract: 'anchorActions', // ✅ C06: Marca contrato
              c02Applied: true,
              c02Stats,
              c03Applied: c03Stats.t3Fixed > 0,  // ✅ C03.1: Só true se houve fix real
              c03Stats: {
                t3NegativeBefore: c03Stats.t3Negative,
                t3ZeroBefore: c03Stats.t3Zero,
                t3MicroBefore: c03Stats.t3Micro,
                t3NegativeAfter: c03Stats.t3NegativeAfter,
                t3ZeroAfter: c03Stats.t3ZeroAfter,
                t3MicroAfter: c03Stats.t3MicroAfter,
                t3Fixed: c03Stats.t3Fixed,
                audioDuration: c03Stats.audioDuration
              },
              c04Applied: c04Stats.fixApplied,
              c04Stats: {
                t4OverlapBefore: c04Stats.t4OverlapBefore,
                t4OverlapAfter: c04Stats.t4OverlapAfter,
                t4NonMonotonicEndBefore: c04Stats.t4NonMonotonicEndBefore,
                t4NonMonotonicEndAfter: c04Stats.t4NonMonotonicEndAfter,
                t4OutsideAudioBefore: c04Stats.t4OutsideAudioBefore,
                t4OutsideAudioAfter: c04Stats.t4OutsideAudioAfter,
                t4GapBefore: c04Stats.t4GapBefore,
                t4GapAfter: c04Stats.t4GapAfter,
                fixApplied: c04Stats.fixApplied,
                audioDuration: c04Stats.audioDuration
              },
              // ✅ C06: Stats no metadata
              c06Applied: c06Stats.removedTriggerTimeCount > 0 || c06Stats.showActionsCreated > 0,
              c06Stats: c06Stats
            }
          };
          
          console.log(`[V7-vv] C04: Timeline normalized. fixApplied=${c04Stats.fixApplied}, Changes=${c04Stats.phaseTimelineChanges.length}`);
          console.log(`[V7-vv] C03: Fixed ${c03Stats.t3Fixed} phases. Negative=${c03Stats.t3Negative}, Zero=${c03Stats.t3Zero}, Micro=${c03Stats.t3Micro}`);
          console.log(`[V7-vv] C02: Recalculated ${c02Stats.totalAnchors} anchors. T1=${c02Stats.t1}, T2=${c02Stats.t2}`);
        } else {
          // Modo original: usar lessonData gerado a partir de scenes
          finalLessonData = lessonData;
        }
        
        // =====================================================================
        // 3. C06.1 + C07 FINAL GUARD: Normalização ABSOLUTA antes de persistir
        // Esta é a última linha de defesa para garantir:
        // - triggerTime = 0 (C06)
        // - Toda fase interativa tem pause action (C07)
        // =====================================================================
        console.log(`[V7-vv] C06.1 + C07: FINAL GUARD - Applying normalization before persist...`);
        
        let c07Stats: C07Stats | null = null;
        
        // Aplicar C06 + C07 nas phases do finalLessonData
        if (finalLessonData && finalLessonData.phases && Array.isArray(finalLessonData.phases)) {
          // C06: Remove triggerTime, ensure show actions
          const c06FinalResult = c06NormalizeTriggerContract(finalLessonData.phases);
          
          // C10: Ensure pause actions for interactive phases (HARD PAUSE ANCHOR CONTRACT)
          // Note: In REPROCESS mode without input.scenes, we pass empty array
          // The function will validate existing pauses or skip if no pauseAt available
          const c07Result = c07EnsurePauseForInteractivePhases(c06FinalResult.normalizedPhases, mainAudio.wordTimestamps, input.scenes || []);
          finalLessonData.phases = c07Result.updatedPhases;
          c07Stats = c07Result.c07Stats;
          
          // Garantir metadata com triggerContract e c07Applied
          if (!finalLessonData.metadata) {
            finalLessonData.metadata = {};
          }
          finalLessonData.metadata.triggerContract = 'anchorActions';
          finalLessonData.metadata.c07Applied = c07Stats.pausesInserted > 0;
          finalLessonData.metadata.c07Stats = c07Stats;
          
          console.log(`[V7-vv] C06.1: FINAL GUARD applied - removed ${c06FinalResult.c06Stats.removedTriggerTimeCount} triggerTime`);
          console.log(`[V7-vv] C07: FINAL GUARD applied - inserted ${c07Stats.pausesInserted} auto-pause actions`);
          
          // Atualizar stats para o diff_summary
          if (!c06Stats) {
            c06Stats = c06FinalResult.c06Stats;
            c06Diff = c06FinalResult.c06Diff;
          } else {
            // Merge stats se já existirem
            c06Stats.removedTriggerTimeCount += c06FinalResult.c06Stats.removedTriggerTimeCount;
          }
        }
        
        // 3.1. Executar UPDATE na lição
        console.log(`[V7-vv] AUDIT: Updating lesson content...`);
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            content: finalLessonData,
            estimated_time: Math.ceil(totalDuration / 60),
          })
          .eq('id', input.existing_lesson_id);

        if (updateError) {
          throw new Error(`Lesson update failed: ${updateError.message}`);
        }
        
        // C05.2: Salvar referência do content persistido para hash
        persistedContent = finalLessonData;
        
        // 4. Computar diff e marcar como completed
        console.log(`[V7-vv] AUDIT: Computing anchor diff...`);
        const diffSummary = await computeAnchorDiffStrong(oldContent, finalLessonData);
        
        // ✅ C02 + C03.1 + C04: Adicionar reports ao diff_summary com métricas completas
        const enrichedDiffSummary = {
          ...diffSummary,
          c02Mode: preserveStructure,
          c02Stats: preserveStructure ? c02Stats : null,
          c02MultiMatchReport: preserveStructure ? c02MultiMatchReport.slice(0, 10) : null, // Top 10
          // ✅ C03.1: Métricas completas com AFTER e reason
          c03Mode: preserveStructure,
          c03: preserveStructure && c03Stats ? {
            audioDuration: c03Stats.audioDuration,
            before: {
              t3Negative: c03Stats.t3Negative,
              t3Zero: c03Stats.t3Zero,
              t3Micro: c03Stats.t3Micro
            },
            after: {
              t3Negative: c03Stats.t3NegativeAfter,
              t3Zero: c03Stats.t3ZeroAfter,
              t3Micro: c03Stats.t3MicroAfter
            },
            t3Fixed: c03Stats.t3Fixed,
            fixApplied: c03Stats.t3Fixed > 0,
            phaseTimingChanges: c03Stats.phaseTimingChanges.slice(0, 10) // Top 10 com reason
          } : null,
          // ✅ C04.1: Timeline global hardening metrics with enhanced structure
          c04Mode: preserveStructure,
          c04: preserveStructure && c04Stats ? {
            audioDuration: c04Stats.audioDuration,
            // ✅ C04.1: Estrutura hierárquica metricsBefore/After
            metricsBefore: c04Stats.metricsBefore,
            metricsAfter: c04Stats.metricsAfter,
            // ✅ C04.1: Métricas aprimoradas
            fixesAppliedCount: c04Stats.fixesAppliedCount,
            overlapCreatedByDurationFixCount: c04Stats.overlapCreatedByDurationFixCount,
            fixApplied: c04Stats.fixApplied,
            // ✅ C04.1: Compatibilidade (deprecated fields)
            before: {
              t4Overlap: c04Stats.t4OverlapBefore,
              t4NonMonotonicEnd: c04Stats.t4NonMonotonicEndBefore,
              t4OutsideAudio: c04Stats.t4OutsideAudioBefore,
              t4Gap: c04Stats.t4GapBefore
            },
            after: {
              t4Overlap: c04Stats.t4OverlapAfter,
              t4NonMonotonicEnd: c04Stats.t4NonMonotonicEndAfter,
              t4OutsideAudio: c04Stats.t4OutsideAudioAfter,
              t4Gap: c04Stats.t4GapAfter
            },
            phaseTimelineChanges: c04Stats.phaseTimelineChanges.slice(0, 10) // Top 10 com reason
          } : null,
          // ✅ C06: Single Trigger Contract metrics
          c06Mode: preserveStructure,
          c06: preserveStructure && c06Diff ? c06Diff : null,
          // ✅ C05.2: Hash algorithm metadata
          hashAlgorithm: 'canonical_jsonb_string+sha256',
          hashComputedAfterGuards: true
        };
        
        await supabase
          .from('lesson_migrations_audit')
          .update({
            new_content: finalLessonData,
            diff_summary: enrichedDiffSummary,
            migration_status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('lesson_id', input.existing_lesson_id)
          .eq('run_id', runId);
        
        console.log(`[V7-vv] AUDIT: ✅ Migration completed for run_id ${runId}`);
        console.log(`[V7-vv] AUDIT: C01 Valid: ${(diffSummary as any).c01Valid}, Reason: ${(diffSummary as any).c01Reason}`);
        if (preserveStructure) {
          console.log(`[V7-vv] AUDIT: C02 Stats: T1=${c02Stats.t1}, T2=${c02Stats.t2}, Total=${c02Stats.totalAnchors}`);
        }
        lessonId = input.existing_lesson_id;
        
      } catch (error) {
        // Marcar audit como failed com fallback INSERT
        console.error(`[V7-vv] AUDIT: Migration failed:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // UPDATE sem .select() - verificar apenas erro
        const { error: updateError } = await supabase
          .from('lesson_migrations_audit')
          .update({
            migration_status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('lesson_id', input.existing_lesson_id)
          .eq('run_id', runId);
        
        // Se UPDATE deu erro (registro não existe), fazer INSERT fallback
        if (updateError) {
          console.log(`[V7-vv] AUDIT: Update failed, inserting fallback record`);
          
          await supabase
            .from('lesson_migrations_audit')
            .upsert({
              lesson_id: input.existing_lesson_id,
              run_id: runId,
              migration_version: 'v2.1-c01-fix',
              migration_status: 'failed',
              old_content: oldContent || {},
              error_message: errorMessage,
              triggered_by: 'v7-vv-reprocess-failed',
              completed_at: new Date().toISOString()
            }, { onConflict: 'lesson_id,run_id' });
        }
        
        throw error;
      }
      
      console.log(`[V7-vv] ✅ Lesson UPDATED with audit: ${lessonId}`);
    } else {
      // INSERT normal (nova lição)
      
      // =====================================================================
      // C06.1 + C07 FINAL GUARD para INSERT: Normalização ABSOLUTA antes de persistir
      // =====================================================================
      console.log(`[V7-vv] C06.1 + C07: FINAL GUARD (INSERT) - Applying normalization before persist...`);
      
      if (lessonData && lessonData.phases && Array.isArray(lessonData.phases)) {
        // C06: Remove triggerTime, ensure show actions
        const c06FinalResult = c06NormalizeTriggerContract(lessonData.phases);
        
        // C10: Ensure pause actions for interactive phases (HARD PAUSE ANCHOR CONTRACT)
        const c07Result = c07EnsurePauseForInteractivePhases(c06FinalResult.normalizedPhases, mainAudio.wordTimestamps, input.scenes || []);
        lessonData.phases = c07Result.updatedPhases;
        
        // Garantir metadata com triggerContract e c07Applied
        if (!lessonData.metadata) {
          lessonData.metadata = {} as any;
        }
        (lessonData.metadata as any).triggerContract = 'anchorActions';
        (lessonData.metadata as any).c07Applied = c07Result.c07Stats.pausesInserted > 0;
        (lessonData.metadata as any).c07Stats = c07Result.c07Stats;
        
        console.log(`[V7-vv] C06.1: FINAL GUARD (INSERT) applied - removed ${c06FinalResult.c06Stats.removedTriggerTimeCount} triggerTime`);
        console.log(`[V7-vv] C07: FINAL GUARD (INSERT) applied - inserted ${c07Result.c07Stats.pausesInserted} auto-pause actions`);
      }
      
      // =====================================================================
      // PERSISTENCE GUARD: Validate trail_id and order_index before INSERT
      // =====================================================================
      const insertTrailId = (input as any).trail_id || null;
      const insertOrderIndex = (input as any).order_index ?? 0;
      
      if (!insertTrailId) {
        console.warn('[V7-vv] ⚠️ PERSISTENCE_GUARD: trail_id is NULL. Lesson will be standalone (no trail association).');
      }
      
      console.log(`[V7-vv] PERSISTENCE_GUARD: trail_id=${insertTrailId}, order_index=${insertOrderIndex}`);
      
      // Check for order_index conflict BEFORE insert
      if (insertTrailId) {
        const { data: existing } = await supabase
          .from('lessons')
          .select('id, title')
          .eq('trail_id', insertTrailId)
          .eq('order_index', insertOrderIndex)
          .maybeSingle();
        
        if (existing) {
          const conflictMsg = `order_index ${insertOrderIndex} already exists in trail ${insertTrailId} (lesson: ${existing.title}, id: ${existing.id}). Use a different order_index.`;
          console.error(`[V7-vv] ❌ PERSISTENCE_GUARD: CONFLICT - ${conflictMsg}`);
          throw new Error(`Persistence blocked: ${conflictMsg}`);
        }
      }

      const insertPayload = {
        title: input.title,
        description: input.subtitle || `Aula V7 Cinematográfica: ${input.title}`,
        trail_id: insertTrailId,
        order_index: insertOrderIndex,
        model: 'v7',
        lesson_type: 'v7-cinematic',
        content: lessonData,
        audio_url: mainAudio.url || null,
        word_timestamps: mainAudio.wordTimestamps.length > 0 ? mainAudio.wordTimestamps : null,
        estimated_time: Math.ceil(totalDuration / 60),
        difficulty_level: input.difficulty,
        is_active: false,
        status: 'rascunho',
      };
      
      console.log('[V7-vv] INSERT payload keys:', Object.keys(insertPayload));
      console.log('[V7-vv] INSERT payload meta:', JSON.stringify({
        title: insertPayload.title,
        trail_id: insertPayload.trail_id,
        order_index: insertPayload.order_index,
        model: insertPayload.model,
        difficulty_level: insertPayload.difficulty_level,
        has_audio: !!insertPayload.audio_url,
        has_timestamps: !!insertPayload.word_timestamps,
      }));

      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert(insertPayload)
        .select('id')
        .single();

      console.log('[V7-vv] INSERT result:', JSON.stringify({ data: lesson, error: lessonError }));

      if (lessonError) {
        console.error('[V7-vv] ❌ Database INSERT error:', JSON.stringify(lessonError));
        throw new Error(`Failed to save lesson: ${lessonError.message} (code: ${lessonError.code}, details: ${lessonError.details})`);
      }

      if (!lesson || !lesson.id) {
        console.error('[V7-vv] ❌ INSERT returned no ID. Full response:', JSON.stringify(lesson));
        throw new Error('Failed to save lesson: INSERT returned no ID');
      }

      // POST-INSERT VERIFICATION: Confirm the row actually persisted
      const { data: verifyRow, error: verifyError } = await supabase
        .from('lessons')
        .select('id, title, trail_id, order_index')
        .eq('id', lesson.id)
        .single();
      
      if (verifyError || !verifyRow) {
        console.error('[V7-vv] ❌ POST-INSERT VERIFICATION FAILED:', JSON.stringify({ verifyError, verifyRow }));
        throw new Error(`Lesson INSERT appeared successful (id: ${lesson.id}) but row not found on verification. Possible silent rollback.`);
      }
      
      console.log('[V7-vv] ✅ POST-INSERT VERIFIED:', JSON.stringify(verifyRow));

      lessonId = lesson.id;
      // C05.2: Salvar referência do content persistido para hash
      persistedContent = lessonData;
      console.log(`[V7-vv] ✅ Lesson saved with ID: ${lessonId}`);
    }
    
    // Atualizar lessonId no debug report (se existir)
    if (debugReport) {
      debugReport.lessonId = lessonId;
    }

    // =========================================================================
    // PASSO 6.5: DEBUG REPORT (RETORNADO NA RESPOSTA - SEM PERSISTÊNCIA)
    // =========================================================================
    // ✅ Debug Report é retornado diretamente na resposta
    // A tabela v7_debug_reports foi removida - análise on-demand via Diagnostic Engine
    if (debugReport) {
      console.log('[V7-vv] 📊 Debug Report Summary:', {
        lesson_id: lessonId,
        lesson_title: input.title || 'preserve_structure_mode',
        health_score: debugReport.summary.healthScore,
        severity: debugReport.summary.severity,
        total_issues: debugReport.allIssues.length,
      });
    }

    // =========================================================================
    // C05 + C06.1: COMPLETE EXECUTION WITH OUTPUT HASH
    // =========================================================================
    // CRITICAL: Usar persistedContent - o objeto que FOI EFETIVAMENTE persistido no banco
    // após passar por TODAS as normalizações (C06.1 FINAL GUARD).
    // NÃO usar finalLessonData/lessonData diretamente pois estão fora do escopo.
    const outputContentForHash = persistedContent;
    
    // Validar que outputContentForHash existe e tem o contrato correto
    if (!outputContentForHash) {
      console.error(`[C05.2] ERROR: outputContentForHash is null/undefined`);
      throw new Error('C05.2: Cannot compute hash - outputContent is null');
    }
    
    // Log de verificação antes do hash
    const triggerTimeCheck = outputContentForHash.phases?.reduce((count: number, p: any) => {
      const mvCount = (p.microVisuals || []).filter((mv: any) => mv.triggerTime !== undefined).length;
      return count + mvCount;
    }, 0) ?? 0;
    
    console.log(`[C05.2] Pre-hash validation: triggerTime count = ${triggerTimeCheck}`);
    console.log(`[C05.2] Pre-hash validation: metadata.triggerContract = ${outputContentForHash.metadata?.triggerContract}`);
    
    if (triggerTimeCheck > 0) {
      console.warn(`[C05.2] WARNING: ${triggerTimeCheck} triggerTime fields still present before hash!`);
    }
    
    // Computar hash do objeto normalizado
    // ✅ ISOLAMENTO: Incluir forceTestMeta se presente no input
    const forceTestMeta = (input as any)?.forceTestMeta;
    await c05CompleteExecution(supabase, runId, lessonId, outputContentForHash, {
      triggerContract: outputContentForHash.metadata?.triggerContract ?? 'anchorActions',
      hashAlgorithm: 'canonical_jsonb_string+sha256',
      hashComputedAfterGuards: true,
      forceTestBatchId: forceTestMeta?.batchId,
      forceTestRunTag: forceTestMeta?.runTag,
      // ✅ C15: Image Lab Bridge traceability
      imageLabBridge: bridgeReport,
    });

    // =========================================================================
    // AUDIT GATE — HARD BLOCK production contract validation (v1.1.4+)
    // Calls audit-contracts edge function AFTER persist.
    // If gate returns non-200: pipeline REVERTS status to 'failed' and throws.
    // This guarantees NO completed run can violate immutable contracts.
    // =========================================================================
    try {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      console.log(`[AUDIT_GATE] Running HARD post-execution audit for run ${runId}...`);
      const auditResponse = await fetch(`${SUPABASE_URL}/functions/v1/audit-contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          pipeline_version: PIPELINE_VERSION,
          run_id: runId,
          limit: 10,
        }),
      });
      
      const auditScorecard = await auditResponse.json();
      if (auditResponse.status !== 200) {
        // HARD FAIL: Revert the completed run to failed
        console.error(`[AUDIT_GATE] ❌ HARD FAIL (HTTP ${auditResponse.status}): required_failed=${auditScorecard.required_failed}`);
        
        const auditErrorMsg = JSON.stringify({
          error_code: 'AUDIT_GATE_FAILED',
          error_message: `Audit gate rejected run: ${auditScorecard.required_failed} required checks failed`,
          error_details: {
            http_status: auditResponse.status,
            required_failed: auditScorecard.required_failed,
            scorecard: auditScorecard,
          },
        });
        
        // Revert status to failed
        await supabase
          .from('pipeline_executions')
          .update({
            status: 'failed',
            error_message: auditErrorMsg,
            updated_at: new Date().toISOString(),
          })
          .eq('run_id', runId);
        
        console.error(`[AUDIT_GATE] Run ${runId} reverted to FAILED`);
        
        return new Response(
          JSON.stringify({
            success: false,
            error: 'AUDIT_GATE_FAILED',
            error_code: 'AUDIT_GATE_FAILED',
            error_details: {
              http_status: auditResponse.status,
              required_failed: auditScorecard.required_failed,
              scorecard: auditScorecard,
            },
            runId,
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log(`[AUDIT_GATE] ✅ GATE PASSED: ${auditScorecard.passed}/${auditScorecard.total_checks} checks`);
        
        // Persist auditGate stamp in output_data.meta for forensic traceability
        const scorecardJson = JSON.stringify(auditScorecard);
        const scorecardHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(scorecardJson));
        const scorecardHash = Array.from(new Uint8Array(scorecardHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        
        await supabase
          .from('pipeline_executions')
          .update({
            output_data: supabase.rpc ? undefined : undefined, // fallback below
            updated_at: new Date().toISOString(),
          })
          .eq('run_id', runId);
        
        // Update output_data.meta.auditGate via raw SQL-safe approach
        const { data: currentRun } = await supabase
          .from('pipeline_executions')
          .select('output_data')
          .eq('run_id', runId)
          .single();
        
        if (currentRun?.output_data) {
          const updatedOutput = {
            ...currentRun.output_data,
            meta: {
              ...currentRun.output_data.meta,
              auditGate: {
                checked: true,
                httpStatus: auditResponse.status,
                scorecardHash,
              },
            },
          };
          await supabase
            .from('pipeline_executions')
            .update({ output_data: updatedOutput, updated_at: new Date().toISOString() })
            .eq('run_id', runId);
          
          console.log(`[AUDIT_GATE] ✅ auditGate stamp persisted: hash=${scorecardHash.slice(0, 16)}...`);
        }
      }
    } catch (auditErr: any) {
      // If audit-contracts is unreachable, FAIL SAFE (block, don't pass silently)
      console.error(`[AUDIT_GATE] ❌ UNREACHABLE: ${auditErr.message} — failing safe`);
      
      const unreachableErrorMsg = JSON.stringify({
        error_code: 'AUDIT_GATE_FAILED',
        error_message: `Audit gate unreachable: ${auditErr.message}`,
        error_details: { reason: 'unreachable', message: auditErr.message },
      });
      
      await supabase
        .from('pipeline_executions')
        .update({
          status: 'failed',
          error_message: unreachableErrorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq('run_id', runId);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AUDIT_GATE_FAILED',
          error_code: 'AUDIT_GATE_FAILED',
          error_details: { reason: 'unreachable', message: auditErr.message },
          runId,
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // RESPOSTA COM DEBUG REPORT
    // =========================================================================
    const response = {
      success: true,
      lessonId,
      runId, // C05: Include run_id in response
      stats: {
        phaseCount: phases.length,
        totalDuration,
        mainAudioDuration: mainAudio.duration,
        wordCount: mainAudio.wordTimestamps.length,
        feedbackAudioCount: Object.keys(feedbackAudios).length,
        hasAudio: !!mainAudio.url,
      },
      // ✅ DEBUG REPORT AUTOMÁTICO (null no modo preserve_structure)
      debug: debugReport,
    };

    console.log('================================================');
    console.log('[V7-vv] ✅ Pipeline completed successfully');
    console.log('[V7-vv] Stats:', JSON.stringify(response.stats));
    console.log(`[V7-vv] C05: run_id=${runId}, status=completed`);
    if (debugReport) {
      console.log(`[V7-vv] Debug: ${debugReport.allIssues.length} issues, health score: ${debugReport.summary.healthScore}`);
    } else {
      console.log('[V7-vv] Debug: SKIPPED (preserve_structure mode)');
    }
    console.log('================================================');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    // =========================================================================
    // EXECUTION STATE CONTRACT: GUARANTEED FAILURE RECORDING
    // =========================================================================
    // This catch block MUST:
    // 1. Parse guardrail errors (C10/C10B) to extract error_code
    // 2. ALWAYS update pipeline_executions to status='failed' with completed_at
    // 3. Return appropriate HTTP status based on error type
    // =========================================================================
    
    console.error('[V7-vv] ❌ Error:', error);
    
    // Parse error to extract code if it's a guardrail error
    let errorCode = 'UNSTRUCTURED_ERROR';
    let errorMessage = error.message || 'Unknown error';
    let errorDetails: Record<string, unknown> | undefined = undefined;
    
    // Check if this is a structured guardrail error (JSON in message)
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error_code) {
        errorCode = parsed.error_code;
        errorMessage = parsed.error_message || errorMessage;
        errorDetails = parsed.error_details;
        console.log(`[V7-vv] Parsed guardrail error: code=${errorCode}`);
      }
    } catch {
      // Not a JSON error, use original message
    }
    
    // Build full error message for DB - CANONICAL JSON FORMAT (v7-vv-1.1.3)
    // Format: {"error_code":"...","error_message":"...","error_details":{...}|null}
    const fullErrorMessage = JSON.stringify({
      error_code: errorCode,
      error_message: errorMessage,
      error_details: errorDetails ?? null,
    });
    
    // =========================================================================
    // EXECUTION STATE CONTRACT: ALWAYS update status to 'failed'
    // =========================================================================
    if (supabase && runId) {
      try {
        console.log(`[EXECUTION_STATE_CONTRACT] Marking run ${runId} as FAILED with code ${errorCode}`);
        
        // =========================================================================
        // IMMUTABILITY POLICY: Failed runs MUST persist contract metadata
        // in output_data.meta for batch-level forensic traceability.
        // =========================================================================
        // Import from contracts.ts SSoT (dynamic import safe in catch)
        let CONTRACT_VERSION_FAIL = 'c10b-boundaryfix-execstate-1.0';
        let ACTIVE_CONTRACTS_FAIL = ['C01', 'C02', 'C04', 'C05', 'C06', 'C08', 'C10', 'C10B', 'BOUNDARY_FIX_GUARD', 'EXEC_STATE_CANONICAL_JSON'];
        try {
          const contractsMod = await import('./contracts.ts');
          CONTRACT_VERSION_FAIL = contractsMod.CONTRACT_VERSION;
          ACTIVE_CONTRACTS_FAIL = contractsMod.ACTIVE_CONTRACTS_LIST;
        } catch { /* fallback to hardcoded if import fails in error path */ }
        
        // Extract forceTestMeta from input if available
        const forceTestMeta = (input as any)?.forceTestMeta;
        
        const failedOutputData = {
          lesson_id: (input as any)?.existing_lesson_id || null,
          meta: {
            contractVersion: CONTRACT_VERSION_FAIL,
            contracts: ACTIVE_CONTRACTS_FAIL,
            triggerContract: 'anchorActions',
            failedAt: new Date().toISOString(),
            errorCode: errorCode,
            ...(forceTestMeta?.batchId ? { forceTestBatchId: forceTestMeta.batchId } : {}),
            ...(forceTestMeta?.runTag ? { forceTestRunTag: forceTestMeta.runTag } : {}),
          },
        };
        
        await supabase
          .from('pipeline_executions')
          .update({
            status: 'failed',
            error_message: fullErrorMessage,
            output_data: failedOutputData,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('run_id', runId);
        
        console.log(`[EXECUTION_STATE_CONTRACT] ✅ Run ${runId} marked as failed`);
      } catch (updateError) {
        console.error('[EXECUTION_STATE_CONTRACT] ❌ Failed to update status:', updateError);
        
        // Last resort: try insert if update failed (no record exists)
        if (input) {
          try {
            await supabase
              .from('pipeline_executions')
              .upsert({
                id: runId,
                run_id: runId,
                pipeline_version: PIPELINE_VERSION,
                commit_hash: COMMIT_HASH,
                mode: input.reprocess ? 'reprocess' : (input.dry_run ? 'dry_run' : 'create'),
                lesson_title: input.title || 'unknown',
                model: 'v7-vv',
                input_data: input,
                normalized_input: input,
                status: 'failed',
                error_message: fullErrorMessage,
                completed_at: new Date().toISOString(),
              }, { onConflict: 'run_id' });
            
            console.log(`[EXECUTION_STATE_CONTRACT] ✅ Fallback upsert succeeded`);
          } catch (upsertError) {
            console.error('[EXECUTION_STATE_CONTRACT] ❌ Fallback upsert also failed:', upsertError);
          }
        }
      }
    } else {
      console.warn('[EXECUTION_STATE_CONTRACT] Cannot update status: supabase or runId not available');
    }
    
    // Determine HTTP status based on error type
    const isGuardrailError = [
      'PAUSE_ANCHOR_REQUIRED',
      'PAUSE_ANCHOR_NOT_FOUND', 
      'PAUSE_ANCHOR_NOT_AT_END',
      'BOUNDARY_FIX_GUARD_FAILED',
      'CONTRACT_META_MISSING',
      'TRIGGER_CONTRACT_MISMATCH',
    ].includes(errorCode);
    
    const httpStatus = isGuardrailError ? 400 : 500;
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        error_code: errorCode,
        error_details: errorDetails,
        runId,
      }),
      { status: httpStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
