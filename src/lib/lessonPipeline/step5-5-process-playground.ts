/**
 * ============================================================================
 * STEP 5.5: PROCESSAR PLAYGROUND CONFIG
 * ============================================================================
 *
 * 📍 LOCALIZAÇÃO NO PIPELINE: Entre step5-generate-exercises e step6-validate
 *
 * 🎯 OBJETIVO (OPÇÃO C - HÍBRIDA):
 * 1. MODELO V1: Adicionar playground automático na sessão 4 se não existir
 * 2. COMPLETAR: Expandir realConfig quando tipo = 'real-playground' mas incompleto
 * 3. RESPEITAR: Não mexer em playgrounds com realConfig customizado completo
 *
 * ⚠️ PROBLEMA QUE RESOLVE:
 * - Aulas V1 simples não precisam escrever playground (automático genérico)
 * - Aulas customizadas podem ter realConfig específico (respeitado)
 * - Dados incompletos são completados automaticamente
 *
 * ✅ SOLUÇÃO HÍBRIDA:
 * - Se modelo V1 SEM playground na sessão 4 → ADICIONAR genérico livre
 * - Se playground EXISTE mas SEM realConfig → COMPLETAR com padrão
 * - Se playground COM realConfig completo → NÃO MEXER (customizado)
 *
 * 🔗 COMPONENTES RELACIONADOS:
 *   - UI: src/components/lessons/PlaygroundMidLesson.tsx (integração com IA)
 *   - Edge Function: supabase/functions/lesson-playground/index.ts (IA real)
 *   - Pipeline: src/lib/lessonPipeline/index.ts (orquestração)
 *   - Admin: src/pages/AdminPipelineCreateBatch.tsx (criação em lote)
 *
 * 📅 ADICIONADO: 2025-11-15
 * 📅 ATUALIZADO (Opção C): 2025-11-16
 * 🔍 GITHUB SEARCH: "STEP 5.5", "process-playground", "realConfig generation", "hybrid"
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

  let processedCount = 0;
  let addedCount = 0;

  // ============================================================================
  // MODELO V3: ADICIONAR finalPlaygroundConfig AUTOMÁTICO
  // ============================================================================
  // V3 usa playground final (não inline). Se não existir, adicionar genérico.
  // ============================================================================
  
  if (input.model === 'v3') {
    console.log('🎮 [STEP 5.5] Modelo V3 detectado: processando finalPlaygroundConfig...');
    
    // V3 armazena o playground em structuredContent.finalPlaygroundConfig
    if (!input.structuredContent) {
      console.log('⚠️ [STEP 5.5] structuredContent não encontrado para V3, pulando processamento');
      return input;
    }

    // Verificar se já tem finalPlaygroundConfig
    if (!input.structuredContent.finalPlaygroundConfig) {
      console.log('🎮 [STEP 5.5] Adicionando playground final genérico para V3');
      
      // Adicionar playground genérico padrão
      input.structuredContent.finalPlaygroundConfig = {
        type: 'real-playground',
        instruction: 'Vamos praticar o que você aprendeu!',
        realConfig: {
          title: 'Hora da Prática! 🚀',
          maiaMessage: 'Parabéns por chegar até aqui! Agora é hora de colocar em prática tudo que você aprendeu. Converse com a IA e explore suas possibilidades!',
          scenario: {
            title: 'Experimente Livremente',
            description: 'Use o conhecimento que acabou de adquirir. Seja criativo e teste diferentes abordagens!'
          },
          prefilledText: '',
          userPlaceholder: 'Digite seu prompt aqui... 💭',
          validation: {
            minLength: 20,
            requiredKeywords: [],
            feedback: {
              tooShort: '⚠️ Seu prompt precisa ter pelo menos 20 caracteres. Tente ser mais específico!',
              good: '✅ Ótimo! Vamos testar com a IA.',
              excellent: '🎉 Perfeito! Pronto para a IA responder!'
            }
          }
        }
      };
      
      addedCount++;
      console.log('✅ [STEP 5.5] finalPlaygroundConfig genérico adicionado para V3');
    } else if (input.structuredContent.finalPlaygroundConfig.type === 'real-playground' && !input.structuredContent.finalPlaygroundConfig.realConfig) {
      // Se tem playground mas falta realConfig, completar
      console.log('🎮 [STEP 5.5] Completando finalPlaygroundConfig incompleto para V3');
      
      input.structuredContent.finalPlaygroundConfig.realConfig = {
        title: 'Hora da Prática! 🚀',
        maiaMessage: input.structuredContent.finalPlaygroundConfig.instruction || 'Agora é sua vez de praticar!',
        scenario: {
          title: 'Desafio Prático',
          description: input.structuredContent.finalPlaygroundConfig.instruction || 'Use o que aprendeu para resolver este desafio.'
        },
        prefilledText: '',
        userPlaceholder: 'Digite seu prompt aqui... 💭',
        validation: {
          minLength: 20,
          requiredKeywords: [],
          feedback: {
            tooShort: '⚠️ Seu prompt precisa ter pelo menos 20 caracteres. Tente ser mais específico!',
            good: '✅ Bom trabalho! Seu prompt está bem estruturado.',
            excellent: '🎉 Excelente! Você dominou a técnica!'
          }
        }
      };
      
      processedCount++;
      console.log('✅ [STEP 5.5] finalPlaygroundConfig completado para V3');
    } else {
      console.log('ℹ️ [STEP 5.5] V3 já tem finalPlaygroundConfig completo, respeitando configuração');
    }
    
    // Para V3, retornar aqui (não processar sections inline)
    const totalActions = addedCount + processedCount;
    if (totalActions > 0) {
      console.log(`✅ [STEP 5.5] V3 concluído com ${totalActions} ação(ões)`);
    }
    return input;
  }

  // ============================================================================
  // MODELO V5: PRESERVAR playgroundConfig COM useBridgeVersion E playgroundExampleV3
  // ============================================================================
  // V5 usa PlaygroundBridgeV3 com playgroundExampleV3 dentro de sections
  // Deve preservar completamente o playgroundConfig original do JSON
  // ============================================================================

  if (input.model === 'v5') {
    console.log('🎮 [STEP 5.5] Modelo V5 detectado: preservando playgroundConfig nas sections...');
    
    if (!input.structuredContent || !input.structuredContent.sections) {
      console.log('⚠️ [STEP 5.5] V5 sem structuredContent/sections, pulando processamento');
      return input;
    }

    let v5Sections = [...input.structuredContent.sections];
    let v5ProcessedCount = 0;

    // Processar cada seção V5
    v5Sections = v5Sections.map((section, index) => {
      // Se seção tem showPlaygroundCall e playgroundConfig, preservar e completar se necessário
      if (section.showPlaygroundCall && section.playgroundConfig) {
        const config = section.playgroundConfig;
        
        // Se é useBridgeVersion v3 com playgroundExampleV3, apenas preservar
        if (config.useBridgeVersion === 'v3' && config.playgroundExampleV3) {
          console.log(`✅ [STEP 5.5] V5 Seção ${index + 1}: PlaygroundBridgeV3 detectado e preservado`);
          v5ProcessedCount++;
          
          // Garantir que type está definido
          return {
            ...section,
            playgroundConfig: {
              ...config,
              type: config.type || 'real-playground'
            }
          };
        }
        
        // Se tem playgroundConfig mas sem useBridgeVersion v3, completar com realConfig padrão
        if (config.type === 'real-playground' && !config.realConfig) {
          console.log(`📝 [STEP 5.5] V5 Seção ${index + 1}: Completando realConfig padrão`);
          v5ProcessedCount++;
          
          return {
            ...section,
            playgroundConfig: {
              ...config,
              type: 'real-playground',
              realConfig: {
                title: 'Hora da Prática! 🚀',
                maiaMessage: config.instruction || 'Agora é sua vez de praticar!',
                scenario: {
                  title: 'Desafio Prático',
                  description: config.instruction || 'Use o que aprendeu para resolver este desafio.'
                },
                prefilledText: '',
                userPlaceholder: 'Digite seu prompt aqui... 💭',
                validation: {
                  minLength: 20,
                  requiredKeywords: [],
                  feedback: {
                    tooShort: '⚠️ Seu prompt precisa ter pelo menos 20 caracteres.',
                    good: '✅ Bom trabalho!',
                    excellent: '🎉 Excelente!'
                  }
                }
              }
            }
          };
        }
      }
      
      return section;
    });

    console.log(`✅ [STEP 5.5] V5 concluído: ${v5ProcessedCount} playground(s) processado(s)`);
    
    return {
      ...input,
      structuredContent: {
        ...input.structuredContent,
        sections: v5Sections
      }
    };
  }

  // ============================================================================
  // MODELOS V1/V2/V4: PROCESSAR PLAYGROUNDS INLINE
  // ============================================================================

  // Se não há structured content, retornar input sem modificações
  if (!input.structuredContent) {
    console.log('⚠️ [STEP 5.5] Nenhum structuredContent encontrado, pulando processamento');
    return input;
  }

  let sections = [...(input.structuredContent.sections || [])];

  if (sections.length === 0) {
    console.log('ℹ️ [STEP 5.5] Nenhuma seção encontrada, pulando processamento');
    return input;
  }

  // ============================================================================
  // OPÇÃO C - PARTE 1: ADICIONAR PLAYGROUND AUTOMÁTICO EM MODELO V1
  // ============================================================================
  // Se modelo V1 E sessão 4 (índice 3) NÃO tem playground
  // → ADICIONAR playground genérico livre automaticamente
  // ============================================================================

  if (input.model === 'v1' && sections.length >= 4) {
    const session4 = sections[3]; // índice 3 = sessão 4

    // Verificar se sessão 4 NÃO tem playground configurado
    if (!session4.playgroundConfig || !session4.showPlaygroundCall) {
      console.log('🎮 [STEP 5.5] Modelo V1 detectado: adicionando playground genérico na sessão 4');

      // Adicionar playground genérico livre
      sections[3] = {
        ...session4,
        showPlaygroundCall: true,
        playgroundConfig: {
          type: 'real-playground',
          instruction: 'Vamos praticar o que você aprendeu!',
          realConfig: {
            title: 'Hora da Prática! 🚀',
            maiaMessage: 'Converse com a IA e veja a mágica acontecer! Seja criativo e experimente diferentes perguntas.',
            scenario: {
              title: 'Experimente Livremente',
              description: 'Sem limites! Faça qualquer pergunta e veja como a IA responde.'
            },
            prefilledText: '', // Campo totalmente livre
            userPlaceholder: 'Digite seu prompt aqui... 💭',
            validation: {
              minLength: 20,
              requiredKeywords: [], // Sem palavras obrigatórias
              feedback: {
                tooShort: '⚠️ Seu prompt precisa ter pelo menos 20 caracteres. Tente ser mais específico!',
                good: '✅ Ótimo! Vamos testar com a IA.',
                excellent: '🎉 Perfeito! Pronto para a IA responder!'
              }
            }
          }
        }
      };

      addedCount++;
      console.log('✅ [STEP 5.5] Playground genérico adicionado na sessão 4');
    } else {
      console.log('ℹ️ [STEP 5.5] Modelo V1: sessão 4 já tem playground (customizado ou existente)');
    }
  }

  // ============================================================================
  // OPÇÃO C - PARTE 2: COMPLETAR PLAYGROUNDS INCOMPLETOS
  // ============================================================================
  // Processar todas as seções que JÁ têm playground mas SEM realConfig completo
  // Se realConfig JÁ existe → NÃO MEXER (respeitar customização)
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
    // 2. NÃO deve ter um realConfig já configurado (respeitar customização!)
    //
    // Se JÁ TEM realConfig completo → NÃO MEXER (Opção C: respeitar customizado)
    // Se NÃO TEM realConfig → COMPLETAR com padrão
    // ============================================================================

    if (config.type === 'real-playground' && !config.realConfig) {

      console.log(`📝 [STEP 5.5] Seção ${index + 1}: Playground incompleto detectado, gerando realConfig padrão`);

      // ========================================================================
      // GERAR realConfig PADRÃO (Completar incompletos)
      // ========================================================================
      // Este objeto fornece uma estrutura completa e funcional
      // Usa a 'instruction' fornecida no input como contexto
      // Usado quando JSON batch tem apenas 'instruction' mas sem realConfig
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

      console.log(`✅ [STEP 5.5] Seção ${index + 1}: realConfig padrão gerado`);

      // Retornar seção com realConfig expandido
      // ✅ CORREÇÃO: Preservar TODOS os campos originais do playgroundConfig (useBridgeVersion, playgroundExampleV3, etc.)
      return {
        ...section,
        playgroundConfig: {
          ...config, // ✅ Preservar todos os campos originais (useBridgeVersion, playgroundExampleV3, etc.)
          type: 'real-playground',
          instruction: config.instruction, // Manter instruction original
          realConfig: generatedRealConfig
        }
      };
    }

    // Se JÁ tem realConfig completo, NÃO MEXER (Opção C: respeitar customização)
    if (config.type === 'real-playground' && config.realConfig) {
      console.log(`ℹ️ [STEP 5.5] Seção ${index + 1}: Playground customizado detectado, respeitando realConfig existente`);
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

  // ============================================================================
  // RESUMO FINAL
  // ============================================================================
  const totalActions = addedCount + processedCount;

  if (totalActions > 0) {
    console.log(`✅ [STEP 5.5] Concluído com sucesso:`);
    if (addedCount > 0) {
      console.log(`   - ${addedCount} playground(s) adicionado(s) automaticamente (modelo V1)`);
    }
    if (processedCount > 0) {
      console.log(`   - ${processedCount} playground(s) completado(s) (realConfig faltando)`);
    }
  } else {
    console.log(`ℹ️ [STEP 5.5] Nenhuma ação necessária (playgrounds já completos ou customizados)`);
  }

  return {
    ...input,
    structuredContent: updatedStructuredContent
  };
}
