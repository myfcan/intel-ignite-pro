/**
 * V7-VV CONTRACT REGISTRY — Source of Truth
 * 
 * Contract Version: c10b-boundaryfix-execstate-c11-1.0
 * Pipeline Version: v7-vv-1.1.4+
 * 
 * This file is the CANONICAL registry for all pipeline contracts.
 * Breaking changes require MAJOR version bump (1.x → 2.0).
 * 
 * Reference: docs/contracts/v7-vv-contracts.md
 */

// ============================================================================
// CONTRACT VERSION
// ============================================================================

export const CONTRACT_VERSION = 'c10b-boundaryfix-execstate-c11-1.0';

// ============================================================================
// CONTRACT STATUS TYPES
// ============================================================================

export type ContractStatus = 'required' | 'optional' | 'deprecated' | 'known_gap';

export interface ContractEntry {
  id: string;
  name: string;
  status: ContractStatus;
  description: string;
  invariants: string[];
  error_code: string | null;
  evidence_paths: string[];
  deprecated_by?: string;
  rationale?: string;
  introduced_in: string;
}

// ============================================================================
// CONTRACT REGISTRY
// ============================================================================

export const CONTRACT_REGISTRY: ContractEntry[] = [
  {
    id: 'C01',
    name: 'Idempotency',
    status: 'required',
    description: 'Every pipeline execution has a unique run_id. Duplicate run_ids return existing result.',
    invariants: [
      'run_id is a valid UUID',
      'Duplicate run_id with status=completed returns 200',
      'Duplicate run_id with status=in_progress returns 409',
      'Duplicate run_id with status=failed returns 400',
    ],
    error_code: null,
    evidence_paths: [
      'pipeline_executions.run_id',
    ],
    introduced_in: 'v7-vv-1.0.0',
  },
  {
    id: 'C02',
    name: 'Anchor Recalculation',
    status: 'required',
    description: 'Anchor keywordTime values are recalculated from wordTimestamps during reprocess.',
    invariants: [
      'Structure hash unchanged after reprocess (only timing changes)',
      'All keywordTime values within phase boundaries ± 0.30s EPS',
    ],
    error_code: null,
    evidence_paths: [
      'output_data.content.phases[].anchorActions[].keywordTime',
    ],
    introduced_in: 'v7-vv-1.0.0',
  },
  {
    id: 'C03',
    name: 'Scenes Array Population',
    status: 'known_gap',
    description: 'Output should populate scenes[] array for per-scene timing. Currently empty; Renderer uses legacy visual object fallback.',
    invariants: [],
    error_code: null,
    evidence_paths: [
      'output_data.content.scenes',
    ],
    rationale: 'Renderer currently functions via visual fallback. Populating scenes[] is deferred to a future version. Will require MINOR version bump when implemented.',
    introduced_in: 'v7-vv-1.0.0',
  },
  {
    id: 'C04',
    name: 'Phase Timeline Changes Audit',
    status: 'required',
    description: 'Phase timeline changes are tracked in lesson_migrations_audit with diff_summary.',
    invariants: [
      'Every reprocess creates a lesson_migrations_audit record',
      'diff_summary contains c04Stats with phaseTimelineChanges',
    ],
    error_code: null,
    evidence_paths: [
      'lesson_migrations_audit.diff_summary',
      'lesson_migrations_audit.run_id',
    ],
    introduced_in: 'v7-vv-1.0.0',
  },
  {
    id: 'C05',
    name: 'Traceability & Content Hash',
    status: 'required',
    description: 'Every execution persists input, output, pipeline_version, commit_hash, and SHA-256 content hash.',
    invariants: [
      'pipeline_executions.pipeline_version is never null for completed runs',
      'pipeline_executions.output_content_hash is SHA-256 of canonical content',
      'Hash computed via SQL RPC (c05_compute_content_hash) for absolute parity',
    ],
    error_code: null,
    evidence_paths: [
      'pipeline_executions.pipeline_version',
      'pipeline_executions.commit_hash',
      'pipeline_executions.output_content_hash',
      'pipeline_executions.output_data',
    ],
    introduced_in: 'v7-vv-1.0.0',
  },
  {
    id: 'C06',
    name: 'Single Trigger Contract (anchorActions)',
    status: 'required',
    description: 'All visual/interaction triggers use anchorActions exclusively. Legacy triggerTime is stripped.',
    invariants: [
      'output_data.meta.triggerContract == "anchorActions"',
      'Zero triggerTime fields in microVisuals after normalization',
      'Every microVisual has a corresponding show action in anchorActions',
    ],
    error_code: null,
    evidence_paths: [
      'output_data.meta.triggerContract',
      'output_data.content.phases[].anchorActions',
    ],
    introduced_in: 'v7-vv-1.0.0',
  },
  {
    id: 'C07',
    name: 'Pause Priority Rule (Legacy)',
    status: 'deprecated',
    description: 'DEPRECATED: Original heuristic-based pause calculation using c07OriginalTime.',
    invariants: [],
    error_code: null,
    evidence_paths: [],
    deprecated_by: 'C10',
    rationale: 'C10 Hard Pause Anchor Contract provides 100% deterministic pauses, eliminating all heuristics from C07. c07OriginalTime is no longer used.',
    introduced_in: 'v7-vv-1.0.0',
  },
  {
    id: 'C08',
    name: 'Phase Boundary Alignment & Drift Fix',
    status: 'required',
    description: 'Phase boundaries are calculated from word count. Drift remediation ensures anchors land in correct phases.',
    invariants: [
      'Phase endTime based on scene narration word count',
      'No phase captures words from adjacent scenes',
      'Global anchor search validates against final phase boundaries',
    ],
    error_code: null,
    evidence_paths: [
      'output_data.content.phases[].startTime',
      'output_data.content.phases[].endTime',
    ],
    introduced_in: 'v7-vv-1.0.0',
  },
  {
    id: 'C09',
    name: 'Pause at Last Word (Legacy)',
    status: 'deprecated',
    description: 'DEPRECATED: Pause time set to end of last word in phase narration.',
    invariants: [],
    error_code: null,
    evidence_paths: [],
    deprecated_by: 'C10',
    rationale: 'C10 Hard Pause Anchor Contract uses explicit pauseAt keyword instead of implicit last-word detection. Eliminates ambiguity and false positives.',
    introduced_in: 'v7-vv-1.1.0',
  },
  {
    id: 'C10',
    name: 'Hard Pause Anchor Contract (Deterministic)',
    status: 'required',
    description: 'Interactive phase pauses are 100% deterministic: pauseTime = END of matched pauseAt keyword.',
    invariants: [
      'scene.anchorText.pauseAt is REQUIRED for interactive phases (interaction, playground, secret-reveal)',
      'pauseTime = wordTimestamps[matchedWordIndex].end (deterministic)',
      'Search strategy: LAST_IN_RANGE within phase boundaries',
      'If keyword not found in range: global search to distinguish error codes',
      'Missing pauseAt → PAUSE_ANCHOR_REQUIRED',
      'Keyword not found → PAUSE_ANCHOR_NOT_FOUND',
    ],
    error_code: 'PAUSE_ANCHOR_REQUIRED|PAUSE_ANCHOR_NOT_FOUND',
    evidence_paths: [
      'output_data.content.phases[].anchorActions[] (type=pause)',
      'output_data.content.audio.mainAudio.wordTimestamps',
    ],
    introduced_in: 'v7-vv-1.1.0',
  },
  {
    id: 'C10B',
    name: 'Editorial Guardrail (1.5s threshold)',
    status: 'required',
    description: 'Pause anchor must occur in last 1.5s of scene narration. Prevents premature pauses.',
    invariants: [
      'narrationAfterPause = lastWordEnd - pauseTime',
      'FAIL if narrationAfterPause > 1.5 seconds',
      'lastWordEnd calculated from scene narration word count',
    ],
    error_code: 'PAUSE_ANCHOR_NOT_AT_END',
    evidence_paths: [
      'output_data.content.phases[].anchorActions[] (type=pause, keywordTime)',
    ],
    introduced_in: 'v7-vv-1.1.1',
  },
  {
    id: 'BOUNDARY_FIX_GUARD',
    name: 'Timeline Invariants Guard',
    status: 'required',
    description: 'All phases must have positive duration and monotonic ordering. Pipeline fails if violated after guard.',
    invariants: [
      'duration > 0 for every phase (min 50ms narrative, 5s interactive)',
      'endTime >= startTime + MIN_DURATION',
      'phases[i].endTime <= phases[i+1].startTime (monotonicity, no overlap)',
      'Pipeline FAILS if any invariant violated after guard passes',
    ],
    error_code: 'BOUNDARY_FIX_GUARD_FAILED',
    evidence_paths: [
      'output_data.content.phases[].startTime',
      'output_data.content.phases[].endTime',
    ],
    introduced_in: 'v7-vv-1.1.1',
  },
  {
    id: 'EXEC_STATE_CANONICAL_JSON',
    name: 'Execution State Contract',
    status: 'required',
    description: 'Every run reaches terminal state. Failed runs persist canonical JSON error.',
    invariants: [
      'No run remains in_progress after execution completes',
      'completed_at is ALWAYS populated for completed AND failed runs',
      'error_message is pure JSON: {"error_code","error_message","error_details"}',
      'error_code is NEVER null in failed runs',
      'error_details is object or null (never missing key)',
    ],
    error_code: 'CONTRACT_META_MISSING|TRIGGER_CONTRACT_MISMATCH',
    evidence_paths: [
      'pipeline_executions.status',
      'pipeline_executions.completed_at',
      'pipeline_executions.error_message',
    ],
    introduced_in: 'v7-vv-1.1.3',
  },
  {
    id: 'C11_RUNTIME_ANCHOR_AUDIT',
    name: 'Runtime Anchor Audit Trail',
    status: 'required',
    description: 'Validates complete causal event chain for interactive phase pauses in the V7 player runtime.',
    invariants: [
      'PLAYGROUND_ENTRY → ANCHOR_PAUSE_EXECUTED → PLAYER_PAUSE_STATE_TRUE → SHOULD_PAUSE_TRANSITION → PLAYGROUND_PAUSED_AUDIO',
      'All events have currentTime >= 0 (never -1)',
      'Wallclock t is monotonically non-decreasing per phase',
      '|ANCHOR_PAUSE_EXECUTED.currentTime - keywordTime| <= 0.15s',
      'PLAYER_PAUSE_STATE_TRUE.t - ANCHOR_PAUSE_EXECUTED.t <= 200ms',
      'SHOULD_PAUSE_TRANSITION.t - PLAYER_PAUSE_STATE_TRUE.t <= 200ms',
    ],
    error_code: 'C11_MISSING_EVENT|C11_INVALID_TIMESTAMP|C11_CAUSAL_ORDER_VIOLATED|C11_ANCHOR_PRECISION_EXCEEDED',
    evidence_paths: [
      'window.__v7debugLogs',
    ],
    introduced_in: 'v7-vv-1.1.4-c11',
  },
  {
    id: 'C11_RAF_ANCHOR_TIMING',
    name: 'RAF-based Anchor Crossing Detection',
    status: 'required',
    description: 'Mandates requestAnimationFrame polling for anchor crossing detection, replacing timeupdate (~250ms) with ~16ms precision.',
    invariants: [
      'Crossing detection uses RAF polling (not timeupdate event)',
      'Crossing detected within 2 frames (<=32ms) of keywordTime',
      'No audio bleed past anchor point',
    ],
    error_code: null,
    evidence_paths: [
      'useV7AudioManager.ts RAF loop',
      'window.__v7debugLogs ANCHOR_PAUSE_EXECUTED timing',
    ],
    introduced_in: 'v7-vv-1.1.4-c11',
  },
];

// ============================================================================
// REQUIRED CONTRACTS (for enforcement)
// ============================================================================

export const REQUIRED_CONTRACTS = CONTRACT_REGISTRY
  .filter(c => c.status === 'required')
  .map(c => c.id);

export const ACTIVE_CONTRACTS_LIST = CONTRACT_REGISTRY
  .filter(c => c.status === 'required')
  .map(c => c.id);

// ============================================================================
// ERROR CODES REGISTRY
// ============================================================================

export interface ErrorCodeEntry {
  code: string;
  http_status: number;
  category: string;
  description: string;
  contract_id: string;
  status: 'active' | 'reserved';
}

export const ERROR_CODES_REGISTRY: ErrorCodeEntry[] = [
  // Active codes
  { code: 'PAUSE_ANCHOR_REQUIRED', http_status: 400, category: 'C10', description: 'Interactive scene missing anchorText.pauseAt', contract_id: 'C10', status: 'active' },
  { code: 'PAUSE_ANCHOR_NOT_FOUND', http_status: 400, category: 'C10', description: 'pauseAt keyword not found in audio', contract_id: 'C10', status: 'active' },
  { code: 'PAUSE_ANCHOR_NOT_AT_END', http_status: 400, category: 'C10B', description: 'pauseAt found but >1.5s before narration end', contract_id: 'C10B', status: 'active' },
  { code: 'BOUNDARY_FIX_GUARD_FAILED', http_status: 500, category: 'Boundary', description: 'Phase duration ≤ 0 after guard correction', contract_id: 'BOUNDARY_FIX_GUARD', status: 'active' },
  { code: 'VALIDATION_ERROR', http_status: 400, category: 'Input', description: 'Input JSON validation failed', contract_id: 'C01', status: 'active' },
  { code: 'UNSTRUCTURED_ERROR', http_status: 500, category: 'System', description: 'Unexpected error (legacy or unhandled)', contract_id: 'EXEC_STATE_CANONICAL_JSON', status: 'active' },
  // New enforcement codes
  { code: 'CONTRACT_META_MISSING', http_status: 500, category: 'Enforcement', description: 'contractVersion or contracts array missing from output_data.meta', contract_id: 'EXEC_STATE_CANONICAL_JSON', status: 'active' },
  { code: 'TRIGGER_CONTRACT_MISMATCH', http_status: 500, category: 'Enforcement', description: 'triggerContract != anchorActions', contract_id: 'C06', status: 'active' },
  // Reserved codes
  { code: 'AUDIO_GENERATION_FAILED', http_status: 500, category: 'Audio', description: 'TTS provider error', contract_id: 'C05', status: 'reserved' },
  { code: 'CONTENT_SIZE_EXCEEDED', http_status: 500, category: 'System', description: 'Output > 5MB limit', contract_id: 'C05', status: 'reserved' },
  { code: 'HASH_MISMATCH', http_status: 500, category: 'C05', description: 'Content hash verification failed', contract_id: 'C05', status: 'reserved' },
];

// ============================================================================
// CONSTANTS
// ============================================================================

export const C10B_MAX_NARRATION_AFTER_PAUSE = 1.5; // seconds
export const MIN_PHASE_DURATION = 0.05; // 50ms
export const MIN_INTERACTIVE_DURATION = 5.0; // 5s
export const ANCHOR_EPS = 0.30; // 300ms tolerance

export const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground', 'secret-reveal'] as const;
export const INTERACTIVE_PHASE_TYPES = ['interaction', 'playground', 'secret-reveal', 'cta', 'gamification', 'quiz'] as const;

// ============================================================================
// EVIDENCE PATHS (JSON paths that MUST exist in output_data for completed runs)
// ============================================================================

export const REQUIRED_OUTPUT_PATHS: Record<string, (od: any) => boolean> = {
  'output_data.content.phases': (od: any) => Array.isArray(od?.content?.phases),
  'output_data.content.audio.mainAudio.wordTimestamps': (od: any) =>
    Array.isArray(od?.content?.audio?.mainAudio?.wordTimestamps),
  'output_data.content.audio.mainAudio.duration': (od: any) =>
    typeof od?.content?.audio?.mainAudio?.duration === 'number',
  'output_data.meta.triggerContract': (od: any) =>
    od?.meta?.triggerContract === 'anchorActions',
  'output_data.meta.contractVersion': (od: any) =>
    od?.meta?.contractVersion === CONTRACT_VERSION,
  'output_data.meta.contracts': (od: any) =>
    Array.isArray(od?.meta?.contracts),
  'output_data.lesson_id': (od: any) =>
    typeof od?.lesson_id === 'string',
};

// ============================================================================
// ENFORCEMENT: Validate output_data.meta before persist
// ============================================================================

export interface EnforcementResult {
  pass: boolean;
  violations: string[];
  error_code?: string;
}

/**
 * Validates that output_data.meta contains required contract metadata.
 * Called BEFORE persisting output_data.
 * Returns error_code if enforcement fails.
 */
export function enforceContractMeta(meta: any): EnforcementResult {
  const violations: string[] = [];

  if (!meta?.contractVersion || meta.contractVersion !== CONTRACT_VERSION) {
    violations.push(`contractVersion missing or mismatch: expected=${CONTRACT_VERSION}, got=${meta?.contractVersion}`);
  }

  if (!Array.isArray(meta?.contracts) || meta.contracts.length === 0) {
    violations.push('contracts array missing or empty');
  }

  if (violations.length > 0) {
    return {
      pass: false,
      violations,
      error_code: 'CONTRACT_META_MISSING',
    };
  }

  if (meta?.triggerContract !== 'anchorActions') {
    return {
      pass: false,
      violations: [`triggerContract mismatch: expected=anchorActions, got=${meta?.triggerContract}`],
      error_code: 'TRIGGER_CONTRACT_MISMATCH',
    };
  }

  return { pass: true, violations: [] };
}

/**
 * Validates boundary invariants on phases array.
 * Returns violations list (empty = pass).
 */
export function enforceBoundaryInvariants(phases: any[]): EnforcementResult {
  const violations: string[] = [];

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const duration = phase.endTime - phase.startTime;

    if (duration <= 0) {
      violations.push(`${phase.id}: duration=${duration.toFixed(3)}s <= 0`);
    }

    if (i < phases.length - 1) {
      const next = phases[i + 1];
      if (phase.endTime > next.startTime) {
        violations.push(`${phase.id} → ${next.id}: overlap by ${(phase.endTime - next.startTime).toFixed(3)}s`);
      }
    }
  }

  return {
    pass: violations.length === 0,
    violations,
    error_code: violations.length > 0 ? 'BOUNDARY_FIX_GUARD_FAILED' : undefined,
  };
}
