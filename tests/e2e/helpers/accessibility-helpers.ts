import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper para testes de acessibilidade com axe-core
 * 
 * Baseado em WCAG 2.1 Level AA
 */

export interface A11yViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: {
    html: string;
    target: string[];
    failureSummary: string;
  }[];
}

export interface A11yTestResult {
  url: string;
  timestamp: string;
  violations: A11yViolation[];
  passes: number;
  incomplete: number;
  inaccessible: number;
}

export class AccessibilityHelpers {
  constructor(private page: Page) {}

  /**
   * Executa análise completa de acessibilidade
   */
  async runAccessibilityTest(options?: {
    wcagLevel?: 'A' | 'AA' | 'AAA';
    disableRules?: string[];
    includeTags?: string[];
    excludeTags?: string[];
  }): Promise<A11yTestResult> {
    const wcagLevel = options?.wcagLevel || 'AA';
    
    // Configurar axe-builder
    const builder = new AxeBuilder({ page: this.page })
      .withTags([`wcag2${wcagLevel.toLowerCase()}`, 'wcag21aa', 'best-practice']);

    // Aplicar regras personalizadas
    if (options?.disableRules) {
      builder.disableRules(options.disableRules);
    }

    if (options?.includeTags) {
      builder.include(options.includeTags);
    }

    if (options?.excludeTags) {
      builder.exclude(options.excludeTags);
    }

    // Executar análise
    const results = await builder.analyze();

    return {
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      violations: results.violations as A11yViolation[],
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inaccessible: results.violations.length,
    };
  }

  /**
   * Verifica se página está acessível (sem violações críticas)
   */
  async assertNoViolations(options?: {
    allowMinor?: boolean;
    allowModerate?: boolean;
    wcagLevel?: 'A' | 'AA' | 'AAA';
  }) {
    const result = await this.runAccessibilityTest({
      wcagLevel: options?.wcagLevel,
    });

    const criticalViolations = result.violations.filter(v => v.impact === 'critical');
    const seriousViolations = result.violations.filter(v => v.impact === 'serious');
    const moderateViolations = result.violations.filter(v => v.impact === 'moderate');
    const minorViolations = result.violations.filter(v => v.impact === 'minor');

    let errorMessage = '';

    if (criticalViolations.length > 0) {
      errorMessage += `\n❌ ${criticalViolations.length} violação(ões) CRÍTICA(S):\n`;
      criticalViolations.forEach(v => {
        errorMessage += `  - ${v.id}: ${v.description}\n`;
        errorMessage += `    Ajuda: ${v.helpUrl}\n`;
      });
    }

    if (seriousViolations.length > 0) {
      errorMessage += `\n⚠️  ${seriousViolations.length} violação(ões) SÉRIA(S):\n`;
      seriousViolations.forEach(v => {
        errorMessage += `  - ${v.id}: ${v.description}\n`;
      });
    }

    if (!options?.allowModerate && moderateViolations.length > 0) {
      errorMessage += `\n⚠️  ${moderateViolations.length} violação(ões) MODERADA(S):\n`;
      moderateViolations.forEach(v => {
        errorMessage += `  - ${v.id}: ${v.description}\n`;
      });
    }

    if (!options?.allowMinor && minorViolations.length > 0) {
      errorMessage += `\nℹ️  ${minorViolations.length} violação(ões) MENOR(ES):\n`;
      minorViolations.forEach(v => {
        errorMessage += `  - ${v.id}: ${v.description}\n`;
      });
    }

    if (errorMessage) {
      throw new Error(`Problemas de acessibilidade encontrados:${errorMessage}`);
    }
  }

  /**
   * Testa navegação por teclado
   */
  async testKeyboardNavigation(interactiveSelectors: string[]) {
    const results: { selector: string; focusable: boolean; tabIndex?: number }[] = [];

    for (const selector of interactiveSelectors) {
      const element = this.page.locator(selector).first();
      
      // Verificar se elemento existe
      const exists = await element.count() > 0;
      if (!exists) {
        results.push({ selector, focusable: false });
        continue;
      }

      // Tentar focar com Tab
      await element.focus();
      const isFocused = await element.evaluate(el => el === document.activeElement);
      
      // Verificar tabIndex
      const tabIndex = await element.getAttribute('tabindex');

      results.push({
        selector,
        focusable: isFocused,
        tabIndex: tabIndex ? parseInt(tabIndex) : undefined,
      });
    }

    return results;
  }

  /**
   * Testa contraste de cores
   */
  async testColorContrast() {
    const result = await this.runAccessibilityTest();
    const contrastViolations = result.violations.filter(v => 
      v.id.includes('color-contrast')
    );

    return {
      hasContrastIssues: contrastViolations.length > 0,
      violations: contrastViolations,
    };
  }

  /**
   * Verifica textos alternativos de imagens
   */
  async testImageAlts() {
    const result = await this.runAccessibilityTest();
    const altViolations = result.violations.filter(v => 
      v.id === 'image-alt' || v.id === 'image-redundant-alt'
    );

    return {
      hasAltIssues: altViolations.length > 0,
      violations: altViolations,
    };
  }

  /**
   * Verifica estrutura de headings (h1-h6)
   */
  async testHeadingStructure() {
    const headings = await this.page.evaluate(() => {
      const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headingElements.map(h => ({
        level: parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim() || '',
      }));
    });

    // Verificar se começa com h1
    const hasH1 = headings.some(h => h.level === 1);
    
    // Verificar se níveis são sequenciais
    const levelJumps: string[] = [];
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i - 1].level;
      if (diff > 1) {
        levelJumps.push(
          `Pulo de h${headings[i - 1].level} para h${headings[i].level}`
        );
      }
    }

    return {
      headings,
      hasH1,
      levelJumps,
      isValid: hasH1 && levelJumps.length === 0,
    };
  }

  /**
   * Testa landmarks ARIA
   */
  async testAriaLandmarks() {
    const landmarks = await this.page.evaluate(() => {
      const landmarkElements = Array.from(document.querySelectorAll(
        '[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], [role="complementary"], [role="search"], header, nav, main, footer, aside'
      ));
      
      return landmarkElements.map(el => ({
        role: el.getAttribute('role') || el.tagName.toLowerCase(),
        hasLabel: !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')),
      }));
    });

    const hasMain = landmarks.some(l => l.role === 'main');
    const duplicates = landmarks.filter((l, i, arr) => 
      arr.filter(x => x.role === l.role).length > 1 && !l.hasLabel
    );

    return {
      landmarks,
      hasMain,
      hasDuplicatesWithoutLabels: duplicates.length > 0,
      isValid: hasMain && duplicates.length === 0,
    };
  }

  /**
   * Testa labels de formulários
   */
  async testFormLabels() {
    const result = await this.runAccessibilityTest();
    const labelViolations = result.violations.filter(v => 
      v.id === 'label' || v.id === 'label-title-only'
    );

    return {
      hasLabelIssues: labelViolations.length > 0,
      violations: labelViolations,
    };
  }

  /**
   * Gera relatório HTML de acessibilidade
   */
  async generateHtmlReport(testName: string) {
    const result = await this.runAccessibilityTest();
    
    const reportDir = path.join(process.cwd(), 'test-results', 'a11y-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `${testName}-${Date.now()}.html`);
    
    const htmlReport = createHtmlReport({
      results: {
        violations: result.violations,
        passes: [],
        incomplete: [],
        inapplicable: [],
        url: result.url,
        timestamp: result.timestamp,
      } as any,
      options: {
        projectKey: 'MAIA',
        outputDir: reportDir,
        reportFileName: path.basename(reportPath),
      },
    });

    console.log(`📊 Relatório de acessibilidade salvo em: ${reportPath}`);
    return reportPath;
  }

  /**
   * Testa com leitor de tela simulado
   */
  async simulateScreenReader(selector: string) {
    const ariaInfo = await this.page.locator(selector).evaluate(el => ({
      role: el.getAttribute('role') || el.tagName.toLowerCase(),
      label: el.getAttribute('aria-label') || 
             (el as HTMLElement).innerText?.substring(0, 50) || 
             el.getAttribute('title') ||
             'Sem texto acessível',
      describedBy: el.getAttribute('aria-describedby'),
      labelledBy: el.getAttribute('aria-labelledby'),
      expanded: el.getAttribute('aria-expanded'),
      pressed: el.getAttribute('aria-pressed'),
      checked: el.getAttribute('aria-checked'),
      disabled: el.getAttribute('aria-disabled') || (el as HTMLInputElement).disabled,
    }));

    return {
      announcement: `${ariaInfo.role}: ${ariaInfo.label}`,
      fullInfo: ariaInfo,
    };
  }
}
