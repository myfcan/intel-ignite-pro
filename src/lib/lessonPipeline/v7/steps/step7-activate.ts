/**
 * V7 Pipeline - Step 7: Ativar
 * 
 * Ativa a lição para que fique disponível para os usuários.
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  V7PipelineContext, 
  V7Step3Output,
  V7Step5Output, 
  V7Step7Output 
} from '../types';

interface Step7Context extends V7PipelineContext {
  lessonId: string;
  content: V7Step5Output;
  audio: V7Step3Output;
}

export async function v7Step7Activate(
  context: Step7Context
): Promise<V7Step7Output> {
  const { lessonId, content, audio, logger } = context;
  const startTime = Date.now();
  
  await logger.info(7, 'Activate', '🚀 Ativando lição...');
  await logger.info(7, 'Activate', `   📍 Lesson ID: ${lessonId}`);

  // ============================================================
  // 1. ATUALIZAR STATUS PARA ATIVO
  // ============================================================
  const updateData = {
    is_active: true,
    status: 'completed',
    model: 'v7-vv',
    content: content.content as unknown as any,
    exercises: (content.content.postLessonExercises || []) as unknown as any,
    exercises_version: 1,
    audio_url: audio.audioUrl,
    word_timestamps: audio.wordTimestamps as unknown as any,
    estimated_time: Math.ceil(audio.totalDuration / 60),
    fase_criacao: 'activated',
    progresso_criacao: 100
  };

  const { error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', lessonId);

  if (error) {
    await logger.error(7, 'Activate', '❌ Erro ao ativar', { error: error.message });
    throw new Error(`Falha ao ativar lição: ${error.message}`);
  }

  // ============================================================
  // 2. LOG DE SUCESSO
  // ============================================================
  const elapsedTime = Date.now() - startTime;
  const metadata = content.content.metadata;
  
  await logger.success(7, 'Activate', `✅ Lição ativada em ${elapsedTime}ms`, {
    lessonId,
    title: metadata.title,
    duration: `${Math.floor(metadata.totalDuration / 60)}min ${Math.floor(metadata.totalDuration % 60)}s`,
    phases: metadata.phasesCount
  });

  // Log resumo final
  await logger.info(7, 'Activate', `
📊 RESUMO DA LIÇÃO V7-VV
━━━━━━━━━━━━━━━━━━━━━━━━
🎬 Título: ${metadata.title}
📚 Categoria: ${metadata.category}
⏱️ Duração: ${Math.floor(metadata.totalDuration / 60)}min ${Math.floor(metadata.totalDuration % 60)}s
📄 Fases: ${metadata.phasesCount}
🎯 Dificuldade: ${metadata.difficulty}
🏷️ Tags: ${metadata.tags.join(', ')}
━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim());

  return {
    lessonId,
    activated: true
  };
}
