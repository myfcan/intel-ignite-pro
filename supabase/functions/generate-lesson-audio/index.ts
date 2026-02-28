import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ElevenLabsResponse {
  audio: number[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lesson_id } = await req.json().catch(() => ({}));
    
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Buscar a Trilha 1 (Fundamentos)
    const { data: trail, error: trailError } = await supabase
      .from('trails')
      .select('id, title')
      .eq('title', 'Fundamentos de IA')
      .single();

    if (trailError || !trail) {
      console.error('Error fetching trail:', trailError);
      throw new Error('Trail "Fundamentos de IA" not found');
    }

    console.log('Found trail:', trail);

    // Buscar as aulas da trilha 1 - filtrar por lesson_id se fornecido
    let lessonsQuery = supabase
      .from('lessons')
      .select('id, title, content, order_index')
      .eq('trail_id', trail.id);
    
    if (lesson_id) {
      lessonsQuery = lessonsQuery.eq('id', lesson_id);
      console.log(`Filtering for specific lesson: ${lesson_id}`);
    }
    
    const { data: lessons, error: lessonsError } = await lessonsQuery.order('order_index');

    if (lessonsError || !lessons || lessons.length === 0) {
      console.error('Error fetching lessons:', lessonsError);
      throw new Error('No lessons found for this trail');
    }

    console.log(`Found ${lessons.length} lessons`);

    const results = [];

    for (const lesson of lessons) {
      console.log(`Processing lesson: ${lesson.title}`);

      // Extrair texto do conteúdo da lição para gerar o áudio
      let textToSpeak = '';
      
      if (lesson.content) {
        // Para lições guided (novo sistema com sections)
        if (lesson.content.sections && Array.isArray(lesson.content.sections)) {
          lesson.content.sections.forEach((section: any) => {
            if (section.content) {
              textToSpeak += section.content + ' ';
            }
          });
        }
        
        // Para lições fill-blanks, fill-text, drag-drop
        if (lesson.content.introduction) {
          textToSpeak += lesson.content.introduction + '. ';
        }
        if (lesson.content.instructions) {
          textToSpeak += lesson.content.instructions + '. ';
        }
        if (lesson.content.explanation) {
          textToSpeak += lesson.content.explanation + '. ';
        }
        
        // Para lições quiz-playground
        if (lesson.content.quiz && lesson.content.quiz.question) {
          textToSpeak += lesson.content.quiz.question + '. ';
        }
        if (lesson.content.playgroundInstructions) {
          textToSpeak += lesson.content.playgroundInstructions + '. ';
        }
        
        // Para lições flashcards
        if (lesson.content.cards && Array.isArray(lesson.content.cards)) {
          lesson.content.cards.forEach((card: any, index: number) => {
            if (card.question) {
              textToSpeak += `Cartão ${index + 1}: ${card.question}. `;
            }
            if (card.answer) {
              textToSpeak += `Resposta: ${card.answer}. `;
            }
          });
        }
        
        // Para lições before-after
        if (lesson.content.challenge) {
          textToSpeak += lesson.content.challenge + '. ';
        }
        if (lesson.content.badExample) {
          textToSpeak += `Exemplo ruim: ${lesson.content.badExample}. `;
        }
        if (lesson.content.goodExample) {
          textToSpeak += `Exemplo bom: ${lesson.content.goodExample}. `;
        }
      }

      if (!textToSpeak.trim()) {
        console.log(`Skipping lesson ${lesson.title} - no text to speak`);
        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          status: 'skipped',
          reason: 'no_text'
        });
        continue;
      }

      // Remover markdown e formatação para melhorar a narração
      textToSpeak = textToSpeak
        .replace(/#{1,6}\s+/g, '') // Remove títulos markdown
        .replace(/\*\*/g, '') // Remove bold
        .replace(/\*/g, '') // Remove itálico
        .replace(/`/g, '') // Remove code
        .replace(/\n{3,}/g, '\n\n') // Reduz múltiplas quebras de linha
        .trim();

      console.log(`Generating audio for: ${textToSpeak.substring(0, 100)}...`);
      console.log(`Total text length: ${textToSpeak.length} characters`);

      // Gerar áudio com ElevenLabs
      const elevenLabsResponse = await fetch(
        'https://api.elevenlabs.io/v1/text-to-speech/Xb7hH8MSUJpSbSDYk0k2', // Voice ID: Alice
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: textToSpeak,
            model_id: 'eleven_v3',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            }
          }),
        }
      );

      if (!elevenLabsResponse.ok) {
        const errorText = await elevenLabsResponse.text();
        console.error('ElevenLabs API error:', errorText);
        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          status: 'error',
          error: errorText
        });
        continue;
      }

      // Converter resposta para ArrayBuffer
      const audioArrayBuffer = await elevenLabsResponse.arrayBuffer();
      const audioBlob = new Uint8Array(audioArrayBuffer);

      console.log(`Audio generated, size: ${audioBlob.length} bytes`);

      // Fazer upload para Supabase Storage com timestamp para evitar cache
      const timestamp = Date.now();
      const fileName = `lesson-${lesson.id}-${timestamp}.mp3`;
      
      // Deletar áudio antigo se existir
      const { data: existingFiles } = await supabase.storage
        .from('lesson-audios')
        .list('', {
          search: `lesson-${lesson.id}-`
        });
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => f.name);
        await supabase.storage
          .from('lesson-audios')
          .remove(filesToDelete);
      }
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(fileName, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          status: 'error',
          error: uploadError.message
        });
        continue;
      }

      console.log('Audio uploaded:', uploadData);

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('lesson-audios')
        .getPublicUrl(fileName);

      const audioUrl = publicUrlData.publicUrl;

      console.log('Public URL:', audioUrl);

      // Atualizar a tabela lessons com a URL do áudio
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ audio_url: audioUrl })
        .eq('id', lesson.id);

      if (updateError) {
        console.error('Update error:', updateError);
        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          status: 'error',
          error: updateError.message
        });
        continue;
      }

      console.log(`Successfully processed lesson: ${lesson.title}`);

      results.push({
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        status: 'success',
        audio_url: audioUrl
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        trail: trail.title,
        total_lessons: lessons.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-lesson-audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
