/**
 * V7 Pipeline - Step 6: Consolidar
 * 
 * Salva a lição no banco de dados como draft.
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  V7PipelineContext, 
  V7Step1Output,
  V7Step3Output, 
  V7Step5Output, 
  V7Step6Output 
} from '../types';

interface Step6Context extends V7PipelineContext {
  validated: V7Step1Output;
  audio: V7Step3Output;
  content: V7Step5Output;
}

export async function v7Step6Consolidate(
  context: Step6Context
): Promise<V7Step6Output> {
  const { validated, audio, content, logger } = context;
  const { validatedInput } = validated;
  const startTime = Date.now();
  
  await logger.info(6, 'Consolidate', '💾 Preparando para salvar no banco...');

  // ============================================================
  // 1. PREPARAR DADOS
  // ============================================================
  const trailId = validatedInput.trail_id;
  const orderIndex = validatedInput.order_index ?? 0;
  const estimatedTime = Math.ceil(audio.totalDuration / 60);

  await logger.info(6, 'Consolidate', `   📍 Trail: ${trailId || 'N/A'}`);
  await logger.info(6, 'Consolidate', `   📍 Order Index: ${orderIndex}`);
  await logger.info(6, 'Consolidate', `   ⏱️ Tempo estimado: ${estimatedTime}min`);

  // ============================================================
  // 2. VERIFICAR DUPLICATAS
  // ============================================================
  if (trailId) {
    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('trail_id', trailId)
      .eq('order_index', orderIndex)
      .maybeSingle();

    if (existingLesson) {
      throw new Error(
        `Já existe uma aula com order_index ${orderIndex} na trilha: "${existingLesson.title}". ` +
        `Use outro order_index ou remova a aula existente.`
      );
    }
  }

  // ============================================================
  // 3. SALVAR NO BANCO
  // ============================================================
  await logger.info(6, 'Consolidate', '   💾 Inserindo lição...');

  // Usar RPC para criar draft (com SECURITY DEFINER)
  const { data: lessonId, error } = await supabase.rpc('create_lesson_draft', {
    p_title: validatedInput.title,
    p_trail_id: trailId || null,
    p_order_index: orderIndex,
    p_estimated_time: estimatedTime,
    p_content: content.content as unknown as any,
    p_exercises: (content.content.postLessonExercises || []) as unknown as any,
    p_audio_url: audio.audioUrl,
    p_word_timestamps: audio.wordTimestamps as unknown as any
  });

  if (error) {
    await logger.error(6, 'Consolidate', '❌ Erro ao salvar', { error: error.message });
    throw new Error(`Falha ao salvar lição: ${error.message}`);
  }

  if (!lessonId) {
    throw new Error('Falha ao criar lição: ID não retornado');
  }

  // ============================================================
  // 4. ATUALIZAR COM CAMPOS ADICIONAIS
  // ============================================================
  const { error: updateError } = await supabase
    .from('lessons')
    .update({
      model: 'v7-vv',
      description: validatedInput.subtitle || validatedInput.learningObjectives.join('. '),
      difficulty_level: mapDifficulty(validatedInput.difficulty),
      status: 'draft',
      fase_criacao: 'pipeline-complete',
      progresso_criacao: 100
    })
    .eq('id', lessonId);

  if (updateError) {
    await logger.warn(6, 'Consolidate', `⚠️ Erro ao atualizar campos extras: ${updateError.message}`);
  }

  const elapsedTime = Date.now() - startTime;
  await logger.success(6, 'Consolidate', `✅ Lição salva em ${elapsedTime}ms`, {
    lessonId,
    trailId: trailId || 'standalone'
  });

  return {
    lessonId
  };
}

/**
 * Mapeia dificuldade do V7 para enum do banco
 */
function mapDifficulty(difficulty: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (difficulty) {
    case 'beginner': return 'beginner';
    case 'intermediate': return 'intermediate';
    case 'advanced': return 'advanced';
    default: return 'beginner';
  }
}
