import { Step3Output, Step4Output } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * STEP 4: CRIAÇÃO DO REGISTRO NO BANCO (SEM ÁUDIO)
 * - Cria estrutura de content JSONB baseada no modelo
 * - Insere no banco com status draft (áudio pendente)
 */
export async function step4CreateDraft(input: Step3Output): Promise<Step4Output> {
  console.log('💾 [STEP 4] Criando draft no banco de dados...');

  // Verificar autenticação antes de inserir (força validação server-side)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('❌ [STEP 4] Token JWT inválido ou expirado!');
    throw new Error('Autenticação inválida. Faça login novamente.');
  }

  console.log(`🔐 [STEP 4] Token validado para: ${user.email}`);

  // Criar estrutura content baseada no modelo
  let content: any;

  if (input.model === 'v1') {
    console.log('   📋 Montando estrutura Modelo V1...');
    
    // V1: Seções + playground mid-lesson (se configurado) + exercícios finais
    const sections = input.sections.map((section, idx) => {
      const baseSection = {
        id: section.id,
        title: section.title,
        timestamp: 0, // Será calculado depois
        type: 'text' as const,
        speechBubbleText: section.speechBubbleText || section.visualContent.substring(0, 100),
        visualContent: section.visualContent,
      };

      // Se a seção tem playgroundConfig, adicionar
      if (section.playgroundConfig) {
        const config = section.playgroundConfig.config;
        const parsedConfig = typeof config === 'string' 
          ? (config.trim().startsWith('{') ? JSON.parse(config) : { prompt: config })
          : config;

        return {
          ...baseSection,
          showPlaygroundCall: true,
          playgroundConfig: {
            type: section.playgroundConfig.type,
            triggerAfterSection: idx,
            ...(section.playgroundConfig.type === 'real-playground' && {
              realConfig: parsedConfig
            }),
            ...(section.playgroundConfig.type === 'interactive-simulation' && {
              simulationConfig: parsedConfig
            }),
          },
        } as any;
      }

      return baseSection;
    });

    // Se nenhuma seção tem playground, adicionar placeholder padrão (comportamento atual)
    const hasPlayground = sections.some((s: any) => s.showPlaygroundCall);
    if (!hasPlayground) {
      const playgroundSectionIndex = Math.floor(sections.length * 0.6);
      sections[playgroundSectionIndex] = {
        ...sections[playgroundSectionIndex],
        showPlaygroundCall: true,
        playgroundConfig: {
          instruction: 'Complete o desafio prático',
          type: 'real-playground' as const,
          triggerAfterSection: playgroundSectionIndex,
        },
      } as any;
    }

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

  // Debug: Testar RLS antes do insert
  console.log('🐛 [STEP 4] Testando RLS com token atual...');
  const { error: rcsTestError } = await supabase
    .from('lessons')
    .select('id')
    .limit(1);

  if (rcsTestError) {
    console.error('❌ [STEP 4] Erro ao testar RLS:', rcsTestError);
    throw new Error(`RLS test falhou: ${rcsTestError.message}`);
  }

  console.log('✅ [STEP 4] RLS test passou - token JWT válido');

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
