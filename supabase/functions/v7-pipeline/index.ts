// supabase/functions/v7-pipeline/index.ts
// V7 Cinematic Lesson Pipeline - 100% Automatic Act Generation from Narrative Script
// Uses AI to analyze script and generate proper 5-act cinematic structure

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// TYPES
// ============================================================================

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
  voice_id?: string;
  generate_audio?: boolean;
  // Support for rich cinematic_flow.acts structure
  cinematic_flow?: {
    acts: Array<{
      id?: string;
      type: string;
      title?: string;
      duration?: number;
      content?: {
        visual?: {
          instruction?: string; // NOT narrated - screen direction only
          text?: string;
          [key: string]: any;
        };
        audio?: {
          narration?: string; // NARRATED by TTS
          [key: string]: any;
        };
        interaction?: any;
        [key: string]: any;
      };
    }>;
    timeline?: {
      totalDuration?: number;
    };
  };
}

// V7 Cinematic Act Types (matching frontend components)
type V7ActType =
  | 'dramatic'
  | 'comparison'
  | 'narrative'
  | 'interaction'
  | 'quiz'           // Same as interaction, but explicit
  | 'playground'
  | 'result'
  | 'revelation'     // Same as result, but explicit
  | 'cta'            // Call-to-action phase
  | 'gamification';  // Final gamification phase

interface V7DramaticContent {
  mainValue: string;
  subtitle: string;
  highlightWord?: string;
  mood?: 'danger' | 'success' | 'warning' | 'neutral';
}

interface V7ComparisonContent {
  title: string;
  subtitle?: string;
  leftCard: {
    label: string;
    value: string;
    isPositive: boolean;
    details: string[];
    icon?: string;
  };
  rightCard: {
    label: string;
    value: string;
    isPositive: boolean;
    details: string[];
    icon?: string;
  };
}

interface V7InteractionContent {
  title: string;
  subtitle?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
    isDefault?: boolean;
  }>;
  buttonText: string;
}

interface V7PlaygroundContent {
  title: string;
  subtitle?: string;
  leftSide: {
    label: string;
    placeholder: string;
    defaultValue?: string;
    badge?: string;
  };
  rightSide: {
    label: string;
    placeholder: string;
    defaultValue?: string;
    isPro?: boolean;
    badge?: string;
  };
}

interface V7ResultContent {
  emoji: string;
  title: string;
  message: string;
  metrics: Array<{
    label: string;
    value: string | number;
    suffix?: string;
    icon?: string;
    isHighlight?: boolean;
  }>;
  ctaText?: string;
  celebrationLevel?: 'low' | 'medium' | 'high';
}

interface V7CinematicAct {
  id: string;
  type: V7ActType;
  title: string;
  narrativeSegment: string;
  startTime: number;
  endTime: number;
  autoAdvanceMs?: number;
  content: V7DramaticContent | V7ComparisonContent | V7InteractionContent | V7PlaygroundContent | V7ResultContent;
  visualEffects: {
    mood: 'dramatic' | 'calm' | 'energetic' | 'mysterious';
    particles: boolean;
    glow: boolean;
    blur: boolean;
    rays: boolean;
  };
  soundEffects: {
    onEnter?: string;
    onAction?: string;
    ambient?: string;
  };
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface AIGeneratedActs {
  acts: Array<{
    type: V7ActType;
    title: string;
    narrativeSegment: string;
    content: any;
    visualEffects: {
      mood: string;
      particles: boolean;
      glow: boolean;
    };
  }>;
  summary: string;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const input: V7PipelineInput = await req.json();
    console.log('[V7Pipeline] Starting pipeline for:', input.title);
    
    // Check if using cinematic_flow.acts (rich structure) or narrativeScript (flat)
    const hasCinematicFlow = input.cinematic_flow?.acts && input.cinematic_flow.acts.length > 0;
    
    if (hasCinematicFlow) {
      console.log('[V7Pipeline] Using cinematic_flow.acts structure with', input.cinematic_flow!.acts.length, 'acts');
    } else {
      console.log('[V7Pipeline] Using flat narrativeScript, length:', input.narrativeScript?.length || 0);
    }

    if (!input.title) {
      throw new Error('Title is required');
    }
    
    if (!hasCinematicFlow && !input.narrativeScript) {
      throw new Error('Either cinematic_flow.acts or narrativeScript is required');
    }

    // ========================================================================
    // STEP 1: Process Acts (from cinematic_flow or AI generation)
    // ========================================================================
    let aiGeneratedActs: AIGeneratedActs;
    let narrativeForAudio = '';
    
    if (hasCinematicFlow) {
      // Use provided cinematic_flow.acts directly
      console.log('[V7Pipeline] Step 1: Processing cinematic_flow.acts...');
      
      // Extract ONLY audio.narration for TTS (not visual.instruction)
      const narrations: string[] = [];
      
      aiGeneratedActs = {
        acts: input.cinematic_flow!.acts.map((act, index) => {
          // Extract narration for TTS from act.content.audio.narration
          const narration = act.content?.audio?.narration || '';
          if (narration) {
            narrations.push(narration);
          }

          return {
            type: (act.type || 'dramatic') as V7ActType,
            title: act.title || `Ato ${index + 1}`,
            narrativeSegment: narration, // Only narration, not visual instruction
            content: {
              // Preserve visual instruction as metadata (not for TTS)
              visualInstruction: act.content?.visual?.instruction || '',
              // Pass through all visual content
              ...act.content?.visual,
              // Pass through interaction content
              ...act.content?.interaction,
              // Pass through any existing content
              ...act.content,
            },
            visualEffects: {
              mood: act.content?.visual?.mood || 'dramatic',
              particles: true,
              glow: true,
            },
          };
        }),
        summary: `Aula V7 Cinematográfica: ${input.title}`,
      };
      
      // Combine all narrations for TTS
      narrativeForAudio = narrations.join('\n\n');
      console.log('[V7Pipeline] Extracted', narrations.length, 'narration segments for TTS');
      console.log('[V7Pipeline] Total narration length:', narrativeForAudio.length);
      
    } else {
      // Use AI to generate acts from flat narrativeScript
      console.log('[V7Pipeline] Step 1: Generating cinematic acts with AI...');
      aiGeneratedActs = await generateActsWithAI(input.narrativeScript, input.title);
      narrativeForAudio = input.narrativeScript;
    }
    
    console.log('[V7Pipeline] Processed', aiGeneratedActs.acts.length, 'acts');

    // ========================================================================
    // STEP 2: Build V7 Cinematic Acts Structure
    // ========================================================================
    console.log('[V7Pipeline] Step 2: Building cinematic act structure...');
    
    const cinematicActs = buildCinematicActs(aiGeneratedActs, input.duration);
    console.log('[V7Pipeline] Built', cinematicActs.length, 'cinematic acts');

    // ========================================================================
    // STEP 3: Generate Audio with ElevenLabs (ONLY from narration, not visual instructions)
    // ========================================================================
    let audioUrl = '';
    let wordTimestamps: WordTimestamp[] = [];
    
    const shouldGenerateAudio = input.generate_audio !== false && narrativeForAudio.length > 0;
    
    if (shouldGenerateAudio) {
      console.log('[V7Pipeline] Step 3: Generating audio with ElevenLabs...');
      console.log('[V7Pipeline] Audio text length:', narrativeForAudio.length, '(only narration, not visual instructions)');
      
      const audioResult = await generateAudioWithElevenLabs(
        narrativeForAudio, // Only narration text, not visual instructions
        input.voice_id,
        supabase
      );
      
      if (audioResult.success) {
        audioUrl = audioResult.audioUrl || '';
        wordTimestamps = audioResult.wordTimestamps || [];
        console.log('[V7Pipeline] Audio generated:', audioUrl);
        console.log('[V7Pipeline] Word timestamps:', wordTimestamps.length);
        
        // Recalculate act timings based on word timestamps
        if (wordTimestamps.length > 0) {
          recalculateActTimingsFromWordTimestamps(
            cinematicActs,
            wordTimestamps,
            narrativeForAudio
          );
        }
      } else {
        console.warn('[V7Pipeline] Audio generation failed:', audioResult.error);
      }
    } else {
      console.log('[V7Pipeline] Step 3: Skipping audio generation (disabled or no narration)');
    }

    // ========================================================================
    // STEP 4: Build Complete V7 Lesson Content
    // ========================================================================
    console.log('[V7Pipeline] Step 4: Building complete lesson content...');
    
    const totalDuration = wordTimestamps.length > 0 
      ? Math.ceil(wordTimestamps[wordTimestamps.length - 1].end)
      : input.duration;
    
    // Preserve original cinematic_flow if provided (for useV7PhaseScript to use)
    const cinematic_flow = hasCinematicFlow ? {
      acts: input.cinematic_flow!.acts.map((act, index) => ({
        ...act,
        id: act.id || `act-${index + 1}`,
        // Ensure content.visual and content.audio are properly structured
        content: {
          ...act.content,
          visual: {
            instruction: act.content?.visual?.instruction || '', // Screen direction (NOT narrated)
            ...act.content?.visual,
          },
          audio: {
            narration: act.content?.audio?.narration || '', // TTS content
            ...act.content?.audio,
          },
        },
      })),
      timeline: input.cinematic_flow!.timeline || { totalDuration },
    } : undefined;

    const lessonContent = {
      model: 'v7-cinematic',
      version: '2.0.0',
      metadata: {
        title: input.title,
        subtitle: input.subtitle || '',
        difficulty: input.difficulty,
        category: input.category,
        tags: input.tags,
        learningObjectives: input.learningObjectives,
        totalDuration: totalDuration,
        actCount: cinematicActs.length,
        createdAt: new Date().toISOString(),
        generatedBy: hasCinematicFlow ? 'v7-pipeline-cinematic-flow' : 'v7-pipeline-ai',
        hasCinematicFlow: hasCinematicFlow,
      },
      audioConfig: {
        url: audioUrl,
        format: 'mp3',
        sampleRate: 44100,
        hasWordTimestamps: wordTimestamps.length > 0,
      },
      // Store the original cinematic_flow for frontend to use
      cinematic_flow: cinematic_flow,
      // Also store the processed structure for backward compatibility
      cinematicStructure: {
        acts: cinematicActs,
        totalDuration: totalDuration,
        actTypes: cinematicActs.map(a => a.type),
      },
      interactivity: {
        pausePoints: cinematicActs
          .filter(a => a.type === 'interaction' || a.type === 'playground')
          .map(a => ({ actId: a.id, time: a.startTime, type: a.type })),
        quizzes: cinematicActs
          .filter(a => a.type === 'interaction')
          .map(a => ({
            actId: a.id,
            options: (a.content as V7InteractionContent).options,
          })),
        playgrounds: cinematicActs
          .filter(a => a.type === 'playground')
          .map(a => ({
            actId: a.id,
            config: a.content as V7PlaygroundContent,
          })),
      },
      visualTheme: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentPositive: '#4ecdc4',
        accentNegative: '#ff6b6b',
        particlesEnabled: true,
        glowEffects: true,
        cinematicCanvas: true,
      },
      soundConfig: {
        transitionSounds: true,
        interactionFeedback: true,
        celebrationEffects: true,
      },
    };

    // ========================================================================
    // STEP 5: Save to Database
    // ========================================================================
    console.log('[V7Pipeline] Step 5: Saving to database...');
    
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        title: input.title,
        description: input.subtitle || aiGeneratedActs.summary,
        trail_id: input.trail_id || null,
        order_index: input.order_index || 0,
        model: 'v7',
        lesson_type: 'v7-cinematic',
        content: lessonContent,
        audio_url: audioUrl || null,
        word_timestamps: wordTimestamps.length > 0 ? wordTimestamps : null,
        estimated_time: Math.ceil(totalDuration / 60),
        difficulty_level: input.difficulty,
        is_active: false,
        status: 'rascunho',
      })
      .select('id')
      .single();

    if (lessonError) {
      console.error('[V7Pipeline] Database error:', lessonError);
      throw new Error(`Failed to save lesson: ${lessonError.message}`);
    }

    const lessonId = lesson.id;
    console.log('[V7Pipeline] Lesson saved with ID:', lessonId);

    // ========================================================================
    // RESPONSE
    // ========================================================================
    const response = {
      success: true,
      lessonId,
      content: lessonContent,
      audioUrl,
      wordTimestampsCount: wordTimestamps.length,
      stats: {
        actCount: cinematicActs.length,
        actTypes: {
          dramatic: cinematicActs.filter(a => a.type === 'dramatic').length,
          comparison: cinematicActs.filter(a => a.type === 'comparison').length,
          interaction: cinematicActs.filter(a => a.type === 'interaction').length,
          playground: cinematicActs.filter(a => a.type === 'playground').length,
          result: cinematicActs.filter(a => a.type === 'result').length,
        },
        totalDuration: totalDuration,
        hasAudio: !!audioUrl,
        hasWordTimestamps: wordTimestamps.length > 0,
      },
      aiSummary: aiGeneratedActs.summary,
    };

    console.log('[V7Pipeline] Pipeline completed successfully');
    console.log('[V7Pipeline] Stats:', JSON.stringify(response.stats));

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
// AI-POWERED ACT GENERATION
// ============================================================================

async function generateActsWithAI(narrativeScript: string, title: string): Promise<AIGeneratedActs> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!OPENAI_API_KEY) {
    console.warn('[V7Pipeline:AI] OpenAI key not found, using fallback parsing');
    return fallbackActParsing(narrativeScript, title);
  }

  const systemPrompt = `Você é um especialista em design instrucional cinematográfico. Sua tarefa é analisar um roteiro narrativo e dividi-lo em EXATAMENTE 5 atos cinematográficos seguindo esta estrutura:

## ESTRUTURA DOS 5 ATOS OBRIGATÓRIOS:

1. **ATO 1 - DRAMATIC (Hook)**: O gancho inicial que captura atenção com um dado impactante ou estatística chocante
   - Tipo: "dramatic"
   - Deve ter: mainValue (ex: "98%"), subtitle, highlightWord, mood (danger/success/warning)

2. **ATO 2 - COMPARISON (Conflito)**: Comparação lado a lado mostrando dois caminhos/grupos diferentes
   - Tipo: "comparison"
   - Deve ter: leftCard (negativo) e rightCard (positivo) com label, value, isPositive, details[]

3. **ATO 3 - INTERACTION (Quiz)**: Um teste/quiz interativo para engajar o usuário
   - Tipo: "interaction"
   - Deve ter: title, subtitle, options[] (com id, text, isCorrect), buttonText

4. **ATO 4 - PLAYGROUND (Desafio)**: Um desafio prático split-screen comparando abordagens
   - Tipo: "playground"
   - Deve ter: leftSide (amador) e rightSide (profissional) com label, placeholder, badge

5. **ATO 5 - RESULT (Revelação)**: O resultado/conclusão com métricas e CTA
   - Tipo: "result"
   - Deve ter: emoji, title, message, metrics[] (label, value, isHighlight), ctaText

## REGRAS:
- Extraia informações REAIS do roteiro, não invente dados
- Cada ato deve ter um narrativeSegment com o trecho do roteiro correspondente
- Mantenha o tom dramático e cinematográfico
- Os valores/números devem vir do roteiro original
- Responda APENAS com JSON válido, sem markdown

## FORMATO DE RESPOSTA:
{
  "acts": [
    {
      "type": "dramatic",
      "title": "O Choque Inicial",
      "narrativeSegment": "Trecho do roteiro...",
      "content": { ... conteúdo específico do tipo ... },
      "visualEffects": { "mood": "dramatic", "particles": true, "glow": true }
    },
    ... mais 4 atos ...
  ],
  "summary": "Resumo da aula em uma frase"
}`;

  const userPrompt = `Analise este roteiro narrativo e gere os 5 atos cinematográficos:

TÍTULO DA AULA: ${title}

ROTEIRO COMPLETO:
${narrativeScript}

Gere os 5 atos (dramatic, comparison, interaction, playground, result) extraindo os dados reais do roteiro.`;

  try {
    console.log('[V7Pipeline:AI] Calling OpenAI for act generation...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[V7Pipeline:AI] OpenAI error:', response.status, errorText);
      return fallbackActParsing(narrativeScript, title);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('[V7Pipeline:AI] No content in response');
      return fallbackActParsing(narrativeScript, title);
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[V7Pipeline:AI] No JSON found in response');
      return fallbackActParsing(narrativeScript, title);
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIGeneratedActs;
    console.log('[V7Pipeline:AI] Successfully generated', parsed.acts.length, 'acts');
    
    // Validate we have 5 acts
    if (parsed.acts.length !== 5) {
      console.warn('[V7Pipeline:AI] Expected 5 acts, got', parsed.acts.length);
      // Fill missing acts
      while (parsed.acts.length < 5) {
        parsed.acts.push(createDefaultAct(parsed.acts.length, narrativeScript));
      }
    }

    return parsed;

  } catch (error: any) {
    console.error('[V7Pipeline:AI] Error:', error);
    return fallbackActParsing(narrativeScript, title);
  }
}

function createDefaultAct(index: number, narrativeScript: string): AIGeneratedActs['acts'][0] {
  const types: V7ActType[] = ['dramatic', 'comparison', 'interaction', 'playground', 'result'];
  const type = types[index] || 'dramatic';
  
  const segment = narrativeScript.slice(
    Math.floor(narrativeScript.length * index / 5),
    Math.floor(narrativeScript.length * (index + 1) / 5)
  );

  const defaultContents: Record<V7ActType, any> = {
    dramatic: {
      mainValue: '98%',
      subtitle: 'das pessoas não sabem usar IA corretamente',
      highlightWord: 'não sabem',
      mood: 'danger'
    },
    narrative: {
      title: 'A História',
      subtitle: 'Entenda o contexto completo',
      content: 'Narrativa de contextualização',
      mood: 'neutral'
    },
    comparison: {
      title: 'A Diferença',
      leftCard: {
        label: 'MAIORIA',
        value: 'R$ 0',
        isPositive: false,
        details: ['Uso básico', 'Sem estratégia', 'Resultados mediocres']
      },
      rightCard: {
        label: 'TOP 2%',
        value: 'R$ 30K',
        isPositive: true,
        details: ['Uso profissional', 'Estratégia clara', 'Resultados extraordinários']
      }
    },
    interaction: {
      title: 'Teste Rápido',
      subtitle: 'Como você usa IA atualmente?',
      options: [
        { id: 'opt1', text: 'Para resolver problemas reais', isCorrect: true },
        { id: 'opt2', text: 'Para curiosidade e testes', isCorrect: false },
        { id: 'opt3', text: 'Raramente uso', isCorrect: false }
      ],
      buttonText: 'Ver Resultado'
    },
    quiz: {
      title: 'Quiz Rápido',
      subtitle: 'Teste seu conhecimento',
      options: [
        { id: 'opt1', text: 'Opção correta', isCorrect: true },
        { id: 'opt2', text: 'Opção incorreta', isCorrect: false }
      ],
      buttonText: 'Verificar'
    },
    playground: {
      title: 'Desafio Prático',
      subtitle: 'Compare as duas abordagens',
      leftSide: {
        label: 'MODO AMADOR',
        placeholder: 'Digite um prompt básico...',
        badge: '❌'
      },
      rightSide: {
        label: 'MODO PROFISSIONAL',
        placeholder: 'Use o método estruturado...',
        isPro: true,
        badge: '✓'
      }
    },
    result: {
      emoji: '🚀',
      title: 'Você Pode Fazer Parte do Top 2%',
      message: 'Agora você conhece o caminho. A escolha é sua.',
      metrics: [
        { label: 'Potencial', value: 'Ilimitado', isHighlight: true },
        { label: 'Próximo Passo', value: 'AGORA' }
      ],
      ctaText: 'Começar Agora',
      celebrationLevel: 'high'
    },
    revelation: {
      emoji: '💡',
      title: 'A Revelação',
      message: 'Agora você entende o método.',
      insights: ['Insight 1', 'Insight 2', 'Insight 3']
    },
    cta: {
      title: 'Próximo Passo',
      subtitle: 'Continue sua jornada',
      buttonText: 'Continuar',
      options: [
        { label: 'Próxima Aula', action: 'next-lesson' },
        { label: 'Praticar Mais', action: 'playground' }
      ]
    },
    gamification: {
      xpEarned: 100,
      coinsEarned: 25,
      badges: ['first-lesson'],
      message: 'Parabéns! Você concluiu a aula.',
      celebrationLevel: 'high'
    }
  };

  return {
    type,
    title: `Ato ${index + 1}`,
    narrativeSegment: segment,
    content: defaultContents[type],
    visualEffects: {
      mood: type === 'dramatic' ? 'dramatic' : type === 'result' ? 'energetic' : 'mysterious',
      particles: true,
      glow: true
    }
  };
}

function fallbackActParsing(narrativeScript: string, title: string): AIGeneratedActs {
  console.log('[V7Pipeline] Using fallback act parsing');
  
  const paragraphs = narrativeScript
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const acts: AIGeneratedActs['acts'] = [];
  const types: V7ActType[] = ['dramatic', 'comparison', 'interaction', 'playground', 'result'];
  
  for (let i = 0; i < 5; i++) {
    const segmentStart = Math.floor(paragraphs.length * i / 5);
    const segmentEnd = Math.floor(paragraphs.length * (i + 1) / 5);
    const segment = paragraphs.slice(segmentStart, segmentEnd).join('\n\n');
    
    acts.push(createDefaultAct(i, segment || narrativeScript));
    acts[i].narrativeSegment = segment || narrativeScript.slice(i * 200, (i + 1) * 200);
  }

  return {
    acts,
    summary: `Aula V7 Cinematográfica: ${title}`
  };
}

// ============================================================================
// BUILD CINEMATIC ACTS
// ============================================================================

function buildCinematicActs(aiActs: AIGeneratedActs, totalDuration: number): V7CinematicAct[] {
  const timePerAct = totalDuration / aiActs.acts.length;
  
  return aiActs.acts.map((act, index) => {
    const startTime = Math.floor(index * timePerAct);
    const endTime = Math.floor((index + 1) * timePerAct);
    
    // Auto-advance for dramatic acts (hook)
    const autoAdvanceMs = act.type === 'dramatic' ? 4000 : 
                          act.type === 'comparison' ? 6000 : 
                          undefined;

    const cinematicAct: V7CinematicAct = {
      id: `act-${index + 1}-${act.type}`,
      type: act.type,
      title: act.title,
      narrativeSegment: act.narrativeSegment,
      startTime,
      endTime,
      autoAdvanceMs,
      content: act.content,
      visualEffects: {
        mood: mapMood(act.type, act.visualEffects?.mood),
        particles: act.visualEffects?.particles ?? true,
        glow: act.visualEffects?.glow ?? true,
        blur: act.type === 'dramatic' || act.type === 'result',
        rays: act.type === 'dramatic' || act.type === 'result',
      },
      soundEffects: {
        onEnter: getSoundForAct(act.type, 'enter'),
        onAction: getSoundForAct(act.type, 'action'),
        ambient: act.type === 'dramatic' ? 'ambient-low' : undefined,
      },
    };

    return cinematicAct;
  });
}

function mapMood(actType: V7ActType, aiMood?: string): 'dramatic' | 'calm' | 'energetic' | 'mysterious' {
  if (aiMood && ['dramatic', 'calm', 'energetic', 'mysterious'].includes(aiMood)) {
    return aiMood as any;
  }
  
  switch (actType) {
    case 'dramatic': return 'dramatic';
    case 'comparison': return 'mysterious';
    case 'interaction': return 'energetic';
    case 'playground': return 'calm';
    case 'result': return 'energetic';
    default: return 'dramatic';
  }
}

function getSoundForAct(actType: V7ActType, trigger: 'enter' | 'action'): string {
  const sounds: Record<V7ActType, { enter: string; action: string }> = {
    dramatic: { enter: 'transition-dramatic', action: 'dramatic-hit' },
    narrative: { enter: 'transition-whoosh', action: 'reveal' },
    comparison: { enter: 'transition-whoosh', action: 'reveal' },
    interaction: { enter: 'transition-whoosh', action: 'click-confirm' },
    quiz: { enter: 'transition-whoosh', action: 'click-confirm' },
    playground: { enter: 'transition-whoosh', action: 'success' },
    result: { enter: 'reveal', action: 'completion' },
    revelation: { enter: 'reveal', action: 'success' },
    cta: { enter: 'transition-whoosh', action: 'click-confirm' },
    gamification: { enter: 'celebration', action: 'completion' },
  };
  
  return sounds[actType]?.[trigger] || 'transition-whoosh';
}

// ============================================================================
// RECALCULATE TIMINGS FROM WORD TIMESTAMPS
// ============================================================================

function recalculateActTimingsFromWordTimestamps(
  acts: V7CinematicAct[],
  wordTimestamps: WordTimestamp[],
  narrativeScript: string
): void {
  if (acts.length === 0 || wordTimestamps.length === 0) return;

  console.log('[V7Pipeline] Recalculating act timings from', wordTimestamps.length, 'word timestamps');

  // ✅ FIX BUG #8: Distribute words PROPORTIONALLY to act duration (not uniformly)
  const totalWords = wordTimestamps.length;
  const totalAudioDuration = wordTimestamps[totalWords - 1].end;

  // Calculate each act's proportion of total duration
  const actProportions = acts.map(act => {
    const actDuration = act.endTime - act.startTime;
    return actDuration / totalAudioDuration;
  });

  let currentWordIndex = 0;

  acts.forEach((act, index) => {
    // Calculate how many words this act should get based on its duration
    const actWordCount = Math.floor(totalWords * actProportions[index]);
    const startWordIndex = currentWordIndex;
    let endWordIndex = Math.min(
      currentWordIndex + actWordCount - 1,
      totalWords - 1
    );

    // For last act, use all remaining words
    if (index === acts.length - 1) {
      endWordIndex = totalWords - 1;
    }

    // Assign timing from word timestamps
    if (startWordIndex < totalWords) {
      act.startTime = wordTimestamps[startWordIndex].start;
    }

    if (endWordIndex < totalWords && endWordIndex >= startWordIndex) {
      act.endTime = wordTimestamps[endWordIndex].end;
    }

    // Move to next batch of words
    currentWordIndex = endWordIndex + 1;

    const wordsAssigned = endWordIndex - startWordIndex + 1;
    console.log(`[V7Pipeline] Act ${index + 1}: ${act.startTime.toFixed(2)}s - ${act.endTime.toFixed(2)}s (${wordsAssigned} words, ${actProportions[index].toFixed(1)}% duration)`);
  });
}

// ============================================================================
// ELEVENLABS AUDIO GENERATION
// ============================================================================

async function generateAudioWithElevenLabs(
  text: string,
  voiceId?: string,
  supabase?: any
): Promise<{
  success: boolean;
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];
  error?: string;
}> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  
  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ELEVENLABS_API_KEY not configured' };
  }
  
  const voice = voiceId || 'Xb7hH8MSUJpSbSDYk0k2'; // Alice - good for Portuguese
  const modelId = 'eleven_multilingual_v2';
  
  console.log('[V7Pipeline:Audio] Generating audio...');
  console.log('[V7Pipeline:Audio] Voice ID:', voice);
  console.log('[V7Pipeline:Audio] Text length:', text.length);
  
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[V7Pipeline:Audio] ElevenLabs error:', response.status, errorText);
      return { success: false, error: `ElevenLabs API error: ${response.status}` };
    }
    
    const data = await response.json();
    const audioBase64 = data.audio_base64;
    const alignment = data.alignment;
    
    if (!audioBase64) {
      return { success: false, error: 'No audio in response' };
    }
    
    console.log('[V7Pipeline:Audio] Audio generated, base64 length:', audioBase64.length);
    
    // Process word timestamps
    let wordTimestamps: WordTimestamp[] = [];
    if (alignment?.characters && alignment?.character_start_times_seconds) {
      wordTimestamps = processWordTimestamps(
        alignment.characters,
        alignment.character_start_times_seconds
      );
      console.log('[V7Pipeline:Audio] Processed', wordTimestamps.length, 'word timestamps');
    }
    
    // Upload to Supabase Storage
    let audioUrl = '';
    if (supabase) {
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const fileName = `v7-cinematic-${Date.now()}.mp3`;
      
      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('[V7Pipeline:Audio] Upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('lesson-audios')
          .getPublicUrl(fileName);
        audioUrl = urlData.publicUrl;
        console.log('[V7Pipeline:Audio] Uploaded to:', audioUrl);
      }
    }
    
    return {
      success: true,
      audioUrl,
      wordTimestamps,
    };
    
  } catch (error: any) {
    console.error('[V7Pipeline:Audio] Error:', error);
    return { success: false, error: error.message };
  }
}

function processWordTimestamps(
  characters: string[],
  characterStartTimes: number[]
): WordTimestamp[] {
  const words: WordTimestamp[] = [];
  let currentWord = '';
  let wordStartIndex = 0;
  
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    
    if (char === ' ' || char === '\n' || i === characters.length - 1) {
      if (i === characters.length - 1 && char !== ' ' && char !== '\n') {
        currentWord += char;
      }
      
      if (currentWord.trim().length > 0) {
        const cleanWord = currentWord.trim();
        const startTime = characterStartTimes[wordStartIndex];
        const endTime = i < characters.length - 1
          ? characterStartTimes[i]
          : characterStartTimes[characterStartTimes.length - 1];
        
        words.push({ word: cleanWord, start: startTime, end: endTime });
      }
      
      currentWord = '';
      wordStartIndex = i + 1;
    } else {
      currentWord += char;
    }
  }
  
  return words;
}
