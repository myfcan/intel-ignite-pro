/**
 * V7 Pipeline - Step 1: Validação
 * 
 * Valida o V7ScriptInput contra o schema definido e regras de negócio.
 */

import { 
  V7ScriptInput, 
  validateV7ScriptInput, 
  requiresAnchorPause,
  countNarrationWords 
} from '@/types/V7ScriptInput';
import { V7PipelineContext, V7Step1Output } from '../types';

export async function v7Step1Validate(
  context: V7PipelineContext
): Promise<V7Step1Output> {
  const { input, logger } = context;
  const startTime = Date.now();
  
  await logger.info(1, 'Validate', '📥 Iniciando validação do V7ScriptInput...');

  // ============================================================
  // 1. VALIDAÇÃO DE SCHEMA
  // ============================================================
  const validationErrors = validateV7ScriptInput(input);
  
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map(e => `[${e.scene}] ${e.field}: ${e.message}`);
    await logger.error(1, 'Validate', '❌ Erros de validação encontrados', {
      errors: errorMessages
    });
    throw new Error(`Validação falhou:\n${errorMessages.join('\n')}`);
  }

  await logger.info(1, 'Validate', '✅ Schema validado');

  // ============================================================
  // 2. VALIDAÇÕES ADICIONAIS
  // ============================================================
  const warnings: string[] = [];

  // 2.1 Verificar total de palavras
  const totalWords = countNarrationWords(input);
  if (totalWords < 100) {
    warnings.push(`Narração muito curta (${totalWords} palavras). Mínimo recomendado: 100 palavras.`);
  }
  if (totalWords > 2000) {
    warnings.push(`Narração muito longa (${totalWords} palavras). Máximo recomendado: 2000 palavras.`);
  }
  await logger.info(1, 'Validate', `📊 Total de palavras: ${totalWords}`);

  // 2.2 Verificar cenas interativas têm interação definida
  input.scenes.forEach((scene, idx) => {
    if (scene.type === 'interaction' && !scene.interaction) {
      warnings.push(`Cena ${idx + 1} (${scene.id}) é do tipo 'interaction' mas não tem 'interaction' definido.`);
    }
    if (scene.type === 'playground' && !scene.interaction) {
      warnings.push(`Cena ${idx + 1} (${scene.id}) é do tipo 'playground' mas não tem 'interaction' definido.`);
    }
  });

  // 2.3 Verificar sequência de cenas
  const sceneTypes = input.scenes.map(s => s.type);
  const hasGameification = sceneTypes.includes('gamification');
  if (!hasGameification) {
    warnings.push('Nenhuma cena de gamificação encontrada. Recomendado: adicionar cena de resultado final.');
  }

  // 2.4 Verificar dificuldade vs complexidade
  const interactiveCount = input.scenes.filter(s => 
    ['interaction', 'playground', 'secret-reveal'].includes(s.type)
  ).length;
  
  if (input.difficulty === 'beginner' && interactiveCount > 5) {
    warnings.push(`Muitas interações (${interactiveCount}) para nível 'beginner'. Considere simplificar.`);
  }

  // 2.5 Verificar trail_id e order_index
  if (!input.trail_id) {
    await logger.warn(1, 'Validate', '⚠️ trail_id não definido. A lição não será associada a uma trilha.');
  }
  if (input.order_index === undefined) {
    await logger.warn(1, 'Validate', '⚠️ order_index não definido. Será usado 0 como padrão.');
  }

  // ============================================================
  // 3. NORMALIZAÇÃO
  // ============================================================
  const normalizedInput: V7ScriptInput = {
    ...input,
    trail_id: input.trail_id || undefined,
    order_index: input.order_index ?? 0,
    voice_id: input.voice_id || 'oqUwsXKac3MSo4E51ySV',
    generate_audio: input.generate_audio ?? true,
    fail_on_audio_error: input.fail_on_audio_error ?? true,
    scenes: input.scenes.map((scene, idx) => ({
      ...scene,
      id: scene.id || `scene-${idx + 1}`,
    }))
  };

  // Log warnings
  if (warnings.length > 0) {
    await logger.warn(1, 'Validate', `⚠️ ${warnings.length} avisos encontrados`, { warnings });
  }

  const elapsedTime = Date.now() - startTime;
  await logger.success(1, 'Validate', `✅ Validação completa em ${elapsedTime}ms`, {
    scenes: normalizedInput.scenes.length,
    totalWords,
    warnings: warnings.length
  });

  return {
    validatedInput: normalizedInput,
    validationWarnings: warnings
  };
}
