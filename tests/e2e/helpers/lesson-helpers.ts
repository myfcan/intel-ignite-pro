import { Page, expect } from '@playwright/test';

/**
 * Helper functions para testes de aulas
 */

export class LessonTestHelpers {
  constructor(private page: Page) {}

  /**
   * Navega para uma aula específica
   */
  async navigateToLesson(lessonId: string) {
    await this.page.goto(`/lessons-interactive/${lessonId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Aguarda o áudio carregar
   */
  async waitForAudioLoad(timeout = 15000) {
    await this.page.waitForSelector('audio', { timeout });
    
    // Aguardar metadata do áudio carregar
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const audio = document.querySelector('audio');
        if (!audio) throw new Error('Audio element not found');
        
        if (audio.readyState >= 2) {
          resolve(true);
        } else {
          audio.addEventListener('loadedmetadata', () => resolve(true), { once: true });
        }
      });
    });
  }

  /**
   * Verifica se seção atual está correta
   */
  async verifyCurrentSection(expectedSectionIndex: number) {
    const currentSection = await this.page.locator('[data-testid="guided-lesson"]').getAttribute('data-current-section');
    expect(parseInt(currentSection || '0')).toBe(expectedSectionIndex);
  }

  /**
   * Verifica fase atual da aula
   */
  async verifyCurrentPhase(expectedPhase: string) {
    const currentPhase = await this.page.locator('[data-testid="guided-lesson"]').getAttribute('data-current-phase');
    expect(currentPhase).toBe(expectedPhase);
  }

  /**
   * Avança o áudio para um tempo específico
   */
  async seekAudio(timeInSeconds: number) {
    await this.page.evaluate((time) => {
      const audio = document.querySelector('audio') as HTMLAudioElement;
      if (!audio) throw new Error('Audio element not found');
      audio.currentTime = time;
    }, timeInSeconds);

    // Aguardar um pouco para sincronização processar
    await this.page.waitForTimeout(200);
  }

  /**
   * Play do áudio
   */
  async playAudio() {
    await this.page.evaluate(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement;
      if (!audio) throw new Error('Audio element not found');
      return audio.play();
    });
  }

  /**
   * Pause do áudio
   */
  async pauseAudio() {
    await this.page.evaluate(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement;
      if (!audio) throw new Error('Audio element not found');
      audio.pause();
    });
  }

  /**
   * Obtém tempo atual do áudio
   */
  async getCurrentAudioTime(): Promise<number> {
    return await this.page.evaluate(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement;
      if (!audio) throw new Error('Audio element not found');
      return audio.currentTime;
    });
  }

  /**
   * Obtém duração do áudio
   */
  async getAudioDuration(): Promise<number> {
    return await this.page.evaluate(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement;
      if (!audio) throw new Error('Audio element not found');
      return audio.duration;
    });
  }

  /**
   * Verifica se playground está visível
   */
  async isPlaygroundVisible(): Promise<boolean> {
    return await this.page.locator('[data-testid="playground-call"]').isVisible().catch(() => false);
  }

  /**
   * Clica no botão de continuar do playground
   */
  async continueFromPlayground() {
    const continueBtn = this.page.locator('button:has-text("Continuar")');
    await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
    await continueBtn.click();
  }

  /**
   * Verifica se exercícios estão visíveis
   */
  async areExercisesVisible(): Promise<boolean> {
    return await this.page.locator('[data-testid="exercises-section"]').isVisible().catch(() => false);
  }

  /**
   * Responde um exercício de múltipla escolha
   */
  async answerMultipleChoice(exerciseIndex: number, optionIndex: number) {
    const exercise = this.page.locator(`[data-exercise-index="${exerciseIndex}"]`);
    const option = exercise.locator(`[data-option-index="${optionIndex}"]`);
    await option.click();
  }

  /**
   * Responde um exercício verdadeiro/falso
   */
  async answerTrueFalse(exerciseIndex: number, answer: boolean) {
    const exercise = this.page.locator(`[data-exercise-index="${exerciseIndex}"]`);
    const button = answer 
      ? exercise.locator('button:has-text("Verdadeiro")')
      : exercise.locator('button:has-text("Falso")');
    await button.click();
  }

  /**
   * Preenche resposta de texto
   */
  async fillTextAnswer(exerciseIndex: number, answer: string) {
    const exercise = this.page.locator(`[data-exercise-index="${exerciseIndex}"]`);
    const input = exercise.locator('input, textarea');
    await input.fill(answer);
  }

  /**
   * Submete todos os exercícios
   */
  async submitExercises() {
    const submitBtn = this.page.locator('button:has-text("Finalizar")');
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.click();
  }

  /**
   * Verifica se tela de conclusão está visível
   */
  async isConclusionVisible(): Promise<boolean> {
    return await this.page.locator('[data-testid="conclusion-screen"]').isVisible().catch(() => false);
  }

  /**
   * Aguarda transição de fase
   */
  async waitForPhaseTransition(fromPhase: string, toPhase: string, timeout = 10000) {
    await this.page.waitForFunction(
      ({ from, to }) => {
        const element = document.querySelector('[data-current-phase]');
        if (!element) return false;
        const currentPhase = element.getAttribute('data-current-phase');
        return currentPhase === to;
      },
      { fromPhase, toPhase },
      { timeout }
    );
  }

  /**
   * Verifica sincronização de seção com tolerância
   */
  async verifySectionSyncWithTolerance(
    audioTime: number, 
    expectedSection: number, 
    toleranceSeconds = 1
  ) {
    await this.seekAudio(audioTime);
    
    // Aguardar sincronização processar
    await this.page.waitForTimeout(300);
    
    const currentSection = await this.page.locator('[data-testid="guided-lesson"]').getAttribute('data-current-section');
    expect(parseInt(currentSection || '0')).toBe(expectedSection);
  }

  /**
   * Mede latência de sincronização
   */
  async measureSyncLatency(audioTime: number): Promise<number> {
    const startTime = Date.now();
    await this.seekAudio(audioTime);
    
    // Aguardar até atributo data-section-updated estar presente
    await this.page.waitForSelector('[data-section-updated="true"]', { timeout: 2000 });
    
    return Date.now() - startTime;
  }

  /**
   * Captura diagnostic logs da página
   */
  async getDiagnosticLogs() {
    return await this.page.evaluate(() => {
      // Assumindo que diagnostic logs são salvos em localStorage ou variável global
      return (window as any).__diagnosticLogs || [];
    });
  }

  /**
   * Espera por toast de sucesso
   */
  async waitForSuccessToast(message?: string) {
    const toast = message 
      ? this.page.locator(`[role="status"]:has-text("${message}")`)
      : this.page.locator('[role="status"]');
    
    await toast.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Verifica se há erros no console
   */
  async getConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }
}
