import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SectionMarker {
  phrase: string;
  sectionId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice_id, model_id, section_markers } = await req.json();
    
    // Validações
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Texto é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!section_markers || !Array.isArray(section_markers)) {
      return new Response(
        JSON.stringify({ error: 'section_markers é obrigatório e deve ser um array' }),
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
    
    // Voice ID padrão: Sarah (voz feminina profissional em português)
    const voiceId = voice_id || 'EXAVITQu4vr4xnSDxMaL';
    
    // Model ID padrão: eleven_multilingual_v2 (melhor para português)
    const modelId = model_id || 'eleven_multilingual_v2';

    console.log('Gerando áudio com timestamps...');
    console.log('Voice ID:', voiceId);
    console.log('Model ID:', modelId);
    console.log('Text length:', text.length);
    console.log('Section markers:', section_markers);
    
    // Chamar API do ElevenLabs com timestamps
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
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', response.status, error);
      return new Response(
        JSON.stringify({ 
          error: 'Falha ao gerar áudio com timestamps',
          details: error,
          status: response.status
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await response.json();
    
    console.log('Áudio e timestamps gerados com sucesso');
    
    // Processar os timestamps para encontrar as seções
    const { alignment, audio_base64 } = result;
    const { characters, character_start_times_seconds } = alignment;
    
    // Converter arrays em string para busca
    const fullText = characters.join('');
    const textLowerCase = text.toLowerCase();
    
    // Encontrar timestamps de cada seção
    const sectionTimestamps: Record<string, number> = {};
    
    for (const marker of section_markers as SectionMarker[]) {
      const phraseLower = marker.phrase.toLowerCase();
      const phraseIndex = textLowerCase.indexOf(phraseLower);
      
      if (phraseIndex === -1) {
        console.warn(`Frase não encontrada no texto: "${marker.phrase}"`);
        continue;
      }
      
      // Encontrar o índice do caractere no array de caracteres
      let charCount = 0;
      let foundIndex = -1;
      
      for (let i = 0; i < fullText.length; i++) {
        if (charCount === phraseIndex) {
          foundIndex = i;
          break;
        }
        charCount++;
      }
      
      if (foundIndex !== -1 && foundIndex < character_start_times_seconds.length) {
        const timestamp = character_start_times_seconds[foundIndex];
        sectionTimestamps[marker.sectionId] = Math.round(timestamp);
        console.log(`Seção "${marker.sectionId}": ${Math.round(timestamp)}s (frase: "${marker.phrase}")`);
      } else {
        console.warn(`Timestamp não encontrado para: "${marker.phrase}"`);
      }
    }
    
    return new Response(
      JSON.stringify({
        audio_base64,
        section_timestamps: sectionTimestamps,
        alignment_data: {
          total_characters: characters.length,
          total_duration: character_start_times_seconds[character_start_times_seconds.length - 1]
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
    
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
