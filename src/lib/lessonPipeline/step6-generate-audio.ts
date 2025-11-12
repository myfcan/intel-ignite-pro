import { Step4Output, Step6Output } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * STEP 6: GERAÇÃO DE ÁUDIO (MANUAL OU AUTOMÁTICA)
 * 
 * V1: Gera 1 áudio único com audioText completo
 * V2: Gera N áudios separados (1 por seção)
 * 
 * Esta função é chamada manualmente pelo Admin UI
 */
export async function step6GenerateAudio(input: Step4Output): Promise<Step6Output> {
  const startTime = Date.now();
  console.log('🎙️ [STEP 6] Gerando áudio...');
  console.log(`🐛 [STEP 6] Modelo: ${input.model}, lessonId: ${input.lessonId}`);

  if (input.model === 'v1') {
    return generateAudioV1(input);
  } else if (input.model === 'v2') {
    return generateAudioV2(input);
  } else if (input.model === 'v3') {
    return generateAudioV3(input);
  } else {
    throw new Error(`Modelo desconhecido: ${input.model}`);
  }
}

async function generateAudioV1(input: Step4Output): Promise<Step6Output> {
  const startTime = Date.now();
  console.log('   📻 Gerando áudio único (Modelo V1)...');
  console.log(`   🐛 audioText: ${input.audioText.length} caracteres`);

  try {
    // Chamar edge function para gerar áudio com timestamps
    console.log('   🔵 Invocando edge function generate-audio-with-timestamps...');
    const { data, error } = await supabase.functions.invoke('generate-audio-with-timestamps', {
      body: {
        text: input.audioText,
        lessonId: input.lessonId,
      },
    });

    if (error) {
      throw new Error(`Erro na edge function: ${error.message}`);
    }

    if (!data || !data.audioUrl) {
      console.error('   ❌ Edge function não retornou audioUrl válida');
      throw new Error('Edge function não retornou audioUrl');
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`   ✅ Áudio gerado com sucesso em ${elapsedTime}ms`);
    console.log(`   📊 audioUrl: ${data.audioUrl}`);
    console.log(`   📊 ${data.wordTimestamps?.length || 0} word timestamps recebidos`);
    console.log(`   🐛 Duração estimada: ${data.wordTimestamps?.[data.wordTimestamps.length - 1]?.end || 0}s`);

    return {
      ...input,
      audioUrl: data.audioUrl,
      wordTimestamps: data.wordTimestamps || [],
    };

  } catch (error: any) {
    console.error('❌ [STEP 6] Falha ao gerar áudio V1:', error);
    throw new Error(`Falha ao gerar áudio: ${error.message}`);
  }
}

async function generateAudioV2(input: Step4Output): Promise<Step6Output> {
  const startTime = Date.now();
  console.log(`   📻 Gerando ${input.sectionTexts.length} áudios separados (Modelo V2)...`);

  try {
    // Preparar requests para múltiplos áudios
    console.log('   🔵 Preparando requests para edge function...');
    const audioRequests = input.sectionTexts.map((text, idx) => ({
      text,
      sectionId: input.sections[idx].id,
    }));

    // Chamar edge function para gerar múltiplos áudios
    const { data, error } = await supabase.functions.invoke('generate-multiple-audios', {
      body: {
        requests: audioRequests,
        lessonId: input.lessonId,
      },
    });

    if (error) {
      throw new Error(`Erro na edge function: ${error.message}`);
    }

    if (!data || !data.results || data.results.length !== audioRequests.length) {
      throw new Error('Edge function não retornou todos os áudios');
    }

    const audioUrls = data.results.map((r: any) => r.audioUrl);
    const durations = data.results.map((r: any) => r.duration);

    const elapsedTime = Date.now() - startTime;
    const totalDuration = durations.reduce((acc: number, d: number) => acc + d, 0);
    console.log(`   ✅ ${audioUrls.length} áudios gerados com sucesso em ${elapsedTime}ms`);
    console.log(`   📊 Duração total do áudio: ${totalDuration.toFixed(1)}s`);
    durations.forEach((duration: number, idx: number) => {
      console.log(`      Seção ${idx + 1}: ${duration.toFixed(1)}s - ${audioUrls[idx]}`);
    });

    return {
      ...input,
      audioUrls,
      durations,
    };

  } catch (error: any) {
    console.error('❌ [STEP 6] Falha ao gerar áudios V2:', error);
    throw new Error(`Falha ao gerar áudios: ${error.message}`);
  }
}

async function generateAudioV3(input: Step4Output): Promise<Step6Output> {
  const startTime = Date.now();
  console.log('   📻 Gerando áudio único + imagens dos slides (Modelo V3)...');
  console.log(`   🐛 V3 com ${input.v3Data?.slides.length || 0} slides`);

  try {
    if (!input.v3Data) {
      throw new Error('v3Data não encontrado no input');
    }

    // 1. Gerar áudio único
    console.log('   🎙️ Etapa 1/2: Gerando áudio...');
    console.log(`   🐛 audioText: ${input.v3Data.audioText.length} caracteres`);
    const { data: audioData, error: audioError } = await supabase.functions.invoke('generate-audio-with-timestamps', {
      body: {
        text: input.v3Data.audioText,
        lessonId: input.lessonId,
      },
    });

    if (audioError) {
      throw new Error(`Erro ao gerar áudio: ${audioError.message}`);
    }

    if (!audioData || !audioData.audioUrl) {
      throw new Error('Edge function não retornou audioUrl');
    }

    console.log(`   ✅ Áudio único gerado: ${audioData.audioUrl}`);
    console.log(`   ✅ ${audioData.wordTimestamps?.length || 0} word timestamps recebidos`);

    // 2. Gerar imagens dos slides
    console.log(`   🎨 Etapa 2/2: Gerando ${input.v3Data.slides.length} imagens...`);
    const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-slide-images', {
      body: {
        slides: input.v3Data.slides
      },
    });

    if (imageError) {
      throw new Error(`Erro ao gerar imagens: ${imageError.message}`);
    }

    if (!imageData || !imageData.slides) {
      throw new Error('Edge function não retornou slides com imagens');
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`   ✅ ${imageData.slides.length} imagens geradas com sucesso`);
    console.log(`   📊 V3 completo em ${elapsedTime}ms: 1 áudio + ${imageData.slides.length} imagens`);
    console.log(`   🐛 audioUrl: ${audioData.audioUrl}`);

    return {
      ...input,
      audioUrl: audioData.audioUrl,
      wordTimestamps: audioData.wordTimestamps || [],
      v3Data: {
        ...input.v3Data,
        slides: imageData.slides // Slides agora têm imageUrl
      }
    };

  } catch (error: any) {
    console.error('❌ [STEP 6] Falha ao gerar áudio/imagens V3:', error);
    throw new Error(`Falha no Step 6 V3: ${error.message}`);
  }
}
