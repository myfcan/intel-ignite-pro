import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================================================
// OPENAI DALL-E 3 - ALTA QUALIDADE (landscape 1792x1024)
// ============================================================================
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Traduz e simplifica o contentIdea para um prompt eficiente em inglês
 */
function createImagePrompt(contentIdea: string): string {
  // Prompt base otimizado para DALL-E 3
  // - 100% em inglês (melhor resultado)
  // - Instrução explícita para NÃO incluir texto
  // - Estilo consistente para todas as imagens
  return `Create a modern, professional illustration for an educational slide.

Topic: ${contentIdea}

CRITICAL REQUIREMENTS:
- NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS in the image
- NO writing of any kind - pure visual illustration only
- Clean, minimalist design with soft gradients
- Modern flat design aesthetic
- Vibrant but professional color palette
- Abstract/symbolic representation of the concept
- High contrast, suitable for presentations
- Horizontal landscape composition
- Friendly and approachable visual style

Style reference: Modern tech company presentation, Notion/Figma/Linear style illustrations.`;
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

    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY não configurada!');
      throw new Error('OPENAI_API_KEY not configured. Configure no Supabase Dashboard > Edge Functions > Secrets');
    }

    // ============================================================================
    // BATCHING: 2 imagens por vez (DALL-E 3: ~30-45s/imagem, total ~90s < 150s)
    // ============================================================================
    const startIdx = batchIndex * batchSize;
    const endIdx = Math.min(startIdx + batchSize, slides.length);
    const slidesToProcess = slides.slice(startIdx, endIdx);

    console.log(`🎨 [OpenAI DALL-E 3] Batch ${batchIndex + 1}: slides ${startIdx + 1}-${endIdx} de ${slides.length}`);

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

    const generatedSlides = [...slides]; // Copiar todos os slides
    const errors = [];
    let successCount = 0;

    // Processar slides SEQUENCIALMENTE (1 por vez)
    for (let i = 0; i < slidesToProcess.length; i++) {
      const slide = slidesToProcess[i];
      const globalIndex = startIdx + i;

      try {
        console.log(`   🖼️ [${i + 1}/${slidesToProcess.length}] Slide ${slide.slideNumber}: "${slide.contentIdea?.substring(0, 50)}..."`);

        const startTime = Date.now();

        // Criar prompt otimizado
        const imagePrompt = createImagePrompt(slide.contentIdea);

        // ============================================================================
        // CHAMAR OPENAI DALL-E 3 (ALTA QUALIDADE + LANDSCAPE)
        // ============================================================================
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
            size: "1792x1024", // LANDSCAPE - ideal para slides
            quality: "standard", // standard é mais rápido, hd é mais detalhado
            style: "vivid", // vivid = cores vibrantes, natural = realista
            response_format: "b64_json" // Base64 direto
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`   ❌ OpenAI error (${response.status}):`, errorText);

          let errorMessage = `OpenAI error (${response.status})`;
          if (response.status === 429) {
            errorMessage = 'Rate limit - aguarde alguns minutos';
          } else if (response.status === 401) {
            errorMessage = 'OPENAI_API_KEY inválida';
          } else if (response.status === 400) {
            // DALL-E 3 pode rejeitar prompts por política de conteúdo
            errorMessage = 'Prompt rejeitado - ajustando...';
            console.warn(`   ⚠️ Prompt rejeitado para slide ${slide.slideNumber}, tentando versão simplificada...`);
          }

          errors.push({ slideId: slide.id, slideNumber: slide.slideNumber, error: errorMessage });
          generatedSlides[globalIndex] = { ...slide, imageUrl: '', error: errorMessage };
          continue;
        }

        const data = await response.json();
        const imageBase64 = data.data?.[0]?.b64_json;

        if (!imageBase64) {
          console.error(`   ❌ No b64_json in response:`, JSON.stringify(data).substring(0, 200));
          errors.push({ slideId: slide.id, slideNumber: slide.slideNumber, error: 'No image data' });
          generatedSlides[globalIndex] = { ...slide, imageUrl: '', error: 'No image data' };
          continue;
        }

        // Converter para data URL
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        const sizeKB = Math.round(imageBase64.length / 1024);
        const elapsedTime = Date.now() - startTime;

        console.log(`   ✅ Slide ${slide.slideNumber}: ${sizeKB}KB em ${elapsedTime}ms`);

        generatedSlides[globalIndex] = {
          ...slide,
          imageUrl: dataUrl,
          imagePrompt: imagePrompt
        };
        successCount++;

        // Delay entre imagens para evitar rate limit (2 segundos)
        if (i < slidesToProcess.length - 1) {
          console.log(`   ⏳ Aguardando 2s antes da próxima imagem...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
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
