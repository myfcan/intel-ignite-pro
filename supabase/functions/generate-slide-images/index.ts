import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { slides } = await req.json();
    
    if (!slides || !Array.isArray(slides)) {
      throw new Error('slides array is required');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log(`🎨 Gerando ${slides.length} imagens para slides...`);
    
    const generatedSlides = [];
    
    for (const slide of slides) {
      console.log(`   Gerando imagem para Slide ${slide.slideNumber}: "${slide.contentIdea}"`);
      
      // Gerar imagem usando OpenAI gpt-image-1
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: `Create a HORIZONTAL WIDESCREEN educational slide image in 16:9 aspect ratio for: ${slide.contentIdea}

CRITICAL FORMAT REQUIREMENTS:
- Image MUST be LANDSCAPE/HORIZONTAL format (wider than it is tall)
- Aspect ratio: 16:9 (e.g., 1920x1080 or 1600x900)
- Optimized for widescreen displays
- Content distributed horizontally across the image

VISUAL STYLE:
- Professional and modern design with a tech-forward aesthetic
- Friendly, approachable, and engaging for adult learners
- Use gradients and modern UI elements (cards, icons, subtle shadows)
- Color palette: Vibrant purples, blues, and teals with white/light backgrounds
- Modern flat design with subtle depth (not completely flat)
- High contrast for excellent readability
- Include relevant icons or simple illustrations to support the concept
- Avoid cluttered designs - use white space effectively

CONTENT GUIDELINES:
- Focus on visual representation of the concept
- Minimal text (if any) - prioritize visual storytelling
- Use metaphors and visual analogies to explain abstract concepts
- Include subtle tech/AI themed elements when relevant
- Professional photography style or modern vector illustrations

COMPOSITION:
- Layout optimized for WIDE HORIZONTAL space
- Center focus with balanced left-right distribution
- Avoid vertical-heavy layouts
- Consider rule of thirds for visual interest

QUALITY:
- Ultra high resolution and sharp details
- Professional lighting and color grading
- Polished, publication-ready quality

Format: Horizontal landscape 16:9 ratio (1920x1080 recommended)`,
          n: 1,
          size: "1536x1024", // Landscape 3:2 ratio (closest to 16:9)
          quality: "high",
          output_format: "png"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ Error response from OpenAI for slide ${slide.slideNumber}:`, errorText);
        throw new Error(`OpenAI error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // OpenAI retorna base64 diretamente no campo b64_json quando model é gpt-image-1
      const imageBase64 = data.data?.[0]?.b64_json;
      
      if (!imageBase64) {
        console.error(`   ❌ No image returned for slide ${slide.slideNumber}. Response:`, JSON.stringify(data));
        throw new Error(`Falha ao gerar imagem para slide ${slide.slideNumber}: No image in response`);
      }

      // Converter para data URL
      const imageDataUrl = `data:image/png;base64,${imageBase64}`;
      
      console.log(`   ✅ Imagem gerada para Slide ${slide.slideNumber} (${Math.round(imageBase64.length / 1024)}KB)`);
      
      generatedSlides.push({
        ...slide,
        imageUrl: imageDataUrl
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
