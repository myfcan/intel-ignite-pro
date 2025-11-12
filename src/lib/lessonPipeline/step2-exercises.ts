import { Step1Output, Step2Output, ExerciseInput } from './types';
import { ExerciseConfigTyped } from '@/types/exerciseSchemas';
import { supabase } from '@/integrations/supabase/client';

/**
 * Processa um prompt de texto e gera estrutura de exercício via AI
 */
async function processExercisePrompt(prompt: string, index: number): Promise<ExerciseInput> {
  console.log(`   📝 Processando prompt do exercício ${index + 1} via AI...`);
  
  // Chamar edge function para processar o prompt
  const { data, error } = await supabase.functions.invoke('claude-interact', {
    body: {
      message: `Você é um especialista em criar exercícios educacionais estruturados.

PROMPT DO USUÁRIO:
${prompt}

TIPOS SUPORTADOS:
1. multiple-choice - Múltipla escolha (precisa: options[], correctAnswer)
2. true-false - Verdadeiro/Falso (precisa: correctAnswer boolean)
3. fill-blanks - Preencher lacunas (precisa: blanks[])
4. complete-sentence - Completar frase (precisa: blanks[])
5. drag-drop - Arrastar e soltar (precisa: items[], categories[])
6. scenario-selection - Seleção de cenário (precisa: scenarios[])
7. platform-match - Combinar plataformas (precisa: platforms[], features[])
8. data-collection - Coleta de dados (precisa: examples[])

TAREFA:
Analise o prompt do usuário e retorne APENAS um JSON válido com a estrutura do exercício.

FORMATO DE RESPOSTA (escolha o tipo apropriado):

Para multiple-choice:
{
  "type": "multiple-choice",
  "instruction": "Pergunta clara",
  "data": {
    "options": ["Opção 1", "Opção 2", "Opção 3"],
    "correctAnswer": 1
  }
}

Para drag-drop:
{
  "type": "drag-drop",
  "instruction": "Instrução clara",
  "data": {
    "items": [
      {"id": "1", "text": "Item 1", "category": "cat1"},
      {"id": "2", "text": "Item 2", "category": "cat2"}
    ],
    "categories": ["cat1", "cat2"]
  }
}

IMPORTANTE:
- Retorne APENAS o JSON, sem texto adicional
- Use o tipo mais apropriado para o prompt
- Garanta que todos os campos obrigatórios estão presentes
- Se o prompt especifica um tipo, use esse tipo`,
      context_type: 'exercise-generation',
      lesson_id: 'pipeline-step2'
    }
  });

  if (error) {
    throw new Error(`Erro ao processar exercício ${index + 1}: ${error.message}`);
  }

  // Extrair JSON da resposta (a AI pode retornar texto + JSON)
  let responseText = data?.response || data?.message || JSON.stringify(data);
  
  // Tentar extrair JSON se vier com texto extra
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    responseText = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(responseText);
    console.log(`   ✅ Exercício ${index + 1} processado: ${parsed.type}`);
    return parsed;
  } catch (parseError) {
    console.error('   ❌ Resposta da AI não é JSON válido:', responseText);
    throw new Error(`Exercício ${index + 1}: AI não retornou JSON válido. Resposta: ${responseText.substring(0, 200)}`);
  }
}

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
    let exercise = input.exercises[i];
    const exerciseId = `exercise-${i + 1}`;

    console.log(`   Processando exercício ${i + 1}/${input.exercises.length}...`);

    // Se o exercício é do tipo 'prompt', processar via AI primeiro
    if (exercise.type === 'prompt' || !exercise.data) {
      const promptText = exercise.prompt || exercise.question || '';
      if (!promptText || promptText.trim().length === 0) {
        throw new Error(`Exercício ${i + 1} está vazio`);
      }
      
      // Processar via AI
      exercise = await processExercisePrompt(promptText, i);
    }

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
