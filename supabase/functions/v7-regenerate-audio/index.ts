// supabase/functions/v7-regenerate-audio/index.ts
// Regenerate audio for existing V7 lessons via ElevenLabs

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { lessonId, voiceId } = await req.json();
    
    if (!lessonId) {
      throw new Error('lessonId is required');
    }

    console.log('[V7RegenerateAudio] Starting for lesson:', lessonId);

    // Fetch the lesson
    const { data: lesson, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (fetchError || !lesson) {
      throw new Error(`Lesson not found: ${fetchError?.message || 'No data'}`);
    }

    if (lesson.model !== 'v7') {
      throw new Error(`Lesson is not V7 (model: ${lesson.model})`);
    }

    console.log('[V7RegenerateAudio] Lesson found:', lesson.title);

    // Extract narration text from content
    const content = lesson.content as any;
    let narrativeText = '';

    // Check for cinematic_flow.acts structure first
    if (content?.cinematic_flow?.acts) {
      const narrations: string[] = [];
      for (const act of content.cinematic_flow.acts) {
        if (act.content?.audio?.narration) {
          narrations.push(act.content.audio.narration);
        }
      }
      narrativeText = narrations.join('\n\n');
      console.log('[V7RegenerateAudio] Extracted', narrations.length, 'narration segments from cinematic_flow');
    }

    // Fallback to cinematicStructure.acts
    if (!narrativeText && content?.cinematicStructure?.acts) {
      const narrations: string[] = [];
      for (const act of content.cinematicStructure.acts) {
        if (act.narrativeSegment) {
          narrations.push(act.narrativeSegment);
        }
      }
      narrativeText = narrations.join('\n\n');
      console.log('[V7RegenerateAudio] Extracted', narrations.length, 'narrative segments from cinematicStructure');
    }

    // Fallback to metadata
    if (!narrativeText && content?.metadata?.narrativeScript) {
      narrativeText = content.metadata.narrativeScript;
      console.log('[V7RegenerateAudio] Using narrativeScript from metadata');
    }

    if (!narrativeText || narrativeText.trim().length === 0) {
      throw new Error('No narration text found in lesson content');
    }

    console.log('[V7RegenerateAudio] Total narration length:', narrativeText.length);

    // Generate audio with ElevenLabs
    const audioResult = await generateAudioWithElevenLabs(narrativeText, voiceId, supabase);

    if (!audioResult.success) {
      throw new Error(`Audio generation failed: ${audioResult.error}`);
    }

    console.log('[V7RegenerateAudio] Audio generated:', audioResult.audioUrl);
    console.log('[V7RegenerateAudio] Word timestamps:', audioResult.wordTimestamps?.length || 0);

    // Update lesson with new audio
    const updateData: any = {
      audio_url: audioResult.audioUrl,
    };

    if (audioResult.wordTimestamps && audioResult.wordTimestamps.length > 0) {
      updateData.word_timestamps = audioResult.wordTimestamps;
      
      // Update content.audioConfig
      const updatedContent = {
        ...content,
        audioConfig: {
          ...content?.audioConfig,
          url: audioResult.audioUrl,
          hasWordTimestamps: true,
        },
      };
      updateData.content = updatedContent;
    }

    const { error: updateError } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', lessonId);

    if (updateError) {
      throw new Error(`Failed to update lesson: ${updateError.message}`);
    }

    console.log('[V7RegenerateAudio] Lesson updated successfully');

    return new Response(JSON.stringify({
      success: true,
      lessonId,
      audioUrl: audioResult.audioUrl,
      wordTimestampsCount: audioResult.wordTimestamps?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[V7RegenerateAudio] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ✅ FIX: Clean pause tags and contextual markers from text before TTS
function cleanTextForTTS(text: string): string {
  return text
    // Remove [pause:X] tags (e.g., [pause:2000], [pause:500])
    .replace(/\[pause:\d+\]/gi, '')
    // Remove [contextual] markers
    .replace(/\[contextual[^\]]*\]/gi, '')
    // Remove any remaining bracket tags
    .replace(/\[[^\]]*\]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up spaces before punctuation
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}

// ElevenLabs audio generation function
async function generateAudioWithElevenLabs(
  text: string,
  voiceId?: string,
  supabase?: any
): Promise<{
  success: boolean;
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];
  error?: string;
}> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  
  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ELEVENLABS_API_KEY not configured' };
  }
  
  // ✅ FIX: Clean text before sending to TTS
  const cleanedText = cleanTextForTTS(text);
  
  const voice = voiceId || 'oqUwsXKac3MSo4E51ySV'; // Taciana PT-BR
  const modelId = 'eleven_v3';
  
  console.log('[V7RegenerateAudio:Audio] Generating audio...');
  console.log('[V7RegenerateAudio:Audio] Voice ID:', voice);
  console.log('[V7RegenerateAudio:Audio] Original text length:', text.length);
  console.log('[V7RegenerateAudio:Audio] Cleaned text length:', cleanedText.length);
  
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: cleanedText, // ✅ FIX: Use cleaned text
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[V7RegenerateAudio:Audio] ElevenLabs error:', response.status, errorText);
      return { success: false, error: `ElevenLabs API error: ${response.status}` };
    }
    
    const data = await response.json();
    const audioBase64 = data.audio_base64;
    const alignment = data.alignment;
    
    if (!audioBase64) {
      return { success: false, error: 'No audio in response' };
    }
    
    console.log('[V7RegenerateAudio:Audio] Audio generated, base64 length:', audioBase64.length);
    
    // Process word timestamps
    let wordTimestamps: WordTimestamp[] = [];
    if (alignment?.characters && alignment?.character_start_times_seconds) {
      wordTimestamps = processWordTimestamps(
        alignment.characters,
        alignment.character_start_times_seconds
      );
      console.log('[V7RegenerateAudio:Audio] Processed', wordTimestamps.length, 'word timestamps');
    }
    
    // Upload to Supabase Storage
    let audioUrl = '';
    if (supabase) {
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const fileName = `v7-cinematic-regen-${Date.now()}.mp3`;
      
      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('[V7RegenerateAudio:Audio] Upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('lesson-audios')
          .getPublicUrl(fileName);
        audioUrl = urlData.publicUrl;
        console.log('[V7RegenerateAudio:Audio] Uploaded to:', audioUrl);
      }
    }
    
    return {
      success: true,
      audioUrl,
      wordTimestamps,
    };
    
  } catch (error: any) {
    console.error('[V7RegenerateAudio:Audio] Error:', error);
    return { success: false, error: error.message };
  }
}

function processWordTimestamps(
  characters: string[],
  characterStartTimes: number[]
): WordTimestamp[] {
  const words: WordTimestamp[] = [];
  let currentWord = '';
  let wordStartIndex = 0;
  
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    
    if (char === ' ' || char === '\n' || i === characters.length - 1) {
      if (i === characters.length - 1 && char !== ' ' && char !== '\n') {
        currentWord += char;
      }
      
      if (currentWord.trim().length > 0) {
        const cleanWord = currentWord.trim();
        const startTime = characterStartTimes[wordStartIndex];
        const endTime = i < characters.length - 1
          ? characterStartTimes[i]
          : characterStartTimes[characterStartTimes.length - 1];
        
        words.push({ word: cleanWord, start: startTime, end: endTime });
      }
      
      currentWord = '';
      wordStartIndex = i + 1;
    } else {
      currentWord += char;
    }
  }
  
  return words;
}
