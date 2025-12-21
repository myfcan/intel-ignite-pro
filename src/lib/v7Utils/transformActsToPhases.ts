// src/lib/v7Utils/transformActsToPhases.ts
// Transforms V7-v2 cinematic_flow.acts into V7Phase[] for V7PhasePlayer
// ✅ V7-v2: Full support for audioBehavior, timeout, anchorPoints, visual configs

import type { V7Phase, V7Scene, V7AudioBehavior, V7TimeoutConfig } from '@/components/lessons/v7/cinematic/phases/V7PhaseController';
import type { AnchorAction } from '@/components/lessons/v7/cinematic/useAnchorText';

// ============================================================================
// TYPES
// ============================================================================

export interface V7Act {
  id: string;
  type: string;
  subtype?: string;
  title?: string;
  startTime: number;
  endTime?: number;
  duration: number;

  // V7-v2: Narration at act level
  narration?: string;

  // V7-v2: Visual and audio configs
  visual?: any;
  audio?: any;
  transitions?: any;

  // V7-v2: Interaction config
  interaction?: any;
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
  anchorPoints?: Array<{
    keyword: string;
    action: string;
    target?: string;
    duration?: number;
  }>;

  // Legacy content structure
  content?: any;
}

// ============================================================================
// MAIN TRANSFORMER
// ============================================================================

export function transformActsToPhases(acts: V7Act[]): V7Phase[] {
  if (!acts || acts.length === 0) {
    console.warn('[transformActsToPhases] No acts provided');
    return [];
  }

  console.log(`[transformActsToPhases] Transforming ${acts.length} acts to phases`);

  return acts.map((act, index) => {
    const phase = transformActToPhase(act, index);
    console.log(`[transformActsToPhases] Act ${index + 1} "${act.type}" -> Phase "${phase.type}"`);
    return phase;
  });
}

// ============================================================================
// ACT TO PHASE TRANSFORMER
// ============================================================================

function transformActToPhase(act: V7Act, index: number): V7Phase {
  // Map act type to phase type
  const phaseType = mapActTypeToPhaseType(act.type, act.subtype);

  // Extract anchor actions from act
  const anchorActions = extractAnchorActions(act);

  // Build scenes from act content
  const scenes = buildScenesFromAct(act, index);

  // Calculate end time
  const endTime = act.endTime ?? (act.startTime + act.duration);

  // Determine mood from visual config
  const mood = extractMood(act);

  // Build the phase
  const phase: V7Phase = {
    id: act.id || `phase-${index + 1}`,
    title: act.title || `Fase ${index + 1}`,
    startTime: act.startTime,
    endTime: endTime,
    type: phaseType,
    scenes: scenes,
    mood: mood,
    autoAdvance: phaseType !== 'interaction' && phaseType !== 'playground',

    // ✅ V7-v2: Anchor actions for keyword sync
    anchorActions: anchorActions.length > 0 ? anchorActions : undefined,

    // ✅ V7-v2: Audio behavior during interaction
    audioBehavior: act.audioBehavior || getDefaultAudioBehavior(phaseType),

    // ✅ V7-v2: Timeout with hints
    timeout: act.timeout || getDefaultTimeout(phaseType),
  };

  return phase;
}

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

function mapActTypeToPhaseType(actType: string, subtype?: string): V7Phase['type'] {
  // Handle subtypes first
  if (subtype === 'quiz' || actType === 'quiz') return 'interaction';
  if (subtype === 'playground') return 'playground';
  if (subtype === 'cta') return 'revelation';
  if (subtype === 'celebration') return 'gamification';

  // Map act types to phase types
  switch (actType) {
    case 'dramatic':
    case 'comparison':
      return 'dramatic';

    case 'narrative':
      return 'narrative';

    case 'interactive':
    case 'interaction':
    case 'quiz':
      return 'interaction';

    case 'playground':
      return 'playground';

    case 'result':
    case 'revelation':
    case 'cta':
      return 'revelation';

    case 'gamification':
    case 'celebration':
      return 'gamification';

    case 'loading':
      return 'loading';

    default:
      return 'narrative';
  }
}

function extractMood(act: V7Act): V7Phase['mood'] {
  const visualMood = act.visual?.mood || act.content?.visual?.mood;

  switch (visualMood) {
    case 'danger':
    case 'dramatic':
      return 'danger';
    case 'success':
    case 'energetic':
      return 'success';
    case 'warning':
      return 'warning';
    case 'neutral':
    case 'calm':
    case 'mysterious':
    default:
      return 'neutral';
  }
}

// ============================================================================
// ANCHOR ACTIONS
// ============================================================================

function extractAnchorActions(act: V7Act): AnchorAction[] {
  const actions: AnchorAction[] = [];

  // Extract from act.anchorPoints (V7-v2 format)
  if (act.anchorPoints && Array.isArray(act.anchorPoints)) {
    act.anchorPoints.forEach((ap, idx) => {
      actions.push({
        id: `${act.id}-anchor-${idx}`,
        keyword: ap.keyword,
        type: mapAnchorActionType(ap.action),
        targetId: ap.target,
        once: true,
      });
    });
  }

  // If interaction type and no pause anchor, add auto pause
  if ((act.type === 'interactive' || act.type === 'quiz' || act.type === 'playground') &&
      !actions.some(a => a.type === 'pause')) {
    // Try to find a keyword from narration to pause at
    const narration = act.narration || act.content?.audio?.narration || '';
    const keywords = extractPauseKeywordsFromNarration(narration, act.type);

    if (keywords.length > 0) {
      actions.push({
        id: `${act.id}-auto-pause`,
        keyword: keywords[0],
        type: 'pause',
        once: true,
      });
    }
  }

  return actions;
}

function mapAnchorActionType(action: string): AnchorAction['type'] {
  switch (action) {
    case 'pause':
      return 'pause';
    case 'resume':
      return 'resume';
    case 'show':
    case 'reveal':
      return 'show';
    case 'hide':
      return 'hide';
    case 'highlight':
    case 'flash':
    case 'shake':
    case 'zoom':
      return 'highlight';
    case 'trigger':
    default:
      return 'trigger';
  }
}

function extractPauseKeywordsFromNarration(narration: string, actType: string): string[] {
  // Common pause keywords based on act type
  const keywords: string[] = [];

  if (actType === 'interactive' || actType === 'quiz') {
    // Look for question-related keywords
    const questionKeywords = ['honesto', 'responda', 'pense', 'reflita', 'escolha'];
    for (const kw of questionKeywords) {
      if (narration.toLowerCase().includes(kw)) {
        keywords.push(kw);
      }
    }
  }

  if (actType === 'playground') {
    // Look for observation keywords
    const playgroundKeywords = ['observe', 'compare', 'veja', 'agora'];
    for (const kw of playgroundKeywords) {
      if (narration.toLowerCase().includes(kw)) {
        keywords.push(kw);
      }
    }
  }

  return keywords;
}

// ============================================================================
// SCENES BUILDER
// ============================================================================

function buildScenesFromAct(act: V7Act, actIndex: number): V7Scene[] {
  const scenes: V7Scene[] = [];
  const visual = act.visual || act.content?.visual || {};
  const interaction = act.interaction || act.content?.interaction || {};

  // Main scene based on act type
  const mainScene: V7Scene = {
    id: `${act.id}-scene-main`,
    startTime: act.startTime,
    duration: act.duration,
    type: mapActTypeToSceneType(act.type, act.subtype),
    content: buildSceneContent(act, visual, interaction),
    animation: visual.animation || 'fade',
  };

  scenes.push(mainScene);

  // For interactive acts, add additional scenes
  if (act.type === 'interactive' && act.subtype === 'quiz') {
    // Add quiz options scene
    if (interaction.options) {
      scenes.push({
        id: `${act.id}-scene-options`,
        startTime: act.startTime,
        duration: act.duration,
        type: 'quiz-options',
        content: {
          options: interaction.options,
          mainText: interaction.question, // ✅ FIX: Use mainText (exists in V7SceneContent), not question
          correctFeedback: interaction.feedbackMessages?.correct,
          incorrectFeedback: interaction.feedbackMessages?.incorrect,
        },
        animation: 'slide-up',
      });
    }
  }

  if (act.type === 'interactive' && act.subtype === 'playground') {
    // Add playground steps scenes
    if (interaction.steps) {
      interaction.steps.forEach((step: any, idx: number) => {
        scenes.push({
          id: `${act.id}-scene-step-${idx}`,
          startTime: act.startTime + (idx * 10), // Stagger steps
          duration: step.duration ? step.duration / 1000 : 15,
          type: idx % 2 === 0 ? 'playground-code' : 'playground-result',
          content: step,
          animation: 'slide-left',
        });
      });
    }
  }

  return scenes;
}

function mapActTypeToSceneType(actType: string, subtype?: string): V7Scene['type'] {
  if (subtype === 'quiz') return 'quiz';
  if (subtype === 'playground') return 'playground';
  if (subtype === 'cta') return 'cta';

  switch (actType) {
    case 'dramatic':
      return 'number-reveal';
    case 'comparison':
      return 'comparison';
    case 'interactive':
    case 'quiz':
      return 'quiz';
    case 'playground':
      return 'playground';
    case 'result':
    case 'revelation':
      return 'result';
    case 'cta':
      return 'cta';
    case 'gamification':
    case 'celebration':
      return 'gamification';
    default:
      return 'text-reveal';
  }
}

function buildSceneContent(act: V7Act, visual: any, interaction: any): V7Scene['content'] {
  const content: any = {};

  // Text content from visual
  if (visual.mainText?.value) {
    content.mainText = visual.mainText.value;
  } else if (visual.title?.text) {
    content.mainText = visual.title.text;
  }

  if (visual.subText?.value) {
    content.subtitle = visual.subText.value;
  }

  if (visual.highlightText?.value) {
    content.highlightWord = visual.highlightText.value;
  }

  // Numbers for dramatic acts
  if (visual.mainValue) {
    content.number = visual.mainValue;
  }

  // For comparison acts
  if (visual.leftSide && visual.rightSide) {
    content.leftCard = visual.leftSide;
    content.rightCard = visual.rightSide;
  }

  // For quiz acts
  if (interaction.question) {
    content.mainText = interaction.question;
    content.options = interaction.options;
    content.feedbackMessages = interaction.feedbackMessages;
  }

  // For playground acts
  if (interaction.challenge) {
    content.mainText = interaction.challenge.title;
    content.subtitle = interaction.challenge.subtitle;
  }
  if (interaction.steps) {
    content.steps = interaction.steps;
  }

  // For CTA acts
  if (interaction.options && act.type === 'cta') {
    content.options = interaction.options.map((opt: any) => ({
      id: opt.id,
      label: opt.label,
      emoji: opt.emoji,
      variant: opt.recommended ? 'positive' : 'negative',
    }));
  }

  // Narration (for subtitle display)
  const narration = act.narration || act.content?.audio?.narration;
  if (narration && !content.subtitle) {
    // Extract first sentence as subtitle
    const firstSentence = narration.split(/[.!?]/)[0];
    content.subtitle = firstSentence?.trim();
  }

  return content;
}

// ============================================================================
// DEFAULT CONFIGS
// ============================================================================

function getDefaultAudioBehavior(phaseType: V7Phase['type']): V7AudioBehavior | undefined {
  switch (phaseType) {
    case 'interaction':
      return {
        onStart: 'fadeToBackground',
        duringInteraction: {
          mainVolume: 0.15,
          ambientVolume: 0.4,
        },
        onComplete: 'fadeIn',
      };

    case 'playground':
      return {
        onStart: 'pause',
        duringInteraction: {
          mainVolume: 0,
          ambientVolume: 0.3,
        },
        onComplete: 'resume',
      };

    case 'revelation':
      return {
        onStart: 'fadeToBackground',
        duringInteraction: {
          mainVolume: 0.2,
          ambientVolume: 0.4,
        },
        onComplete: 'next',
      };

    default:
      return undefined;
  }
}

function getDefaultTimeout(phaseType: V7Phase['type']): V7TimeoutConfig | undefined {
  switch (phaseType) {
    case 'interaction':
      return {
        soft: 7,
        medium: 15,
        hard: 30,
        hints: [
          '⏳ Pense com calma...',
          '🤔 Qual opção mais combina com você?',
          '⚡ Escolhendo automaticamente...',
        ],
        autoAction: 'selectDefault',
      };

    case 'playground':
      return {
        soft: 10,
        medium: 25,
        hard: 45,
        hints: [
          '⏳ Continue acompanhando...',
          '🔄 Avançando em breve...',
          '⚡ Avançando automaticamente...',
        ],
        autoAction: 'continue',
      };

    case 'revelation':
      return {
        soft: 5,
        medium: 12,
        hard: 25,
        hints: [
          '⏳ Este é o momento da decisão...',
          '🤔 Qual caminho você escolhe?',
          '⚡ Escolhendo automaticamente...',
        ],
        autoAction: 'selectDefault',
      };

    default:
      return undefined;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default transformActsToPhases;
