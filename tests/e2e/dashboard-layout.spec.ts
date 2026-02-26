import { test, expect } from '@playwright/test';

/**
 * Smoke tests para prevenir regressão do layout do Dashboard.
 * Garante que o layout ativo é o correto e que sessão expirada redireciona com motivo.
 */

test.describe('Dashboard Layout Anti-Regression', () => {
  
  test('dashboard sem sessão redireciona para /auth com reason=session_missing', async ({ page }) => {
    // Acessa /dashboard sem estar logado
    await page.goto('/dashboard');
    
    // Deve redirecionar para /auth com reason
    await page.waitForURL('**/auth?reason=session_missing**', { timeout: 15000 });
    
    const url = new URL(page.url());
    expect(url.pathname).toBe('/auth');
    expect(url.searchParams.get('reason')).toBe('session_missing');
    expect(url.searchParams.get('redirect')).toBe('/dashboard');
    
    // Deve mostrar mensagem de sessão expirada
    const alert = page.locator('text=Sua sessão expirou');
    await expect(alert).toBeVisible({ timeout: 5000 });
  });

  test('auth page mostra alerta quando reason=session_missing', async ({ page }) => {
    await page.goto('/auth?reason=session_missing&redirect=/dashboard');
    
    const alert = page.locator('text=Sua sessão expirou');
    await expect(alert).toBeVisible({ timeout: 5000 });
  });

  test('auth page mostra alerta quando reason=error', async ({ page }) => {
    await page.goto('/auth?reason=error&redirect=/dashboard');
    
    const alert = page.locator('text=Ocorreu um erro ao carregar seus dados');
    await expect(alert).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Dashboard Layout ID (autenticado)', () => {
  // NOTA: Este teste requer sessão autenticada.
  // Use credenciais de teste via env vars TEST_USER_EMAIL/TEST_USER_PASSWORD.
  
  test.skip('dashboard autenticado possui data-layout-id correto', async ({ page }) => {
    // Esse teste deve ser habilitado quando credenciais de teste estiverem disponíveis
    // Verifica presença do layout ID no DOM
    const layoutEl = page.locator('[data-layout-id="dashboard_v2026_02_25"]');
    await expect(layoutEl).toBeVisible();
    
    // Verifica texto do layout novo
    await expect(page.locator('text=Pronto para aprender?')).toBeVisible();
    
    // Verifica AUSÊNCIA de textos do layout antigo
    await expect(page.locator('text=Comece sua jornada de aprendizado em Inteligência Artificial')).not.toBeVisible();
  });
});
