import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── ElevenLabs config (same as V7 pipeline) ───
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice Brasil
const MODEL_ID = 'eleven_v3';
const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.3,
  use_speaker_boost: true,
};

interface V8Section {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

interface V8InlineQuiz {
  id: string;
  afterSectionIndex: number;
  question: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
  reinforcement?: string;
}

interface GenerateRequest {
  lessonId: string;
  sections: V8Section[];
  quizzes?: V8InlineQuiz[];
  playgrounds?: Array<{
    id: string;
    narration?: string;
    instruction: string;
  }>;
}

interface AudioResult {
  index: number;
  type: 'section' | 'quiz' | 'quiz-reinforcement';
  audioUrl: string;
  durationEstimate: number;
  sizeKB: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // ─── 1. AUTH ───
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('Unauthorized', 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify user via REST (stable pattern per memory)
    const token = authHeader.replace('Bearer ', '');
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });

    if (!userRes.ok) {
      await userRes.text();
      return jsonError('Invalid token', 401);
    }

    const userData = await userRes.json();
    const userId = userData.id;

    // Check admin role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey) as any;
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return jsonError('Admin access required', 403);
    }

    // ─── 2. PARSE & VALIDATE INPUT ───
    const body: GenerateRequest = await req.json();
    const { lessonId, sections, quizzes = [], playgrounds = [] } = body;

    if (!lessonId || !sections?.length) {
      return jsonError('lessonId and sections[] are required', 400);
    }

    console.log(`[v8-generate] 🚀 Starting for lesson ${lessonId}: ${sections.length} sections, ${quizzes.length} quizzes, ${playgrounds.length} playgrounds`);

    // ─── 3. ELEVENLABS API KEY ───
    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY_1') || Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsKey) {
      return jsonError('ElevenLabs API key not configured', 500);
    }

    // ─── 4. GENERATE AUDIO FOR EACH SECTION ───
    const results: AudioResult[] = [];
    const errors: Array<{ index: number; type: string; error: string }> = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      // Strip markdown for TTS (basic cleanup)
      const plainText = stripMarkdownForTTS(section.content);
      if (!plainText.trim()) {
        console.log(`[v8-generate] ⏭️ Skipping empty section ${i}`);
        continue;
      }

      // Previous/next text for request stitching
      const prevText = i > 0 ? stripMarkdownForTTS(sections[i - 1].content).slice(-200) : undefined;
      const nextText = i < sections.length - 1 ? stripMarkdownForTTS(sections[i + 1].content).slice(0, 200) : undefined;

      try {
        const audioBuffer = await generateTTS(elevenLabsKey, plainText, prevText, nextText);
        const storagePath = `v8/${lessonId}/section-${i}.mp3`;
        const publicUrl = await uploadToStorage(supabaseAdmin, audioBuffer, storagePath);
        const durationEstimate = estimateDuration(audioBuffer.byteLength);

        results.push({
          index: i,
          type: 'section',
          audioUrl: publicUrl,
          durationEstimate,
          sizeKB: Math.round(audioBuffer.byteLength / 1024),
        });

        console.log(`[v8-generate] ✅ Section ${i}: ${(audioBuffer.byteLength / 1024).toFixed(1)}KB (~${durationEstimate}s)`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[v8-generate] ❌ Section ${i} failed:`, msg);
        errors.push({ index: i, type: 'section', error: msg });
      }
    }

    // ─── 5. GENERATE AUDIO FOR QUIZZES ───
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];

      // Quiz question audio
      try {
        const questionText = quiz.question;
        const audioBuffer = await generateTTS(elevenLabsKey, questionText);
        const storagePath = `v8/${lessonId}/quiz-${i}.mp3`;
        const publicUrl = await uploadToStorage(supabaseAdmin, audioBuffer, storagePath);
        const durationEstimate = estimateDuration(audioBuffer.byteLength);

        results.push({
          index: i,
          type: 'quiz',
          audioUrl: publicUrl,
          durationEstimate,
          sizeKB: Math.round(audioBuffer.byteLength / 1024),
        });

        console.log(`[v8-generate] ✅ Quiz ${i}: ${(audioBuffer.byteLength / 1024).toFixed(1)}KB`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[v8-generate] ❌ Quiz ${i} failed:`, msg);
        errors.push({ index: i, type: 'quiz', error: msg });
      }

      // Quiz reinforcement audio (if exists)
      if (quiz.reinforcement?.trim()) {
        try {
          const audioBuffer = await generateTTS(elevenLabsKey, quiz.reinforcement);
          const storagePath = `v8/${lessonId}/quiz-${i}-reinforcement.mp3`;
          const publicUrl = await uploadToStorage(supabaseAdmin, audioBuffer, storagePath);
          const durationEstimate = estimateDuration(audioBuffer.byteLength);

          results.push({
            index: i,
            type: 'quiz-reinforcement',
            audioUrl: publicUrl,
            durationEstimate,
            sizeKB: Math.round(audioBuffer.byteLength / 1024),
          });

          console.log(`[v8-generate] ✅ Quiz ${i} reinforcement: ${(audioBuffer.byteLength / 1024).toFixed(1)}KB`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push({ index: i, type: 'quiz-reinforcement', error: msg });
        }
      }
    }

    // ─── 5b. GENERATE AUDIO FOR PLAYGROUNDS (narration field) ───
    for (let i = 0; i < playgrounds.length; i++) {
      const pg = playgrounds[i];
      const narrationText = pg.narration?.trim();
      if (!narrationText) {
        console.log(`[v8-generate] ⏭️ Skipping playground ${i} (no narration)`);
        continue;
      }

      try {
        const audioBuffer = await generateTTS(elevenLabsKey, narrationText);
        const storagePath = `v8/${lessonId}/playground-${i}.mp3`;
        const publicUrl = await uploadToStorage(supabaseAdmin, audioBuffer, storagePath);
        const durationEstimate = estimateDuration(audioBuffer.byteLength);

        results.push({
          index: i,
          type: 'playground' as any,
          audioUrl: publicUrl,
          durationEstimate,
          sizeKB: Math.round(audioBuffer.byteLength / 1024),
        });

        console.log(`[v8-generate] ✅ Playground ${i}: ${(audioBuffer.byteLength / 1024).toFixed(1)}KB`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[v8-generate] ❌ Playground ${i} failed:`, msg);
        errors.push({ index: i, type: 'playground', error: msg });
      }
    }

    // ─── 6. RESPONSE ───
    const elapsed = Date.now() - startTime;
    console.log(`[v8-generate] 🏁 Done in ${elapsed}ms: ${results.length} audios, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        lessonId,
        results,
        errors: errors.length > 0 ? errors : undefined,
        stats: {
          totalAudios: results.length,
          totalErrors: errors.length,
          totalSizeKB: results.reduce((sum, r) => sum + r.sizeKB, 0),
          elapsedMs: elapsed,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[v8-generate] ❌ Fatal:', msg);
    return jsonError(msg, 500);
  }
});

// ─── HELPERS ───

function jsonError(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateTTS(
  apiKey: string,
  text: string,
  previousText?: string,
  nextText?: string,
): Promise<ArrayBuffer> {
  const body: Record<string, unknown> = {
    text,
    model_id: MODEL_ID,
    output_format: 'mp3_44100_128',
    voice_settings: VOICE_SETTINGS,
  };

  // Note: previous_text/next_text (request stitching) is NOT supported with eleven_v3
  // Removed to avoid 400 errors

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${errorText.slice(0, 200)}`);
  }

  return await response.arrayBuffer();
}

async function uploadToStorage(
  supabase: any,
  audioBuffer: ArrayBuffer,
  path: string,
): Promise<string> {
  const uint8 = new Uint8Array(audioBuffer);

  const { error: uploadError } = await supabase.storage
    .from('lesson-audios')
    .upload(path, uint8.buffer as ArrayBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('lesson-audios')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

function stripMarkdownForTTS(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s*/g, '')           // headers
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // bold
    .replace(/\*([^*]+)\*/g, '$1')       // italic
    .replace(/`([^`]+)`/g, '$1')         // inline code
    .replace(/```[\s\S]*?```/g, '')      // code blocks
    .replace(/!\[.*?\]\(.*?\)/g, '')     // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links
    .replace(/^\s*[-*+]\s+/gm, '')       // list markers
    .replace(/^\s*\d+\.\s+/gm, '')       // ordered list markers
    .replace(/^\s*>\s+/gm, '')           // blockquotes
    .replace(/---+/g, '')                // hr
    .replace(/\n{3,}/g, '\n\n')          // excessive newlines
    .trim();
}

function estimateDuration(byteSize: number): number {
  // MP3 at 128kbps: ~16KB per second
  return Math.round(byteSize / 16000);
}
