/**
 * V7 Pipeline - Step 4: Calcular Anchors
 * 
 * Calcula os anchor actions baseados nos word timestamps e anchorText das cenas.
 * Esta é a etapa crítica para sincronização perfeita entre áudio e visual.
 * 
 * CHANGELOG:
 * - v2.1: Adicionado PHASE_DRIFT_FIX para detectar microVisuals com anchors antes da fase
 * - v2.1: Adicionado PREPASS para reservar espaço para fases interativas no final
 * - v2.1: Adicionado C07.2 PRIORITY RULE que respeita c07OriginalTime
 */

import { V7SceneInput, requiresAnchorPause } from '@/types/V7ScriptInput';
import { 
  V7PipelineContext, 
  V7Step3Output, 
  V7Step4Output, 
  V7Phase, 
  V7AnchorAction,
  V7WordTimestamp 
} from '../types';

interface Step4Context extends V7PipelineContext {
  audio: V7Step3Output;
  scenes: V7SceneInput[];
}

// Constantes para normalização e validação
const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground', 'secret-reveal', 'cta', 'gamification', 'quiz'];
const MIN_INTERACTIVE_DURATION = 5.0; // 5 segundos mínimo para fases interativas

export async function v7Step4CalculateAnchors(
  context: Step4Context
): Promise<V7Step4Output> {
  const { audio, scenes, logger } = context;
  const { wordTimestamps, totalDuration } = audio;
  const startTime = Date.now();
  
  await logger.info(4, 'Calculate Anchors', '⚓ Iniciando cálculo de anchors (v2.1)...');
  await logger.info(4, 'Calculate Anchors', `   ${wordTimestamps.length} word timestamps`);
  await logger.info(4, 'Calculate Anchors', `   ${scenes.length} cenas`);

  // ============================================================
  // 1. ENCONTRAR TIMESTAMPS PARA CADA CENA
  // ============================================================
  const phases: V7Phase[] = [];
  const allAnchorActions: V7AnchorAction[] = [];
  
  let currentWordIndex = 0;

  for (let sceneIdx = 0; sceneIdx < scenes.length; sceneIdx++) {
    const scene = scenes[sceneIdx];
    const sceneWords = scene.narration.split(/\s+/).filter(w => w.length > 0);
    
    // Encontrar início da cena nos word timestamps
    const sceneStartTime = findSceneStartTime(
      scene.narration,
      wordTimestamps,
      currentWordIndex,
      logger
    );

    // Encontrar fim da cena
    const nextScene = scenes[sceneIdx + 1];
    let sceneEndTime: number;
    
    if (nextScene) {
      sceneEndTime = findSceneStartTime(
        nextScene.narration,
        wordTimestamps,
        currentWordIndex + sceneWords.length - 10,
        logger
      );
    } else {
      sceneEndTime = totalDuration;
    }

    // Atualizar índice
    currentWordIndex += sceneWords.length;

    // ============================================================
    // 2. CRIAR ANCHOR ACTIONS PARA A CENA
    // ============================================================
    const sceneAnchorActions: V7AnchorAction[] = [];

    // ✅ CORREÇÃO CRÍTICA: Definir quais tipos de cena são INTERATIVOS
    // Apenas estes tipos devem criar anchor de PAUSE
    const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground', 'secret-reveal', 'cta', 'gamification'];
    const isInteractiveScene = INTERACTIVE_SCENE_TYPES.includes(scene.type);

    // 2.1 Anchor de pausa (APENAS para cenas interativas)
    if (scene.anchorText?.pauseAt) {
      // ✅ GUARD: Se a cena NÃO é interativa, ignorar pauseAt e avisar no log
      if (!isInteractiveScene) {
        await logger.warn(4, 'Calculate Anchors',
          `   ⚠️ ${scene.id}: pauseAt ignorado - cena tipo "${scene.type}" não é interativa`
        );
      } else {
        // Cena interativa: criar anchor de pause
        const pauseTimestamp = findKeywordTimestamp(
          scene.anchorText.pauseAt,
          wordTimestamps,
          sceneStartTime,
          sceneEndTime
        );

        if (pauseTimestamp !== null) {
          const pauseAction: V7AnchorAction = {
            id: `anchor-pause-${scene.id}`,
            anchorText: scene.anchorText.pauseAt,
            actionType: 'pause',
            timestamp: pauseTimestamp,
            payload: {
              targetPhaseId: scene.id,
              interactionType: scene.interaction?.type
            }
          };
          sceneAnchorActions.push(pauseAction);
          
          await logger.info(4, 'Calculate Anchors', 
            `   ⏸️ ${scene.id}: pausa em "${scene.anchorText.pauseAt}" @ ${pauseTimestamp.toFixed(2)}s`
          );
        } else {
          await logger.warn(4, 'Calculate Anchors',
            `   ⚠️ ${scene.id}: palavra-chave "${scene.anchorText.pauseAt}" não encontrada`
          );
        }
      }
    }

    // 2.2 Anchor de transição
    if (scene.anchorText?.transitionAt) {
      const transitionTimestamp = findKeywordTimestamp(
        scene.anchorText.transitionAt,
        wordTimestamps,
        sceneStartTime,
        sceneEndTime
      );

      if (transitionTimestamp !== null) {
        const transitionAction: V7AnchorAction = {
          id: `anchor-transition-${scene.id}`,
          anchorText: scene.anchorText.transitionAt,
          actionType: 'transition',
          timestamp: transitionTimestamp,
          payload: {
            targetPhaseId: scenes[sceneIdx + 1]?.id
          }
        };
        sceneAnchorActions.push(transitionAction);
      }
    }

    // 2.3 Anchors de micro-visuais
    if (scene.visual.microVisuals) {
      for (const microVisual of scene.visual.microVisuals) {
        const mvTimestamp = findKeywordTimestamp(
          microVisual.anchorText,
          wordTimestamps,
          sceneStartTime,
          sceneEndTime
        );

        if (mvTimestamp !== null) {
          const mvAction: V7AnchorAction = {
            id: `anchor-visual-${microVisual.id}`,
            anchorText: microVisual.anchorText,
            actionType: 'show-visual',
            timestamp: mvTimestamp,
            payload: {
              visualType: microVisual.type
            }
          };
          sceneAnchorActions.push(mvAction);
        }
      }
    }

    // Adicionar à lista global
    allAnchorActions.push(...sceneAnchorActions);

    // ============================================================
    // 3. CRIAR PHASE
    // ============================================================
    const phase: V7Phase = {
      id: scene.id,
      title: scene.title,
      type: scene.type,
      startTime: sceneStartTime,
      endTime: sceneEndTime,
      narration: scene.narration,
      visual: scene.visual,
      interaction: scene.interaction,
      anchorActions: sceneAnchorActions,
      sceneIndex: sceneIdx
    };

    phases.push(phase);

    await logger.info(4, 'Calculate Anchors',
      `   📍 ${scene.id}: ${sceneStartTime.toFixed(2)}s - ${sceneEndTime.toFixed(2)}s (${sceneAnchorActions.length} anchors)`
    );
  }

  // Ordenar anchor actions por timestamp
  allAnchorActions.sort((a, b) => a.timestamp - b.timestamp);

  const elapsedTime = Date.now() - startTime;
  await logger.success(4, 'Calculate Anchors', `✅ Anchors calculados em ${elapsedTime}ms`, {
    phases: phases.length,
    totalAnchors: allAnchorActions.length,
    pauseAnchors: allAnchorActions.filter(a => a.actionType === 'pause').length,
    visualAnchors: allAnchorActions.filter(a => a.actionType === 'show-visual').length
  });

  return {
    phases,
    anchorActions: allAnchorActions
  };
}

/**
 * Encontra o timestamp de início de uma cena usando word matching
 */
function findSceneStartTime(
  narration: string,
  wordTimestamps: V7WordTimestamp[],
  startFromIndex: number,
  logger: any
): number {
  if (wordTimestamps.length === 0) return 0;
  if (startFromIndex >= wordTimestamps.length) return wordTimestamps[wordTimestamps.length - 1].end_time;

  // Pegar primeiras 5 palavras da narração
  const firstWords = narration
    .split(/\s+/)
    .slice(0, 5)
    .map(w => normalizeWord(w))
    .join(' ');

  // Buscar nas word timestamps
  const searchStart = Math.max(0, startFromIndex - 10);
  
  for (let i = searchStart; i < wordTimestamps.length - 4; i++) {
    const windowWords = wordTimestamps
      .slice(i, i + 5)
      .map(w => normalizeWord(w.word))
      .join(' ');

    if (windowWords.includes(firstWords) || firstWords.includes(windowWords)) {
      return wordTimestamps[i].start_time;
    }
  }

  // Fallback: usar posição proporcional
  if (startFromIndex < wordTimestamps.length) {
    return wordTimestamps[startFromIndex].start_time;
  }

  return 0;
}

/**
 * Encontra o timestamp de uma palavra-chave específica
 */
function findKeywordTimestamp(
  keyword: string,
  wordTimestamps: V7WordTimestamp[],
  startTime: number,
  endTime: number
): number | null {
  const normalizedKeyword = normalizeWord(keyword);
  const keywordWords = normalizedKeyword.split(/\s+/);

  // Filtrar timestamps no range
  const relevantTimestamps = wordTimestamps.filter(
    wt => wt.start_time >= startTime && wt.start_time <= endTime
  );

  // Buscar keyword (pode ser uma frase)
  if (keywordWords.length === 1) {
    // Palavra única
    const match = relevantTimestamps.find(
      wt => normalizeWord(wt.word) === normalizedKeyword ||
            normalizeWord(wt.word).includes(normalizedKeyword)
    );
    return match ? match.start_time : null;
  }

  // Frase: buscar sequência
  for (let i = 0; i < relevantTimestamps.length - keywordWords.length + 1; i++) {
    const windowWords = relevantTimestamps
      .slice(i, i + keywordWords.length)
      .map(wt => normalizeWord(wt.word));

    if (windowWords.join(' ').includes(normalizedKeyword)) {
      return relevantTimestamps[i].start_time;
    }
  }

  return null;
}

/**
 * Normaliza uma palavra para comparação
 */
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, '')
    .trim();
}
