/**
 * Testes para exerciseConstants.ts
 * Garante que funções auxiliares de placeholders funcionam corretamente
 */

import {
  EXERCISE_PLACEHOLDER,
  EXERCISE_PLACEHOLDER_REGEX,
  hasValidPlaceholder,
  splitByPlaceholder,
  countPlaceholders,
  normalizePlaceholder
} from '../exerciseConstants';

describe('exerciseConstants', () => {
  describe('EXERCISE_PLACEHOLDER', () => {
    it('deve ser string com 7 underscores', () => {
      expect(EXERCISE_PLACEHOLDER).toBe('_______');
      expect(EXERCISE_PLACEHOLDER.length).toBe(7);
    });
  });

  describe('EXERCISE_PLACEHOLDER_REGEX', () => {
    it('deve aceitar 7 underscores', () => {
      expect(EXERCISE_PLACEHOLDER_REGEX.test('_______')).toBe(true);
    });

    it('deve aceitar 11 underscores (retrocompatibilidade)', () => {
      expect(EXERCISE_PLACEHOLDER_REGEX.test('___________')).toBe(true);
    });

    it('deve aceitar 8, 9, 10 underscores (range 7-11)', () => {
      expect(EXERCISE_PLACEHOLDER_REGEX.test('________')).toBe(true);
      expect(EXERCISE_PLACEHOLDER_REGEX.test('_________')).toBe(true);
      expect(EXERCISE_PLACEHOLDER_REGEX.test('__________')).toBe(true);
    });

    it('deve rejeitar menos de 7 underscores', () => {
      expect(EXERCISE_PLACEHOLDER_REGEX.test('______')).toBe(false);
      expect(EXERCISE_PLACEHOLDER_REGEX.test('_____')).toBe(false);
      expect(EXERCISE_PLACEHOLDER_REGEX.test('____')).toBe(false);
    });

    it('deve rejeitar mais de 11 underscores', () => {
      expect(EXERCISE_PLACEHOLDER_REGEX.test('____________')).toBe(false);
      expect(EXERCISE_PLACEHOLDER_REGEX.test('_____________')).toBe(false);
    });
  });

  describe('hasValidPlaceholder', () => {
    it('deve retornar true para texto com 7 underscores', () => {
      expect(hasValidPlaceholder('A IA aprende com _______.')).toBe(true);
      expect(hasValidPlaceholder('Texto antes _______ texto depois')).toBe(true);
    });

    it('deve retornar true para texto com 11 underscores (retrocompatibilidade)', () => {
      expect(hasValidPlaceholder('A IA aprende com ___________.')).toBe(true);
      expect(hasValidPlaceholder('Texto ___________')).toBe(true);
    });

    it('deve retornar false para texto sem placeholder', () => {
      expect(hasValidPlaceholder('Texto sem placeholder')).toBe(false);
      expect(hasValidPlaceholder('Texto com poucos ____')).toBe(false);
    });

    it('deve retornar false para valores inválidos', () => {
      expect(hasValidPlaceholder('')).toBe(false);
      expect(hasValidPlaceholder(null as any)).toBe(false);
      expect(hasValidPlaceholder(undefined as any)).toBe(false);
      expect(hasValidPlaceholder(123 as any)).toBe(false);
    });
  });

  describe('splitByPlaceholder', () => {
    it('deve splittar com 7 underscores', () => {
      const parts = splitByPlaceholder('Antes _______ depois');
      expect(parts).toEqual(['Antes ', ' depois']);
    });

    it('deve splittar com 11 underscores (retrocompatibilidade)', () => {
      const parts = splitByPlaceholder('Antes ___________ depois');
      expect(parts).toEqual(['Antes ', ' depois']);
    });

    it('deve splittar com múltiplos placeholders', () => {
      const parts = splitByPlaceholder('Um _______ e outro _______');
      expect(parts).toEqual(['Um ', ' e outro ', '']);
    });

    it('deve retornar array com texto original se não tiver placeholder', () => {
      const parts = splitByPlaceholder('Texto sem placeholder');
      expect(parts).toEqual(['Texto sem placeholder']);
    });

    it('deve lidar com valores inválidos', () => {
      expect(splitByPlaceholder('')).toEqual(['']);
      expect(splitByPlaceholder(null as any)).toEqual(['']);
      expect(splitByPlaceholder(undefined as any)).toEqual(['']);
    });
  });

  describe('countPlaceholders', () => {
    it('deve contar 0 em texto sem placeholder', () => {
      expect(countPlaceholders('Texto sem placeholder')).toBe(0);
    });

    it('deve contar 1 placeholder de 7 underscores', () => {
      expect(countPlaceholders('Texto com _______ placeholder')).toBe(1);
    });

    it('deve contar 1 placeholder de 11 underscores', () => {
      expect(countPlaceholders('Texto com ___________ placeholder')).toBe(1);
    });

    it('deve contar múltiplos placeholders', () => {
      expect(countPlaceholders('Um _______ e outro _______ aqui')).toBe(2);
      expect(countPlaceholders('_______ teste _______ teste _______')).toBe(3);
    });

    it('deve contar mistura de 7 e 11 underscores', () => {
      expect(countPlaceholders('Sete _______ e onze ___________')).toBe(2);
    });

    it('deve retornar 0 para valores inválidos', () => {
      expect(countPlaceholders('')).toBe(0);
      expect(countPlaceholders(null as any)).toBe(0);
      expect(countPlaceholders(undefined as any)).toBe(0);
    });
  });

  describe('normalizePlaceholder', () => {
    it('deve converter 11 underscores para 7', () => {
      expect(normalizePlaceholder('Texto com ___________'))
        .toBe('Texto com _______');
    });

    it('deve manter 7 underscores como está', () => {
      expect(normalizePlaceholder('Texto com _______'))
        .toBe('Texto com _______');
    });

    it('deve normalizar múltiplos placeholders', () => {
      expect(normalizePlaceholder('Um ___________ e outro ___________'))
        .toBe('Um _______ e outro _______');
    });

    it('deve normalizar mistura de 7 e 11', () => {
      expect(normalizePlaceholder('Sete _______ e onze ___________'))
        .toBe('Sete _______ e onze _______');
    });

    it('deve manter texto sem placeholder', () => {
      const text = 'Texto sem placeholder';
      expect(normalizePlaceholder(text)).toBe(text);
    });

    it('deve retornar valor original para inválidos', () => {
      expect(normalizePlaceholder(null as any)).toBe(null);
      expect(normalizePlaceholder(undefined as any)).toBe(undefined);
      expect(normalizePlaceholder('')).toBe('');
    });
  });

  // ========================================
  // TESTES DE INTEGRAÇÃO
  // ========================================

  describe('Integração: fluxo completo', () => {
    it('deve validar, splittar e contar placeholder corretamente', () => {
      const text = 'A IA aprende com _______.';

      // Validar
      expect(hasValidPlaceholder(text)).toBe(true);

      // Contar
      expect(countPlaceholders(text)).toBe(1);

      // Splittar
      const parts = splitByPlaceholder(text);
      expect(parts).toEqual(['A IA aprende com ', '.']);
    });

    it('deve normalizar e depois splittar corretamente', () => {
      const text = 'Texto com ___________';

      // Normalizar
      const normalized = normalizePlaceholder(text);
      expect(normalized).toBe('Texto com _______');

      // Splittar normalizado
      const parts = splitByPlaceholder(normalized);
      expect(parts).toEqual(['Texto com ', '']);
    });

    it('deve processar múltiplos placeholders', () => {
      const text = 'Um _______ aqui e outro ___________ ali';

      expect(countPlaceholders(text)).toBe(2);
      expect(hasValidPlaceholder(text)).toBe(true);

      const normalized = normalizePlaceholder(text);
      expect(normalized).toBe('Um _______ aqui e outro _______ ali');

      const parts = splitByPlaceholder(normalized);
      expect(parts.length).toBe(3); // ['Um ', ' aqui e outro ', ' ali']
    });
  });
});
