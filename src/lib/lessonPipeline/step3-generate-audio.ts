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
  } else if (input.model === 'v2' || input.model === 'v4') {
    // V2 e V4 usam mesma lógica: múltiplos áudios (um por seção)
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
        voice_id: 'Xb7hH8MSUJpSbSDYk0k2', // Alice (Brasil)
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

  // Timeout configurável (5 minutos para múltiplos áudios)
  const TIMEOUT_MS = 300000; // 5 minutos
  
  const invokeWithTimeout = async () => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao gerar áudios (5min)')), TIMEOUT_MS)
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
    throw new Error(`Timeout ao gerar áudios (5min). Reduza o número de seções ou o tamanho dos textos.`);
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

  // 2. Gerar imagens dos slides em BATCHES (evitar timeout) - OpenAI DALL-E 3
  const totalSlides = input.v3Data!.slides.length;
  console.log(`   🖼️ Gerando ${totalSlides} imagens dos slides em batches (OpenAI DALL-E 3)...`);

  const BATCH_SIZE = 3; // 3 imagens por batch (~75-90s, seguro dentro do limite de 150s)
  const BATCH_TIMEOUT_MS = 140000; // 2min20s por batch (margem antes do hard limit de 150s)

  const slidesInput = input.v3Data!.slides.map(slide => ({
    id: slide.id,
    slideNumber: slide.slideNumber,
    contentIdea: slide.contentIdea
  }));

  const totalBatches = Math.ceil(slidesInput.length / BATCH_SIZE);
  console.log(`   📦 Processando ${totalSlides} imagens em ${totalBatches} batches de ${BATCH_SIZE}`);

  let finalSlidesWithImages = [...input.v3Data!.slides]; // Cópia dos slides originais
  let completedCount = 0;

  // Processar cada batch sequencialmente
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchNumber = batchIndex + 1;

    // Delay de 2s entre batches para evitar rate limiting (exceto primeiro batch)
    if (batchIndex > 0) {
      console.log(`   ⏳ Aguardando 2s antes do batch ${batchNumber}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`   🔄 Batch ${batchNumber}/${totalBatches}...`);

    const invokeBatchWithTimeout = async () => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout no batch ${batchIndex + 1}`)), BATCH_TIMEOUT_MS)
      );

      const invokePromise = supabase.functions.invoke('generate-slide-images', {
        body: {
          slides: slidesInput,
          batchSize: BATCH_SIZE,
          batchIndex: batchIndex
        }
      });

      return Promise.race([invokePromise, timeoutPromise]);
    };

    // Retry logic com exponential backoff
    const MAX_RETRIES = 3;
    let batchData, batchError;
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const waitTime = Math.pow(2, attempt - 1) * 2000; // 2s, 4s, 8s
          console.log(`   🔄 Tentativa ${attempt + 1}/${MAX_RETRIES + 1} após ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        const result = await invokeBatchWithTimeout() as any;
        batchData = result.data;
        batchError = result.error;

        // Se deu timeout, não tentar retry
        if (!batchError) {
          break; // Sucesso!
        }

        // Se deu erro mas não é de network, não retry
        if (batchError && !batchError.message?.includes('Failed to send')) {
          break; // Erro diferente, não retry
        }

        lastError = batchError;
        console.warn(`   ⚠️ Erro no batch ${batchIndex + 1} (tentativa ${attempt + 1}): ${batchError.message}`);

        // Se foi última tentativa, vai lançar erro fora do loop
        if (attempt === MAX_RETRIES) {
          break;
        }

      } catch (timeoutError: any) {
        console.error(`❌ [V3] Timeout no batch ${batchIndex + 1}:`, timeoutError);
        
        // Se não é o primeiro batch e já temos imagens, continuar
        if (batchIndex > 0 && completedCount > 0) {
          console.warn(`⚠️ [V3] Batch ${batchIndex + 1} deu timeout, mas ${completedCount} imagens já foram geradas. Continuando...`);
          break; // Sair do loop de batches, continuar com o que temos
        }
        
        throw new Error(`Timeout ao gerar imagens (batch ${batchIndex + 1}/${totalBatches}). A geração está demorando muito - isso pode indicar sobrecarga da API OpenAI. Tente novamente em alguns minutos.`);
      }
    }

    if (batchError) {
      console.error(`❌ [V3] Erro no batch ${batchIndex + 1}:`, batchError);

      // Se for o ÚLTIMO batch e já temos imagens geradas nos anteriores, apenas avisar
      const isLastBatch = batchIndex === totalBatches - 1;
      if (isLastBatch && completedCount > 0) {
        console.warn(`⚠️ [V3] Último batch falhou, mas ${completedCount} imagens já foram geradas. Continuando...`);
        // Não lançar erro, permitir continuar com as imagens que temos
      } else {
        throw new Error(`Falha ao gerar imagens (batch ${batchIndex + 1}): ${batchError.message}`);
      }
    }

    if (!batchData || !batchData.slides) {
      const isLastBatch = batchIndex === totalBatches - 1;
      if (isLastBatch && completedCount > 0) {
        console.warn(`⚠️ [V3] Último batch sem dados válidos, mas ${completedCount} imagens já geradas. Continuando...`);
        continue; // Pular para próxima iteração (não há próxima, vai sair do loop)
      }
      console.error(`❌ [V3] Resposta inválida no batch ${batchIndex + 1}`);
      throw new Error(`Resposta inválida: imagens não retornadas (batch ${batchIndex + 1})`);
    }

    // Atualizar slides com as imagens geradas neste batch
    const startIdx = batchIndex * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, slidesInput.length);

    for (let i = startIdx; i < endIdx; i++) {
      const slideFromBatch = batchData.slides[i];
      if (slideFromBatch && slideFromBatch.imageUrl) {
        finalSlidesWithImages[i] = {
          ...finalSlidesWithImages[i],
          imageUrl: slideFromBatch.imageUrl,
          imagePrompt: slideFromBatch.imagePrompt || slideFromBatch.contentIdea
        };
      }
    }

    // Atualizar contador de progresso
    const batchSuccess = batchData.stats?.success || 0;
    completedCount += batchSuccess;
    const progressPercent = Math.round((completedCount / totalSlides) * 100);

    console.log(`   ✅ Batch ${batchNumber}/${totalBatches}: ${batchSuccess} imagens geradas`);
    console.log(`   📊 Progresso: ${completedCount}/${totalSlides} imagens concluídas (${progressPercent}%)`);
  }

  const successfulImages = finalSlidesWithImages.filter(s => s.imageUrl && s.imageUrl !== '').length;
  console.log(`   ✅ Total: ${successfulImages}/${slidesInput.length} imagens geradas com sucesso`);
  console.log(`   🎉 Concluído: 100% das imagens processadas`);

  // 3. Upload das imagens para Storage (converter data URLs em URLs públicas)
  console.log('   📤 Fazendo upload das imagens para Supabase Storage...');
  const slidesWithStorageUrls = [];

  for (const slide of finalSlidesWithImages) {
    if (!slide.imageUrl || slide.imageUrl === '') {
      // Slide sem imagem (falhou geração)
      slidesWithStorageUrls.push(slide);
      continue;
    }

    // Se já é uma URL pública (não data URL), manter
    if (!slide.imageUrl.startsWith('data:')) {
      slidesWithStorageUrls.push(slide);
      continue;
    }

    try {
      // Converter data URL para buffer
      const base64Data = slide.imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      // Nome único para o arquivo
      const imageFileName = `slide-${slide.id}-${Date.now()}.png`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from('lesson-audios') // Mesmo bucket que áudios
        .upload(imageFileName, imageBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error(`   ❌ Erro ao fazer upload da imagem do slide ${slide.slideNumber}:`, uploadError);
        // Manter data URL se upload falhar (fallback)
        slidesWithStorageUrls.push(slide);
        continue;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-audios')
        .getPublicUrl(imageFileName);

      slidesWithStorageUrls.push({
        ...slide,
        imageUrl: publicUrl // Substituir data URL por URL pública
      });

      console.log(`   ✅ Slide ${slide.slideNumber} salvo: ${publicUrl.substring(0, 80)}...`);

    } catch (uploadError) {
      console.error(`   ❌ Erro ao processar upload do slide ${slide.slideNumber}:`, uploadError);
      // Manter data URL se der erro (fallback)
      slidesWithStorageUrls.push(slide);
    }
  }

  console.log(`   ✅ ${slidesWithStorageUrls.filter(s => s.imageUrl && !s.imageUrl.startsWith('data:')).length}/${successfulImages} imagens salvas no Storage`);

  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [V3] Áudio + imagens completos em ${elapsedTime}ms`);

  return {
    ...input,
    audioUrl,
    wordTimestamps: audioData.word_timestamps,
    v3Data: {
      ...input.v3Data,
      slides: slidesWithStorageUrls
    }
  };
}
