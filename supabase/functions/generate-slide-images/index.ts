import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slides } = await req.json();
    
    if (!slides || !Array.isArray(slides)) {
      throw new Error('slides array is required');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`🎨 Gerando ${slides.length} imagens para slides...`);
    
    const generatedSlides = [];
    
    for (const slide of slides) {
      console.log(`   Gerando imagem para Slide ${slide.slideNumber}: "${slide.contentIdea}"`);
      
      // Gerar imagem usando Lovable AI
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: `Create a HORIZONTAL WIDESCREEN educational slide image in 16:9 aspect ratio for: ${slide.contentIdea}

CRITICAL: Image MUST be LANDSCAPE/HORIZONTAL format (wider than it is tall), optimized for widescreen displays.

Style requirements:
- Professional and modern design
- Friendly and approachable
- Educational and engaging
- Vibrant but not overwhelming colors
- Modern flat design aesthetic
- High contrast for readability
- Layout optimized for WIDE HORIZONTAL space (not vertical)
- Content distributed horizontally across the image

Format: Horizontal landscape 16:9 ratio (e.g., 1920x1080 or 1600x900)`
            }
          ],
          modalities: ["image", "text"]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ Error response from AI Gateway for slide ${slide.slideNumber}:`, errorText);
        throw new Error(`AI Gateway error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageBase64) {
        console.error(`   ❌ No image returned for slide ${slide.slideNumber}. Response:`, JSON.stringify(data));
        throw new Error(`Falha ao gerar imagem para slide ${slide.slideNumber}: No image in response`);
      }

      console.log(`   ✅ Imagem gerada para Slide ${slide.slideNumber} (${Math.round(imageBase64.length / 1024)}KB)`);
      
      generatedSlides.push({
        ...slide,
        imageUrl: imageBase64 // Base64 data URL
      });
    }

    console.log(`✅ Total: ${generatedSlides.length} imagens geradas com sucesso`);

    return new Response(
      JSON.stringify({ slides: generatedSlides }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro ao gerar imagens:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
