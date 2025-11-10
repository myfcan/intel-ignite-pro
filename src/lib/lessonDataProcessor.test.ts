import { processLessonData, logValidation, type ProcessedLessonData } from './lessonDataProcessor';
import { fundamentos02, fundamentos02AudioText } from '@/data/lessons/fundamentos-02';
import { fundamentos03, fundamentos03AudioText } from '@/data/lessons/fundamentos-03';

/**
 * TESTES DO PROCESSADOR DE LIÇÕES
 * 
 * Execute no console do navegador:
 * 1. Abra DevTools (F12)
 * 2. Cole: testLessonProcessor()
 * 3. Verifique se todos os checks passaram ✅
 */

export function testLessonProcessor() {
  console.log('🧪 TESTE DO PROCESSADOR DE LIÇÕES');
  console.log('===================================\n');

  const tests: {
    name: string;
    result: ProcessedLessonData;
  }[] = [];

  // Teste 1: Fundamentos 02
  console.log('📋 Teste 1: Fundamentos 02');
  const result02 = processLessonData({
    lessonData: fundamentos02,
    audioText: fundamentos02AudioText,
    trailId: 'test-trail-id',
    orderIndex: 2,
    title: fundamentos02.title,
    description: 'Como a IA aprende e se adapta'
  });
  logValidation(result02, 'Fundamentos 02');
  tests.push({ name: 'Fundamentos 02', result: result02 });

  // Teste 2: Fundamentos 03
  console.log('📋 Teste 2: Fundamentos 03');
  const result03 = processLessonData({
    lessonData: fundamentos03,
    audioText: fundamentos03AudioText,
    trailId: 'test-trail-id',
    orderIndex: 3,
    title: fundamentos03.title,
    description: 'Entenda como a IA aprende e melhora com o tempo'
  });
  logValidation(result03, 'Fundamentos 03');
  tests.push({ name: 'Fundamentos 03', result: result03 });

  // Teste 3: Simulação com emojis (deve falhar propositalmente)
  console.log('📋 Teste 3: Texto com emojis (deve avisar)');
  const resultWithEmojis = processLessonData({
    lessonData: fundamentos02,
    audioText: '🎉 Olá! Este texto tem emojis 🚀 e deveria avisar',
    trailId: 'test-trail-id',
    orderIndex: 99,
    title: 'Teste com emojis'
  });
  logValidation(resultWithEmojis, 'Teste com Emojis');
  tests.push({ name: 'Com Emojis', result: resultWithEmojis });

  // Teste 4: Simulação com markdown (deve limpar)
  console.log('📋 Teste 4: Texto com markdown (deve limpar)');
  const resultWithMarkdown = processLessonData({
    lessonData: fundamentos02,
    audioText: '## Título\n\n**Texto em negrito** e `código`',
    trailId: 'test-trail-id',
    orderIndex: 100,
    title: 'Teste com markdown'
  });
  logValidation(resultWithMarkdown, 'Teste com Markdown');
  tests.push({ name: 'Com Markdown', result: resultWithMarkdown });

  // SUMÁRIO FINAL
  console.log('\n📊 SUMÁRIO DOS TESTES');
  console.log('===================================');
  
  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.result.validation.allPassed).length;
  const withWarnings = tests.filter(t => t.result.validation.warnings.length > 0).length;

  console.log(`Total de testes: ${totalTests}`);
  console.log(`✅ Aprovados: ${passedTests}/${totalTests}`);
  console.log(`⚠️ Com avisos: ${withWarnings}/${totalTests}`);

  tests.forEach(test => {
    const status = test.result.validation.allPassed ? '✅' : '❌';
    const warnings = test.result.validation.warnings.length > 0 
      ? ` (${test.result.validation.warnings.length} avisos)` 
      : '';
    console.log(`${status} ${test.name}${warnings}`);
  });

  // Verificações críticas
  console.log('\n🎯 VERIFICAÇÕES CRÍTICAS');
  console.log('===================================');

  const criticalChecks = [
    {
      name: 'Todos audioText estão limpos',
      passed: tests.every(t => 
        !t.result.audioData.cleanAudioText.includes('**') &&
        !t.result.audioData.cleanAudioText.includes('##') &&
        !/[\u{1F300}-\u{1F9FF}]/u.test(t.result.audioData.cleanAudioText)
      )
    },
    {
      name: 'Todos estimated_time são INTEGER',
      passed: tests.every(t => Number.isInteger(t.result.databaseData.estimated_time))
    },
    {
      name: 'Todos content têm duration preciso',
      passed: tests.every(t => 
        typeof t.result.databaseData.content.duration === 'number' &&
        t.result.databaseData.content.duration > 0
      )
    },
    {
      name: 'Fundamentos 02 e 03 passaram',
      passed: tests.slice(0, 2).every(t => t.result.validation.allPassed)
    }
  ];

  criticalChecks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
  });

  const allCriticalPassed = criticalChecks.every(c => c.passed);
  
  console.log('\n🏁 RESULTADO FINAL');
  console.log('===================================');
  if (allCriticalPassed && passedTests >= 2) {
    console.log('✅ APROVADO - Processador está funcionando corretamente!');
    console.log('👉 Pode usar em produção com segurança');
  } else {
    console.log('❌ REPROVADO - Há problemas que precisam ser corrigidos');
    console.log('👉 Revise as validações acima antes de usar em produção');
  }
  console.log('===================================\n');

  return {
    tests,
    summary: {
      total: totalTests,
      passed: passedTests,
      withWarnings,
      allCriticalPassed,
      approved: allCriticalPassed && passedTests >= 2
    }
  };
}

// Tornar disponível no window para uso no console
if (typeof window !== 'undefined') {
  (window as any).testLessonProcessor = testLessonProcessor;
  console.log('✅ testLessonProcessor() disponível no console');
}
