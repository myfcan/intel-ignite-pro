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

  // VERIFICAÇÃO EXPLÍCITA DE ADMIN ANTES DO INSERT
  console.log('🔐 [STEP 4] Verificando se usuário é admin...');
  
  const { data: isAdmin, error: roleError } = await supabase
    .rpc('has_role', { 
      _user_id: sessionData.user.id, 
      _role: 'admin' 
    });

  if (roleError) {
    console.error('❌ [STEP 4] Erro ao verificar role:', roleError);
    throw new Error(`Erro ao verificar permissões: ${roleError.message}`);
  }

  if (!isAdmin) {
    console.error('❌ [STEP 4] Usuário não é admin:', sessionData.user.email);
    throw new Error('Você precisa ser admin para criar lições. Faça logout e login novamente para atualizar suas permissões.');
  }

  console.log('✅ [STEP 4] Usuário confirmado como admin');

  // Aguardar pequeno delay para garantir propagação do token
  console.log('⏱️ [STEP 4] Aguardando propagação do token...');
  await new Promise(resolve => setTimeout(resolve, 100));

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

  } else if (input.model === 'v2') {
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
  } else if (input.model === 'v3') {
    console.log('   📋 Montando estrutura Modelo V3...');
    
    // V3: Áudio único + ~7 Slides visuais + Playground final
    if (!input.v3Data) {
      throw new Error('v3Data is required for model v3');
    }
    
    content = {
      contentVersion: 4,
      schemaVersion: 3,
      duration: 0,
      audioUrl: '',
      slides: input.v3Data.slides.map((slide) => ({
        id: slide.id,
        slideNumber: slide.slideNumber,
        contentIdea: slide.contentIdea,
        imageUrl: slide.imageUrl || '',
        timestamp: 0,
      })),
      finalPlaygroundConfig: input.v3Data.finalPlaygroundConfig,
      exercisesConfig: input.exercisesConfig || [],
    };
  } else {
    throw new Error(`Modelo desconhecido: ${input.model}`);
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

  // FASE 4: Usar função SECURITY DEFINER para criar draft (bypassa RLS)
  console.log('💾 [STEP 4] Chamando create_lesson_draft() SECURITY DEFINER...');
  
  const { data: lessonId, error } = await supabase
    .rpc('create_lesson_draft', {
      p_title: input.title,
      p_trail_id: input.trackId,
      p_order_index: input.orderIndex,
      p_estimated_time: input.estimatedTimeMinutes,
      p_content: content,
    });

  if (error) {
    console.error('❌ [STEP 4] Erro ao criar draft:', error);
    throw new Error(`Falha ao criar draft no banco: ${error.message}`);
  }
  console.log(`✅ [STEP 4] Draft criado com sucesso: ${lessonId}`);
  console.log(`   Status: draft (aguardando áudio)`);

  return {
    ...input,
    lessonId,
  };
}
