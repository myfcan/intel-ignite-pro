#!/usr/bin/env node
import process from 'node:process';
import { execSync } from 'node:child_process';

const LEGACY_FN = 'v7-pipeline';
const FORBIDDEN_PATTERN = String.raw`invoke\(['\"]${LEGACY_FN}['\"]\)`;
// Scope restricted to runtime code paths to avoid self-matching in guard/workflow files.
const SEARCH_PATHS = ['src', 'supabase', 'tests'];

try {
  const output = execSync(
    `git grep -nE "${FORBIDDEN_PATTERN}" -- ${SEARCH_PATHS.join(' ')}`,
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim();

  if (output.length > 0) {
    globalThis.console.error(`❌ Forbidden legacy invoke detected: invoke("${LEGACY_FN}")`);
    globalThis.console.error(output);
    process.exit(1);
  }

  globalThis.console.log(`✅ No forbidden legacy invoke("${LEGACY_FN}") usage found.`);
} catch (error) {
  const stderr = error?.stderr?.toString?.() ?? '';
  const stdout = error?.stdout?.toString?.() ?? '';

  // git grep exits with code 1 when there are no matches (expected pass)
  if (error?.status === 1 && !stdout.trim()) {
    globalThis.console.log(`✅ No forbidden legacy invoke("${LEGACY_FN}") usage found.`);
    process.exit(0);
  }

  globalThis.console.error('❌ Failed to run legacy invoke guard.');
  if (stdout.trim()) globalThis.console.error(stdout.trim());
  if (stderr.trim()) globalThis.console.error(stderr.trim());
  process.exit(2);
}
