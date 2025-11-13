import { Step6Output, Step7Output } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * STEP 7: CONSOLIDAÇÃO
 * - Junta todos os componentes (áudio, timestamps, exercícios)
 * - Salva no banco de dados
 * - Marca como is_active: false (ainda não publicada)
 */
export async function step7Consolidate(input: Step6Output): Promise<Step7Output> {
  const startTime = Date.now();
  console.log('📦 [STEP 7] Consolidando aula...');
  console.log(`   Título: "${input.title}"`);
  console.log(`   Modelo: ${input.model}`);

  // Verificar JWT e admin role
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Usuário não autenticado');
  }

  // Refresh token se necessário
  const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
  if (refreshedSession) {
    console.log('   🔄 Token JWT refreshed');
  }

  // Verificar se é admin
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .eq('role', 'admin')
    .single();

  if (!roleData) {
    throw new Error('Apenas admins podem criar lições');
  }

  // Separar exercises do content
  const exercises = input.exercisesConfig || [];
  const contentWithoutExercises = { ...input.structuredContent };

  console.log('   📋 Preparando dados...');
  console.log(`      Content: ${JSON.stringify(contentWithoutExercises).length} caracteres`);
  console.log(`      Exercises: ${exercises.length} exercícios`);

  // Preparar dados completos para inserção
  const lessonData: any = {
    content: contentWithoutExercises,
    exercises: exercises,
    exercises_version: 1
  };

  // Para V1, adicionar audio_url e word_timestamps na raiz
  if (input.model === 'v1') {
    console.log('   🎙️ V1: Adicionando audio_url e word_timestamps');
    lessonData.audio_url = input.audioUrl;
    lessonData.word_timestamps = input.wordTimestamps;
  }

  console.log('   💾 Inserindo no banco de dados...');

  // Usar SECURITY DEFINER function para criar a lição
  const { data: lessonId, error } = await supabase.rpc('create_lesson_draft', {
    p_title: input.title,
    p_trail_id: input.trackId,
    p_order_index: input.orderIndex,
    p_estimated_time: Math.ceil(input.totalDuration / 60),
    p_content: lessonData
  });

  if (error) {
    console.error('❌ [STEP 7] Erro ao consolidar:', error);
    throw new Error(`Falha ao consolidar lição: ${error.message}`);
  }

  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [STEP 7] Aula consolidada em ${elapsedTime}ms!`);
  console.log(`   📍 Lesson ID: ${lessonId}`);
  console.log(`   📊 Resumo:`);
  console.log(`      - Modelo: ${input.model.toUpperCase()}`);
  console.log(`      - Duração: ${Math.floor(input.totalDuration / 60)}min ${Math.floor(input.totalDuration % 60)}s`);
  console.log(`      - Exercises: ${exercises.length}`);
  console.log(`      - Status: DRAFT (não publicada ainda)`);

  return {
    ...input,
    lessonId
  };
}
