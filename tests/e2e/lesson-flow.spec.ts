import { test, expect } from './fixtures/auth';
import { LessonTestHelpers } from './helpers/lesson-helpers';

/**
 * Testes E2E do fluxo completo de aulas
 * 
 * Estes testes simulam um usuário real navegando por uma aula:
 * 1. Carregamento da aula e áudio
 * 2. Sincronização áudio-texto
 * 3. Ativação de playground
 * 4. Transição para exercícios
 * 5. Conclusão da aula
 */

test.describe('Fluxo Completo de Aula', () => {
  let helpers: LessonTestHelpers;

  test.beforeEach(async ({ authenticatedPage }) => {
    helpers = new LessonTestHelpers(authenticatedPage);
  });

  test('deve carregar aula e áudio corretamente', async ({ authenticatedPage }) => {
    const lessonId = '550e8400-e29b-41d4-a716-446655440001'; // Aula 01
    
    await helpers.navigateToLesson(lessonId);
    
    // Verificar que página carregou
    await expect(authenticatedPage).toHaveTitle(/MAIA/i);
    
    // Verificar que áudio carregou
    await helpers.waitForAudioLoad();
    
    const duration = await helpers.getAudioDuration();
    expect(duration).toBeGreaterThan(0);
    
    console.log(`✅ Áudio carregado: ${duration.toFixed(1)}s`);
  });

  test('deve sincronizar seções com o áudio', async ({ authenticatedPage }) => {
    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad();
    
    // Testar sincronização em diferentes pontos
    const testPoints = [
      { time: 5, expectedSection: 1 },
      { time: 15, expectedSection: 2 },
      { time: 30, expectedSection: 3 },
    ];

    for (const point of testPoints) {
      await helpers.verifySectionSyncWithTolerance(
        point.time, 
        point.expectedSection,
        1 // tolerância de 1s
      );
      console.log(`✅ Sincronização OK: ${point.time}s → seção ${point.expectedSection}`);
    }
  });

  test('deve medir latência de sincronização', async ({ authenticatedPage }) => {
    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad();
    
    const latencies: number[] = [];
    
    // Medir latência em 5 pontos diferentes
    for (let i = 0; i < 5; i++) {
      const randomTime = Math.random() * 60; // 0-60s
      const latency = await helpers.measureSyncLatency(randomTime);
      latencies.push(latency);
    }
    
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    
    console.log(`📊 Latência média: ${avgLatency.toFixed(0)}ms`);
    console.log(`📊 Latência máxima: ${maxLatency.toFixed(0)}ms`);
    
    // Verificar que latência está dentro do aceitável
    expect(avgLatency).toBeLessThan(150); // < 150ms em média
    expect(maxLatency).toBeLessThan(300); // < 300ms no máximo
  });

  test('deve ativar playground no momento correto', async ({ authenticatedPage }) => {
    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad();
    
    // Para Aula 01, playground ativa em ~128s
    const playgroundTriggerTime = 128;
    
    // Avançar para antes do trigger
    await helpers.seekAudio(playgroundTriggerTime - 2);
    let isVisible = await helpers.isPlaygroundVisible();
    expect(isVisible).toBe(false);
    console.log(`✅ Playground não visível antes do trigger`);
    
    // Avançar para depois do trigger
    await helpers.seekAudio(playgroundTriggerTime + 1);
    await authenticatedPage.waitForTimeout(500); // Aguardar animação
    
    isVisible = await helpers.isPlaygroundVisible();
    expect(isVisible).toBe(true);
    console.log(`✅ Playground ativado corretamente`);
  });

  test('deve fazer transição para exercícios', async ({ authenticatedPage }) => {
    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad();
    
    // Avançar até final do áudio
    const duration = await helpers.getAudioDuration();
    await helpers.seekAudio(duration - 1);
    
    // Aguardar transição para exercícios
    await authenticatedPage.waitForTimeout(2000);
    
    const exercisesVisible = await helpers.areExercisesVisible();
    expect(exercisesVisible).toBe(true);
    console.log(`✅ Transição para exercícios OK`);
  });

  test('deve completar exercícios e finalizar aula', async ({ authenticatedPage }) => {
    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad();
    
    // Pular para exercícios
    const duration = await helpers.getAudioDuration();
    await helpers.seekAudio(duration - 1);
    await authenticatedPage.waitForTimeout(2000);
    
    // Responder exercícios (exemplo - adaptar para sua aula)
    await helpers.answerMultipleChoice(0, 0);
    await helpers.answerTrueFalse(1, true);
    await helpers.fillTextAnswer(2, 'Minha resposta');
    
    // Submeter
    await helpers.submitExercises();
    
    // Aguardar conclusão
    await authenticatedPage.waitForTimeout(1000);
    
    // Verificar toast de sucesso ou conclusão
    const conclusionVisible = await helpers.isConclusionVisible();
    expect(conclusionVisible).toBe(true);
    console.log(`✅ Aula concluída com sucesso`);
  });

  test('deve validar fluxo completo sem erros de console', async ({ authenticatedPage }) => {
    const errors: string[] = [];
    
    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad();
    
    // Simular uso normal
    await helpers.playAudio();
    await authenticatedPage.waitForTimeout(2000);
    await helpers.pauseAudio();
    
    await helpers.seekAudio(30);
    await authenticatedPage.waitForTimeout(500);
    
    await helpers.seekAudio(60);
    await authenticatedPage.waitForTimeout(500);
    
    // Verificar que não houve erros
    expect(errors.length).toBe(0);
    console.log(`✅ Nenhum erro de console detectado`);
  });

  test('deve funcionar em conexão lenta (throttling)', async ({ authenticatedPage }) => {
    // Simular conexão 3G lenta
    const client = await authenticatedPage.context().newCDPSession(authenticatedPage);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (750 * 1024) / 8, // 750kb/s
      uploadThroughput: (250 * 1024) / 8,   // 250kb/s
      latency: 100, // 100ms latency
    });

    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    const startTime = Date.now();
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad(30000); // timeout maior
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Tempo de carregamento em 3G: ${(loadTime / 1000).toFixed(1)}s`);
    
    // Deve carregar em até 30s mesmo em conexão lenta
    expect(loadTime).toBeLessThan(30000);
  });
});

test.describe('Testes de Performance', () => {
  let helpers: LessonTestHelpers;

  test.beforeEach(async ({ authenticatedPage }) => {
    helpers = new LessonTestHelpers(authenticatedPage);
  });

  test('deve carregar aula em menos de 5 segundos', async ({ authenticatedPage }) => {
    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    const startTime = Date.now();
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad();
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Tempo de carregamento: ${(loadTime / 1000).toFixed(2)}s`);
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('deve manter sincronização com múltiplos seeks rápidos', async ({ authenticatedPage }) => {
    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    await helpers.navigateToLesson(lessonId);
    await helpers.waitForAudioLoad();
    
    // Fazer múltiplos seeks rápidos
    const seekTimes = [10, 20, 30, 40, 50, 30, 20, 10];
    
    for (const time of seekTimes) {
      await helpers.seekAudio(time);
      await authenticatedPage.waitForTimeout(100); // 100ms entre seeks
    }
    
    // Verificar que ainda está sincronizado
    await helpers.verifySectionSyncWithTolerance(25, 3, 1);
    console.log(`✅ Sincronização mantida após seeks rápidos`);
  });
});
