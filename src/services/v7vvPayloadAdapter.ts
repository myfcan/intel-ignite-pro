export type V7vvDifficulty = 'beginner' | 'intermediate' | 'advanced';

export class V7vvPayloadAdapterError extends Error {
  constructor(message: string) {
    super(`[v7vvPayloadAdapter] ${message}`);
    this.name = 'V7vvPayloadAdapterError';
  }
}

interface LegacyAct {
  id?: string;
  title?: string;
  type?: string;
  narration?: string;
  audio?: { narration?: string };
  content?: { text?: string; description?: string };
  visualContent?: Record<string, unknown>;
}

interface LegacyInputLike {
  title?: string;
  subtitle?: string;
  difficulty?: string;
  category?: string;
  tags?: string[];
  learningObjectives?: string[];
  voice_id?: string;
  generate_audio?: boolean;
  fail_on_audio_error?: boolean;
  narrativeScript?: string;
  scenes?: any[];
  cinematic_flow?: { acts?: LegacyAct[] };
  cinematicFlow?: { acts?: LegacyAct[] };
  existingLessonId?: string;
  existing_lesson_id?: string;
  mode?: string;
  reprocess?: boolean;
}

interface CanonicalScene {
  id: string;
  title: string;
  type: string;
  narration: string;
  visual: {
    type: string;
    content: Record<string, unknown>;
    effects: {
      mood: string;
      glow: boolean;
      vignette: boolean;
      particles: string;
    };
  };
}

interface V7vvPayload {
  title: string;
  subtitle: string;
  difficulty: V7vvDifficulty;
  category: string;
  tags: string[];
  learningObjectives: string[];
  voice_id?: string;
  generate_audio: boolean;
  fail_on_audio_error: boolean;
  reprocess?: boolean;
  existing_lesson_id?: string;
  reprocess_preserve_structure?: boolean;
  scenes: any[];
}

function mapDifficulty(value?: string): V7vvDifficulty {
  const d = (value || '').toLowerCase();
  if (d === 'intermediate' || d === 'advanced') return d;
  return 'beginner';
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function assertValidInput(input: LegacyInputLike | null | undefined): asserts input is LegacyInputLike {
  if (!input || typeof input !== 'object') {
    throw new V7vvPayloadAdapterError('input inválido: objeto obrigatório.');
  }
}

function getLegacyActs(input: LegacyInputLike): LegacyAct[] {
  const acts = input.cinematic_flow?.acts || input.cinematicFlow?.acts || [];
  return Array.isArray(acts) ? acts : [];
}

function buildScenesFromActs(acts: LegacyAct[] = []): CanonicalScene[] {
  return acts
    .map((act, index) => {
      const narration =
        act.audio?.narration ||
        act.narration ||
        act.content?.text ||
        act.content?.description ||
        '';

      if (!narration.trim()) return null;

      return {
        id: act.id || `scene-${index + 1}`,
        title: act.title || `Cena ${index + 1}`,
        type: 'narrative',
        narration,
        visual: {
          type: 'effects-only',
          content: act.visualContent || {},
          effects: { mood: 'calm', glow: true, vignette: true, particles: 'soft' },
        },
      };
    })
    .filter(Boolean) as CanonicalScene[];
}

function buildNarrativeFallbackScene(narrativeScript: string): CanonicalScene {
  return {
    id: 'scene-1',
    title: 'Introdução',
    type: 'narrative',
    narration: narrativeScript,
    visual: {
      type: 'effects-only',
      content: {},
      effects: { mood: 'calm', glow: true, vignette: true, particles: 'soft' },
    },
  };
}

export function toV7vvPayload(input: LegacyInputLike): V7vvPayload {
  assertValidInput(input);

  const existingLessonId = input.existing_lesson_id || input.existingLessonId;
  const reprocessMode = input.reprocess || input.mode === 'regenerate' || !!existingLessonId;

  const base = {
    title: input.title || 'Aula V7',
    subtitle: input.subtitle || '',
    difficulty: mapDifficulty(input.difficulty),
    category: input.category || 'geral',
    tags: sanitizeStringArray(input.tags),
    learningObjectives: sanitizeStringArray(input.learningObjectives),
    voice_id: input.voice_id,
    generate_audio: input.generate_audio ?? true,
    fail_on_audio_error: input.fail_on_audio_error ?? false,
  };

  // Reprocess compatibility path
  if (reprocessMode) {
    if (!existingLessonId) {
      throw new V7vvPayloadAdapterError(
        'reprocess/regenerate exige existingLessonId|existing_lesson_id.',
      );
    }

    const scenes = Array.isArray(input.scenes) ? input.scenes : [];

    return {
      ...base,
      reprocess: true,
      existing_lesson_id: existingLessonId,
      // preserve current content when scenes aren't provided by legacy callers
      reprocess_preserve_structure: scenes.length === 0,
      scenes,
    };
  }

  // Canonical path if scenes already available
  if (Array.isArray(input.scenes) && input.scenes.length > 0) {
    return { ...base, scenes: input.scenes };
  }

  // Legacy acts -> scenes
  const acts = getLegacyActs(input);
  const scenesFromActs = buildScenesFromActs(acts);
  if (scenesFromActs.length > 0) {
    return { ...base, scenes: scenesFromActs };
  }

  if (acts.length > 0) {
    throw new V7vvPayloadAdapterError(
      'cinematic_flow/cinematicFlow.acts recebido, mas nenhum act possui narração válida.',
    );
  }

  // Last fallback: single narrative scene from narrativeScript
  const narration = input.narrativeScript?.trim();
  if (!narration) {
    throw new V7vvPayloadAdapterError(
      'payload sem scenes, sem acts válidos e sem narrativeScript. Nada para processar.',
    );
  }

  return {
    ...base,
    scenes: [buildNarrativeFallbackScene(narration)],
  };
}
