import { PipelineInput, Step1Output } from './types';

/**
 * STEP 1: INTAKE & VALIDAÇÃO INICIAL
 * - Valida se o modelo existe (V1, V2, V3, V4 ou V5)
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
    console.log(`✅ [STEP 1] ${input.sections.length} seções validadas (${input.model.toUpperCase()})`);

    // Validar visualContent em cada seção com mensagens detalhadas
    for (let i = 0; i < input.sections.length; i++) {
      const section = input.sections[i];
      const missing: string[] = [];
      
      if (!section.id) missing.push('id');
      if (!section.visualContent) missing.push('visualContent');
      
      if (missing.length > 0) {
        console.error(`❌ [STEP 1] Seção ${i + 1} recebida:`, JSON.stringify(section, null, 2));
        throw new Error(
          `❌ Seção ${i + 1} está incompleta\n\n` +
          `Campos AUSENTES: ${missing.join(', ')}\n` +
          `Campos PRESENTES: ${Object.keys(section).join(', ')}\n\n` +
          `📋 Estrutura CORRETA para ${input.model.toUpperCase()}:\n` +
          `{\n` +
          `  "id": "intro",           // ✅ OBRIGATÓRIO\n` +
          `  "title": "Título",        // opcional\n` +
          `  "visualContent": "...",   // ✅ OBRIGATÓRIO (markdown)\n` +
          `  "speechBubbleText": "...", // opcional\n` +
          `  "showPlaygroundCall": true // opcional\n` +
          `}\n\n` +
          `💡 Veja TEMPLATE-AULA-V5-COMPLETO.json para exemplo completo`
        );
      }
    }
    console.log(`✅ [STEP 1] Todas as seções têm conteúdo válido`);
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

  // Validar exercícios
  if (!input.exercises || input.exercises.length === 0) {
    throw new Error('A lição deve ter pelo menos 1 exercício');
  }
  console.log(`✅ [STEP 1] ${input.exercises.length} exercícios solicitados`);

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