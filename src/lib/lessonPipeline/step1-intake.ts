import { PipelineInput, Step1Output } from './types';

// Helper: Gerar instrução padrão baseada no tipo de exercício
function getDefaultInstruction(type: string): string {
  const instructions: Record<string, string> = {
    'multiple-choice': 'Selecione a alternativa correta:',
    'true-false': 'Avalie se a afirmação é verdadeira ou falsa:',
    'complete-sentence': 'Complete as lacunas:',
    'fill-in-blanks': 'Preencha os espaços em branco:',
    'drag-drop': 'Arraste os itens para as posições corretas:',
    'scenario-selection': 'Analise o cenário e selecione a melhor opção:',
    'platform-match': 'Associe cada item à plataforma correspondente:',
    'data-collection': 'Responda às perguntas:'
  };
  return instructions[type] || 'Responda a questão:';
}

/**
 * STEP 1: INTAKE & VALIDAÇÃO INICIAL
 * - Valida se o modelo existe (V1, V2, V3, V4 ou V5)
 * - NORMALIZA campos desatualizados automaticamente
 * - Valida estrutura básica do conteúdo
 * - Conta número de seções e exercícios
 */
export async function step1Intake(input: PipelineInput): Promise<Step1Output> {
  const startTime = Date.now();
  console.log('📥 [STEP 1] Iniciando intake e validação...');
  console.log(`🐛 [STEP 1] Input recebido: modelo=${input.model}, título="${input.title}"`);
  console.log(`🐛 [STEP 1] Dados do input: trackId=${input.trackId}, orderIndex=${input.orderIndex}`);

  // Validar modelo
  if (!['v1', 'v2', 'v3', 'v4', 'v5'].includes(input.model)) {
    throw new Error(`Modelo inválido: ${input.model}. Use 'v1', 'v2', 'v3', 'v4' ou 'v5'.`);
  }
  console.log(`✅ [STEP 1] Modelo validado: ${input.model.toUpperCase()}`);

  // Validar título
  if (!input.title || input.title.trim().length === 0) {
    throw new Error('Título da lição é obrigatório');
  }
  console.log(`✅ [STEP 1] Título validado: "${input.title}"`);

  // Validar conteúdo baseado no modelo
  if (input.model === 'v4' || input.model === 'v5') {
    // V4/V5: Similar a V2, mas com suporte a playground interativo (v4) e experience cards (v5)
    if (!input.sections || input.sections.length === 0) {
      throw new Error(`A lição ${input.model.toUpperCase()} deve ter pelo menos 1 seção`);
    }
    console.log(`✅ [STEP 1] ${input.sections.length} seções recebidas (${input.model.toUpperCase()})`);

    // 🔧 NORMALIZAÇÃO AUTOMÁTICA: Converte campos antigos/incorretos
    console.log('🔧 [STEP 1] Normalizando estrutura das seções...');

    // Contar experience cards antes da normalização (V5)
    let totalExperienceCards = 0;

    // ✨ V5: Detectar experienceCards no root level (formato AdminV5CardConfig)
    const rootLevelCards = (input as any).experienceCards || [];
    if (input.model === 'v5' && rootLevelCards.length > 0) {
      console.log(`🎨 [STEP 1] Detectados ${rootLevelCards.length} experienceCards no root level`);
    }

    input.sections = input.sections.map((section: any, index: number) => {
      const sectionIndex = index + 1; // AdminV5CardConfig usa sectionIndex 1-based

      const normalized: any = {
        id: section.id || `section-${index + 1}`, // ✅ OBRIGATÓRIO
        visualContent: section.visualContent || section.markdown || section.content || '', // ✅ OBRIGATÓRIO
      };

      // Campos opcionais
      if (section.title) normalized.title = section.title;
      if (section.speechBubbleText || section.speechBubble) {
        normalized.speechBubbleText = section.speechBubbleText || section.speechBubble;
      }
      if (section.showPlaygroundCall !== undefined) {
        normalized.showPlaygroundCall = section.showPlaygroundCall;
      }
      if (section.playgroundConfig) {
        normalized.playgroundConfig = section.playgroundConfig;
      }

      // V5: Preservar experience cards que já estão na seção
      if (input.model === 'v5' && section.experienceCards && section.experienceCards.length > 0) {
        normalized.experienceCards = section.experienceCards;
        totalExperienceCards += section.experienceCards.length;
        console.log(`   📦 Seção ${index + 1}: ${section.experienceCards.length} experience cards (inline)`);
      }

      // ✨ V5: Distribuir experienceCards do root level para as seções correspondentes
      if (input.model === 'v5' && rootLevelCards.length > 0) {
        const cardsForThisSection = rootLevelCards.filter(
          (card: any) => card.sectionIndex === sectionIndex
        );

        if (cardsForThisSection.length > 0) {
          // Inicializar array se não existir
          if (!normalized.experienceCards) {
            normalized.experienceCards = [];
          }

          // Converter formato AdminV5CardConfig para formato pipeline
          cardsForThisSection.forEach((card: any) => {
            const pipelineCard = {
              id: `card-${sectionIndex}-${normalized.experienceCards.length + 1}`,
              type: card.type,
              anchorText: card.anchorText,
              // ✨ Preservar props para DynamicExperienceCard
              props: card.props
            };
            normalized.experienceCards.push(pipelineCard);
            totalExperienceCards++;
          });

          console.log(`   📦 Seção ${sectionIndex}: +${cardsForThisSection.length} experience cards (do root)`);
        }
      }

      return normalized;
    });
    console.log(`✅ [STEP 1] ${input.sections.length} seções normalizadas com sucesso`);

    if (input.model === 'v5') {
      console.log(`✨ [STEP 1] Total de Experience Cards: ${totalExperienceCards}`);
    }

    // ✨ V5: Converter playgroundMidLesson para formato per-section
    const playgroundMidLesson = (input as any).playgroundMidLesson;
    if (input.model === 'v5' && playgroundMidLesson) {
      // Por padrão, adicionar playground na penúltima seção (para aparecer APÓS ela)
      // Ou na última seção se houver apenas 1-2 seções
      const targetSectionIndex = Math.max(0, input.sections.length - 2);
      const targetSection = input.sections[targetSectionIndex] as any;

      // Adicionar showPlaygroundCall e playgroundConfig à seção alvo
      targetSection.showPlaygroundCall = true;
      targetSection.playgroundConfig = {
        type: playgroundMidLesson.type || 'real-playground',
        instruction: playgroundMidLesson.instruction,
        triggerAfterSection: targetSectionIndex,
        realConfig: playgroundMidLesson.realConfig || undefined
      };

      console.log(`🎮 [STEP 1] playgroundMidLesson configurado na seção ${targetSectionIndex + 1}`);
      console.log(`   📝 Instrução: "${playgroundMidLesson.instruction?.substring(0, 50)}..."`);
    }

    // Validar após normalização
    for (let i = 0; i < input.sections.length; i++) {
      const section = input.sections[i];
      const missing: string[] = [];

      if (!section.id) missing.push('id');
      if (!section.visualContent || section.visualContent.trim().length === 0) {
        missing.push('visualContent');
      }

      if (missing.length > 0) {
        console.error(`❌ [STEP 1] Seção ${i + 1} após normalização:`, JSON.stringify(section, null, 2));
        throw new Error(
          `❌ Seção ${i + 1} ainda está incompleta após normalização\n\n` +
          `Campos AUSENTES: ${missing.join(', ')}\n` +
          `Campos PRESENTES: ${Object.keys(section).join(', ')}\n\n` +
          `Possível causa: campo de conteúdo está vazio ou ausente no JSON original`
        );
      }
    }
    console.log(`✅ [STEP 1] Todas as seções validadas com sucesso`);
  } else if (input.model === 'v3') {
    // V3: Validar v3Data
    if (!input.v3Data) {
      throw new Error('v3Data é obrigatório para modelo V3');
    }
    if (!input.v3Data.audioText || input.v3Data.audioText.trim().length === 0) {
      throw new Error('audioText é obrigatório em v3Data');
    }
    if (!input.v3Data.slides || input.v3Data.slides.length === 0) {
      throw new Error('A lição V3 deve ter pelo menos 1 slide');
    }
    if (input.v3Data.slides.length < 7) {
      console.warn(`⚠️ [STEP 1] V3 com ${input.v3Data.slides.length} slides (recomendado: mínimo 7)`);
    }
    if (input.v3Data.slides.length > 15) {
      console.warn(`⚠️ [STEP 1] V3 com ${input.v3Data.slides.length} slides (recomendado: máximo 15)`);
    }

    // Validar cada slide
    for (let i = 0; i < input.v3Data.slides.length; i++) {
      const slide = input.v3Data.slides[i];
      if (!slide.id || !slide.contentIdea) {
        throw new Error(`Slide ${i + 1} está incompleto (falta id ou contentIdea)`);
      }
    }

    console.log(`✅ [STEP 1] ${input.v3Data.slides.length} slides validados`);
    console.log(`✅ [STEP 1] audioText: ${input.v3Data.audioText.length} caracteres`);
  } else {
    // V1/V2: Validar sections
    if (!input.sections || input.sections.length === 0) {
      throw new Error('A lição deve ter pelo menos 1 seção');
    }
    console.log(`✅ [STEP 1] ${input.sections.length} seções encontradas`);

    // Validar visualContent em cada seção
    for (let i = 0; i < input.sections.length; i++) {
      const section = input.sections[i];
      if (!section.id || !section.visualContent) {
        throw new Error(`Seção ${i + 1} está incompleta (falta id ou visualContent)`);
      }
    }
    console.log(`✅ [STEP 1] Todas as seções têm conteúdo válido`);
  }

  // Validar e normalizar exercícios
  if (!input.exercises || input.exercises.length === 0) {
    throw new Error('A lição deve ter pelo menos 1 exercício');
  }

  // ✨ Normalizar formato de exercícios
  console.log('🔧 [STEP 1] Normalizando exercícios...');
  input.exercises = input.exercises.map((exercise: any, idx: number) => {
    const normalized: any = {
      // ID: usar existente ou gerar
      id: exercise.id || `exercise-${idx + 1}`,
      // Tipo: obrigatório
      type: exercise.type,
      // Título: usar question como fallback
      title: exercise.title || exercise.question || `Exercício ${idx + 1}`,
      // Instrução: usar question ou gerar baseado no tipo
      instruction: exercise.instruction || exercise.question || getDefaultInstruction(exercise.type),
      // Data: preservar
      data: exercise.data || {}
    };

    // Se o exercise tem question no data, preservar
    if (exercise.question && !normalized.data.question) {
      normalized.data.question = exercise.question;
    }

    // Preservar campos extras do data original
    if (exercise.data) {
      normalized.data = { ...exercise.data };
    }

    return normalized;
  });

  console.log(`✅ [STEP 1] ${input.exercises.length} exercícios normalizados`);

  // Validar trackId e orderIndex
  if (!input.trackId) {
    throw new Error('trackId é obrigatório');
  }

  // Validar formato UUID do trackId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(input.trackId)) {
    throw new Error(`trackId inválido: "${input.trackId}" não é um UUID válido`);
  }

  if (input.orderIndex === undefined || input.orderIndex < 0) {
    throw new Error('orderIndex é obrigatório e deve ser >= 0');
  }

  console.log(`✅ [STEP 1] trackId validado: ${input.trackId}`);
  console.log(`✅ [STEP 1] orderIndex validado: ${input.orderIndex}`);

  // Estimar tempo baseado no modelo
  let estimatedTimeMinutes = input.estimatedTimeMinutes;
  if (!estimatedTimeMinutes) {
    if (input.model === 'v3') {
      estimatedTimeMinutes = (input.v3Data!.slides.length * 2) + input.exercises.length;
    } else {
      estimatedTimeMinutes = (input.sections!.length * 3) + input.exercises.length;
    }
  }

  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [STEP 1] Validação completa em ${elapsedTime}ms`);
  console.log(`📊 [STEP 1] Resumo: ${input.model === 'v3' ? input.v3Data!.slides.length + ' slides' : input.sections!.length + ' seções'}, ${input.exercises.length} exercícios, tempo estimado: ${estimatedTimeMinutes}min`);

  return {
    model: input.model,
    title: input.title,
    trackId: input.trackId,
    trackName: input.trackName,
    orderIndex: input.orderIndex,
    sections: input.sections,
    v3Data: input.v3Data,
    exercises: input.exercises,
    estimatedTimeMinutes,
  };
}
