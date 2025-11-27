import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================================================
// LEONARDO.AI - Geração de imagens de alta qualidade para slides
// ============================================================================
const LEONARDO_API_KEY = Deno.env.get('LEONARDO_API_KEY');
const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Delay helper
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate image with Leonardo.ai
async function generateWithLeonardo(prompt: string): Promise<string> {
  console.log("🎨 Generating image with Leonardo.ai...");
  
  // Step 1: Create generation request
  const generationResponse = await fetch(`${LEONARDO_API_URL}/generations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LEONARDO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
      modelId: "6b645e3a-d64f-4341-a6d8-7a3690fbf042", // Leonardo Kino XL (high quality)
      width: 1792,
      height: 1024,
      num_images: 1,
      guidance_scale: 7,
      sd_version: "SDXL_1_0",
      photoReal: true,
      photoRealStrength: 0.55,
      alchemy: true,
    }),
  });

  if (!generationResponse.ok) {
    const errorText = await generationResponse.text();
    console.error("Leonardo.ai generation request failed:", errorText);
    throw new Error(`Leonardo.ai API error: ${generationResponse.status}`);
  }

  const generationData = await generationResponse.json();
  const generationId = generationData.sdGenerationJob?.generationId;

  if (!generationId) {
    throw new Error("No generation ID returned from Leonardo.ai");
  }

  console.log(`⏳ Generation ID: ${generationId}, waiting for completion...`);

  // Step 2: Poll for completion (max 60 seconds)
  const maxAttempts = 30;
  const pollInterval = 2000; // 2 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await delay(pollInterval);
    
    const statusResponse = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
      headers: {
        "Authorization": `Bearer ${LEONARDO_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      console.error("Failed to check generation status");
      continue;
    }

    const statusData = await statusResponse.json();
    const generation = statusData.generations_by_pk;

    if (generation.status === "COMPLETE" && generation.generated_images?.length > 0) {
      const imageUrl = generation.generated_images[0].url;
      console.log("✅ Image generated successfully");
      
      // Download and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
      return `data:image/png;base64,${base64}`;
    }

    if (generation.status === "FAILED") {
      throw new Error("Leonardo.ai generation failed");
    }

    console.log(`⏳ Attempt ${attempt + 1}/${maxAttempts}: Status ${generation.status}`);
  }

  throw new Error("Timeout waiting for Leonardo.ai image generation");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slides, batchSize = 2, batchIndex = 0 } = await req.json();

    if (!slides || !Array.isArray(slides)) {
      throw new Error('slides array is required');
    }

    if (!LEONARDO_API_KEY) {
      console.error('❌ LEONARDO_API_KEY não configurada!');
      throw new Error('LEONARDO_API_KEY not configured. Configure in Supabase Dashboard > Edge Functions > Secrets');
    }

    // ============================================================================
    // BATCHING: 2 imagens por vez para evitar timeout
    // ============================================================================
    const startIdx = batchIndex * batchSize;
    const endIdx = Math.min(startIdx + batchSize, slides.length);
    const slidesToProcess = slides.slice(startIdx, endIdx);

    console.log(`🎨 [Leonardo.ai] Batch ${batchIndex + 1}: slides ${startIdx + 1}-${endIdx} de ${slides.length}`);

    if (slidesToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          slides: slides,
          stats: { total: slides.length, success: 0, failed: 0, skipped: slides.length },
          message: 'No slides to process in this batch'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedSlides = [...slides];
    const errors = [];
    let successCount = 0;

    // Processar slides SEQUENCIALMENTE (1 por vez)
    for (let i = 0; i < slidesToProcess.length; i++) {
      const slide = slidesToProcess[i];
      const globalIndex = startIdx + i;

      try {
        console.log(`   🖼️ [${i + 1}/${slidesToProcess.length}] Slide ${slide.slideNumber}: "${slide.contentIdea?.substring(0, 50)}..."`);

        const startTime = Date.now();

        // Prompt otimizado para Leonardo.ai
        const imagePrompt = `Professional educational illustration for a learning platform slide: ${slide.contentIdea}

Style requirements:
- Modern, clean, professional aesthetic
- High resolution, ultra sharp focus (16:9 landscape)
- Vibrant colors with soft gradients
- Abstract/symbolic representation
- No text, no letters, no numbers, no words anywhere in the image
- Suitable for professional presentations
- Photorealistic quality with cinematic lighting`;

        // Gerar imagem com Leonardo.ai
        const imageDataUrl = await generateWithLeonardo(imagePrompt);
        const sizeKB = Math.round(imageDataUrl.length / 1024);
        const elapsedTime = Date.now() - startTime;

        console.log(`   ✅ Slide ${slide.slideNumber}: ${sizeKB}KB em ${elapsedTime}ms`);

        generatedSlides[globalIndex] = {
          ...slide,
          imageUrl: imageDataUrl,
          imagePrompt: imagePrompt
        };
        successCount++;

        // Delay entre imagens para evitar problemas
        if (i < slidesToProcess.length - 1) {
          await delay(1000);
        }

      } catch (slideError) {
        console.error(`   ❌ Erro slide ${slide.slideNumber}:`, slideError);
        errors.push({
          slideId: slide.id,
          slideNumber: slide.slideNumber,
          error: slideError instanceof Error ? slideError.message : 'Unknown error'
        });
        generatedSlides[globalIndex] = { ...slide, imageUrl: '', error: String(slideError) };
      }
    }

    const totalBatches = Math.ceil(slides.length / batchSize);
    console.log(`✅ Batch ${batchIndex + 1}/${totalBatches}: ${successCount}/${slidesToProcess.length} OK`);

    return new Response(
      JSON.stringify({
        slides: generatedSlides,
        stats: {
          total: slides.length,
          processed: slidesToProcess.length,
          success: successCount,
          failed: errors.length,
          batchIndex,
          totalBatches,
          hasMoreBatches: (batchIndex + 1) < totalBatches
        },
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
