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

function buildImagePrompt(
  stepTitle: string,
  stepDescription: string,
  altText: string
): string {
  const context = [stepTitle, stepDescription, altText]
    .filter(Boolean)
    .join(". ");
  return `Modern flat vector illustration for a tech learning platform: ${context}. Style: flat vector, clean bold shapes, vibrant colors (blues, violets, warm yellows), no text, no letters, professional editorial quality, 16:9 landscape`;
}

async function generateImageOpenAI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-2",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.data[0].b64_json;
}

async function generateImageLeonardo(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("LEONARDO_API_KEY");
  if (!apiKey) throw new Error("LEONARDO_API_KEY not configured");

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Start generation
  const genResponse = await fetch(
    "https://cloud.leonardo.ai/api/rest/v1/generations",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        num_images: 1,
        width: 1024,
        height: 576,
      }),
    }
  );

  if (!genResponse.ok) {
    const err = await genResponse.text();
    throw new Error(`Leonardo API error (${genResponse.status}): ${err}`);
  }

  const genData = await genResponse.json();
  const generationId =
    genData.sdGenerationJob?.generationId ?? genData.generationId;

  if (!generationId) {
    throw new Error("Leonardo did not return a generation ID");
  }

  // Poll for completion
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await delay(2000);

    const pollResponse = await fetch(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      { headers }
    );

    if (!pollResponse.ok) {
      const err = await pollResponse.text();
      throw new Error(
        `Leonardo poll error (${pollResponse.status}): ${err}`
      );
    }

    const pollData = await pollResponse.json();
    const generation =
      pollData.generations_by_pk ?? pollData.generation_by_pk ?? pollData;

    if (generation.status === "COMPLETE") {
      const imageUrl = generation.generated_images?.[0]?.url;
      if (!imageUrl) throw new Error("Leonardo returned no image URL");

      // Download image and convert to base64
      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) throw new Error("Failed to download Leonardo image");

      const arrayBuffer = await imgResponse.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    if (generation.status === "FAILED") {
      throw new Error("Leonardo generation failed");
    }
  }

  throw new Error("Leonardo generation timed out");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      pipeline_id,
      api = "openai",
      batch_size = 2,
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

    // 4. Filter steps that need images
    const stepsNeedingImages = steps.filter((step: any) => {
      const frames = step.frames;
      if (!frames || !Array.isArray(frames)) return false;
      return frames.some((frame: any) => {
        const elements = frame.elements;
        if (!elements || !Array.isArray(elements)) return false;
        return elements.some(
          (el: any) =>
            el.type === "image" &&
            (!el.src || el.src === "" || el.src.startsWith("placeholder"))
        );
      });
    });

    const total = stepsNeedingImages.length;

    // 5. Apply batching
    const startIdx = batch_index * batch_size;
    const batchSteps = stepsNeedingImages.slice(startIdx, startIdx + batch_size);
    const hasMoreBatches = startIdx + batch_size < total;

    let success = 0;
    let failed = 0;

    // 6. Process each step sequentially
    for (const step of batchSteps) {
      const frames = step.frames as any[];
      let stepUpdated = false;

      for (let frameIdx = 0; frameIdx < frames.length; frameIdx++) {
        const frame = frames[frameIdx];
        if (!frame.elements || !Array.isArray(frame.elements)) continue;

        for (
          let elementIdx = 0;
          elementIdx < frame.elements.length;
          elementIdx++
        ) {
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
            // Build prompt
            const prompt = buildImagePrompt(
              step.title || "",
              step.description || "",
              element.alt || ""
            );

            // Generate image based on selected API
            let b64Image: string;
            if (api === "leonardo") {
              b64Image = await generateImageLeonardo(prompt);
            } else {
              b64Image = await generateImageOpenAI(prompt);
            }

            // Decode base64 to bytes
            const binaryStr = atob(b64Image);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }

            // 7. Upload to Supabase Storage
            const storagePath = `v10/${lessonId}/${step.step_number}_${elementIdx}.png`;
            const { error: uploadError } = await supabase.storage
              .from("lesson-images")
              .upload(storagePath, bytes, {
                contentType: "image/png",
                upsert: true,
              });

            if (uploadError) {
              throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from("lesson-images")
              .getPublicUrl(storagePath);

            const publicUrl = publicUrlData.publicUrl;

            // 8. Update element src in frames
            frames[frameIdx].elements[elementIdx].src = publicUrl;
            stepUpdated = true;
            success++;

            // Add delay between images to avoid rate limits
            await delay(1000);
          } catch (err) {
            console.error(
              `Failed to generate image for step ${step.step_number}, element ${elementIdx}:`,
              err
            );
            failed++;

            // Log the failure
            await supabase.from("v10_bpa_pipeline_log").insert({
              pipeline_id,
              step: "generate-images",
              status: "error",
              message: `Step ${step.step_number}, element ${elementIdx}: ${(err as Error).message}`,
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
          console.error(
            `Failed to update step ${step.step_number}:`,
            updateStepError
          );
        }
      }
    }

    // 9. Update pipeline images_generated count
    const { error: pipelineUpdateError } = await supabase
      .from("v10_bpa_pipeline")
      .update({
        images_generated: (pipeline.images_generated || 0) + success,
      })
      .eq("id", pipeline_id);

    if (pipelineUpdateError) {
      console.error("Failed to update pipeline:", pipelineUpdateError);
    }

    // 10. Log completion
    await supabase.from("v10_bpa_pipeline_log").insert({
      pipeline_id,
      step: "generate-images",
      status: "completed",
      message: `Batch ${batch_index}: ${success} succeeded, ${failed} failed out of ${batchSteps.length} steps (total needing images: ${total})`,
    });

    // 11. Return stats
    const stats = {
      total,
      processed: batchSteps.length,
      success,
      failed,
      hasMoreBatches,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
