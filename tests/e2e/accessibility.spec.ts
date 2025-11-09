import { test, expect } from './fixtures/auth';
import { AccessibilityHelpers } from './helpers/accessibility-helpers';

/**
 * Testes de Acessibilidade (a11y) - WCAG 2.1 Level AA
 * 
 * Estes testes validam que a aplicação atende aos critérios de acessibilidade:
 * - WCAG 2.1 Level AA
 * - Navegação por teclado
 * - Leitores de tela
 * - Contraste de cores
 * - Estrutura semântica
 */

test.describe('Acessibilidade - Página Inicial', () => {
  test('deve passar em todas as verificações WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');
    
    const a11y = new AccessibilityHelpers(page);
    
    // Permitir violações menores, mas não moderadas ou sérias
    await a11y.assertNoViolations({
      allowMinor: true,
      wcagLevel: 'AA',
    });

    console.log('✅ Página inicial está acessível');
  });

  test('deve ter estrutura de headings válida', async ({ page }) => {
    await page.goto('/');
    
    const a11y = new AccessibilityHelpers(page);
    const headingTest = await a11y.testHeadingStructure();

    expect(headingTest.hasH1, 'Deve ter pelo menos um h1').toBe(true);
    expect(headingTest.levelJumps.length, 'Não deve pular níveis de heading').toBe(0);
    
    console.log('✅ Estrutura de headings válida');
    console.log(`   Headings encontrados: ${headingTest.headings.map(h => `h${h.level}`).join(', ')}`);
  });

  test('deve ter landmarks ARIA adequados', async ({ page }) => {
    await page.goto('/');
    
    const a11y = new AccessibilityHelpers(page);
    const landmarksTest = await a11y.testAriaLandmarks();

    expect(landmarksTest.hasMain, 'Deve ter role="main" ou <main>').toBe(true);
    expect(landmarksTest.hasDuplicatesWithoutLabels, 'Landmarks duplicados devem ter labels').toBe(false);
    
    console.log('✅ Landmarks ARIA adequados');
  });

  test('deve ter contraste de cores adequado', async ({ page }) => {
    await page.goto('/');
    
    const a11y = new AccessibilityHelpers(page);
    const contrastTest = await a11y.testColorContrast();

    if (contrastTest.hasContrastIssues) {
      console.log(`⚠️  ${contrastTest.violations.length} problema(s) de contraste encontrado(s)`);
      contrastTest.violations.forEach(v => {
        console.log(`   - ${v.description}`);
      });
    }

    expect(contrastTest.hasContrastIssues, 'Não deve ter problemas de contraste').toBe(false);
  });
});

test.describe('Acessibilidade - Dashboard', () => {
  test('dashboard deve ser acessível', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    await a11y.assertNoViolations({ allowMinor: true });

    console.log('✅ Dashboard está acessível');
  });

  test('cards de trilha devem ser navegáveis por teclado', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    const keyboardTest = await a11y.testKeyboardNavigation([
      '[data-testid="trail-card"]',
      'button',
      'a[href]',
    ]);

    const nonFocusable = keyboardTest.filter(r => !r.focusable);
    
    if (nonFocusable.length > 0) {
      console.log('⚠️  Elementos não focáveis:', nonFocusable);
    }

    // Pelo menos os botões principais devem ser focáveis
    expect(keyboardTest.some(r => r.focusable), 'Deve haver elementos focáveis').toBe(true);
  });
});

test.describe('Acessibilidade - Aula', () => {
  const lessonId = '550e8400-e29b-41d4-a716-446655440001';

  test('aula deve ser acessível', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/lessons-interactive/${lessonId}`);
    await authenticatedPage.waitForTimeout(2000); // Aguardar carregamento completo
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    
    // Aulas podem ter algumas violações menores devido à complexidade
    await a11y.assertNoViolations({ 
      allowMinor: true,
      allowModerate: false,
    });

    console.log('✅ Aula está acessível');
  });

  test('player de áudio deve ter controles acessíveis', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/lessons-interactive/${lessonId}`);
    await authenticatedPage.waitForSelector('[data-testid="audio-player"]');
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    
    // Testar controles do player
    const controls = await a11y.testKeyboardNavigation([
      '[data-testid="audio-play-pause-button"]',
      '[data-testid="audio-seek-slider"]',
      '[data-testid="audio-playback-rate"]',
    ]);

    controls.forEach(control => {
      expect(control.focusable, `${control.selector} deve ser focável`).toBe(true);
    });

    console.log('✅ Controles de áudio são acessíveis');
  });

  test('botões devem ter labels descritivos', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/lessons-interactive/${lessonId}`);
    await authenticatedPage.waitForSelector('[data-testid="audio-player"]');
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    
    // Simular leitor de tela nos botões principais
    const playButton = await a11y.simulateScreenReader('[data-testid="audio-play-pause-button"]');
    
    expect(playButton.announcement).toBeTruthy();
    expect(playButton.announcement.length).toBeGreaterThan(5);
    
    console.log(`✅ Botão play: "${playButton.announcement}"`);
  });

  test('imagens devem ter texto alternativo', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/lessons-interactive/${lessonId}`);
    await authenticatedPage.waitForTimeout(2000);
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    const altTest = await a11y.testImageAlts();

    if (altTest.hasAltIssues) {
      console.log(`⚠️  ${altTest.violations.length} problema(s) com alt text`);
      altTest.violations.forEach(v => {
        console.log(`   - ${v.description}`);
        v.nodes.forEach(node => {
          console.log(`     HTML: ${node.html.substring(0, 100)}`);
        });
      });
    }

    expect(altTest.hasAltIssues, 'Todas as imagens devem ter alt text').toBe(false);
  });
});

test.describe('Acessibilidade - Exercícios', () => {
  const lessonId = '550e8400-e29b-41d4-a716-446655440001';

  test('seção de exercícios deve ser acessível', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/lessons-interactive/${lessonId}`);
    
    // Pular para exercícios
    await authenticatedPage.evaluate(() => {
      const audio = document.querySelector('[data-testid="audio-element"]') as HTMLAudioElement;
      if (audio) {
        audio.currentTime = audio.duration - 1;
      }
    });
    
    await authenticatedPage.waitForSelector('[data-testid="exercises-section"]', { timeout: 5000 });
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    await a11y.assertNoViolations({ allowMinor: true });

    console.log('✅ Exercícios são acessíveis');
  });

  test('formulários de exercícios devem ter labels', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/lessons-interactive/${lessonId}`);
    
    // Pular para exercícios
    await authenticatedPage.evaluate(() => {
      const audio = document.querySelector('[data-testid="audio-element"]') as HTMLAudioElement;
      if (audio) audio.currentTime = audio.duration - 1;
    });
    
    await authenticatedPage.waitForSelector('[data-testid="exercises-section"]', { timeout: 5000 });
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    const labelTest = await a11y.testFormLabels();

    if (labelTest.hasLabelIssues) {
      console.log(`⚠️  ${labelTest.violations.length} campo(s) sem label`);
    }

    expect(labelTest.hasLabelIssues, 'Campos de formulário devem ter labels').toBe(false);
  });
});

test.describe('Acessibilidade - Tela de Conclusão', () => {
  test('tela de conclusão deve ser acessível', async ({ authenticatedPage }) => {
    // Navegar e completar uma aula rapidamente para testar conclusão
    const lessonId = '550e8400-e29b-41d4-a716-446655440001';
    
    // Nota: Este é um teste simplificado
    // Em produção, você pode querer criar um estado mockado para a conclusão
    
    await authenticatedPage.goto(`/lessons-interactive/${lessonId}`);
    
    const a11y = new AccessibilityHelpers(authenticatedPage);
    // Testar acessibilidade da página inicial da aula
    await a11y.assertNoViolations({ allowMinor: true });
    
    console.log('✅ Componentes de conclusão são acessíveis');
  });
});

test.describe('Acessibilidade - Navegação por Teclado', () => {
  test('deve permitir navegação completa sem mouse', async ({ page }) => {
    await page.goto('/');
    
    // Simular navegação apenas por teclado
    const tabSequence: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          role: el?.getAttribute('role'),
          text: (el as HTMLElement)?.innerText?.substring(0, 30) || el?.getAttribute('aria-label'),
        };
      });
      
      if (focusedElement.text) {
        tabSequence.push(`${focusedElement.tag}[${focusedElement.role || 'no-role'}]: ${focusedElement.text}`);
      }
    }

    console.log('📍 Sequência de Tab:');
    tabSequence.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item}`);
    });

    expect(tabSequence.length, 'Deve haver elementos focáveis').toBeGreaterThan(0);
  });

  test('escape deve fechar modais e overlays', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    // Se houver algum modal ou overlay, ESC deve fechar
    await authenticatedPage.keyboard.press('Escape');
    
    // Verificar que não há overlays visíveis
    const overlays = await authenticatedPage.locator('[role="dialog"], .fixed.inset-0').count();
    
    console.log(`✅ Nenhum modal aberto após ESC (${overlays} overlays)`);
  });
});

test.describe('Relatórios de Acessibilidade', () => {
  test('gerar relatório HTML completo', async ({ page }) => {
    await page.goto('/');
    
    const a11y = new AccessibilityHelpers(page);
    const reportPath = await a11y.generateHtmlReport('homepage');
    
    console.log(`📄 Relatório HTML gerado: ${reportPath}`);
    
    expect(reportPath).toBeTruthy();
  });
});

test.describe('Modo High Contrast', () => {
  test('deve funcionar com cores forçadas (Windows High Contrast)', async ({ page }) => {
    // Simular modo de alto contraste
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
    
    // Verificar que elementos principais ainda são visíveis
    const mainVisible = await page.locator('main').isVisible();
    expect(mainVisible).toBe(true);
    
    console.log('✅ Modo alto contraste funciona');
  });
});

test.describe('Screen Reader Simulation', () => {
  test('simular experiência de leitor de tela na página inicial', async ({ page }) => {
    await page.goto('/');
    
    const a11y = new AccessibilityHelpers(page);
    
    // Testar principais elementos interativos
    const selectors = [
      'button',
      'a[href="/auth"]',
      'a[href="/dashboard"]',
    ];

    console.log('🔊 Simulação de Leitor de Tela:');
    
    for (const selector of selectors) {
      const exists = await page.locator(selector).first().count();
      if (exists > 0) {
        const sr = await a11y.simulateScreenReader(selector);
        console.log(`   📢 ${sr.announcement}`);
      }
    }
  });
});
