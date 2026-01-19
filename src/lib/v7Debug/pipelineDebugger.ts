/**
 * V7 Pipeline Debugger
 * ====================
 * 
 * Captura métricas e issues durante a geração da aula no pipeline.
 * Gera Níveis 1-2 do relatório de debug.
 * 
 * @version 1.0.0
 */

import type {
  V7DebugReport,
  V7DebugAudio,
  V7DebugTimeline,
  V7DebugTimelineEvent,
  V7DebugIssue,
  V7TriggerType,
} from '@/types/V7DebugSchema';
import {
  createEmptyDebugReport,
  createIssue,
  analyzeDebugReport,
} from '@/types/V7DebugSchema';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface Phase {
  id: string;
  title: string;
  type: string;
  startTime: number;
  endTime: number;
  anchorActions?: Array<{
    id: string;
    keyword: string;
    keywordTime: number;
    type: string;
    targetId?: string;
  }>;
  microVisuals?: Array<{
    id: string;
    type: string;
    anchorText: string;
    triggerTime: number;
  }>;
  interaction?: {
    type: string;
    options?: Array<{ id: string; text: string; isCorrect?: boolean }>;
  };
}

interface PipelineDebugInput {
  lessonId: string;
  lessonTitle: string;
  inputText: string;
  audioUrl: string | null;
  wordTimestamps: WordTimestamp[];
  phases: Phase[];
  audioDuration: number;
}

/**
 * Gera debug do pipeline após a aula ser processada
 */
export function generatePipelineDebug(input: PipelineDebugInput): V7DebugReport {
  const report = createEmptyDebugReport(input.lessonId, input.lessonTitle);
  report.source = 'pipeline';
  
  // === NÍVEL 1: ÁUDIO ===
  report.audio = analyzeAudio(input);
  
  // === NÍVEL 2: TIMELINE ===
  report.timeline = analyzeTimeline(input.phases);
  
  // === ANÁLISE FINAL ===
  analyzeDebugReport(report);
  
  return report;
}

/**
 * Analisa áudio e detecta problemas
 */
function analyzeAudio(input: PipelineDebugInput): V7DebugAudio {
  const issues: V7DebugIssue[] = [];
  const wt = input.wordTimestamps;
  
  // Texto falado reconstruído
  const spokenText = wt.map(w => w.word).join(' ');
  
  // Primeira e última palavra
  const firstWord = wt.length > 0 ? wt[0] : null;
  const lastWord = wt.length > 0 ? wt[wt.length - 1] : null;
  
  // Detectar tags que vazaram
  const leakedTags: string[] = [];
  const tagPatterns = [
    /\[pause:\d+\]/gi,
    /\[contextual\]/gi,
    /\[breath\]/gi,
    /\[silence\]/gi,
  ];
  tagPatterns.forEach(pattern => {
    const matches = spokenText.match(pattern);
    if (matches) {
      leakedTags.push(...matches);
    }
  });
  
  if (leakedTags.length > 0) {
    issues.push(createIssue(
      'critical',
      'audio',
      'Tags vazaram para TTS',
      `As seguintes tags foram narradas: ${leakedTags.join(', ')}`,
      'cleanTextForTTS() não está removendo todas as tags',
      'Adicionar regex para remover tags em cleanTextForTTS() antes de enviar para ElevenLabs'
    ));
  }
  
  // Detectar truncamento
  const inputWordCount = input.inputText.split(/\s+/).filter(w => w.length > 0).length;
  const spokenWordCount = wt.length;
  const percentageSpoken = inputWordCount > 0 ? (spokenWordCount / inputWordCount) * 100 : 100;
  const isTruncated = percentageSpoken < 95;
  
  if (isTruncated) {
    // Encontrar palavras faltantes
    const inputWords = input.inputText.split(/\s+/).filter(w => w.length > 0);
    const spokenWordsSet = new Set(wt.map(w => w.word.toLowerCase()));
    const missingWords = inputWords.slice(-10).filter(
      w => !spokenWordsSet.has(w.toLowerCase().replace(/[.,!?]/g, ''))
    );
    
    issues.push(createIssue(
      'high',
      'audio',
      'Áudio truncado',
      `Apenas ${percentageSpoken.toFixed(1)}% do texto foi narrado. Últimas ${missingWords.length} palavras faltando.`,
      'ElevenLabs pode ter cortado o áudio ou findNarrationRange() não encontrou fim correto',
      'Verificar resposta da ElevenLabs API e lógica de findNarrationRange()',
      { missingWords, percentageSpoken }
    ));
  }
  
  // Verificar duração
  const expectedDuration = inputWordCount / 2.5; // ~2.5 palavras/segundo
  const durationDiff = Math.abs(input.audioDuration - expectedDuration);
  
  if (durationDiff > expectedDuration * 0.3) {
    issues.push(createIssue(
      'medium',
      'audio',
      'Duração de áudio inesperada',
      `Duração real: ${input.audioDuration.toFixed(1)}s, esperada: ~${expectedDuration.toFixed(1)}s`,
      'Ritmo de narração muito rápido/lento ou áudio cortado',
      'Verificar voice_settings do ElevenLabs (stability, similarity_boost)',
      { actualDuration: input.audioDuration, expectedDuration, diff: durationDiff }
    ));
  }
  
  // Verificar se há áudio
  if (!input.audioUrl) {
    issues.push(createIssue(
      'critical',
      'audio',
      'Áudio não gerado',
      'A aula não tem URL de áudio',
      'Falha na geração ou upload do áudio',
      'Verificar logs da ElevenLabs API e Supabase Storage',
    ));
  }
  
  return {
    audioUrl: input.audioUrl,
    actualDuration: input.audioDuration,
    expectedDuration,
    inputText: input.inputText,
    inputTextLength: input.inputText.length,
    spokenText,
    spokenTextLength: spokenText.length,
    wordCount: wt.length,
    firstWord,
    lastWord,
    isTruncated,
    truncationDetails: isTruncated ? {
      missingWords: [],
      percentageSpoken,
    } : null,
    leakedTags,
    issues,
  };
}

/**
 * Analisa timeline de eventos e detecta problemas
 */
function analyzeTimeline(phases: Phase[]): V7DebugTimeline {
  const issues: V7DebugIssue[] = [];
  const plannedEvents: V7DebugTimelineEvent[] = [];
  const interactivePhases: string[] = [];
  const eventsByType: Record<string, number> = {};
  
  // Processar cada fase
  phases.forEach((phase, idx) => {
    // Evento de início de fase
    plannedEvents.push({
      eventId: `phase_start_${phase.id}`,
      eventType: 'phase_start',
      phaseId: phase.id,
      triggerType: 'time',
      expectedAt: phase.startTime,
      anchorText: null,
      targetId: null,
      payload: { phaseType: phase.type, title: phase.title },
    });
    eventsByType['phase_start'] = (eventsByType['phase_start'] || 0) + 1;
    
    // Evento de fim de fase
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
    eventsByType['phase_end'] = (eventsByType['phase_end'] || 0) + 1;
    
    // Anchor actions
    phase.anchorActions?.forEach(action => {
      const triggerType: V7TriggerType = action.keywordTime ? 'anchor_text' : 'fallback';
      
      plannedEvents.push({
        eventId: action.id,
        eventType: action.type === 'pause' ? 'anchor_pause' : 
                   action.type === 'show' ? 'anchor_show' : 'anchor_trigger',
        phaseId: phase.id,
        triggerType,
        expectedAt: action.keywordTime,
        anchorText: action.keyword,
        targetId: action.targetId || null,
        payload: null,
      });
      eventsByType[`anchor_${action.type}`] = (eventsByType[`anchor_${action.type}`] || 0) + 1;
      
      // Issue se fallback foi usado
      if (triggerType === 'fallback') {
        issues.push(createIssue(
          'medium',
          'timing',
          `Fallback usado para anchor "${action.keyword}"`,
          `Palavra âncora não foi encontrada nos timestamps, usando timing estimado`,
          'findKeywordTime() não encontrou a palavra no range da fase',
          'Verificar se a palavra existe nos wordTimestamps e está no range correto',
          { keyword: action.keyword, phaseId: phase.id, time: action.keywordTime }
        ));
      }
    });
    
    // Micro-visuals
    phase.microVisuals?.forEach(mv => {
      plannedEvents.push({
        eventId: mv.id,
        eventType: 'micro_visual',
        phaseId: phase.id,
        triggerType: mv.triggerTime ? 'anchor_text' : 'fallback',
        expectedAt: mv.triggerTime,
        anchorText: mv.anchorText,
        targetId: mv.id,
        payload: { type: mv.type },
      });
      eventsByType['micro_visual'] = (eventsByType['micro_visual'] || 0) + 1;
    });
    
    // Interação
    if (phase.interaction) {
      interactivePhases.push(phase.id);
      plannedEvents.push({
        eventId: `interaction_${phase.id}`,
        eventType: 'interaction_start',
        phaseId: phase.id,
        triggerType: 'time',
        expectedAt: phase.startTime,
        anchorText: null,
        targetId: null,
        payload: { type: phase.interaction.type },
      });
      eventsByType['interaction'] = (eventsByType['interaction'] || 0) + 1;
    }
    
    // Detectar overlap de fases
    if (idx > 0) {
      const prevPhase = phases[idx - 1];
      if (phase.startTime < prevPhase.endTime) {
        issues.push(createIssue(
          'high',
          'timing',
          'Overlap de fases detectado',
          `Fase "${phase.id}" começa em ${phase.startTime.toFixed(2)}s antes da fase anterior "${prevPhase.id}" terminar em ${prevPhase.endTime.toFixed(2)}s`,
          'generatePhases() não está garantindo ordem sequencial',
          'Verificar lógica de ordenação e ajuste de startTime em generatePhases()',
          { 
            currentPhase: phase.id, 
            currentStart: phase.startTime,
            prevPhase: prevPhase.id,
            prevEnd: prevPhase.endTime,
            overlap: prevPhase.endTime - phase.startTime
          }
        ));
      }
    }
    
    // Detectar fase com duração negativa ou zero
    const duration = phase.endTime - phase.startTime;
    if (duration <= 0) {
      issues.push(createIssue(
        'critical',
        'timing',
        'Fase com duração inválida',
        `Fase "${phase.id}" tem duração ${duration.toFixed(2)}s (startTime=${phase.startTime.toFixed(2)}s, endTime=${phase.endTime.toFixed(2)}s)`,
        'Cálculo de endTime está incorreto',
        'Verificar findNarrationRange() e cálculo de endTime baseado em wordTimestamps',
        { phaseId: phase.id, startTime: phase.startTime, endTime: phase.endTime, duration }
      ));
    }
  });
  
  return {
    plannedEvents,
    totalPhases: phases.length,
    totalEvents: plannedEvents.length,
    interactivePhases,
    eventsByType,
    issues,
  };
}

/**
 * Serializa o relatório para JSON formatado
 */
export function serializeDebugReport(report: V7DebugReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Gera um resumo textual do relatório
 */
export function generateDebugSummary(report: V7DebugReport): string {
  const lines: string[] = [
    '═'.repeat(80),
    `V7 DEBUG REPORT - ${report.lessonTitle}`,
    '═'.repeat(80),
    '',
    `📊 SUMÁRIO`,
    `   Severidade: ${report.summary.severity.toUpperCase()}`,
    `   Health Score: ${report.summary.healthScore}/100`,
    `   Total Issues: ${report.summary.totalIssues}`,
    '',
    `📋 ISSUES POR SEVERIDADE`,
    `   Critical: ${report.summary.issuesBySeverity.critical}`,
    `   High: ${report.summary.issuesBySeverity.high}`,
    `   Medium: ${report.summary.issuesBySeverity.medium}`,
    `   Low: ${report.summary.issuesBySeverity.low}`,
    '',
    `🔊 ÁUDIO`,
    `   URL: ${report.audio.audioUrl ? '✓' : '✗ MISSING'}`,
    `   Duração: ${report.audio.actualDuration.toFixed(1)}s`,
    `   Palavras: ${report.audio.wordCount}`,
    `   Truncado: ${report.audio.isTruncated ? '⚠️ SIM' : '✓ NÃO'}`,
    `   Tags Vazadas: ${report.audio.leakedTags.length > 0 ? report.audio.leakedTags.join(', ') : 'nenhuma'}`,
    '',
    `📅 TIMELINE`,
    `   Fases: ${report.timeline.totalPhases}`,
    `   Eventos: ${report.timeline.totalEvents}`,
    `   Fases Interativas: ${report.timeline.interactivePhases.join(', ') || 'nenhuma'}`,
    '',
    `🎯 CAUSAS RAIZ CANDIDATAS`,
    ...report.summary.rootCauseCandidates.map(c => `   - ${c}`),
    '',
    `💡 RECOMENDAÇÃO`,
    `   ${report.summary.primaryRecommendation}`,
    '',
  ];
  
  if (report.allIssues.length > 0) {
    lines.push('═'.repeat(80));
    lines.push('DETALHES DAS ISSUES');
    lines.push('═'.repeat(80));
    
    report.allIssues.forEach((issue, idx) => {
      lines.push('');
      lines.push(`[${idx + 1}] ${issue.level.toUpperCase()} - ${issue.message}`);
      lines.push(`    Categoria: ${issue.category}`);
      lines.push(`    Detalhes: ${issue.details}`);
      lines.push(`    Causa: ${issue.possibleCause}`);
      lines.push(`    Fix: ${issue.suggestedFix}`);
    });
  }
  
  lines.push('');
  lines.push('═'.repeat(80));
  
  return lines.join('\n');
}
