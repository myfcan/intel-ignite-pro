import { supabase } from '@/integrations/supabase/client';
import { fundamentos01 } from '@/data/lessons/fundamentos-01';
import { syncLessonV2Generic } from './syncLessonV2Generic';
import { ALL_LESSONS, LESSON_AUDIO_TEXTS, LESSONS_ARRAY } from '@/data/lessons';
import { toast } from '@/hooks/use-toast';

// Helper: Converter base64 para Blob
function base64ToBlob(base64: string, mimeType = 'audio/mpeg'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Helper: Extrair texto de narração da visualContent
export function extractNarrationText(visualContent: string): string {
  // Remove markdown headers e formatação, mantém apenas o texto narrativo
  return visualContent
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/`/g, '') // Remove code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, mantém texto
    .replace(/^\s*[-•]\s+/gm, '') // Remove bullet points
    .replace(/\n\n+/g, '\n\n') // Normaliza quebras de linha
    .trim();
}

export async function syncFundamentos01(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🚀 [SYNC V2] Iniciando sincronização Fundamentos 01...');
    
    // 1. Buscar trail
    const { data: trails } = await supabase
      .from('trails')
      .select('id')
      .eq('title', 'Fundamentos de IA')
      .single();

    if (!trails) {
      throw new Error('Trail "Fundamentos de IA" não encontrada');
    }

    const trailId = trails.id;
    console.log(`✅ [SYNC V2] Trail encontrada: ${trailId}`);

    // 2. Preparar textos para áudio
    const audioTexts = fundamentos01.sections.map((section, index) => ({
      sectionId: section.id,
      text: extractNarrationText(section.visualContent || ''),
    }));

    console.log(`📝 [SYNC V2] Preparando ${audioTexts.length} áudios...`);

    // 3. Gerar áudios via edge function
    toast({
      title: '🎵 Gerando áudios...',
      description: `Criando ${audioTexts.length} áudios separados (pode levar ~1 minuto)`,
    });

    const { data: audioData, error: audioError } = await supabase.functions.invoke(
      'generate-multiple-audios',
      {
        body: { audios: audioTexts },
      }
    );

    if (audioError) {
      console.error('❌ [SYNC V2] Erro ao gerar áudios:', audioError);
      throw new Error(`Erro ao gerar áudios: ${audioError.message}`);
    }

    if (!audioData?.results || audioData.results.length === 0) {
      throw new Error('Nenhum áudio foi gerado');
    }

    console.log(`✅ [SYNC V2] ${audioData.results.length} áudios gerados com sucesso!`);

    // 4. Upload para Storage e atualizar sections
    toast({
      title: '📤 Fazendo upload...',
      description: 'Salvando áudios no storage',
    });

    const updatedSections = [];
    let cumulativeTime = 0;

    for (let i = 0; i < audioData.results.length; i++) {
      const result = audioData.results[i];
      const section = fundamentos01.sections[i];

      // Converter base64 para Blob
      const audioBlob = base64ToBlob(result.audio_base64);

      // Upload para Storage
      const fileName = `aula-01/sessao-${i + 1}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(fileName, audioBlob, {
          upsert: true,
          contentType: 'audio/mpeg',
        });

      if (uploadError) {
        console.error(`❌ [SYNC V2] Erro ao fazer upload de ${fileName}:`, uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('lesson-audios')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log(`✅ [SYNC V2] Sessão ${i + 1}: ${result.duration.toFixed(2)}s - ${publicUrl}`);

      // Atualizar seção com audio_url e timestamp real
      updatedSections.push({
        ...section,
        audio_url: publicUrl,
        timestamp: cumulativeTime,
      });

      cumulativeTime += result.duration;
    }

    const totalDuration = cumulativeTime;
    console.log(`📊 [SYNC V2] Duração total: ${totalDuration.toFixed(2)}s (~${Math.round(totalDuration / 60)} min)`);

    // 5. Verificar se aula já existe
    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('title', fundamentos01.title)
      .eq('trail_id', trailId)
      .single();

    // 6. Salvar no banco
    toast({
      title: '💾 Salvando no banco...',
      description: 'Atualizando lição com áudios e timestamps',
    });

    const lessonContent = {
      ...fundamentos01,
      duration: totalDuration,
      sections: updatedSections,
    };

    if (existingLesson) {
      // Atualizar
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          content: lessonContent as any,
          lesson_type: 'guided',
        })
        .eq('id', existingLesson.id);

      if (updateError) throw updateError;
      console.log(`✅ [SYNC V2] Aula atualizada: ${existingLesson.id}`);
    } else {
      // Criar nova
      const { error: insertError } = await supabase
        .from('lessons')
        .insert({
          title: fundamentos01.title,
          trail_id: trailId,
          order_index: 1,
          lesson_type: 'guided',
          content: lessonContent as any,
          is_active: true,
        });

      if (insertError) throw insertError;
      console.log('✅ [SYNC V2] Nova aula criada!');
    }

    toast({
      title: '🎉 Sincronização completa!',
      description: `Aula 01 sincronizada com ${updatedSections.length} áudios (${Math.round(totalDuration)}s total)`,
    });

    return {
      success: true,
      message: `Aula 01 sincronizada com sucesso! ${updatedSections.length} sessões, ${Math.round(totalDuration)}s total`,
    };
  } catch (error) {
    console.error('❌ [SYNC V2] Erro na sincronização:', error);
    toast({
      title: '❌ Erro na sincronização',
      description: (error as Error).message,
      variant: 'destructive',
    });
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}
export async function syncAllLessonsV2(): Promise<{ 
  success: boolean; 
  total: number; 
  successful: number; 
  failed: number; 
}> {
  // 1. Auto-descobrir todas as aulas disponíveis
  const lessonsToSync = LESSONS_ARRAY;
  
  const results = {
    total: lessonsToSync.length,
    successful: 0,
    failed: 0
  };

  toast({
    title: '🚀 Sincronização em lote',
    description: `Sincronizando ${results.total} lições...`,
  });

  console.log(`🔄 Iniciando sincronização de ${results.total} lições...`);

  // 2. Iterar dinamicamente sobre TODAS as aulas
  for (const lessonMeta of lessonsToSync) {
    const { key, orderIndex, trackName } = lessonMeta;
    
    let result;

    console.log(`📝 Sincronizando ${key} (ordem ${orderIndex})...`);

    // 3. Tratar caso especial: fundamentos-01 (sistema antigo)
    if (key === 'fundamentos-01') {
      result = await syncFundamentos01();
    } 
    // 4. Todas as outras aulas: sistema genérico V2
    else {
      const folderName = `aula-${orderIndex.toString().padStart(2, '0')}`;
      
      result = await syncLessonV2Generic(
        ALL_LESSONS[key],
        LESSON_AUDIO_TEXTS[key],
        trackName,
        folderName,
        orderIndex
      );
    }

    // Contabilizar resultado
    if (result.success) {
      results.successful++;
      console.log(`✅ ${key} sincronizada com sucesso`);
    } else {
      results.failed++;
      console.log(`❌ Falha ao sincronizar ${key}`);
    }

    // Delay entre sincronizações
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Toast final
  if (results.successful === results.total) {
    toast({
      title: '🎉 Todas as lições sincronizadas!',
      description: `${results.total} lições sincronizadas com sucesso`,
    });
    console.log('✅ Sincronização concluída com sucesso!');
  } else {
    toast({
      title: '⚠️ Sincronização parcial',
      description: `${results.successful}/${results.total} lições sincronizadas`,
      variant: 'destructive',
    });
    console.log(`⚠️ Sincronização parcial: ${results.successful}/${results.total}`);
  }

  return {
    success: results.successful === results.total,
    ...results
  };
}
