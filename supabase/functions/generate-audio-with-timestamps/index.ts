import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * ElevenLabs Audio Bridge — V7 Pipeline
 *
 * Suporta dois modos de modelo:
 *  - eleven_multilingual_v2  → padrão, sem audio tags, usa SSML <break/>
 *  - eleven_v3 (alpha)       → suporta [excited], [calm], [whispers], [pause], etc.
 *
 * IMPORTANTE: audio tags ([excited], etc.) só funcionam com eleven_v3.
 * eleven_v3 não processa SSML <break/>; pausas devem ser feitas com [pause].
 */

const SUPPORTED_AUDIO_TAGS = [
  // Emoções
  'excited', 'calm', 'nervous', 'frustrated', 'serious', 'cheerful',
  'empathetic', 'assertive', 'dramatic tone', 'reflective', 'hopeful',
  // Sons físicos
  'sigh', 'laughs', 'whispers', 'gasps', 'clears throat',
  // Pacing
  'pause', 'rushed', 'slows down', 'hesitates', 'long pause',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice_id, speed, model_id, use_emotion_tags } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Texto é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API Key do ElevenLabs não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const voiceId = voice_id || 'Xb7hH8MSUJpSbSDYk0k2'; // Alice

    // ============================================================
    // SELEÇÃO DE MODELO
    // eleven_multilingual_v2 → suporta request stitching, SSML, estável para long-form
    // eleven_v3 → suporta audio tags, mas sem stitching (causa accent drift)
    // ============================================================
    const useV3 = false;
    const selectedModel = 'eleven_multilingual_v2';

    // Preparar o texto:
    // - Se v3: manter audio tags como estão, remover SSML
    // - Se v2: remover audio tags, manter SSML
    const processedText = useV3
      ? sanitizeForV3(text)
      : sanitizeForV2(text);

    const audioSpeed = speed || 1.0;

    console.log('🎙️ Gerando áudio com timestamps...');
    console.log(`   Voice: ${voiceId}`);
    console.log(`   Model: ${selectedModel}${useV3 ? ' (eleven_v3 — audio tags ativas)' : ''}`);
    console.log(`   Speed: ${audioSpeed}x`);
    console.log(`   Text length: ${processedText.length} chars`);
    if (useV3) {
      const tags = extractAudioTags(processedText);
      if (tags.length > 0) {
        console.log(`   🎭 Audio tags detectadas: ${tags.join(', ')}`);
      }
    }

    // ============================================================
    // CHAMAR ELEVENLABS API
    // ============================================================
  const requestBody: Record<string, unknown> = {
      text: processedText,
      model_id: selectedModel,
      language_code: 'pt',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    };

    // eleven_v3 suporta output_format
    if (!useV3) {
      requestBody.output_format = 'mp3_44100_128';
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ ElevenLabs API error:', response.status, error);

      let errorMessage = 'Falha ao gerar áudio';
      if (response.status === 401) {
        errorMessage = 'API Key do ElevenLabs inválida.';
      } else if (response.status === 402) {
        errorMessage = 'Saldo/créditos do ElevenLabs esgotados.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit do ElevenLabs atingido. Aguarde e tente novamente.';
      } else if (response.status === 422) {
        errorMessage = `Texto inválido para o modelo ${selectedModel}. Verifique as audio tags.`;
      } else if (response.status === 400 && useV3) {
        errorMessage = 'Erro no eleven_v3: verifique se as audio tags estão no formato correto [tag].';
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: error,
          status: response.status,
          model_used: selectedModel,
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const { alignment, audio_base64 } = result;
    const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;

    console.log(`✅ Áudio gerado: ${characters.length} caracteres`);

    // ============================================================
    // CONVERTER CHARACTER → WORD TIMESTAMPS
    // (ignora os colchetes das audio tags no mapeamento de palavras)
    // ============================================================
    const word_timestamps: Array<{ word: string; start_time: number; end_time: number }> = [];
    let currentWord = '';
    let wordStartTime = 0;
    let insideTag = false;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];

      // Pular audio tags [tag] nos word timestamps
      if (char === '[') { insideTag = true; continue; }
      if (char === ']') { insideTag = false; continue; }
      if (insideTag) continue;

      const isSpace = char === ' ' || char === '\n' || char === '\t';

      if (isSpace && currentWord.length > 0) {
        word_timestamps.push({
          word: currentWord,
          start_time: wordStartTime,
          end_time: character_end_times_seconds[i - 1],
        });
        currentWord = '';
      } else if (!isSpace) {
        if (currentWord.length === 0) {
          wordStartTime = character_start_times_seconds[i];
        }
        currentWord += char;
      }
    }

    // Última palavra
    if (currentWord.length > 0) {
      word_timestamps.push({
        word: currentWord,
        start_time: wordStartTime,
        end_time: character_end_times_seconds[character_end_times_seconds.length - 1],
      });
    }

    const totalDuration = word_timestamps[word_timestamps.length - 1]?.end_time ?? 0;

    console.log(`📊 ${word_timestamps.length} palavras extraídas`);
    console.log(`⏱️ Duração: ${totalDuration.toFixed(2)}s`);

    return new Response(
      JSON.stringify({
        audio_base64,
        word_timestamps,
        model_used: selectedModel,
        audio_tags_active: useV3,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================
// HELPERS DE SANITIZAÇÃO
// ============================================================

/**
 * Para eleven_v3: remove SSML, mantém audio tags [tag]
 */
function sanitizeForV3(text: string): string {
  // Remover tags SSML (break, prosody, etc.)
  let cleaned = text.replace(/<[^>]+>/g, '');
  // Normalizar espaços extras gerados pela remoção
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned;
}

/**
 * Para eleven_multilingual_v2: remove audio tags [tag], mantém SSML
 */
function sanitizeForV2(text: string): string {
  // Remover audio tags do tipo [tag] ou [two words]
  let cleaned = text.replace(/\[[^\]]{1,30}\]/g, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned;
}

/**
 * Extrai lista de audio tags encontradas no texto
 */
function extractAudioTags(text: string): string[] {
  const matches = text.match(/\[([^\]]{1,30})\]/g) || [];
  return matches.map(m => m.slice(1, -1));
}
