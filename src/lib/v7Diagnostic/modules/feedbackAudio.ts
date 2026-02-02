/**
 * V7 Diagnostic - Feedback Audio Module
 * ======================================
 * 
 * Valida áudios de feedback para quiz options.
 */

import type { V7Finding, PhaseData } from '../types';

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export function analyzeFeedbackAudios(phases: PhaseData[]): V7Finding[] {
  const findings: V7Finding[] = [];
  
  for (const phase of phases) {
    // Só analisa fases com quiz
    if (phase.interaction?.type !== 'quiz') continue;
    
    const options = phase.interaction.options || [];
    const correctOptions = options.filter(opt => opt.isCorrect === true);
    
    for (const option of options) {
      const optionId = option.id || 'unknown';
      
      // Check 1: URL presente
      if (!option.feedback?.audioUrl) {
        findings.push({
          id: `feedback_no_url_${phase.id}_${optionId}`,
          type: 'quiz_missing_feedback',
          severity: 'error',
          location: { phaseId: phase.id, elementId: optionId },
          problem: `Opção "${optionId}" não tem áudio de feedback`,
          evidence: {
            expected: 'feedback.audioUrl definido',
            actual: 'Não definido',
            data: { 
              optionId, 
              optionText: option.text,
              isCorrect: option.isCorrect 
            }
          }
        });
      }
      
      // Check 3: ID match (feedback ID deve corresponder à option)
      // Isso é mais uma convenção do que um erro real
      // Pulamos por enquanto
    }
    
    // Check 5: Correct feedback exists
    if (correctOptions.length > 0) {
      const correctWithoutFeedback = correctOptions.filter(opt => !opt.feedback?.audioUrl);
      
      if (correctWithoutFeedback.length > 0) {
        findings.push({
          id: `correct_no_feedback_${phase.id}`,
          type: 'quiz_missing_feedback',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Opção correta não tem áudio de feedback`,
          evidence: {
            expected: 'Feedback obrigatório para opções corretas',
            actual: `${correctWithoutFeedback.length} opção(ões) correta(s) sem feedback`,
            data: { 
              correctOptions: correctWithoutFeedback.map(o => o.id) 
            }
          }
        });
      }
    }
  }
  
  // Verificar feedbackAudios no content se existir
  // (estrutura alternativa onde feedbacks são armazenados separadamente)
  
  return findings;
}
