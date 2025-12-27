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
// RETRY UTILITY - Exponential backoff for transient API failures
// ============================================================================

interface RetryOptions {
  maxRetries?: number;      // Default: 3
  initialDelayMs?: number;  // Default: 1000 (1 second)
  maxDelayMs?: number;      // Default: 10000 (10 seconds)
  backoffFactor?: number;   // Default: 2
  retryOn?: (error: any, response?: Response) => boolean;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffFactor = 2,
    retryOn = (error, response) => {
      // Retry on network errors
      if (error) return true;
      // Retry on 429 (rate limit) and 5xx errors
      if (response && (response.status === 429 || response.status >= 500)) return true;
      return false;
    }
  } = retryOptions;

  let lastError: any;
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Check if we should retry based on response
      if (!retryOn(null, response) || attempt === maxRetries) {
        return response;
      }

      lastResponse = response;
      console.warn(`[V7Pipeline:Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed with status ${response.status}, retrying...`);

    } catch (error: unknown) {
      lastError = error;

      if (!retryOn(error) || attempt === maxRetries) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[V7Pipeline:Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed with error: ${errorMessage}, retrying...`);
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(initialDelayMs * Math.pow(backoffFactor, attempt), maxDelayMs);
    console.log(`[V7Pipeline:Retry] Waiting ${delay}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // This should never be reached, but just in case
  if (lastResponse) return lastResponse;
  throw lastError || new Error('All retries exhausted');
}

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

  // ✅ V7.1 FIX: Option to fail pipeline if audio generation fails
  fail_on_audio_error?: boolean;  // If true, throw error instead of saving without audio

  // ✅ V7-v2: Audio config and fallbacks
  audioConfig?: {
    narrationVoice?: string;
    voiceSettings?: any;
    backgroundMusic?: any;
    soundEffects?: any[];
  };
  fallbacks?: {
    noWordTimestamps?: any;
    audioLoadError?: any;
    interactionTimeout?: any;
  };
  anchorPoints?: Array<{
    keyword: string;
    action: string;
    phase?: string;
    [key: string]: any;
  }>;

  // Support for rich cinematic_flow.acts structure (V7-v2 format)
  cinematic_flow?: {
    acts: Array<{
      id?: string;
      type: string;
      title?: string;
      startTime?: number;
      duration?: number;

      // ✅ V7-v2: narration directly at act level
      narration?: string;

      // ✅ V7-v2: Visual and audio configs at act level
      visual?: any;
      audio?: any;
      transitions?: any;
      anchorPoints?: any[];

      // ✅ V7-v2: Interaction config
      interaction?: any;
      audioBehavior?: {
        onStart?: string;
        duringInteraction?: any;
        onComplete?: string;
      };
      timeout?: {
        soft?: number;
        medium?: number;
        hard?: number;
        hints?: any[];
        autoAction?: any;
      };
      tracking?: any;

      // Legacy content structure (also supported)
      content?: {
        visual?: {
          instruction?: string;
          text?: string;
          [key: string]: any;
        };
        audio?: {
          narration?: string;
          [key: string]: any;
        };
        interaction?: any;
        [key: string]: any;
      };
    }>;
    timeline?: {
      totalDuration?: number;
      chapters?: any[];
    };
  };

  // ✅ V7-v3: Support for cinematicFlow.phases structure (camelCase)
  cinematicFlow?: {
    phases: Array<{
      id: string;
      type: string;
      title?: string;
      order?: number;
      trigger?: any;
      visual?: {
        instruction?: string;
        [key: string]: any;
      };
      audio?: {
        narration?: string;
        text?: string;
        [key: string]: any;
      };
      // V7-v3: narration can be a separate object
      narration?: {
        text: string;
        estimatedDuration?: number;
      };
      anchorText?: {
        endPhrase?: string;
        pausePhrase?: string;
        notes?: string;
      };
      cinematography?: any;
      visualContent?: any;
      content?: any;
    }>;
    totalPhases?: number;
    transitionMethod?: string;
    notes?: string;
    metadata?: any;
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
  hookQuestion?: string;  // "VOCÊ SABIA?" - teaser shown during letterbox
  impactWord?: string;    // "FRACASSO" - impact word shown at end
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
// NARRATION EXTRACTION HELPER
// ============================================================================

/**
 * ✅ V7.1 FIX: Centralized narration extraction
 * Handles all possible narration locations in a single function.
 *
 * Priority order:
 * 1. act.narration (string) - V7-v2 format
 * 2. phase.narration.text - V7-v3 format
 * 3. phase.audio.narration - Alternative format
 * 4. phase.audio.text - Fallback
 * 5. act.content.narration.text - Nested content
 * 6. act.content.audio.narration - Legacy format
 */
function extractNarration(item: any): string {
  // V7-v2: narration at top level (string)
  if (typeof item.narration === 'string' && item.narration.trim().length > 0) {
    return item.narration;
  }

  // V7-v3: narration as object with text
  if (item.narration?.text && typeof item.narration.text === 'string') {
    return item.narration.text;
  }

  // Alternative: audio.narration
  if (item.audio?.narration && typeof item.audio.narration === 'string') {
    return item.audio.narration;
  }

  // Fallback: audio.text
  if (item.audio?.text && typeof item.audio.text === 'string') {
    return item.audio.text;
  }

  // Nested: content.narration.text
  if (item.content?.narration?.text && typeof item.content.narration.text === 'string') {
    return item.content.narration.text;
  }

  // Legacy: content.audio.narration
  if (item.content?.audio?.narration && typeof item.content.audio.narration === 'string') {
    return item.content.audio.narration;
  }

  return '';
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
    
    // Check if using:
    // - cinematicFlow.phases (V7-v3 camelCase format)
    // - cinematic_flow.acts (V7-v2 snake_case format)
    // - narrativeScript (flat text)
    const hasCinematicFlowV3 = input.cinematicFlow?.phases && input.cinematicFlow.phases.length > 0;
    const hasCinematicFlowV2 = input.cinematic_flow?.acts && input.cinematic_flow.acts.length > 0;
    const hasCinematicFlow = hasCinematicFlowV3 || hasCinematicFlowV2;
    
    if (hasCinematicFlowV3) {
      console.log('[V7Pipeline] Using cinematicFlow.phases (V7-v3) with', input.cinematicFlow!.phases.length, 'phases');
    } else if (hasCinematicFlowV2) {
      console.log('[V7Pipeline] Using cinematic_flow.acts (V7-v2) with', input.cinematic_flow!.acts.length, 'acts');
    } else {
      console.log('[V7Pipeline] Using flat narrativeScript, length:', input.narrativeScript?.length || 0);
    }

    if (!input.title) {
      throw new Error('Title is required');
    }
    
    if (!hasCinematicFlow && !input.narrativeScript) {
      throw new Error('Either cinematicFlow.phases, cinematic_flow.acts or narrativeScript is required');
    }

    // ========================================================================
    // STEP 1: Process Acts (from cinematic_flow or AI generation)
    // ========================================================================
    let aiGeneratedActs: AIGeneratedActs;
    let narrativeForAudio = '';
    let narrationCount = 0; // Track narration count for stats

    if (hasCinematicFlowV3) {
      // ✅ V7-v3: Process cinematicFlow.phases (camelCase format)
      console.log('[V7Pipeline] Step 1: Processing cinematicFlow.phases (V7-v3)...');

      const narrations: string[] = [];

      // DEBUG: Log the first phase to see its structure
      const firstPhase = input.cinematicFlow!.phases[0];
      console.log('[V7Pipeline:DEBUG] First phase keys:', Object.keys(firstPhase || {}));
      console.log('[V7Pipeline:DEBUG] First phase.narration:', JSON.stringify((firstPhase as any)?.narration));
      console.log('[V7Pipeline:DEBUG] First phase.audio:', JSON.stringify(firstPhase?.audio));
      console.log('[V7Pipeline:DEBUG] First phase.content:', JSON.stringify((firstPhase as any)?.content)?.slice(0, 200));

      aiGeneratedActs = {
        acts: input.cinematicFlow!.phases.map((phase, index) => {
          // ✅ V7.1 FIX: Use centralized extractNarration helper
          const narration = extractNarration(phase);

          if (index === 0) {
            console.log('[V7Pipeline:DEBUG] Phase 0 narration extraction via extractNarration():', {
              'narration': narration?.slice?.(0, 50) || 'EMPTY',
            });
          }

          if (narration) {
            narrations.push(narration);
          }

          return {
            type: (phase.type || 'dramatic') as V7ActType,
            title: phase.title || `Fase ${index + 1}`,
            narrativeSegment: narration,
            content: {
              visual: phase.visual || {},
              audio: phase.audio || {},
              cinematography: phase.cinematography || null,
              anchorText: phase.anchorText || null,
              // Pass through any other content
              ...((phase as any).content || {}),
            },
            visualEffects: {
              mood: phase.cinematography?.opening?.effect || 'dramatic',
              particles: true,
              glow: true,
            },
          };
        }),
        summary: `Aula V7-v3 Cinematográfica: ${input.title}`,
      };

      narrativeForAudio = narrations.join('\n\n');
      narrationCount = narrations.length;
      console.log('[V7Pipeline] Extracted', narrationCount, 'narration segments from V7-v3 phases');
      console.log('[V7Pipeline] Total narration length:', narrativeForAudio.length);

      // ✅ V7.1 VALIDATION: Strict validation for interactive phases
      const validationErrors: string[] = [];
      const validationWarnings: string[] = [];

      input.cinematicFlow!.phases.forEach((phase, index) => {
        const phaseAny = phase as any;
        const isInteractive = phase.type === 'interaction' || phase.type === 'quiz' || phase.type === 'playground';

        // ✅ V7.1 FIX: pauseKeyword is REQUIRED for interactive phases
        if (isInteractive) {
          const pauseKeyword = phase.anchorText?.pausePhrase || phaseAny.pauseKeyword;
          if (!pauseKeyword) {
            validationErrors.push(
              `Phase ${index + 1} (${phase.id || phase.type}): MISSING pauseKeyword. ` +
              `Interactive phases MUST have anchorText.pausePhrase or pauseKeyword for word-based sync.`
            );
          }
        }

        // Validate quiz options
        if (phase.type === 'interaction' || phase.type === 'quiz') {
          const options = phaseAny.interaction?.options || phaseAny.visualContent?.options;
          if (!options || !Array.isArray(options) || options.length === 0) {
            validationErrors.push(`Phase ${index + 1} (${phase.id || phase.type}): Missing or empty interaction.options`);
          } else {
            options.forEach((opt: any, optIndex: number) => {
              if (!opt.id && !opt.text) {
                validationErrors.push(`Phase ${index + 1}, Option ${optIndex + 1}: Missing id and text`);
              }
            });
          }
        }

        // Validate playground config
        if (phase.type === 'playground') {
          const interaction = phaseAny.interaction;
          if (!interaction) {
            validationErrors.push(`Phase ${index + 1} (${phase.id || phase.type}): Missing interaction config for playground`);
          } else {
            // Check for required playground fields
            if (!interaction.amateurPrompt && !interaction.challenge) {
              validationWarnings.push(`Phase ${index + 1} (${phase.id}): Playground missing amateurPrompt or challenge`);
            }
          }
        }

        // Check narration exists - use centralized extractNarration
        const narration = extractNarration(phase);
        if (!narration || narration.trim().length === 0) {
          validationWarnings.push(`Phase ${index + 1} (${phase.id || phase.type}): No narration text found`);
        }
      });

      // ✅ V7.1 FIX: FAIL on validation errors (not just warnings)
      if (validationErrors.length > 0) {
        console.error('[V7Pipeline:Validation] ❌ ERRORS found:', validationErrors);
        throw new Error(`V7 Validation Failed:\n${validationErrors.join('\n')}`);
      }

      if (validationWarnings.length > 0) {
        console.warn('[V7Pipeline:Validation] ⚠️ Warnings:', validationWarnings);
      } else {
        console.log('[V7Pipeline:Validation] ✅ All phases validated successfully');
      }

    } else if (hasCinematicFlowV2) {
      // V7-v2: Process cinematic_flow.acts (snake_case format)
      console.log('[V7Pipeline] Step 1: Processing cinematic_flow.acts (V7-v2)...');

      const narrations: string[] = [];

      aiGeneratedActs = {
        acts: input.cinematic_flow!.acts.map((act, index) => {
          // ✅ V7.1 FIX: Use centralized extractNarration helper
          const narration = extractNarration(act);

          if (narration) {
            narrations.push(narration);
          }

          return {
            type: (act.type || 'dramatic') as V7ActType,
            title: act.title || `Ato ${index + 1}`,
            narrativeSegment: narration,
            content: {
              visual: act.visual || act.content?.visual || {},
              interaction: act.interaction || act.content?.interaction || null,
              audio: act.audio || act.content?.audio || {},
              audioBehavior: act.audioBehavior || null,
              timeout: act.timeout || null,
              transitions: act.transitions || null,
              anchorPoints: act.anchorPoints || null,
              tracking: act.tracking || null,
              ...act.content,
            },
            visualEffects: {
              mood: act.visual?.mood || act.content?.visual?.mood || 'dramatic',
              particles: act.visual?.particles?.enabled ?? true,
              glow: act.visual?.glow ?? true,
            },
          };
        }),
        summary: `Aula V7-v2 Cinematográfica: ${input.title}`,
      };

      if (narrations.length === 0 && input.narrativeScript) {
        console.log('[V7Pipeline] No act-level narrations found, using global narrativeScript');
        narrativeForAudio = input.narrativeScript;
        narrationCount = 1;
      } else {
        narrativeForAudio = narrations.join('\n\n');
        narrationCount = narrations.length;
      }

      console.log('[V7Pipeline] Extracted', narrationCount, 'narration segments for TTS');
      console.log('[V7Pipeline] Total narration length:', narrativeForAudio.length);

      // ✅ V7.1 VALIDATION: Strict validation for V7-v2 acts
      const validationErrors: string[] = [];
      const validationWarnings: string[] = [];

      input.cinematic_flow!.acts.forEach((act, index) => {
        const actAny = act as any;
        const isInteractive = act.type === 'interaction' || act.type === 'quiz' || act.type === 'playground';

        // ✅ V7.1 FIX: pauseKeyword is REQUIRED for interactive acts
        if (isInteractive) {
          const pauseKeyword = actAny.pauseKeyword || actAny.pauseKeywords?.[0];
          if (!pauseKeyword) {
            validationErrors.push(
              `Act ${index + 1} (${act.id || act.type}): MISSING pauseKeyword. ` +
              `Interactive acts MUST have pauseKeyword for word-based sync.`
            );
          }
        }

        // Validate quiz/interaction options
        if (act.type === 'interaction' || act.type === 'quiz') {
          const options = act.interaction?.options || actAny.visual?.options;
          if (!options || !Array.isArray(options) || options.length === 0) {
            validationErrors.push(`Act ${index + 1} (${act.id || act.type}): Missing or empty interaction.options`);
          } else {
            options.forEach((opt: any, optIndex: number) => {
              if (!opt.id && !opt.text) {
                validationErrors.push(`Act ${index + 1}, Option ${optIndex + 1}: Missing id and text`);
              }
            });
          }
        }

        // Validate playground config
        if (act.type === 'playground') {
          const interaction = act.interaction;
          if (!interaction) {
            validationErrors.push(`Act ${index + 1} (${act.id || act.type}): Missing interaction config for playground`);
          } else {
            if (!interaction.amateurPrompt && !interaction.challenge) {
              validationWarnings.push(`Act ${index + 1} (${act.id}): Playground missing amateurPrompt or challenge`);
            }
          }
        }

        // Check narration exists - use centralized extractNarration
        const narration = extractNarration(act);
        if (!narration || narration.trim().length === 0) {
          validationWarnings.push(`Act ${index + 1} (${act.id || act.type}): No narration text found`);
        }
      });

      // ✅ V7.1 FIX: FAIL on validation errors (not just warnings)
      if (validationErrors.length > 0) {
        console.error('[V7Pipeline:Validation:V2] ❌ ERRORS found:', validationErrors);
        throw new Error(`V7-v2 Validation Failed:\n${validationErrors.join('\n')}`);
      }

      if (validationWarnings.length > 0) {
        console.warn('[V7Pipeline:Validation:V2] ⚠️ Warnings:', validationWarnings);
      } else {
        console.log('[V7Pipeline:Validation:V2] ✅ All acts validated successfully');
      }

    } else {
      // Use AI to generate acts from flat narrativeScript
      console.log('[V7Pipeline] Step 1: Generating cinematic acts with AI...');
      aiGeneratedActs = await generateActsWithAI(input.narrativeScript, input.title);
      narrativeForAudio = input.narrativeScript;
    }
    
    console.log('[V7Pipeline] Processed', aiGeneratedActs.acts.length, 'acts');

    // ========================================================================
    // STEP 2: Build V7 Cinematic Acts Structure (with input act durations)
    // ========================================================================
    console.log('[V7Pipeline] Step 2: Building cinematic act structure...');

    // Pass input acts to preserve their duration ratios
    // For V7-v3, phases don't have duration, so use undefined
    const inputActsForScaling = hasCinematicFlowV2 ? input.cinematic_flow!.acts : undefined;
    const cinematicActs = buildCinematicActs(aiGeneratedActs, input.duration, inputActsForScaling);
    console.log('[V7Pipeline] Built', cinematicActs.length, 'cinematic acts');

    // ========================================================================
    // STEP 3: Generate Audio with ElevenLabs (ONLY from narration, not visual instructions)
    // ========================================================================
    let audioUrl = '';
    let wordTimestamps: WordTimestamp[] = [];
    
    const shouldGenerateAudio = input.generate_audio !== false && narrativeForAudio.length > 0;
    let audioGenerationError: string | null = null;  // ✅ Track audio errors

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
          // Legacy proportional recalculation (kept for compatibility)
          recalculateActTimingsFromWordTimestamps(
            cinematicActs,
            wordTimestamps,
            narrativeForAudio
          );

          // ✅ V7.1: WORD-BASED timing - uses pauseKeywords for precise sync
          if (hasCinematicFlowV3 && input.cinematicFlow?.phases) {
            // V7-v3: Use anchorText.pausePhrase for word-based timing
            calculateWordBasedTimings(
              cinematicActs,
              wordTimestamps,
              input.cinematicFlow.phases.map(phase => ({
                pauseKeyword: phase.anchorText?.pausePhrase || undefined,
                pauseKeywords: phase.anchorText?.pausePhrase ? [phase.anchorText.pausePhrase] : undefined,
                narration: phase.audio?.narration || '',
                type: phase.type,
              }))
            );
          } else if (hasCinematicFlowV2 && input.cinematic_flow?.acts) {
            // V7-v2: Use pauseKeyword for word-based timing
            calculateWordBasedTimings(
              cinematicActs,
              wordTimestamps,
              input.cinematic_flow.acts.map(act => ({
                pauseKeyword: (act as any).pauseKeyword,
                pauseKeywords: (act as any).pauseKeywords,
                narration: act.narration || (act.content as any)?.audio?.narration || '',
                type: act.type,
              }))
            );
          }
        }
      } else {
        // ✅ V7-v2 FIX: Track error instead of silent failure
        audioGenerationError = audioResult.error || 'Unknown audio generation error';
        console.error('[V7Pipeline] ❌ Audio generation FAILED:', audioGenerationError);

        // ✅ V7.1 FIX: Optionally fail the entire pipeline if audio fails
        if (input.fail_on_audio_error) {
          throw new Error(`Audio generation failed: ${audioGenerationError}. Pipeline aborted because fail_on_audio_error=true.`);
        }

        console.error('[V7Pipeline] ⚠️ Lesson will be saved WITHOUT audio - admin should regenerate');
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
    
    // Build cinematic_flow for saving - supports both V7-v2 and V7-v3 formats
    let cinematic_flow: any = undefined;
    let cinematicFlow: any = undefined;

    if (hasCinematicFlowV3 && input.cinematicFlow?.phases) {
      // ✅ V7-v3: Build cinematicFlow.phases with calculated timings
      cinematicFlow = {
        phases: input.cinematicFlow.phases.map((phase, index) => {
          const scaledAct = cinematicActs[index];
          const startTime = scaledAct ? scaledAct.startTime : 0;
          const endTime = scaledAct ? scaledAct.endTime : startTime + 60;

          return {
            ...phase,
            // Add calculated timing (for reference, but anchorText is primary)
            calculatedTiming: {
              startTime,
              endTime,
              duration: endTime - startTime,
            },
          };
        }),
        metadata: {
          ...input.cinematicFlow.metadata,
          totalDuration,
          processedAt: new Date().toISOString(),
        },
      };

      console.log('[V7Pipeline] V7-v3 phases processed:', cinematicFlow.phases.length);

    } else if (hasCinematicFlowV2 && input.cinematic_flow?.acts) {
      // ✅ V7-v2: Save cinematic_flow with SCALED durations
      cinematic_flow = {
        acts: input.cinematic_flow.acts.map((act, index) => {
          const scaledAct = cinematicActs[index];
          const scaledDuration = scaledAct ? scaledAct.endTime - scaledAct.startTime : act.duration || 60;
          const scaledStartTime = scaledAct ? scaledAct.startTime : act.startTime || 0;
          const scaledEndTime = scaledAct ? scaledAct.endTime : scaledStartTime + scaledDuration;

          const narration = act.narration || act.content?.audio?.narration || '';
          const pauseKeyword = (scaledAct as any)?.pauseKeyword ||
                              (act as any).pauseKeyword ||
                              (act as any).pauseKeywords?.[0] ||
                              null;
          const pauseTime = (scaledAct as any)?.pauseTime || null;

          return {
            id: act.id || `act-${index + 1}`,
            type: act.type,
            title: act.title,
            subtype: (act as any).subtype,
            duration: scaledDuration,
            startTime: scaledStartTime,
            endTime: scaledEndTime,
            pauseKeyword: pauseKeyword,
            pauseTime: pauseTime,
            pauseKeywords: (act as any).pauseKeywords || (pauseKeyword ? [pauseKeyword] : []),
            narration: narration,
            visual: act.visual || act.content?.visual || {},
            audio: act.audio || act.content?.audio || {},
            transitions: act.transitions || {},
            interaction: act.interaction || act.content?.interaction || null,
            audioBehavior: act.audioBehavior || null,
            timeout: act.timeout || null,
            anchorPoints: act.anchorPoints || null,
            tracking: act.tracking || null,
            content: {
              ...act.content,
              visual: act.visual || act.content?.visual || {},
              audio: {
                narration: narration,
                ...act.content?.audio,
              },
              interaction: act.interaction || act.content?.interaction || null,
              pauseKeyword: pauseKeyword,
            },
          };
        }),
        timeline: {
          ...input.cinematic_flow.timeline,
          totalDuration,
        },
      };

      console.log('[V7Pipeline] V7-v2 cinematic_flow acts with SCALED durations:',
        cinematic_flow.acts.map((a: any, i: number) => `Act ${i+1}: ${a.startTime?.toFixed(1)}s-${a.endTime?.toFixed(1)}s`)
      );
    }

    const lessonContent = {
      model: 'v7-cinematic',
      version: hasCinematicFlowV3 ? '7.3' : '7.1', // v7.3 for phases, v7.1 for acts
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
        generatedBy: hasCinematicFlowV3 ? 'v7-pipeline-v3' : (hasCinematicFlowV2 ? 'v7-pipeline-v2' : 'v7-pipeline-ai'),
        hasCinematicFlow: hasCinematicFlow,
        format: hasCinematicFlowV3 ? 'phases' : 'acts',
      },

      // ✅ V7-v2: Enhanced audio config
      audioConfig: {
        url: audioUrl,
        format: 'mp3',
        sampleRate: 44100,
        hasWordTimestamps: wordTimestamps.length > 0,
        // ✅ V7-v2: Include user's audio config
        narrationVoice: input.audioConfig?.narrationVoice,
        voiceSettings: input.audioConfig?.voiceSettings,
        backgroundMusic: input.audioConfig?.backgroundMusic,
        soundEffects: input.audioConfig?.soundEffects,
      },

      // ✅ V7-v2: Fallback configurations
      fallbacks: input.fallbacks || {
        noWordTimestamps: {
          strategy: 'percentage',
          pauseAt: 0.3,
          duration: 3000,
        },
        audioLoadError: {
          showSubtitles: true,
          continueWithText: true,
        },
      },

      // ✅ V7-v2: Global anchor points
      anchorPoints: input.anchorPoints || [],

      // Store the original cinematic_flow for frontend to use (V7-v2)
      cinematic_flow: cinematic_flow,

      // ✅ V7-v3: Store cinematicFlow.phases for frontend
      cinematicFlow: cinematicFlow,

      // Also store the processed structure for backward compatibility
      cinematicStructure: {
        acts: cinematicActs,
        totalDuration: totalDuration,
        actTypes: cinematicActs.map(a => a.type),
      },

      interactivity: {
        pausePoints: cinematicActs
          .filter(a => a.type === 'interaction' || a.type === 'playground' || a.type === 'cta')
          .map(a => ({ actId: a.id, time: a.startTime, type: a.type })),
        quizzes: cinematicActs
          .filter(a => a.type === 'interaction' || a.type === 'quiz')
          .map(a => ({
            actId: a.id,
            options: (a.content as V7InteractionContent).options,
            // ✅ V7-v2: Include audioBehavior and timeout
            audioBehavior: (a.content as any).audioBehavior,
            timeout: (a.content as any).timeout,
          })),
        playgrounds: cinematicActs
          .filter(a => a.type === 'playground')
          .map(a => ({
            actId: a.id,
            config: a.content as V7PlaygroundContent,
            // ✅ V7-v2: Include audioBehavior and timeout
            audioBehavior: (a.content as any).audioBehavior,
            timeout: (a.content as any).timeout,
          })),
        ctas: cinematicActs
          .filter(a => a.type === 'cta' || a.type === 'revelation')
          .map(a => ({
            actId: a.id,
            config: a.content,
            audioBehavior: (a.content as any).audioBehavior,
            timeout: (a.content as any).timeout,
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
      // ✅ V7-v2 FIX: Include warnings so frontend can alert admin
      warnings: audioGenerationError ? [{
        type: 'audio_generation_failed',
        message: `Audio generation failed: ${audioGenerationError}. Lesson saved without audio.`,
        severity: 'high',
        action: 'regenerate_audio'
      }] : [],
      stats: {
        actCount: cinematicActs.length,
        narrationCount: narrationCount, // Number of audio.narration segments extracted
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
        audioSource: hasCinematicFlow ? (narrationCount > 0 ? 'audio.narration' : 'narrativeScript') : 'narrativeScript',
        // ✅ V7-v2: Include audio error for debugging
        audioError: audioGenerationError || null,
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
   - Deve ter:
     - hookQuestion: pergunta teaser que aparece na abertura (ex: "VOCÊ SABIA?", "E SE EU TE DISSER...")
     - mainValue: estatística/número impactante (ex: "78%", "3x", "R$ 30K")
     - subtitle: frase que contextualiza o número (ex: "dos profissionais não sabem usar IA")
     - highlightWord: palavra-chave para destacar (ex: "não sabem")
     - impactWord: palavra de impacto final (ex: "FRACASSO", "REVOLUÇÃO", "OPORTUNIDADE")
     - mood: tom emocional (danger/success/warning/neutral)

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
- Para o ATO DRAMATIC: hookQuestion deve ser uma pergunta provocativa, impactWord deve ser UMA palavra de impacto

## FORMATO DE RESPOSTA:
{
  "acts": [
    {
      "type": "dramatic",
      "title": "O Choque Inicial",
      "narrativeSegment": "Trecho do roteiro...",
      "content": {
        "hookQuestion": "VOCÊ SABIA?",
        "mainValue": "78%",
        "subtitle": "dos prompts falham por serem mal escritos",
        "highlightWord": "mal escritos",
        "impactWord": "FRACASSO",
        "mood": "danger"
      },
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
    console.log('[V7Pipeline:AI] Calling OpenAI for act generation (with retry)...');

    // ✅ P1 FIX: Use fetchWithRetry for transient failure recovery
    const response = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
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
      },
      { maxRetries: 2, initialDelayMs: 1000 }
    );

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
      hookQuestion: 'VOCÊ SABIA?',
      mainValue: '98%',
      subtitle: 'das pessoas não sabem usar IA corretamente',
      highlightWord: 'não sabem',
      impactWord: 'OPORTUNIDADE',
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
// BUILD CINEMATIC ACTS (with CORRECT proportional scaling)
// ============================================================================

function buildCinematicActs(
  aiActs: AIGeneratedActs,
  totalDuration: number,
  inputActs?: Array<{ duration?: number; startTime?: number; endTime?: number }>
): V7CinematicAct[] {
  // Calculate total duration from input acts (if they have durations)
  let totalInputDuration = 0;
  if (inputActs && inputActs.length > 0) {
    totalInputDuration = inputActs.reduce((sum, act) => {
      return sum + (act.duration || (act.endTime && act.startTime ? act.endTime - act.startTime : 60));
    }, 0);
  }

  // If input acts have durations, calculate scale factor
  // Otherwise, distribute time equally
  const hasInputDurations = totalInputDuration > 0 && inputActs && inputActs.length > 0;
  const scaleFactor = hasInputDurations ? totalDuration / totalInputDuration : 1;
  const equalTimePerAct = totalDuration / aiActs.acts.length;

  console.log(`[V7Pipeline:BuildActs] Total duration: ${totalDuration}s`);
  console.log(`[V7Pipeline:BuildActs] Input acts duration: ${totalInputDuration}s`);
  console.log(`[V7Pipeline:BuildActs] Scale factor: ${scaleFactor.toFixed(3)}`);

  let currentTime = 0;

  return aiActs.acts.map((act, index) => {
    // Get original duration from input acts if available
    const inputAct = inputActs?.[index];
    const originalDuration = inputAct?.duration ||
      (inputAct?.endTime && inputAct?.startTime ? inputAct.endTime - inputAct.startTime : 0);

    // Calculate scaled duration
    let duration: number;
    if (hasInputDurations && originalDuration > 0) {
      duration = Math.max(5, originalDuration * scaleFactor); // Scale with minimum 5s
    } else {
      duration = equalTimePerAct; // Equal distribution fallback
    }

    const startTime = currentTime;
    const endTime = currentTime + duration;
    currentTime = endTime;

    console.log(`[V7Pipeline:BuildActs] Act ${index + 1} "${act.type}": ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s (${duration.toFixed(1)}s, original: ${originalDuration}s)`);

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
// RECALCULATE TIMINGS FROM WORD TIMESTAMPS (CORRECTLY!)
// ============================================================================

function recalculateActTimingsFromWordTimestamps(
  acts: V7CinematicAct[],
  wordTimestamps: WordTimestamp[],
  narrativeScript: string
): void {
  if (acts.length === 0 || wordTimestamps.length === 0) return;

  console.log('[V7Pipeline] Recalculating act timings from', wordTimestamps.length, 'word timestamps');

  const totalWords = wordTimestamps.length;
  const totalAudioDuration = wordTimestamps[totalWords - 1].end;

  // The acts ALREADY have correct proportional timings from buildCinematicActs
  // Here we just need to distribute words to match those proportions

  // Calculate total duration from acts (should already match audio duration)
  const totalActsDuration = acts.reduce((sum, act) => sum + (act.endTime - act.startTime), 0);

  console.log(`[V7Pipeline:Recalculate] Total audio duration: ${totalAudioDuration.toFixed(2)}s`);
  console.log(`[V7Pipeline:Recalculate] Total acts duration: ${totalActsDuration.toFixed(2)}s`);

  // Calculate each act's proportion based on its ALREADY SCALED duration
  let currentTime = 0;

  acts.forEach((act, index) => {
    const actDuration = act.endTime - act.startTime;
    const proportion = actDuration / totalActsDuration;

    // Find words that fall within this act's time range (scaled to audio)
    const actStartInAudio = (currentTime / totalActsDuration) * totalAudioDuration;
    const actEndInAudio = ((currentTime + actDuration) / totalActsDuration) * totalAudioDuration;

    // Update act timing to match audio
    act.startTime = actStartInAudio;
    act.endTime = actEndInAudio;

    currentTime += actDuration;

    console.log(`[V7Pipeline:Recalculate] Act ${index + 1} "${act.type}": ${act.startTime.toFixed(2)}s - ${act.endTime.toFixed(2)}s (${(proportion * 100).toFixed(1)}%)`);
  });

  // Ensure last act ends exactly at audio end
  if (acts.length > 0) {
    acts[acts.length - 1].endTime = totalAudioDuration;
  }
}

// ============================================================================
// V7.1: WORD-BASED TIMING CALCULATION
// ============================================================================

/**
 * ✅ V7.1: Calculate act timings based on KEYWORDS in wordTimestamps
 *
 * For each act with a pauseKeyword, find when that word is spoken
 * and use it as the trigger point for the interaction.
 *
 * This replaces the old proportional scaling approach.
 */
function calculateWordBasedTimings(
  acts: V7CinematicAct[],
  wordTimestamps: WordTimestamp[],
  inputActs?: Array<{
    pauseKeyword?: string;
    pauseKeywords?: string[];
    narration?: string;
    type?: string;
  }>
): void {
  if (acts.length === 0 || wordTimestamps.length === 0) return;

  console.log('[V7Pipeline:WordBased] ✅ Calculating WORD-BASED timings...');
  console.log('[V7Pipeline:WordBased] Total words:', wordTimestamps.length);

  const totalAudioDuration = wordTimestamps[wordTimestamps.length - 1].end;

  // Normalize function for word matching
  const normalize = (word: string): string =>
    word.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:'"()[\]{}…]+/g, '')
      .trim();

  // Find keyword in wordTimestamps
  const findKeywordTime = (keyword: string, afterTime: number = 0): number | null => {
    const normalizedKeyword = normalize(keyword);

    for (const ts of wordTimestamps) {
      if (ts.start < afterTime) continue;

      const normalizedWord = normalize(ts.word);

      if (normalizedWord === normalizedKeyword ||
          normalizedWord.includes(normalizedKeyword) ||
          normalizedKeyword.includes(normalizedWord)) {
        console.log(`[V7Pipeline:WordBased] Found keyword "${keyword}" at ${ts.start.toFixed(2)}s`);
        return ts.start;
      }
    }

    return null;
  };

  // Find the last word of the first sentence in narration
  const findSentenceEndTime = (narration: string, afterTime: number = 0): number | null => {
    // Split into sentences
    const sentences = narration.split(/[.!?…]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return null;

    // Get words from first sentence
    const firstSentence = sentences[0].trim();
    const words = firstSentence.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return null;

    // Find the last meaningful word
    const commonWords = new Set(['que', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'um', 'uma', 'os', 'as', 'e', 'a', 'o']);

    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i].replace(/[.,!?;:'"()[\]{}…]+/g, '');
      const normalized = normalize(word);

      if (normalized.length >= 3 && !commonWords.has(normalized)) {
        const time = findKeywordTime(word, afterTime);
        if (time !== null) {
          console.log(`[V7Pipeline:WordBased] Found sentence end word "${word}" at ${time.toFixed(2)}s`);
          return time;
        }
      }
    }

    return null;
  };

  // Process each act
  let lastEndTime = 0;

  acts.forEach((act, index) => {
    const inputAct = inputActs?.[index];
    const isInteractive = act.type === 'interaction' || act.type === 'quiz' || act.type === 'playground';

    // Start time is always after the previous act ends
    act.startTime = lastEndTime;

    // For interactive phases, find the pauseKeyword to determine when to pause
    if (isInteractive && inputAct) {
      // Priority 1: Explicit pauseKeyword
      const pauseKeyword = inputAct.pauseKeyword || inputAct.pauseKeywords?.[0];

      if (pauseKeyword) {
        const keywordTime = findKeywordTime(pauseKeyword, act.startTime);
        if (keywordTime !== null) {
          // The pause happens AT the keyword, so act starts a bit before
          // We keep startTime as is, but note the pause point
          console.log(`[V7Pipeline:WordBased] Act ${index + 1} (${act.type}): pauseKeyword "${pauseKeyword}" at ${keywordTime.toFixed(2)}s`);

          // Store pause time in act for frontend use
          (act as any).pauseTime = keywordTime;
          (act as any).pauseKeyword = pauseKeyword;
        }
      }
      // Priority 2: Find from narration sentence structure
      else if (inputAct.narration) {
        const sentenceEndTime = findSentenceEndTime(inputAct.narration, act.startTime);
        if (sentenceEndTime !== null) {
          (act as any).pauseTime = sentenceEndTime;
          console.log(`[V7Pipeline:WordBased] Act ${index + 1} (${act.type}): auto-detected pause at ${sentenceEndTime.toFixed(2)}s`);
        }
      }
    }

    // Calculate end time based on next act's start or audio end
    if (index < acts.length - 1) {
      // Look ahead to next act to determine this act's end
      const nextInputAct = inputActs?.[index + 1];
      const nextNarration = nextInputAct?.narration || '';

      // Find first word of next narration to determine this act's end
      if (nextNarration) {
        const firstWords = nextNarration.split(/\s+/).slice(0, 5);
        for (const word of firstWords) {
          const cleanWord = word.replace(/[.,!?;:'"()[\]{}…]+/g, '');
          if (cleanWord.length >= 3) {
            const wordTime = findKeywordTime(cleanWord, act.startTime + 1);
            if (wordTime !== null) {
              act.endTime = wordTime;
              console.log(`[V7Pipeline:WordBased] Act ${index + 1} ends at ${wordTime.toFixed(2)}s (next narration starts)`);
              break;
            }
          }
        }
      }

      // Fallback: use proportional timing if keyword not found
      if (act.endTime <= act.startTime) {
        act.endTime = act.startTime + (totalAudioDuration / acts.length);
      }
    } else {
      // Last act ends at audio end
      act.endTime = totalAudioDuration;
    }

    lastEndTime = act.endTime;

    console.log(`[V7Pipeline:WordBased] Act ${index + 1} "${act.type}": ${act.startTime.toFixed(2)}s - ${act.endTime.toFixed(2)}s`);
  });
}

// ============================================================================
// ELEVENLABS AUDIO GENERATION
// ============================================================================

// ✅ FIX: Clean pause tags and contextual markers from text before TTS
function cleanTextForTTS(text: string): string {
  return text
    // Remove [pause:X] tags (e.g., [pause:2000], [pause:500])
    .replace(/\[pause:\d+\]/gi, '')
    // Remove [contextual] markers
    .replace(/\[contextual[^\]]*\]/gi, '')
    // Remove any remaining bracket tags
    .replace(/\[[^\]]*\]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up spaces before punctuation
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}

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
  
  // ✅ FIX: Clean text before sending to TTS
  const cleanedText = cleanTextForTTS(text);
  
  const voice = voiceId || 'Xb7hH8MSUJpSbSDYk0k2'; // Alice - good for Portuguese
  const modelId = 'eleven_multilingual_v2';
  
  console.log('[V7Pipeline:Audio] Generating audio (with retry)...');
  console.log('[V7Pipeline:Audio] Voice ID:', voice);
  console.log('[V7Pipeline:Audio] Original text length:', text.length);
  console.log('[V7Pipeline:Audio] Cleaned text length:', cleanedText.length);

  try {
    // ✅ P1 FIX: Use fetchWithRetry for transient failure recovery
    const response = await fetchWithRetry(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: cleanedText, // ✅ FIX: Use cleaned text without [pause:X] tags
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      },
      { maxRetries: 3, initialDelayMs: 2000, maxDelayMs: 15000 }
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
