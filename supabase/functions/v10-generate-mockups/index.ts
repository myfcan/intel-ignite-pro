import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMockupPrompt(
  barText: string,
  barSub: string,
  barColor: string,
  elements: Array<{ type: string; label?: string; placeholder?: string; text?: string; [key: string]: unknown }>,
  referoHint: string
): string {
  // Describe visible UI elements from the frame JSON
  const elementDescriptions = elements
    .map((el) => {
      switch (el.type) {
        case "input":
          return `- Input field: "${el.label || el.placeholder || "text input"}"`;
        case "select":
          return `- Dropdown/select: "${el.label || "select"}"`;
        case "button":
          return `- Button: "${el.text || el.label || "Submit"}"`;
        case "text":
          return `- Text: "${(el.text || "").slice(0, 60)}"`;
        case "table":
          return `- Data table`;
        case "chrome_header":
          return null; // handled by bar_text
        case "nav_breadcrumb":
          return `- Breadcrumb navigation`;
        case "image":
          return `- Image placeholder: "${el.alt || ""}"`;
        case "code_block":
          return `- Code block`;
        case "warning":
          return null; // not visible in mockup
        default:
          return el.label ? `- ${el.type}: "${el.label}"` : null;
      }
    })
    .filter(Boolean)
    .join("\n");

  return `Generate a clean mobile interface mockup screenshot for: ${barText} — showing the "${barSub}" screen.

UI Elements visible on this screen:
${elementDescriptions || "- Standard app interface with navigation and content area"}

${referoHint}

Style requirements:
- Clean, minimal UI mockup with real app styling
- Primary color: ${barColor || "#6366F1"}
- Format: 360x640px portrait, white background (#FFFFFF), rounded corners
- Show a mobile browser chrome bar at top with URL "${barText}"
- Realistic interface elements (inputs, buttons, dropdowns) — NOT wireframes
- ABSOLUTELY NO people, illustrations, decorative elements, or cartoons
- ABSOLUTELY NO text outside of UI labels and button text
- This is a UI MOCKUP — it should look like a real app screenshot
- Professional quality, clean edges, proper spacing
- OUTPUT SIZE: Generate the image at exactly 360x640 pixels (portrait)`;
}

function base64UrlToBytes(dataUrl: string): Uint8Array {
  const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function generateMockupImage(prompt: string): Promise<Uint8Array> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const MAX_RETRIES = 3;
  let lastError = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    console.log(`[v10-generate-mockups] Gemini attempt ${attempt + 1}/${MAX_RETRIES}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[v10-generate-mockups] Gemini error: ${response.status}`, errText);

      if (response.status === 429) {
        if (attempt < MAX_RETRIES - 1) {
          console.log(`[v10-generate-mockups] Rate limited, waiting 5s...`);
          await delay(5000);
          continue;
        }
        throw new Error("Rate limit exceeded. Try again in a few seconds.");
      }
      if (response.status === 402) {
        throw new Error("Credits exhausted. Add funds in Settings → Workspace → Usage.");
      }
      throw new Error(`Gemini returned ${response.status}`);
    }

    const data = await response.json();
    const base64Url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (base64Url) {
      console.log(`[v10-generate-mockups] Gemini returned image on attempt ${attempt + 1}`);
      return base64UrlToBytes(base64Url);
    }

    const textContent = data.choices?.[0]?.message?.content?.slice(0, 200) || "empty";
    lastError = `Gemini returned text-only: "${textContent}"`;
    console.warn(`[v10-generate-mockups] Attempt ${attempt + 1}: ${lastError}`);

    if (attempt < MAX_RETRIES - 1) {
      await delay(2000);
    }
  }

  throw new Error(`No image returned from Gemini after ${MAX_RETRIES} attempts. Last: ${lastError}`);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      pipeline_id,
      batch_size = 3,
      batch_index = 0,
    } = await req.json();

    if (!pipeline_id) {
      return new Response(
        JSON.stringify({ error: "pipeline_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch pipeline
    const { data: pipeline, error: pipelineError } = await supabase
      .from("v10_bpa_pipeline")
      .select("*")
      .eq("id", pipeline_id)
      .single();

    if (pipelineError || !pipeline) {
      return new Response(
        JSON.stringify({ error: "Pipeline not found", details: pipelineError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonId = (pipeline as any).lesson_id;
    if (!lessonId) {
      return new Response(
        JSON.stringify({ error: "Pipeline has no lesson_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch lesson steps
    const { data: steps, error: stepsError } = await supabase
      .from("v10_lesson_steps")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("step_number", { ascending: true });

    if (stepsError || !steps) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch steps", details: stepsError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Collect all frames needing mockups
    const framesToProcess: Array<{
      step: any;
      stepIdx: number;
      frameIdx: number;
      frame: any;
    }> = [];

    for (let si = 0; si < steps.length; si++) {
      const step = steps[si] as any;
      const frames = step.frames || [];
      for (let fi = 0; fi < frames.length; fi++) {
        const frame = frames[fi];
        if (!frame.mockup_url) {
          framesToProcess.push({ step, stepIdx: si, frameIdx: fi, frame });
        }
      }
    }

    const total = framesToProcess.length;
    console.log(`[v10-generate-mockups] ${total} frames need mockups out of ${steps.length} steps`);

    // 4. Apply batching
    const startIdx = batch_index * batch_size;
    const batchFrames = framesToProcess.slice(startIdx, startIdx + batch_size);
    const hasMoreBatches = startIdx + batch_size < total;

    console.log(`[v10-generate-mockups] Batch ${batch_index}: processing ${batchFrames.length} frames`);

    // 5. Import Refero client
    let searchScreens: ((q: string, l?: number) => Promise<{ screens: any[]; total: number }>) | null = null;
    try {
      const referoModule = await import("../_shared/refero.ts");
      searchScreens = referoModule.searchScreens;
    } catch (err) {
      console.warn("[v10-generate-mockups] Refero client not available:", err);
    }

    let success = 0;
    let failed = 0;
    let referoUsed = 0;

    // 6. Process each frame
    for (const { step, frameIdx, frame } of batchFrames) {
      try {
        const barText = frame.bar_text || "app";
        const barSub = frame.bar_sub || "main screen";
        const barColor = frame.bar_color || "#6366F1";
        const elements = frame.elements || [];

        // Query Refero for reference
        let referoHint = "";
        if (searchScreens) {
          try {
            const refResult = await searchScreens(`${barText} ${barSub}`, 3);
            if (refResult.total > 0) {
              const screenNames = refResult.screens.map((s: any) => s.screen_name || s.app_name).filter(Boolean).join(", ");
              referoHint = `Reference: ${refResult.total} real screenshots found in Refero database for "${barText}". Examples: ${screenNames}. Use these as visual reference for accuracy.`;
              referoUsed++;
            }
          } catch {
            // Refero query failed, continue without
          }
        }

        const prompt = buildMockupPrompt(barText, barSub, barColor, elements, referoHint);
        console.log(`[v10-generate-mockups] Generating mockup for step ${step.step_number}, frame ${frameIdx}...`);

        const imageBytes = await generateMockupImage(prompt);

        // Upload to Storage
        const storagePath = `v10-mockups/${lessonId}/step_${step.step_number}_frame_${frameIdx}.png`;
        const { error: uploadError } = await supabase.storage
          .from("lesson-audios")
          .upload(storagePath, imageBytes.buffer as ArrayBuffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from("lesson-audios")
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;
        console.log(`[v10-generate-mockups] Uploaded: ${publicUrl}`);

        // Update frame's mockup_url
        const updatedFrames = [...(step.frames || [])];
        updatedFrames[frameIdx] = { ...updatedFrames[frameIdx], mockup_url: publicUrl };

        const { error: updateError } = await supabase
          .from("v10_lesson_steps")
          .update({ frames: updatedFrames })
          .eq("id", step.id);

        if (updateError) {
          console.error(`[v10-generate-mockups] Failed to update step:`, updateError);
        }

        // Also update local reference for subsequent frames of same step
        step.frames = updatedFrames;
        success++;

        await delay(2000);
      } catch (err) {
        console.error(`[v10-generate-mockups] Failed step ${step.step_number}, frame ${frameIdx}:`, err);
        failed++;

        await supabase.from("v10_bpa_pipeline_log").insert({
          pipeline_id,
          stage: 3,
          action: "generate-mockups:error",
          details: { message: `Step ${step.step_number}, frame ${frameIdx}: ${(err as Error).message}` },
        });

        await delay(1000);
      }
    }

    // 7. Update pipeline counters
    const totalWithMockups = (steps as any[]).reduce((sum, s) => {
      return sum + ((s.frames || []) as any[]).filter((f: any) => f.mockup_url).length;
    }, 0);

    const totalFramesAll = (steps as any[]).reduce((sum, s) => {
      return sum + ((s.frames || []) as any[]).length;
    }, 0);

    const updatePayload: any = {
      mockups_total: totalFramesAll,
      mockups_from_refero: ((pipeline as any).mockups_from_refero || 0) + referoUsed,
    };

    await supabase
      .from("v10_bpa_pipeline")
      .update(updatePayload)
      .eq("id", pipeline_id);

    // 8. Log completion
    await supabase.from("v10_bpa_pipeline_log").insert({
      pipeline_id,
      stage: 3,
      action: "generate-mockups:completed",
      details: {
        message: `Batch ${batch_index}: ${success} succeeded, ${failed} failed out of ${batchFrames.length} frames (total needing mockups: ${total})`,
        refero_used: referoUsed,
        total_frames: totalFramesAll,
        total_with_mockups: totalWithMockups,
      },
    });

    const stats = {
      total,
      processed: batchFrames.length,
      success,
      failed,
      hasMoreBatches,
      referoUsed,
    };

    console.log(`[v10-generate-mockups] Done: ${JSON.stringify(stats)}`);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[v10-generate-mockups] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
