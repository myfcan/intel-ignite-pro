/**
 * V7 Diagnostic - Phase Timing Module
 * ====================================
 * 
 * Valida timeline das fases: overlaps, gaps, sequenciamento, durações mínimas.
 */

import type { V7Finding, PhaseData } from '../types';

const MIN_INTERACTIVE_DURATION = 5; // segundos
const MIN_NARRATIVE_DURATION = 2; // segundos
const MAX_GAP_THRESHOLD = 0.1; // segundos (gaps menores são ignorados)

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export function analyzePhaseTiming(phases: PhaseData[]): V7Finding[] {
  const findings: V7Finding[] = [];
  
  if (phases.length === 0) {
    findings.push({
      id: 'no_phases',
      type: 'missing_required_field',
      severity: 'critical',
      location: {},
      problem: 'Nenhuma fase encontrada na aula',
      evidence: {
        expected: 'Pelo menos uma fase',
        actual: '0 fases',
        data: {}
      }
    });
    return findings;
  }
  
  // Ordenar fases por startTime
  const sortedPhases = [...phases].sort((a, b) => a.startTime - b.startTime);
  
  for (let i = 0; i < sortedPhases.length; i++) {
    const phase = sortedPhases[i];
    const duration = phase.endTime - phase.startTime;
    
    // Check 3: Duração negativa
    if (duration < 0) {
      findings.push({
        id: `negative_duration_${phase.id}`,
        type: 'phase_negative_duration',
        severity: 'critical',
        location: { phaseId: phase.id },
        problem: `Fase "${phase.id}" tem duração negativa`,
        evidence: {
          expected: 'endTime > startTime',
          actual: `startTime: ${phase.startTime.toFixed(2)}s, endTime: ${phase.endTime.toFixed(2)}s`,
          data: { 
            startTime: phase.startTime, 
            endTime: phase.endTime,
            duration 
          }
        }
      });
    }
    
    // Check 4: Duração mínima interativa
    const interactiveTypes = ['interaction', 'playground', 'cta', 'secret-reveal'];
    if (interactiveTypes.includes(phase.type) && duration < MIN_INTERACTIVE_DURATION) {
      findings.push({
        id: `short_interactive_${phase.id}`,
        type: 'phase_too_short',
        severity: 'error',
        location: { phaseId: phase.id },
        problem: `Fase interativa "${phase.id}" muito curta`,
        evidence: {
          expected: `Mínimo ${MIN_INTERACTIVE_DURATION}s para fases interativas`,
          actual: `${duration.toFixed(2)}s`,
          data: { 
            phaseType: phase.type, 
            duration,
            minRequired: MIN_INTERACTIVE_DURATION 
          }
        }
      });
    }
    
    // Check 5: Duração mínima narrativa
    const narrativeTypes = ['dramatic', 'narrative', 'comparison', 'revelation'];
    if (narrativeTypes.includes(phase.type) && duration < MIN_NARRATIVE_DURATION && duration >= 0) {
      findings.push({
        id: `short_narrative_${phase.id}`,
        type: 'phase_too_short',
        severity: 'warning',
        location: { phaseId: phase.id },
        problem: `Fase narrativa "${phase.id}" muito curta`,
        evidence: {
          expected: `Mínimo ${MIN_NARRATIVE_DURATION}s para fases narrativas`,
          actual: `${duration.toFixed(2)}s`,
          data: { 
            phaseType: phase.type, 
            duration,
            minRequired: MIN_NARRATIVE_DURATION 
          }
        }
      });
    }
    
    // Checks com próxima fase
    if (i < sortedPhases.length - 1) {
      const nextPhase = sortedPhases[i + 1];
      
      // Check 1: Overlap de fases
      if (nextPhase.startTime < phase.endTime) {
        const overlapDuration = phase.endTime - nextPhase.startTime;
        findings.push({
          id: `overlap_${phase.id}_${nextPhase.id}`,
          type: 'phase_overlap',
          severity: 'critical',
          location: { phaseId: phase.id },
          problem: `Fases "${phase.id}" e "${nextPhase.id}" se sobrepõem`,
          evidence: {
            expected: `${nextPhase.id}.startTime >= ${phase.id}.endTime`,
            actual: `Overlap de ${overlapDuration.toFixed(2)}s (${phase.endTime.toFixed(2)}s > ${nextPhase.startTime.toFixed(2)}s)`,
            data: {
              phase1: { id: phase.id, end: phase.endTime },
              phase2: { id: nextPhase.id, start: nextPhase.startTime },
              overlapDuration
            }
          }
        });
      }
      
      // Check 2: Gap entre fases
      const gap = nextPhase.startTime - phase.endTime;
      if (gap > MAX_GAP_THRESHOLD) {
        findings.push({
          id: `gap_${phase.id}_${nextPhase.id}`,
          type: 'phase_gap',
          severity: 'warning',
          location: { phaseId: phase.id },
          problem: `Gap de ${gap.toFixed(2)}s entre "${phase.id}" e "${nextPhase.id}"`,
          evidence: {
            expected: 'Fases contíguas sem gaps',
            actual: `Gap de ${gap.toFixed(2)}s causa tela preta`,
            data: {
              phase1: { id: phase.id, end: phase.endTime },
              phase2: { id: nextPhase.id, start: nextPhase.startTime },
              gap
            }
          }
        });
      }
    }
  }
  
  // Check 6: Sequenciamento de IDs (info apenas)
  const hasSequentialIds = phases.every((phase, i) => {
    const match = phase.id.match(/(\d+)/);
    return match && parseInt(match[1]) === i + 1;
  });
  
  if (!hasSequentialIds && phases.length > 1) {
    findings.push({
      id: 'non_sequential_ids',
      type: 'duplicate_id', // Reusing closest type
      severity: 'info',
      location: {},
      problem: 'IDs das fases não seguem sequência numérica',
      evidence: {
        expected: 'cena-1, cena-2, cena-3...',
        actual: phases.map(p => p.id).join(', '),
        data: { phaseIds: phases.map(p => p.id) }
      }
    });
  }
  
  // Check 7: Fase de loading (primeira fase deve começar perto de 0)
  if (sortedPhases.length > 0 && sortedPhases[0].startTime > 3) {
    findings.push({
      id: 'late_first_phase',
      type: 'phase_gap',
      severity: 'warning',
      location: { phaseId: sortedPhases[0].id },
      problem: `Primeira fase começa em ${sortedPhases[0].startTime.toFixed(2)}s (esperado: ~0s)`,
      evidence: {
        expected: 'Primeira fase deve começar em 0s ou ter loading phase',
        actual: `Gap de ${sortedPhases[0].startTime.toFixed(2)}s no início`,
        data: { firstPhaseStart: sortedPhases[0].startTime }
      }
    });
  }
  
  // Check 8: autoAdvance em interativas (se tiver campo)
  for (const phase of phases) {
    const interactiveTypes = ['interaction', 'playground', 'cta'];
    const phaseRecord = phase as unknown as Record<string, unknown>;
    if (interactiveTypes.includes(phase.type) && phaseRecord.autoAdvance === true) {
      findings.push({
        id: `auto_advance_interactive_${phase.id}`,
        type: 'cta_invalid_action',
        severity: 'error',
        location: { phaseId: phase.id },
        problem: `Fase interativa "${phase.id}" tem autoAdvance: true`,
        evidence: {
          expected: 'autoAdvance: false para fases interativas',
          actual: 'autoAdvance: true',
          data: { phaseType: phase.type }
        }
      });
    }
  }
  
  return findings;
}

// ============================================================================
// HELPER: Calculate total audio coverage
// ============================================================================

export function calculateAudioCoverage(
  phases: PhaseData[], 
  audioDuration: number
): { covered: number; percentage: number; gaps: Array<{ start: number; end: number }> } {
  if (phases.length === 0 || audioDuration === 0) {
    return { covered: 0, percentage: 0, gaps: [] };
  }
  
  const sortedPhases = [...phases].sort((a, b) => a.startTime - b.startTime);
  const gaps: Array<{ start: number; end: number }> = [];
  let covered = 0;
  
  // Gap no início
  if (sortedPhases[0].startTime > 0) {
    gaps.push({ start: 0, end: sortedPhases[0].startTime });
  }
  
  // Calcular cobertura e gaps
  for (let i = 0; i < sortedPhases.length; i++) {
    const phase = sortedPhases[i];
    const duration = Math.max(0, phase.endTime - phase.startTime);
    covered += duration;
    
    if (i < sortedPhases.length - 1) {
      const nextPhase = sortedPhases[i + 1];
      const gap = nextPhase.startTime - phase.endTime;
      if (gap > MAX_GAP_THRESHOLD) {
        gaps.push({ start: phase.endTime, end: nextPhase.startTime });
      }
    }
  }
  
  // Gap no final
  const lastPhase = sortedPhases[sortedPhases.length - 1];
  if (lastPhase.endTime < audioDuration) {
    gaps.push({ start: lastPhase.endTime, end: audioDuration });
  }
  
  return {
    covered,
    percentage: (covered / audioDuration) * 100,
    gaps
  };
}
