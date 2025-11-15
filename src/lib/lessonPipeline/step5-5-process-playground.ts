/**
 * ============================================================================
 * STEP 5.5: PROCESSAR PLAYGROUND CONFIG
 * ============================================================================
 *
 * 📍 LOCALIZAÇÃO NO PIPELINE: Entre step5-generate-exercises e step6-validate
 *
 * 🎯 OBJETIVO:
 * Expandir automaticamente o playgroundConfig quando tipo = 'real-playground'
 * mas não possui um realConfig completo.
 *
 * ⚠️ PROBLEMA QUE RESOLVE:
 * Antes deste step, o pipeline apenas copiava o playgroundConfig básico do input:
 *   { type: 'real-playground', instruction: '...' }
 *
 * Isso causava dados incompletos no banco, forçando a UI a usar fallbacks.
 *
 * ✅ SOLUÇÃO:
 * Este step gera automaticamente um realConfig completo com:
 *   - title
 *   - maiaMessage
 *   - scenario (title, description)
 *   - prefilledText
 *   - userPlaceholder
 *   - validation (minLength, requiredKeywords, feedback)
 *
 * 🔗 COMPONENTES RELACIONADOS:
 *   - UI: src/components/lessons/PlaygroundMidLesson.tsx (integração com IA)
 *   - Edge Function: supabase/functions/lesson-playground/index.ts (IA real)
 *   - Pipeline: src/lib/lessonPipeline/index.ts (orquestração)
 *
 * 📅 ADICIONADO: 2025-11-15
 * 🔍 GITHUB SEARCH: "STEP 5.5", "process-playground", "realConfig generation"
 *
 * ============================================================================
 */

import { Step5Output } from './types';
import { PipelineLogger } from './logger';

export async function step5_5ProcessPlayground(
  input: Step5Output,
  logger?: PipelineLogger
): Promise<Step5Output> {

  // Log de início do step (usando console.log pois é log interno, não de progresso)
  console.log('🎮 [STEP 5.5] Iniciando processamento de playground config...');

  // Se não há structured content, retornar input sem modificações
  if (!input.structuredContent) {
    console.log('⚠️ [STEP 5.5] Nenhum structuredContent encontrado, pulando processamento');
    return input;
  }

  const sections = input.structuredContent.sections || [];

  if (sections.length === 0) {
    console.log('ℹ️ [STEP 5.5] Nenhuma seção encontrada, pulando processamento');
    return input;
  }

  let processedCount = 0;

  // ============================================================================
  // PROCESSAR CADA SEÇÃO
  // ============================================================================
  const processedSections = sections.map((section, index) => {

    // Verificar se seção tem playground configurado
    if (!section.playgroundConfig || !section.showPlaygroundCall) {
      return section; // Não precisa processar
    }

    const config = section.playgroundConfig;

    // ============================================================================
    // VERIFICAR SE PRECISA GERAR realConfig
    // ============================================================================
    // Critérios:
    // 1. Tipo deve ser 'real-playground'
    // 2. Não deve ter um realConfig já configurado
    //
    // Se essas condições forem verdadeiras, gerar automaticamente
    // ============================================================================

    if (config.type === 'real-playground' && !config.realConfig) {

      console.log(`📝 [STEP 5.5] Seção ${index + 1}: Gerando realConfig automático`);

      // ========================================================================
      // GERAR realConfig PADRÃO
      // ========================================================================
      // Este objeto fornece uma estrutura completa e funcional
      // Usa a 'instruction' fornecida no input como contexto
      // ========================================================================

      const generatedRealConfig = {
        title: 'Hora da Prática! 🚀',
        maiaMessage: config.instruction || 'Agora é sua vez de colocar em prática o que aprendeu!',
        scenario: {
          title: 'Desafio Prático',
          description: config.instruction || 'Use o conhecimento adquirido para resolver este desafio real.'
        },
        prefilledText: '', // Usuário começa do zero
        userPlaceholder: 'Digite seu prompt aqui... 💭',
        validation: {
          minLength: 20,
          requiredKeywords: [], // Não há palavras obrigatórias por padrão
          feedback: {
            tooShort: '⚠️ Seu prompt precisa ter pelo menos 20 caracteres. Tente ser mais específico!',
            good: '✅ Bom trabalho! Seu prompt está bem estruturado.',
            excellent: '🎉 Excelente! Você dominou a técnica de criar prompts eficazes!'
          }
        }
      };

      processedCount++;

      console.log(`✅ [STEP 5.5] Seção ${index + 1}: realConfig gerado com sucesso`);

      // Retornar seção com realConfig expandido
      return {
        ...section,
        playgroundConfig: {
          type: 'real-playground',
          instruction: config.instruction, // Manter instruction original
          realConfig: generatedRealConfig
        }
      };
    }

    // Se não precisa processar, retornar como está
    return section;
  });

  // ============================================================================
  // ATUALIZAR STRUCTURED CONTENT
  // ============================================================================
  // Garantir que structuredContent tenha as seções atualizadas
  // ============================================================================

  const updatedStructuredContent = {
    ...input.structuredContent,
    sections: processedSections
  };

  console.log(`✅ [STEP 5.5] Concluído: ${processedCount} playground(s) processado(s)`);

  return {
    ...input,
    structuredContent: updatedStructuredContent
  };
}
