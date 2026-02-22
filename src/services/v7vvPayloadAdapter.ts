export type V7vvDifficulty = 'beginner' | 'intermediate' | 'advanced';

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

function mapDifficulty(value?: string): V7vvDifficulty {
  const d = (value || '').toLowerCase();
  if (d === 'intermediate' || d === 'advanced') return d;
  return 'beginner';
}

function buildScenesFromActs(acts: LegacyAct[] = []) {
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
    .filter(Boolean);
}

export function toV7vvPayload(input: LegacyInputLike) {
  const base = {
    title: input.title || 'Aula V7',
    subtitle: input.subtitle || '',
    difficulty: mapDifficulty(input.difficulty),
    category: input.category || 'geral',
    tags: Array.isArray(input.tags) ? input.tags : [],
    learningObjectives: Array.isArray(input.learningObjectives) ? input.learningObjectives : [],
    voice_id: input.voice_id,
    generate_audio: input.generate_audio ?? true,
    fail_on_audio_error: input.fail_on_audio_error ?? false,
  };

  // Reprocess compatibility path
  if (input.reprocess || input.mode === 'regenerate' || input.existingLessonId || input.existing_lesson_id) {
    return {
      ...base,
      reprocess: true,
      existing_lesson_id: input.existing_lesson_id || input.existingLessonId,
      // preserve current content when scenes aren't provided by legacy callers
      reprocess_preserve_structure: !Array.isArray(input.scenes) || input.scenes.length === 0,
      scenes: Array.isArray(input.scenes) ? input.scenes : [],
    };
  }

  // Canonical path if scenes already available
  if (Array.isArray(input.scenes) && input.scenes.length > 0) {
    return { ...base, scenes: input.scenes };
  }

  // Legacy acts -> scenes
  const acts = input.cinematic_flow?.acts || input.cinematicFlow?.acts || [];
  const scenesFromActs = buildScenesFromActs(acts);
  if (scenesFromActs.length > 0) {
    return { ...base, scenes: scenesFromActs };
  }

  // Last fallback: single narrative scene from narrativeScript
  const narration = input.narrativeScript?.trim() || 'Conteúdo em preparação.';
  return {
    ...base,
    scenes: [
      {
        id: 'scene-1',
        title: 'Introdução',
        type: 'narrative',
        narration,
        visual: {
          type: 'effects-only',
          content: {},
          effects: { mood: 'calm', glow: true, vignette: true, particles: 'soft' },
        },
      },
    ],
  };
}
