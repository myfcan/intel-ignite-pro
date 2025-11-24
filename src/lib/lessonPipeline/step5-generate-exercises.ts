import { Step4Output, Step5Output, ExerciseInput } from './types';
import { supabase } from '@/integrations/supabase/client';
import { validateExercise } from '@/lib/exerciseValidator';
import { PipelineLogger } from './logger';

/**
 * 🔄 NORMALIZAR MULTIPLE-CHOICE
 * Converte correctOptionIndex para correctAnswer
 */
function normalizeMultipleChoiceData(data: any, logger?: PipelineLogger): any {
  // Se já tem correctAnswer, não fazer nada
  if (data.correctAnswer) {
    return data;
  }

  // Se tem correctOptionIndex, converter
  if (typeof data.correctOptionIndex === 'number' && Array.isArray(data.options)) {
    if (logger) {
      logger.info(5, 'Generate Exercises', '🔄 Convertendo correctOptionIndex para correctAnswer...');
    }
    
    const correctAnswer = data.options[data.correctOptionIndex];
    if (!correctAnswer) {
      throw new Error(`correctOptionIndex ${data.correctOptionIndex} é inválido (options tem ${data.options.length} itens)`);
    }

    return {
      ...data,
      correctAnswer,
      explanation: data.feedback || data.explanation || ''
    };
  }

  return data;
}

/**
 * 🔄 NORMALIZAR TRUE-FALSE
 * Converte formato simplificado para formato com statements
 */
function normalizeTrueFalseData(data: any, logger?: PipelineLogger): any {
  // Se já está no formato correto (com statements), não fazer nada
  if (data.statements && Array.isArray(data.statements)) {
    return data;
  }

  // Se tem answer/statement/feedback no nível raiz, converter
  if (data.hasOwnProperty('answer') || data.statement) {
    if (logger) {
      logger.info(5, 'Generate Exercises', '🔄 Convertendo true-false para formato com statements...');
    }

    return {
      statements: [
        {
          id: 'stmt-1',
          text: data.statement || data.question || '',
          correct: data.answer || false,
          explanation: data.feedback || data.explanation || ''
        }
      ],
      feedback: {
        perfect: 'Perfeito!',
        good: 'Muito bem!',
        needsReview: 'Revise o conteúdo'
      }
    };
  }

  return data;
}

/**
 * 🔄 NORMALIZAR COMPLETE-SENTENCE
 * Converte formato simplificado (arrays separados) para formato completo (objetos)
 * 
 * DE:
 * {
 *   sentences: ["texto1", "texto2"],
 *   correctAnswers: [["ans1"], ["ans2"]]
 * }
 * 
 * PARA:
 * {
 *   sentences: [
 *     { id: "sent-1", text: "texto1", correctAnswers: ["ans1"] },
 *     { id: "sent-2", text: "texto2", correctAnswers: ["ans2"] }
 *   ]
 * }
 */
function normalizeCompleteSentenceData(exercise: any, data: any, logger?: PipelineLogger): any {
  // Se já está no formato correto (sentences é array de objetos), não fazer nada
  if (data.sentences && Array.isArray(data.sentences) && data.sentences.length > 0) {
    const firstSentence = data.sentences[0];
    if (typeof firstSentence === 'object' && firstSentence.text && firstSentence.correctAnswers) {
      if (logger) {
        logger.info(5, 'Generate Exercises', '✅ Complete-sentence já está no formato correto');
      }
      return data;
    }
  }

  // Converter formato simplificado
  if (logger) {
    logger.info(5, 'Generate Exercises', '🔄 Convertendo complete-sentence do formato simplificado para formato completo...');
  }

  // Pegar sentences e correctAnswers do exercício ou do data
  const sentences = exercise.sentences || data.sentences || [];
  const correctAnswers = exercise.correctAnswers || data.correctAnswers || [];

  if (!Array.isArray(sentences) || sentences.length === 0) {
    throw new Error('Complete-sentence precisa de "sentences" (array não-vazio)');
  }

  if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
    throw new Error('Complete-sentence precisa de "correctAnswers" (array não-vazio)');
  }

  if (sentences.length !== correctAnswers.length) {
    throw new Error(`Complete-sentence: número de sentences (${sentences.length}) deve ser igual ao número de correctAnswers (${correctAnswers.length})`);
  }

  // Converter para formato completo
  const normalizedSentences = sentences.map((text: any, index: number) => ({
    id: `sent-${index + 1}`,
    text: typeof text === 'string' ? text : (text.text || ''),
    correctAnswers: correctAnswers[index] || []
  }));

  if (logger) {
    logger.success(5, 'Generate Exercises', `✅ ${normalizedSentences.length} sentenças convertidas`);
  }

  return {
    sentences: normalizedSentences
  };
}

/**
 * Helper: Obter título do exercício baseado no tipo
 */
function getExerciseTitle(type: string): string {
  const titles: Record<string, string> = {
    'multiple-choice': 'Múltipla Escolha',
    'true-false': 'Verdadeiro ou Falso',
    'complete-sentence': 'Completar Sentença',
    'fill-in-blanks': 'Preencher Lacunas',
    'drag-and-drop': 'Arrastar e Soltar',
    'matching': 'Relacionar Colunas'
  };
  return titles[type] || 'Exercício';
}

/**
 * STEP 5: GERAÇÃO DE EXERCÍCIOS
 * - Processa exercícios do tipo 'prompt' usando IA
 * - Valida estrutura de todos os exercícios
 * - Atribui IDs únicos
 */
export async function step5GenerateExercises(input: Step4Output, logger?: PipelineLogger): Promise<Step5Output> {
  const startTime = Date.now();
  
  if (logger) {
    await logger.info(5, 'Generate Exercises', `📝 Processando ${input.exercises.length} exercícios...`);
  }

  const exercisesConfig: any[] = [];

  for (let i = 0; i < input.exercises.length; i++) {
    const exercise = input.exercises[i];
    
    if (logger) {
      await logger.info(5, 'Generate Exercises', `[${i+1}/${input.exercises.length}] Tipo: ${exercise.type}`);
    }

    let exerciseData = exercise.data;

    // 🔄 FALLBACK: Se não tem .data, usar o próprio exercício como data
    if (!exerciseData && exercise.type !== 'prompt') {
      if (logger) {
        await logger.info(5, 'Generate Exercises', `🔄 Usando exercício raiz como data (fallback)`);
      }
      exerciseData = { ...exercise };
      delete exerciseData.type;
      delete exerciseData.index;
    }

    // 🔄 NORMALIZAR COMPLETE-SENTENCE: converter formato simplificado para formato completo
    if (exercise.type === 'complete-sentence' && exerciseData) {
      exerciseData = normalizeCompleteSentenceData(exercise, exerciseData, logger);
    }

    // 🔄 NORMALIZAR MULTIPLE-CHOICE: converter correctOptionIndex para correctAnswer
    if (exercise.type === 'multiple-choice' && exerciseData) {
      exerciseData = normalizeMultipleChoiceData(exerciseData, logger);
    }

    // 🔄 NORMALIZAR TRUE-FALSE: converter answer/feedback para correct/explanation
    if (exercise.type === 'true-false' && exerciseData) {
      exerciseData = normalizeTrueFalseData(exerciseData, logger);
    }

    // Se é do tipo 'prompt' ou não tem data, gerar com IA
    if (exercise.type === 'prompt' || !exerciseData) {
      if (logger) {
        await logger.info(5, 'Generate Exercises', `🤖 Gerando exercício via IA...`);
      }
      exerciseData = await processExercisePrompt(exercise.prompt || '', i);
      
      if (logger) {
        await logger.success(5, 'Generate Exercises', `✅ Exercício gerado: ${exerciseData.type}`);
      }
    }

    // Construir exercício base
    const exerciseType = exercise.type === 'prompt' ? exerciseData.type : exercise.type;
    const baseExercise = {
      id: `exercise-${Date.now()}-${i}`,
      type: exerciseType,
      title: getExerciseTitle(exerciseType),
      question: exercise.question || exerciseData.question,
      instruction: exercise.instruction || exerciseData.instruction,
      data: exerciseData
    };

    // Validação por tipo
    const validationResult = validateExercise(baseExercise);

    if (!validationResult.isValid) {
      const errorMessage = validationResult.errors.join(', ');
      if (logger) {
        await logger.error(5, 'Generate Exercises', `❌ Validação falhou no exercício ${i + 1}`, {
          exerciseIndex: i,
          exerciseType: baseExercise.type,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        });
      }
      throw new Error(`Falha na validação do exercício ${i + 1}: ${errorMessage}`);
    }

    if (validationResult.warnings.length > 0 && logger) {
      await logger.warn(5, 'Generate Exercises', `⚠️ Exercício ${i + 1} com avisos: ${validationResult.warnings.join(', ')}`);
    }

    if (logger) {
      await logger.success(5, 'Generate Exercises', `✅ Exercício ${i + 1} validado`);
    }

    exercisesConfig.push(baseExercise);
  }

  const elapsedTime = Date.now() - startTime;
  
  if (logger) {
    await logger.success(5, 'Generate Exercises', `✅ ${exercisesConfig.length} exercícios prontos (${elapsedTime}ms)`);
  }

  return {
    ...input,
    exercisesConfig
  };
}

/**
 * Processar prompt de exercício via IA
 */
async function processExercisePrompt(prompt: string, index: number): Promise<any> {
  console.log(`         Enviando prompt para IA...`);

  const { data, error } = await supabase.functions.invoke('claude-interact', {
    body: {
      message: `Você é um especialista em criar exercícios educacionais. Baseado no prompt abaixo, gere um exercício estruturado em JSON.

PROMPT: ${prompt}

Retorne APENAS o JSON no seguinte formato (escolha o tipo adequado):

Para multiple-choice:
{
  "type": "multiple-choice",
  "question": "Pergunta aqui",
  "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
  "correctAnswer": "Opção correta",
  "explanation": "Explicação da resposta"
}

Para true-false:
{
  "type": "true-false",
  "question": "Afirmação aqui",
  "correctAnswer": true,
  "explanation": "Explicação"
}

Para fill-blanks:
{
  "type": "fill-blanks",
  "question": "Texto com [blank] para preencher",
  "blanks": ["resposta1", "resposta2"],
  "explanation": "Explicação"
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional.`
    }
  });

  if (error) {
    console.error(`         ❌ Erro ao gerar exercício via IA:`, error);
    throw new Error(`Falha ao gerar exercício: ${error.message}`);
  }

  // Extrair JSON da resposta
  let responseText = data.response || '';
  
  // Tentar extrair JSON entre ```json e ```
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    responseText = jsonMatch[1];
  }

  // Remover possíveis prefixos
  responseText = responseText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

  try {
    const exerciseData = JSON.parse(responseText);
    console.log(`         ✅ Exercício gerado: ${exerciseData.type}`);
    return exerciseData;
  } catch (parseError) {
    console.error(`         ❌ Erro ao parsear JSON:`, parseError);
    console.error(`         Resposta recebida:`, responseText);
    throw new Error(`JSON inválido retornado pela IA: ${parseError.message}`);
  }
}
