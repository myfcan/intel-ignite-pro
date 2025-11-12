import { Step3Output, Step4Output } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * STEP 4: CRIAÇÃO DO REGISTRO NO BANCO (SEM ÁUDIO)
 * - Cria estrutura de content JSONB baseada no modelo
 * - Insere no banco com status draft (áudio pendente)
 */
export async function step4CreateDraft(input: Step3Output): Promise<Step4Output> {
  console.log('💾 [STEP 4] Criando draft no banco de dados...');

  // FASE 1: Forçar refresh do token antes de qualquer operação
  console.log('🔄 [STEP 4] Forçando refresh do token JWT...');
  const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError || !sessionData.session) {
    console.error('❌ [STEP 4] Falha ao refresh do token:', refreshError);
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  console.log(`🔐 [STEP 4] Token refreshed para: ${sessionData.user?.email}`);
  console.log(`   Token expira em: ${new Date(sessionData.session.expires_at! * 1000).toLocaleString()}`);
  console.log(`   Access token (primeiros 20 chars): ${sessionData.session.access_token.substring(0, 20)}...`);

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

  // FASE 2: Debug do token atual antes do INSERT
  const currentSession = await supabase.auth.getSession();
  console.log('🐛 [STEP 4] Token no momento do INSERT:');
  console.log(`   Session exists: ${!!currentSession.data.session}`);
  console.log(`   User ID: ${currentSession.data.session?.user?.id}`);
  console.log(`   User email: ${currentSession.data.session?.user?.email}`);
  console.log(`   Token type: ${currentSession.data.session?.token_type}`);
  console.log(`   Expires at: ${currentSession.data.session?.expires_at ? new Date(currentSession.data.session.expires_at * 1000).toLocaleString() : 'N/A'}`);

  // FASE 4: Inserir no banco com retry automático
  let insertAttempts = 0;
  let data, error;

  while (insertAttempts < 3) {
    insertAttempts++;
    console.log(`🔄 [STEP 4] Tentativa de INSERT ${insertAttempts}/3...`);

    const insertResult = await supabase
      .from('lessons')
      .insert({
        title: input.title,
        lesson_type: 'guided',
        trail_id: input.trackId,
        order_index: input.orderIndex,
        difficulty_level: 'beginner',
        estimated_time: input.estimatedTimeMinutes,
        is_active: false,
        audio_url: null,
        content,
        word_timestamps: null,
      })
      .select('id')
      .single();

    data = insertResult.data;
    error = insertResult.error;

    if (!error) {
      console.log(`✅ [STEP 4] INSERT bem-sucedido na tentativa ${insertAttempts}`);
      break;
    }

    console.error(`❌ [STEP 4] INSERT falhou na tentativa ${insertAttempts}:`, error);

    if (error.message.includes('row-level security')) {
      console.log(`🔄 [STEP 4] Erro RLS detectado, tentando refresh do token...`);
      const { error: retryRefreshError } = await supabase.auth.refreshSession();
      if (retryRefreshError) {
        console.error('❌ [STEP 4] Falha ao refresh para retry:', retryRefreshError);
        break;
      }
      console.log('✅ [STEP 4] Token refreshed, tentando novamente...');
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      break;
    }
  }

  if (error) {
    console.error('❌ [STEP 4] Erro final ao criar draft após todas as tentativas:', error);
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
