/**
 * V7 Diagnostic Engine - Main Orchestrator
 * =========================================
 * 
 * Orquestra todos os módulos de análise e gera o relatório final.
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  V7Finding, 
  V7RootCause, 
  V7CorrectionAction, 
  V7DiagnosticReport,
  LessonData,
  PhaseData,
  NormalizedWordTimestamp
} from './types';

import { analyzeAnchorCrossReferences, normalizeTimestamps } from './modules/anchorCrossRef';
import { analyzePhaseTiming, calculateAudioCoverage } from './modules/phaseTiming';
import { analyzeMicroVisuals } from './modules/microVisualValidation';
import { analyzeInteractions } from './modules/interactionRequirements';
import { analyzeAudioIntegrity } from './modules/audioIntegrity';
import { analyzeJsonStructure, extractPhasesFromContent } from './modules/jsonStructure';
import { analyzeContentTypes } from './modules/contentTypes';
import { analyzeFeedbackAudios } from './modules/feedbackAudio';

// ============================================================================
// MAIN ENGINE CLASS
// ============================================================================

export class V7DiagnosticEngine {
  private findings: V7Finding[] = [];
  private rootCauses: V7RootCause[] = [];
  private actions: V7CorrectionAction[] = [];
  
  /**
   * Analisa uma aula e retorna o relatório de diagnóstico completo
   */
  async analyze(lessonId: string): Promise<V7DiagnosticReport> {
    // Reset state
    this.findings = [];
    this.rootCauses = [];
    this.actions = [];
    
    // 1. Buscar dados da aula
    const lesson = await this.fetchLesson(lessonId);
    
    if (!lesson) {
      return this.buildEmptyReport(lessonId, 'Aula não encontrada');
    }
    
    const content = lesson.content as Record<string, unknown>;
    const phases = extractPhasesFromContent(content);
    const rawTimestamps = lesson.word_timestamps || [];
    const timestamps = normalizeTimestamps(rawTimestamps);
    
    // 2. Executar todos os módulos de análise
    try {
      // Módulo 1: Anchor Cross Reference (o mais crítico)
      this.findings.push(...analyzeAnchorCrossReferences(phases, timestamps));
      
      // Módulo 2: Phase Timing
      this.findings.push(...analyzePhaseTiming(phases));
      
      // Módulo 3: MicroVisual Validation
      this.findings.push(...analyzeMicroVisuals(phases, timestamps));
      
      // Módulo 4: Interaction Requirements
      this.findings.push(...analyzeInteractions(phases));
      
      // Módulo 5: Audio Integrity
      this.findings.push(...analyzeAudioIntegrity(lesson, timestamps));
      
      // Módulo 6: JSON Structure
      this.findings.push(...analyzeJsonStructure(content));
      
      // Módulo 7: Content Types
      this.findings.push(...analyzeContentTypes(phases));
      
      // Módulo 8: Feedback Audios
      this.findings.push(...analyzeFeedbackAudios(phases));
    } catch (error) {
      console.error('[V7DiagnosticEngine] Error during analysis:', error);
      this.findings.push({
        id: 'analysis_error',
        type: 'missing_required_field',
        severity: 'critical',
        location: {},
        problem: `Erro durante análise: ${(error as Error).message}`,
        evidence: {
          expected: 'Análise completa sem erros',
          actual: (error as Error).message,
          data: { error: String(error) }
        }
      });
    }
    
    // 3. Identificar causas raiz
    this.rootCauses = this.identifyRootCauses(this.findings, phases);
    
    // 4. Gerar ações de correção
    this.actions = this.generateActions(this.findings, this.rootCauses);
    
    // 5. Montar relatório
    return this.buildReport(lessonId, lesson.title, lesson, phases, timestamps);
  }
  
  /**
   * Busca dados da aula no banco
   */
  private async fetchLesson(lessonId: string): Promise<LessonData | null> {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, content, word_timestamps, audio_url')
      .eq('id', lessonId)
      .single();
    
    if (error || !data) {
      console.error('[V7DiagnosticEngine] Error fetching lesson:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      content: data.content as Record<string, unknown>,
      word_timestamps: (data.word_timestamps as unknown) as LessonData['word_timestamps'],
      audio_url: data.audio_url
    };
  }
  
  /**
   * Identifica padrões nos findings para determinar causas raiz
   */
  private identifyRootCauses(findings: V7Finding[], phases: PhaseData[]): V7RootCause[] {
    const causes: V7RootCause[] = [];
    
    // Padrão 1: Múltiplos anchors na fase errada = problema estrutural no JSON
    const anchorWrong = findings.filter(f => f.type === 'anchor_wrong_phase');
    if (anchorWrong.length >= 3) {
      // Agrupar por fase de destino
      const byCorrectPhase = new Map<string, V7Finding[]>();
      for (const finding of anchorWrong) {
        const correctPhase = finding.evidence.data.correctPhaseId as string;
        if (correctPhase) {
          if (!byCorrectPhase.has(correctPhase)) {
            byCorrectPhase.set(correctPhase, []);
          }
          byCorrectPhase.get(correctPhase)!.push(finding);
        }
      }
      
      // Se todos apontam para a mesma fase, é um erro claro de posicionamento
      for (const [correctPhase, groupedFindings] of byCorrectPhase) {
        if (groupedFindings.length >= 2) {
          const sourcePhases = [...new Set(groupedFindings.map(f => f.location.phaseId))];
          causes.push({
            type: 'json_structure_error',
            description: `${groupedFindings.length} elementos estão em ${sourcePhases.join(', ')} mas deveriam estar em ${correctPhase}`,
            affectedFindings: groupedFindings.map(f => f.id),
            evidence: groupedFindings.map(f => f.problem)
          });
        }
      }
    }
    
    // Padrão 2: Múltiplos anchors não encontrados = narração incorreta
    const anchorMissing = findings.filter(f => f.type === 'anchor_not_found');
    if (anchorMissing.length >= 3) {
      causes.push({
        type: 'narration_mismatch',
        description: `${anchorMissing.length} keywords não existem na narração. O JSON usa palavras que não foram faladas.`,
        affectedFindings: anchorMissing.map(f => f.id),
        evidence: anchorMissing.map(f => (f.evidence.data.keyword as string) || f.problem)
      });
    }
    
    // Padrão 3: Overlaps = erro de cálculo no pipeline
    const overlaps = findings.filter(f => f.type === 'phase_overlap');
    if (overlaps.length >= 1) {
      causes.push({
        type: 'pipeline_calculation',
        description: 'Fases se sobrepõem, indicando erro no cálculo de timestamps do pipeline',
        affectedFindings: overlaps.map(f => f.id),
        evidence: overlaps.map(f => f.problem)
      });
    }
    
    // Padrão 4: Sem timestamps = dados incompletos
    const noTimestamps = findings.filter(f => f.type === 'audio_missing_timestamps');
    if (noTimestamps.length > 0) {
      causes.push({
        type: 'missing_data',
        description: 'Word timestamps ausentes ou insuficientes - impossível validar sincronização',
        affectedFindings: noTimestamps.map(f => f.id),
        evidence: noTimestamps.map(f => f.problem)
      });
    }
    
    return causes;
  }
  
  /**
   * Gera ações de correção baseadas nos findings e causas raiz
   */
  private generateActions(findings: V7Finding[], causes: V7RootCause[]): V7CorrectionAction[] {
    const actions: V7CorrectionAction[] = [];
    const processedFindings = new Set<string>();
    
    // Prioridade 1: Ações baseadas em causas raiz (consolidadas)
    for (const cause of causes) {
      if (cause.type === 'json_structure_error') {
        // Agrupar findings por fase de destino
        const relevantFindings = findings.filter(f => cause.affectedFindings.includes(f.id));
        const destinations = new Map<string, V7Finding[]>();
        
        for (const finding of relevantFindings) {
          const dest = finding.evidence.data.correctPhaseId as string;
          if (dest) {
            if (!destinations.has(dest)) destinations.set(dest, []);
            destinations.get(dest)!.push(finding);
            processedFindings.add(finding.id);
          }
        }
        
        for (const [destPhase, groupedFindings] of destinations) {
          const sources = [...new Set(groupedFindings.map(f => f.location.phaseId))];
          const elementIds = groupedFindings.map(f => f.location.elementId).filter(Boolean);
          
          actions.push({
            id: `action_move_to_${destPhase}`,
            priority: 1,
            type: 'move_element',
            instruction: `Mova ${elementIds.length} elementos de ${sources.join(', ')} para ${destPhase}`,
            target: {
              from: sources.join(', '),
              to: destPhase
            },
            suggestedPatch: {
              op: 'move',
              from: `phases/${sources[0]}`,
              path: `phases/${destPhase}`
            },
            resolvesFindings: groupedFindings.map(f => f.id)
          });
        }
      }
    }
    
    // Prioridade 2: Ações individuais para findings não processados
    for (const finding of findings) {
      if (processedFindings.has(finding.id)) continue;
      
      switch (finding.type) {
        case 'anchor_not_found':
          const similarWords = finding.evidence.data.similarWords as string[] | undefined;
          actions.push({
            id: `action_${finding.id}`,
            priority: 1,
            type: 'manual_review',
            instruction: similarWords?.length 
              ? `Keyword "${finding.evidence.data.keyword}" não existe. Sugestão: "${similarWords[0]}"`
              : `Keyword "${finding.evidence.data.keyword}" não existe na narração. Adicione ao script ou remova o elemento.`,
            resolvesFindings: [finding.id]
          });
          break;
          
        case 'anchor_wrong_phase':
          const correctPhase = finding.evidence.data.correctPhaseId as string;
          actions.push({
            id: `action_${finding.id}`,
            priority: 1,
            type: 'move_element',
            instruction: `Mova "${finding.location.elementId}" de ${finding.location.phaseId} para ${correctPhase}`,
            target: {
              from: finding.location.phaseId || 'unknown',
              to: correctPhase
            },
            resolvesFindings: [finding.id]
          });
          break;
          
        case 'phase_overlap':
          actions.push({
            id: `action_${finding.id}`,
            priority: 1,
            type: 'fix_timing',
            instruction: `Corrija overlap: ${finding.problem}`,
            resolvesFindings: [finding.id]
          });
          break;
          
        case 'phase_too_short':
          actions.push({
            id: `action_${finding.id}`,
            priority: 2,
            type: 'fix_timing',
            instruction: `Aumente duração da fase: ${finding.problem}`,
            resolvesFindings: [finding.id]
          });
          break;
          
        case 'quiz_no_correct_option':
          actions.push({
            id: `action_${finding.id}`,
            priority: 1,
            type: 'add_field',
            instruction: `Defina isCorrect: true em uma das opções do quiz ${finding.location.phaseId}`,
            resolvesFindings: [finding.id]
          });
          break;
          
        case 'missing_required_field':
          actions.push({
            id: `action_${finding.id}`,
            priority: finding.severity === 'critical' ? 1 : 2,
            type: 'add_field',
            instruction: `Adicione campo obrigatório: ${finding.problem}`,
            resolvesFindings: [finding.id]
          });
          break;
          
        default:
          if (finding.severity === 'critical' || finding.severity === 'error') {
            actions.push({
              id: `action_${finding.id}`,
              priority: finding.severity === 'critical' ? 1 : 2,
              type: 'manual_review',
              instruction: finding.problem,
              resolvesFindings: [finding.id]
            });
          }
      }
    }
    
    // Ordenar por prioridade
    return actions.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Monta o relatório final
   */
  private buildReport(
    lessonId: string, 
    lessonTitle: string,
    lesson: LessonData,
    phases: PhaseData[],
    timestamps: NormalizedWordTimestamp[]
  ): V7DiagnosticReport {
    const criticalCount = this.findings.filter(f => f.severity === 'critical').length;
    const errorCount = this.findings.filter(f => f.severity === 'error').length;
    const warningCount = this.findings.filter(f => f.severity === 'warning').length;
    
    // Calcular health score
    const healthScore = this.calculateHealthScore(criticalCount, errorCount, warningCount);
    
    // Determinar ação primária
    const primaryAction = this.actions.length > 0 
      ? this.actions[0].instruction 
      : 'Nenhuma ação necessária';
    
    // Verificar se pode auto-fix
    const canAutoFix = this.actions.length > 0 && 
      this.actions.every(a => a.type === 'move_element' || a.type === 'fix_timing');
    
    // Extrair metadata do content
    const content = lesson.content as Record<string, unknown>;
    const metadata = content.metadata as Record<string, unknown> | undefined;
    const audioDuration = (metadata?.totalDuration as number) || 
      (timestamps.length > 0 ? timestamps[timestamps.length - 1].end : 0);
    
    return {
      lessonId,
      lessonTitle,
      analyzedAt: new Date().toISOString(),
      
      inputs: {
        hasPhases: phases.length > 0,
        phaseCount: phases.length,
        hasWordTimestamps: timestamps.length > 0,
        timestampCount: timestamps.length,
        hasAudio: !!lesson.audio_url,
        audioDuration
      },
      
      findings: this.findings,
      rootCauses: this.rootCauses,
      actions: this.actions,
      
      summary: {
        healthScore,
        totalFindings: this.findings.length,
        criticalCount,
        errorCount,
        warningCount,
        canAutoFix,
        primaryAction
      }
    };
  }
  
  /**
   * Calcula health score baseado nos findings
   */
  private calculateHealthScore(critical: number, errors: number, warnings: number): number {
    // Fórmula: 100 - (critical * 20) - (errors * 10) - (warnings * 2)
    const score = 100 - (critical * 20) - (errors * 10) - (warnings * 2);
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Cria relatório vazio para casos de erro
   */
  private buildEmptyReport(lessonId: string, error: string): V7DiagnosticReport {
    return {
      lessonId,
      lessonTitle: 'Erro',
      analyzedAt: new Date().toISOString(),
      inputs: {
        hasPhases: false,
        phaseCount: 0,
        hasWordTimestamps: false,
        timestampCount: 0,
        hasAudio: false,
        audioDuration: 0
      },
      findings: [{
        id: 'fetch_error',
        type: 'missing_required_field',
        severity: 'critical',
        location: {},
        problem: error,
        evidence: {
          expected: 'Aula válida',
          actual: error,
          data: {}
        }
      }],
      rootCauses: [],
      actions: [],
      summary: {
        healthScore: 0,
        totalFindings: 1,
        criticalCount: 1,
        errorCount: 0,
        warningCount: 0,
        canAutoFix: false,
        primaryAction: 'Verificar se a aula existe'
      }
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTION
// ============================================================================

/**
 * Função de conveniência para análise rápida
 */
export async function analyzeLesson(lessonId: string): Promise<V7DiagnosticReport> {
  const engine = new V7DiagnosticEngine();
  return engine.analyze(lessonId);
}
