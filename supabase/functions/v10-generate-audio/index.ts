import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice - PT-BR (padrão V8)
const MODEL_ID = 'eleven_multilingual_v2';
const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.3,
  use_speaker_boost: true,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Auth: require admin/supervisor role
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const { pipeline_id, target, step_numbers } = await req.json();

    if (!pipeline_id) {
      return new Response(
        JSON.stringify({ error: 'pipeline_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!target || !['part_a', 'part_c', 'steps'].includes(target)) {
      return new Response(
        JSON.stringify({ error: 'target must be "part_a", "part_c", or "steps"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY_1') || Deno.env.get('ELEVENLABS_API_KEY');

    if (!elevenLabsKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey) as any;

    // 1. Fetch pipeline
    const { data: pipeline, error: pipelineError } = await supabase
      .from('v10_bpa_pipeline')
      .select('*')
      .eq('id', pipeline_id)
      .single();

    if (pipelineError || !pipeline) {
      console.error('Error fetching pipeline:', pipelineError);
      return new Response(
        JSON.stringify({ error: 'Pipeline not found', details: pipelineError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lesson_id = pipeline.lesson_id;
    if (!lesson_id) {
      return new Response(
        JSON.stringify({ error: 'Pipeline has no lesson_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[v10-generate-audio] Starting target=${target} for pipeline=${pipeline_id}, lesson=${lesson_id}`);

    let result: Record<string, unknown>;

    if (target === 'part_a' || target === 'part_c') {
      result = await handlePartNarration(supabase, pipeline, lesson_id, target, elevenLabsKey, lovableApiKey);
    } else {
      result = await handleStepsAudio(supabase, pipeline, lesson_id, step_numbers, elevenLabsKey, lovableApiKey);
    }

    // Log success
    await logPipeline(supabase, pipeline_id, 'generate-audio', 'completed', { target, ...result });

    return new Response(
      JSON.stringify({ success: true, target, ...result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[v10-generate-audio] Error:', error);

    // Attempt to log the error
    try {
      const { pipeline_id } = await req.clone().json().catch(() => ({ pipeline_id: null }));
      if (pipeline_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey) as any;
        await logPipeline(supabase, pipeline_id, 'generate-audio', 'error', { error: (error as any)?.message });
      }
    } catch (_) {
      // ignore logging failure
    }

    return new Response(
      JSON.stringify({ error: (error as any)?.message ?? String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ─── Part A / Part C narration ────────────────────────────────────────────────

async function handlePartNarration(
  supabase: any,
  pipeline: any,
  lesson_id: string,
  target: 'part_a' | 'part_c',
  elevenLabsKey: string,
  lovableApiKey: string,
): Promise<Record<string, unknown>> {
  const part = target === 'part_a' ? 'A' : 'C';

  // 2. Fetch existing narration record
  const { data: narration, error: narrationError } = await supabase
    .from('v10_lesson_narrations')
    .select('*')
    .eq('lesson_id', lesson_id)
    .eq('part', part)
    .maybeSingle();

  if (narrationError) {
    throw new Error(`Error fetching narration: ${narrationError.message}`);
  }

  let narrationRecord = narration;
  let script: string;

  if (narrationRecord && narrationRecord.script_text) {
    // Use existing script
    script = narrationRecord.script_text;
    console.log(`[v10-generate-audio] Using existing script for Part ${part} (${script.length} chars)`);
  } else {
    // 3. Generate script via AI
    script = await generateNarrationScript(pipeline, part, lovableApiKey);
    console.log(`[v10-generate-audio] Generated script for Part ${part} (${script.length} chars)`);

    if (narrationRecord) {
      // Update existing record with script
      const { error: updateErr } = await supabase
        .from('v10_lesson_narrations')
        .update({ script_text: script })
        .eq('id', narrationRecord.id);
      if (updateErr) {
        throw new Error(`Error updating narration script: ${updateErr.message}`);
      }
    } else {
      // Create new narration record
      const { data: newRecord, error: insertErr } = await supabase
        .from('v10_lesson_narrations')
        .insert({ lesson_id, part, script_text: script })
        .select()
        .single();
      if (insertErr) {
        throw new Error(`Error creating narration record: ${insertErr.message}`);
      }
      narrationRecord = newRecord;
    }
  }

  // 4. Generate audio via ElevenLabs
  const audioBuffer = await generateTTSAudio(script, elevenLabsKey);

  // 5. Upload to storage
  const storagePath = `v10/${lesson_id}/narration_${part.toLowerCase()}.mp3`;
  const audioUrl = await uploadAudio(supabase, storagePath, audioBuffer);

  // 6. Estimate duration and update narration record
  const durationSeconds = Math.round(audioBuffer.byteLength / 16000);

  const { error: updateError } = await supabase
    .from('v10_lesson_narrations')
    .update({
      audio_url: audioUrl,
      duration_seconds: durationSeconds,
    })
    .eq('id', narrationRecord.id);

  if (updateError) {
    throw new Error(`Error updating narration with audio: ${updateError.message}`);
  }

  // 7. Update pipeline audios_generated count
  await incrementAudiosGenerated(supabase, pipeline);

  console.log(`[v10-generate-audio] Part ${part} done: ${Math.round(audioBuffer.byteLength / 1024)}KB, ~${durationSeconds}s`);

  return {
    part,
    audio_url: audioUrl,
    duration_seconds: durationSeconds,
    script_length: script.length,
  };
}

// ─── Steps audio ──────────────────────────────────────────────────────────────

async function handleStepsAudio(
  supabase: any,
  pipeline: any,
  lesson_id: string,
  step_numbers: number[] | undefined,
  elevenLabsKey: string,
  lovableApiKey: string,
): Promise<Record<string, unknown>> {
  if (!step_numbers || !Array.isArray(step_numbers) || step_numbers.length === 0) {
    throw new Error('step_numbers array is required for target="steps"');
  }

  // 2. Fetch specified steps
  const { data: steps, error: stepsError } = await supabase
    .from('v10_lesson_steps')
    .select('*')
    .eq('lesson_id', lesson_id)
    .in('step_number', step_numbers)
    .order('step_number', { ascending: true });

  if (stepsError) {
    throw new Error(`Error fetching steps: ${stepsError.message}`);
  }

  if (!steps || steps.length === 0) {
    throw new Error(`No steps found for lesson ${lesson_id} with step_numbers [${step_numbers.join(', ')}]`);
  }

  const results: Array<{ step_number: number; audio_url: string; duration_seconds: number }> = [];

  // 3-6. Process each step sequentially
  for (const step of steps) {
    console.log(`[v10-generate-audio] Processing step ${step.step_number}: ${step.title || 'untitled'}`);

    // 3. Generate narration script for step
    const script = await generateStepScript(step, lovableApiKey);
    console.log(`[v10-generate-audio] Step ${step.step_number} script: ${script.length} chars`);

    // 4. Generate audio
    const audioBuffer = await generateTTSAudio(script, elevenLabsKey);

    // 5. Upload to storage
    const storagePath = `v10/${lesson_id}/step_${step.step_number}.mp3`;
    const audioUrl = await uploadAudio(supabase, storagePath, audioBuffer);

    const durationSeconds = Math.round(audioBuffer.byteLength / 16000);

    // 6. Update step record with audio_url
    const { error: updateError } = await supabase
      .from('v10_lesson_steps')
      .update({ audio_url: audioUrl })
      .eq('id', step.id);

    if (updateError) {
      console.error(`[v10-generate-audio] Error updating step ${step.step_number}:`, updateError);
      throw new Error(`Error updating step ${step.step_number}: ${updateError.message}`);
    }

    results.push({
      step_number: step.step_number,
      audio_url: audioUrl,
      duration_seconds: durationSeconds,
    });

    console.log(`[v10-generate-audio] Step ${step.step_number} done: ${Math.round(audioBuffer.byteLength / 1024)}KB, ~${durationSeconds}s`);
  }

  // 7. Update pipeline audios_generated count
  await incrementAudiosGenerated(supabase, pipeline, results.length);

  return {
    steps_processed: results.length,
    steps: results,
  };
}

// ─── AI script generation ─────────────────────────────────────────────────────

async function generateNarrationScript(
  pipeline: any,
  part: string,
  lovableApiKey: string,
): Promise<string> {
  const title = pipeline.title || 'a lição';
  const topic = pipeline.docs_manual_input || pipeline.slug || title;

  let systemPrompt: string;
  let userMessage: string;

  if (part === 'A') {
    systemPrompt = `Você é uma narradora brasileira chamada Taciana, com voz amigável e envolvente. Gere um script de narração de aproximadamente 30 segundos (cerca de 80 palavras) para a introdução de uma aula de tecnologia. O script deve:
- Cumprimentar o aluno de forma calorosa
- Apresentar brevemente o tema da aula
- Despertar curiosidade sobre o que será aprendido
- Usar linguagem acessível e entusiasmada
- Ser em português brasileiro natural e fluido
Retorne APENAS o texto do script, sem aspas, sem markdown, sem instruções.`;
    userMessage = `Tema da aula: ${title}\nContexto: ${topic}`;
  } else {
    systemPrompt = `Você é uma narradora brasileira chamada Taciana, com voz amigável e envolvente. Gere um script de narração de aproximadamente 20 segundos (cerca de 55 palavras) para o encerramento de uma aula de tecnologia. O script deve:
- Parabenizar o aluno pela conclusão da aula
- Fazer um breve recap do que foi aprendido
- Encorajar o aluno a praticar
- Ser em português brasileiro natural e fluido
Retorne APENAS o texto do script, sem aspas, sem markdown, sem instruções.`;
    userMessage = `Tema da aula: ${title}\nContexto: ${topic}`;
  }

  return await callLovableAI(systemPrompt, userMessage, lovableApiKey);
}

async function generateStepScript(
  step: any,
  lovableApiKey: string,
): Promise<string> {
  const title = step.title || '';
  const description = step.description || '';
  const frameContent = step.frame_content || step.content || '';

  const systemPrompt = `Você é uma narradora brasileira chamada Taciana, com voz amigável e envolvente. Gere um script de narração curto e claro para um passo de uma aula prática de tecnologia. O script deve:
- Explicar o que o aluno precisa fazer neste passo
- Ser direto e objetivo, mas amigável
- Contextualizar o passo dentro do aprendizado
- Usar linguagem acessível em português brasileiro
- Ter entre 30-60 palavras
Retorne APENAS o texto do script, sem aspas, sem markdown, sem instruções.`;

  const userMessage = `Título do passo: ${title}\nDescrição: ${description}\nConteúdo do frame: ${typeof frameContent === 'string' ? frameContent.slice(0, 500) : JSON.stringify(frameContent).slice(0, 500)}`;

  return await callLovableAI(systemPrompt, userMessage, lovableApiKey);
}

async function callLovableAI(
  systemPrompt: string,
  userMessage: string,
  lovableApiKey: string,
): Promise<string> {
  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${lovableApiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('[v10-generate-audio] AI Gateway error:', aiResponse.status, errorText);
    throw new Error(`AI Gateway returned ${aiResponse.status}: ${errorText}`);
  }

  const aiData = await aiResponse.json();
  const content = aiData.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in AI response');
  }

  // Clean up any stray markdown or quotes
  return content.replace(/^["']|["']$/g, '').trim();
}

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

async function generateTTSAudio(
  text: string,
  elevenLabsKey: string,
): Promise<ArrayBuffer> {
  const ttsResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: VOICE_SETTINGS,
      }),
    }
  );

  if (!ttsResponse.ok) {
    const errorText = await ttsResponse.text();
    console.error('[v10-generate-audio] ElevenLabs error:', ttsResponse.status, errorText);
    throw new Error(`ElevenLabs ${ttsResponse.status}: ${errorText.slice(0, 300)}`);
  }

  return await ttsResponse.arrayBuffer();
}

// ─── Storage upload ───────────────────────────────────────────────────────────

async function uploadAudio(
  supabase: any,
  storagePath: string,
  audioBuffer: ArrayBuffer,
): Promise<string> {
  const uint8 = new Uint8Array(audioBuffer);

  const { error: uploadError } = await supabase.storage
    .from('lesson-audios')
    .upload(storagePath, uint8.buffer as ArrayBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed for ${storagePath}: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('lesson-audios')
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

// ─── Pipeline helpers ─────────────────────────────────────────────────────────

async function incrementAudiosGenerated(
  supabase: any,
  pipeline: any,
  count: number = 1,
): Promise<void> {
  const currentCount = pipeline.audios_generated || 0;
  const { error } = await supabase
    .from('v10_bpa_pipeline')
    .update({ audios_generated: currentCount + count })
    .eq('id', pipeline.id);

  if (error) {
    console.error('[v10-generate-audio] Error updating audios_generated:', error);
  }
}

async function logPipeline(
  supabase: any,
  pipeline_id: string,
  action: string,
  status: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from('v10_bpa_pipeline_log')
    .insert({
      pipeline_id,
      stage: 5,
      action: `${action}:${status}`,
      details: payload,
    });

  if (error) {
    console.error('[v10-generate-audio] Error logging to pipeline log:', error);
  }
}
