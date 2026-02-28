import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, voice_id } = await req.json();

    if (!texts || !Array.isArray(texts)) {
      return new Response(
        JSON.stringify({ error: 'texts deve ser um array de strings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY não configurada');
    }

    const voiceId = voice_id || 'Xb7hH8MSUJpSbSDYk0k2';
    console.log(`🎵 Gerando ${texts.length} áudios...`);

    const results = [];

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      console.log(`🎤 [${i + 1}/${texts.length}] Gerando...`);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_v3',
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
        console.error(`❌ Erro: ${response.status}`, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.arrayBuffer();
      const audio_base64 = arrayBufferToBase64(audioBlob);
      const duration = estimateAudioDuration(text);

      console.log(`✅ [${i + 1}/${texts.length}] ~${duration.toFixed(1)}s`);

      results.push({
        sectionId: `section-${i}`,
        audio_base64,
        duration,
      });
    }

    console.log(`🎉 ${results.length} áudios prontos!`);

    return new Response(
      JSON.stringify({ results }),
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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  
  return btoa(binary);
}

function estimateAudioDuration(text: string): number {
  const words = text.split(/\s+/).length;
  const minutes = words / 150; // 150 palavras/min
  return minutes * 60;
}
