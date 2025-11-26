import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slides, batchSize = 4, batchIndex = 0 } = await req.json();

    if (!slides || !Array.isArray(slides)) {
      throw new Error('slides array is required');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // ============================================================================
    // BATCHING: Processar apenas um subset dos slides por vez
    // ============================================================================
    // Edge Functions têm limite de 150s. Com batchSize=4:
    // - 4 imagens × 30s = 120s (dentro do limite com margem)
    // ============================================================================

    const startIdx = batchIndex * batchSize;
    const endIdx = Math.min(startIdx + batchSize, slides.length);
    const slidesToProcess = slides.slice(startIdx, endIdx);

    console.log(`🎨 Gerando imagens para slides ${startIdx + 1}-${endIdx} de ${slides.length} usando OpenAI...`);
    console.log(`   Batch ${batchIndex + 1} de ${Math.ceil(slides.length / batchSize)}`);

    if (slidesToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          slides: slides, // Retorna todos sem modificar
          stats: {
            total: slides.length,
            success: 0,
            failed: 0,
            skipped: slides.length
          },
          message: 'No slides to process in this batch'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedSlides = [...slides]; // Copiar todos os slides
    const errors = [];

    // Processar apenas os slides deste batch
    for (let i = 0; i < slidesToProcess.length; i++) {
      const slide = slidesToProcess[i];
      const globalIndex = startIdx + i;
      try {
        console.log(`   🖼️ Gerando imagem para Slide ${slide.slideNumber}: "${slide.contentIdea}"`);

        const startTime = Date.now();

        // Gerar prompt detalhado
        const imagePrompt = `Create a professional, modern, educational slide image for: ${slide.contentIdea}

Style requirements:
- Clean and professional design
- Friendly and approachable
- Educational and engaging
- Vibrant but not overwhelming colors
- Modern flat design aesthetic
- Suitable for learning content about AI and technology
- High contrast for readability
- Horizontal composition (landscape orientation)
- No text overlays (text will be added separately)

The image should visually represent the concept in an abstract, symbolic way that supports learning.`;

        // Chamar OpenAI DALL-E 3
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1792x1024", // Horizontal (16:9 aproximado)
            quality: "standard", // "standard" ou "hd" (hd é 2x mais caro)
            response_format: "b64_json" // Retorna base64
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`   ❌ OpenAI API error for slide ${slide.slideNumber}:`, errorText);
          errors.push({
            slideId: slide.id,
            slideNumber: slide.slideNumber,
            error: `OpenAI API error (${response.status}): ${errorText}`
          });

          // Atualizar slide com erro (sem imageUrl)
          generatedSlides[globalIndex] = {
            ...slide,
            imageUrl: '', // Vazio indica falha
            imagePrompt: imagePrompt,
            error: `Failed to generate (${response.status})`
          };

          continue; // Pular para próximo slide
        }

        const data = await response.json();
        const imageBase64 = data.data?.[0]?.b64_json;

        if (!imageBase64) {
          console.error(`   ❌ No image returned for slide ${slide.slideNumber}. Response:`, JSON.stringify(data));
          errors.push({
            slideId: slide.id,
            slideNumber: slide.slideNumber,
            error: 'No image in OpenAI response'
          });

          generatedSlides[globalIndex] = {
            ...slide,
            imageUrl: '',
            imagePrompt: imagePrompt,
            error: 'No image returned'
          };

          continue;
        }

        // Converter base64 para data URL
        const dataUrl = `data:image/png;base64,${imageBase64}`;

        const elapsedTime = Date.now() - startTime;
        const sizeKB = Math.round(imageBase64.length / 1024);

        console.log(`   ✅ Imagem gerada para Slide ${slide.slideNumber} (${sizeKB}KB em ${elapsedTime}ms)`);

        // Atualizar slide na posição correta do array completo
        generatedSlides[globalIndex] = {
          ...slide,
          imageUrl: dataUrl, // Data URL PNG
          imagePrompt: imagePrompt
        };

      } catch (slideError) {
        console.error(`   ❌ Erro ao processar slide ${slide.slideNumber}:`, slideError);
        errors.push({
          slideId: slide.id,
          slideNumber: slide.slideNumber,
          error: slideError instanceof Error ? slideError.message : 'Unknown error'
        });

        // Atualizar slide com erro
        generatedSlides[globalIndex] = {
          ...slide,
          imageUrl: '',
          error: slideError instanceof Error ? slideError.message : 'Unknown error'
        };
      }
    }

    const successCount = generatedSlides.filter(s => s.imageUrl && s.imageUrl !== '').length;
    const failCount = errors.length;
    const processedCount = slidesToProcess.length;

    console.log(`✅ Resultado do batch: ${successCount}/${processedCount} imagens geradas com sucesso`);
    if (failCount > 0) {
      console.warn(`⚠️ ${failCount} imagens falharam neste batch:`, errors);
    }

    // Calcular se há mais batches
    const totalBatches = Math.ceil(slides.length / batchSize);
    const hasMoreBatches = (batchIndex + 1) < totalBatches;

    return new Response(
      JSON.stringify({
        slides: generatedSlides,
        stats: {
          total: slides.length,
          processed: processedCount,
          success: successCount,
          failed: failCount,
          batchIndex,
          totalBatches,
          hasMoreBatches
        },
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro fatal ao gerar imagens:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
