// supabase/functions/v7-pipeline/index.ts
// V7 Cinematic Lesson Pipeline - Generates cinematic lesson structure from narrative script

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface V7PipelineInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  narrativeScript: string;
  duration: number;
  trail_id?: string;
  order_index?: number;
}

interface V7Act {
  id: string;
  type: 'narrative' | 'code-demo' | 'challenge' | 'comparison' | 'reveal';
  title: string;
  startTime: number;
  endTime: number;
  content: {
    narrative?: string;
    code?: { language: string; code: string; highlightLines?: number[] };
    challenge?: { prompt: string; solution: string; hints: string[] };
    comparison?: { before: string; after: string; explanation: string };
    reveal?: { question: string; answer: string; explanation: string };
  };
  visualEffects: {
    particles?: boolean;
    glow?: boolean;
    cameraMovement?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const input: V7PipelineInput = await req.json();
    console.log('[V7Pipeline] Starting pipeline for:', input.title);

    // Validate input
    if (!input.title || !input.narrativeScript) {
      throw new Error('Title and narrative script are required');
    }

    // ========================================================================
    // STEP 1: Parse narrative script into acts
    // ========================================================================
    console.log('[V7Pipeline] Step 1: Parsing narrative script...');
    
    const acts = parseNarrativeIntoActs(input.narrativeScript, input.duration);
    console.log('[V7Pipeline] Generated', acts.length, 'acts');

    // ========================================================================
    // STEP 2: Generate audio URL placeholder (will be filled by audio pipeline)
    // ========================================================================
    console.log('[V7Pipeline] Step 2: Preparing audio configuration...');
    
    const audioUrl = ''; // Will be generated in a separate step

    // ========================================================================
    // STEP 3: Build V7 lesson structure
    // ========================================================================
    console.log('[V7Pipeline] Step 3: Building lesson structure...');
    
    const lessonContent = {
      model: 'v7',
      version: '1.0.0',
      metadata: {
        title: input.title,
        subtitle: input.subtitle || '',
        difficulty: input.difficulty,
        category: input.category,
        tags: input.tags,
        learningObjectives: input.learningObjectives,
        totalDuration: input.duration,
        actCount: acts.length,
        createdAt: new Date().toISOString(),
      },
      audioConfig: {
        url: audioUrl,
        format: 'mp3',
        sampleRate: 44100,
      },
      timeline: {
        acts: acts,
        totalDuration: input.duration,
      },
      interactivity: {
        pausePoints: acts
          .filter(a => a.type === 'challenge')
          .map(a => a.startTime),
        codePlaygrounds: acts
          .filter(a => a.type === 'code-demo' || a.type === 'challenge')
          .map(a => ({
            actId: a.id,
            language: a.content.code?.language || 'javascript',
            starterCode: a.content.code?.code || '',
          })),
      },
      visualTheme: {
        primaryColor: 'cyan',
        particlesEnabled: true,
        glowEffects: true,
      },
    };

    // ========================================================================
    // STEP 4: Save to database (if trail_id provided)
    // ========================================================================
    let lessonId: string | null = null;
    
    if (input.trail_id) {
      console.log('[V7Pipeline] Step 4: Saving to database...');
      
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          title: input.title,
          description: input.subtitle || '',
          trail_id: input.trail_id,
          order_index: input.order_index || 0,
          model: 'v7',
          lesson_type: 'v7-cinematic',
          content: lessonContent,
          estimated_time: Math.ceil(input.duration / 60),
          difficulty_level: input.difficulty,
          is_active: false, // Draft mode
          status: 'draft',
        })
        .select('id')
        .single();

      if (lessonError) {
        console.error('[V7Pipeline] Database error:', lessonError);
        throw new Error(`Failed to save lesson: ${lessonError.message}`);
      }

      lessonId = lesson.id;
      console.log('[V7Pipeline] Lesson saved with ID:', lessonId);
    }

    // ========================================================================
    // RESPONSE
    // ========================================================================
    const response = {
      success: true,
      lessonId,
      content: lessonContent,
      stats: {
        actCount: acts.length,
        totalDuration: input.duration,
        interactivePoints: lessonContent.interactivity.pausePoints.length,
        codePlaygrounds: lessonContent.interactivity.codePlaygrounds.length,
      },
    };

    console.log('[V7Pipeline] Pipeline completed successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[V7Pipeline] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseNarrativeIntoActs(script: string, totalDuration: number): V7Act[] {
  const acts: V7Act[] = [];
  
  // Split script into paragraphs
  const paragraphs = script
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    // Default single act
    return [{
      id: 'act-1',
      type: 'narrative',
      title: 'Introdução',
      startTime: 0,
      endTime: totalDuration,
      content: { narrative: script },
      visualEffects: { particles: true, glow: true },
    }];
  }

  // Calculate time per paragraph
  const timePerParagraph = totalDuration / paragraphs.length;

  paragraphs.forEach((paragraph, index) => {
    const startTime = Math.floor(index * timePerParagraph);
    const endTime = Math.floor((index + 1) * timePerParagraph);
    
    // Detect act type from content
    const actType = detectActType(paragraph);
    
    acts.push({
      id: `act-${index + 1}`,
      type: actType,
      title: generateActTitle(paragraph, actType, index),
      startTime,
      endTime,
      content: generateActContent(paragraph, actType),
      visualEffects: {
        particles: actType === 'reveal' || index === 0,
        glow: actType === 'code-demo' || actType === 'challenge',
        cameraMovement: index === 0 ? 'zoom-in' : 'pan',
      },
    });
  });

  return acts;
}

function detectActType(paragraph: string): V7Act['type'] {
  const lower = paragraph.toLowerCase();
  
  if (lower.includes('```') || lower.includes('código') || lower.includes('function') || lower.includes('const ')) {
    return 'code-demo';
  }
  if (lower.includes('desafio') || lower.includes('exercício') || lower.includes('tente') || lower.includes('pratique')) {
    return 'challenge';
  }
  if (lower.includes('antes') && lower.includes('depois')) {
    return 'comparison';
  }
  if (lower.includes('?') && lower.includes('resposta')) {
    return 'reveal';
  }
  
  return 'narrative';
}

function generateActTitle(paragraph: string, type: V7Act['type'], index: number): string {
  const typeLabels: Record<string, string> = {
    'narrative': 'Narrativa',
    'code-demo': 'Demonstração',
    'challenge': 'Desafio',
    'comparison': 'Comparação',
    'reveal': 'Revelação',
  };
  
  // Try to extract title from first line
  const firstLine = paragraph.split('\n')[0].substring(0, 50);
  if (firstLine.length > 10 && firstLine.length < 50) {
    return firstLine.replace(/[#*_]/g, '').trim();
  }
  
  return `${typeLabels[type]} ${index + 1}`;
}

function generateActContent(paragraph: string, type: V7Act['type']): V7Act['content'] {
  switch (type) {
    case 'code-demo':
      // Extract code block if present
      const codeMatch = paragraph.match(/```(\w+)?\n([\s\S]*?)```/);
      if (codeMatch) {
        return {
          narrative: paragraph.replace(/```[\s\S]*?```/, '').trim(),
          code: {
            language: codeMatch[1] || 'javascript',
            code: codeMatch[2].trim(),
          },
        };
      }
      return {
        narrative: paragraph,
        code: {
          language: 'javascript',
          code: '// Código de exemplo\nconsole.log("Hello V7!");',
        },
      };

    case 'challenge':
      return {
        narrative: paragraph,
        challenge: {
          prompt: paragraph,
          solution: '// Solução será adicionada',
          hints: ['Tente pensar passo a passo', 'Revise o conteúdo anterior'],
        },
      };

    case 'comparison':
      return {
        narrative: paragraph,
        comparison: {
          before: '// Antes',
          after: '// Depois (otimizado)',
          explanation: paragraph,
        },
      };

    case 'reveal':
      return {
        narrative: paragraph,
        reveal: {
          question: paragraph.split('?')[0] + '?',
          answer: paragraph.split('?')[1]?.trim() || 'Resposta revelada!',
          explanation: paragraph,
        },
      };

    default:
      return { narrative: paragraph };
  }
}
