import { supabase } from '@/integrations/supabase/client';
import { fundamentos01, fundamentos01AudioText } from '@/data/lessons/fundamentos-01';
import { fundamentos02, fundamentos02AudioText } from '@/data/lessons/fundamentos-02';
import { fundamentos03, fundamentos03AudioText } from '@/data/lessons/fundamentos-03';
import { autoGenerateAudioWithToast } from './autoGenerateAudio';
import { processLessonData, logValidation } from './lessonDataProcessor';
import { toast } from 'sonner';

/**
 * SINCRONIZAÇÃO COM PROCESSADOR CENTRALIZADO
 * 
 * Agora usa processLessonData() para garantir consistência total
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
      .eq('title', fundamentos01.title)
      .maybeSingle();

    // ✅ USAR PROCESSADOR CENTRALIZADO
    const processed = processLessonData({
      lessonData: fundamentos01,
      audioText: fundamentos01AudioText,
      trailId: trail.id,
      orderIndex: 1,
      title: fundamentos01.title,
      description: 'O que é a IA e por que nós precisamos dela',
      passingScore: 70,
      difficultyLevel: 'beginner'
    });

    // Log de validação
    logValidation(processed, 'Fundamentos 01');

    const lessonData = processed.databaseData;

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
      toast.success('📝 Lição 01 atualizada');
    } else {
      const { data: newLesson, error: insertError } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (insertError) throw insertError;

      lessonId = newLesson.id;
      action = 'created';
      toast.success('✨ Lição 01 criada');
    }

    // Verificar timestamps no NOVO conteúdo que acabamos de salvar
    const newContent = lessonData.content as any;
    const needsTimestamps = !newContent?.sections?.every((s: any) => s.timestamp && s.timestamp > 0);
    const needsAudio = !existingLesson?.audio_url;

    if (needsAudio || needsTimestamps) {
      if (needsAudio) {
        console.log('🎙️ Gerando áudio completo para lição 01...');
        toast.info('🎙️ Gerando áudio com timestamps...');
      } else {
        console.log('⏱️ Regenerando apenas timestamps para lição 01...');
        toast.info('⏱️ Adicionando timestamps ao áudio...');
      }

      const audioSuccess = await autoGenerateAudioWithToast(
        lessonId,
        processed.audioData.cleanAudioText,
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
      toast.info('✅ Lição 01 já tem áudio e timestamps');
      return {
        success: true,
        lessonId,
        audioGenerated: false,
        action
      };
    }

  } catch (error: any) {
    console.error('❌ Erro ao sincronizar lição 01:', error);
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

    // ✅ USAR PROCESSADOR CENTRALIZADO
    const processed = processLessonData({
      lessonData: fundamentos02,
      audioText: fundamentos02AudioText,
      trailId: trail.id,
      orderIndex: 2,
      title: fundamentos02.title,
      description: 'Como a IA aprende e se adapta',
      passingScore: 70,
      difficultyLevel: 'beginner'
    });

    // Log de validação
    logValidation(processed, 'Fundamentos 02');

    const lessonData = processed.databaseData;

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
        processed.audioData.cleanAudioText, // ✅ Usa texto limpo
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
 * Sincroniza fundamentos-03 para o banco
 */
export async function syncFundamentos03(): Promise<SyncResult> {
  try {
    console.log('🔄 Sincronizando Fundamentos 03...');

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
      .eq('title', fundamentos03.title)
      .maybeSingle();

    // ✅ USAR PROCESSADOR CENTRALIZADO
    const processed = processLessonData({
      lessonData: fundamentos03,
      audioText: fundamentos03AudioText,
      trailId: trail.id,
      orderIndex: 3,
      title: fundamentos03.title,
      description: 'Entenda como a IA aprende e melhora com o tempo',
      passingScore: 70,
      difficultyLevel: 'beginner'
    });

    // Log de validação
    logValidation(processed, 'Fundamentos 03');

    const lessonData = processed.databaseData;

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
      toast.success('📝 Lição 03 atualizada');
    } else {
      const { data: newLesson, error: insertError } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (insertError) throw insertError;

      lessonId = newLesson.id;
      action = 'created';
      toast.success('✨ Lição 03 criada');
    }

    // Verificar timestamps no NOVO conteúdo que acabamos de salvar
    const newContent = lessonData.content as any;
    const needsTimestamps = !newContent?.sections?.every((s: any) => s.timestamp && s.timestamp > 0);
    const needsAudio = !existingLesson?.audio_url;

    if (needsAudio || needsTimestamps) {
      if (needsAudio) {
        console.log('🎙️ Gerando áudio completo para lição 03...');
        toast.info('🎙️ Gerando áudio com timestamps...');
      } else {
        console.log('⏱️ Regenerando apenas timestamps para lição 03...');
        toast.info('⏱️ Adicionando timestamps ao áudio...');
      }

      const audioSuccess = await autoGenerateAudioWithToast(
        lessonId,
        processed.audioData.cleanAudioText, // ✅ Usa texto limpo
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
      toast.info('✅ Lição 03 já tem áudio e timestamps');
      return {
        success: true,
        lessonId,
        audioGenerated: false,
        action
      };
    }

  } catch (error: any) {
    console.error('❌ Erro ao sincronizar lição 03:', error);
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
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sincronizar Fundamentos 02
  const result02 = await syncFundamentos02();
  results.push(result02);
  
  // Pequeno delay entre lições
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sincronizar Fundamentos 03
  const result03 = await syncFundamentos03();
  results.push(result03);
  
  const successful = results.filter(r => r.success).length;
  const withAudio = results.filter(r => r.audioGenerated).length;
  
  console.log(`✅ ${successful}/3 lições sincronizadas`);
  console.log(`🎙️ ${withAudio}/3 áudios gerados`);
  
  if (successful === 3) {
    toast.success(`🎉 ${successful} lições sincronizadas com sucesso!`);
  } else {
    toast.warning(`⚠️ ${successful}/3 lições sincronizadas`);
  }
  
  return {
    total: 3,
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
    if (lessonTitle.includes('O que é a IA e por que nós precisamos dela')) {
      audioText = fundamentos01AudioText;
    } else if (lessonTitle.includes('Como a IA Aprende com Você')) {
      audioText = fundamentos02AudioText;
    } else if (lessonTitle.includes('Como a IA Aprende: O Cérebro Digital')) {
      audioText = fundamentos03AudioText;
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
