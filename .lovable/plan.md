

# Plan: Fix V7 E2E Contract to Single Source of Truth

## Problem Summary

Four technical issues in the current E2E/CI setup:

1. **Inline validator drift** -- `tests/e2e/v7-runtime-contract.spec.ts` lines 199-346 contain a full reimplementation of `validateV7DebugLogs`, duplicating the official validator at `src/components/lessons/v7/cinematic/validators/validateV7DebugLogs.ts`.
2. **Dangerous audio fallback** -- Lines 124-143 set `audio.currentTime = 115` directly, masking HUD/seek/RAF bugs.
3. **Toolchain mismatch** -- Workflow uses `bun`/`bunx` but the project is an `npm`-based Vite project (no `bun.lockb` exists).
4. **Auth fragility** -- Login via UI selectors in CI is flaky; no `storageState` support.

## Files to Modify

| File | Action |
|---|---|
| `tests/e2e/v7-runtime-contract.spec.ts` | Rewrite: import official validator, remove inline copy, remove audio fallback, add storageState support |
| `.github/workflows/v7-runtime-contract.yml` | Rewrite: replace bun with npm, use package.json scripts |
| `package.json` | Add scripts: `test:unit`, `test:e2e:v7` |
| `tests/e2e/fixtures/auth.ts` | Update: add storageState generation setup |

No new files created. No new dependencies.

## Technical Details

### 1. E2E Spec -- Import Official Validator

The official validator at `src/components/lessons/v7/cinematic/validators/validateV7DebugLogs.ts` imports only:

```typescript
import type { V7DebugLogEntry } from '../v7DebugLogger';
```

This is a **type-only** import. The `V7DebugLogEntry` interface has no runtime browser dependencies. The validator function itself uses zero browser APIs (`window`, `document`, `import.meta` are absent). Therefore Playwright (Node context) can import it directly.

The spec will change from:

```typescript
// BEFORE (line 176): calls local reimplementation
const validationResult = runC11Validation(logs);
```

To:

```typescript
// AFTER: imports the official validator
import { validateV7DebugLogs } from '../../src/components/lessons/v7/cinematic/validators/validateV7DebugLogs';
// ...
const validationResult = validateV7DebugLogs(logs);
```

Lines 199-346 (the entire inline `runC11Validation` function + types) will be deleted.

Result: **1 contract, 1 source of truth.**

### 2. Remove Dangerous Audio Fallback

Current code (lines 124-143):

```typescript
if (!anchorFired) {
  await page.evaluate(() => {
    const audio = document.querySelector('audio');
    if (audio) {
      audio.currentTime = 115;
      audio.play();
    }
  });
  // ...
}
```

This will be replaced with a **fail-fast** assertion:

```typescript
if (!anchorFired) {
  // Save diagnostic artifact before failing
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
```

### 3. Standardize Toolchain to npm

Current workflow uses `oven-sh/setup-bun` and `bunx`. The project has `package-lock.json` (npm), no `bun.lockb`.

Changes in `.github/workflows/v7-runtime-contract.yml`:

- Replace `oven-sh/setup-bun` with `actions/setup-node@v4` (Node 20)
- Replace `bun install --frozen-lockfile` with `npm ci`
- Replace `bunx vitest run` with `npm run test:unit`
- Replace `bunx playwright test` with `npm run test:e2e:v7`
- Replace `bun run dev` with `npm run dev`

### 4. Authentication -- storageState with Fallback

The spec will support two auth strategies:

1. **storageState** (preferred): If `playwright/.auth/admin.json` exists, use it via Playwright's `storageState` option. No login UI interaction needed.
2. **Login UI** (CI fallback): If no storageState file, authenticate via `/auth` form using `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars, with stable selectors (`input[type="email"]`, `input[type="password"]`, `button[type="submit"]`).

Local storageState generation command:

```bash
# Generate auth state locally (one-time)
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpass \
  npx playwright test tests/e2e/fixtures/generate-auth.ts --project=chromium
```

A small setup script `tests/e2e/fixtures/generate-auth.ts` will be created to run the login flow once and save the state to `playwright/.auth/admin.json`.

### 5. Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:unit": "vitest run --reporter=verbose",
    "test:e2e:v7": "npx playwright test tests/e2e/v7-runtime-contract.spec.ts --project=chromium"
  }
}
```

### Acceptance Checklist

After implementation, these conditions must hold:

- [ ] `tests/e2e/v7-runtime-contract.spec.ts` contains zero validation logic -- it imports `validateV7DebugLogs` from the official path
- [ ] No `audio.currentTime =` assignment exists in the spec
- [ ] `.github/workflows/v7-runtime-contract.yml` contains zero references to `bun`, `bunx`, or `oven-sh`
- [ ] `npm run test:unit` runs all Vitest tests
- [ ] `npm run test:e2e:v7` runs the Playwright audit replay
- [ ] E2E produces `artifacts/v7debuglogs.json` with `SESSION_INIT` as first event
- [ ] `validateV7DebugLogs(logs).pass === true` is the single assertion gate
- [ ] CI gate fails the PR if any step fails and uploads artifacts regardless

### Local Execution

```bash
# Unit tests
npm run test:unit

# E2E (requires dev server running or uses webServer config)
npm run test:e2e:v7

# Generate auth state (one-time)
ADMIN_EMAIL=x ADMIN_PASSWORD=y npx playwright test tests/e2e/fixtures/generate-auth.ts --project=chromium
```

