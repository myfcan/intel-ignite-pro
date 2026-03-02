import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildAutoPrompt(content: string, allowText = false): string {
  const cleaned = content
    .replace(/^#{1,3}\s+.*$/gm, "")
    .replace(/[*_`~\[\]()>]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).slice(0, 150).join(" ");

  const textRule = allowText
    ? `- Text in the image is ALLOWED but MUST be written in Brazilian Portuguese (pt-BR). Never use English.
- Use clean, legible sans-serif typography integrated into the 3D style
- Examples: "Inteligência Artificial" (not "Artificial Intelligence"), "Como funciona" (not "How it works")`
    : `- NEVER include text, labels, banners, arrows, or UI elements inside the image`;

  return `Create a single isolated 3D illustration object representing this educational concept: ${words}.

Style requirements:
- Modern flat 3D render, clean and minimal
- Single iconic 3D object only — NO diagrams, flowcharts, arrows, or multi-step sequences
- Maximum 1 to 3 visual elements total, tightly composed as ONE unit
- The main object must fill 85-95% of the frame — almost NO padding around it
- CLEAN SOLID WHITE BACKGROUND (#FFFFFF)
- Soft gradients, smooth surfaces, rounded edges
- Vibrant but not neon colors (indigo, violet, sky blue, warm tones)
- Think Apple/Notion style icons: polished, friendly, professional
- Subtle shadow underneath the object for depth
${textRule}
- NEVER create infographic-style, diagram-style, or flowchart-style compositions
- NEVER scatter many small objects — always ONE cohesive central object
- IMPORTANT: Compose the image in a SQUARE (1:1) orientation
- OUTPUT SIZE: Generate the image at exactly 1024x1024 pixels (1:1 square)
- The composition must be centered and fill the frame
- LANGUAGE RULE: If any text, label, word, or phrase appears in the image, it MUST be written in Brazilian Portuguese (pt-BR). Never use English or any other language.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, content, customPrompt, lessonId, sectionIndex, allowText } = await req.json();

    if (!mode || !lessonId || sectionIndex === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields: mode, lessonId, sectionIndex" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    // Build prompt
    let prompt: string;
    if (mode === "auto") {
      if (!content) {
        return new Response(JSON.stringify({ error: "Content is required for auto mode" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      prompt = buildAutoPrompt(content, allowText === true);
    } else if (mode === "custom") {
      if (!customPrompt) {
        return new Response(JSON.stringify({ error: "customPrompt is required for custom mode" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const customTextRule = allowText === true
        ? `Text in the image is ALLOWED but MUST be in Brazilian Portuguese (pt-BR). Use clean sans-serif typography.`
        : `NO text, labels, banners, arrows.`;
      prompt = `Create a 3D illustration based on this description: ${customPrompt}.

Style: modern flat 3D render, single iconic object only, CLEAN SOLID WHITE BACKGROUND (#FFFFFF), soft gradients, smooth surfaces, vibrant colors (indigo, violet, sky blue). Maximum 1-3 visual elements composed as ONE cohesive unit. The main object must fill 85-95% of the frame with almost NO padding. ${customTextRule} NO diagrams, flowcharts, or infographic-style compositions. NO scattered small objects. Polished and professional like Apple/Notion icons. IMPORTANT: Compose in SQUARE (1:1) orientation. OUTPUT SIZE: 1024x1024 pixels (1:1 square). The composition must be centered and fill the frame. LANGUAGE RULE: If any text appears, it MUST be in Brazilian Portuguese (pt-BR). Never use English.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid mode. Use 'auto' or 'custom'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[v8-generate-section-image] STEP 1: Gemini generation | mode=${mode}, section=${sectionIndex}`);

    // ── STEP 1: Generate with Gemini (best style for Coursiv) ──
    const geminiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error(`[v8-generate-section-image] Gemini error: ${geminiResponse.status}`, errText);

      if (geminiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a few seconds." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (geminiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Gemini returned ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const geminiBase64Url = geminiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!geminiBase64Url) {
      console.error("[v8-generate-section-image] No image from Gemini:", JSON.stringify(geminiData).slice(0, 500));
      throw new Error("No image returned from Gemini");
    }

    console.log(`[v8-generate-section-image] STEP 2: GPT background removal | section=${sectionIndex}`);

    // ── STEP 2: Remove background with GPT gpt-image-1 (real alpha transparency) ──
    const gptResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: await buildEditFormData(geminiBase64Url),
    });

    let finalPngBytes: Uint8Array;

    if (gptResponse.ok) {
      const gptData = await gptResponse.json();
      const gptBase64 = gptData.data?.[0]?.b64_json;

      if (gptBase64) {
        console.log("[v8-generate-section-image] GPT cleanup succeeded — real transparent PNG");
        const binaryString = atob(gptBase64);
        finalPngBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          finalPngBytes[i] = binaryString.charCodeAt(i);
        }
      } else {
        console.warn("[v8-generate-section-image] GPT returned no image, falling back to Gemini original");
        finalPngBytes = base64UrlToBytes(geminiBase64Url);
      }
    } else {
      const errText = await gptResponse.text();
      console.warn(`[v8-generate-section-image] GPT cleanup failed (${gptResponse.status}), using Gemini fallback:`, errText);
      finalPngBytes = base64UrlToBytes(geminiBase64Url);
    }

    // ── STEP 3: Upload to storage ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const storagePath = `v8-images/${lessonId}/section-${sectionIndex}.png`;

    const { error: uploadError } = await supabase.storage
      .from("lesson-audios")
      .upload(storagePath, finalPngBytes.buffer as ArrayBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("[v8-generate-section-image] Upload error:", uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

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

// ── Helpers ──

function base64UrlToBytes(dataUrl: string): Uint8Array {
  const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function buildEditFormData(geminiBase64Url: string): Promise<FormData> {
  // Convert Gemini base64 data URL to a File for the multipart form
  const imageBytes = base64UrlToBytes(geminiBase64Url);
  const imageBlob = new Blob([imageBytes], { type: "image/png" });
  const imageFile = new File([imageBlob], "input.png", { type: "image/png" });

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("image", imageFile);
  form.append("prompt", "Remove the background from this image completely. Keep only the main object/illustration with a fully transparent background. Preserve all colors, details and style of the object exactly as they are. Output as PNG with real alpha transparency channel.");
  form.append("size", "1024x1024");
  form.append("response_format", "b64_json");

  return form;
}
