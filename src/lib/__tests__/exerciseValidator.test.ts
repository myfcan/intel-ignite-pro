/**
 * Testes para exerciseValidator.ts
 * Garante que validação de exercícios funciona corretamente
 */

import { validateExercise, validateAllExercises } from '../exerciseValidator';

describe('exerciseValidator', () => {
  describe('validateExercise - validações comuns', () => {
    it('deve rejeitar exercício sem id', () => {
      const exercise = {
        type: 'multiple-choice',
        title: 'Test',
        instruction: 'Test',
        data: { question: 'Test?', options: ['A', 'B'], correctAnswer: 'A' }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Campo "id" é obrigatório');
    });

    it('deve rejeitar exercício sem type', () => {
      const exercise = {
        id: 'test-1',
        title: 'Test',
        data: {}
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Campo "type" é obrigatório');
    });

    it('deve rejeitar exercício sem data', () => {
      const exercise = {
        id: 'test-1',
        type: 'multiple-choice',
        title: 'Test'
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Campo "data" é obrigatório');
    });
  });

  describe('validateExercise - complete-sentence', () => {
    it('deve aceitar 7 underscores', () => {
      const exercise = {
        id: 'test',
        type: 'complete-sentence',
        title: 'Test',
        instruction: 'Complete',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase com _______.',
            correctAnswers: ['resposta']
          }]
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve aceitar 11 underscores (retrocompatibilidade)', () => {
      const exercise = {
        id: 'test',
        type: 'complete-sentence',
        title: 'Test',
        instruction: 'Complete',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase com ___________.',
            correctAnswers: ['resposta']
          }]
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar texto sem underscores', () => {
      const exercise = {
        id: 'test',
        type: 'complete-sentence',
        title: 'Test',
        instruction: 'Complete',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase sem placeholder.',
            correctAnswers: ['resposta']
          }]
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('precisa ter "_______"'))).toBe(true);
    });

    it('deve rejeitar texto com poucos underscores', () => {
      const exercise = {
        id: 'test',
        type: 'complete-sentence',
        title: 'Test',
        instruction: 'Complete',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase com ____ apenas.',
            correctAnswers: ['resposta']
          }]
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
    });

    it('deve rejeitar sentença sem correctAnswers', () => {
      const exercise = {
        id: 'test',
        type: 'complete-sentence',
        title: 'Test',
        instruction: 'Complete',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase com _______.',
            correctAnswers: []
          }]
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('correctAnswers'))).toBe(true);
    });
  });

  describe('validateExercise - fill-in-blanks', () => {
    it('deve aceitar 7 underscores', () => {
      const exercise = {
        id: 'test',
        type: 'fill-in-blanks',
        title: 'Test',
        instruction: 'Preencha',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase com _______.',
            correctAnswers: ['resposta'],
            hint: 'Dica aqui'
          }],
          feedback: {
            allCorrect: 'Perfeito!',
            someCorrect: 'Bom!',
            needsReview: 'Revise'
          }
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(true);
    });

    it('deve aceitar 11 underscores (retrocompatibilidade)', () => {
      const exercise = {
        id: 'test',
        type: 'fill-in-blanks',
        title: 'Test',
        instruction: 'Preencha',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase com ___________.',
            correctAnswers: ['resposta'],
            hint: 'Dica aqui'
          }],
          feedback: {
            allCorrect: 'Perfeito!',
            someCorrect: 'Bom!',
            needsReview: 'Revise'
          }
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateExercise - multiple-choice', () => {
    it('deve aceitar exercício válido', () => {
      const exercise = {
        id: 'test',
        type: 'multiple-choice',
        title: 'Test',
        instruction: 'Escolha',
        data: {
          question: 'Qual a resposta?',
          options: ['A', 'B', 'C'],
          correctAnswer: 'B',
          explanation: 'Explicação'
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar se correctAnswer não está em options', () => {
      const exercise = {
        id: 'test',
        type: 'multiple-choice',
        title: 'Test',
        instruction: 'Escolha',
        data: {
          question: 'Qual a resposta?',
          options: ['A', 'B', 'C'],
          correctAnswer: 'D',
          explanation: 'Explicação'
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('não está nas opções'))).toBe(true);
    });

    it('deve rejeitar com menos de 2 opções', () => {
      const exercise = {
        id: 'test',
        type: 'multiple-choice',
        title: 'Test',
        instruction: 'Escolha',
        data: {
          question: 'Qual a resposta?',
          options: ['A'],
          correctAnswer: 'A',
          explanation: 'Explicação'
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('pelo menos 2 opções'))).toBe(true);
    });
  });

  describe('validateExercise - true-false', () => {
    it('deve aceitar exercício válido', () => {
      const exercise = {
        id: 'test',
        type: 'true-false',
        title: 'Test',
        instruction: 'Verdadeiro ou Falso',
        data: {
          statements: [{
            id: 'stmt-1',
            text: 'Afirmação aqui',
            correct: true,
            explanation: 'Explicação'
          }],
          feedback: {
            perfect: 'Perfeito!',
            good: 'Bom!',
            needsReview: 'Revise'
          }
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar se correct não é boolean', () => {
      const exercise = {
        id: 'test',
        type: 'true-false',
        title: 'Test',
        instruction: 'Verdadeiro ou Falso',
        data: {
          statements: [{
            id: 'stmt-1',
            text: 'Afirmação',
            correct: 'true' as any, // String ao invés de boolean
            explanation: 'Explicação'
          }],
          feedback: {
            perfect: 'Perfeito!',
            good: 'Bom!',
            needsReview: 'Revise'
          }
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('correct'))).toBe(true);
    });
  });

  describe('validateAllExercises', () => {
    it('deve validar array de exercícios', () => {
      const exercises = [
        {
          id: 'test-1',
          type: 'multiple-choice',
          title: 'Test 1',
          instruction: 'Test',
          data: {
            question: 'Pergunta?',
            options: ['A', 'B'],
            correctAnswer: 'A',
            explanation: 'Explicação'
          }
        },
        {
          id: 'test-2',
          type: 'complete-sentence',
          title: 'Test 2',
          instruction: 'Complete',
          data: {
            sentences: [{
              id: 'sent-1',
              text: 'Texto _______',
              correctAnswers: ['resposta']
            }]
          }
        }
      ];

      const results = validateAllExercises(exercises);
      expect(results).toHaveLength(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
    });

    it('deve retornar array vazio para entrada vazia', () => {
      expect(validateAllExercises([])).toEqual([]);
      expect(validateAllExercises(null as any)).toEqual([]);
      expect(validateAllExercises(undefined as any)).toEqual([]);
    });
  });
});
