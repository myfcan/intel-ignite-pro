// Edge function to generate and save secret-reveal audio via ElevenLabs
// This pre-generates the audio and stores it in Supabase Storage

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const VOICE_ID = "Xb7hH8MSUJpSbSDYk0k2"; // Alice - voz principal

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, narrationText } = await req.json();

    if (!lessonId || !narrationText) {
      throw new Error("lessonId e narrationText são obrigatórios");
    }

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY não configurada");
    }

    console.log(`[v7-generate-secret-audio] Gerando áudio para lesson ${lessonId}`);
    console.log(`[v7-generate-secret-audio] Texto: ${narrationText.substring(0, 50)}...`);

    // 1. Gerar áudio via ElevenLabs
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: narrationText,
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      throw new Error(`ElevenLabs error: ${ttsResponse.status} - ${errorText}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    console.log(`[v7-generate-secret-audio] Áudio gerado: ${audioBuffer.byteLength} bytes`);

    // 2. Conectar ao Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Upload para Supabase Storage
    const fileName = `secret-reveal-${lessonId}-${Date.now()}.mp3`;
    const filePath = `v7-secret-audio/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("lesson-audios")
      .upload(filePath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    // 4. Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from("lesson-audios")
      .getPublicUrl(filePath);

    const audioUrl = publicUrlData.publicUrl;
    console.log(`[v7-generate-secret-audio] Áudio salvo: ${audioUrl}`);

    // 5. Atualizar content da lesson com a URL do áudio do secret-reveal
    const { data: lesson, error: fetchError } = await supabase
      .from("lessons")
      .select("content")
      .eq("id", lessonId)
      .single();

    if (fetchError) {
      throw new Error(`Fetch lesson error: ${fetchError.message}`);
    }

    // Atualizar o content para incluir a URL do áudio do secret-reveal
    const content = lesson.content as Record<string, unknown>;
    const cinematicFlow = content.cinematic_flow as Record<string, unknown> || {};
    const acts = (cinematicFlow.acts as Array<Record<string, unknown>>) || [];

    // Encontrar o act secret-reveal e adicionar a URL do áudio
    const updatedActs = acts.map((act: Record<string, unknown>) => {
      if (act.id === "act-secret-reveal") {
        return {
          ...act,
          secretAudioUrl: audioUrl,
          interaction: {
            ...(act.interaction as Record<string, unknown> || {}),
            narrationAudioUrl: audioUrl,
          },
        };
      }
      return act;
    });

    // Atualizar o content
    const updatedContent = {
      ...content,
      cinematic_flow: {
        ...cinematicFlow,
        acts: updatedActs,
      },
    };

    const { error: updateError } = await supabase
      .from("lessons")
      .update({ content: updatedContent })
      .eq("id", lessonId);

    if (updateError) {
      throw new Error(`Update lesson error: ${updateError.message}`);
    }

    console.log(`[v7-generate-secret-audio] ✅ Lesson atualizada com áudio do secret-reveal`);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        message: "Áudio do secret-reveal gerado e salvo com sucesso",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[v7-generate-secret-audio] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
