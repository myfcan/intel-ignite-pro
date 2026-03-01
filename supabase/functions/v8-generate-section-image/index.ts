import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildAutoPrompt(content: string): string {
  const cleaned = content
    .replace(/^#{1,3}\s+.*$/gm, "")
    .replace(/[*_`~\[\]()>]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).slice(0, 150).join(" ");
  return `Create a single isolated 3D illustration object representing this educational concept: ${words}.

Style requirements:
- Modern flat 3D render, clean and minimal
- Single object or small composition, centered
- CLEAN SOLID WHITE BACKGROUND (#FFFFFF), no patterns, no gradients, no grid
- Soft gradients on the object, smooth surfaces, rounded edges
- Vibrant but not neon colors (indigo, violet, sky blue, warm tones)
- No text, no labels, no UI elements in the image
- Think Apple/Notion style icons: polished, friendly, professional
- Subtle soft shadow underneath the object for depth
- The object should be large and fill most of the frame`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, content, customPrompt, lessonId, sectionIndex } = await req.json();

    if (!mode || !lessonId || sectionIndex === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields: mode, lessonId, sectionIndex" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build prompt
    let prompt: string;
    if (mode === "auto") {
      if (!content) {
        return new Response(JSON.stringify({ error: "Content is required for auto mode" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      prompt = buildAutoPrompt(content);
    } else if (mode === "custom") {
      if (!customPrompt) {
        return new Response(JSON.stringify({ error: "customPrompt is required for custom mode" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      prompt = `Create a 3D illustration based on this description: ${customPrompt}.

Style: modern flat 3D render, single isolated object, CLEAN SOLID WHITE BACKGROUND (#FFFFFF) with no patterns or grid, soft gradients on object, smooth surfaces, vibrant colors, no text in image, polished and professional like Apple/Notion icons. Object should be large and fill most of the frame.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid mode. Use 'auto' or 'custom'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[v8-generate-section-image] mode=${mode}, lessonId=${lessonId}, section=${sectionIndex}`);

    // Generate image via Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`[v8-generate-section-image] AI gateway error: ${aiResponse.status}`, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a few seconds." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const finalBase64Url = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!finalBase64Url) {
      console.error("[v8-generate-section-image] No image in AI response:", JSON.stringify(aiData).slice(0, 500));
      throw new Error("No image returned from AI gateway");
    }

    // Extract base64 data and convert to bytes
    const mimeMatch = finalBase64Url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    if (!mimeMatch) {
      throw new Error("Invalid image format returned from AI gateway");
    }

    const mimeType = mimeMatch[1];
    const fileExtension = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
    const base64Data = finalBase64Url.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const storagePath = `v8-images/${lessonId}/section-${sectionIndex}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("lesson-audios")
      .upload(storagePath, bytes.buffer as ArrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[v8-generate-section-image] Upload error:", uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("lesson-audios")
      .getPublicUrl(storagePath);

    console.log(`[v8-generate-section-image] Success: ${urlData.publicUrl}`);

    return new Response(JSON.stringify({ imageUrl: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[v8-generate-section-image] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
