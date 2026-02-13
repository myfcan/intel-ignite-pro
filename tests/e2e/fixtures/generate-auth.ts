/**
 * Generate storageState for Playwright E2E tests.
 *
 * Usage:
 *   ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpass \
 *     npx playwright test tests/e2e/fixtures/generate-auth.ts --project=chromium
 *
 * Output: playwright/.auth/admin.json
 */
import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '../../../playwright/.auth/admin.json');

setup('generate admin storageState', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env vars are required.');
  }

  // Ensure output dir exists
  const dir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Login flow
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(password);

  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();

  // Wait for redirect away from /auth (successful login)
  await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });

  // Save storage state
  await page.context().storageState({ path: AUTH_FILE });

  console.log(`[Auth] ✅ storageState saved to ${AUTH_FILE}`);
});
