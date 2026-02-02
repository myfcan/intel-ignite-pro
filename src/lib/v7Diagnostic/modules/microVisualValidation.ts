/**
 * V7 Diagnostic - MicroVisual Validation Module
 * ==============================================
 * 
 * Valida microVisuais: triggerTime, letter-reveal, assets, timing.
 */

import type { V7Finding, PhaseData, NormalizedWordTimestamp } from '../types';
import { findKeywordGlobally, findPhaseByTime } from './anchorCrossRef';

const VALID_MV_TYPES = ['icon', 'text', 'number', 'image', 'badge', 'highlight', 'letter-reveal'];

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export function analyzeMicroVisuals(
  phases: PhaseData[],
  timestamps: NormalizedWordTimestamp[]
): V7Finding[] {
  const findings: V7Finding[] = [];
  
  for (const phase of phases) {
    const microVisuals = phase.microVisuals || [];
    
    for (let mvIndex = 0; mvIndex < microVisuals.length; mvIndex++) {
      const mv = microVisuals[mvIndex];
      const mvId = mv.id || `${phase.id}_mv_${mvIndex}`;
      
      // Check 10: Tipo suportado
      if (mv.type && !VALID_MV_TYPES.includes(mv.type)) {
        findings.push({
          id: `invalid_mv_type_${mvId}`,
          type: 'invalid_visual_type',
          severity: 'error',
          location: { phaseId: phase.id, elementId: mvId },
          problem: `MicroVisual "${mvId}" tem tipo inválido: "${mv.type}"`,
          evidence: {
            expected: `Um de: ${VALID_MV_TYPES.join(', ')}`,
            actual: mv.type,
            data: { mvType: mv.type, validTypes: VALID_MV_TYPES }
          }
        });
      }
      
      // Se tem anchorText, verificar se está no range
      if (mv.anchorText) {
        const match = findKeywordGlobally(mv.anchorText, timestamps);
        
        if (match) {
          // Check: MicroVisual no range correto
          if (match.timestamp < phase.startTime || match.timestamp > phase.endTime) {
            const correctPhase = findPhaseByTime(phases, match.timestamp);
            
            findings.push({
              id: `mv_wrong_phase_${mvId}`,
              type: 'microvisual_wrong_phase',
              severity: 'error',
              location: { phaseId: phase.id, elementId: mvId },
              problem: `MicroVisual "${mvId}" com anchorText "${mv.anchorText}" está na fase errada`,
              evidence: {
                expected: `Fase ${phase.id} (${phase.startTime.toFixed(1)}s - ${phase.endTime.toFixed(1)}s)`,
                actual: `Keyword encontrada em ${match.timestamp.toFixed(2)}s (${correctPhase?.id || 'unknown'})`,
                data: {
                  anchorText: mv.anchorText,
                  foundAt: match.timestamp,
                  correctPhaseId: correctPhase?.id,
                  currentPhase: phase.id
                }
              }
            });
          }
        }
      }
      
      // Check 1: triggerTime válido (se definido explicitamente)
      if (mv.triggerTime !== undefined) {
        if (mv.triggerTime < phase.startTime || mv.triggerTime > phase.endTime) {
          findings.push({
            id: `mv_orphan_${mvId}`,
            type: 'microvisual_orphan',
            severity: 'error',
            location: { phaseId: phase.id, elementId: mvId },
            problem: `MicroVisual "${mvId}" tem triggerTime fora do range da fase`,
            evidence: {
              expected: `Entre ${phase.startTime.toFixed(2)}s e ${phase.endTime.toFixed(2)}s`,
              actual: `triggerTime: ${mv.triggerTime.toFixed(2)}s`,
              data: {
                triggerTime: mv.triggerTime,
                phaseStart: phase.startTime,
                phaseEnd: phase.endTime
              }
            }
          });
        }
      }
      
      // Check 2: Duração não ultrapassa fim da fase
      if (mv.triggerTime !== undefined && mv.duration !== undefined) {
        const mvEndTime = mv.triggerTime + mv.duration;
        if (mvEndTime > phase.endTime + 1) { // 1s tolerance
          findings.push({
            id: `mv_overflow_${mvId}`,
            type: 'microvisual_orphan',
            severity: 'warning',
            location: { phaseId: phase.id, elementId: mvId },
            problem: `MicroVisual "${mvId}" ultrapassa o fim da fase`,
            evidence: {
              expected: `Terminar antes de ${phase.endTime.toFixed(2)}s`,
              actual: `Termina em ${mvEndTime.toFixed(2)}s`,
              data: {
                triggerTime: mv.triggerTime,
                duration: mv.duration,
                mvEndTime,
                phaseEnd: phase.endTime
              }
            }
          });
        }
      }
      
      // Check 4: Letter-reveal index validation
      if (mv.type === 'letter-reveal' || phase.visual?.type === 'letter-reveal') {
        const content = mv.content as Record<string, unknown> | undefined;
        const visualContent = phase.visual?.content as Record<string, unknown> | undefined;
        
        // Verificar se tem estrutura de letters
        const letters = (content?.letters || visualContent?.letters) as Array<{ letter: string }> | undefined;
        const word = (content?.word || visualContent?.word) as string | undefined;
        
        if (letters && word) {
          if (letters.length !== word.length) {
            findings.push({
              id: `mv_letter_mismatch_${mvId}`,
              type: 'microvisual_invalid_index',
              severity: 'error',
              location: { phaseId: phase.id, elementId: mvId },
              problem: `Letter-reveal "${mvId}": quantidade de letters não corresponde à palavra`,
              evidence: {
                expected: `${word.length} letters para palavra "${word}"`,
                actual: `${letters.length} letters definidas`,
                data: { word, letterCount: letters.length, wordLength: word.length }
              }
            });
          }
        }
      }
      
      // Check 5: Asset URL válida para image types
      if (mv.type === 'image') {
        const content = mv.content as Record<string, unknown> | undefined;
        const imageUrl = content?.url || content?.src || content?.imageUrl;
        
        if (!imageUrl) {
          findings.push({
            id: `mv_missing_asset_${mvId}`,
            type: 'microvisual_missing_asset',
            severity: 'error',
            location: { phaseId: phase.id, elementId: mvId },
            problem: `MicroVisual de imagem "${mvId}" não tem URL definida`,
            evidence: {
              expected: 'URL de imagem em content.url ou content.src',
              actual: 'Nenhuma URL encontrada',
              data: { mvType: mv.type, content: mv.content }
            }
          });
        }
      }
    }
    
    // Check 8: Ordenação cronológica (warning)
    if (microVisuals.length > 1) {
      const withTriggers = microVisuals.filter(mv => mv.triggerTime !== undefined);
      for (let i = 1; i < withTriggers.length; i++) {
        if ((withTriggers[i].triggerTime || 0) < (withTriggers[i - 1].triggerTime || 0)) {
          findings.push({
            id: `mv_unordered_${phase.id}`,
            type: 'microvisual_orphan',
            severity: 'info',
            location: { phaseId: phase.id },
            problem: `MicroVisuais em "${phase.id}" não estão em ordem cronológica`,
            evidence: {
              expected: 'MicroVisuais ordenados por triggerTime',
              actual: 'Ordem não cronológica detectada',
              data: { 
                triggers: withTriggers.map(mv => ({ id: mv.id, trigger: mv.triggerTime }))
              }
            }
          });
          break;
        }
      }
    }
  }
  
  // Check 6: Colisão de posição (multiple MVs at same time)
  const allMvs: Array<{ id: string; phaseId: string; time: number }> = [];
  for (const phase of phases) {
    for (const mv of phase.microVisuals || []) {
      if (mv.triggerTime !== undefined) {
        allMvs.push({
          id: mv.id || 'unknown',
          phaseId: phase.id,
          time: mv.triggerTime
        });
      }
    }
  }
  
  // Agrupar por tempo (com tolerância de 0.5s)
  const timeGroups = new Map<number, typeof allMvs>();
  for (const mv of allMvs) {
    const roundedTime = Math.round(mv.time * 2) / 2; // Round to nearest 0.5s
    if (!timeGroups.has(roundedTime)) {
      timeGroups.set(roundedTime, []);
    }
    timeGroups.get(roundedTime)!.push(mv);
  }
  
  for (const [time, mvs] of timeGroups) {
    if (mvs.length > 2) { // More than 2 at same time is suspicious
      findings.push({
        id: `mv_collision_${time}`,
        type: 'microvisual_orphan',
        severity: 'warning',
        location: {},
        problem: `${mvs.length} microVisuais disparando ao mesmo tempo (${time}s)`,
        evidence: {
          expected: 'MicroVisuais espaçados temporalmente',
          actual: `${mvs.length} MVs em ${time}s`,
          data: { time, mvs: mvs.map(m => m.id) }
        }
      });
    }
  }
  
  return findings;
}
