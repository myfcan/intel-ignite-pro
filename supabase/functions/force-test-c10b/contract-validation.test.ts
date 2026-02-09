/**
 * Contract Validation Tests for V7-VV Pipeline
 * 
 * These tests validate the immutable contracts defined in:
 * docs/contracts/v7-vv-contracts.md
 * 
 * Contract Version: c10b-boundaryfix-execstate-1.0
 * 
 * Run with: POST /force-test-c10b + SQL queries
 * Automated validation happens in the force-test orchestrator.
 * 
 * This file defines the validation logic that can be imported
 * by the force-test orchestrator to validate batch results.
 */

// ============================================================================
// CONTRACT CONSTANTS (must match docs/contracts/v7-vv-contracts.md)
// ============================================================================

export const CONTRACT_VERSION = 'c10b-boundaryfix-execstate-1.0';

export const ACTIVE_CONTRACTS = [
  'C10',
  'C10B', 
  'BOUNDARY_FIX_GUARD',
  'EXEC_STATE_CANONICAL_JSON',
] as const;

export const INTERACTIVE_SCENE_TYPES = [
  'interaction',
  'playground', 
  'secret-reveal',
] as const;

export const C10B_MAX_NARRATION_AFTER_PAUSE = 1.5; // seconds

export const MIN_PHASE_DURATION = 0.05; // 50ms
export const MIN_INTERACTIVE_DURATION = 5.0; // 5s

export const ACTIVE_ERROR_CODES = [
  'PAUSE_ANCHOR_REQUIRED',
  'PAUSE_ANCHOR_NOT_FOUND',
  'PAUSE_ANCHOR_NOT_AT_END',
  'BOUNDARY_FIX_GUARD_FAILED',
  'VALIDATION_ERROR',
  'UNSTRUCTURED_ERROR',
] as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export interface BatchValidationResult {
  batchId: string;
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  stuckCount: number;
  unstructuredCount: number;
  contractVersionPresent: boolean;
  contractsArrayPresent: boolean;
  boundaryViolations: number;
  checks: ValidationCheck[];
  overallPass: boolean;
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

/**
 * Validates output_data.meta schema for contract compliance
 */
export function validateMetaSchema(meta: any): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  
  // Check contractVersion exists
  checks.push({
    name: 'meta.contractVersion exists',
    passed: meta?.contractVersion === CONTRACT_VERSION,
    expected: CONTRACT_VERSION,
    actual: meta?.contractVersion ?? 'MISSING',
  });
  
  // Check contracts array exists and matches
  const contractsMatch = Array.isArray(meta?.contracts) && 
    ACTIVE_CONTRACTS.every(c => meta.contracts.includes(c));
  checks.push({
    name: 'meta.contracts array matches',
    passed: contractsMatch,
    expected: JSON.stringify(ACTIVE_CONTRACTS),
    actual: JSON.stringify(meta?.contracts ?? []),
  });
  
  // Check triggerContract
  checks.push({
    name: 'meta.triggerContract == anchorActions',
    passed: meta?.triggerContract === 'anchorActions',
    expected: 'anchorActions',
    actual: meta?.triggerContract ?? 'MISSING',
  });
  
  return checks;
}

/**
 * Validates boundary invariants for phases
 */
export function validateBoundaries(phases: any[]): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  let violations = 0;
  
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const duration = phase.endTime - phase.startTime;
    
    // Invariant 1: duration > 0
    if (duration <= 0) {
      violations++;
      checks.push({
        name: `boundary.duration > 0 (${phase.id})`,
        passed: false,
        expected: '> 0',
        actual: duration.toFixed(3),
      });
    }
    
    // Invariant 3: monotonicity
    if (i < phases.length - 1) {
      const next = phases[i + 1];
      if (phase.endTime > next.startTime) {
        violations++;
        checks.push({
          name: `boundary.monotonicity (${phase.id} → ${next.id})`,
          passed: false,
          expected: `endTime(${phase.endTime}) <= startTime(${next.startTime})`,
          actual: `OVERLAP by ${(phase.endTime - next.startTime).toFixed(3)}s`,
        });
      }
    }
  }
  
  checks.push({
    name: 'boundary.total_violations',
    passed: violations === 0,
    expected: '0',
    actual: String(violations),
  });
  
  return checks;
}

/**
 * Validates word timestamps are present and valid
 */
export function validateWordTimestamps(wordTimestamps: any[]): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  
  checks.push({
    name: 'wordTimestamps.count > 0',
    passed: wordTimestamps.length > 0,
    expected: '> 0',
    actual: String(wordTimestamps.length),
  });
  
  // Check schema: each entry has word, start, end
  const invalidEntries = wordTimestamps.filter(
    wt => !wt.word || wt.start === undefined || wt.end === undefined
  );
  checks.push({
    name: 'wordTimestamps.schema valid',
    passed: invalidEntries.length === 0,
    expected: '0 invalid entries',
    actual: `${invalidEntries.length} invalid entries`,
  });
  
  return checks;
}

/**
 * Validates error message format for failed runs
 */
export function validateErrorFormat(errorMessage: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  
  try {
    const parsed = JSON.parse(errorMessage);
    
    checks.push({
      name: 'error.is_valid_json',
      passed: true,
      expected: 'valid JSON',
      actual: 'valid JSON',
    });
    
    checks.push({
      name: 'error.has_error_code',
      passed: parsed.error_code != null,
      expected: 'non-null',
      actual: parsed.error_code ?? 'NULL',
    });
    
    checks.push({
      name: 'error.has_error_message',
      passed: parsed.error_message != null,
      expected: 'non-null',
      actual: parsed.error_message ? 'present' : 'NULL',
    });
    
    checks.push({
      name: 'error.has_error_details_key',
      passed: 'error_details' in parsed,
      expected: 'key exists (can be null)',
      actual: 'error_details' in parsed ? 'present' : 'MISSING',
    });
    
    // Check error_code is known
    const isKnown = ACTIVE_ERROR_CODES.includes(parsed.error_code);
    checks.push({
      name: 'error.code_is_registered',
      passed: isKnown,
      expected: `one of [${ACTIVE_ERROR_CODES.join(', ')}]`,
      actual: parsed.error_code,
    });
    
  } catch {
    checks.push({
      name: 'error.is_valid_json',
      passed: false,
      expected: 'valid JSON',
      actual: 'PARSE_FAILED',
    });
  }
  
  return checks;
}

/**
 * JSON Paths that MUST exist in output_data for completed runs
 * Breaking change if any path changes
 */
export const REQUIRED_OUTPUT_PATHS = {
  'output_data.content.phases': (od: any) => Array.isArray(od?.content?.phases),
  'output_data.content.audio.mainAudio.wordTimestamps': (od: any) => 
    Array.isArray(od?.content?.audio?.mainAudio?.wordTimestamps),
  'output_data.content.audio.mainAudio.duration': (od: any) => 
    typeof od?.content?.audio?.mainAudio?.duration === 'number',
  'output_data.meta.triggerContract': (od: any) => 
    od?.meta?.triggerContract === 'anchorActions',
  'output_data.meta.contractVersion': (od: any) => 
    typeof od?.meta?.contractVersion === 'string',
  'output_data.meta.contracts': (od: any) => 
    Array.isArray(od?.meta?.contracts),
  'output_data.lesson_id': (od: any) => 
    typeof od?.lesson_id === 'string',
};

export function validateOutputPaths(outputData: any): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  
  for (const [path, validator] of Object.entries(REQUIRED_OUTPUT_PATHS)) {
    checks.push({
      name: `path.${path}`,
      passed: validator(outputData),
      expected: 'exists and valid',
      actual: validator(outputData) ? 'OK' : 'MISSING/INVALID',
    });
  }
  
  return checks;
}
