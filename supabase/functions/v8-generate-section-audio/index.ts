import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
const MODEL_ID = 'eleven_multilingual_v2';
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true };

interface RequestBody {
  lessonId: string;
  type: 'section' | 'quiz' | 'quiz-reinforcement' | 'quiz-explanation' | 'playground' | 'playground-success' | 'playground-tryagain';
  index: number;
  text: string;
  previousText?: string;
  nextText?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('Unauthorized', 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return jsonError('Admin access required', 403);
    }

    // Parse input
    const body: RequestBody = await req.json();
    const { lessonId, type, index, text, previousText, nextText } = body;

    if (!lessonId || !text?.trim() || type === undefined || index === undefined) {
      return jsonError('lessonId, type, index, and text are required', 400);
    }

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY_1') || Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsKey) {
      return jsonError('ElevenLabs API key not configured', 500);
    }

    // Clean text for TTS — strip ALL bracket tags (v2 ignores audio tags)
    const cleanText = stripAllBracketTags(stripMarkdownForTTS(sanitizeNarrationText(text)));
    const speakableText = cleanText.replace(/\s+/g, ' ').trim();
    if (!speakableText || speakableText.length < 10) {
      console.log(`[v8-section-audio] ⏭️ Skipping ${type} ${index}: only ${speakableText.length} speakable chars`);
      return new Response(
        JSON.stringify({ skipped: true, reason: `only ${speakableText.length} speakable chars after sanitization` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate TTS with request stitching
    console.log(`[v8-section-audio] 🎵 ${type} ${index} for ${lessonId.slice(0, 8)}... (${cleanText.length} chars, model: ${MODEL_ID})`);

    const ttsBody: Record<string, unknown> = {
      text: cleanText,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    };

    // Request stitching: provide context from adjacent sections
    if (previousText?.trim()) {
      ttsBody.previous_text = extractStitchingContext(previousText, 'tail');
    }
    if (nextText?.trim()) {
      ttsBody.next_text = extractStitchingContext(nextText, 'head');
    }

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': elevenLabsKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(ttsBody),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      throw new Error(`ElevenLabs ${ttsResponse.status}: ${errorText.slice(0, 200)}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    // Upload to storage
    const storagePath = `v8/${lessonId}/${type}-${index}.mp3`;
    const uint8 = new Uint8Array(audioBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('lesson-audios')
      .upload(storagePath, uint8.buffer as ArrayBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('lesson-audios')
      .getPublicUrl(storagePath);

    const durationEstimate = Math.round(audioBuffer.byteLength / 16000);
    const sizeKB = Math.round(audioBuffer.byteLength / 1024);
    const elapsed = Date.now() - startTime;

    console.log(`[v8-section-audio] ✅ ${type} ${index}: ${sizeKB}KB (~${durationEstimate}s) in ${elapsed}ms`);

    return new Response(
      JSON.stringify({
        index,
        type,
        audioUrl: urlData.publicUrl,
        durationEstimate,
        sizeKB,
        elapsedMs: elapsed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[v8-section-audio] ❌', msg);
    return jsonError(msg, 500);
  }
});

function jsonError(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function sanitizeNarrationText(text: string): string {
  return text
    .replace(/(^|\n)\s*(?:Segmento\s+vida\s+real\s+desta\s+atividade|Atividade\s+prática|Atividade\s+pratica|Contexto\s+real)\s*:[^\n]*(?=\n|$)/gi, '$1')
    .replace(/(^|\n)\s*(?:Responda rapidamente[^\n]*|Confie nos seus instintos[^\n]*|Sem pensar muito[^\n]*|Responda agora[^\n]*)(?=\n|$)/gi, '$1')
    .replace(/[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0600-\u06FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\u0E00-\u0E7F\uAC00-\uD7AF]/g, '')
    // Convert SSML <break> tags to natural punctuation (v2 doesn't support SSML)
    .replace(/<break\s+time\s*=\s*["']?(\d*\.?\d+)s["']?\s*\/?>/gi, (_match, seconds) => {
      const s = parseFloat(seconds);
      if (s >= 0.8) return '...';   // long pause → ellipsis
      if (s >= 0.4) return ', ...';  // medium pause → comma + ellipsis
      return ', ';                    // short pause → comma
    })
    // Strip any remaining SSML tags
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripMarkdownForTTS(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/---+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Strip ALL bracket tags — v2 does not support audio tags */
function stripAllBracketTags(text: string): string {
  return text
    .replace(/\[([^\]]{1,40})\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Extract ~3 sentences for request stitching context.
 * 'tail' = last 3 sentences (for previous_text)
 * 'head' = first 3 sentences (for next_text)
 */
function extractStitchingContext(text: string, position: 'head' | 'tail'): string {
  const clean = stripAllBracketTags(stripMarkdownForTTS(sanitizeNarrationText(text)));
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5);
  if (sentences.length === 0) return '';
  const slice = position === 'tail'
    ? sentences.slice(-3)
    : sentences.slice(0, 3);
  return slice.join(' ').slice(0, 500);
}
