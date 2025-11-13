import { Step4Output, Step5Output, ExerciseInput } from './types';
import { supabase } from '@/integrations/supabase/client';
import { validateExercise } from '@/lib/exerciseValidator';

/**
 * STEP 5: GERAÇÃO DE EXERCÍCIOS
 * - Processa exercícios do tipo 'prompt' usando IA
 * - Valida estrutura de todos os exercícios
 * - Atribui IDs únicos
 */
export async function step5GenerateExercises(input: Step4Output): Promise<Step5Output> {
  const startTime = Date.now();
  console.log('🎯 [STEP 5] Gerando exercícios...');
  console.log(`   Total de exercícios: ${input.exercises.length}`);

  const exercisesConfig: any[] = [];

  for (let i = 0; i < input.exercises.length; i++) {
    const exercise = input.exercises[i];
    console.log(`   Processando exercício ${i + 1}/${input.exercises.length} (tipo: ${exercise.type})`);

    let exerciseData = exercise.data;

    // Se é do tipo 'prompt' ou não tem data, gerar com IA
    if (exercise.type === 'prompt' || !exerciseData) {
      console.log(`      📝 Gerando exercício via IA...`);
      exerciseData = await processExercisePrompt(exercise.prompt || '', i);
    }

    // Construir exercício base
    const baseExercise = {
      id: `exercise-${Date.now()}-${i}`,
      type: exercise.type === 'prompt' ? exerciseData.type : exercise.type,
      question: exercise.question || exerciseData.question,
      instruction: exercise.instruction || exerciseData.instruction,
      data: exerciseData
    };

    // Validação por tipo
    let validatedExercise;
    try {
      validatedExercise = validateExercise(baseExercise);
      console.log(`      ✅ Exercício ${i + 1} validado`);
    } catch (error) {
      console.error(`      ❌ Erro ao validar exercício ${i + 1}:`, error);
      throw new Error(`Falha na validação do exercício ${i + 1}: ${error.message}`);
    }

    exercisesConfig.push(validatedExercise);
  }

  const elapsedTime = Date.now() - startTime;
  console.log(`✅ [STEP 5] ${exercisesConfig.length} exercícios gerados em ${elapsedTime}ms`);

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
