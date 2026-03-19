import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildImagePrompt(
  stepTitle: string,
  stepDescription: string,
  altText: string,
  appName?: string
): string {
  const context = [stepTitle, stepDescription, altText]
    .filter(Boolean)
    .join(". ");
  const toolContext = appName ? `The tool/app shown is "${appName}".` : "";
  return `Generate a realistic UI screenshot mockup of a software interface: ${context}.
${toolContext}

This should look like an actual screenshot of the tool's web interface.

Style requirements:
- Realistic flat UI screenshot of a modern web application / SaaS tool
- Show actual interface elements: navigation bar, sidebar, buttons, input fields, tables, cards
- Use realistic colors and layouts matching modern SaaS tools (white backgrounds, subtle borders, professional typography)
- Include placeholder text in interface elements that matches the tool's purpose
- Clean, professional, pixel-perfect quality
- CLEAN SOLID WHITE BACKGROUND behind the browser chrome
- NO flowcharts, NO diagrams, NO arrows between icons
- NO abstract representations — show the ACTUAL interface as a user would see it
- NO people, characters, or human figures
- NO 3D rendering, NO gradients on the background
- IMPORTANT: 16:9 LANDSCAPE orientation
- OUTPUT SIZE: exactly 1024x576 pixels (16:9 landscape)
- The screenshot should be centered and fill 90% of the frame`;
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

async function generateImageGemini(prompt: string): Promise<Uint8Array> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const MAX_RETRIES = 3;
  let lastError = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    console.log(`[v10-generate-images] Gemini attempt ${attempt + 1}/${MAX_RETRIES}`);

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
      console.error(`[v10-generate-images] Gemini error: ${response.status}`, errText);

      if (response.status === 429) {
        if (attempt < MAX_RETRIES - 1) {
          console.log(`[v10-generate-images] Rate limited, waiting 5s...`);
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
      console.log(`[v10-generate-images] Gemini returned image on attempt ${attempt + 1}`);
      return base64UrlToBytes(base64Url);
    }

    // Text-only response
    const textContent = data.choices?.[0]?.message?.content?.slice(0, 200) || "empty";
    lastError = `Gemini returned text-only: "${textContent}"`;
    console.warn(`[v10-generate-images] Attempt ${attempt + 1}: ${lastError}`);

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
    // Auth: require admin/supervisor role
    const { requireAdmin } = await import("../_shared/auth.ts");
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      pipeline_id,
      batch_size = 2,
      batch_index = 0,
      step_ids,
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

    // 2. Check lesson_id
    const lessonId = pipeline.lesson_id;
    if (!lessonId) {
      return new Response(
        JSON.stringify({ error: "Pipeline has no lesson_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch all steps ordered by step_number
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

    // DIAGNOSTIC LOG: steps fetched from DB
    console.log(`[v10-generate-images] lesson_id=${lessonId} | steps fetched from DB: ${steps.length}`);
    for (const s of steps) {
      const frames = (s as any).frames || [];
      const elementTypes = frames.flatMap((f: any) => (f.elements || []).map((e: any) => e.type));
      console.log(`[v10-generate-images]   step ${(s as any).step_number} "${(s as any).title}" | elements: [${elementTypes.join(", ")}]`);
    }

    // 4. Filter steps — if step_ids provided, use only those; otherwise filter by needing images
    let stepsToProcess: any[];

    if (step_ids && Array.isArray(step_ids) && step_ids.length > 0) {
      // Targeted regeneration: process only specified steps regardless of current src
      stepsToProcess = steps.filter((s: any) => step_ids.includes(s.id));
      // For targeted regen, clear existing image src so it gets regenerated
      for (const step of stepsToProcess) {
        const frames = (step as any).frames || [];
        for (const frame of frames) {
          if (!frame.elements) continue;
          for (const el of frame.elements) {
            if (el.type === "image") {
              el.src = ""; // Force re-generation
            }
          }
        }
      }
      console.log(`[v10-generate-images] Targeted mode: ${stepsToProcess.length} steps from step_ids=[${step_ids.join(",")}]`);
    } else {
      // Process ALL steps: inject image element if missing, then filter for empty src
      for (const step of steps) {
        const frames = (step as any).frames;
        if (!frames || !Array.isArray(frames) || frames.length === 0) continue;

        // Check if any frame already has an image element
        let hasImageElement = false;
        for (const frame of frames) {
          if (!frame.elements || !Array.isArray(frame.elements)) continue;
          for (const el of frame.elements) {
            if (el.type === "image") {
              hasImageElement = true;
              break;
            }
          }
          if (hasImageElement) break;
        }

        // If no image element exists, inject one into the first frame
        if (!hasImageElement) {
          const firstFrame = frames[0];
          if (!firstFrame.elements) firstFrame.elements = [];
          firstFrame.elements.push({
            type: "image",
            src: "",
            alt: (step as any).title || "Ilustração do passo",
            width: 1024,
            height: 576,
          });
          console.log(`[v10-generate-images] Injected image element into step ${(step as any).step_number}`);
        }
      }

      // Now filter for steps with empty image src
      stepsToProcess = steps.filter((step: any) => {
        const frames = step.frames;
        if (!frames || !Array.isArray(frames) || frames.length === 0) return false;

        for (const frame of frames) {
          const elements = frame.elements;
          if (!elements || !Array.isArray(elements)) continue;
          for (const el of elements) {
            if (el.type === "image" && (!el.src || el.src === "" || el.src.startsWith("placeholder"))) {
              return true;
            }
          }
        }
        return false;
      });
    }

    const total = stepsToProcess.length;

    // DIAGNOSTIC LOG: filter result
    console.log(`[v10-generate-images] stepsNeedingImages: ${total} out of ${steps.length} total steps`);

    // 5. Apply batching (skip batching for targeted mode)
    let batchSteps: any[];
    let hasMoreBatches: boolean;
    let batchStartIdx = 0;
    if (step_ids && step_ids.length > 0) {
      batchSteps = stepsToProcess;
      hasMoreBatches = false;
    } else {
      batchStartIdx = batch_index * batch_size;
      batchSteps = stepsToProcess.slice(batchStartIdx, batchStartIdx + batch_size);
      hasMoreBatches = batchStartIdx + batch_size < total;
    }

    console.log(`[v10-generate-images] Batch ${batch_index}: processing ${batchSteps.length} steps (startIdx=${batchStartIdx}, batch_size=${batch_size})`);

    let success = 0;
    let failed = 0;

    // 6. Process each step sequentially (NO injection — only process existing image elements)
    for (const step of batchSteps) {
      const frames = (step.frames as any[]) || [];
      let stepUpdated = false;

      for (let frameIdx = 0; frameIdx < frames.length; frameIdx++) {
        const frame = frames[frameIdx];
        if (!frame.elements || !Array.isArray(frame.elements)) continue;

        for (let elementIdx = 0; elementIdx < frame.elements.length; elementIdx++) {
          const element = frame.elements[elementIdx];
          if (
            element.type !== "image" ||
            (element.src &&
              element.src !== "" &&
              !element.src.startsWith("placeholder"))
          ) {
            continue;
          }

          try {
            const prompt = buildImagePrompt(
              step.title || "",
              step.description || "",
              element.alt || ""
            );

            console.log(`[v10-generate-images] Generating image for step ${step.step_number}, element ${elementIdx}...`);

            // Generate image via Gemini (Lovable AI Gateway)
            const imageBytes = await generateImageGemini(prompt);

            // Upload to Supabase Storage (bucket: lesson-audios, path: v10-images/...)
            const storagePath = `v10-images/${lessonId}/${step.step_number}_${elementIdx}.png`;
            const { error: uploadError } = await supabase.storage
              .from("lesson-audios")
              .upload(storagePath, imageBytes.buffer as ArrayBuffer, {
                contentType: "image/png",
                upsert: true,
              });

            if (uploadError) {
              throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from("lesson-audios")
              .getPublicUrl(storagePath);

            const publicUrl = publicUrlData.publicUrl;
            console.log(`[v10-generate-images] Uploaded: ${publicUrl}`);

            // Update element src in frames
            frames[frameIdx].elements[elementIdx].src = publicUrl;
            stepUpdated = true;
            success++;

            // Delay between images to avoid rate limits
            await delay(2000);
          } catch (err) {
            console.error(
              `[v10-generate-images] Failed step ${step.step_number}, element ${elementIdx}:`,
              err
            );
            failed++;

            await supabase.from("v10_bpa_pipeline_log").insert({
              pipeline_id,
              stage: 4,
              action: "generate-images:error",
              details: { message: `Step ${step.step_number}, element ${elementIdx}: ${(err as Error).message}` },
            });

            await delay(1000);
          }
        }
      }

      // Update the step's frames if any element was updated
      if (stepUpdated) {
        const { error: updateStepError } = await supabase
          .from("v10_lesson_steps")
          .update({ frames })
          .eq("id", step.id);

        if (updateStepError) {
          console.error(`[v10-generate-images] Failed to update step ${step.step_number}:`, updateStepError);
        }
      }
    }

    // 9. Recalculate images_generated from real DB data (prevents counter inflation)
    const { data: allStepsForCount } = await supabase
      .from("v10_lesson_steps")
      .select("frames")
      .eq("lesson_id", lessonId);

    let realImageCount = 0;
    for (const s of (allStepsForCount || [])) {
      const sFrames = (s as any).frames;
      if (!Array.isArray(sFrames)) continue;
      for (const f of sFrames) {
        for (const el of (f.elements || [])) {
          if (el.type === "image" && el.src && el.src !== "" && !el.src.startsWith("placeholder")) {
            realImageCount++;
          }
        }
      }
    }

    const updatePayload: any = { images_generated: realImageCount };

    // Also update images_needed if it was 0 (first run)
    if (pipeline.images_needed === 0 && total > 0) {
      updatePayload.images_needed = total;
    }

    const { error: pipelineUpdateError } = await supabase
      .from("v10_bpa_pipeline")
      .update(updatePayload)
      .eq("id", pipeline_id);

    if (pipelineUpdateError) {
      console.error("[v10-generate-images] Failed to update pipeline:", pipelineUpdateError);
    }

    // 10. Log completion
    await supabase.from("v10_bpa_pipeline_log").insert({
      pipeline_id,
      stage: 3,
      action: "generate-images:completed",
      details: {
        message: `Batch ${batch_index}: ${success} succeeded, ${failed} failed out of ${batchSteps.length} steps (total needing images: ${total})`,
        steps_in_db: steps.length,
        steps_needing_images: total,
      },
    });

    // 11. Return stats
    const stats = {
      total,
      processed: batchSteps.length,
      success,
      failed,
      hasMoreBatches,
    };

    console.log(`[v10-generate-images] Done: ${JSON.stringify(stats)}`);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[v10-generate-images] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
