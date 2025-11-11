import { Step7Output, PipelineResult } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * STEP 8: ATUALIZAR BANCO E ATIVAR LIÇÃO
 * - Atualiza registro no banco com dados completos
 * - Marca como is_active: true
 */
export async function step8Activate(input: Step7Output): Promise<PipelineResult> {
  console.log('🚀 [STEP 8] Ativando lição...');

  const updateData: any = {
    content: input.structuredContent,
    estimated_time: Math.ceil(input.totalDuration / 60), // Converter segundos para minutos
    is_active: true,
  };

  // Para V1, adicionar audio_url e word_timestamps na raiz
  if (input.model === 'v1') {
    updateData.audio_url = input.audioUrl;
    updateData.word_timestamps = input.wordTimestamps;
  }

  const { error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', input.lessonId);

  if (error) {
    console.error('❌ [STEP 8] Erro ao ativar lição:', error);
    throw new Error(`Falha ao ativar lição: ${error.message}`);
  }

  console.log(`✅ [STEP 8] Lição ativada com sucesso!`);
  console.log(`   📋 ID: ${input.lessonId}`);
  console.log(`   ⏱️ Duração: ${input.totalDuration.toFixed(1)}s`);
  console.log(`   🎯 Status: active`);

  return {
    success: true,
    lessonId: input.lessonId,
    status: 'active',
    logs: [],
  };
}
