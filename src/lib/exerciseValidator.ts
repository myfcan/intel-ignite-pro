/**
 * 🔍 VALIDADOR RUNTIME DE EXERCÍCIOS
 * 
 * Valida a estrutura de cada tipo de exercício em runtime.
 * Integrado no processo de sincronização para bloquear dados incorretos.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  exerciseId: string;
  exerciseType: string;
}

/**
 * Valida um exercício individual
 */
export function validateExercise(exercise: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    exerciseId: exercise.id || 'unknown',
    exerciseType: exercise.type || 'unknown'
  };

  // Validações comuns a todos os exercícios
  if (!exercise.id) {
    result.errors.push('Campo "id" é obrigatório');
  }
  if (!exercise.type) {
    result.errors.push('Campo "type" é obrigatório');
  }
  if (!exercise.title) {
    result.errors.push('Campo "title" é obrigatório');
  }
  if (!exercise.instruction) {
    result.warnings.push('Campo "instruction" não está definido');
  }
  if (!exercise.data) {
    result.errors.push('Campo "data" é obrigatório');
    result.isValid = false;
    return result;
  }

  // Validações específicas por tipo
  switch (exercise.type) {
    case 'multiple-choice':
      validateMultipleChoice(exercise.data, result);
      break;
    case 'drag-drop':
      validateDragDrop(exercise.data, result);
      break;
    case 'fill-in-blanks':
      validateFillInBlanks(exercise.data, result);
      break;
    case 'scenario-selection':
      validateScenarioSelection(exercise.data, result);
      break;
    case 'true-false':
      validateTrueFalse(exercise.data, result);
      break;
    case 'platform-match':
      validatePlatformMatch(exercise.data, result);
      break;
    case 'data-collection':
      validateDataCollection(exercise.data, result);
      break;
    case 'complete-sentence':
      validateCompleteSentence(exercise.data, result);
      break;
    default:
      result.warnings.push(`Tipo de exercício desconhecido: "${exercise.type}"`);
  }

  result.isValid = result.errors.length === 0;
  return result;
}

// ============================================================
// VALIDADORES ESPECÍFICOS POR TIPO
// ============================================================

function validateDragDrop(data: any, result: ValidationResult): void {
  if (!data.items || !Array.isArray(data.items)) {
    result.errors.push('drag-drop precisa de "items" (array)');
  } else if (data.items.length === 0) {
    result.warnings.push('drag-drop tem 0 items');
  }
  if (!data.categories || !Array.isArray(data.categories)) {
    result.errors.push('drag-drop precisa de "categories" (array)');
  } else if (data.categories.length === 0) {
    result.warnings.push('drag-drop tem 0 categories');
  }
}

function validateFillInBlanks(data: any, result: ValidationResult): void {
  if (!data.sentences || !Array.isArray(data.sentences)) {
    result.errors.push('fill-in-blanks precisa de "sentences" (array)');
  } else {
    if (data.sentences.length === 0) {
      result.warnings.push('fill-in-blanks tem 0 sentences');
    }
    data.sentences.forEach((sentence: any, index: number) => {
      if (!sentence.text || !sentence.text.includes('_______')) {
        result.errors.push(`Sentença ${index + 1} precisa ter "_______" no texto`);
      }
      if (!sentence.correctAnswers || !Array.isArray(sentence.correctAnswers) || sentence.correctAnswers.length === 0) {
        result.errors.push(`Sentença ${index + 1} precisa ter "correctAnswers" (array não-vazio)`);
      }
      if (!sentence.hint) {
        result.warnings.push(`Sentença ${index + 1} não tem "hint"`);
      }
    });
  }
  if (!data.feedback) {
    result.warnings.push('fill-in-blanks não tem "feedback"');
  }
}

function validateScenarioSelection(data: any, result: ValidationResult): void {
  if (!data.scenarios || !Array.isArray(data.scenarios)) {
    result.errors.push('scenario-selection precisa de "scenarios" (array)');
  } else if (data.scenarios.length === 0) {
    result.warnings.push('scenario-selection tem 0 scenarios');
  }
}

function validateTrueFalse(data: any, result: ValidationResult): void {
  if (!data.statements || !Array.isArray(data.statements)) {
    result.errors.push('true-false precisa de "statements" (array)');
  } else {
    if (data.statements.length === 0) {
      result.warnings.push('true-false tem 0 statements');
    }
    data.statements.forEach((stmt: any, index: number) => {
      if (typeof stmt.correct !== 'boolean') {
        result.errors.push(`Statement ${index + 1} precisa ter "correct" (boolean)`);
      }
      if (!stmt.explanation) {
        result.warnings.push(`Statement ${index + 1} não tem "explanation"`);
      }
    });
  }
  if (!data.feedback) {
    result.warnings.push('true-false não tem "feedback"');
  }
}

function validatePlatformMatch(data: any, result: ValidationResult): void {
  if (!data.scenarios || !Array.isArray(data.scenarios)) {
    result.errors.push('platform-match precisa de "scenarios" (array)');
  } else if (data.scenarios.length === 0) {
    result.warnings.push('platform-match tem 0 scenarios');
  }
  if (!data.platforms || !Array.isArray(data.platforms)) {
    result.errors.push('platform-match precisa de "platforms" (array)');
  } else if (data.platforms.length === 0) {
    result.warnings.push('platform-match tem 0 platforms');
  }
}

function validateDataCollection(data: any, result: ValidationResult): void {
  if (!data.scenario) {
    result.errors.push('❌ CRÍTICO: data-collection PRECISA de "scenario" (objeto)');
    return;
  }
  
  // Validar estrutura do scenario
  if (!data.scenario.id) {
    result.errors.push('scenario precisa ter "id"');
  }
  if (!data.scenario.emoji) {
    result.warnings.push('scenario não tem "emoji"');
  }
  if (!data.scenario.platform) {
    result.errors.push('scenario precisa ter "platform"');
  }
  if (!data.scenario.situation) {
    result.errors.push('scenario precisa ter "situation"');
  }
  if (!data.scenario.dataPoints || !Array.isArray(data.scenario.dataPoints)) {
    result.errors.push('scenario precisa ter "dataPoints" (array)');
  } else if (data.scenario.dataPoints.length === 0) {
    result.errors.push('scenario tem 0 dataPoints');
  }
}

function validateCompleteSentence(data: any, result: ValidationResult): void {
  if (!data.sentences || !Array.isArray(data.sentences)) {
    result.errors.push('complete-sentence precisa de "sentences" (array)');
  } else if (data.sentences.length === 0) {
    result.warnings.push('complete-sentence tem 0 sentences');
  }
}

function validateMultipleChoice(data: any, result: ValidationResult): void {
  if (!data.question || typeof data.question !== 'string') {
    result.errors.push('multiple-choice precisa de "question" (string)');
  }

  if (!data.options || !Array.isArray(data.options)) {
    result.errors.push('multiple-choice precisa de "options" (array)');
  } else {
    if (data.options.length < 2) {
      result.errors.push('multiple-choice precisa ter pelo menos 2 opções');
    }

    // Validar correctAnswer
    if (typeof data.correctAnswer !== 'string') {
      result.errors.push('multiple-choice precisa de "correctAnswer" (string)');
    } else {
      if (!data.options.includes(data.correctAnswer)) {
        result.errors.push(`correctAnswer "${data.correctAnswer}" não está nas opções disponíveis`);
      }
    }
  }

  if (!data.explanation) {
    result.warnings.push('multiple-choice não tem "explanation"');
  }
}

/**
 * Valida um array de exercícios
 */
export function validateAllExercises(exercises: any[]): ValidationResult[] {
  if (!exercises || exercises.length === 0) {
    return [];
  }
  return exercises.map(ex => validateExercise(ex));
}

/**
 * Formata resultados de validação para exibição
 */
export function formatValidationReport(results: ValidationResult[]): string {
  if (results.length === 0) {
    return '✅ Nenhum exercício para validar';
  }

  let report = `\n${'='.repeat(60)}\n`;
  report += `🔍 RELATÓRIO DE VALIDAÇÃO DE EXERCÍCIOS\n`;
  report += `${'='.repeat(60)}\n\n`;

  results.forEach((result, index) => {
    const icon = result.isValid ? '✅' : '❌';
    report += `${icon} Exercício ${index + 1}: ${result.exerciseId} (${result.exerciseType})\n`;
    
    if (result.errors.length > 0) {
      report += `   ❌ ERROS:\n`;
      result.errors.forEach(err => report += `      - ${err}\n`);
    }
    
    if (result.warnings.length > 0) {
      report += `   ⚠️ AVISOS:\n`;
      result.warnings.forEach(warn => report += `      - ${warn}\n`);
    }
    
    if (result.isValid && result.errors.length === 0 && result.warnings.length === 0) {
      report += `   ✅ Estrutura válida\n`;
    }
    
    report += `\n`;
  });

  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const validCount = results.filter(r => r.isValid).length;

  report += `${'='.repeat(60)}\n`;
  report += `📊 RESUMO:\n`;
  report += `   Total de exercícios: ${results.length}\n`;
  report += `   Válidos: ${validCount}\n`;
  report += `   Com erros: ${results.length - validCount}\n`;
  report += `   Total de erros: ${totalErrors}\n`;
  report += `   Total de avisos: ${totalWarnings}\n`;
  report += `${'='.repeat(60)}\n`;

  return report;
}
