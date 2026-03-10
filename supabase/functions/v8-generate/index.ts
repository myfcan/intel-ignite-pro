import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── ElevenLabs config ───
// CRITICAL: eleven_v3 prevents accent drift to PT-PT on sequential requests
// See memory: elevenlabs-model-and-sanitization-standard-v2
const VOICE_ID = 'oqUwsXKac3MSo4E51ySV'; // Taciana PT-BR nativa (professional)
const MODEL_ID = 'eleven_v3';
const VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.75,
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
    successMessage?: string;
    tryAgainMessage?: string;
  }>;
}

interface AudioResult {
  index: number;
  type: 'section' | 'quiz' | 'quiz-reinforcement' | 'playground';
  audioUrl: string;
  durationEstimate: number;
  sizeKB: number;
}

function sanitizeNarrationText(text: string): string {
  return text
    .replace(/(^|\n)\s*(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:[^\n]*(?=\n|$)/gi, '$1')
    .replace(/(^|\n)\s*(?:Responda rapidamente[^\n]*|Confie nos seus instintos[^\n]*|Sem pensar muito[^\n]*|Responda agora[^\n]*)(?=\n|$)/gi, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
      // Strip markdown for TTS + pedagogical sanitization
      const plainText = stripMarkdownForTTS(sanitizeNarrationText(section.content || ''));
      if (!plainText.trim()) {
        console.log(`[v8-generate] ⏭️ Skipping empty section ${i}`);
        continue;
      }

      try {
        const audioBuffer = await generateTTS(elevenLabsKey, plainText);
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
          const questionText = sanitizeNarrationText(quiz.question || '');
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
          const audioBuffer = await generateTTS(elevenLabsKey, sanitizeNarrationText(quiz.reinforcement));
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

      // Quiz explanation audio (feedback after answer)
      if (quiz.explanation?.trim()) {
        try {
          const audioBuffer = await generateTTS(elevenLabsKey, sanitizeNarrationText(quiz.explanation));
          const storagePath = `v8/${lessonId}/quiz-${i}-explanation.mp3`;
          const publicUrl = await uploadToStorage(supabaseAdmin, audioBuffer, storagePath);
          const durationEstimate = estimateDuration(audioBuffer.byteLength);

          results.push({
            index: i,
            type: 'quiz-explanation',
            audioUrl: publicUrl,
            durationEstimate,
            sizeKB: Math.round(audioBuffer.byteLength / 1024),
          });

          console.log(`[v8-generate] ✅ Quiz ${i} explanation: ${(audioBuffer.byteLength / 1024).toFixed(1)}KB`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push({ index: i, type: 'quiz-explanation', error: msg });
        }
      }
    }

    // ─── 5b. GENERATE AUDIO FOR PLAYGROUNDS (narration field) ───
    for (let i = 0; i < playgrounds.length; i++) {
      const pg = playgrounds[i];
      const narrationText = sanitizeNarrationText(pg.narration?.trim() || '');
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
          type: 'playground',
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

      // Playground successMessage audio
      if (pg.successMessage?.trim()) {
        try {
          const audioBuffer = await generateTTS(elevenLabsKey, sanitizeNarrationText(pg.successMessage));
          const storagePath = `v8/${lessonId}/playground-${i}-success.mp3`;
          const publicUrl = await uploadToStorage(supabaseAdmin, audioBuffer, storagePath);
          const durationEstimate = estimateDuration(audioBuffer.byteLength);

          results.push({
            index: i,
            type: 'playground-success',
            audioUrl: publicUrl,
            durationEstimate,
            sizeKB: Math.round(audioBuffer.byteLength / 1024),
          });

          console.log(`[v8-generate] ✅ Playground ${i} success: ${(audioBuffer.byteLength / 1024).toFixed(1)}KB`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push({ index: i, type: 'playground-success', error: msg });
        }
      }

      // Playground tryAgainMessage audio
      if (pg.tryAgainMessage?.trim()) {
        try {
          const audioBuffer = await generateTTS(elevenLabsKey, sanitizeNarrationText(pg.tryAgainMessage));
          const storagePath = `v8/${lessonId}/playground-${i}-tryagain.mp3`;
          const publicUrl = await uploadToStorage(supabaseAdmin, audioBuffer, storagePath);
          const durationEstimate = estimateDuration(audioBuffer.byteLength);

          results.push({
            index: i,
            type: 'playground-tryagain',
            audioUrl: publicUrl,
            durationEstimate,
            sizeKB: Math.round(audioBuffer.byteLength / 1024),
          });

          console.log(`[v8-generate] ✅ Playground ${i} tryAgain: ${(audioBuffer.byteLength / 1024).toFixed(1)}KB`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push({ index: i, type: 'playground-tryagain', error: msg });
        }
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
): Promise<ArrayBuffer> {
  const body: Record<string, unknown> = {
    text: text,
    model_id: MODEL_ID,
    language_code: 'pt',
    voice_settings: VOICE_SETTINGS,
  };

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
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

// ElevenLabs v3 emotion tags that should be preserved in TTS text
const ELEVENLABS_EMOTION_TAGS = new Set([
  'excited', 'calm', 'nervous', 'frustrated', 'serious', 'cheerful',
  'empathetic', 'assertive', 'dramatic tone', 'reflective', 'hopeful',
  'energetic', 'thoughtful', 'warm', 'encouraging', 'curious',
  'sigh', 'laughs', 'whispers', 'gasps', 'clears throat',
  'pause', 'rushed', 'slows down', 'hesitates', 'long pause',
]);

function stripMarkdownForTTS(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s*/g, '')           // headers
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // bold
    .replace(/\*([^*]+)\*/g, '$1')       // italic
    .replace(/`([^`]+)`/g, '$1')         // inline code
    .replace(/```[\s\S]*?```/g, '')      // code blocks
    .replace(/!\[.*?\]\(.*?\)/g, '')     // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links (keep text, remove url)
    .replace(/^\s*[-*+]\s+/gm, '')       // list markers
    .replace(/^\s*\d+\.\s+/gm, '')       // ordered list markers
    .replace(/^\s*>\s+/gm, '')           // blockquotes
    .replace(/---+/g, '')                // hr
    .replace(/\n{3,}/g, '\n\n')          // excessive newlines
    // Strip bracket tags EXCEPT ElevenLabs emotion tags
    .replace(/\[([^\]]{1,40})\]/gi, (match, inner) => {
      return ELEVENLABS_EMOTION_TAGS.has(inner.toLowerCase().trim()) ? match : '';
    })
    .trim();
}

function estimateDuration(byteSize: number): number {
  // MP3 at 128kbps: ~16KB per second
  return Math.round(byteSize / 16000);
}
