import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SectionMarker {
  phrase: string;
  sectionId: string;
}

interface LessonContent {
  sections?: Array<{
    id: string;
    speechBubbleText?: string;
    visualContent?: string;
  }>;
  audioText?: string;
}

/**
 * Gera e salva automaticamente o áudio para uma lição
 * @param lessonId - ID da lição no banco de dados
 * @param audioText - Texto completo para narração (opcional, busca do banco se não fornecido)
 * @param content - Conteúdo da lição (opcional, busca do banco se não fornecido)
 * @returns Promise com resultado da geração
 */
export async function autoGenerateAudio(
  lessonId: string,
  audioText?: string,
  content?: LessonContent
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  try {
    console.log(`🎙️ Auto-gerando áudio para lição: ${lessonId}`);
    
    // Se não forneceu audioText ou content, buscar do banco
    if (!audioText || !content) {
      const { data: lesson, error: fetchError } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', lessonId)
        .single();

      if (fetchError || !lesson) {
        throw new Error('Lição não encontrada no banco de dados');
      }

      content = lesson.content as LessonContent;
      
      // Tentar extrair audioText do content
      if (!audioText && content.audioText) {
        audioText = content.audioText;
      }
    }

    // Validar que temos o texto necessário
    if (!audioText || !audioText.trim()) {
      console.warn('⚠️ Nenhum audioText disponível para esta lição');
      return {
        success: false,
        error: 'Lição não possui audioText definido'
      };
    }

    // Gerar section markers do content
    const sectionMarkers: SectionMarker[] = [];
    if (content?.sections && Array.isArray(content.sections)) {
      content.sections.forEach((section, index) => {
        // Concatenar speechBubbleText + visualContent (matching audio generation)
        const fullText = `${section.speechBubbleText || ''} ${section.visualContent || ''}`.trim();
        
        if (fullText) {
          sectionMarkers.push({
            phrase: fullText.substring(0, 50), // Primeiros 50 caracteres como identificador
            sectionId: section.id || `section_${index}`
          });
        }
      });
    }

    // Validar markers
    if (sectionMarkers.length === 0) {
      console.warn('⚠️ Nenhum marcador de seção encontrado');
      return {
        success: false,
        error: 'Lição não possui seções válidas para gerar marcadores'
      };
    }

    console.log(`📝 Texto: ${audioText.length} caracteres`);
    console.log(`📌 Marcadores: ${sectionMarkers.length} seções`);

    // Chamar edge function para gerar áudio com timestamps
    const { data: audioData, error: audioError } = await supabase.functions.invoke(
      'generate-audio-with-timestamps',
      {
        body: {
          text: audioText,
          voice_id: 'Xb7hH8MSUJpSbSDYk0k2', // Alice voice
          model_id: 'eleven_multilingual_v2',
          section_markers: sectionMarkers
        }
      }
    );

    if (audioError) {
      console.error('❌ Erro ao gerar áudio:', audioError);
      throw audioError;
    }

    console.log('✅ Áudio gerado com sucesso');

    // Mapear timestamps para as seções do content
    const updatedSections = content.sections?.map((section) => {
      const sectionId = section.id;
      const timestamp = audioData.section_timestamps?.[sectionId] || 0;
      
      console.log(`📍 Seção ${sectionId}: ${timestamp}s`);
      
      return {
        ...section,
        timestamp: timestamp
      };
    });

    // Criar content atualizado com timestamps e duração
    const updatedContent = {
      ...content,
      sections: updatedSections,
      duration: audioData.alignment_data?.total_duration || 0
    };

    console.log(`⏱️ Duração total: ${updatedContent.duration}s`);
    console.log(`📌 Seções atualizadas: ${updatedSections?.length}`);

    // Converter base64 para Blob
    const audioBase64 = audioData.audio_base64;
    const byteCharacters = atob(audioBase64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const audioBlob = new Blob(byteArrays, { type: 'audio/mpeg' });

    console.log(`📦 Blob criado: ${audioBlob.size} bytes`);

    // Deletar áudio anterior se existir
    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('audio_url')
      .eq('id', lessonId)
      .single();

    if (existingLesson?.audio_url) {
      const oldAudioPath = existingLesson.audio_url.split('/lesson-audios/')[1];
      if (oldAudioPath) {
        await supabase.storage
          .from('lesson-audios')
          .remove([oldAudioPath]);
        console.log('🗑️ Áudio anterior deletado');
      }
    }

    // Upload do novo áudio
    const audioFileName = `lesson-${lessonId}-${Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from('lesson-audios')
      .upload(audioFileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      throw uploadError;
    }

    console.log('📤 Upload concluído:', audioFileName);

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('lesson-audios')
      .getPublicUrl(audioFileName);

    console.log('🔗 URL pública:', publicUrl);

    // Atualizar registro da lição com timestamps das seções
    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        audio_url: publicUrl,
        word_timestamps: audioData.word_timestamps,
        content: updatedContent
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('❌ Erro ao atualizar lição:', updateError);
      throw updateError;
    }

    console.log('✅ Lição atualizada no banco de dados');

    return {
      success: true,
      audioUrl: publicUrl
    };

  } catch (error: any) {
    console.error('❌ Erro ao auto-gerar áudio:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido'
    };
  }
}

/**
 * Wrapper com toast notifications para uso em UI
 */
export async function autoGenerateAudioWithToast(
  lessonId: string,
  audioText?: string,
  content?: LessonContent
): Promise<boolean> {
  const toastId = toast.loading('🎙️ Gerando áudio automaticamente...');
  
  const result = await autoGenerateAudio(lessonId, audioText, content);
  
  if (result.success) {
    toast.success('✅ Áudio gerado e salvo automaticamente!', { id: toastId });
    return true;
  } else {
    toast.error(`❌ Erro: ${result.error}`, { id: toastId });
    return false;
  }
}
