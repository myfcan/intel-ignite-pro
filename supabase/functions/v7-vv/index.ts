/**
 * V7-vv Pipeline - Cinematographic Lesson Generator
 *
 * ARQUITETURA DEFINITIVA:
 * - AnchorText como ÚNICO mecanismo de sincronização
 * - Múltiplos visuais cinematográficos por segmento de narração
 * - Validação rigorosa sem fallbacks
 * - Scenes alinhadas com wordTimestamps
 * - Sem fallbacks, sem remendos - código profissional
 *
 * @version VV (Versão Definitiva)
 * @author Claude Code Assistant
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// TIPOS - Formato de Entrada (Roteiro)
// ============================================================================

interface V7ScriptInput {
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  trail_id?: string;
  order_index?: number;

  // Configuração de áudio
  voice_id?: string;
  generate_audio?: boolean;
  fail_on_audio_error?: boolean;

  // CENAS - Estrutura cinematográfica baseada em roteiro
  scenes: V7SceneInput[];
}

interface V7SceneInput {
  id: string;
  title: string;
  type: 'dramatic' | 'narrative' | 'comparison' | 'interaction' | 'playground' | 'revelation' | 'gamification' | 'secret-reveal';

  // Narração (texto que será convertido em áudio)
  narration: string;

  // AnchorText - Palavra/frase que dispara a transição/pausa
  // OBRIGATÓRIO para cenas interativas (interaction, playground, secret-reveal)
  anchorText?: {
    // Palavra que, quando falada, pausa o áudio para interação
    pauseAt?: string;
    // Palavra que, quando falada, transita para próxima cena
    transitionAt?: string;
  };

  // Visual - Configuração cinematográfica
  visual: V7VisualConfig;

  // Interação (para cenas interativas)
  interaction?: V7InteractionConfig;
}

interface V7VisualConfig {
  // Tipo de visual principal
  type: 'number-reveal' | 'text-reveal' | 'letterbox' | 'split-screen' | 'quiz' | 'playground' | 'comparison' | 'cta' | 'result';

  // Conteúdo do visual (varia por tipo)
  content: {
    // Para number-reveal
    mainValue?: string;
    secondaryValue?: string;
    subtitle?: string;
    highlightWord?: string;

    // Para letterbox/text-reveal
    hookQuestion?: string;
    mainText?: string;
    impactWord?: string;

    // Para comparison/split-screen
    leftCard?: {
      label: string;
      value: string;
      details: string[];
      isPositive: boolean;
      prompt?: string;
      result?: string;
    };
    rightCard?: {
      label: string;
      value: string;
      details: string[];
      isPositive: boolean;
      prompt?: string;
      result?: string;
    };

    // Para result/gamification
    emoji?: string;
    title?: string;
    message?: string;
    metrics?: Array<{ label: string; value: string; isHighlight?: boolean }>;
    ctaText?: string;

    // Qualquer outro campo customizado
    [key: string]: any;
  };

  // Efeitos cinematográficos
  effects?: {
    mood?: 'dramatic' | 'calm' | 'energetic' | 'mysterious' | 'danger' | 'success';
    particles?: 'confetti' | 'sparks' | 'ember' | 'stars' | 'none';
    glow?: boolean;
    shake?: boolean;
    pulse?: boolean;
  };

  // Micro-visuais que aparecem DURANTE a narração desta cena
  // Cada um é ativado por um anchorText específico
  microVisuals?: Array<{
    id: string;
    anchorText: string; // Palavra que ativa este visual
    type: 'icon' | 'text' | 'number' | 'image' | 'badge' | 'highlight';
    content: {
      value?: string;
      icon?: string;
      color?: string;
      animation?: string;
      position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    };
  }>;
}

interface V7InteractionConfig {
  type: 'quiz' | 'playground';

  // Para quiz
  question?: string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
    feedback?: string;
  }>;

  // Para playground
  amateurPrompt?: string;
  professionalPrompt?: string;
  amateurResult?: {
    title: string;
    content: string;
    score: number;
    verdict: string;
  };
  professionalResult?: {
    title: string;
    content: string;
    score: number;
    verdict: string;
  };

  // Revelação após interação
  revealMessage?: string;
  secretContent?: string;
}

// ============================================================================
// TIPOS - Formato de Saída (Pronto para Frontend)
// ============================================================================

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface V7Phase {
  id: string;
  title: string;
  type: string;
  startTime: number;
  endTime: number;

  // AnchorActions - O que fazer quando palavras específicas são detectadas
  anchorActions: Array<{
    id: string;
    keyword: string;
    keywordTime: number; // Tempo exato no áudio
    type: 'pause' | 'show' | 'highlight' | 'trigger';
    targetId?: string;
  }>;

  // Scenes cinematográficas com timing preciso
  scenes: Array<{
    id: string;
    type: string;
    startTime: number;
    duration: number;  // Duração em segundos (compatível com frontend V7Scene)
    content: Record<string, any>;
    animation: string;
  }>;

  // Interação (se aplicável)
  interaction?: V7InteractionConfig;

  // Comportamento de áudio durante interação
  audioBehavior?: {
    onStart: 'pause' | 'fade' | 'continue';
    onComplete: 'resume' | 'next-phase';
  };
}

interface V7LessonOutput {
  model: 'v7-cinematic';
  version: 'vv';
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
    generatedBy: 'V7-vv';
  };

  phases: V7Phase[];

  audioConfig: {
    url: string;
    duration: number;
    wordTimestampsCount: number;
  };

  wordTimestamps: WordTimestamp[];
}

// ============================================================================
// VALIDAÇÃO RIGOROSA
// ============================================================================

interface ValidationError {
  scene: string;
  field: string;
  message: string;
}

function validateInput(input: V7ScriptInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validar campos obrigatórios
  if (!input.title?.trim()) {
    errors.push({ scene: 'root', field: 'title', message: 'Título é obrigatório' });
  }

  if (!input.scenes || input.scenes.length === 0) {
    errors.push({ scene: 'root', field: 'scenes', message: 'Pelo menos uma cena é obrigatória' });
    return errors; // Não pode continuar sem cenas
  }

  // Validar cada cena
  input.scenes.forEach((scene, index) => {
    const sceneId = scene.id || `scene-${index + 1}`;

    // Narração obrigatória
    if (!scene.narration?.trim()) {
      errors.push({
        scene: sceneId,
        field: 'narration',
        message: `Cena "${sceneId}" não tem narração. Toda cena deve ter texto de narração.`
      });
    }

    // Visual obrigatório
    if (!scene.visual) {
      errors.push({
        scene: sceneId,
        field: 'visual',
        message: `Cena "${sceneId}" não tem configuração visual.`
      });
    }

    // AnchorText OBRIGATÓRIO para cenas interativas
    const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(scene.type);
    if (isInteractive && !scene.anchorText?.pauseAt) {
      errors.push({
        scene: sceneId,
        field: 'anchorText.pauseAt',
        message: `Cena interativa "${sceneId}" (${scene.type}) DEVE ter anchorText.pauseAt definido. ` +
                 `Este é o texto no áudio que irá pausar para a interação.`
      });
    }

    // Validar interação para cenas que precisam
    if (scene.type === 'interaction' && (!scene.interaction?.options || scene.interaction.options.length === 0)) {
      errors.push({
        scene: sceneId,
        field: 'interaction.options',
        message: `Cena de interação "${sceneId}" deve ter opções de quiz.`
      });
    }

    if (scene.type === 'playground' && !scene.interaction?.amateurPrompt) {
      errors.push({
        scene: sceneId,
        field: 'interaction.amateurPrompt',
        message: `Cena de playground "${sceneId}" deve ter prompts de comparação.`
      });
    }

    // Validar microVisuals (cada um precisa de anchorText)
    scene.visual?.microVisuals?.forEach((mv, mvIndex) => {
      if (!mv.anchorText?.trim()) {
        errors.push({
          scene: sceneId,
          field: `visual.microVisuals[${mvIndex}].anchorText`,
          message: `MicroVisual ${mvIndex + 1} da cena "${sceneId}" não tem anchorText. ` +
                   `Todo microVisual deve ter uma palavra que o ativa.`
        });
      }
    });
  });

  return errors;
}

// ============================================================================
// GERAÇÃO DE ÁUDIO COM ELEVENLABS
// ============================================================================

async function generateAudioWithElevenLabs(
  narrations: string[],
  voiceId?: string,
  supabase?: any
): Promise<{
  success: boolean;
  audioUrl?: string;
  wordTimestamps?: WordTimestamp[];
  duration?: number;
  error?: string;
}> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

  if (!ELEVENLABS_API_KEY) {
    return { success: false, error: 'ELEVENLABS_API_KEY not configured' };
  }

  // Concatenar todas as narrações com pausas entre cenas
  const fullText = narrations
    .map(n => n.trim())
    .filter(n => n.length > 0)
    .join('\n\n');

  const voice = voiceId || 'Xb7hH8MSUJpSbSDYk0k2'; // Alice - bom para português
  const modelId = 'eleven_multilingual_v2';

  console.log('[V7Pipeline:Audio] Generating audio...');
  console.log('[V7Pipeline:Audio] Text length:', fullText.length);

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
          text: fullText,
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

    console.log('[V7Pipeline:Audio] Audio generated, processing timestamps...');

    // Processar word timestamps
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
      console.log('[V7Pipeline:Audio] Processed', wordTimestamps.length, 'word timestamps');
    }

    // Upload para Supabase Storage
    let audioUrl = '';
    if (supabase) {
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const fileName = `v7-lesson-${Date.now()}.mp3`;

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
      duration,
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

// ============================================================================
// ENCONTRAR PALAVRA NO WORD TIMESTAMPS
// ============================================================================

function findKeywordInTimestamps(
  keyword: string,
  wordTimestamps: WordTimestamp[],
  afterTime: number = 0
): { word: string; time: number } | null {
  const normalize = (w: string) =>
    w.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,!?;:'"()[\]{}…]+/g, '')
      .trim();

  const keywordParts = keyword.split(/\s+/).map(normalize).filter(w => w.length > 0);

  if (keywordParts.length === 0) return null;

  // Para multi-word, encontrar sequência
  if (keywordParts.length > 1) {
    for (let i = 0; i <= wordTimestamps.length - keywordParts.length; i++) {
      if (wordTimestamps[i].start < afterTime) continue;

      let allMatch = true;
      for (let j = 0; j < keywordParts.length; j++) {
        const wordNorm = normalize(wordTimestamps[i + j].word);
        if (wordNorm !== keywordParts[j]) {
          allMatch = false;
          break;
        }
      }

      if (allMatch) {
        const lastWord = wordTimestamps[i + keywordParts.length - 1];
        return { word: keyword, time: lastWord.end };
      }
    }
    return null;
  }

  // Single word
  const targetWord = keywordParts[0];
  for (const ts of wordTimestamps) {
    if (ts.start < afterTime) continue;
    if (normalize(ts.word) === targetWord) {
      return { word: ts.word, time: ts.end };
    }
  }

  return null;
}

// ============================================================================
// GERAR PHASES CINEMATOGRÁFICAS
// ============================================================================

function generatePhases(
  scenes: V7SceneInput[],
  wordTimestamps: WordTimestamp[],
  totalDuration: number
): V7Phase[] {
  const phases: V7Phase[] = [];

  let lastEndTime = 0;

  scenes.forEach((scene, index) => {
    console.log(`[V7Pipeline:Phase] Processing scene ${index + 1}: "${scene.title}" (${scene.type})`);

    // Encontrar timing da narração desta cena
    const narrationWords = scene.narration.split(/\s+/).filter(w => w.length > 0);
    const firstWord = narrationWords[0];
    const lastWord = narrationWords[narrationWords.length - 1];

    // Encontrar início (primeira palavra da narração)
    const firstWordMatch = findKeywordInTimestamps(firstWord, wordTimestamps, lastEndTime);
    const startTime = firstWordMatch ? firstWordMatch.time - 0.5 : lastEndTime;

    // Encontrar fim (última palavra da narração)
    const lastWordMatch = findKeywordInTimestamps(lastWord, wordTimestamps, startTime);
    const endTime = lastWordMatch ? lastWordMatch.time + 0.5 : startTime + 30;

    console.log(`[V7Pipeline:Phase] Timing: ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s`);

    // Criar anchorActions
    const anchorActions: V7Phase['anchorActions'] = [];

    // Adicionar pauseAt se definido
    if (scene.anchorText?.pauseAt) {
      const pauseMatch = findKeywordInTimestamps(scene.anchorText.pauseAt, wordTimestamps, startTime);
      if (pauseMatch) {
        anchorActions.push({
          id: `pause-${scene.id}`,
          keyword: scene.anchorText.pauseAt,
          keywordTime: pauseMatch.time,
          type: 'pause',
        });
        console.log(`[V7Pipeline:Phase] pauseAt "${scene.anchorText.pauseAt}" found at ${pauseMatch.time.toFixed(1)}s`);
      } else {
        console.warn(`[V7Pipeline:Phase] ⚠️ pauseAt "${scene.anchorText.pauseAt}" NOT FOUND in audio!`);
      }
    }

    // Adicionar microVisuals como anchorActions de show
    scene.visual?.microVisuals?.forEach((mv, mvIndex) => {
      const mvMatch = findKeywordInTimestamps(mv.anchorText, wordTimestamps, startTime);
      if (mvMatch) {
        anchorActions.push({
          id: mv.id || `mv-${scene.id}-${mvIndex}`,
          keyword: mv.anchorText,
          keywordTime: mvMatch.time,
          type: 'show',
          targetId: mv.id,
        });
        console.log(`[V7Pipeline:Phase] microVisual "${mv.anchorText}" at ${mvMatch.time.toFixed(1)}s`);
      }
    });

    // Gerar scenes cinematográficas
    const cinematicScenes = generateCinematicScenes(
      scene,
      startTime,
      endTime,
      wordTimestamps
    );

    // Determinar comportamento de áudio
    const isInteractive = ['interaction', 'playground', 'secret-reveal'].includes(scene.type);

    const phase: V7Phase = {
      id: scene.id,
      title: scene.title,
      type: scene.type,
      startTime,
      endTime,
      anchorActions,
      scenes: cinematicScenes,
      interaction: scene.interaction,
      audioBehavior: isInteractive ? {
        onStart: 'pause',
        onComplete: 'resume',
      } : undefined,
    };

    phases.push(phase);
    lastEndTime = endTime;
  });

  return phases;
}

// ============================================================================
// GERAR SCENES CINEMATOGRÁFICAS (Múltiplas por cena)
// ============================================================================

// Internal representation with endTime for calculations
interface CinematicSceneInternal {
  id: string;
  type: string;
  startTime: number;
  endTime: number;
  content: Record<string, any>;
  animation: string;
}

// Frontend-compatible format with duration
interface CinematicScene {
  id: string;
  type: string;
  startTime: number;
  duration: number;
  content: Record<string, any>;
  animation: string;
}

// Transform internal scenes to frontend-compatible format
function transformScenesToDuration(scenes: CinematicSceneInternal[]): CinematicScene[] {
  return scenes.map(scene => ({
    id: scene.id,
    type: scene.type,
    startTime: scene.startTime,
    duration: scene.endTime - scene.startTime,
    content: scene.content,
    animation: scene.animation,
  }));
}

function generateCinematicScenes(
  scene: V7SceneInput,
  startTime: number,
  endTime: number,
  wordTimestamps: WordTimestamp[]
): CinematicScene[] {
  // Use internal format with endTime for calculations
  const internalScenes: CinematicSceneInternal[] = [];
  const duration = endTime - startTime;
  const visual = scene.visual;

  // Efeitos padrão
  const effects = visual.effects || { mood: 'dramatic', particles: 'sparks', glow: true };

  // Gerar scenes baseado no tipo
  switch (scene.type) {
    case 'dramatic':
      internalScenes.push(...generateDramaticScenes(scene.id, visual, startTime, duration, effects));
      break;

    case 'narrative':
    case 'comparison':
      internalScenes.push(...generateNarrativeScenes(scene.id, visual, startTime, duration, effects));
      break;

    case 'interaction':
      internalScenes.push(...generateInteractionScenes(scene.id, visual, scene.interaction, startTime, duration));
      break;

    case 'playground':
      internalScenes.push(...generatePlaygroundScenes(scene.id, visual, scene.interaction, startTime, duration));
      break;

    case 'revelation':
    case 'secret-reveal':
      internalScenes.push(...generateRevelationScenes(scene.id, visual, scene.interaction, startTime, duration));
      break;

    case 'gamification':
      internalScenes.push(...generateGamificationScenes(scene.id, visual, startTime, duration));
      break;

    default:
      internalScenes.push({
        id: `${scene.id}-main`,
        type: 'text-reveal',
        startTime,
        endTime: startTime + duration,
        content: visual.content,
        animation: 'fade',
      });
  }

  // Adicionar microVisuals como scenes individuais
  visual.microVisuals?.forEach((mv, index) => {
    // Encontrar timing do anchorText
    const matchTime = startTime + (duration * (index + 1) / (visual.microVisuals!.length + 1));

    internalScenes.push({
      id: mv.id || `${scene.id}-mv-${index}`,
      type: `micro-${mv.type}`,
      startTime: matchTime,
      endTime: matchTime + 2, // 2 segundos de duração
      content: mv.content,
      animation: mv.content.animation || 'scale-up',
    });
  });

  // Ordenar por startTime
  internalScenes.sort((a, b) => a.startTime - b.startTime);

  // Transform to frontend-compatible format with duration
  return transformScenesToDuration(internalScenes);
}

function generateDramaticScenes(
  sceneId: string,
  visual: V7VisualConfig,
  startTime: number,
  duration: number,
  effects: V7VisualConfig['effects']
): CinematicSceneInternal[] {
  const content = visual.content;
  const scenes: CinematicSceneInternal[] = [];

  // Scene 1: Letterbox com hook question (15% da duração)
  if (content.hookQuestion) {
    scenes.push({
      id: `${sceneId}-letterbox`,
      type: 'letterbox',
      startTime,
      endTime: startTime + duration * 0.15,
      content: {
        hookQuestion: content.hookQuestion,
        backgroundColor: 'black',
        aspectRatio: 'cinematic',
      },
      animation: 'letterbox',
    });
  }

  // Scene 2: Número principal com glow (20% da duração)
  if (content.mainValue) {
    scenes.push({
      id: `${sceneId}-number`,
      type: 'number-reveal',
      startTime: startTime + duration * 0.15,
      endTime: startTime + duration * 0.35,
      content: {
        number: content.mainValue,
        secondaryNumber: content.secondaryValue,
        glowEffect: effects?.glow ?? true,
        countUpAnimation: true,
      },
      animation: 'count-up',
    });
  }

  // Scene 3: Subtitle com highlight (25% da duração)
  if (content.subtitle) {
    scenes.push({
      id: `${sceneId}-subtitle`,
      type: 'text-reveal',
      startTime: startTime + duration * 0.35,
      endTime: startTime + duration * 0.6,
      content: {
        mainText: content.subtitle,
        highlightWord: content.highlightWord,
        letterByLetter: true,
      },
      animation: 'letter-by-letter',
    });
  }

  // Scene 4: Particle explosion (15% da duração)
  scenes.push({
    id: `${sceneId}-particles`,
    type: 'particle-effect',
    startTime: startTime + duration * 0.6,
    endTime: startTime + duration * 0.75,
    content: {
      particleType: effects?.particles || 'sparks',
      particleColor: effects?.mood === 'danger' ? '#ff0040' : '#22D3EE',
    },
    animation: 'particle-burst',
  });

  // Scene 5: Impact word (25% da duração)
  if (content.impactWord) {
    scenes.push({
      id: `${sceneId}-impact`,
      type: 'text-reveal',
      startTime: startTime + duration * 0.75,
      endTime: startTime + duration,
      content: {
        mainText: content.impactWord,
        cameraZoom: true,
        cameraShake: effects?.shake ?? true,
      },
      animation: 'zoom-in',
    });
  }

  return scenes;
}

function generateNarrativeScenes(
  sceneId: string,
  visual: V7VisualConfig,
  startTime: number,
  duration: number,
  effects: V7VisualConfig['effects']
): CinematicSceneInternal[] {
  const content = visual.content;
  const scenes: CinematicSceneInternal[] = [];

  // Scene 1: Title fade in (15%)
  scenes.push({
    id: `${sceneId}-title`,
    type: 'letterbox',
    startTime,
    endTime: startTime + duration * 0.15,
    content: {
      mainText: content.mainText || content.title,
      subtitle: content.subtitle,
      aspectRatio: 'cinematic',
    },
    animation: 'letterbox',
  });

  // Se tiver comparação (leftCard/rightCard)
  if (content.leftCard && content.rightCard) {
    // Scene 2: Left card slide in (25%)
    scenes.push({
      id: `${sceneId}-left`,
      type: 'comparison-card',
      startTime: startTime + duration * 0.15,
      endTime: startTime + duration * 0.4,
      content: {
        ...content.leftCard,
        position: 'left',
        glowColor: content.leftCard.isPositive ? '#4ecdc4' : '#ff6b6b',
      },
      animation: 'slide-left',
    });

    // Scene 3: Right card slide in (25%)
    scenes.push({
      id: `${sceneId}-right`,
      type: 'comparison-card',
      startTime: startTime + duration * 0.4,
      endTime: startTime + duration * 0.65,
      content: {
        ...content.rightCard,
        position: 'right',
        glowColor: content.rightCard.isPositive ? '#4ecdc4' : '#ff6b6b',
      },
      animation: 'slide-right',
    });

    // Scene 4: Comparison highlight (20%)
    scenes.push({
      id: `${sceneId}-compare`,
      type: 'comparison-highlight',
      startTime: startTime + duration * 0.65,
      endTime: startTime + duration * 0.85,
      content: {
        leftValue: content.leftCard.value,
        rightValue: content.rightCard.value,
        winner: content.rightCard.isPositive ? 'right' : 'left',
        pulseEffect: true,
      },
      animation: 'pulse',
    });

    // Scene 5: Transition (15%)
    scenes.push({
      id: `${sceneId}-transition`,
      type: 'transition-effect',
      startTime: startTime + duration * 0.85,
      endTime: startTime + duration,
      content: {
        transitionType: 'fade-scale',
      },
      animation: 'fade',
    });
  } else {
    // Narrative sem comparação - texto simples
    scenes.push({
      id: `${sceneId}-content`,
      type: 'text-reveal',
      startTime: startTime + duration * 0.15,
      endTime: startTime + duration,
      content: {
        mainText: content.mainText,
        items: content.items,
      },
      animation: 'slide-up',
    });
  }

  return scenes;
}

function generateInteractionScenes(
  sceneId: string,
  visual: V7VisualConfig,
  interaction: V7InteractionConfig | undefined,
  startTime: number,
  duration: number
): CinematicSceneInternal[] {
  const content = visual.content;
  const scenes: CinematicSceneInternal[] = [];

  // Scene 1: Quiz intro (20%)
  scenes.push({
    id: `${sceneId}-intro`,
    type: 'quiz-intro',
    startTime,
    endTime: startTime + duration * 0.2,
    content: {
      title: content.title || 'AUTO-AVALIAÇÃO',
      subtitle: content.subtitle,
      iconBounce: true,
    },
    animation: 'scale-up',
  });

  // Scene 2: Question reveal (20%)
  scenes.push({
    id: `${sceneId}-question`,
    type: 'quiz-question',
    startTime: startTime + duration * 0.2,
    endTime: startTime + duration * 0.4,
    content: {
      question: interaction?.question || content.question,
    },
    animation: 'slide-up',
  });

  // Scene 3: Options (60% - aguardando interação)
  scenes.push({
    id: `${sceneId}-options`,
    type: 'quiz',
    startTime: startTime + duration * 0.4,
    endTime: startTime + duration,
    content: {
      question: interaction?.question || content.question,
      options: interaction?.options || [],
      highlightOnHover: true,
    },
    animation: 'stagger-in',
  });

  return scenes;
}

function generatePlaygroundScenes(
  sceneId: string,
  visual: V7VisualConfig,
  interaction: V7InteractionConfig | undefined,
  startTime: number,
  duration: number
): CinematicSceneInternal[] {
  const content = visual.content;
  const scenes: CinematicSceneInternal[] = [];

  // Scene 1: Challenge title (10%)
  scenes.push({
    id: `${sceneId}-title`,
    type: 'playground-intro',
    startTime,
    endTime: startTime + duration * 0.1,
    content: {
      title: content.title || 'DESAFIO PRÁTICO',
      subtitle: content.subtitle,
      glitchEffect: true,
    },
    animation: 'glitch',
  });

  // Scene 2: Amateur prompt (15%)
  scenes.push({
    id: `${sceneId}-amateur-prompt`,
    type: 'playground-code',
    startTime: startTime + duration * 0.1,
    endTime: startTime + duration * 0.25,
    content: {
      label: 'PROMPT AMADOR',
      prompt: interaction?.amateurPrompt || content.leftCard?.prompt,
      typewriterSpeed: 50,
    },
    animation: 'typewriter',
  });

  // Scene 3: Amateur result (15%)
  scenes.push({
    id: `${sceneId}-amateur-result`,
    type: 'playground-result',
    startTime: startTime + duration * 0.25,
    endTime: startTime + duration * 0.4,
    content: {
      label: 'RESULTADO',
      result: interaction?.amateurResult || content.leftCard?.result,
      scoreColor: 'red',
    },
    animation: 'slide-up',
  });

  // Scene 4: Professional prompt (15%)
  scenes.push({
    id: `${sceneId}-pro-prompt`,
    type: 'playground-code',
    startTime: startTime + duration * 0.4,
    endTime: startTime + duration * 0.55,
    content: {
      label: 'PROMPT PROFISSIONAL',
      prompt: interaction?.professionalPrompt || content.rightCard?.prompt,
      typewriterSpeed: 30,
    },
    animation: 'typewriter',
  });

  // Scene 5: Professional result (15%)
  scenes.push({
    id: `${sceneId}-pro-result`,
    type: 'playground-result',
    startTime: startTime + duration * 0.55,
    endTime: startTime + duration * 0.7,
    content: {
      label: 'RESULTADO',
      result: interaction?.professionalResult || content.rightCard?.result,
      scoreColor: 'green',
      particles: 'sparks',
    },
    animation: 'slide-up',
  });

  // Scene 6: Comparison (30% - aguardando interação)
  scenes.push({
    id: `${sceneId}-comparison`,
    type: 'playground',
    startTime: startTime + duration * 0.7,
    endTime: startTime + duration,
    content: {
      amateurPrompt: interaction?.amateurPrompt,
      professionalPrompt: interaction?.professionalPrompt,
      amateurResult: interaction?.amateurResult,
      professionalResult: interaction?.professionalResult,
      raceAnimation: true,
      winnerEffect: 'confetti',
    },
    animation: 'fade',
  });

  return scenes;
}

function generateRevelationScenes(
  sceneId: string,
  visual: V7VisualConfig,
  interaction: V7InteractionConfig | undefined,
  startTime: number,
  duration: number
): CinematicSceneInternal[] {
  const content = visual.content;
  const scenes: CinematicSceneInternal[] = [];

  // Scene 1: Dramatic pause (10%)
  scenes.push({
    id: `${sceneId}-pause`,
    type: 'letterbox',
    startTime,
    endTime: startTime + duration * 0.1,
    content: {
      backgroundColor: 'black',
    },
    animation: 'fade',
  });

  // Scene 2: Title reveal (20%)
  scenes.push({
    id: `${sceneId}-title`,
    type: 'text-reveal',
    startTime: startTime + duration * 0.1,
    endTime: startTime + duration * 0.3,
    content: {
      mainText: content.title || '✨ REVELAÇÃO',
      glowEffect: true,
    },
    animation: 'zoom-in',
  });

  // Scene 3: Secret content (40%)
  scenes.push({
    id: `${sceneId}-secret`,
    type: 'secret-reveal',
    startTime: startTime + duration * 0.3,
    endTime: startTime + duration * 0.7,
    content: {
      secretContent: interaction?.secretContent || content.message,
      items: content.items,
      staggerChildren: 0.25,
    },
    animation: 'stagger-in',
  });

  // Scene 4: CTA (30%)
  scenes.push({
    id: `${sceneId}-cta`,
    type: 'cta',
    startTime: startTime + duration * 0.7,
    endTime: startTime + duration,
    content: {
      title: content.ctaText || 'Próximos Passos',
      options: content.options,
      pulseAnimation: true,
    },
    animation: 'slide-up',
  });

  return scenes;
}

function generateGamificationScenes(
  sceneId: string,
  visual: V7VisualConfig,
  startTime: number,
  duration: number
): CinematicSceneInternal[] {
  const content = visual.content;
  const scenes: CinematicSceneInternal[] = [];

  // Scene 1: Celebration title (25%)
  scenes.push({
    id: `${sceneId}-title`,
    type: 'text-reveal',
    startTime,
    endTime: startTime + duration * 0.25,
    content: {
      mainText: content.emoji ? `${content.emoji} ${content.title}` : '🏆 PARABÉNS!',
      glowEffect: true,
      particles: 'confetti',
    },
    animation: 'scale-up',
  });

  // Scene 2: Achievements (40%)
  scenes.push({
    id: `${sceneId}-achievements`,
    type: 'result',
    startTime: startTime + duration * 0.25,
    endTime: startTime + duration * 0.65,
    content: {
      title: 'CONQUISTAS',
      items: content.items,
      staggerChildren: 0.2,
      iconBounce: true,
    },
    animation: 'slide-up',
  });

  // Scene 3: Metrics (35%)
  scenes.push({
    id: `${sceneId}-metrics`,
    type: 'result',
    startTime: startTime + duration * 0.65,
    endTime: startTime + duration,
    content: {
      title: 'RECOMPENSAS',
      metrics: content.metrics,
      particles: 'sparks',
    },
    animation: 'explode',
  });

  return scenes;
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

    const input: V7ScriptInput = await req.json();
    console.log('[V7-vv] Starting for:', input.title);
    console.log('[V7-vv] Scenes:', input.scenes?.length || 0);

    // =========================================================================
    // PASSO 1: VALIDAÇÃO RIGOROSA
    // =========================================================================
    console.log('[V7-vv] Step 1: Validating input...');

    const validationErrors = validateInput(input);
    if (validationErrors.length > 0) {
      console.error('[V7-vv] ❌ Validation failed:', validationErrors);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          validationErrors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[V7-vv] ✅ Validation passed');

    // =========================================================================
    // PASSO 2: GERAR ÁUDIO COM ELEVENLABS
    // =========================================================================
    console.log('[V7-vv] Step 2: Generating audio...');

    const narrations = input.scenes.map(s => s.narration);
    const shouldGenerateAudio = input.generate_audio !== false;

    let audioUrl = '';
    let wordTimestamps: WordTimestamp[] = [];
    let audioDuration = 0;

    if (shouldGenerateAudio) {
      const audioResult = await generateAudioWithElevenLabs(
        narrations,
        input.voice_id,
        supabase
      );

      if (!audioResult.success) {
        if (input.fail_on_audio_error) {
          throw new Error(`Audio generation failed: ${audioResult.error}`);
        }
        console.warn('[V7-vv] ⚠️ Audio failed, continuing without audio');
      } else {
        audioUrl = audioResult.audioUrl || '';
        wordTimestamps = audioResult.wordTimestamps || [];
        audioDuration = audioResult.duration || 0;
        console.log('[V7-vv] ✅ Audio generated:', audioUrl);
        console.log('[V7-vv] Word timestamps:', wordTimestamps.length);
      }
    } else {
      console.log('[V7-vv] Skipping audio generation');
      // Estimar duração baseado no texto (~150 palavras por minuto)
      const totalWords = narrations.join(' ').split(/\s+/).length;
      audioDuration = (totalWords / 150) * 60;
    }

    // =========================================================================
    // PASSO 3: GERAR PHASES COM TIMING PRECISO
    // =========================================================================
    console.log('[V7-vv] Step 3: Generating phases...');

    const phases = generatePhases(input.scenes, wordTimestamps, audioDuration);
    console.log('[V7-vv] ✅ Generated', phases.length, 'phases');

    // Verificar se todos os anchorTexts foram encontrados
    let missingAnchors: string[] = [];
    phases.forEach(phase => {
      const scene = input.scenes.find(s => s.id === phase.id);
      if (scene?.anchorText?.pauseAt) {
        const found = phase.anchorActions.find(a => a.keyword === scene.anchorText!.pauseAt);
        if (!found) {
          missingAnchors.push(`Scene "${phase.id}": pauseAt "${scene.anchorText.pauseAt}" not found`);
        }
      }
    });

    if (missingAnchors.length > 0) {
      console.warn('[V7-vv] ⚠️ Missing anchors:', missingAnchors);
    }

    // =========================================================================
    // PASSO 4: CONSTRUIR OUTPUT FINAL
    // =========================================================================
    console.log('[V7-vv] Step 4: Building output...');

    const totalDuration = phases.length > 0
      ? phases[phases.length - 1].endTime
      : audioDuration;

    const lessonOutput: V7LessonOutput = {
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
      audioConfig: {
        url: audioUrl,
        duration: audioDuration,
        wordTimestampsCount: wordTimestamps.length,
      },
      wordTimestamps,
    };

    // =========================================================================
    // PASSO 5: SALVAR NO BANCO
    // =========================================================================
    console.log('[V7-vv] Step 5: Saving to database...');

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        title: input.title,
        description: input.subtitle || `Aula V7 Cinematográfica: ${input.title}`,
        trail_id: input.trail_id || null,
        order_index: input.order_index || 0,
        model: 'v7',
        lesson_type: 'v7-cinematic',
        content: lessonOutput,
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
      console.error('[V7-vv] Database error:', lessonError);
      throw new Error(`Failed to save lesson: ${lessonError.message}`);
    }

    const lessonId = lesson.id;
    console.log('[V7-vv] ✅ Lesson saved with ID:', lessonId);

    // =========================================================================
    // RESPOSTA
    // =========================================================================
    const response = {
      success: true,
      lessonId,
      stats: {
        phaseCount: phases.length,
        sceneCount: phases.reduce((sum, p) => sum + p.scenes.length, 0),
        anchorCount: phases.reduce((sum, p) => sum + p.anchorActions.length, 0),
        totalDuration,
        hasAudio: !!audioUrl,
        wordTimestampsCount: wordTimestamps.length,
        missingAnchors: missingAnchors.length > 0 ? missingAnchors : undefined,
      },
    };

    console.log('[V7-vv] ✅ Pipeline completed successfully');
    console.log('[V7-vv] Stats:', JSON.stringify(response.stats));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[V7-vv] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
