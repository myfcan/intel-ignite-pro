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
  } else if (input.model === 'v2' || input.model === 'v4' || input.model === 'v5') {
    // V2, V4 e V5 usam mesma lógica: múltiplos áudios (um por seção)
    // V5 adiciona experienceCards mas a geração de áudio é idêntica
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
  const audioTextLength = input.audioText.length;
  const estimatedMinutes = Math.ceil(audioTextLength / 1000);
  console.log('🎙️ [V1] Gerando áudio único com timestamps...');
  console.log(`📝 [V1] Texto: ${audioTextLength} caracteres (~${estimatedMinutes}min estimados)`);

  // Timeout estendido para textos longos
  const TIMEOUT_MS = 600000; // 10 minutos

  const invokeWithTimeout = async () => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout ao gerar áudio (10min)')), TIMEOUT_MS)
    );

    const invokePromise = supabase.functions.invoke('generate-audio-with-timestamps', {
      body: {
        text: input.audioText,
        voice_id: 'oqUwsXKac3MSo4E51ySV', // Taciana PT-BR
        speed: 1.0 // Velocidade normal
      }
    });

    return Promise.race([invokePromise, timeoutPromise]);
  };

  // Retry logic (2x)
  const MAX_RETRIES = 1;
  let data, error;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`   🔄 Tentativa ${attempt + 1}/${MAX_RETRIES + 1} de gerar áudio...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      const result = await invokeWithTimeout() as any;
      data = result.data;
      error = result.error;

      if (!error) {
        break; // Sucesso!
      }

      // Log detalhado do erro
      console.warn(`   ⚠️ Erro ao gerar áudio (tentativa ${attempt + 1}):`);
      console.warn(`   📝 Mensagem: ${error.message}`);
      console.warn(`   🔍 Detalhes: ${JSON.stringify(error)}`);

    } catch (timeoutError: any) {
      console.error('❌ [V1] Timeout ao gerar áudio:', timeoutError);
      console.error('   🔍 Stack:', timeoutError.stack);
      throw new Error(`Timeout ao gerar áudio (10min). O texto pode ser muito longo (${audioTextLength} caracteres).`);
    }
  }

  if (error) {
    console.error('❌ [V1] Erro ao gerar áudio:', error);
    console.error('   📝 Tipo de erro:', error.name);
    console.error('   🔍 Stack:', error.stack);
    
    // Mensagem de erro mais específica
    const errorMsg = error.message || 'Erro desconhecido';
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch')) {
      throw new Error(`Falha ao conectar com o serviço de geração de áudio. Verifique se a edge function está deployada. Detalhes: ${errorMsg}`);
    }
    throw new Error(`Falha ao gerar áudio: ${errorMsg}`);
  }
  
  if (!data || !data.audio_base64) {
    console.error('❌ [V1] Resposta inválida da edge function');
    throw new Error('Resposta inválida: áudio não retornado pela edge function');
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

  // Timeout estendido para múltiplos áudios (5 seções podem demorar)
  const TIMEOUT_MS = 600000; // 10 minutos
  
  const invokeWithTimeout = async () => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao gerar áudios (10min)')), TIMEOUT_MS)
    );
    
    const invokePromise = supabase.functions.invoke('generate-multiple-audios', {
      body: {
        texts: input.sectionTexts
      }
    });
    
    return Promise.race([invokePromise, timeoutPromise]);
  };

  let data, error;
  try {
    const result = await invokeWithTimeout() as any;
    data = result.data;
    error = result.error;
  } catch (timeoutError: any) {
    console.error('❌ [V2] Timeout ao gerar áudios:', timeoutError);
    throw new Error(`Timeout ao gerar áudios (10min). Reduza o número de seções ou o tamanho dos textos.`);
  }

  if (error) {
    console.error('❌ [V2] Erro ao gerar áudios:', error);
    throw new Error(`Falha ao gerar áudios: ${error.message}`);
  }
  
  if (!data || !data.results || data.results.length === 0) {
    console.error('❌ [V2] Resposta inválida da edge function');
    throw new Error('Resposta inválida: nenhum áudio retornado pela edge function');
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

  // 1. Gerar áudio com timeout estendido (áudios de 18min precisam mais tempo)
  const audioTextLength = input.audioText.length;
  const estimatedMinutes = Math.ceil(audioTextLength / 1000); // ~1min por 1000 chars
  console.log(`   🎙️ Gerando áudio (${audioTextLength} caracteres, ~${estimatedMinutes}min estimados)...`);

  const AUDIO_TIMEOUT_MS = 600000; // 10 minutos (textos longos podem demorar)

  const invokeAudioWithTimeout = async () => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout ao gerar áudio (10min)')), AUDIO_TIMEOUT_MS)
    );

    const invokePromise = supabase.functions.invoke('generate-audio-with-timestamps', {
      body: {
        text: input.audioText,
        voice_id: 'Xb7hH8MSUJpSbSDYk0k2', // Alice (Brasil)
        speed: 1.0 // Velocidade normal
      }
    });

    return Promise.race([invokePromise, timeoutPromise]);
  };

  // Retry logic (2x) para áudio
  const MAX_AUDIO_RETRIES = 1; // 1 retry = 2 tentativas total
  let audioData, audioError;
  let lastAudioError;

  for (let attempt = 0; attempt <= MAX_AUDIO_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`   🔄 Tentativa ${attempt + 1}/${MAX_AUDIO_RETRIES + 1} de gerar áudio...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3s entre tentativas
      }

      const result = await invokeAudioWithTimeout() as any;
      audioData = result.data;
      audioError = result.error;

      if (!audioError) {
        break; // Sucesso!
      }

      lastAudioError = audioError;
      console.warn(`   ⚠️ Erro ao gerar áudio (tentativa ${attempt + 1}): ${audioError.message}`);

    } catch (timeoutError: any) {
      console.error('❌ [V3] Timeout ao gerar áudio:', timeoutError);
      throw new Error(`Timeout ao gerar áudio (10min). O texto pode ser muito longo (${audioTextLength} caracteres).`);
    }
  }

  if (audioError) {
    console.error('❌ [V3] Erro ao gerar áudio:', audioError);
    throw new Error(`Falha ao gerar áudio: ${audioError.message}`);
  }
  
  if (!audioData || !audioData.audio_base64) {
    console.error('❌ [V3] Resposta inválida da edge function (áudio)');
    throw new Error('Resposta inválida: áudio não retornado pela edge function');
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

  // 2. Verificar se os slides já têm imagens (upload manual)
  const slidesWithImages = input.v3Data!.slides.filter(s => s.imageUrl && s.imageUrl.trim() !== '');
  const slidesNeedingImages = input.v3Data!.slides.filter(s => !s.imageUrl || s.imageUrl.trim() === '');
  const totalSlides = input.v3Data!.slides.length;

  // Se TODOS os slides já têm imagens (upload manual), pular geração via API
  if (slidesNeedingImages.length === 0) {
    console.log(`   ✅ Todas as ${totalSlides} imagens já foram enviadas manualmente. Pulando geração via API.`);

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ [V3] Áudio completo em ${elapsedTime}ms (imagens pré-carregadas)`);

    return {
      ...input,
      audioUrl,
      wordTimestamps: audioData.word_timestamps,
      v3Data: input.v3Data
    };
  }

  // Log de estado
  if (slidesWithImages.length > 0) {
    console.log(`   📋 ${slidesWithImages.length}/${totalSlides} slides já têm imagens (upload manual)`);
    console.log(`   🖼️ Gerando ${slidesNeedingImages.length} imagens restantes via Image Lab Bridge...`);
  } else {
    console.log(`   🖼️ Gerando ${totalSlides} imagens via Image Lab Bridge (C12)...`);
  }

  // ============================================================================
  // IMAGE LAB BRIDGE (C12) — substitui generate-slide-images legada
  // ============================================================================
  // A bridge processa todas as cenas de uma vez, com cache idempotente e audit trail.
  // Retorna storage_path (bucket image-lab, privado) — precisamos gerar signed URLs.
  // ============================================================================

  const scenes = slidesNeedingImages.map(slide => ({
    scene_id: slide.id,
    prompt_scene: slide.contentIdea,
    style_hints: slide.imagePrompt || '',
  }));

  const BRIDGE_TIMEOUT_MS = 300000; // 5 minutos (batch pode ter muitas cenas)

  let bridgeResults: Array<{
    scene_id: string;
    asset_id: string | null;
    storage_path: string | null;
    status: string;
    error?: string;
  }> = [];

  try {
    console.log(`   🌉 Chamando image-lab-pipeline-bridge com ${scenes.length} cenas...`);

    const bridgePromise = supabase.functions.invoke('image-lab-pipeline-bridge', {
      body: {
        scenes,
        preset_key: 'cinematic-01',
        size: '1536x1024',
        provider: 'gemini',
      }
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout na Image Lab Bridge (5min)')), BRIDGE_TIMEOUT_MS)
    );

    const { data: bridgeData, error: bridgeError } = await Promise.race([
      bridgePromise,
      timeoutPromise
    ]) as any;

    if (bridgeError) {
      throw new Error(`Bridge error: ${bridgeError.message}`);
    }

    if (!bridgeData || !bridgeData.results) {
      throw new Error('Bridge retornou resposta sem results');
    }

    bridgeResults = bridgeData.results;
    const successCount = bridgeResults.filter(r => r.status !== 'failed').length;
    const failCount = bridgeResults.filter(r => r.status === 'failed').length;

    console.log(`   ✅ Bridge retornou: ${successCount} OK, ${failCount} falhas de ${scenes.length} cenas`);

  } catch (bridgeErr: any) {
    // Fallback não-bloqueante: pipeline continua sem imagens
    console.error(`   ❌ Image Lab Bridge falhou: ${bridgeErr.message}`);
    console.warn(`   ⚠️ Pipeline continuará sem imagens geradas. Admin pode gerar manualmente depois.`);
  }

  // Montar slides finais com signed URLs do bucket image-lab
  let finalSlides = [...input.v3Data!.slides];

  for (const result of bridgeResults) {
    if (result.status === 'failed' || !result.storage_path) {
      console.warn(`   ⚠️ Cena ${result.scene_id}: falhou (${result.error || 'sem storage_path'})`);
      continue;
    }

    // Gerar signed URL (1h de validade) para o asset no bucket privado image-lab
    const { data: signedData, error: signedError } = await supabase.storage
      .from('image-lab')
      .createSignedUrl(result.storage_path, 3600); // 1 hora

    if (signedError || !signedData?.signedUrl) {
      console.warn(`   ⚠️ Cena ${result.scene_id}: signed URL falhou (${signedError?.message})`);
      continue;
    }

    // Encontrar e atualizar o slide correspondente
    const slideIndex = finalSlides.findIndex(s => s.id === result.scene_id);
    if (slideIndex !== -1) {
      finalSlides[slideIndex] = {
        ...finalSlides[slideIndex],
        imageUrl: signedData.signedUrl,
        imagePrompt: finalSlides[slideIndex].contentIdea,
      };
      console.log(`   ✅ Slide ${finalSlides[slideIndex].slideNumber}: imagem vinculada (asset ${result.asset_id})`);
    }
  }

  const successfulImages = finalSlides.filter(s => s.imageUrl && s.imageUrl.trim() !== '').length;
  console.log(`   📊 Total: ${successfulImages}/${totalSlides} slides com imagem`);

  if (successfulImages < totalSlides) {
    console.warn(`   ⚠️ ${totalSlides - successfulImages} slides sem imagem. Usarão placeholder.`);
  }

  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [V3] Áudio + imagens completos em ${elapsedTime}ms`);

  return {
    ...input,
    audioUrl,
    wordTimestamps: audioData.word_timestamps,
    v3Data: {
      ...input.v3Data,
      slides: finalSlides
    }
  };
}
