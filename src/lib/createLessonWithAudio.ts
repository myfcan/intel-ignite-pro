import { supabase } from '@/integrations/supabase/client';
import { autoGenerateAudioWithToast } from './autoGenerateAudio';
import { processLessonData, logValidation } from './lessonDataProcessor';
import type { GuidedLessonData } from '@/types/guidedLesson';

/**
 * CRIAÇÃO DE LIÇÃO COM PROCESSADOR CENTRALIZADO
 * 
 * Agora usa o processador centralizado para garantir:
 * ✅ audioText sempre limpo (sem emojis/markdown)
 * ✅ estimated_time sempre INTEGER
 * ✅ content estruturado corretamente
 * ✅ Validação antes de salvar
 */

interface CreateLessonParams {
  title: string;
  description?: string;
  trail_id: string;
  order_index: number;
  lesson_type: 'guided' | 'interactive' | 'fill-blanks' | 'quiz-playground';
  lessonData: GuidedLessonData; // Dados estruturados da lição
  audioText: string;  // Texto para narração
  autoGenerateAudio?: boolean; // Default: true
}

/**
 * Cria uma lição usando o processador centralizado
 */
export async function createLessonWithAudio(params: CreateLessonParams) {
  const { autoGenerateAudio = true, lessonData, audioText, ...otherParams } = params;
  
  try {
    console.log('📝 Criando lição:', params.title);
    
    // 1. PROCESSAR dados com o processador centralizado
    const processed = processLessonData({
      lessonData,
      audioText,
      trailId: params.trail_id,
      orderIndex: params.order_index,
      title: params.title,
      description: params.description
    });

    // 2. Log de validação
    logValidation(processed, params.title);

    // 3. Verificar se passou nas validações
    if (!processed.validation.allPassed) {
      console.warn('⚠️ Lição tem problemas mas continuando...');
      processed.validation.warnings.forEach(w => console.warn(`  - ${w}`));
    }

    // 4. Inserir lição no banco com dados processados
    const { data: lesson, error: insertError } = await supabase
      .from('lessons')
      .insert(processed.databaseData)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Lição criada:', lesson.id);

    // 5. Gerar áudio automaticamente (se habilitado)
    if (autoGenerateAudio) {
      console.log('🎙️ Iniciando geração automática de áudio...');
      
      const audioSuccess = await autoGenerateAudioWithToast(
        lesson.id,
        processed.audioData.cleanAudioText, // ✅ Usa texto limpo
        processed.databaseData.content
      );

      if (!audioSuccess) {
        console.warn('⚠️ Lição criada mas áudio falhou. Você pode regenerar depois.');
      }
      
      // Buscar lição atualizada com audio_url
      const { data: updatedLesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lesson.id)
        .single();
      
      return {
        success: true,
        lesson: updatedLesson || lesson,
        audioGenerated: audioSuccess,
        validation: processed.validation
      };
    }

    return {
      success: true,
      lesson,
      audioGenerated: false,
      validation: processed.validation
    };

  } catch (error: any) {
    console.error('❌ Erro ao criar lição:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido',
      lesson: null,
      audioGenerated: false
    };
  }
}

/**
 * EXEMPLO DE USO PRÁTICO
 */
export async function exampleUsage() {
  // Criar dados estruturados da lição
  const exampleLesson: GuidedLessonData = {
    id: 'example-lesson',
    title: 'O que é a IA e por que nós precisamos dela',
    trackId: 'fundamentos',
    trackName: 'Fundamentos de IA',
    contentVersion: 1,
    duration: 120.5,
    sections: [
      {
        id: 'intro',
        type: 'text',
        timestamp: 0,
        speechBubbleText: 'Olá! Bem-vindo à primeira aula sobre IA',
        visualContent: 'Olá! Bem-vindo à primeira aula sobre Inteligência Artificial.'
      },
      {
        id: 'definicao',
        type: 'text',
        timestamp: 30,
        speechBubbleText: 'A IA é a capacidade de máquinas aprenderem',
        visualContent: 'A Inteligência Artificial é a capacidade de máquinas aprenderem e tomarem decisões.'
      },
      {
        id: 'importancia',
        type: 'text',
        timestamp: 60,
        speechBubbleText: 'Ela transforma como vivemos e trabalhamos',
        visualContent: 'Ela é importante porque transforma a forma como vivemos e trabalhamos.'
      }
    ],
    exercisesConfig: []
  };

  const exampleAudioText = `
    Olá! Bem-vindo à primeira aula sobre Inteligência Artificial.
    
    Hoje vamos explorar o que é IA e por que ela é tão importante no mundo moderno.
    
    A Inteligência Artificial é a capacidade de máquinas aprenderem e tomarem decisões.
    
    Vamos começar!
  `;

  const result = await createLessonWithAudio({
    title: exampleLesson.title,
    description: 'Introdução aos conceitos fundamentais de IA',
    trail_id: 'trail-fundamentos-id',
    order_index: 1,
    lesson_type: 'guided',
    lessonData: exampleLesson,
    audioText: exampleAudioText,
    autoGenerateAudio: true
  });

  if (result.success) {
    console.log('✅ Lição criada com sucesso!');
    console.log('📊 ID:', result.lesson?.id);
    console.log('🎙️ Áudio gerado:', result.audioGenerated ? 'Sim' : 'Não');
    console.log('🔗 URL do áudio:', result.lesson?.audio_url);
  } else {
    console.error('❌ Erro:', result.error);
  }

  return result;
}

/**
 * Criar múltiplas lições em batch com áudio
 */
export async function createLessonsInBatch(lessons: CreateLessonParams[]) {
  console.log(`📦 Criando ${lessons.length} lições em batch...`);
  
  const results = [];
  
  for (const lessonParams of lessons) {
    const result = await createLessonWithAudio(lessonParams);
    results.push(result);
    
    // Pequeno delay entre lições para não sobrecarregar API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  const successful = results.filter(r => r.success).length;
  const withAudio = results.filter(r => r.audioGenerated).length;
  
  console.log(`✅ ${successful}/${lessons.length} lições criadas`);
  console.log(`🎙️ ${withAudio}/${lessons.length} áudios gerados`);
  
  return results;
}
