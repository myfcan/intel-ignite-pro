/**
 * V7 Runtime Contract — E2E Audit Replay Test
 *
 * This test loads the benchmark lesson in debug mode, seeks to the playground
 * phase, waits for the anchor pause, exports window.__v7debugLogs, and validates
 * them against the C11 contract using validateV7DebugLogs().
 *
 * Lesson: 837cc44a-fb80-4949-8fff-dbb8ba66bd1a
 * Expected playground anchor keywordTime: ~118.410s
 *
 * Run: npx playwright test tests/e2e/v7-runtime-contract.spec.ts
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ============= CONFIG =============

const LESSON_ID = '837cc44a-fb80-4949-8fff-dbb8ba66bd1a';
const PLAYER_URL = `/admin/v7/play/${LESSON_ID}?debug=1`;
const EXPECTED_CONTRACT_VERSION = 'v7-runtime-c11-1.0';
const EXPECTED_CONTRACTS = ['C11_RUNTIME_ANCHOR_AUDIT', 'C11_RAF_ANCHOR_TIMING'];
const ARTIFACTS_DIR = path.resolve(__dirname, '../../artifacts');

// ============= HELPERS =============

/**
 * Authenticates via the app's login form using env vars or defaults.
 * Adapts to the actual auth flow: /auth page with email+password form.
 */
async function authenticateAdmin(page: import('@playwright/test').Page) {
  const email = process.env.ADMIN_EMAIL || process.env.TEST_USER_EMAIL;
  const password = process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing ADMIN_EMAIL/ADMIN_PASSWORD or TEST_USER_EMAIL/TEST_USER_PASSWORD env vars. ' +
      'Set them in .env or CI secrets.'
    );
  }

  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Fill email
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);

  // Fill password
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(password);

  // Submit
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();

  // Wait for redirect away from /auth
  await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });
}

// ============= TESTS =============

test.describe('V7 Runtime Contract — Audit Replay', () => {
  test.setTimeout(180_000); // 3 minutes max for audio seek + wait

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

    // Wait for player to be ready (audio loaded, HUD visible)
    const seekButton = page.locator('button:has-text("⏩ +30s")');
    await seekButton.waitFor({ state: 'visible', timeout: 30000 });

    // Click Play if not auto-playing
    // The player may need a manual play click due to browser autoplay policy
    const playButton = page.locator('button:has-text("Play"), button[aria-label="Play"]').first();
    if (await playButton.isVisible()) {
      await playButton.click();
      await page.waitForTimeout(1000);
    }

    // Seek forward 4x (+30s each = ~120s) to reach playground anchor at ~118.41s
    for (let i = 0; i < 4; i++) {
      await seekButton.click();
      // Small delay between seeks to let state propagate
      await page.waitForTimeout(500);
    }

    // Wait for the anchor pause to fire — poll the HUD or debug logs
    // We wait up to 30s for ANCHOR_PAUSE_EXECUTED to appear in logs
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

    // If anchor didn't fire via seek, try direct audio seek as fallback
    if (!anchorFired) {
      console.log('[E2E] Anchor not detected via HUD seek, trying direct audio seek to 115s');
      await page.evaluate(() => {
        const audio = document.querySelector('audio');
        if (audio) {
          audio.currentTime = 115;
          audio.play();
        }
      });
      // Wait for crossing detection
      await page.waitForFunction(
        () => {
          const logs = (window as any).__v7debugLogs as any[] | undefined;
          if (!logs) return false;
          return logs.some((e: any) => e.tag === 'ANCHOR_PAUSE_EXECUTED');
        },
        { timeout: 30000 }
      );
    }

    // Give a moment for the full causal chain to propagate
    await page.waitForTimeout(2000);

    // Extract ALL debug logs
    const rawLogs = await page.evaluate(() => {
      return JSON.stringify((window as any).__v7debugLogs ?? []);
    });

    const logs = JSON.parse(rawLogs);
    expect(logs.length).toBeGreaterThan(0);

    // ===== Save artifact =====
    if (!fs.existsSync(ARTIFACTS_DIR)) {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }
    const artifactPath = path.join(ARTIFACTS_DIR, 'v7debuglogs.json');
    fs.writeFileSync(artifactPath, JSON.stringify(logs, null, 2));
    console.log(`[E2E] ✅ Saved ${logs.length} log entries to ${artifactPath}`);

    // ===== Validate SESSION_INIT =====
    const sessionInit = logs.find((e: any) => e.tag === 'SESSION_INIT');
    expect(sessionInit).toBeDefined();
    expect(sessionInit.contractVersion).toBe(EXPECTED_CONTRACT_VERSION);

    // ===== Validate ANCHOR_PAUSE_EXECUTED exists =====
    const anchorEvents = logs.filter((e: any) => e.tag === 'ANCHOR_PAUSE_EXECUTED');
    expect(anchorEvents.length).toBeGreaterThanOrEqual(1);

    // ===== Run the official C11 validator =====
    // We import the validation logic inline since this runs in Node context
    // The validator expects the same shape as V7DebugLogEntry
    const validationResult = runC11Validation(logs);

    // Log validation details for CI visibility
    console.log('[E2E] Validation result:', JSON.stringify(validationResult, null, 2));

    // Save validation result as artifact too
    const validationPath = path.join(ARTIFACTS_DIR, 'v7-validation-result.json');
    fs.writeFileSync(validationPath, JSON.stringify(validationResult, null, 2));

    // ===== ASSERT PASS =====
    if (!validationResult.pass) {
      console.error('[E2E] ❌ Validation FAILED. Errors:');
      for (const err of validationResult.errors) {
        console.error(`  [${err.code}] ${err.message}`);
      }
    }
    expect(validationResult.pass).toBe(true);

    // Take a screenshot for the artifact
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'v7-playground-paused.png') });
  });
});

// ============= INLINE C11 VALIDATOR (Node-side) =============
// Reimplemented here to avoid import issues between ESM/CJS in Playwright.
// This MUST stay in sync with src/components/lessons/v7/cinematic/validators/validateV7DebugLogs.ts

interface ValidationError {
  code: string;
  message: string;
  evidence: Record<string, unknown>;
}

interface ValidationResult {
  pass: boolean;
  contractVersion: string;
  validatedAt: string;
  errors: ValidationError[];
}

const ANCHOR_PRECISION_THRESHOLD = 0.15;
const PAUSE_PROPAGATION_MAX_MS = 200;
const PHASE_REACTION_MAX_MS = 200;
const CONTRACT_VERSION = 'v7-runtime-c11-1.0';

const REQUIRED_TAGS = [
  'PLAYGROUND_ENTRY',
  'ANCHOR_PAUSE_EXECUTED',
  'PLAYER_PAUSE_STATE_TRUE',
  'SHOULD_PAUSE_TRANSITION',
] as const;

const PAUSE_ATTRIBUTION_TAGS = [
  'PLAYGROUND_PAUSED_AUDIO',
  'PLAYGROUND_AUDIO_ALREADY_PAUSED',
] as const;

function runC11Validation(logs: any[]): ValidationResult {
  const errors: ValidationError[] = [];

  // R2: No invalid timestamps
  const invalidTs = logs.filter((e: any) => e.currentTime === -1);
  if (invalidTs.length > 0) {
    errors.push({
      code: 'C11_INVALID_TIMESTAMP',
      message: `${invalidTs.length} event(s) with currentTime === -1`,
      evidence: { count: invalidTs.length, tags: invalidTs.map((e: any) => e.tag) },
    });
  }

  // Find interactive phases
  const phaseIds = new Set<string>();
  for (const e of logs) {
    if ((e.tag === 'ANCHOR_PAUSE_EXECUTED' || e.tag === 'PLAYGROUND_ENTRY') && e.phaseId) {
      phaseIds.add(e.phaseId);
    }
  }

  if (phaseIds.size === 0) {
    return { pass: errors.length === 0, contractVersion: CONTRACT_VERSION, validatedAt: new Date().toISOString(), errors };
  }

  for (const phaseId of phaseIds) {
    const phaseEvents = logs.filter((e: any) => e.phaseId === phaseId).sort((a: any, b: any) => a.t - b.t);

    const findFirst = (tag: string) => phaseEvents.find((e: any) => e.tag === tag) ?? null;

    // R1: Completeness
    for (const tag of REQUIRED_TAGS) {
      if (!findFirst(tag)) {
        errors.push({
          code: 'C11_MISSING_EVENT',
          message: `"${tag}" missing for phase "${phaseId}"`,
          evidence: { phaseId, missingTag: tag },
        });
      }
    }

    const hasPauseAttribution = PAUSE_ATTRIBUTION_TAGS.some(tag => findFirst(tag));
    if (!hasPauseAttribution) {
      errors.push({
        code: 'C11_MISSING_EVENT',
        message: `No pause attribution for phase "${phaseId}"`,
        evidence: { phaseId },
      });
    }

    // R3: Wallclock monotonicity
    for (let i = 1; i < phaseEvents.length; i++) {
      if (phaseEvents[i].t < phaseEvents[i - 1].t) {
        errors.push({
          code: 'C11_WALLCLOCK_NOT_MONOTONIC',
          message: `t decreased: ${phaseEvents[i - 1].tag}→${phaseEvents[i].tag}`,
          evidence: { phaseId },
        });
        break;
      }
    }

    const anchorPause = findFirst('ANCHOR_PAUSE_EXECUTED');
    const playerPause = findFirst('PLAYER_PAUSE_STATE_TRUE');
    const shouldPause = findFirst('SHOULD_PAUSE_TRANSITION');

    // R4: Causal ordering
    if (anchorPause && playerPause && shouldPause) {
      if (anchorPause.t > playerPause.t) {
        errors.push({ code: 'C11_CAUSAL_ORDER_VIOLATED', message: 'ANCHOR after PLAYER_PAUSE', evidence: { phaseId } });
      }
      if (playerPause.t > shouldPause.t) {
        errors.push({ code: 'C11_CAUSAL_ORDER_VIOLATED', message: 'PLAYER_PAUSE after SHOULD_PAUSE', evidence: { phaseId } });
      }
    }

    // R5: Transition integrity
    if (shouldPause) {
      if (shouldPause.prev !== false || shouldPause.current !== true) {
        errors.push({ code: 'C11_TRANSITION_STATE_INVALID', message: 'bad prev/current', evidence: { phaseId } });
      }
    }

    // Thresholds
    if (anchorPause) {
      const kt = anchorPause.keywordTime;
      if (kt && kt > 0) {
        const delta = Math.abs(anchorPause.currentTime - kt);
        if (delta > ANCHOR_PRECISION_THRESHOLD) {
          errors.push({ code: 'C11_ANCHOR_PRECISION_EXCEEDED', message: `delta=${delta.toFixed(3)}s`, evidence: { phaseId, delta } });
        }
      }
      if (playerPause) {
        const prop = playerPause.t - anchorPause.t;
        if (prop > PAUSE_PROPAGATION_MAX_MS) {
          errors.push({ code: 'C11_PAUSE_PROPAGATION_SLOW', message: `${prop}ms`, evidence: { phaseId, prop } });
        }
      }
      if (playerPause && shouldPause) {
        const react = shouldPause.t - playerPause.t;
        if (react > PHASE_REACTION_MAX_MS) {
          errors.push({ code: 'C11_PHASE_REACTION_SLOW', message: `${react}ms`, evidence: { phaseId, react } });
        }
      }
    }
  }

  return {
    pass: errors.length === 0,
    contractVersion: CONTRACT_VERSION,
    validatedAt: new Date().toISOString(),
    errors,
  };
}
