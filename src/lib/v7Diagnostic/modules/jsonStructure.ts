/**
 * V7 Diagnostic - JSON Structure Module
 * ======================================
 * 
 * Valida estrutura do JSON: campos obrigatórios, tipos, IDs únicos.
 */

import type { V7Finding, PhaseData } from '../types';
import { VALID_PHASE_TYPES, VALID_VISUAL_TYPES } from '../types';

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export function analyzeJsonStructure(content: Record<string, unknown>): V7Finding[] {
  const findings: V7Finding[] = [];
  
  // Check 1: Campos raiz obrigatórios
  const phases = extractPhasesFromContent(content);
  
  if (!phases || phases.length === 0) {
    findings.push({
      id: 'no_phases_root',
      type: 'missing_required_field',
      severity: 'critical',
      location: { field: 'phases' },
      problem: 'Campo phases não encontrado ou vazio no content',
      evidence: {
        expected: 'Array phases com pelo menos uma fase',
        actual: 'Não encontrado',
        data: { topLevelKeys: Object.keys(content) }
      }
    });
  }
  
  // Check metadata
  const metadata = content.metadata as Record<string, unknown> | undefined;
  if (!metadata) {
    findings.push({
      id: 'no_metadata',
      type: 'missing_required_field',
      severity: 'warning',
      location: { field: 'metadata' },
      problem: 'Campo metadata não encontrado',
      evidence: {
        expected: 'Objeto metadata com title, difficulty, etc',
        actual: 'Não encontrado',
        data: {}
      }
    });
  } else {
    if (!metadata.totalDuration) {
      findings.push({
        id: 'no_total_duration',
        type: 'missing_required_field',
        severity: 'warning',
        location: { field: 'metadata.totalDuration' },
        problem: 'metadata.totalDuration não definido',
        evidence: {
          expected: 'Duração total em segundos',
          actual: 'Não definido',
          data: {}
        }
      });
    }
  }
  
  // Check 2: IDs únicos
  if (phases && phases.length > 0) {
    const seenIds = new Set<string>();
    for (const phase of phases) {
      if (!phase.id) {
        findings.push({
          id: `phase_no_id_${phases.indexOf(phase)}`,
          type: 'missing_required_field',
          severity: 'error',
          location: { field: `phases[${phases.indexOf(phase)}].id` },
          problem: `Fase na posição ${phases.indexOf(phase)} não tem ID`,
          evidence: {
            expected: 'ID único',
            actual: 'Não definido',
            data: { phaseIndex: phases.indexOf(phase) }
          }
        });
        continue;
      }
      
      if (seenIds.has(phase.id)) {
        findings.push({
          id: `duplicate_phase_id_${phase.id}`,
          type: 'duplicate_id',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `ID de fase duplicado: "${phase.id}"`,
          evidence: {
            expected: 'IDs únicos para cada fase',
            actual: `ID "${phase.id}" aparece múltiplas vezes`,
            data: { duplicateId: phase.id }
          }
        });
      }
      seenIds.add(phase.id);
    }
    
    // Check 3: Tipagem estrita
    for (const phase of phases) {
      if (!phase.type) {
        findings.push({
          id: `phase_no_type_${phase.id || 'unknown'}`,
          type: 'missing_required_field',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Fase "${phase.id}" não tem type definido`,
          evidence: {
            expected: `Um de: ${VALID_PHASE_TYPES.join(', ')}`,
            actual: 'Não definido',
            data: {}
          }
        });
      } else if (!VALID_PHASE_TYPES.includes(phase.type as typeof VALID_PHASE_TYPES[number])) {
        findings.push({
          id: `invalid_phase_type_${phase.id}`,
          type: 'invalid_phase_type',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Fase "${phase.id}" tem tipo inválido: "${phase.type}"`,
          evidence: {
            expected: `Um de: ${VALID_PHASE_TYPES.join(', ')}`,
            actual: phase.type,
            data: { validTypes: [...VALID_PHASE_TYPES] }
          }
        });
      }
      
      // Check visual type
      if (phase.visual?.type && !VALID_VISUAL_TYPES.includes(phase.visual.type as typeof VALID_VISUAL_TYPES[number])) {
        findings.push({
          id: `invalid_visual_type_${phase.id}`,
          type: 'invalid_visual_type',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Fase "${phase.id}" tem visual.type inválido: "${phase.visual.type}"`,
          evidence: {
            expected: `Um de: ${VALID_VISUAL_TYPES.join(', ')}`,
            actual: phase.visual.type,
            data: { validTypes: [...VALID_VISUAL_TYPES] }
          }
        });
      }
      
      // Check startTime e endTime
      if (phase.startTime === undefined) {
        findings.push({
          id: `phase_no_start_${phase.id || 'unknown'}`,
          type: 'missing_required_field',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Fase "${phase.id}" não tem startTime`,
          evidence: {
            expected: 'startTime em segundos',
            actual: 'Não definido',
            data: {}
          }
        });
      }
      
      if (phase.endTime === undefined) {
        findings.push({
          id: `phase_no_end_${phase.id || 'unknown'}`,
          type: 'missing_required_field',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Fase "${phase.id}" não tem endTime`,
          evidence: {
            expected: 'endTime em segundos',
            actual: 'Não definido',
            data: {}
          }
        });
      }
    }
  }
  
  // Check audio config
  const audio = content.audio as Record<string, unknown> | undefined;
  if (!audio) {
    findings.push({
      id: 'no_audio_config',
      type: 'missing_required_field',
      severity: 'warning',
      location: { field: 'audio' },
      problem: 'Campo audio não encontrado no content',
      evidence: {
        expected: 'Configuração de áudio com mainAudio',
        actual: 'Não encontrado',
        data: {}
      }
    });
  }
  
  return findings;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extrai phases de diferentes estruturas de content
 */
export function extractPhasesFromContent(content: Record<string, unknown>): PhaseData[] {
  // Tenta diferentes paths conhecidos
  const possiblePaths = [
    content.phases,
    (content.cinematicFlow as Record<string, unknown>)?.phases,
    (content.cinematic_flow as Record<string, unknown>)?.phases,
    content.acts,
    (content.cinematicFlow as Record<string, unknown>)?.acts,
  ];
  
  for (const path of possiblePaths) {
    if (Array.isArray(path) && path.length > 0) {
      return path as PhaseData[];
    }
  }
  
  // Fallback: busca qualquer array com estrutura de fase
  for (const key of Object.keys(content)) {
    const value = content[key];
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0] as Record<string, unknown>;
      if (first && (first.id || first.type || first.startTime !== undefined)) {
        return value as PhaseData[];
      }
    }
  }
  
  return [];
}
