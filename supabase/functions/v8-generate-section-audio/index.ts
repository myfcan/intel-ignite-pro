import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VOICE_ID = 'oqUwsXKac3MSo4E51ySV';
const MODEL_ID = 'eleven_v3';
const VOICE_SETTINGS = { stability: 0.75, similarity_boost: 0.75 };
const AUDIO_PREFIX_TAG = '[Brazilian Portuguese accent] ';

// ElevenLabs v3 emotion tags preserved in TTS text
const ELEVENLABS_EMOTION_TAGS = new Set([
  'excited', 'calm', 'nervous', 'frustrated', 'serious', 'cheerful',
  'empathetic', 'assertive', 'dramatic tone', 'reflective', 'hopeful',
  'energetic', 'thoughtful', 'warm', 'encouraging', 'curious',
  'sigh', 'laughs', 'whispers', 'gasps', 'clears throat',
  'pause', 'rushed', 'slows down', 'hesitates', 'long pause',
  // PT-BR tags
  'animado', 'calmo', 'nervoso', 'frustrado', 'sério', 'alegre',
  'empático', 'assertivo', 'reflexivo', 'esperançoso',
  'energético', 'pensativo', 'acolhedor', 'encorajador', 'curioso',
  'suspiro', 'risos', 'sussurra', 'pausa', 'hesita', 'pausa longa',
]);

interface RequestBody {
  lessonId: string;
  type: 'section' | 'quiz' | 'quiz-reinforcement' | 'quiz-explanation' | 'playground' | 'playground-success' | 'playground-tryagain';
  index: number;
  text: string;
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
    const { lessonId, type, index, text } = body;

    if (!lessonId || !text?.trim() || type === undefined || index === undefined) {
      return jsonError('lessonId, type, index, and text are required', 400);
    }

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY_1') || Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsKey) {
      return jsonError('ElevenLabs API key not configured', 500);
    }

    // Clean text for TTS
    const cleanText = stripMarkdownForTTS(sanitizeNarrationText(text));
    if (!cleanText.trim()) {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'empty text after sanitization' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate TTS
    console.log(`[v8-section-audio] 🎵 ${type} ${index} for ${lessonId.slice(0, 8)}... (${cleanText.length} chars)`);

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': elevenLabsKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${AUDIO_PREFIX_TAG}${cleanText}`,
          model_id: MODEL_ID,
          voice_settings: VOICE_SETTINGS,
        }),
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
    .replace(/\[([^\]]{1,40})\]/gi, (match, inner) => {
      return ELEVENLABS_EMOTION_TAGS.has(inner.toLowerCase().trim()) ? match : '';
    })
    .trim();
}
