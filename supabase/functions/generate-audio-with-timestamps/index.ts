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
    
    // Voice ID padrão: Alice (Xb7hH8MSUJpSbSDYk0k2)
    const voiceId = voice_id || 'Xb7hH8MSUJpSbSDYk0k2';
    
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
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
            volume: 1.0
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
    
    // Normalizar texto para busca (remover espaços extras, quebras de linha)
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/\s+/g, ' ')  // Substituir múltiplos espaços por um único
        .replace(/\n/g, ' ')    // Substituir quebras de linha por espaço
        .trim();
    };
    
    const fullText = characters.join('');
    const normalizedInputText = normalizeText(text);
    
    // Encontrar timestamps de cada seção
    const sectionTimestamps: Record<string, number> = {};
    
    for (const marker of section_markers as SectionMarker[]) {
      const normalizedPhrase = normalizeText(marker.phrase);
      const phraseIndex = normalizedInputText.indexOf(normalizedPhrase);
      
      if (phraseIndex === -1) {
        console.warn(`Frase não encontrada no texto: "${marker.phrase}"`);
        console.log(`Texto normalizado procurado: "${normalizedPhrase}"`);
        console.log(`Primeiros 200 chars do texto: "${normalizedInputText.substring(0, 200)}"`);
        continue;
      }
      
      // Calcular índice aproximado no array de caracteres
      // Como normalizamos o texto, precisamos mapear de volta
      let charsSeen = 0;
      let foundIndex = -1;
      
      for (let i = 0; i < fullText.length; i++) {
        const normalizedChar = fullText.substring(0, i + 1)
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/\n/g, ' ')
          .trim();
        
        if (normalizedChar.length >= phraseIndex) {
          foundIndex = i;
          break;
        }
      }
      
      if (foundIndex !== -1 && foundIndex < character_start_times_seconds.length) {
        const timestamp = character_start_times_seconds[foundIndex];
        sectionTimestamps[marker.sectionId] = Math.round(timestamp);
        console.log(`✅ Seção "${marker.sectionId}": ${Math.round(timestamp)}s (frase: "${marker.phrase}")`);
      } else {
        console.warn(`❌ Timestamp não encontrado para: "${marker.phrase}"`);
      }
    }
    
    // Gerar word timestamps
    interface WordTimestamp {
      word: string;
      start: number;
      end: number;
    }
    
    const wordTimestamps: WordTimestamp[] = [];
    let currentWord = '';
    let wordStartIndex = 0;
    
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      
      if (char === ' ' || char === '\n' || i === characters.length - 1) {
        // Se é o último caractere e não é espaço, adiciona ao word atual
        if (i === characters.length - 1 && char !== ' ' && char !== '\n') {
          currentWord += char;
        }
        
        if (currentWord.trim().length > 0) {
          const cleanWord = currentWord.trim();
          const startTime = character_start_times_seconds[wordStartIndex];
          const endTime = i < characters.length - 1 
            ? character_start_times_seconds[i]
            : character_start_times_seconds[character_start_times_seconds.length - 1];
          
          wordTimestamps.push({
            word: cleanWord,
            start: startTime,
            end: endTime
          });
        }
        
        currentWord = '';
        wordStartIndex = i + 1;
      } else {
        currentWord += char;
      }
    }
    
    console.log(`✅ Gerados ${wordTimestamps.length} word timestamps`);
    
    return new Response(
      JSON.stringify({
        audio_base64,
        section_timestamps: sectionTimestamps,
        word_timestamps: wordTimestamps,
        alignment_data: {
          total_characters: characters.length,
          total_duration: character_start_times_seconds[character_start_times_seconds.length - 1],
          total_words: wordTimestamps.length
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
