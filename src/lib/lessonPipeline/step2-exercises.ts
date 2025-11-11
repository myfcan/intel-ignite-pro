import { Step1Output, Step2Output, ExerciseInput } from './types';
import { ExerciseConfigTyped } from '@/types/exerciseSchemas';

/**
 * STEP 2: GERAÇÃO DE EXERCÍCIOS ESTRUTURADOS
 * - Para cada exercício solicitado, gera estrutura completa
 * - Valida contra schema do tipo
 * - Garante IDs únicos
 */
export async function step2GenerateExercises(input: Step1Output): Promise<Step2Output> {
  console.log('🎯 [STEP 2] Gerando exercícios estruturados...');

  const exercisesConfig: ExerciseConfigTyped[] = [];

  for (let i = 0; i < input.exercises.length; i++) {
    const exercise = input.exercises[i];
    const exerciseId = `exercise-${i + 1}`;

    console.log(`   Processando exercício ${i + 1}/${input.exercises.length}: ${exercise.type}`);

    // Criar estrutura base do exercício
    const baseExercise = {
      id: exerciseId,
      type: exercise.type,
      title: exercise.question || exercise.instruction || `Exercício ${i + 1}`,
      instruction: exercise.instruction || exercise.question || '',
      data: exercise.data,
      passingScore: 70,
      maxAttempts: 3,
    };

    // Validar estrutura básica
    if (!baseExercise.data) {
      throw new Error(`Exercício ${i + 1} (${exercise.type}) não tem 'data'`);
    }

    // Validações específicas por tipo
    switch (exercise.type) {
      case 'multiple-choice':
        if (!baseExercise.data.options || baseExercise.data.options.length < 2) {
          throw new Error(`Exercício ${i + 1}: multiple-choice precisa de pelo menos 2 opções`);
        }
        if (baseExercise.data.correctAnswer === undefined) {
          throw new Error(`Exercício ${i + 1}: multiple-choice precisa de correctAnswer`);
        }
        break;

      case 'true-false':
        if (typeof baseExercise.data.correctAnswer !== 'boolean') {
          throw new Error(`Exercício ${i + 1}: true-false precisa de correctAnswer (boolean)`);
        }
        break;

      case 'fill-blanks':
      case 'complete-sentence':
        if (!baseExercise.data.blanks || baseExercise.data.blanks.length === 0) {
          throw new Error(`Exercício ${i + 1}: ${exercise.type} precisa de array 'blanks'`);
        }
        break;

      case 'drag-drop':
        if (!baseExercise.data.items || !baseExercise.data.categories) {
          throw new Error(`Exercício ${i + 1}: drag-drop precisa de 'items' e 'categories'`);
        }
        break;

      case 'scenario-selection':
        if (!baseExercise.data.scenarios || baseExercise.data.scenarios.length === 0) {
          throw new Error(`Exercício ${i + 1}: scenario-selection precisa de 'scenarios'`);
        }
        break;

      case 'platform-match':
        if (!baseExercise.data.platforms || !baseExercise.data.features) {
          throw new Error(`Exercício ${i + 1}: platform-match precisa de 'platforms' e 'features'`);
        }
        break;

      case 'data-collection':
        if (!baseExercise.data.examples || baseExercise.data.examples.length === 0) {
          throw new Error(`Exercício ${i + 1}: data-collection precisa de 'examples'`);
        }
        break;

      default:
        throw new Error(`Tipo de exercício não suportado: ${exercise.type}`);
    }

    exercisesConfig.push(baseExercise as any);
    console.log(`   ✅ Exercício ${i + 1} validado: ${exercise.type}`);
  }

  console.log(`✅ [STEP 2] ${exercisesConfig.length} exercícios gerados e validados`);

  return {
    ...input,
    exercisesConfig,
  };
}
