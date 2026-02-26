#!/usr/bin/env node
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const FORBIDDEN_PATTERN = String.raw`invoke\(['\"]v7-pipeline['\"]\)`;
const SEARCH_PATHS = ['src', 'supabase', 'tests', 'scripts', '.github'];
const EXCLUDED_PATHS = [
  'scripts/check-no-legacy-pipeline.mjs',
  '.github/workflows/no-legacy-v7-pipeline.yml',
];

const args = [
  'grep',
  '-nE',
  FORBIDDEN_PATTERN,
  '--',
  ...SEARCH_PATHS,
  ...EXCLUDED_PATHS.map((path) => `:(exclude)${path}`),
];

const result = spawnSync('git', args, { encoding: 'utf8' });
const stdout = result.stdout?.trim() ?? '';
const stderr = result.stderr?.trim() ?? '';

if (result.status === 0 && stdout.length > 0) {
  globalThis.console.error('❌ Forbidden legacy invoke detected: invoke("v7-pipeline")');
  globalThis.console.error(stdout);
  process.exit(1);
}

if (result.status === 1 && stdout.length === 0) {
  globalThis.console.log('✅ No forbidden legacy invoke("v7-pipeline") usage found.');
  process.exit(0);
}

globalThis.console.error('❌ Failed to run legacy invoke guard.');
if (stdout) globalThis.console.error(stdout);
if (stderr) globalThis.console.error(stderr);
process.exit(2);
