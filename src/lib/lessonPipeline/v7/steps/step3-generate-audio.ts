/**
 * V7 Pipeline - Step 3: Gerar Áudio
 * 
 * Gera áudio via ElevenLabs com word timestamps para sincronização.
 */

import { supabase } from '@/integrations/supabase/client';
import { V7PipelineContext, V7Step2Output, V7Step3Output, V7WordTimestamp } from '../types';

interface Step3Context extends V7PipelineContext {
  narration: V7Step2Output;
}

const AUDIO_TIMEOUT_MS = 600000; // 10 minutos
const MAX_RETRIES = 2;

export async function v7Step3GenerateAudio(
  context: Step3Context
): Promise<V7Step3Output> {
  const { narration, options, logger } = context;
  const startTime = Date.now();
  
  await logger.info(3, 'Generate Audio', '🎙️ Iniciando geração de áudio...');
  await logger.info(3, 'Generate Audio', `   Voice ID: ${options.voiceId}`);
  await logger.info(3, 'Generate Audio', `   Texto: ${narration.fullNarration.length} caracteres`);

  // Se não precisa gerar áudio (modo teste)
  if (!options.generateAudio) {
    await logger.warn(3, 'Generate Audio', '⚠️ Geração de áudio desabilitada. Usando placeholders.');
    return createPlaceholderAudio(narration);
  }

  // ============================================================
  // 1. CHAMAR EDGE FUNCTION
  // ============================================================
  let audioData: any;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await logger.info(3, 'Generate Audio', `🔄 Tentativa ${attempt + 1}/${MAX_RETRIES}...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    try {
      const result = await Promise.race([
        supabase.functions.invoke('generate-audio-with-timestamps', {
          body: {
            text: narration.fullNarration,
            voice_id: options.voiceId,
            speed: 1.0
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao gerar áudio (10min)')), AUDIO_TIMEOUT_MS)
        )
      ]) as any;

      if (result.error) {
        lastError = new Error(result.error.message || 'Erro desconhecido');
        await logger.warn(3, 'Generate Audio', `⚠️ Erro na tentativa ${attempt + 1}: ${lastError.message}`);
        continue;
      }

      if (!result.data || !result.data.audio_base64) {
        lastError = new Error('Resposta inválida: áudio não retornado');
        continue;
      }

      audioData = result.data;
      break; // Sucesso!

    } catch (error: any) {
      lastError = error;
      await logger.warn(3, 'Generate Audio', `⚠️ Exceção na tentativa ${attempt + 1}: ${error.message}`);
    }
  }

  if (!audioData) {
    if (options.failOnAudioError) {
      throw new Error(`Falha ao gerar áudio após ${MAX_RETRIES} tentativas: ${lastError?.message}`);
    }
    await logger.warn(3, 'Generate Audio', '⚠️ Usando placeholder devido a falha na geração.');
    return createPlaceholderAudio(narration);
  }

  // ============================================================
  // 2. UPLOAD PARA STORAGE
  // ============================================================
  await logger.info(3, 'Generate Audio', '📦 Fazendo upload do áudio...');

  const audioBase64 = audioData.audio_base64;
  const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  
  const fileName = `v7-lesson-${Date.now()}.mp3`;
  const { error: uploadError } = await supabase.storage
    .from('lesson-audios')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Falha no upload do áudio: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('lesson-audios')
    .getPublicUrl(fileName);

  // ============================================================
  // 3. PROCESSAR WORD TIMESTAMPS
  // ============================================================
  const rawTimestamps = audioData.word_timestamps || [];
  const wordTimestamps: V7WordTimestamp[] = rawTimestamps.map((wt: any, idx: number) => ({
    word: wt.word || wt.text || '',
    start_time: wt.start_time ?? wt.start ?? 0,
    end_time: wt.end_time ?? wt.end ?? 0,
    index: idx
  }));

  const totalDuration = wordTimestamps.length > 0 
    ? wordTimestamps[wordTimestamps.length - 1].end_time 
    : 0;

  const elapsedTime = Date.now() - startTime;
  await logger.success(3, 'Generate Audio', `✅ Áudio gerado em ${elapsedTime}ms`, {
    audioUrl: publicUrl,
    wordTimestamps: wordTimestamps.length,
    totalDuration: `${Math.floor(totalDuration / 60)}min ${Math.floor(totalDuration % 60)}s`
  });

  return {
    audioUrl: publicUrl,
    wordTimestamps,
    totalDuration
  };
}

/**
 * Cria áudio placeholder quando geração está desabilitada
 */
function createPlaceholderAudio(narration: V7Step2Output): V7Step3Output {
  // Estimar duração: ~100 palavras = 60 segundos
  const estimatedDuration = (narration.totalWords / 100) * 60;
  
  // Criar word timestamps simulados
  const words = narration.fullNarration.split(/\s+/).filter(w => w.length > 0);
  const avgWordDuration = estimatedDuration / words.length;
  
  const wordTimestamps: V7WordTimestamp[] = words.map((word, idx) => ({
    word,
    start_time: idx * avgWordDuration,
    end_time: (idx + 1) * avgWordDuration,
    index: idx
  }));

  return {
    audioUrl: '',
    wordTimestamps,
    totalDuration: estimatedDuration
  };
}
