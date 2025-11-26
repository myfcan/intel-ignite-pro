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

  // CORREÇÃO 5: Pipeline idempotente - Se já temos lessonId, não criar novo
  if (input.lessonId) {
    console.log(`   ♻️ Reexecução detectada: lessonId ${input.lessonId} já existe`);
    console.log('   ⏭️ Pulando criação, indo direto para Step 8...');
    return {
      ...input,
      lessonId: input.lessonId
    };
  }

  // Separar exercises do content
  const exercises = input.exercisesConfig || [];
  let contentWithoutExercises = { ...input.structuredContent };

  // CORREÇÃO: Limpar dados duplicados ou desnecessários do content
  // Para V3, verificar se slides estão com dados razoáveis
  if (input.model === 'v3' && contentWithoutExercises.slides) {
    const cleanedSlides = contentWithoutExercises.slides.map((slide: any) => ({
      id: slide.id,
      slideNumber: slide.slideNumber,
      contentIdea: slide.contentIdea,
      imagePrompt: slide.imagePrompt,
      imageUrl: slide.imageUrl,
      timestamp: slide.timestamp
    }));
    
    contentWithoutExercises = {
      ...contentWithoutExercises,
      slides: cleanedSlides
    };
    
    console.log('   🧹 Content limpo para V3: removidos campos desnecessários dos slides');
  }

  console.log('   📋 Preparando dados...');
  const contentSize = JSON.stringify(contentWithoutExercises).length;
  console.log(`      Content: ${contentSize} caracteres`);
  console.log(`      Exercises: ${exercises.length} exercícios`);
  
  // VALIDAÇÃO: Se content muito grande (>5MB), algo está errado
  if (contentSize > 5_000_000) {
    console.error(`❌ Content muito grande: ${contentSize} caracteres (${(contentSize / 1_000_000).toFixed(1)}MB)`);
    console.error('   Possível duplicação de dados detectada!');
    throw new Error(`Content muito grande (${(contentSize / 1_000_000).toFixed(1)}MB). Máximo: 5MB. Verifique se há duplicação de dados.`);
  }

  // CORREÇÃO 3: Passar parâmetros separados (não misturar tudo em p_content)
  const audioUrl = (input.model === 'v1' || input.model === 'v3') ? input.audioUrl : null;
  const wordTimestamps = (input.model === 'v1' || input.model === 'v3') ? input.wordTimestamps : null;

  console.log('   💾 Inserindo no banco de dados...');
  console.log(`      Audio URL: ${audioUrl ? 'presente' : 'null'}`);
  console.log(`      Word Timestamps: ${wordTimestamps ? 'presente' : 'null'}`);

  // Buscar próximo order_index disponível para evitar conflitos
  let orderIndex = input.orderIndex;

  const { data: maxOrderData } = await supabase
    .from('lessons')
    .select('order_index')
    .eq('trail_id', input.trackId)
    .order('order_index', { ascending: false })
    .limit(1);

  if (maxOrderData && maxOrderData.length > 0) {
    const maxOrder = maxOrderData[0].order_index;
    // Se o orderIndex solicitado já existe ou é menor que o máximo, usar próximo disponível
    if (orderIndex <= maxOrder) {
      orderIndex = maxOrder + 1;
      console.log(`   ⚠️ orderIndex ${input.orderIndex} já existe. Usando próximo disponível: ${orderIndex}`);
    }
  }

  // Usar SECURITY DEFINER function para criar a lição (validação de admin está na função)
  const { data: lessonId, error } = await supabase.rpc('create_lesson_draft', {
    p_title: input.title,
    p_trail_id: input.trackId,
    p_order_index: orderIndex,
    p_estimated_time: Math.ceil(input.totalDuration / 60),
    p_content: contentWithoutExercises,  // ✅ Apenas content, sem exercises
    p_exercises: exercises,              // ✅ Exercises separado
    p_audio_url: audioUrl,               // ✅ Audio URL separado (V1/V3)
    p_word_timestamps: wordTimestamps    // ✅ Timestamps separados (V1/V3)
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
