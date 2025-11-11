import { PipelineInput, Step1Output } from './types';

/**
 * STEP 1: INTAKE & VALIDAÇÃO INICIAL
 * - Valida se o modelo existe (V1 ou V2)
 * - Valida estrutura básica do conteúdo
 * - Conta número de seções e exercícios
 */
export async function step1Intake(input: PipelineInput): Promise<Step1Output> {
  console.log('📥 [STEP 1] Iniciando intake e validação...');
  
  // Validar modelo
  if (!['v1', 'v2'].includes(input.model)) {
    throw new Error(`Modelo inválido: ${input.model}. Use 'v1' ou 'v2'.`);
  }
  console.log(`✅ [STEP 1] Modelo validado: ${input.model.toUpperCase()}`);

  // Validar título
  if (!input.title || input.title.trim().length === 0) {
    throw new Error('Título da lição é obrigatório');
  }
  console.log(`✅ [STEP 1] Título validado: "${input.title}"`);

  // Validar seções
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

  // Validar exercícios
  if (!input.exercises || input.exercises.length === 0) {
    throw new Error('A lição deve ter pelo menos 1 exercício');
  }
  console.log(`✅ [STEP 1] ${input.exercises.length} exercícios solicitados`);

  // Validar trackId e orderIndex
  if (!input.trackId) {
    throw new Error('trackId é obrigatório');
  }
  if (input.orderIndex === undefined || input.orderIndex < 0) {
    throw new Error('orderIndex é obrigatório e deve ser >= 0');
  }

  // Estimar tempo se não fornecido (3 minutos por seção + 1 minuto por exercício)
  const estimatedTimeMinutes = input.estimatedTimeMinutes || 
    (input.sections.length * 3 + input.exercises.length);

  console.log('✅ [STEP 1] Validação completa - dados prontos para próxima etapa');

  return {
    model: input.model,
    title: input.title,
    trackId: input.trackId,
    trackName: input.trackName,
    orderIndex: input.orderIndex,
    sections: input.sections,
    exercises: input.exercises,
    estimatedTimeMinutes,
  };
}
