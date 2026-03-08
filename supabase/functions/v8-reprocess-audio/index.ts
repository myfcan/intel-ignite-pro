import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * v8-reprocess-audio
 * 
 * Reprocessa áudio para uma aula V8 existente no banco de dados.
 * Lê o content da lição, extrai sections/quizzes/playgrounds,
 * gera áudio via ElevenLabs, e atualiza o content com as URLs.
 * 
 * Resolve o problema de aulas que ficaram sem áudio por interrupção
 * do pipeline frontend.
 * 
 * Input: { lessonId: string }
 * Output: { success, totalAudios, totalErrors, results[], updatedSections }
 */

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice Brasil
const MODEL_ID = 'eleven_v3';
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75 };

function jsonError(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sanitizeNarrationText(text: string): string {
  return text
    .replace(/(^|\n)\s*(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:[^\n]*(?=\n|$)/gi, '$1')
    .replace(/(^|\n)\s*(?:Responda rapidamente[^\n]*|Confie nos seus instintos[^\n]*|Sem pensar muito[^\n]*|Responda agora[^\n]*)(?=\n|$)/gi, '$1')
    .replace(/\[(?![^\]]*\]\()[^\]]{1,40}\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripMarkdownForTTS(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/>\s+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function generateAudio(
  text: string,
  apiKey: string,
  supabaseAdmin: any,
  lessonId: string,
  filePrefix: string,
): Promise<{ audioUrl: string; sizeKB: number; durationEstimate: number }> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        language_code: 'pt',
        voice_settings: VOICE_SETTINGS,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const sizeKB = Math.round(audioBuffer.byteLength / 1024);
  const durationEstimate = Math.round(text.split(/\s+/).length / 2.5);

  const timestamp = Date.now();
  const fileName = `v8/${lessonId}/${filePrefix}-${timestamp}.mp3`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('lesson-audios')
    .upload(fileName, new Uint8Array(audioBuffer), {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from('lesson-audios')
    .getPublicUrl(fileName);

  return { audioUrl: urlData.publicUrl, sizeKB, durationEstimate };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // ─── AUTH ───
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('Unauthorized', 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      return jsonError('ELEVENLABS_API_KEY not configured', 500);
    }

    const token = authHeader.replace('Bearer ', '');
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnonKey },
    });

    if (!userRes.ok) {
      await userRes.text();
      return jsonError('Invalid token', 401);
    }

    const userData = await userRes.json();
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey) as any;

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) return jsonError('Admin access required', 403);

    // ─── READ LESSON ───
    const { lessonId } = await req.json();
    if (!lessonId) return jsonError('lessonId is required', 400);

    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('id, title, content, model')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) return jsonError('Lesson not found', 404);
    if (lesson.model !== 'v8') return jsonError('Only V8 lessons supported', 400);

    const content = lesson.content;
    const sections = content.sections || [];
    const quizzes = content.inlineQuizzes || [];
    const playgrounds = content.inlinePlaygrounds || [];

    console.log(`[v8-reprocess-audio] 🔄 Reprocessing lesson ${lessonId}: ${sections.length} sections, ${quizzes.length} quizzes, ${playgrounds.length} playgrounds`);

    const results: any[] = [];
    const errors: any[] = [];
    const cacheBuster = `?t=${Date.now()}`;

    // ─── SECTIONS ───
    for (let i = 0; i < sections.length; i++) {
      const plainText = stripMarkdownForTTS(sanitizeNarrationText(sections[i].content || ''));
      if (!plainText.trim()) {
        console.log(`[v8-reprocess-audio] ⏭️ Skipping empty section ${i}`);
        continue;
      }

      try {
        const result = await generateAudio(
          plainText, ELEVENLABS_API_KEY, supabaseAdmin, lessonId, `section-${i}`
        );
        sections[i].audioUrl = result.audioUrl + cacheBuster;
        sections[i].audioDurationSeconds = result.durationEstimate;
        results.push({ index: i, type: 'section', ...result });
        console.log(`[v8-reprocess-audio] ✅ Section ${i}: ${result.sizeKB}KB`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[v8-reprocess-audio] ❌ Section ${i}:`, msg);
        errors.push({ index: i, type: 'section', error: msg });
      }
    }

    // ─── QUIZZES ───
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];

      // Quiz question audio
      if (quiz.question) {
        try {
          const result = await generateAudio(
            sanitizeNarrationText(quiz.question), ELEVENLABS_API_KEY, supabaseAdmin, lessonId, `quiz-${i}`
          );
          quizzes[i].audioUrl = result.audioUrl + cacheBuster;
          results.push({ index: i, type: 'quiz', ...result });
          console.log(`[v8-reprocess-audio] ✅ Quiz ${i}: ${result.sizeKB}KB`);
        } catch (err) {
          errors.push({ index: i, type: 'quiz', error: err instanceof Error ? err.message : String(err) });
        }
      }

      // Reinforcement
      if (quiz.reinforcement) {
        try {
          const result = await generateAudio(
            sanitizeNarrationText(quiz.reinforcement), ELEVENLABS_API_KEY, supabaseAdmin, lessonId, `quiz-${i}-reinforcement`
          );
          quizzes[i].reinforcementAudioUrl = result.audioUrl + cacheBuster;
          results.push({ index: i, type: 'quiz-reinforcement', ...result });
        } catch (err) {
          errors.push({ index: i, type: 'quiz-reinforcement', error: err instanceof Error ? err.message : String(err) });
        }
      }

      // Explanation
      if (quiz.explanation) {
        try {
          const result = await generateAudio(
            sanitizeNarrationText(quiz.explanation), ELEVENLABS_API_KEY, supabaseAdmin, lessonId, `quiz-${i}-explanation`
          );
          quizzes[i].explanationAudioUrl = result.audioUrl + cacheBuster;
          results.push({ index: i, type: 'quiz-explanation', ...result });
        } catch (err) {
          errors.push({ index: i, type: 'quiz-explanation', error: err instanceof Error ? err.message : String(err) });
        }
      }
    }

    // ─── PLAYGROUNDS ───
    for (let i = 0; i < playgrounds.length; i++) {
      const pg = playgrounds[i];

      if (pg.narration?.trim()) {
        try {
          const result = await generateAudio(
            sanitizeNarrationText(pg.narration), ELEVENLABS_API_KEY, supabaseAdmin, lessonId, `playground-${i}`
          );
          playgrounds[i].audioUrl = result.audioUrl + cacheBuster;
          results.push({ index: i, type: 'playground', ...result });
        } catch (err) {
          errors.push({ index: i, type: 'playground', error: err instanceof Error ? err.message : String(err) });
        }
      }

      if (pg.successMessage?.trim()) {
        try {
          const result = await generateAudio(
            sanitizeNarrationText(pg.successMessage), ELEVENLABS_API_KEY, supabaseAdmin, lessonId, `playground-${i}-success`
          );
          playgrounds[i].successAudioUrl = result.audioUrl + cacheBuster;
          results.push({ index: i, type: 'playground-success', ...result });
        } catch (err) {
          errors.push({ index: i, type: 'playground-success', error: err instanceof Error ? err.message : String(err) });
        }
      }

      if (pg.tryAgainMessage?.trim()) {
        try {
          const result = await generateAudio(
            sanitizeNarrationText(pg.tryAgainMessage), ELEVENLABS_API_KEY, supabaseAdmin, lessonId, `playground-${i}-tryagain`
          );
          playgrounds[i].tryAgainAudioUrl = result.audioUrl + cacheBuster;
          results.push({ index: i, type: 'playground-tryagain', ...result });
        } catch (err) {
          errors.push({ index: i, type: 'playground-tryagain', error: err instanceof Error ? err.message : String(err) });
        }
      }
    }

    // ─── UPDATE LESSON IN DB ───
    const updatedContent = {
      ...content,
      sections,
      inlineQuizzes: quizzes,
      inlinePlaygrounds: playgrounds,
    };

    const { error: updateError } = await supabaseAdmin
      .from('lessons')
      .update({ content: updatedContent })
      .eq('id', lessonId);

    if (updateError) {
      console.error('[v8-reprocess-audio] ❌ DB update failed:', updateError);
      return jsonError(`DB update failed: ${updateError.message}`, 500);
    }

    const elapsed = Date.now() - startTime;
    console.log(`[v8-reprocess-audio] 🏁 Done in ${elapsed}ms: ${results.length} audios, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        lessonId,
        lessonTitle: lesson.title,
        totalAudios: results.length,
        totalErrors: errors.length,
        elapsedMs: elapsed,
        results,
        errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[v8-reprocess-audio] ❌ Fatal:', msg);
    return jsonError(msg, 500);
  }
});
