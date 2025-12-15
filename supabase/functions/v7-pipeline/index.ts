// supabase/functions/v7-pipeline/index.ts
// V7 Cinematic Lesson Pipeline - Generates cinematic lesson structure with ElevenLabs audio

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface V7PipelineInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  narrativeScript: string;
  duration: number;
  trail_id?: string;
  order_index?: number;
  voice_id?: string;
  generate_audio?: boolean;
}

interface V7Act {
  id: string;
  type: 'narrative' | 'code-demo' | 'challenge' | 'comparison' | 'reveal';
  title: string;
  startTime: number;
  endTime: number;
  content: {
    narrative?: string;
    code?: { language: string; code: string; highlightLines?: number[] };
    challenge?: { prompt: string; solution: string; hints: string[] };
    comparison?: { before: string; after: string; explanation: string };
    reveal?: { question: string; answer: string; explanation: string };
  };
  visualEffects: {
    particles?: boolean;
    glow?: boolean;
    cameraMovement?: string;
  };
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const input: V7PipelineInput = await req.json();
    console.log('[V7Pipeline] Starting pipeline for:', input.title);

    // Validate input
    if (!input.title || !input.narrativeScript) {
      throw new Error('Title and narrative script are required');
    }

    // ========================================================================
    // STEP 1: Parse narrative script into acts
    // ========================================================================
    console.log('[V7Pipeline] Step 1: Parsing narrative script...');
    
    const acts = parseNarrativeIntoActs(input.narrativeScript, input.duration);
    console.log('[V7Pipeline] Generated', acts.length, 'acts');

    // ========================================================================
    // STEP 2: Generate audio with ElevenLabs (if enabled)
    // ========================================================================
    let audioUrl = '';
    let wordTimestamps: WordTimestamp[] = [];
    
    const shouldGenerateAudio = input.generate_audio !== false; // Default true
    
    if (shouldGenerateAudio) {
      console.log('[V7Pipeline] Step 2: Generating audio with ElevenLabs...');
      
      const audioResult = await generateAudioWithElevenLabs(
        input.narrativeScript,
        input.voice_id,
        supabase
      );
      
      if (audioResult.success) {
        audioUrl = audioResult.audioUrl || '';
        wordTimestamps = audioResult.wordTimestamps || [];
        console.log('[V7Pipeline] Audio generated:', audioUrl);
        console.log('[V7Pipeline] Word timestamps:', wordTimestamps.length);
        
        // Recalculate act timings based on word timestamps
        if (wordTimestamps.length > 0) {
          recalculateActTimings(acts, wordTimestamps, input.narrativeScript);
        }
      } else {
        console.warn('[V7Pipeline] Audio generation failed:', audioResult.error);
      }
    } else {
      console.log('[V7Pipeline] Step 2: Skipping audio generation (disabled)');
    }

    // ========================================================================
    // STEP 3: Build V7 lesson structure
    // ========================================================================
    console.log('[V7Pipeline] Step 3: Building lesson structure...');
    
    const totalDuration = wordTimestamps.length > 0 
      ? Math.ceil(wordTimestamps[wordTimestamps.length - 1].end)
      : input.duration;
    
    const lessonContent = {
      model: 'v7',
      version: '1.0.0',
      metadata: {
        title: input.title,
        subtitle: input.subtitle || '',
        difficulty: input.difficulty,
        category: input.category,
        tags: input.tags,
        learningObjectives: input.learningObjectives,
        totalDuration: totalDuration,
        actCount: acts.length,
        createdAt: new Date().toISOString(),
      },
      audioConfig: {
        url: audioUrl,
        format: 'mp3',
        sampleRate: 44100,
      },
      timeline: {
        acts: acts,
        totalDuration: totalDuration,
      },
      interactivity: {
        pausePoints: acts
          .filter(a => a.type === 'challenge')
          .map(a => a.startTime),
        codePlaygrounds: acts
          .filter(a => a.type === 'code-demo' || a.type === 'challenge')
          .map(a => ({
            actId: a.id,
            language: a.content.code?.language || 'javascript',
            starterCode: a.content.code?.code || '',
          })),
      },
      visualTheme: {
        primaryColor: 'cyan',
        particlesEnabled: true,
        glowEffects: true,
      },
    };

    // ========================================================================
    // STEP 4: Save to database (ALWAYS save, trail_id optional)
    // ========================================================================
    let lessonId: string | null = null;
    
    console.log('[V7Pipeline] Step 4: Saving to database...');
    
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        title: input.title,
        description: input.subtitle || '',
        trail_id: input.trail_id || null, // Optional - can be assigned later
        order_index: input.order_index || 0,
        model: 'v7',
        lesson_type: 'v7-cinematic',
        content: lessonContent,
        audio_url: audioUrl || null,
        word_timestamps: wordTimestamps.length > 0 ? wordTimestamps : null,
        estimated_time: Math.ceil(totalDuration / 60),
        difficulty_level: input.difficulty,
        is_active: false, // Draft mode
        status: 'rascunho',
      })
      .select('id')
      .single();

    if (lessonError) {
      console.error('[V7Pipeline] Database error:', lessonError);
      throw new Error(`Failed to save lesson: ${lessonError.message}`);
    }

    lessonId = lesson.id;
    console.log('[V7Pipeline] Lesson saved with ID:', lessonId);

    // ========================================================================
    // RESPONSE
    // ========================================================================
    const response = {
      success: true,
      lessonId,
      content: lessonContent,
      audioUrl,
      wordTimestampsCount: wordTimestamps.length,
      stats: {
        actCount: acts.length,
        totalDuration: totalDuration,
        interactivePoints: lessonContent.interactivity.pausePoints.length,
        codePlaygrounds: lessonContent.interactivity.codePlaygrounds.length,
        hasAudio: !!audioUrl,
      },
    };

    console.log('[V7Pipeline] Pipeline completed successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[V7Pipeline] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ============================================================================
// ELEVENLABS AUDIO GENERATION
// ============================================================================

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
  
  // Default voice: Alice (Xb7hH8MSUJpSbSDYk0k2) - good for Portuguese
  const voice = voiceId || 'Xb7hH8MSUJpSbSDYk0k2';
  const modelId = 'eleven_multilingual_v2';
  
  console.log('[V7Pipeline:Audio] Generating audio...');
  console.log('[V7Pipeline:Audio] Voice ID:', voice);
  console.log('[V7Pipeline:Audio] Text length:', text.length);
  
  try {
    // Call ElevenLabs with timestamps
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
          text: text,
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
      console.error('[V7Pipeline:Audio] ElevenLabs error:', response.status, errorText);
      return { success: false, error: `ElevenLabs API error: ${response.status}` };
    }
    
    const data = await response.json();
    const audioBase64 = data.audio_base64;
    const alignment = data.alignment;
    
    if (!audioBase64) {
      return { success: false, error: 'No audio in response' };
    }
    
    console.log('[V7Pipeline:Audio] Audio generated, size:', audioBase64.length);
    
    // Process word timestamps
    let wordTimestamps: WordTimestamp[] = [];
    if (alignment?.characters && alignment?.character_start_times_seconds) {
      wordTimestamps = processWordTimestamps(
        alignment.characters,
        alignment.character_start_times_seconds
      );
      console.log('[V7Pipeline:Audio] Word timestamps:', wordTimestamps.length);
    }
    
    // Upload to Supabase Storage
    let audioUrl = '';
    if (supabase) {
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const fileName = `v7-lesson-${Date.now()}.mp3`;
      
      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('[V7Pipeline:Audio] Upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('lesson-audios')
          .getPublicUrl(fileName);
        audioUrl = urlData.publicUrl;
        console.log('[V7Pipeline:Audio] Uploaded to:', audioUrl);
      }
    }
    
    return {
      success: true,
      audioUrl,
      wordTimestamps,
    };
    
  } catch (error: any) {
    console.error('[V7Pipeline:Audio] Error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

function parseNarrativeIntoActs(script: string, totalDuration: number): V7Act[] {
  const acts: V7Act[] = [];
  
  // Split script into paragraphs
  const paragraphs = script
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    return [{
      id: 'act-1',
      type: 'narrative',
      title: 'Introdução',
      startTime: 0,
      endTime: totalDuration,
      content: { narrative: script },
      visualEffects: { particles: true, glow: true },
    }];
  }

  const timePerParagraph = totalDuration / paragraphs.length;

  paragraphs.forEach((paragraph, index) => {
    const startTime = Math.floor(index * timePerParagraph);
    const endTime = Math.floor((index + 1) * timePerParagraph);
    const actType = detectActType(paragraph);
    
    acts.push({
      id: `act-${index + 1}`,
      type: actType,
      title: generateActTitle(paragraph, actType, index),
      startTime,
      endTime,
      content: generateActContent(paragraph, actType),
      visualEffects: {
        particles: actType === 'reveal' || index === 0,
        glow: actType === 'code-demo' || actType === 'challenge',
        cameraMovement: index === 0 ? 'zoom-in' : 'pan',
      },
    });
  });

  return acts;
}

function recalculateActTimings(
  acts: V7Act[],
  wordTimestamps: WordTimestamp[],
  narrativeScript: string
): void {
  if (acts.length === 0 || wordTimestamps.length === 0) return;
  
  const paragraphs = narrativeScript
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  let wordIndex = 0;
  
  acts.forEach((act, actIndex) => {
    const paragraph = paragraphs[actIndex] || '';
    const paragraphWords = paragraph.split(/\s+/).filter(w => w.length > 0);
    
    // Find start time
    if (wordIndex < wordTimestamps.length) {
      act.startTime = wordTimestamps[wordIndex].start;
    }
    
    // Move word index forward by paragraph word count
    wordIndex += paragraphWords.length;
    
    // Find end time
    if (wordIndex <= wordTimestamps.length) {
      act.endTime = wordTimestamps[Math.min(wordIndex - 1, wordTimestamps.length - 1)].end;
    }
    
    // Ensure last act goes to the end
    if (actIndex === acts.length - 1) {
      act.endTime = wordTimestamps[wordTimestamps.length - 1].end;
    }
  });
  
  console.log('[V7Pipeline] Act timings recalculated from word timestamps');
}

function detectActType(paragraph: string): V7Act['type'] {
  const lower = paragraph.toLowerCase();
  
  if (lower.includes('```') || lower.includes('código') || lower.includes('function') || lower.includes('const ')) {
    return 'code-demo';
  }
  if (lower.includes('desafio') || lower.includes('exercício') || lower.includes('tente') || lower.includes('pratique')) {
    return 'challenge';
  }
  if (lower.includes('antes') && lower.includes('depois')) {
    return 'comparison';
  }
  if (lower.includes('?') && lower.includes('resposta')) {
    return 'reveal';
  }
  
  return 'narrative';
}

function generateActTitle(paragraph: string, type: V7Act['type'], index: number): string {
  const typeLabels: Record<string, string> = {
    'narrative': 'Narrativa',
    'code-demo': 'Demonstração',
    'challenge': 'Desafio',
    'comparison': 'Comparação',
    'reveal': 'Revelação',
  };
  
  const firstLine = paragraph.split('\n')[0].substring(0, 50);
  if (firstLine.length > 10 && firstLine.length < 50) {
    return firstLine.replace(/[#*_]/g, '').trim();
  }
  
  return `${typeLabels[type]} ${index + 1}`;
}

function generateActContent(paragraph: string, type: V7Act['type']): V7Act['content'] {
  switch (type) {
    case 'code-demo':
      const codeMatch = paragraph.match(/```(\w+)?\n([\s\S]*?)```/);
      if (codeMatch) {
        return {
          narrative: paragraph.replace(/```[\s\S]*?```/, '').trim(),
          code: {
            language: codeMatch[1] || 'javascript',
            code: codeMatch[2].trim(),
          },
        };
      }
      return {
        narrative: paragraph,
        code: {
          language: 'javascript',
          code: '// Código de exemplo\nconsole.log("Hello V7!");',
        },
      };

    case 'challenge':
      return {
        narrative: paragraph,
        challenge: {
          prompt: paragraph,
          solution: '// Solução será adicionada',
          hints: ['Tente pensar passo a passo', 'Revise o conteúdo anterior'],
        },
      };

    case 'comparison':
      return {
        narrative: paragraph,
        comparison: {
          before: '// Antes',
          after: '// Depois (otimizado)',
          explanation: paragraph,
        },
      };

    case 'reveal':
      return {
        narrative: paragraph,
        reveal: {
          question: paragraph.split('?')[0] + '?',
          answer: paragraph.split('?')[1]?.trim() || 'Resposta revelada!',
          explanation: paragraph,
        },
      };

    default:
      return { narrative: paragraph };
  }
}
