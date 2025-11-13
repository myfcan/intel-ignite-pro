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
    const { text, voice_id } = await req.json();
    
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
    const modelId = 'eleven_multilingual_v2';

    console.log('🎙️ Gerando áudio com timestamps...');
    console.log(`   Voice: ${voiceId}`);
    console.log(`   Model: ${modelId}`);
    console.log(`   Text length: ${text.length} chars`);
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 1.0,
            style: 0.0,
            use_speaker_boost: true
          },
          output_format: "mp3_44100_128"
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ ElevenLabs API error:', response.status, error);
      return new Response(
        JSON.stringify({ 
          error: 'Falha ao gerar áudio',
          details: error,
          status: response.status
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await response.json();
    const { alignment, audio_base64 } = result;
    const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
    
    console.log(`✅ Áudio gerado: ${characters.length} caracteres`);
    
    // Converter character timestamps para word timestamps
    const word_timestamps: Array<{ word: string; start_time: number; end_time: number }> = [];
    
    let currentWord = '';
    let wordStartTime = 0;
    
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const isSpace = char === ' ' || char === '\n' || char === '\t';
      
      if (isSpace && currentWord.length > 0) {
        word_timestamps.push({
          word: currentWord,
          start_time: wordStartTime,
          end_time: character_end_times_seconds[i - 1]
        });
        currentWord = '';
      } else if (!isSpace) {
        if (currentWord.length === 0) {
          wordStartTime = character_start_times_seconds[i];
        }
        currentWord += char;
      }
    }
    
    // Adicionar última palavra
    if (currentWord.length > 0) {
      word_timestamps.push({
        word: currentWord,
        start_time: wordStartTime,
        end_time: character_end_times_seconds[character_end_times_seconds.length - 1]
      });
    }
    
    console.log(`📊 ${word_timestamps.length} palavras extraídas`);
    console.log(`⏱️ Duração: ${word_timestamps[word_timestamps.length - 1]?.end_time.toFixed(2)}s`);

    return new Response(
      JSON.stringify({ audio_base64, word_timestamps }),
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
