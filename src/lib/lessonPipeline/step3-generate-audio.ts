import { Step2Output, Step3Output } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * STEP 3: GERAÇÃO DE ÁUDIO
 * - Gera áudio via ElevenLabs
 * - Faz upload para Supabase Storage
 * - Retorna URLs públicas
 * - Suporta V1 (áudio único), V2 (múltiplos áudios), V3 (áudio + imagens)
 */
export async function step3GenerateAudio(input: Step2Output): Promise<Step3Output> {
  const startTime = Date.now();
  console.log('🎙️ [STEP 3] Gerando áudio...');
  console.log(`🐛 [STEP 3] Modelo: ${input.model}`);

  if (input.model === 'v1') {
    return await generateAudioV1(input);
  } else if (input.model === 'v2') {
    return await generateAudioV2(input);
  } else if (input.model === 'v3') {
    return await generateAudioV3(input);
  } else {
    throw new Error(`Modelo desconhecido: ${input.model}`);
  }
}

/**
 * V1: Áudio único com word timestamps
 */
async function generateAudioV1(input: Step2Output): Promise<Step3Output> {
  const startTime = Date.now();
  console.log('🎙️ [V1] Gerando áudio único com timestamps...');
  
  const { data, error } = await supabase.functions.invoke('generate-audio-with-timestamps', {
    body: {
      text: input.audioText,
      voice_id: 'pNInz6obpgDQGcFmaJgB' // Adam
    }
  });

  if (error) {
    console.error('❌ [V1] Erro ao gerar áudio:', error);
    throw new Error(`Falha ao gerar áudio: ${error.message}`);
  }

  console.log('📦 [V1] Áudio recebido, fazendo upload para Storage...');

  // Converter base64 para Uint8Array
  const audioBase64 = data.audio_base64;
  const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

  // Upload para Storage
  const fileName = `lesson-${Date.now()}-v1.mp3`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('lesson-audios')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (uploadError) {
    console.error('❌ [V1] Erro ao fazer upload:', uploadError);
    throw new Error(`Falha no upload: ${uploadError.message}`);
  }

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('lesson-audios')
    .getPublicUrl(fileName);

  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [V1] Áudio gerado e salvo em ${elapsedTime}ms`);
  console.log(`   📍 URL: ${publicUrl}`);
  console.log(`   ⏱️ ${data.word_timestamps.length} timestamps`);

  return {
    ...input,
    audioUrl: publicUrl,
    wordTimestamps: data.word_timestamps
  };
}

/**
 * V2: Múltiplos áudios (um por seção)
 */
async function generateAudioV2(input: Step2Output): Promise<Step3Output> {
  const startTime = Date.now();
  console.log('🎙️ [V2] Gerando múltiplos áudios...');
  console.log(`   ${input.sectionTexts.length} seções`);

  const { data, error } = await supabase.functions.invoke('generate-multiple-audios', {
    body: {
      texts: input.sectionTexts
    }
  });

  if (error) {
    console.error('❌ [V2] Erro ao gerar áudios:', error);
    throw new Error(`Falha ao gerar áudios: ${error.message}`);
  }

  console.log('📦 [V2] Áudios recebidos, fazendo upload para Storage...');

  const audioUrls: string[] = [];
  const durations: number[] = [];

  for (let i = 0; i < data.results.length; i++) {
    const result = data.results[i];
    
    // Converter base64 para Uint8Array
    const audioBase64 = result.audio_base64;
    const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

    // Upload para Storage
    const fileName = `lesson-${Date.now()}-v2-section-${i}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from('lesson-audios')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error(`❌ [V2] Erro ao fazer upload da seção ${i}:`, uploadError);
      throw new Error(`Falha no upload da seção ${i}: ${uploadError.message}`);
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('lesson-audios')
      .getPublicUrl(fileName);

    audioUrls.push(publicUrl);
    durations.push(result.duration);
    
    console.log(`   ✅ Seção ${i + 1}/${data.results.length}: ${result.duration.toFixed(1)}s`);
  }

  const totalDuration = durations.reduce((sum, d) => sum + d, 0);
  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [V2] ${audioUrls.length} áudios gerados em ${elapsedTime}ms (total: ${totalDuration.toFixed(1)}s)`);

  return {
    ...input,
    audioUrls,
    durations
  };
}

/**
 * V3: Áudio único + imagens de slides
 */
async function generateAudioV3(input: Step2Output): Promise<Step3Output> {
  const startTime = Date.now();
  console.log('🎙️ [V3] Gerando áudio + imagens de slides...');

  if (!input.v3Data) {
    throw new Error('v3Data não disponível para modelo V3');
  }

  // 1. Gerar áudio
  console.log('   🎙️ Gerando áudio...');
  const { data: audioData, error: audioError } = await supabase.functions.invoke('generate-audio-with-timestamps', {
    body: {
      text: input.audioText,
      voice_id: 'pNInz6obpgDQGcFmaJgB'
    }
  });

  if (audioError) {
    console.error('❌ [V3] Erro ao gerar áudio:', audioError);
    throw new Error(`Falha ao gerar áudio: ${audioError.message}`);
  }

  // Upload do áudio
  const audioBase64 = audioData.audio_base64;
  const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const audioFileName = `lesson-${Date.now()}-v3.mp3`;
  
  const { error: audioUploadError } = await supabase.storage
    .from('lesson-audios')
    .upload(audioFileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (audioUploadError) {
    throw new Error(`Falha no upload do áudio: ${audioUploadError.message}`);
  }

  const { data: { publicUrl: audioUrl } } = supabase.storage
    .from('lesson-audios')
    .getPublicUrl(audioFileName);

  console.log(`   ✅ Áudio salvo: ${audioUrl}`);

  // 2. Gerar imagens dos slides
  console.log('   🖼️ Gerando imagens dos slides...');
  const { data: imagesData, error: imagesError } = await supabase.functions.invoke('generate-slide-images', {
    body: {
      slides: input.v3Data.slides.map(slide => ({
        id: slide.id,
        slideNumber: slide.slideNumber,
        contentIdea: slide.contentIdea
      }))
    }
  });

  if (imagesError) {
    console.error('❌ [V3] Erro ao gerar imagens:', imagesError);
    throw new Error(`Falha ao gerar imagens: ${imagesError.message}`);
  }

  // Atualizar v3Data com URLs das imagens
  const updatedSlides = input.v3Data.slides.map(slide => {
    const imageData = imagesData.slides.find((s: any) => s.id === slide.id);
    return {
      ...slide,
      imageUrl: imageData?.imageUrl || '',
      imagePrompt: imageData?.imagePrompt || slide.contentIdea
    };
  });

  console.log(`   ✅ ${updatedSlides.length} imagens geradas`);
  
  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [V3] Áudio + imagens completos em ${elapsedTime}ms`);

  return {
    ...input,
    audioUrl,
    wordTimestamps: audioData.word_timestamps,
    v3Data: {
      ...input.v3Data,
      slides: updatedSlides
    }
  };
}
