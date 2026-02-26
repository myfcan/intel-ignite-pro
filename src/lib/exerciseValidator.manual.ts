/**
 * 🧪 TESTES PARA VALIDADOR DE EXERCÍCIOS
 * 
 * Executa no browser console para validar o sistema de validação.
 */

import { validateExercise, validateAllExercises } from './exerciseValidator';

export function runExerciseValidationTests() {
  console.log('\n🧪 INICIANDO TESTES DE VALIDAÇÃO DE EXERCÍCIOS\n');
  console.log('='.repeat(60));
  
  const tests = [
    // TEST 1: data-collection SEM scenarios (o bug original!)
    {
      name: 'data-collection sem scenarios (BUG ORIGINAL)',
      exercise: {
        id: 'ex-1',
        type: 'data-collection',
        title: 'Teste',
        instruction: 'Teste',
        data: {} // ❌ FALTA scenarios!
      },
      expectValid: false,
      expectErrors: ['data-collection PRECISA de "scenarios"']
    },
    
    // TEST 2: data-collection VÁLIDO
    {
      name: 'data-collection válido',
      exercise: {
        id: 'ex-2',
        type: 'data-collection',
        title: 'Teste',
        instruction: 'Teste',
        data: {
          scenarios: [
            {
              id: 's1',
              emoji: '🎯',
              platform: 'ChatGPT',
              situation: 'Teste',
              dataPoints: [{ id: 'dp1', label: 'Test', isCorrect: true }],
              context: 'Teste'
            }
          ]
        }
      },
      expectValid: true,
      expectErrors: []
    },
    
    // TEST 3: fill-in-blanks sem sentences
    {
      name: 'fill-in-blanks sem sentences',
      exercise: {
        id: 'ex-3',
        type: 'fill-in-blanks',
        title: 'Teste',
        instruction: 'Teste',
        data: {} // ❌ FALTA sentences!
      },
      expectValid: false,
      expectErrors: ['fill-in-blanks precisa de "sentences"']
    },
    
    // TEST 4: true-false válido
    {
      name: 'true-false válido',
      exercise: {
        id: 'ex-4',
        type: 'true-false',
        title: 'Teste',
        instruction: 'Teste',
        data: {
          statements: [
            { id: 's1', text: 'Test', correct: true, explanation: 'Test' }
          ],
          feedback: {
            perfect: 'Perfect!',
            good: 'Good!',
            needsReview: 'Review'
          }
        }
      },
      expectValid: true,
      expectErrors: []
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    console.log(`\n📝 Teste ${index + 1}: ${test.name}`);
    
    const result = validateExercise(test.exercise);
    
    const isPassedTest = 
      result.isValid === test.expectValid &&
      test.expectErrors.every(expectedErr => 
        result.errors.some(actualErr => actualErr.includes(expectedErr))
      );
    
    if (isPassedTest) {
      console.log('   ✅ PASSOU');
      passed++;
    } else {
      console.log('   ❌ FALHOU');
      console.log('   Esperado isValid:', test.expectValid, '| Real:', result.isValid);
      console.log('   Erros esperados:', test.expectErrors);
      console.log('   Erros reais:', result.errors);
      failed++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTADO FINAL:`);
  console.log(`   ✅ Passou: ${passed}`);
  console.log(`   ❌ Falhou: ${failed}`);
  console.log(`   Total: ${tests.length}`);
  console.log('\n' + '='.repeat(60) + '\n');
  
  return { passed, failed, total: tests.length };
}

// Disponibilizar globalmente para testar no console
if (typeof window !== 'undefined') {
  (window as any).runExerciseValidationTests = runExerciseValidationTests;
}
