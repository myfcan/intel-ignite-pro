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
  console.log('🎙️ [STEP 6] Gerando áudio...');

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
  console.log('   📻 Gerando áudio único (Modelo V1)...');

  try {
    // Chamar edge function para gerar áudio com timestamps
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
      throw new Error('Edge function não retornou audioUrl');
    }

    console.log(`   ✅ Áudio gerado: ${data.audioUrl}`);
    console.log(`   ✅ ${data.wordTimestamps?.length || 0} word timestamps recebidos`);

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
  console.log(`   📻 Gerando ${input.sectionTexts.length} áudios separados (Modelo V2)...`);

  try {
    // Preparar requests para múltiplos áudios
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

    console.log(`   ✅ ${audioUrls.length} áudios gerados`);
    durations.forEach((duration: number, idx: number) => {
      console.log(`      Seção ${idx + 1}: ${duration.toFixed(1)}s`);
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
  console.log('   📻 Gerando áudio único (Modelo V3)...');

  try {
    // V3 usa o mesmo sistema de V1: 1 áudio único com timestamps
    // Mas o conteúdo é tratado como slides visuais
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
      throw new Error('Edge function não retornou audioUrl');
    }

    console.log(`   ✅ Áudio único gerado: ${data.audioUrl}`);
    console.log(`   ✅ ${data.wordTimestamps?.length || 0} word timestamps recebidos`);
    console.log(`   📊 V3: Áudio único para ${input.sections.length} slides`);

    return {
      ...input,
      audioUrl: data.audioUrl,
      wordTimestamps: data.wordTimestamps || [],
    };

  } catch (error: any) {
    console.error('❌ [STEP 6] Falha ao gerar áudio V3:', error);
    throw new Error(`Falha ao gerar áudio V3: ${error.message}`);
  }
}
