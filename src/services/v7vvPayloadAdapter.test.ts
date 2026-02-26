import { describe, expect, it } from 'vitest';

import { V7vvPayloadAdapterError, toV7vvPayload } from './v7vvPayloadAdapter';

describe('toV7vvPayload', () => {
  it('converte narrativeScript em cena narrativa mínima', () => {
    const payload = toV7vvPayload({
      title: 'Teste',
      narrativeScript: 'Texto de narração',
      difficulty: 'ADVANCED',
      tags: ['  v7  ', '', 'pipeline'],
    });

    expect(payload.difficulty).toBe('advanced');
    expect(payload.tags).toEqual(['v7', 'pipeline']);
    expect(payload.scenes).toHaveLength(1);
    expect(payload.scenes[0]).toMatchObject({
      type: 'narrative',
      narration: 'Texto de narração',
      visual: { type: 'effects-only' },
    });
  });

  it('converte acts legados de cinematic_flow para scenes canônicas', () => {
    const payload = toV7vvPayload({
      cinematic_flow: {
        acts: [
          { id: 'a1', title: 'Ato 1', narration: 'Narração 1' },
          { id: 'a2', title: 'Ato 2', audio: { narration: 'Narração 2' } },
          { id: 'a3', title: 'Ato 3', content: { audio: { narration: 'Narração 3' } } },
        ],
      },
    });

    expect(payload.scenes).toHaveLength(3);
    expect(payload.scenes[0]).toMatchObject({ id: 'a1', title: 'Ato 1', narration: 'Narração 1' });
    expect(payload.scenes[1]).toMatchObject({ id: 'a2', title: 'Ato 2', narration: 'Narração 2' });
    expect(payload.scenes[2]).toMatchObject({ id: 'a3', title: 'Ato 3', narration: 'Narração 3' });
  });

  it('preserva o tipo original do act ao converter cinematic_flow', () => {
    const payload = toV7vvPayload({
      cinematic_flow: {
        acts: [
          { id: 'a1', type: 'interactive', narration: 'Narração interativa' },
          { id: 'a2', narration: 'Narração padrão' },
        ],
      },
    });

    expect(payload.scenes[0]).toMatchObject({ id: 'a1', type: 'interactive' });
    expect(payload.scenes[1]).toMatchObject({ id: 'a2', type: 'narrative' });
  });

  it('lê narração legada em content.audio.narration', () => {
    const payload = toV7vvPayload({
      cinematic_flow: {
        acts: [
          {
            id: 'a1',
            title: 'Ato 1',
            content: { audio: { narration: 'Narração em content.audio' } },
          },
        ],
      },
    });

    expect(payload.scenes).toHaveLength(1);
    expect(payload.scenes[0]).toMatchObject({
      id: 'a1',
      title: 'Ato 1',
      narration: 'Narração em content.audio',
    });
  });

  it('mapeia fluxo de regenerate/reprocess com preserve_structure', () => {
    const payload = toV7vvPayload({
      mode: 'regenerate',
      existingLessonId: 'lesson-123',
      scenes: [],
    });

    expect(payload.reprocess).toBe(true);
    expect(payload.existing_lesson_id).toBe('lesson-123');
    expect(payload.reprocess_preserve_structure).toBeUndefined();
    expect(payload.scenes).toEqual([]);
  });

  it('respeita reprocess_preserve_structure quando explicitamente enviado', () => {
    const payload = toV7vvPayload({
      mode: 'regenerate',
      existingLessonId: 'lesson-123',
      reprocess_preserve_structure: true,
    });

    expect(payload.reprocess_preserve_structure).toBe(true);
  });

  it('lança erro quando reprocess não traz existing lesson id', () => {
    expect(() => toV7vvPayload({ reprocess: true })).toThrow(V7vvPayloadAdapterError);
    expect(() => toV7vvPayload({ reprocess: true })).toThrow(
      'reprocess/regenerate exige existingLessonId|existing_lesson_id',
    );
  });

  it('lança erro quando acts existem mas sem narração válida', () => {
    expect(() =>
      toV7vvPayload({
        cinematicFlow: { acts: [{ id: 'x1', title: 'sem texto' }] },
      }),
    ).toThrow('nenhum act possui narração válida');
  });

  it('lança erro quando payload não possui qualquer fonte de cena', () => {
    expect(() => toV7vvPayload({})).toThrow('payload sem scenes, sem acts válidos e sem narrativeScript');
  });
});
