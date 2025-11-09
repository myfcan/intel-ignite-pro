import { supabase } from '@/integrations/supabase/client';
import { fundamentos01, fundamentos01AudioText } from '@/data/lessons/fundamentos-01';
import { fundamentos02, fundamentos02AudioText } from '@/data/lessons/fundamentos-02';
import { autoGenerateAudioWithToast } from './autoGenerateAudio';
import { toast } from 'sonner';

/**
 * Sincroniza lições do código TypeScript para o banco de dados
 * com geração automática de áudio
 */

interface SyncResult {
  success: boolean;
  lessonId?: string;
  audioGenerated?: boolean;
  timestampsGenerated?: boolean;
  error?: string;
  action?: 'created' | 'updated' | 'skipped';
}

/**
 * Sincroniza fundamentos-01 para o banco
 */
export async function syncFundamentos01(): Promise<SyncResult> {
  try {
    console.log('🔄 Sincronizando Fundamentos 01...');

    // Buscar trilha "Fundamentos de IA"
    const { data: trail, error: trailError } = await supabase
      .from('trails')
      .select('id')
      .eq('title', 'Fundamentos de IA')
      .maybeSingle();

    if (trailError) {
      throw new Error(`Erro ao buscar trilha: ${trailError.message}`);
    }

    if (!trail) {
      throw new Error('Trilha "Fundamentos de IA" não encontrada');
    }

    // Verificar se a lição já existe
    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('id, audio_url, content')
      .eq('title', fundamentos01.title)
      .maybeSingle();

    const lessonData = {
      title: fundamentos01.title,
      description: 'Introdução aos conceitos fundamentais de IA',
      trail_id: trail.id,
      order_index: 1,
      lesson_type: 'guided' as const,
      passing_score: 70,
      estimated_time: fundamentos01.duration,
      difficulty_level: 'beginner' as const,
      content: {
        contentVersion: fundamentos01.contentVersion,
        audioText: fundamentos01AudioText,
        sections: fundamentos01.sections,
        exercisesConfig: fundamentos01.exercisesConfig
      } as any
    };

    let lessonId: string;
    let action: 'created' | 'updated';

    if (existingLesson) {
      // Atualizar lição existente
      console.log('📝 Lição já existe, atualizando...');
      
      const { error: updateError } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', existingLesson.id);

      if (updateError) {
        throw updateError;
      }

      lessonId = existingLesson.id;
      action = 'updated';
      toast.success('📝 Lição atualizada no banco');
    } else {
      // Criar nova lição
      console.log('✨ Criando nova lição...');
      
      const { data: newLesson, error: insertError } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      lessonId = newLesson.id;
      action = 'created';
      toast.success('✨ Lição criada no banco');
    }

    // Verificar se precisa gerar áudio OU timestamps
    // Verificar timestamps no NOVO conteúdo que acabamos de salvar
    const newContent = lessonData.content as any;
    // Verificar se TODAS as seções têm timestamps válidos (não apenas a primeira!)
    const needsTimestamps = !newContent?.sections?.every((s: any) => s.timestamp && s.timestamp > 0);
    const needsAudio = !existingLesson?.audio_url;

    if (needsAudio || needsTimestamps) {
      if (needsAudio) {
        console.log('🎙️ Gerando áudio completo...');
        toast.info('🎙️ Gerando áudio com timestamps...');
      } else {
        console.log('⏱️ Regenerando apenas timestamps...');
        toast.info('⏱️ Adicionando timestamps ao áudio...');
      }
      
      const audioSuccess = await autoGenerateAudioWithToast(
        lessonId,
        fundamentos01AudioText,
        lessonData.content
      );

      return {
        success: true,
        lessonId,
        audioGenerated: audioSuccess,
        action,
        timestampsGenerated: needsTimestamps
      };
    } else {
      console.log('✅ Áudio e timestamps já existem');
      toast.info('✅ Lição já tem áudio e timestamps');
      
      return {
        success: true,
        lessonId,
        audioGenerated: false,
        action
      };
    }

  } catch (error: any) {
    console.error('❌ Erro ao sincronizar:', error);
    toast.error(`❌ Erro: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sincroniza fundamentos-02 para o banco
 */
export async function syncFundamentos02(): Promise<SyncResult> {
  try {
    console.log('🔄 Sincronizando Fundamentos 02...');

    const { data: trail, error: trailError } = await supabase
      .from('trails')
      .select('id')
      .eq('title', 'Fundamentos de IA')
      .maybeSingle();

    if (trailError) {
      throw new Error(`Erro ao buscar trilha: ${trailError.message}`);
    }

    if (!trail) {
      throw new Error('Trilha "Fundamentos de IA" não encontrada');
    }

    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('id, audio_url, content')
      .eq('title', fundamentos02.title)
      .maybeSingle();

    const lessonData = {
      title: fundamentos02.title,
      description: 'Como a IA aprende e se adapta',
      trail_id: trail.id,
      order_index: 2,
      lesson_type: 'guided' as const,
      passing_score: 70,
      estimated_time: fundamentos02.duration,
      difficulty_level: 'beginner' as const,
      content: {
        contentVersion: fundamentos02.contentVersion,
        audioText: fundamentos02AudioText,
        sections: fundamentos02.sections,
        exercisesConfig: fundamentos02.exercisesConfig
      } as any
    };

    let lessonId: string;
    let action: 'created' | 'updated';

    if (existingLesson) {
      const { error: updateError } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', existingLesson.id);

      if (updateError) throw updateError;

      lessonId = existingLesson.id;
      action = 'updated';
      toast.success('📝 Lição 02 atualizada');
    } else {
      const { data: newLesson, error: insertError } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (insertError) throw insertError;

      lessonId = newLesson.id;
      action = 'created';
      toast.success('✨ Lição 02 criada');
    }

    // Verificar timestamps no NOVO conteúdo que acabamos de salvar
    const newContent = lessonData.content as any;
    // Verificar se TODAS as seções têm timestamps válidos (não apenas a primeira!)
    const needsTimestamps = !newContent?.sections?.every((s: any) => s.timestamp && s.timestamp > 0);
    const needsAudio = !existingLesson?.audio_url;

    if (needsAudio || needsTimestamps) {
      if (needsAudio) {
        console.log('🎙️ Gerando áudio completo para lição 02...');
        toast.info('🎙️ Gerando áudio com timestamps...');
      } else {
        console.log('⏱️ Regenerando apenas timestamps para lição 02...');
        toast.info('⏱️ Adicionando timestamps ao áudio...');
      }

      const audioSuccess = await autoGenerateAudioWithToast(
        lessonId,
        fundamentos02AudioText,
        lessonData.content
      );

      return {
        success: true,
        lessonId,
        audioGenerated: audioSuccess,
        action,
        timestampsGenerated: needsTimestamps
      };
    } else {
      toast.info('✅ Lição 02 já tem áudio e timestamps');
      return {
        success: true,
        lessonId,
        audioGenerated: false,
        action
      };
    }

  } catch (error: any) {
    console.error('❌ Erro ao sincronizar lição 02:', error);
    toast.error(`❌ Erro: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sincroniza todas as lições
 */
export async function syncAllLessons(): Promise<{
  total: number;
  successful: number;
  withAudio: number;
  results: SyncResult[];
}> {
  console.log('🚀 Sincronizando todas as lições...');
  
  const results: SyncResult[] = [];
  
  // Sincronizar Fundamentos 01
  const result01 = await syncFundamentos01();
  results.push(result01);
  
  // Pequeno delay entre lições
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Sincronizar Fundamentos 02
  const result02 = await syncFundamentos02();
  results.push(result02);
  
  const successful = results.filter(r => r.success).length;
  const withAudio = results.filter(r => r.audioGenerated).length;
  
  console.log(`✅ ${successful}/2 lições sincronizadas`);
  console.log(`🎙️ ${withAudio}/2 áudios gerados`);
  
  if (successful === 2) {
    toast.success(`🎉 ${successful} lições sincronizadas com sucesso!`);
  } else {
    toast.warning(`⚠️ ${successful}/2 lições sincronizadas`);
  }
  
  return {
    total: 2,
    successful,
    withAudio,
    results
  };
}

/**
 * Forçar regeneração de áudio para uma lição específica
 */
export async function regenerateAudio(lessonTitle: string): Promise<boolean> {
  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id, content')
      .eq('title', lessonTitle)
      .single();

    if (!lesson) {
      toast.error('Lição não encontrada');
      return false;
    }

    // Determinar qual audioText usar
    let audioText = '';
    if (lessonTitle.includes('O que é a IA')) {
      audioText = fundamentos01AudioText;
    } else if (lessonTitle.includes('Como a IA Aprende')) {
      audioText = fundamentos02AudioText;
    }

    if (!audioText) {
      toast.error('audioText não encontrado para esta lição');
      return false;
    }

    return await autoGenerateAudioWithToast(lesson.id, audioText, lesson.content as any);

  } catch (error: any) {
    toast.error(`Erro: ${error.message}`);
    return false;
  }
}
