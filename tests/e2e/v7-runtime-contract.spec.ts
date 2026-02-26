/**
 * V7 Runtime Contract — E2E Audit Replay Test
 *
 * Single Source of Truth: imports validateV7DebugLogs from the official validator.
 * No inline reimplementation. No audio.currentTime fallback.
 *
 * Lesson: 837cc44a-fb80-4949-8fff-dbb8ba66bd1a
 * Expected playground anchor keywordTime: ~118.410s
 *
 * Run: npm run test:e2e:v7
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { validateV7DebugLogs } from '../../src/components/lessons/v7/cinematic/validators/validateV7DebugLogs';

// ============= CONFIG =============

const LESSON_ID = '837cc44a-fb80-4949-8fff-dbb8ba66bd1a';
const PLAYER_URL = `/admin/v7/play/${LESSON_ID}?debug=1`;
const EXPECTED_CONTRACT_VERSION = 'v7-runtime-c11-1.0';
const EXPECTED_CONTRACTS = ['C11_RUNTIME_ANCHOR_AUDIT', 'C11_RAF_ANCHOR_TIMING'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIFACTS_DIR = path.resolve(__dirname, '../../artifacts');
const STORAGE_STATE_PATH = path.resolve(__dirname, '../../playwright/.auth/admin.json');

// ============= AUTH =============

/**
 * Authenticates via storageState (preferred) or login UI (fallback).
 * storageState: playwright/.auth/admin.json
 * Login UI: uses ADMIN_EMAIL/ADMIN_PASSWORD env vars.
 */
async function authenticateAdmin(page: import('@playwright/test').Page) {
  // If storageState file exists, it's already loaded via test.use() — skip login
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    return;
  }

  const email = process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL;
  const password = process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'No storageState at playwright/.auth/admin.json AND no ADMIN_EMAIL/ADMIN_PASSWORD env vars. ' +
      'Generate storageState: ADMIN_EMAIL=x ADMIN_PASSWORD=y npx playwright test tests/e2e/fixtures/generate-auth.ts --project=chromium'
    );
  }

  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(password);

  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();

  await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });
}

// ============= TESTS =============

test.describe('V7 Runtime Contract — Audit Replay', () => {
  test.setTimeout(180_000); // 3 minutes max

  // Use storageState if available
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    test.use({ storageState: STORAGE_STATE_PATH });
  }

  test('C11: SESSION_INIT emitted with correct contract metadata', async ({ page }) => {
    await authenticateAdmin(page);
    await page.goto(PLAYER_URL);
    await page.waitForLoadState('networkidle');

    // Wait for player to mount and emit SESSION_INIT
    await page.waitForTimeout(3000);

    const sessionInit = await page.evaluate(() => {
      const logs = (window as any).__v7debugLogs as any[] | undefined;
      if (!logs || logs.length === 0) return null;
      return logs.find((e: any) => e.tag === 'SESSION_INIT') ?? null;
    });

    expect(sessionInit).not.toBeNull();
    expect(sessionInit.tag).toBe('SESSION_INIT');
    expect(sessionInit.contractVersion).toBe(EXPECTED_CONTRACT_VERSION);
    expect(sessionInit.contracts).toEqual(expect.arrayContaining(EXPECTED_CONTRACTS));
  });

  test('C11: Full audit trail — seek to playground, validate anchor pause chain', async ({ page }) => {
    await authenticateAdmin(page);
    await page.goto(PLAYER_URL);
    await page.waitForLoadState('networkidle');

    // Ensure artifacts dir exists
    if (!fs.existsSync(ARTIFACTS_DIR)) {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }

    // Wait for HUD seek button to be visible (player ready)
    const seekButton = page.locator('button:has-text("⏩ +30s")');
    await seekButton.waitFor({ state: 'visible', timeout: 30000 });

    // Click Play if needed (browser autoplay policy)
    const playButton = page.locator('button:has-text("Play"), button[aria-label="Play"]').first();
    if (await playButton.isVisible()) {
      await playButton.click();
      await page.waitForTimeout(1000);
    }

    // Seek forward 4x (+30s each = ~120s) to reach playground anchor at ~118.41s
    for (let i = 0; i < 4; i++) {
      await seekButton.click();
      await page.waitForTimeout(500);
    }

    // Wait for ANCHOR_PAUSE_EXECUTED — no fallback, fail-fast
    const anchorFired = await page.waitForFunction(
      () => {
        const logs = (window as any).__v7debugLogs as any[] | undefined;
        if (!logs) return false;
        return logs.some(
          (e: any) => e.tag === 'ANCHOR_PAUSE_EXECUTED' && e.phaseId?.includes('playground')
        );
      },
      { timeout: 30000 }
    ).catch(() => null);

    // FAIL-FAST: No audio.currentTime fallback. If anchor didn't fire, save diagnostics and fail.
    if (!anchorFired) {
      const diagnosticLogs = await page.evaluate(() =>
        JSON.stringify((window as any).__v7debugLogs ?? [], null, 2)
      );
      fs.writeFileSync(
        path.join(ARTIFACTS_DIR, 'v7debuglogs-FAILED-no-anchor.json'),
        diagnosticLogs
      );
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'v7-FAILED-no-anchor.png')
      });
      throw new Error(
        'ANCHOR_PAUSE_EXECUTED not detected after 4x Seek +30s. ' +
        'HUD seek may be broken or crossing detection failed. ' +
        'Check artifacts/v7debuglogs-FAILED-no-anchor.json'
      );
    }

    // Allow full causal chain to propagate
    await page.waitForTimeout(2000);

    // Extract ALL debug logs
    const rawLogs = await page.evaluate(() => {
      return JSON.stringify((window as any).__v7debugLogs ?? []);
    });

    const logs = JSON.parse(rawLogs);
    expect(logs.length).toBeGreaterThan(0);

    // Save logs artifact
    const artifactPath = path.join(ARTIFACTS_DIR, 'v7debuglogs.json');
    fs.writeFileSync(artifactPath, JSON.stringify(logs, null, 2));
    console.log(`[E2E] ✅ Saved ${logs.length} log entries to ${artifactPath}`);

    // Validate SESSION_INIT presence
    const sessionInit = logs.find((e: any) => e.tag === 'SESSION_INIT');
    expect(sessionInit).toBeDefined();
    expect(sessionInit.contractVersion).toBe(EXPECTED_CONTRACT_VERSION);

    // Validate ANCHOR_PAUSE_EXECUTED exists
    const anchorEvents = logs.filter((e: any) => e.tag === 'ANCHOR_PAUSE_EXECUTED');
    expect(anchorEvents.length).toBeGreaterThanOrEqual(1);

    // ===== Run the OFFICIAL C11 validator — Single Source of Truth =====
    const validationResult = validateV7DebugLogs(logs);

    // Log validation details for CI visibility
    console.log('[E2E] Validation result:', JSON.stringify(validationResult, null, 2));

    // Save validation result as artifact
    const validationPath = path.join(ARTIFACTS_DIR, 'v7-validation-result.json');
    fs.writeFileSync(validationPath, JSON.stringify(validationResult, null, 2));

    // ===== SINGLE ASSERTION GATE =====
    if (!validationResult.pass) {
      console.error('[E2E] ❌ Validation FAILED. Errors:');
      for (const err of validationResult.errors) {
        console.error(`  [${err.code}] ${err.message}`);
      }
    }
    expect(validationResult.pass).toBe(true);

    // Screenshot for artifact
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'v7-playground-paused.png') });
  });
});
