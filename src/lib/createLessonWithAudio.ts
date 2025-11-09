import { supabase } from '@/integrations/supabase/client';
import { autoGenerateAudioWithToast } from './autoGenerateAudio';

/**
 * EXEMPLO DE USO: Como criar uma lição com áudio automático
 * 
 * Esta função demonstra o fluxo completo de:
 * 1. Inserir lição no banco
 * 2. Gerar áudio automaticamente
 * 3. Retornar lição completa com audio_url
 */

interface CreateLessonParams {
  title: string;
  description?: string;
  trail_id: string;
  order_index: number;
  lesson_type: 'guided' | 'interactive' | 'fill-blanks' | 'quiz-playground';
  audioText: string;  // Texto para narração
  content: any;       // Conteúdo estruturado da lição
  autoGenerateAudio?: boolean; // Default: true
}

/**
 * Cria uma lição e automaticamente gera o áudio
 */
export async function createLessonWithAudio(params: CreateLessonParams) {
  const { autoGenerateAudio = true, ...lessonData } = params;
  
  try {
    console.log('📝 Criando lição:', lessonData.title);
    
    // 1. Inserir lição no banco
    const { data: lesson, error: insertError } = await supabase
      .from('lessons')
      .insert({
        title: lessonData.title,
        description: lessonData.description,
        trail_id: lessonData.trail_id,
        order_index: lessonData.order_index,
        lesson_type: lessonData.lesson_type,
        content: lessonData.content,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Lição criada:', lesson.id);

    // 2. Gerar áudio automaticamente (se habilitado)
    if (autoGenerateAudio) {
      console.log('🎙️ Iniciando geração automática de áudio...');
      
      const audioSuccess = await autoGenerateAudioWithToast(
        lesson.id,
        lessonData.audioText,
        lessonData.content
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
        audioGenerated: audioSuccess
      };
    }

    return {
      success: true,
      lesson,
      audioGenerated: false
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
  const result = await createLessonWithAudio({
    title: 'O que é a IA e por que nós precisamos dela',
    description: 'Introdução aos conceitos fundamentais de IA',
    trail_id: 'trail-fundamentos-id',
    order_index: 1,
    lesson_type: 'interactive',
    
    // Texto completo que será narrado
    audioText: `
      Olá! Bem-vindo à primeira aula sobre Inteligência Artificial.
      
      Hoje vamos explorar o que é IA e por que ela é tão importante no mundo moderno.
      
      A Inteligência Artificial é a capacidade de máquinas aprenderem e tomarem decisões.
      
      Vamos começar!
    `,
    
    // Conteúdo estruturado da lição
    content: {
      audioText: 'Olá! Bem-vindo à primeira aula sobre Inteligência Artificial...',
      sections: [
        {
          id: 'intro',
          speechBubbleText: 'Olá! Bem-vindo à primeira aula sobre Inteligência Artificial.',
          visualContent: 'Introdução ao tema'
        },
        {
          id: 'definicao',
          speechBubbleText: 'A Inteligência Artificial é a capacidade de máquinas aprenderem e tomarem decisões.',
          visualContent: 'Definição de IA'
        },
        {
          id: 'importancia',
          speechBubbleText: 'Ela é importante porque transforma a forma como vivemos e trabalhamos.',
          visualContent: 'Importância da IA'
        }
      ]
    },
    
    // Gerar áudio automaticamente (default: true)
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
