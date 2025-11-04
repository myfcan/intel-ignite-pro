import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice_id, model_id, lesson_id } = await req.json();
    
    // Validações
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
    
    // Voice ID padrão: Sarah (voz feminina profissional em português)
    const voiceId = voice_id || 'EXAVITQu4vr4xnSDxMaL';
    
    // Model ID padrão: eleven_multilingual_v2 (melhor para português)
    const modelId = model_id || 'eleven_multilingual_v2';

    console.log('Gerando áudio com ElevenLabs (com timestamps)...');
    console.log('Voice ID:', voiceId);
    console.log('Model ID:', modelId);
    console.log('Text length:', text.length);
    console.log('Lesson ID:', lesson_id || 'não fornecido');
    
    // Chamar API do ElevenLabs COM TIMESTAMPS
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json', // IMPORTANTE: JSON para receber timestamps
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
          error: 'Falha ao gerar áudio',
          details: error,
          status: response.status
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // ElevenLabs retorna JSON com audio_base64 e alignment (word timestamps)
    const data = await response.json();
    
    // Extrair áudio e timestamps
    const audioBase64 = data.audio_base64;
    const alignment = data.alignment;
    
    if (!audioBase64) {
      console.error('Resposta sem áudio:', data);
      return new Response(
        JSON.stringify({ error: 'Resposta da API sem áudio' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Áudio gerado com sucesso. Tamanho:', audioBase64.length, 'chars base64');
    
    // Processar timestamps se disponíveis
    let wordTimestamps: Array<{word: string; start: number; end: number}> = [];
    if (alignment?.characters && alignment.characters.length > 0) {
      console.log('Processando', alignment.characters.length, 'timestamps de caracteres...');
      wordTimestamps = processWordTimestamps(alignment.characters, text);
      console.log('✅ Timestamps processados:', wordTimestamps.length, 'palavras');
      
      // Log das primeiras 5 palavras para debug
      console.log('Primeiras 5 palavras:', wordTimestamps.slice(0, 5));
      
      // Salvar timestamps no banco se lesson_id fornecido
      if (lesson_id) {
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          // Fazer upload do áudio para storage
          const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
          const fileName = `lesson-${lesson_id}-${Date.now()}.mp3`;
          
          const { error: uploadError } = await supabase.storage
            .from('lesson-audios')
            .upload(fileName, audioBuffer, {
              contentType: 'audio/mpeg',
              upsert: true
            });
          
          if (uploadError) {
            console.error('Erro ao fazer upload do áudio:', uploadError);
          } else {
            console.log('✅ Áudio salvo no storage:', fileName);
            
            // Pegar URL pública
            const { data: urlData } = supabase.storage
              .from('lesson-audios')
              .getPublicUrl(fileName);
            
            // Atualizar lesson com audio_url e timestamps
            const { error: updateError } = await supabase
              .from('lessons')
              .update({ 
                audio_url: urlData.publicUrl,
                word_timestamps: wordTimestamps 
              })
              .eq('id', lesson_id);
            
            if (updateError) {
              console.error('Erro ao atualizar lesson:', updateError);
            } else {
              console.log('✅ Lesson atualizada com audio_url e timestamps');
            }
          }
        } catch (err) {
          console.error('Erro ao salvar no banco:', err);
        }
      }
    } else {
      console.warn('⚠️ Nenhum timestamp recebido da API');
    }
    
    // Retornar JSON com audio_base64 e timestamps para o frontend processar também
    return new Response(
      JSON.stringify({
        audio_base64: audioBase64,
        word_timestamps: wordTimestamps,
        total_words: wordTimestamps.length
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

// Helper: Processar timestamps de caracteres para palavras completas
function processWordTimestamps(charTimestamps: any[], text: string) {
  const words: Array<{word: string; start: number; end: number}> = [];
  let currentWord = '';
  let wordStart = 0;
  
  for (let i = 0; i < charTimestamps.length; i++) {
    const charData = charTimestamps[i];
    
    // Validação básica
    if (!charData) continue;
    
    const char = charData.character || '';
    if (!char) continue;
    
    const startTime = charData.start_time_seconds || 0;
    const endTime = charData.end_time_seconds || startTime + 0.05;
    
    // Iniciar nova palavra
    if (currentWord.length === 0) {
      wordStart = startTime;
    }
    
    currentWord += char;
    
    // Verificar fim de palavra
    const isWordEnd = /[\s.,!?;:\n]/.test(char) || i === charTimestamps.length - 1;
    
    if (isWordEnd) {
      const trimmedWord = currentWord.trim();
      
      if (trimmedWord.length > 0) {
        words.push({
          word: trimmedWord,
          start: wordStart,
          end: endTime
        });
      }
      
      currentWord = '';
    }
  }
  
  return words;
}
