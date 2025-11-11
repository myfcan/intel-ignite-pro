import { Step3Output, Step4Output } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * STEP 4: CRIAÇÃO DO REGISTRO NO BANCO (SEM ÁUDIO)
 * - Cria estrutura de content JSONB baseada no modelo
 * - Insere no banco com status draft (áudio pendente)
 */
export async function step4CreateDraft(input: Step3Output): Promise<Step4Output> {
  console.log('💾 [STEP 4] Criando draft no banco de dados...');

  // Criar estrutura content baseada no modelo
  let content: any;

  if (input.model === 'v1') {
    console.log('   📋 Montando estrutura Modelo V1...');
    
    // V1: Seções + 1 playground mid-lesson + exercícios finais
    const sections = input.sections.map((section, idx) => ({
      id: section.id,
      title: section.title,
      timestamp: 0, // Será calculado depois
      type: 'text' as const,
      speechBubbleText: section.speechBubbleText || section.visualContent.substring(0, 100),
      visualContent: section.visualContent,
    }));

    // Adicionar placeholder para playground mid-lesson
    // (será posicionado corretamente na step 7)
    const playgroundSectionIndex = Math.floor(sections.length * 0.6); // ~60% da aula
    sections[playgroundSectionIndex] = {
      ...sections[playgroundSectionIndex],
      showPlaygroundCall: true,
      playgroundConfig: {
        instruction: 'Complete o desafio prático',
        type: 'real-playground' as const,
        triggerAfterSection: playgroundSectionIndex,
      },
    } as any;

    content = {
      contentVersion: 1,
      schemaVersion: 1,
      duration: 0, // Será preenchido depois
      sections,
      exercisesConfig: input.exercisesConfig,
    };

  } else {
    console.log('   📋 Montando estrutura Modelo V2...');
    
    // V2: Seções com audio_url separado + exercícios finais
    const sections = input.sections.map((section, idx) => ({
      id: section.id,
      title: section.title,
      timestamp: 0, // Será calculado depois
      type: 'text' as const,
      speechBubbleText: section.speechBubbleText || section.visualContent.substring(0, 100),
      visualContent: section.visualContent,
      audio_url: null, // Será preenchido na step 6
    }));

    content = {
      contentVersion: 3,
      schemaVersion: 2,
      duration: 0, // Será preenchido depois
      sections,
      exercisesConfig: input.exercisesConfig,
    };
  }

  // Inserir no banco
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      title: input.title,
      lesson_type: 'guided',
      trail_id: input.trackId,
      order_index: input.orderIndex,
      difficulty_level: 'beginner',
      estimated_time: input.estimatedTimeMinutes,
      is_active: false, // Inativo até completar pipeline
      audio_url: null, // V1: será preenchido depois, V2: não usado
      content,
      word_timestamps: null, // V1: será preenchido depois, V2: não usado
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ [STEP 4] Erro ao criar draft:', error);
    throw new Error(`Falha ao criar draft no banco: ${error.message}`);
  }

  const lessonId = data.id;
  console.log(`✅ [STEP 4] Draft criado com sucesso: ${lessonId}`);
  console.log(`   Status: draft (aguardando áudio)`);

  return {
    ...input,
    lessonId,
  };
}
