/**
 * V7 Diagnostic - Interaction Requirements Module
 * ================================================
 * 
 * Valida requisitos de fases interativas: Quiz, Playground, CTA.
 */

import type { V7Finding, PhaseData } from '../types';

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export function analyzeInteractions(phases: PhaseData[]): V7Finding[] {
  const findings: V7Finding[] = [];
  
  for (const phase of phases) {
    const interaction = phase.interaction;
    
    // Skip se não tem interação
    if (!interaction) {
      // Mas se é fase interativa, deveria ter
      const interactiveTypes = ['interaction', 'playground', 'cta'];
      if (interactiveTypes.includes(phase.type)) {
        findings.push({
          id: `missing_interaction_${phase.id}`,
          type: 'missing_required_field',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Fase "${phase.id}" é do tipo "${phase.type}" mas não tem configuração de interação`,
          evidence: {
            expected: 'Campo interaction obrigatório',
            actual: 'Não definido',
            data: { phaseType: phase.type }
          }
        });
      }
      continue;
    }
    
    // ========== QUIZ VALIDATIONS ==========
    if (interaction.type === 'quiz') {
      const options = interaction.options || [];
      
      // Check 1: Quiz com pelo menos uma opção correta
      const hasCorrectOption = options.some(opt => opt.isCorrect === true);
      if (!hasCorrectOption && options.length > 0) {
        findings.push({
          id: `quiz_no_correct_${phase.id}`,
          type: 'quiz_no_correct_option',
          severity: 'critical',
          location: { phaseId: phase.id },
          problem: `Quiz "${phase.id}" não tem nenhuma opção marcada como correta`,
          evidence: {
            expected: 'Pelo menos uma opção com isCorrect: true',
            actual: `${options.length} opções, nenhuma correta`,
            data: { 
              optionCount: options.length,
              options: options.map(o => ({ id: o.id, isCorrect: o.isCorrect }))
            }
          }
        });
      }
      
      // Check 2: Quiz feedback match (cada opção deveria ter feedback)
      for (const option of options) {
        if (!option.feedback?.audioUrl) {
          findings.push({
            id: `quiz_missing_feedback_${phase.id}_${option.id}`,
            type: 'quiz_missing_feedback',
            severity: 'warning',
            location: { phaseId: phase.id, elementId: option.id },
            problem: `Opção "${option.id}" do quiz "${phase.id}" não tem áudio de feedback`,
            evidence: {
              expected: 'feedback.audioUrl definido',
              actual: 'Não definido',
              data: { optionId: option.id, optionText: option.text }
            }
          });
        }
      }
      
      // Check: Quiz sem opções
      if (options.length === 0) {
        findings.push({
          id: `quiz_no_options_${phase.id}`,
          type: 'missing_required_field',
          severity: 'critical',
          location: { phaseId: phase.id },
          problem: `Quiz "${phase.id}" não tem opções definidas`,
          evidence: {
            expected: 'Pelo menos 2 opções',
            actual: '0 opções',
            data: {}
          }
        });
      } else if (options.length < 2) {
        findings.push({
          id: `quiz_few_options_${phase.id}`,
          type: 'missing_required_field',
          severity: 'warning',
          location: { phaseId: phase.id },
          problem: `Quiz "${phase.id}" tem apenas ${options.length} opção`,
          evidence: {
            expected: 'Pelo menos 2 opções',
            actual: `${options.length} opção`,
            data: { optionCount: options.length }
          }
        });
      }
    }
    
    // ========== PLAYGROUND VALIDATIONS ==========
    if (interaction.type === 'playground') {
      const interactionData = interaction as Record<string, unknown>;
      
      // Check 3: Playground prompt
      const hasPrompt = interactionData.prompt || 
                        interactionData.instruction ||
                        interactionData.challengePrompt;
      
      if (!hasPrompt) {
        findings.push({
          id: `playground_no_prompt_${phase.id}`,
          type: 'playground_no_prompt',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `Playground "${phase.id}" não tem instrução/prompt definido`,
          evidence: {
            expected: 'Campo prompt, instruction ou challengePrompt',
            actual: 'Nenhum encontrado',
            data: { interactionKeys: Object.keys(interactionData) }
          }
        });
      }
    }
    
    // ========== CTA VALIDATIONS ==========
    if (interaction.type === 'cta-button' || interaction.type === 'cta') {
      const interactionData = interaction as Record<string, unknown>;
      const action = interactionData.action as string | undefined;
      const validActions = ['next-phase', 'complete', 'next-lesson', 'go-home'];
      
      // Check 4: CTA action válida
      if (!action) {
        findings.push({
          id: `cta_no_action_${phase.id}`,
          type: 'cta_invalid_action',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `CTA "${phase.id}" não tem action definida`,
          evidence: {
            expected: `Uma de: ${validActions.join(', ')}`,
            actual: 'Não definida',
            data: {}
          }
        });
      } else if (!validActions.includes(action)) {
        findings.push({
          id: `cta_invalid_action_${phase.id}`,
          type: 'cta_invalid_action',
          severity: 'error',
          location: { phaseId: phase.id },
          problem: `CTA "${phase.id}" tem action inválida: "${action}"`,
          evidence: {
            expected: `Uma de: ${validActions.join(', ')}`,
            actual: action,
            data: { validActions }
          }
        });
      }
      
      // Check: CTA sem buttonText
      if (!interactionData.buttonText) {
        findings.push({
          id: `cta_no_button_${phase.id}`,
          type: 'missing_required_field',
          severity: 'warning',
          location: { phaseId: phase.id },
          problem: `CTA "${phase.id}" não tem texto do botão definido`,
          evidence: {
            expected: 'Campo buttonText',
            actual: 'Não definido',
            data: {}
          }
        });
      }
    }
  }
  
  return findings;
}
