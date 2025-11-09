import { test as base } from '@playwright/test';
import { Page } from '@playwright/test';

/**
 * Fixture de autenticação para testes E2E
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Cria uma sessão autenticada
 */
async function createAuthenticatedSession(page: Page) {
  // Navegar para página de auth
  await page.goto('/auth');
  
  // Preencher formulário de login/signup
  // NOTA: Adaptar para seu fluxo de auth específico
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  
  // Usar credenciais de teste
  const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'Test123456!';
  
  await emailInput.fill(testEmail);
  await passwordInput.fill(testPassword);
  
  // Clicar em entrar/registrar
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();
  
  // Aguardar redirecionamento para dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  // Verificar que está autenticado
  await page.waitForSelector('[data-authenticated="true"]', { timeout: 5000 });
}

/**
 * Fixture extendida com autenticação
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: fazer login
    await createAuthenticatedSession(page);
    
    // Passar page autenticada para o teste
    await use(page);
    
    // Teardown: fazer logout (opcional)
    // await page.goto('/logout');
  },
});

export { expect } from '@playwright/test';
