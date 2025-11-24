/**
 * ============================================================
 * EXERCISE TRANSFORMERS
 * ============================================================
 *
 * Módulo responsável por transformar exercícios de formato simplificado
 * para formato completo com wrapper 'data'.
 *
 * Suporta:
 * - Detecção automática de formato (simplificado vs completo)
 * - Preservação de exercícios já completos
 * - Conversão múltipla de formatos simplificados
 * - Geração automática de IDs, títulos e instruções
 *
 * @see ACOES-CORRETIVAS.md - Ação #10
 */

// ============================================================
// TIPOS
// ============================================================

/**
 * Exercício no formato simplificado (sem wrapper 'data')
 */
export interface SimplifiedExercise {
  id?: string;
  type: string;
  title?: string;
  instruction?: string;

  // Multiple-choice simplificado
  question?: string;
  options?: string[];
  correctAnswer?: string | number;
  correctOptionIndex?: number;

  // True-false simplificado
  statement?: string;
  answer?: boolean;

  // Complete-sentence / Fill-in-blanks simplificado
  sentence?: string;
  text?: string;
  blanks?: string[];
  correctAnswers?: string[];
  hint?: string;

  // Campos comuns
  feedback?: string;
  explanation?: string;

  // Exercício já completo (tem wrapper 'data')
  data?: any;
}

/**
 * Exercício no formato completo (com wrapper 'data')
 */
export interface CompleteExercise {
  id: string;
  type: string;
  title: string;
  instruction: string;
  data: any;
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Gera título padrão baseado no tipo de exercício
 */
function getExerciseTitle(type: string): string {
  const titles: Record<string, string> = {
    'multiple-choice': 'Escolha Múltipla',
    'true-false': 'Verdadeiro ou Falso',
    'complete-sentence': 'Complete a Sentença',
    'fill-in-blanks': 'Preencher os Espaços'
  };
  return titles[type] || 'Exercício';
}

/**
 * Gera instrução padrão baseada no tipo de exercício
 */
function getExerciseInstruction(type: string): string {
  const instructions: Record<string, string> = {
    'multiple-choice': 'Escolha a alternativa correta:',
    'true-false': 'Marque Verdadeiro ou Falso:',
    'complete-sentence': 'Complete a sentença com a palavra correta:',
    'fill-in-blanks': 'Preencher os espaços em branco:'
  };
  return instructions[type] || 'Responda o exercício:';
}

/**
 * Verifica se exercício já está no formato completo com wrapper 'data'
 */
function hasCompleteFormat(exercise: SimplifiedExercise): boolean {
  if (!exercise.data || typeof exercise.data !== 'object') {
    return false;
  }

  // Verificar se tem os campos necessários dentro de data
  const hasRequiredFields =
    (exercise.type === 'multiple-choice' && exercise.data.options && exercise.data.correctAnswer) ||
    (exercise.type === 'true-false' && (exercise.data.statements || exercise.data.answer !== undefined)) ||
    (exercise.type === 'complete-sentence' && exercise.data.sentences) ||
    (exercise.type === 'fill-in-blanks' && exercise.data.sentences);

  return hasRequiredFields;
}

// ============================================================
// TRANSFORMADORES POR TIPO
// ============================================================

/**
 * Transforma multiple-choice simplificado para completo
 */
function transformMultipleChoice(exercise: SimplifiedExercise, baseExercise: Partial<CompleteExercise>): CompleteExercise {
  // ✅ CRÍTICO: Converter correctAnswer de índice (número) para texto da opção
  let correctAnswerText: string;

  if (exercise.correctOptionIndex !== undefined) {
    // Prioridade 1: correctOptionIndex explícito
    correctAnswerText = exercise.options![exercise.correctOptionIndex];
  } else if (typeof exercise.correctAnswer === 'number') {
    // Prioridade 2: correctAnswer como índice numérico
    correctAnswerText = exercise.options![exercise.correctAnswer];
  } else {
    // Prioridade 3: correctAnswer como texto direto
    correctAnswerText = exercise.correctAnswer as string;
  }

  return {
    ...baseExercise,
    type: 'multiple-choice',
    data: {
      question: exercise.question,
      options: exercise.options,
      correctAnswer: correctAnswerText,
      explanation: exercise.feedback || exercise.explanation || 'Correto!'
    }
  } as CompleteExercise;
}

/**
 * Transforma true-false simplificado para completo
 */
function transformTrueFalse(exercise: SimplifiedExercise, baseExercise: Partial<CompleteExercise>, index: number): CompleteExercise {
  return {
    ...baseExercise,
    type: 'true-false',
    data: {
      statements: [{
        id: `stmt-${index}`,
        text: exercise.statement || exercise.question,
        correct: exercise.answer ?? exercise.correctAnswer,
        explanation: exercise.feedback || exercise.explanation || 'Correto!'
      }],
      feedback: {
        perfect: 'Perfeito! Você acertou!',
        good: 'Bom trabalho!',
        needsReview: 'Revise o conteúdo da lição.'
      }
    }
  } as CompleteExercise;
}

/**
 * Transforma complete-sentence/fill-in-blanks simplificado para completo
 */
function transformSentenceExercise(exercise: SimplifiedExercise, baseExercise: Partial<CompleteExercise>, index: number): CompleteExercise {
  // ✅ CRÍTICO: Suportar múltiplos formatos de entrada
  let sentenceText = '';
  let correctAnswersArray: string[] = [];

  // Formato 1: question já com "______" + blanks/correctAnswers separados
  if (exercise.question && exercise.question.includes('_')) {
    sentenceText = exercise.question;
    correctAnswersArray = exercise.correctAnswers || exercise.blanks || [];
  }
  // Formato 2: sentence que precisa de substituição
  else if (exercise.sentence) {
    const correctAnswerValue = exercise.correctAnswer || exercise.answer || '';
    sentenceText = exercise.sentence.replace(String(correctAnswerValue), '_______');
    correctAnswersArray = Array.isArray(correctAnswerValue) ? correctAnswerValue : [String(correctAnswerValue)];
  }
  // Formato 3: text genérico
  else {
    sentenceText = exercise.text || exercise.question || '';
    correctAnswersArray = exercise.correctAnswers || exercise.blanks || [];
  }

  return {
    ...baseExercise,
    type: 'fill-in-blanks',
    data: {
      sentences: [{
        id: `sentence-${index}`,
        text: sentenceText,
        correctAnswers: correctAnswersArray,
        hint: exercise.hint || 'Pense no que você aprendeu',
        explanation: exercise.feedback || exercise.explanation || 'Excelente!'
      }],
      feedback: {
        allCorrect: 'Excelente!',
        someCorrect: 'Bom, mas revise algumas respostas.',
        needsReview: 'Revise o conteúdo da lição.'
      }
    }
  } as CompleteExercise;
}

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

/**
 * Transforma exercício de formato simplificado para completo
 *
 * Comportamento:
 * 1. Se já tem wrapper 'data' com campos válidos → Preserva como está
 * 2. Se formato simplificado → Aplica transformação específica por tipo
 *
 * @param exercise Exercício em qualquer formato
 * @param index Índice do exercício (usado para IDs únicos)
 * @returns Exercício no formato completo
 *
 * @example
 * // Formato simplificado
 * const simple = {
 *   type: 'multiple-choice',
 *   question: 'O que é IA?',
 *   options: ['A', 'B', 'C'],
 *   correctAnswer: 0
 * };
 *
 * const complete = transformSimplifiedExercise(simple, 0);
 * // { id: '...', type: 'multiple-choice', data: { question, options, correctAnswer: 'A' } }
 */
export function transformSimplifiedExercise(exercise: SimplifiedExercise, index: number): CompleteExercise {
  // 🔥 FIX: Se o exercício JÁ TEM wrapper "data" com campos, NÃO transformar!
  // Isso evita destruir exercícios que já estão no formato completo
  if (hasCompleteFormat(exercise)) {
    return {
      id: exercise.id || `exercise-${Date.now()}-${index}`,
      title: exercise.title || getExerciseTitle(exercise.type),
      instruction: exercise.instruction || getExerciseInstruction(exercise.type),
      type: exercise.type,
      data: exercise.data
    };
  }

  // Formato simplificado: aplicar transformação normal
  const timestamp = Date.now();
  const baseExercise = {
    id: `exercise-${timestamp}-${index}`,
    title: getExerciseTitle(exercise.type),
    instruction: getExerciseInstruction(exercise.type)
  };

  switch (exercise.type) {
    case 'multiple-choice':
      return transformMultipleChoice(exercise, baseExercise);

    case 'true-false':
      return transformTrueFalse(exercise, baseExercise, index);

    case 'complete-sentence':
    case 'fill-in-blanks':
      return transformSentenceExercise(exercise, baseExercise, index);

    default:
      // Tipo desconhecido: retornar como está
      return exercise as CompleteExercise;
  }
}

/**
 * Transforma array de exercícios
 */
export function transformExercises(exercises: SimplifiedExercise[]): CompleteExercise[] {
  if (!exercises || !Array.isArray(exercises)) {
    return [];
  }
  return exercises.map((ex, idx) => transformSimplifiedExercise(ex, idx));
}
