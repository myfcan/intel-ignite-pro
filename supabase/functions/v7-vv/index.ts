/**
 * V7-vv Pipeline - Cinematographic Lesson Generator
 *
 * VERSÃO DEFINITIVA - Baseada no V7Contract.ts
 *
 * RESPONSABILIDADES:
 * 1. Validar input (JSON de roteiro)
 * 2. Gerar áudio principal (narrações das cenas)
 * 3. Gerar áudios de feedback (narrações dos feedbacks do quiz)
 * 4. Calcular timing baseado em wordTimestamps
 * 5. Gerar V7LessonData exato conforme contrato
 *
 * @version VV-Definitive
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// TIPOS - Importados conceitualmente do V7Contract.ts
// (Deno não suporta import direto do frontend)
// ============================================================================

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface AudioSegment {
  id: string;
  url: string;
  duration: number;
  wordTimestamps: WordTimestamp[];
}

interface MicroVisual {
  id: string;
  type: string;
  anchorText: string;
  triggerTime: number;
  duration: number;
  content: Record<string, unknown>;
}

interface AnchorAction {
  id: string;
  keyword: string;
  keywordTime: number;
  type: 'pause' | 'show' | 'highlight' | 'trigger';
  targetId?: string;
}

interface QuizFeedback {
  title: string;
  subtitle: string;
  mood: string;
  audioId?: string;
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: QuizFeedback;
}

interface Phase {
  id: string;
  title: string;
  type: string;
  startTime: number;
  endTime: number;
  visual: {
    type: string;
    content: Record<string, unknown>;
  };
  effects?: Record<string, unknown>;
  microVisuals?: MicroVisual[];
  anchorActions?: AnchorAction[];
  interaction?: Record<string, unknown>;
  audioBehavior?: {
    onStart: string;
    onComplete: string;
  };
}

interface LessonData {
  model: string;
  version: string;
  metadata: {
    title: string;
    subtitle: string;
    difficulty: string;
    category: string;
    tags: string[];
    learningObjectives: string[];
    totalDuration: number;
    phaseCount: number;
    createdAt: string;
    generatedBy: string;
  };
  phases: Phase[];
  audio: {
    mainAudio: AudioSegment;
    feedbackAudios?: Record<string, AudioSegment>;
  };
}

// ============================================================================
// TIPOS DE INPUT (Roteiro)
// ============================================================================

interface ScriptInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  voice_id?: string;
  generate_audio?: boolean;
  fail_on_audio_error?: boolean;
  scenes: ScriptScene[];
}

interface ScriptScene {
  id: string;
  title: string;
  type: string;
  narration: string;
  anchorText?: {
    pauseAt?: string;
    transitionAt?: string;
  };
  visual: {
    type: string;
    content: Record<string, unknown>;
    effects?: Record<string, unknown>;
    microVisuals?: Array<{
      id: string;
      type: string;
      anchorText: string;
      content: Record<string, unknown>;
    }>;
  };
  interaction?: {
    type: string;
    options?: Array<{
      id: string;
      text: string;
      isCorrect?: boolean;
      feedback?: {
        title: string;
        subtitle: string;
        narration?: string;
        mood: string;
      };
    }>;
    [key: string]: unknown;
  };
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

interface ValidationError {
  scene: string;
  field: string;
  message: string;
}

function validateInput(input: ScriptInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.title?.trim()) {
    errors.push({ scene: 'root', field: 'title', message: 'Título é obrigatório' });
  }

  if (!input.scenes || input.scenes.length === 0) {
    errors.push({ scene: 'root', field: 'scenes', message: 'Pelo menos uma cena é obrigatória' });
    return errors;
  }

  input.scenes.forEach((scene, index) => {
    const sceneId = scene.id || `scene-${index + 1}`;

    if (!scene.narration?.trim()) {
      errors.push({
        scene: sceneId,
        field: 'narration',
        message: `Cena "${sceneId}" não tem narração.`
      });
    }

    if (!scene.visual) {
      errors.push({
        scene: sceneId,
        field: 'visual',
        message: `Cena "${sceneId}" não tem configuração visual.`
      });
    }

    // Cenas interativas DEVEM ter anchorText.pauseAt
    const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(scene.type);
    if (isInteractive && !scene.anchorText?.pauseAt) {
      errors.push({
        scene: sceneId,
        field: 'anchorText.pauseAt',
        message: `Cena interativa "${sceneId}" DEVE ter anchorText.pauseAt.`
      });
    }
  });

  return errors;
}

// ============================================================================
// GERAÇÃO DE ÁUDIO COM ELEVENLABS
// ============================================================================

async function generateAudio(
  text: string,
  voiceId: string,
  supabase: any,
  filePrefix: string
): Promise<{
  success: boolean;
  url?: string;
  wordTimestamps?: WordTimestamp[];
  duration?: number;
  error?: string;
}> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ELEVENLABS_API_KEY not configured' };
  }

  if (!text.trim()) {
    return { success: false, error: 'Empty text' };
  }

  console.log(`[Audio] Generating for: "${text.substring(0, 50)}..."`);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,          // 50%
            similarity_boost: 0.75,  // 75%
            style: 0.5,              // 50% - Alice engaging style
            use_speaker_boost: true, // Ativado
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Audio] ElevenLabs error:', response.status, errorText);
      return { success: false, error: `ElevenLabs API error: ${response.status}` };
    }

    const data = await response.json();
    const audioBase64 = data.audio_base64;
    const alignment = data.alignment;

    if (!audioBase64) {
      return { success: false, error: 'No audio in response' };
    }

    // Process word timestamps
    let wordTimestamps: WordTimestamp[] = [];
    let duration = 0;

    if (alignment?.characters && alignment?.character_start_times_seconds) {
      wordTimestamps = processWordTimestamps(
        alignment.characters,
        alignment.character_start_times_seconds
      );
      if (wordTimestamps.length > 0) {
        duration = wordTimestamps[wordTimestamps.length - 1].end;
      }
    }

    // Upload to Supabase Storage
    let url = '';
    if (supabase) {
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const fileName = `${filePrefix}-${Date.now()}.mp3`;

      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('[Audio] Upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('lesson-audios')
          .getPublicUrl(fileName);
        url = urlData.publicUrl;
      }
    }

    console.log(`[Audio] Generated: ${url} (${duration.toFixed(1)}s, ${wordTimestamps.length} words)`);

    return {
      success: true,
      url,
      wordTimestamps,
      duration,
    };

  } catch (error: any) {
    console.error('[Audio] Error:', error);
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

// ============================================================================
// BUSCA DE PALAVRAS NOS TIMESTAMPS
// ============================================================================

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:'"()[\]{}…\-]+/g, '')
    .trim();
}

function findKeywordTime(
  keyword: string,
  wordTimestamps: WordTimestamp[],
  afterTime: number = 0
): number | null {
  const keywordParts = keyword.split(/\s+/).map(normalizeWord).filter(w => w.length > 0);

  if (keywordParts.length === 0) return null;

  // Multi-word: busca com tolerância de gap
  if (keywordParts.length > 1) {
    const MAX_GAP = 2;

    for (let i = 0; i < wordTimestamps.length; i++) {
      if (wordTimestamps[i].start < afterTime) continue;

      const firstWordNorm = normalizeWord(wordTimestamps[i].word);
      if (firstWordNorm !== keywordParts[0]) continue;

      let matchPositions: number[] = [i];
      let searchStart = i + 1;

      for (let partIdx = 1; partIdx < keywordParts.length; partIdx++) {
        const targetPart = keywordParts[partIdx];
        let found = false;

        for (let j = searchStart; j <= Math.min(searchStart + MAX_GAP, wordTimestamps.length - 1); j++) {
          if (normalizeWord(wordTimestamps[j].word) === targetPart) {
            matchPositions.push(j);
            searchStart = j + 1;
            found = true;
            break;
          }
        }

        if (!found) {
          matchPositions = [];
          break;
        }
      }

      if (matchPositions.length === keywordParts.length) {
        const lastIdx = matchPositions[matchPositions.length - 1];
        return wordTimestamps[lastIdx].end;
      }
    }

    // Fallback: buscar última palavra
    const lastKeyword = keywordParts[keywordParts.length - 1];
    for (let i = wordTimestamps.length - 1; i >= 0; i--) {
      if (wordTimestamps[i].start < afterTime) continue;
      if (normalizeWord(wordTimestamps[i].word) === lastKeyword) {
        return wordTimestamps[i].end;
      }
    }

    return null;
  }

  // Single word
  const target = keywordParts[0];
  for (const ts of wordTimestamps) {
    if (ts.start < afterTime) continue;
    if (normalizeWord(ts.word) === target) {
      return ts.end;
    }
  }

  return null;
}

function findNarrationRange(
  narration: string,
  wordTimestamps: WordTimestamp[],
  startSearchIndex: number
): { startIdx: number; endIdx: number; startTime: number; endTime: number } | null {
  const narrationWords = narration.split(/\s+/).map(normalizeWord).filter(w => w.length > 0);

  if (narrationWords.length === 0) return null;

  // Encontrar primeira palavra
  let startIdx = -1;
  for (let i = startSearchIndex; i < wordTimestamps.length; i++) {
    if (normalizeWord(wordTimestamps[i].word) === narrationWords[0]) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) return null;

  // Encontrar última palavra (aproximadamente)
  const estimatedEndIdx = Math.min(startIdx + narrationWords.length + 10, wordTimestamps.length - 1);
  let endIdx = startIdx;

  const lastNarrationWord = narrationWords[narrationWords.length - 1];
  for (let i = estimatedEndIdx; i >= startIdx; i--) {
    if (normalizeWord(wordTimestamps[i].word) === lastNarrationWord) {
      endIdx = i;
      break;
    }
  }

  return {
    startIdx,
    endIdx,
    startTime: wordTimestamps[startIdx].start,
    endTime: wordTimestamps[endIdx].end + 0.3,
  };
}

// ============================================================================
// GERAÇÃO DE FASES
// ============================================================================

function generatePhases(
  scenes: ScriptScene[],
  wordTimestamps: WordTimestamp[],
  totalDuration: number
): Phase[] {
  const phases: Phase[] = [];
  let lastSearchIdx = 0;
  let lastEndTime = 0;

  console.log(`\n[Phases] Generating ${scenes.length} phases from ${wordTimestamps.length} words`);

  for (const scene of scenes) {
    console.log(`\n[Phase] ${scene.id} (${scene.type})`);

    // Encontrar range da narração
    const range = findNarrationRange(scene.narration, wordTimestamps, lastSearchIdx);

    let startTime: number;
    let endTime: number;

    if (range) {
      startTime = Math.max(range.startTime, lastEndTime);
      endTime = range.endTime;
      lastSearchIdx = range.endIdx + 1;
      console.log(`[Phase] Timing: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`);
    } else {
      // Fallback: estimar baseado em palavras
      const wordCount = scene.narration.split(/\s+/).length;
      const estimatedDuration = wordCount / 2.5;
      startTime = lastEndTime;
      endTime = startTime + estimatedDuration;
      console.warn(`[Phase] ⚠️ Using estimated timing: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`);
    }

    // Anchor Actions
    const anchorActions: AnchorAction[] = [];

    if (scene.anchorText?.pauseAt) {
      const pauseTime = findKeywordTime(scene.anchorText.pauseAt, wordTimestamps, startTime);
      if (pauseTime !== null) {
        anchorActions.push({
          id: `pause-${scene.id}`,
          keyword: scene.anchorText.pauseAt,
          keywordTime: pauseTime,
          type: 'pause',
        });
        console.log(`[Phase] ✓ pauseAt "${scene.anchorText.pauseAt}" @ ${pauseTime.toFixed(2)}s`);
      } else {
        // Fallback: pausar a 80% da fase
        const fallbackTime = startTime + (endTime - startTime) * 0.8;
        anchorActions.push({
          id: `pause-${scene.id}`,
          keyword: scene.anchorText.pauseAt,
          keywordTime: fallbackTime,
          type: 'pause',
        });
        console.warn(`[Phase] ⚠️ pauseAt fallback @ ${fallbackTime.toFixed(2)}s (80%)`);
      }
    }

    // ✅ V7-vv FIX: Processar transitionAt (antes ignorado!)
    if (scene.anchorText?.transitionAt) {
      const transitionTime = findKeywordTime(scene.anchorText.transitionAt, wordTimestamps, startTime);
      if (transitionTime !== null) {
        anchorActions.push({
          id: `transition-${scene.id}`,
          keyword: scene.anchorText.transitionAt,
          keywordTime: transitionTime,
          type: 'trigger',
          targetId: 'next-phase',
        });
        console.log(`[Phase] ✓ transitionAt "${scene.anchorText.transitionAt}" @ ${transitionTime.toFixed(2)}s`);
      } else {
        console.warn(`[Phase] ⚠️ transitionAt "${scene.anchorText.transitionAt}" não encontrado nos timestamps`);
      }
    }

    // Micro-visuais
    // ✅ V7-vv FIX: Duration dinâmico baseado no tipo e input
    const getDefaultDuration = (type: string): number => {
      switch (type) {
        case 'image-flash': return 0.8;
        case 'text-pop': return 2.0;
        case 'number-count': return 1.5;
        case 'highlight': return 2.5;
        case 'text-highlight': return 2.0;
        case 'card-reveal': return 3.0;
        case 'letter-reveal': return 1.0;
        default: return 2.0;
      }
    };

    const microVisuals: MicroVisual[] = [];
    scene.visual?.microVisuals?.forEach((mv, idx) => {
      const triggerTime = findKeywordTime(mv.anchorText, wordTimestamps, startTime);
      // ✅ Usar duration do content se especificado, senão usar default por tipo
      const duration = (mv.content as any)?.duration || getDefaultDuration(mv.type);
      microVisuals.push({
        id: mv.id || `mv-${scene.id}-${idx}`,
        type: mv.type,
        anchorText: mv.anchorText,
        triggerTime: triggerTime ?? (startTime + (endTime - startTime) * ((idx + 1) / (scene.visual.microVisuals!.length + 1))),
        duration,
        content: mv.content,
      });

      if (triggerTime !== null) {
        anchorActions.push({
          id: mv.id || `mv-${scene.id}-${idx}`,
          keyword: mv.anchorText,
          keywordTime: triggerTime,
          type: 'show',
          targetId: mv.id,
        });
      }
    });

    // Determinar comportamento de áudio
    const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(scene.type);

    // Construir fase
    const phase: Phase = {
      id: scene.id,
      title: scene.title,
      type: scene.type,
      startTime,
      endTime,
      visual: {
        type: scene.visual.type,
        content: scene.visual.content,
      },
      effects: scene.visual.effects,
      microVisuals: microVisuals.length > 0 ? microVisuals : undefined,
      anchorActions: anchorActions.length > 0 ? anchorActions : undefined,
      audioBehavior: isInteractive ? {
        onStart: 'pause',
        onComplete: 'resume',
      } : undefined,
    };

    // Interação
    if (scene.interaction) {
      if (scene.interaction.type === 'quiz' && scene.interaction.options) {
        phase.interaction = {
          type: 'quiz',
          question: scene.interaction.question || scene.visual.content.question as string || '',
          options: scene.interaction.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
            feedback: {
              title: opt.feedback?.title || '',
              subtitle: opt.feedback?.subtitle || '',
              mood: opt.feedback?.mood || 'neutral',
              audioId: opt.feedback?.narration ? `feedback-${opt.id}` : undefined,
            },
          })),
          timeout: scene.interaction.timeout,
        };
      } else if (scene.interaction.type === 'playground') {
        // ✅ V7-vv FIX: Copiar TODOS os campos do playground
        phase.interaction = {
          type: 'playground',
          amateurPrompt: scene.interaction.amateurPrompt,
          professionalPrompt: scene.interaction.professionalPrompt,
          amateurResult: scene.interaction.amateurResult,
          professionalResult: scene.interaction.professionalResult,
          // V7-vv: Campos adicionados para playground completo:
          amateurScore: scene.interaction.amateurScore,
          professionalScore: scene.interaction.professionalScore,
          comparison: scene.interaction.comparison,
          userChallenge: scene.interaction.userChallenge,
        };
      } else if (scene.interaction.type === 'cta-button') {
        phase.interaction = {
          type: 'cta-button',
          buttonText: scene.interaction.buttonText,
          action: scene.interaction.action,
        };
      }
    }

    phases.push(phase);
    lastEndTime = endTime;
  }

  console.log(`\n[Phases] Generated ${phases.length} phases, total duration: ${lastEndTime.toFixed(2)}s`);

  return phases;
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const input: ScriptInput = await req.json();

    console.log('================================================');
    console.log('[V7-vv] Pipeline Start');
    console.log(`[V7-vv] Title: ${input.title}`);
    console.log(`[V7-vv] Scenes: ${input.scenes?.length || 0}`);
    console.log(`[V7-vv] Voice ID: ${input.voice_id || 'default'}`);
    console.log('================================================');

    // =========================================================================
    // PASSO 1: VALIDAÇÃO
    // =========================================================================
    const validationErrors = validateInput(input);
    if (validationErrors.length > 0) {
      console.error('[V7-vv] ❌ Validation failed:', validationErrors);
      return new Response(
        JSON.stringify({ success: false, error: 'Validation failed', validationErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('[V7-vv] ✅ Validation passed');

    // =========================================================================
    // PASSO 2: GERAR ÁUDIO PRINCIPAL
    // =========================================================================
    const voiceId = input.voice_id || 'Xb7hH8MSUJpSbSDYk0k2'; // Usa voice_id do input!
    const shouldGenerateAudio = input.generate_audio !== false;

    let mainAudio: AudioSegment = {
      id: 'main',
      url: '',
      duration: 0,
      wordTimestamps: [],
    };

    if (shouldGenerateAudio) {
      console.log('[V7-vv] Step 2: Generating main audio...');

      // Concatenar todas as narrações
      const fullNarration = input.scenes
        .map(s => s.narration.trim())
        .filter(n => n.length > 0)
        .join('\n\n');

      const audioResult = await generateAudio(fullNarration, voiceId, supabase, 'v7-main');

      if (!audioResult.success) {
        if (input.fail_on_audio_error) {
          throw new Error(`Audio generation failed: ${audioResult.error}`);
        }
        console.warn('[V7-vv] ⚠️ Main audio failed, continuing without audio');
      } else {
        mainAudio = {
          id: 'main',
          url: audioResult.url || '',
          duration: audioResult.duration || 0,
          wordTimestamps: audioResult.wordTimestamps || [],
        };
        console.log(`[V7-vv] ✅ Main audio: ${mainAudio.duration.toFixed(1)}s, ${mainAudio.wordTimestamps.length} words`);
      }
    }

    // =========================================================================
    // PASSO 3: GERAR ÁUDIOS DE FEEDBACK DO QUIZ
    // =========================================================================
    console.log('[V7-vv] Step 3: Generating feedback audios...');

    const feedbackAudios: Record<string, AudioSegment> = {};

    for (const scene of input.scenes) {
      if (scene.interaction?.type === 'quiz' && scene.interaction.options) {
        for (const option of scene.interaction.options) {
          if (option.feedback?.narration) {
            console.log(`[V7-vv] Generating feedback audio for option ${option.id}`);

            const feedbackResult = await generateAudio(
              option.feedback.narration,
              voiceId,
              supabase,
              `v7-feedback-${option.id}`
            );

            if (feedbackResult.success) {
              feedbackAudios[`feedback-${option.id}`] = {
                id: `feedback-${option.id}`,
                url: feedbackResult.url || '',
                duration: feedbackResult.duration || 0,
                wordTimestamps: feedbackResult.wordTimestamps || [],
              };
              console.log(`[V7-vv] ✅ Feedback audio for ${option.id}: ${feedbackResult.duration?.toFixed(1)}s`);
            } else {
              console.warn(`[V7-vv] ⚠️ Failed to generate feedback audio for ${option.id}`);
            }
          }
        }
      }
    }

    console.log(`[V7-vv] Generated ${Object.keys(feedbackAudios).length} feedback audios`);

    // =========================================================================
    // PASSO 4: GERAR FASES
    // =========================================================================
    console.log('[V7-vv] Step 4: Generating phases...');

    const phases = generatePhases(input.scenes, mainAudio.wordTimestamps, mainAudio.duration);

    // =========================================================================
    // PASSO 5: CONSTRUIR OUTPUT
    // =========================================================================
    console.log('[V7-vv] Step 5: Building output...');

    const totalDuration = phases.length > 0 ? phases[phases.length - 1].endTime : mainAudio.duration;

    const lessonData: LessonData = {
      model: 'v7-cinematic',
      version: 'vv',
      metadata: {
        title: input.title,
        subtitle: input.subtitle || '',
        difficulty: input.difficulty,
        category: input.category,
        tags: input.tags,
        learningObjectives: input.learningObjectives,
        totalDuration,
        phaseCount: phases.length,
        createdAt: new Date().toISOString(),
        generatedBy: 'V7-vv',
      },
      phases,
      audio: {
        mainAudio,
        feedbackAudios: Object.keys(feedbackAudios).length > 0 ? feedbackAudios : undefined,
      },
    };

    // =========================================================================
    // PASSO 6: SALVAR NO BANCO
    // =========================================================================
    console.log('[V7-vv] Step 6: Saving to database...');

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        title: input.title,
        description: input.subtitle || `Aula V7 Cinematográfica: ${input.title}`,
        trail_id: (input as any).trail_id || null,
        order_index: (input as any).order_index || 0,
        model: 'v7',
        lesson_type: 'v7-cinematic',
        content: lessonData,
        audio_url: mainAudio.url || null,
        word_timestamps: mainAudio.wordTimestamps.length > 0 ? mainAudio.wordTimestamps : null,
        estimated_time: Math.ceil(totalDuration / 60),
        difficulty_level: input.difficulty,
        is_active: false,
        status: 'rascunho',
      })
      .select('id')
      .single();

    if (lessonError) {
      console.error('[V7-vv] Database error:', lessonError);
      throw new Error(`Failed to save lesson: ${lessonError.message}`);
    }

    const lessonId = lesson.id;
    console.log(`[V7-vv] ✅ Lesson saved with ID: ${lessonId}`);

    // =========================================================================
    // RESPOSTA
    // =========================================================================
    const response = {
      success: true,
      lessonId,
      stats: {
        phaseCount: phases.length,
        totalDuration,
        mainAudioDuration: mainAudio.duration,
        wordCount: mainAudio.wordTimestamps.length,
        feedbackAudioCount: Object.keys(feedbackAudios).length,
        hasAudio: !!mainAudio.url,
      },
    };

    console.log('================================================');
    console.log('[V7-vv] ✅ Pipeline completed successfully');
    console.log('[V7-vv] Stats:', JSON.stringify(response.stats));
    console.log('================================================');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[V7-vv] ❌ Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
