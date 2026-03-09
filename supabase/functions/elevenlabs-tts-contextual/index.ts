import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * ElevenLabs TTS Contextual - Gera áudio de sussurros/hints para interações V7
 * 
 * Suporta:
 * - Geração de áudio único (text)
 * - Geração em batch (texts array)
 * - Voz sussurrada para hints contextuais
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, texts, voiceId, whisper } = await req.json();
    
    // API Key from secrets (connector provides this as ELEVENLABS_API_KEY_1)
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY_1') || Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('[elevenlabs-tts-contextual] ❌ No API key found');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch mode
    if (texts && Array.isArray(texts)) {
      console.log(`[elevenlabs-tts-contextual] 🎵 Generating ${texts.length} contextual audios`);
      
      const results = await Promise.all(
        texts.map(async (t: string, index: number) => {
          try {
            const audioBase64 = await generateAudio(t, voiceId, whisper, ELEVENLABS_API_KEY);
            return { index, text: t, audioBase64, success: true };
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error(`[elevenlabs-tts-contextual] ❌ Error generating audio ${index}:`, err);
            return { index, text: t, error: errorMessage, success: false };
          }
        })
      );
      
      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Single text mode
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[elevenlabs-tts-contextual] 🎵 Generating audio for: "${text.substring(0, 50)}..."`);
    
    const audioBase64 = await generateAudio(text, voiceId, whisper, ELEVENLABS_API_KEY);
    
    return new Response(
      JSON.stringify({ audioBase64 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[elevenlabs-tts-contextual] ❌ Error:', err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateAudio(
  text: string, 
  voiceId?: string, 
  whisper?: boolean,
  apiKey?: string
): Promise<string> {
  // Taciana (oqUwsXKac3MSo4E51ySV) - voz PT-BR nativa professional
  // Se voiceId for passado, usar ele; senão usar Taciana
  const voice = voiceId || 'oqUwsXKac3MSo4E51ySV'; // Taciana - voz PT-BR nativa (professional)
  
  // Voice settings para efeito de sussurro (mesma voz, configurações diferentes)
  const voiceSettings = whisper 
    ? {
        stability: 0.85,       // Alta estabilidade para sussurro consistente
        similarity_boost: 0.8, // Manter similaridade com a voz original
        style: 0.2,           // Estilo baixo para tom mais intimista
        use_speaker_boost: false, // Sem boost para som mais suave
        speed: 0.9            // Levemente mais lento para sussurro
      }
    : {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      };

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_v3',
        language_code: 'pt',
        output_format: 'mp3_44100_128',
        voice_settings: voiceSettings,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[elevenlabs-tts-contextual] ❌ ElevenLabs API error:', response.status, errorText);
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const audioBase64 = base64Encode(audioBuffer);
  
  console.log(`[elevenlabs-tts-contextual] ✅ Generated ${(audioBuffer.byteLength / 1024).toFixed(1)}KB audio (voice: ${voice})`);
  
  return audioBase64;
}
