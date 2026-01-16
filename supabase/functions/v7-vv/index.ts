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
  // ✅ FASE 2 FIX: Estrutura compatível com OUTPUT funcional
  schema: string;                    // Bug 7: era "model"
  version: string;                   // Bug 8: será "1.0.0"
  title: string;                     // Bug 9: title no root
  subtitle: string;                  // Bug 9: subtitle no root
  difficulty: string;
  category: string;
  tags: string[];
  learningObjectives: string[];
  estimatedDuration: number;
  metadata: {
    version: string;                 // Bug 10: metadata.version
    phaseCount: number;
    totalDuration: number;
    hasInteractivePhases: boolean;   // Bug 11: flags
    hasPlayground: boolean;          // Bug 11: flags
    hasPostLessonExercises: boolean; // Bug 11: flags
  };
  phases: Phase[];
  audio: {
    mainAudio: AudioSegment;
    // ✅ FASE 4 FIX: feedbackAudios como OBJECT (Frontend acessa por key)
    feedbackAudios?: FeedbackAudiosObject;
  };
  // ✅ FASE 1 FIX: Campos passados direto do INPUT
  postLessonExercises?: any[];
  postLessonFlow?: Record<string, unknown>;
  gamification?: Record<string, unknown>;
}

// ✅ FASE 2 FIX: Interface para feedbackAudios como array
interface FeedbackAudioItem {
  id: string;
  url: string;
  wordTimestamps: WordTimestamp[];
  trigger: string;
  duration?: number;
}

// ✅ FASE 4 FIX: feedbackAudios como OBJECT para Frontend
// O Frontend acessa como: feedbackAudios?.[feedbackAudioKey]
// Então precisamos converter de array para objeto indexado por ID
interface FeedbackAudiosObject {
  [key: string]: {
    id: string;
    url: string;
    duration: number;
    wordTimestamps: WordTimestamp[];
    trigger: string;
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
  // ✅ FASE 1 FIX: Campos que passam direto para OUTPUT
  postLessonExercises?: any[];
  postLessonFlow?: Record<string, unknown>;
  gamification?: Record<string, unknown>;
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

// ============================================================================
// ✅ FASE 6 ANCHOR FIX: Busca de keyword DENTRO do range da cena
// Similar ao V7 step4-calculate-anchors.ts
// ============================================================================

/**
 * Encontra o timestamp de uma palavra-chave DENTRO de um range específico.
 * Retorna o START da keyword (quando ela começa a ser falada).
 *
 * @param keyword - Palavra ou frase a buscar
 * @param wordTimestamps - Array de timestamps
 * @param afterTime - Tempo mínimo (início do range)
 * @param beforeTime - Tempo máximo (fim do range) - NOVO!
 * @returns start time da keyword ou null
 */
function findKeywordTime(
  keyword: string,
  wordTimestamps: WordTimestamp[],
  afterTime: number = 0,
  beforeTime: number = Infinity
): number | null {
  const keywordParts = keyword.split(/\s+/).map(normalizeWord).filter(w => w.length > 0);

  if (keywordParts.length === 0) return null;

  // ✅ FASE 6 ANCHOR FIX: Filtrar timestamps pelo range (como V7 reference)
  const relevantTimestamps = wordTimestamps.filter(
    wt => wt.start >= afterTime && wt.start <= beforeTime
  );

  if (relevantTimestamps.length === 0) {
    console.warn(`[findKeywordTime] ⚠️ No timestamps in range ${afterTime.toFixed(2)}s - ${beforeTime.toFixed(2)}s`);
    return null;
  }

  // Multi-word: busca sequência
  if (keywordParts.length > 1) {
    for (let i = 0; i < relevantTimestamps.length - keywordParts.length + 1; i++) {
      const windowWords = relevantTimestamps
        .slice(i, i + keywordParts.length)
        .map(wt => normalizeWord(wt.word));

      // Match exato ou parcial
      const windowJoined = windowWords.join(' ');
      const keywordJoined = keywordParts.join(' ');

      if (windowJoined.includes(keywordJoined) || keywordJoined.includes(windowJoined)) {
        // ✅ Retorna START da primeira palavra (como V7 reference)
        const foundTime = relevantTimestamps[i].start;
        console.log(`[findKeywordTime] ✓ Found multi-word "${keyword}" @ ${foundTime.toFixed(2)}s (START)`);
        return foundTime;
      }
    }

    console.warn(`[findKeywordTime] ⚠️ Multi-word "${keyword}" NOT found in range`);
    return null;
  }

  // Single word: busca exata ou parcial
  const target = keywordParts[0];
  for (const ts of relevantTimestamps) {
    const normalizedWord = normalizeWord(ts.word);

    if (normalizedWord === target || normalizedWord.includes(target)) {
      // ✅ Retorna START da palavra (como V7 reference)
      console.log(`[findKeywordTime] ✓ Found "${keyword}" @ ${ts.start.toFixed(2)}s (START)`);
      return ts.start;
    }
  }

  console.warn(`[findKeywordTime] ⚠️ "${keyword}" NOT found in range ${afterTime.toFixed(2)}s - ${beforeTime.toFixed(2)}s`);
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

  // ✅ FASE 6 FIX: Encontrar ÚLTIMA palavra da narração com busca mais ampla
  // Antes: buscava apenas em estimatedEndIdx, falhava em narrações longas
  const estimatedEndIdx = Math.min(startIdx + narrationWords.length + 20, wordTimestamps.length - 1);
  let endIdx = startIdx;

  const lastNarrationWord = narrationWords[narrationWords.length - 1];

  // Buscar a última palavra começando do fim estimado até o startIdx
  for (let i = estimatedEndIdx; i >= startIdx; i--) {
    if (normalizeWord(wordTimestamps[i].word) === lastNarrationWord) {
      endIdx = i;
      break;
    }
  }

  // ✅ FASE 6 FIX: Se não encontrou, tentar buscar palavras próximas do fim da narração
  if (endIdx === startIdx && narrationWords.length > 3) {
    // Tentar penúltima ou antepenúltima palavra
    for (let wordOffset = 2; wordOffset <= 4; wordOffset++) {
      const alternateWord = narrationWords[narrationWords.length - wordOffset];
      if (!alternateWord) continue;

      for (let i = estimatedEndIdx; i >= startIdx; i--) {
        if (normalizeWord(wordTimestamps[i].word) === alternateWord) {
          endIdx = i + wordOffset - 1; // Ajustar para incluir palavras restantes
          if (endIdx >= wordTimestamps.length) endIdx = wordTimestamps.length - 1;
          console.log(`[findNarrationRange] ✅ Found alternate end word "${alternateWord}" at idx ${i}, adjusted endIdx to ${endIdx}`);
          break;
        }
      }
      if (endIdx > startIdx) break;
    }
  }

  // ✅ FASE 6 FIX: Margem maior para garantir que a narração completa seja incluída
  const marginAfterEnd = 0.5; // 500ms de margem

  return {
    startIdx,
    endIdx,
    startTime: wordTimestamps[startIdx].start,
    endTime: wordTimestamps[endIdx].end + marginAfterEnd,
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

  console.log(`\n[Phases] ✅ FASE 6: Generating ${scenes.length} phases from ${wordTimestamps.length} words`);

  for (const scene of scenes) {
    console.log(`\n[Phase] ${scene.id} (${scene.type})`);

    // Encontrar range da narração
    const range = findNarrationRange(scene.narration, wordTimestamps, lastSearchIdx);

    let startTime: number;
    let endTime: number;

    if (range) {
      // ✅ FASE 6 FIX: USAR O startTime REAL da narração!
      // ANTES: startTime = Math.max(range.startTime, lastEndTime) ← ERRADO! Pulava início
      // AGORA: startTime = range.startTime ← CORRETO! Mantém posição real no áudio
      startTime = range.startTime;
      endTime = range.endTime;
      lastSearchIdx = range.endIdx + 1;
      console.log(`[Phase] ✅ REAL Timing: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`);
    } else {
      // Fallback: estimar baseado em palavras
      const wordCount = scene.narration.split(/\s+/).length;
      const estimatedDuration = wordCount / 2.5;
      // Para fallback, usar o endTime da última fase (se existir)
      const lastPhase = phases[phases.length - 1];
      startTime = lastPhase ? lastPhase.endTime : 0;
      endTime = startTime + estimatedDuration;
      console.warn(`[Phase] ⚠️ Using estimated timing: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`);
    }

    // Anchor Actions
    const anchorActions: AnchorAction[] = [];

    // ✅ FASE 6 ANCHOR FIX: Guard para cenas não-interativas (como V7 reference)
    const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground', 'secret-reveal', 'cta', 'gamification'];
    const isInteractiveScene = INTERACTIVE_SCENE_TYPES.includes(scene.type);

    if (scene.anchorText?.pauseAt) {
      // ✅ GUARD: Se a cena NÃO é interativa, ignorar pauseAt
      if (!isInteractiveScene) {
        console.warn(`[Phase] ⚠️ ${scene.id}: pauseAt IGNORADO - cena tipo "${scene.type}" não é interativa`);
      } else {
        // ✅ FASE 6 ANCHOR FIX: Buscar DENTRO do range da cena (startTime → endTime)
        const pauseTime = findKeywordTime(scene.anchorText.pauseAt, wordTimestamps, startTime, endTime);
        if (pauseTime !== null) {
          anchorActions.push({
            id: `pause-${scene.id}`,
            keyword: scene.anchorText.pauseAt,
            keywordTime: pauseTime,
            type: 'pause',
          });
          console.log(`[Phase] ✓ pauseAt "${scene.anchorText.pauseAt}" @ ${pauseTime.toFixed(2)}s (dentro do range ${startTime.toFixed(2)}s-${endTime.toFixed(2)}s)`);
        } else {
          // Fallback: pausar a 80% da fase
          const fallbackTime = startTime + (endTime - startTime) * 0.8;
          anchorActions.push({
            id: `pause-${scene.id}`,
            keyword: scene.anchorText.pauseAt,
            keywordTime: fallbackTime,
            type: 'pause',
          });
          console.warn(`[Phase] ⚠️ pauseAt "${scene.anchorText.pauseAt}" não encontrado - fallback @ ${fallbackTime.toFixed(2)}s (80%)`);
        }
      }
    }

    // ✅ FASE 6 ANCHOR FIX: Processar transitionAt DENTRO do range
    if (scene.anchorText?.transitionAt) {
      const transitionTime = findKeywordTime(scene.anchorText.transitionAt, wordTimestamps, startTime, endTime);
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
        console.warn(`[Phase] ⚠️ transitionAt "${scene.anchorText.transitionAt}" não encontrado no range`);
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
      // ✅ FASE 6 ANCHOR FIX: Buscar DENTRO do range da cena
      const triggerTime = findKeywordTime(mv.anchorText, wordTimestamps, startTime, endTime);
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

    // Determinar comportamento de áudio (usa isInteractiveScene definido acima)

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
      audioBehavior: isInteractiveScene ? {
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
        // ✅ FASE 3 FIX: Converter estrutura INPUT para formato V7Contract.ts
        // INPUT usa: amateurScore, comparison.amateur.response
        // OUTPUT espera: amateurResult { title, content, score, verdict }
        // ✅ FASE 4 FIX: Frontend também procura amateurScore/professionalScore no nível raiz!

        const comparison = scene.interaction.comparison as { amateur?: { label?: string; response?: string; mood?: string }; professional?: { label?: string; response?: string; mood?: string } } | undefined;
        const moodToVerdict = (mood: string): string => {
          switch (mood) {
            case 'danger': return 'Genérico e sem direcionamento';
            case 'warning': return 'Parcialmente estruturado';
            case 'success': return 'Específico, actionável, com números reais';
            default: return mood;
          }
        };

        // ✅ FASE 4 FIX: Extrair scores do INPUT (podem vir de vários lugares)
        const inputAmateurScore = scene.interaction.amateurScore ??
                                  (scene.interaction as any).amateurResult?.score ??
                                  10; // Default baixo para amador
        const inputProfessionalScore = scene.interaction.professionalScore ??
                                       (scene.interaction as any).professionalResult?.score ??
                                       95; // Default alto para profissional

        phase.interaction = {
          type: 'playground',
          amateurPrompt: scene.interaction.amateurPrompt,
          professionalPrompt: scene.interaction.professionalPrompt,
          // ✅ FASE 4 FIX: Scores no nível raiz (Frontend procura aqui!)
          amateurScore: inputAmateurScore,
          professionalScore: inputProfessionalScore,
          // ✅ Estrutura correta para Frontend (V7Contract.ts)
          amateurResult: scene.interaction.amateurResult || (comparison?.amateur ? {
            title: comparison.amateur.label || 'Resultado Amador',
            content: comparison.amateur.response || '',
            score: inputAmateurScore,
            verdict: moodToVerdict(comparison.amateur.mood || 'danger'),
          } : undefined),
          professionalResult: scene.interaction.professionalResult || (comparison?.professional ? {
            title: comparison.professional.label || 'Resultado Profissional',
            content: comparison.professional.response || '',
            score: inputProfessionalScore,
            verdict: moodToVerdict(comparison.professional.mood || 'success'),
          } : undefined),
          // Manter userChallenge para interatividade
          userChallenge: scene.interaction.userChallenge,
        };

        console.log(`[V7-vv:Playground] Phase "${scene.id}" scores: amateur=${inputAmateurScore}, professional=${inputProfessionalScore}`);
      } else if (scene.interaction.type === 'cta-button') {
        phase.interaction = {
          type: 'cta-button',
          buttonText: scene.interaction.buttonText,
          action: scene.interaction.action,
        };
      }
    }

    phases.push(phase);
    // ✅ FASE 6: Removido lastEndTime - cada fase tem seu timing REAL
  }

  // ✅ FASE 6: Calcular duração total baseado na última fase
  const lastPhaseEndTime = phases.length > 0 ? phases[phases.length - 1].endTime : 0;
  console.log(`\n[Phases] ✅ Generated ${phases.length} phases, total duration: ${lastPhaseEndTime.toFixed(2)}s`);

  return phases;
}

// ============================================================================
// V7-vv FIX: WORD-BASED TIMING CALCULATION - FASE 6 FINAL
// ============================================================================

/**
 * ✅ FASE 6 FINAL: Calculate phase timings based on KEYWORDS in wordTimestamps
 *
 * CAUSA RAIZ DOS BUGS ANTERIORES:
 * - generatePhases() usava: startTime = Math.max(range.startTime, lastEndTime)
 * - Isso PULAVA o início da narração quando lastEndTime > range.startTime
 * - calculateWordBasedTimings() adicionava margens de 3s que causavam overlap
 *
 * SOLUÇÃO FASE 6:
 * 1. generatePhases() agora usa startTime = range.startTime (REAL)
 * 2. endTime NUNCA ultrapassa nextPhase.startTime (sem overlap)
 * 3. Margens mínimas (0.3s-0.5s) em vez de excessivas (3s)
 *
 * RESULTADO:
 * - Frontend faz seekTo(nextPhase.startTime) e encontra o início REAL da narração
 * - Nenhuma parte da narração é pulada
 * - Fases não se sobrepõem
 */
function calculateWordBasedTimings(
  phases: Phase[],
  wordTimestamps: WordTimestamp[],
  inputScenes: ScriptScene[]
): void {
  if (phases.length === 0 || wordTimestamps.length === 0) return;

  console.log('[V7-vv:WordBased] ✅ FASE 6 FINAL: Calculating WORD-BASED timings...');
  console.log('[V7-vv:WordBased] Total words:', wordTimestamps.length);

  const totalAudioDuration = wordTimestamps[wordTimestamps.length - 1].end;

  // Normalize function for word matching
  const normalize = (word: string): string =>
    word.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:'"()[\]{}…]+/g, '')
      .trim();

  // ✅ FASE 6: Encontrar ÚLTIMA ocorrência de uma palavra após um tempo
  const findLastKeywordTime = (keyword: string, afterTime: number = 0, beforeTime: number = totalAudioDuration): number | null => {
    const keywordParts = keyword.split(/\s+/).map(normalize).filter(w => w.length > 0);
    if (keywordParts.length === 0) return null;

    // Multi-word: busca sequência (última ocorrência)
    if (keywordParts.length > 1) {
      const MAX_GAP = 3;
      let lastFound: number | null = null;

      for (let i = 0; i < wordTimestamps.length; i++) {
        if (wordTimestamps[i].start < afterTime) continue;
        if (wordTimestamps[i].start > beforeTime) break;

        const firstWordNorm = normalize(wordTimestamps[i].word);
        if (firstWordNorm !== keywordParts[0]) continue;

        let matchPositions: number[] = [i];
        let searchStart = i + 1;

        for (let partIdx = 1; partIdx < keywordParts.length; partIdx++) {
          const targetPart = keywordParts[partIdx];
          let found = false;

          for (let j = searchStart; j <= Math.min(searchStart + MAX_GAP, wordTimestamps.length - 1); j++) {
            if (normalize(wordTimestamps[j].word) === targetPart) {
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
          lastFound = wordTimestamps[lastIdx].end;
        }
      }

      if (lastFound !== null) {
        console.log(`[V7-vv:WordBased] ✓ Found multi-word "${keyword}" (last) at ${lastFound.toFixed(2)}s`);
      }
      return lastFound;
    }

    // Single word: busca última ocorrência
    const target = keywordParts[0];
    let lastFound: number | null = null;

    for (const ts of wordTimestamps) {
      if (ts.start < afterTime) continue;
      if (ts.start > beforeTime) break;

      const normalizedWord = normalize(ts.word);

      if (normalizedWord === target ||
          normalizedWord.includes(target) ||
          target.includes(normalizedWord)) {
        lastFound = ts.end;
      }
    }

    if (lastFound !== null) {
      console.log(`[V7-vv:WordBased] ✓ Found keyword "${keyword}" (last) at ${lastFound.toFixed(2)}s`);
    } else {
      console.warn(`[V7-vv:WordBased] ⚠️ Keyword "${keyword}" NOT found between ${afterTime.toFixed(2)}s and ${beforeTime.toFixed(2)}s`);
    }

    return lastFound;
  };

  // ✅ FASE 6: Encontrar PRIMEIRA ocorrência de uma palavra após um tempo
  const findFirstKeywordTime = (keyword: string, afterTime: number = 0): { start: number; end: number } | null => {
    const target = normalize(keyword);
    if (!target) return null;

    for (const ts of wordTimestamps) {
      if (ts.start < afterTime) continue;

      const normalizedWord = normalize(ts.word);

      if (normalizedWord === target ||
          normalizedWord.includes(target) ||
          target.includes(normalizedWord)) {
        return { start: ts.start, end: ts.end };
      }
    }

    return null;
  };

  // ✅ FASE 6: Encontrar o FIM REAL de uma narração
  const findNarrationEndTime = (narration: string, afterTime: number): number | null => {
    const words = narration.split(/\s+/).map(normalize).filter(w => w.length > 0);
    if (words.length === 0) return null;

    // Tentar encontrar a última palavra da narração
    const lastWord = words[words.length - 1];
    let endTime = findLastKeywordTime(lastWord, afterTime);

    // Se não encontrou, tentar penúltima palavra
    if (endTime === null && words.length > 1) {
      const penultimateWord = words[words.length - 2];
      const found = findLastKeywordTime(penultimateWord, afterTime);
      if (found !== null) {
        endTime = found + 0.5; // Adicionar margem para palavra final
      }
    }

    // Se ainda não encontrou, tentar antepenúltima
    if (endTime === null && words.length > 2) {
      const antepenultimateWord = words[words.length - 3];
      const found = findLastKeywordTime(antepenultimateWord, afterTime);
      if (found !== null) {
        endTime = found + 1.0; // Adicionar margem para palavras finais
      }
    }

    return endTime;
  };

  // ✅ FASE 6: Processar cada fase com nova lógica
  phases.forEach((phase, index) => {
    const inputScene = inputScenes[index];
    const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(phase.type);
    const narration = inputScene?.narration || '';

    console.log(`\n[V7-vv:WordBased] === Phase ${index + 1}: "${phase.id}" (${phase.type}) ===`);

    // ✅ FASE 6 FIX: NÃO forçar startTime para lastEndTime
    // O startTime REAL é baseado em quando a narração dessa fase começa no áudio
    // O phase.startTime já foi calculado em generatePhases baseado na narração
    const originalStartTime = phase.startTime;
    console.log(`[V7-vv:WordBased] Original startTime: ${originalStartTime.toFixed(2)}s`);

    // ✅ FASE 6: Encontrar o FIM REAL da narração dessa fase
    const narrationEndTime = findNarrationEndTime(narration, originalStartTime);
    if (narrationEndTime !== null) {
      console.log(`[V7-vv:WordBased] Narration ends at: ${narrationEndTime.toFixed(2)}s`);
    }

    // ✅ FASE 6: Para fases interativas, encontrar o pauseAt
    let pauseKeywordTime: number | null = null;

    if (isInteractive && inputScene?.anchorText?.pauseAt) {
      const pauseKeyword = inputScene.anchorText.pauseAt;
      // Buscar pauseAt DENTRO do range dessa fase
      pauseKeywordTime = findLastKeywordTime(pauseKeyword, originalStartTime);

      if (pauseKeywordTime !== null) {
        console.log(`[V7-vv:WordBased] ✓ pauseAt "${pauseKeyword}" at ${pauseKeywordTime.toFixed(2)}s`);

        // Atualizar anchorActions com tempo preciso
        if (phase.anchorActions) {
          const pauseAction = phase.anchorActions.find(a => a.type === 'pause');
          if (pauseAction) {
            pauseAction.keywordTime = pauseKeywordTime;
          }
        }
      } else {
        console.warn(`[V7-vv:WordBased] ⚠️ pauseAt "${pauseKeyword}" NOT FOUND!`);
      }
    }

    // ✅ FASE 6: Calcular endTime CORRETO
    // REGRA SIMPLES: endTime = quando a narração DESSA FASE termina
    // NÃO adicionar margens excessivas que causam overlap com próxima fase

    let calculatedEndTime = phase.endTime;

    // ✅ FASE 6: Usar a próxima fase como limite máximo
    const nextPhase = index < phases.length - 1 ? phases[index + 1] : null;
    const maxEndTime = nextPhase ? nextPhase.startTime : totalAudioDuration;

    if (narrationEndTime !== null) {
      // O endTime base é quando a narração termina + pequena margem
      const baseEndTime = narrationEndTime + 0.3;

      if (isInteractive && pauseKeywordTime !== null) {
        // Para fases interativas: endTime deve cobrir até o pauseAt + pequena margem
        // O Frontend vai pausar no pauseAt, então só precisamos garantir que o áudio
        // PODE tocar até esse ponto
        const minEndForPause = pauseKeywordTime + 0.5; // Apenas 0.5s de margem (não 3s!)
        calculatedEndTime = Math.max(baseEndTime, minEndForPause);
        console.log(`[V7-vv:WordBased] ✅ Interactive phase: endTime = MAX(${baseEndTime.toFixed(2)}s, ${minEndForPause.toFixed(2)}s) = ${calculatedEndTime.toFixed(2)}s`);
      } else {
        calculatedEndTime = baseEndTime;
        console.log(`[V7-vv:WordBased] Normal phase: endTime = ${calculatedEndTime.toFixed(2)}s`);
      }
    } else {
      // ✅ FASE 6: Fallback quando narrationEndTime não foi encontrado
      // Usar o endTime original calculado em generatePhases
      console.warn(`[V7-vv:WordBased] ⚠️ narrationEndTime not found, using original endTime: ${calculatedEndTime.toFixed(2)}s`);

      // Se tiver pauseAt, garantir que endTime cobre até ele
      if (isInteractive && pauseKeywordTime !== null) {
        const minEndForPause = pauseKeywordTime + 0.5;
        if (calculatedEndTime < minEndForPause) {
          calculatedEndTime = minEndForPause;
          console.log(`[V7-vv:WordBased] ✅ Adjusted endTime to cover pauseAt: ${calculatedEndTime.toFixed(2)}s`);
        }
      }
    }

    // ✅ FASE 6 CRÍTICO: NUNCA extender endTime além do startTime da próxima fase
    // Isso causava o problema do "pulo" - o Frontend fazia seek para nextPhase.startTime
    // mas o áudio já estava além desse ponto por causa do endTime estendido
    if (nextPhase && calculatedEndTime > maxEndTime) {
      console.log(`[V7-vv:WordBased] ⚠️ FASE 6 FIX: endTime ${calculatedEndTime.toFixed(2)}s > nextPhase.startTime ${maxEndTime.toFixed(2)}s`);
      console.log(`[V7-vv:WordBased] ⚠️ Capping to ${maxEndTime.toFixed(2)}s to prevent overlap`);
      calculatedEndTime = maxEndTime;
    }

    // Última fase: termina no fim do áudio
    if (!nextPhase) {
      calculatedEndTime = totalAudioDuration;
    }

    // Garantir endTime > startTime
    if (calculatedEndTime <= phase.startTime) {
      calculatedEndTime = phase.startTime + 5.0; // Fallback: 5 segundos mínimo
      console.warn(`[V7-vv:WordBased] ⚠️ Using fallback endTime: ${calculatedEndTime.toFixed(2)}s`);
    }

    // ✅ Aplicar o endTime calculado
    phase.endTime = calculatedEndTime;

    console.log(`[V7-vv:WordBased] ✅ Final: ${phase.startTime.toFixed(2)}s - ${phase.endTime.toFixed(2)}s (duration: ${(phase.endTime - phase.startTime).toFixed(2)}s)`);
  });

  // Garantir que última fase termina exatamente no fim do áudio
  if (phases.length > 0) {
    phases[phases.length - 1].endTime = totalAudioDuration;
    console.log(`\n[V7-vv:WordBased] ✅ Last phase endTime set to totalAudioDuration: ${totalAudioDuration.toFixed(2)}s`);
  }

  // ✅ FASE 6: Log summary
  console.log('\n[V7-vv:WordBased] === FASE 6 TIMING SUMMARY ===');
  phases.forEach((phase, index) => {
    const duration = phase.endTime - phase.startTime;
    const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(phase.type);
    console.log(`  Phase ${index + 1} (${phase.type}${isInteractive ? ' 🎮' : ''}): ${phase.startTime.toFixed(2)}s - ${phase.endTime.toFixed(2)}s (${duration.toFixed(2)}s)`);
  });
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

    // ✅ FASE 4 FIX: feedbackAudios como OBJECT (Frontend acessa por key)
    // O Frontend faz: feedbackAudios?.[`feedback-${optionId}`]
    const feedbackAudios: FeedbackAudiosObject = {};

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
              // ✅ FASE 4 FIX: Determinar trigger baseado em isCorrect
              const trigger = option.isCorrect ? 'quiz-correct-answer' : 'quiz-incorrect-answer';
              const feedbackKey = `feedback-${option.id}`;

              // ✅ FASE 4 FIX: Armazenar como objeto indexado por key
              feedbackAudios[feedbackKey] = {
                id: feedbackKey,
                url: feedbackResult.url || '',
                duration: feedbackResult.duration || 0,
                wordTimestamps: feedbackResult.wordTimestamps || [],
                trigger,
              };
              console.log(`[V7-vv] ✅ Feedback audio for ${option.id}: ${feedbackResult.duration?.toFixed(1)}s (${trigger})`);
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
    // PASSO 4.5: RECALCULAR TIMINGS COM BASE EM KEYWORDS (FASE 1 FIX)
    // =========================================================================
    if (mainAudio.wordTimestamps.length > 0) {
      console.log('[V7-vv] Step 4.5: Recalculating word-based timings...');
      calculateWordBasedTimings(phases, mainAudio.wordTimestamps, input.scenes);
    }

    // =========================================================================
    // PASSO 5: CONSTRUIR OUTPUT
    // =========================================================================
    console.log('[V7-vv] Step 5: Building output...');

    const totalDuration = phases.length > 0 ? phases[phases.length - 1].endTime : mainAudio.duration;

    // ✅ FASE 2 FIX: Calcular flags para metadata
    const hasInteractivePhases = phases.some(p => ['interaction', 'quiz'].includes(p.type));
    const hasPlayground = phases.some(p => p.type === 'playground');
    const hasPostLessonExercises = !!(input.postLessonExercises && input.postLessonExercises.length > 0);

    const lessonData: LessonData = {
      // ✅ FASE 2 FIX: Estrutura compatível com OUTPUT funcional
      schema: 'v7-vv',                           // Bug 7: era "model"
      version: '1.0.0',                          // Bug 8: formato correto
      title: input.title,                        // Bug 9: title no root
      subtitle: input.subtitle || '',            // Bug 9: subtitle no root
      difficulty: input.difficulty,
      category: input.category,
      tags: input.tags,
      learningObjectives: input.learningObjectives,
      estimatedDuration: Math.ceil(totalDuration),
      metadata: {
        version: 'v7-vv',                        // Bug 10: metadata.version
        phaseCount: phases.length,
        totalDuration,
        hasInteractivePhases,                    // Bug 11: flag
        hasPlayground,                           // Bug 11: flag
        hasPostLessonExercises,                  // Bug 11: flag
      },
      phases,
      audio: {
        mainAudio,
        // ✅ FASE 4 FIX: feedbackAudios como objeto (Frontend acessa por key)
        feedbackAudios: Object.keys(feedbackAudios).length > 0 ? feedbackAudios : undefined,
      },
      // ✅ FASE 1 FIX: Passar campos direto do INPUT para OUTPUT
      postLessonExercises: input.postLessonExercises,
      postLessonFlow: input.postLessonFlow,
      gamification: input.gamification,
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
        feedbackAudioCount: feedbackAudios.length,
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
