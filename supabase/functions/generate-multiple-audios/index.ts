import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AudioRequest {
  sectionId: string;
  text: string;
}

interface AudioResult {
  sectionId: string;
  audio_base64: string;
  duration: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audios, voiceId = '9BWtsMINqrJLrRacOk9x' } = await req.json() as {
      audios: AudioRequest[];
      voiceId?: string;
    };

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY não configurada');
    }

    console.log(`🎵 [GENERATE-MULTIPLE] Gerando ${audios.length} áudios...`);

    const results: AudioResult[] = [];

    for (let i = 0; i < audios.length; i++) {
      const audioReq = audios[i];
      console.log(`🎤 [AUDIO ${i + 1}/${audios.length}] Gerando ${audioReq.sectionId}...`);

      // Gerar áudio via ElevenLabs
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: audioReq.text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 1.0,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [ELEVENLABS] Erro na API: ${response.status}`, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.arrayBuffer();
      const audio_base64 = arrayBufferToBase64(audioBlob);

      // Calcular duração do áudio
      const duration = await getAudioDuration(audioBlob);

      console.log(`✅ [AUDIO ${i + 1}/${audios.length}] ${audioReq.sectionId} - ${duration.toFixed(2)}s`);

      results.push({
        sectionId: audioReq.sectionId,
        audio_base64,
        duration,
      });
    }

    console.log(`🎉 [GENERATE-MULTIPLE] Todos os ${results.length} áudios gerados com sucesso!`);

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ [GENERATE-MULTIPLE] Erro:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper: Converter ArrayBuffer para Base64 sem estouro de pilha
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  
  return btoa(binary);
}

// Helper: Calcular duração do áudio usando Web Audio API
async function getAudioDuration(audioBuffer: ArrayBuffer): Promise<number> {
  try {
    // Criar um contexto de áudio offline para decodificar
    const AudioContext = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
    
    if (!AudioContext) {
      // Fallback: estimar baseado no tamanho (aproximado)
      // MP3: ~128kbps = 16KB/s
      const estimatedDuration = audioBuffer.byteLength / (16 * 1024);
      console.warn(`⚠️ [DURATION] AudioContext não disponível, estimando: ${estimatedDuration.toFixed(2)}s`);
      return estimatedDuration;
    }

    const audioContext = new AudioContext();
    const audioBufferDecoded = await audioContext.decodeAudioData(audioBuffer.slice(0));
    const duration = audioBufferDecoded.duration;
    
    await audioContext.close();
    
    return duration;
  } catch (error) {
    console.error('❌ [DURATION] Erro ao calcular duração:', error);
    // Fallback: estimar baseado no tamanho
    const estimatedDuration = audioBuffer.byteLength / (16 * 1024);
    console.warn(`⚠️ [DURATION] Usando estimativa: ${estimatedDuration.toFixed(2)}s`);
    return estimatedDuration;
  }
}
