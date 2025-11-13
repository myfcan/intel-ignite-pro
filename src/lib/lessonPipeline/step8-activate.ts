import { Step7Output, PipelineResult } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * STEP 8: ATUALIZAR BANCO E ATIVAR LIÇÃO
 * - Atualiza registro no banco com dados completos
 * - Marca como is_active: true
 */
export async function step8Activate(input: Step7Output): Promise<PipelineResult> {
  const startTime = Date.now();
  console.log('🚀 [STEP 8] Ativando lição...');
  console.log(`🐛 [STEP 8] lessonId: ${input.lessonId}, modelo: ${input.model}`);
  console.log(`🐛 [STEP 8] Duração total: ${input.totalDuration.toFixed(1)}s`);

  // CORREÇÃO 1: Separar exercises do content e salvar TUDO no UPDATE
  const { exercises, ...contentWithoutExercises } = input.structuredContent;
  
  const updateData: any = {
    is_active: true,
    content: contentWithoutExercises,           // ✅ Salvar content
    exercises: exercises || [],                 // ✅ Salvar exercises
    exercises_version: 1,                       // ✅ Salvar versão
    estimated_time: Math.ceil(input.totalDuration / 60)  // ✅ Salvar tempo estimado
  };

  // Para V1 e V3, adicionar audio_url e word_timestamps na raiz
  if (input.model === 'v1' || input.model === 'v3') {
    console.log('🐛 [STEP 8] Modelo V1/V3: adicionando audio_url e word_timestamps');
    updateData.audio_url = input.audioUrl;
    updateData.word_timestamps = input.wordTimestamps;
  }

  console.log('🔵 [STEP 8] Atualizando registro no banco...');
  console.log(`📊 [STEP 8] Dados a atualizar: content (${JSON.stringify(contentWithoutExercises).length} chars), ${exercises.length} exercises`);
  
  const { error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', input.lessonId);

  if (error) {
    console.error('❌ [STEP 8] Erro ao ativar lição:', error);
    throw new Error(`Falha ao ativar lição: ${error.message}`);
  }

  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [STEP 8] Lição ativada com sucesso em ${elapsedTime}ms!`);
  console.log(`📊 [STEP 8] Resumo da ativação:`);
  console.log(`   - ID: ${input.lessonId}`);
  console.log(`   - Modelo: ${input.model.toUpperCase()}`);
  console.log(`   - Duração: ${input.totalDuration.toFixed(1)}s (${Math.floor(input.totalDuration / 60)}min ${Math.floor(input.totalDuration % 60)}s)`);
  console.log(`   - Tempo estimado: ${updateData.estimated_time}min`);
  console.log(`   - Status: active (publicada)`);
  console.log(`   - Exercises: ${(exercises || []).length} (versão ${updateData.exercises_version})`);
  console.log(`   - Content: ${JSON.stringify(contentWithoutExercises).length} caracteres`);
  console.log(`   - Content version: ${contentWithoutExercises.contentVersion || 'N/A'}`);

  return {
    success: true,
    lessonId: input.lessonId,
    status: 'active',
    logs: [],
  };
}
