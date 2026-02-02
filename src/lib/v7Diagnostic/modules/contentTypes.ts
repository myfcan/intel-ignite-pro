/**
 * V7 Diagnostic - Content Types Module
 * =====================================
 * 
 * Valida compatibilidade entre tipos de fase e visual.
 */

import type { V7Finding, PhaseData } from '../types';
import { 
  VALID_PHASE_TYPES, 
  VALID_VISUAL_TYPES, 
  VALID_INTERACTION_TYPES,
  VALID_MICROVISUAL_TYPES 
} from '../types';

// Mapeamento de compatibilidade phase.type -> visual.type
const PHASE_VISUAL_COMPATIBILITY: Record<string, string[]> = {
  'dramatic': ['number-reveal', 'text-reveal', 'image'],
  'narrative': ['text-reveal', 'cards-reveal', 'image'],
  'comparison': ['split-screen'],
  'interaction': ['quiz', 'quiz-feedback'],
  'playground': ['playground'],
  'revelation': ['letter-reveal', 'text-reveal'],
  'secret-reveal': ['letter-reveal', 'text-reveal'],
  'cta': ['cta', 'result'],
  'gamification': ['result'],
  'loading': ['loading']
};

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export function analyzeContentTypes(phases: PhaseData[]): V7Finding[] {
  const findings: V7Finding[] = [];
  
  for (const phase of phases) {
    const phaseType = phase.type;
    const visualType = phase.visual?.type;
    
    // Check 1: Phase type válido (já verificado em jsonStructure, mas re-check)
    if (phaseType && !VALID_PHASE_TYPES.includes(phaseType as typeof VALID_PHASE_TYPES[number])) {
      findings.push({
        id: `content_invalid_phase_${phase.id}`,
        type: 'invalid_phase_type',
        severity: 'error',
        location: { phaseId: phase.id },
        problem: `Tipo de fase inválido: "${phaseType}"`,
        evidence: {
          expected: `Um de: ${VALID_PHASE_TYPES.join(', ')}`,
          actual: phaseType,
          data: {}
        }
      });
    }
    
    // Check 2: Visual type válido
    if (visualType && !VALID_VISUAL_TYPES.includes(visualType as typeof VALID_VISUAL_TYPES[number])) {
      findings.push({
        id: `content_invalid_visual_${phase.id}`,
        type: 'invalid_visual_type',
        severity: 'error',
        location: { phaseId: phase.id },
        problem: `Tipo de visual inválido: "${visualType}"`,
        evidence: {
          expected: `Um de: ${VALID_VISUAL_TYPES.join(', ')}`,
          actual: visualType,
          data: {}
        }
      });
    }
    
    // Check 3: MicroVisual types válidos
    if (phase.microVisuals) {
      for (const mv of phase.microVisuals) {
        if (mv.type && !VALID_MICROVISUAL_TYPES.includes(mv.type as typeof VALID_MICROVISUAL_TYPES[number])) {
          findings.push({
            id: `content_invalid_mv_${mv.id || phase.id}`,
            type: 'invalid_visual_type',
            severity: 'error',
            location: { phaseId: phase.id, elementId: mv.id },
            problem: `Tipo de microVisual inválido: "${mv.type}"`,
            evidence: {
              expected: `Um de: ${VALID_MICROVISUAL_TYPES.join(', ')}`,
              actual: mv.type,
              data: {}
            }
          });
        }
      }
    }
    
    // Check 4: Interaction type válido
    if (phase.interaction?.type) {
      const interactionType = phase.interaction.type;
      if (!VALID_INTERACTION_TYPES.includes(interactionType as typeof VALID_INTERACTION_TYPES[number])) {
        findings.push({
          id: `content_invalid_interaction_${phase.id}`,
          type: 'invalid_phase_type',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Tipo de interação inválido: "${interactionType}"`,
          evidence: {
            expected: `Um de: ${VALID_INTERACTION_TYPES.join(', ')}`,
            actual: interactionType,
            data: {}
          }
        });
      }
    }
    
    // Check 5: Compatibilidade phase/visual
    if (phaseType && visualType) {
      const compatibleVisuals = PHASE_VISUAL_COMPATIBILITY[phaseType];
      
      if (compatibleVisuals && !compatibleVisuals.includes(visualType)) {
        findings.push({
          id: `incompatible_types_${phase.id}`,
          type: 'invalid_visual_type',
          severity: 'warning',
          location: { phaseId: phase.id },
          problem: `Combinação phase.type="${phaseType}" com visual.type="${visualType}" não é comum`,
          evidence: {
            expected: `Visual types para "${phaseType}": ${compatibleVisuals.join(', ')}`,
            actual: visualType,
            data: { 
              phaseType, 
              visualType,
              recommendedVisuals: compatibleVisuals 
            }
          }
        });
      }
    }
  }
  
  return findings;
}
