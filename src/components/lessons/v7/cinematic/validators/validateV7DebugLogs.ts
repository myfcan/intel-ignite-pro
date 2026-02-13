/**
 * validateV7DebugLogs — Official C11 Runtime Anchor Audit Validator
 * 
 * Validates that window.__v7debugLogs contains the complete, ordered,
 * and correctly-timed event sequence required by the C11 contract.
 * 
 * Contract: docs/contracts/C11_RUNTIME_ANCHOR_AUDIT.md
 * Version: v7-runtime-c11-1.0
 */

import type { V7DebugLogEntry } from '../v7DebugLogger';

// ============= TYPES =============

export interface ValidationError {
  code: string;
  message: string;
  evidence: Record<string, unknown>;
}

export interface ValidationResult {
  pass: boolean;
  contractVersion: string;
  validatedAt: string;
  phaseResults: PhaseValidationResult[];
  errors: ValidationError[];
}

export interface PhaseValidationResult {
  phaseId: string;
  pass: boolean;
  errors: ValidationError[];
  events: {
    PLAYGROUND_ENTRY: V7DebugLogEntry | null;
    ANCHOR_PAUSE_EXECUTED: V7DebugLogEntry | null;
    PLAYER_PAUSE_STATE_TRUE: V7DebugLogEntry | null;
    SHOULD_PAUSE_TRANSITION: V7DebugLogEntry | null;
    PLAYGROUND_PAUSED_AUDIO: V7DebugLogEntry | null;
  };
}

// ============= CONSTANTS =============

export const CONTRACT_VERSION = 'v7-runtime-c11-1.0';

export const CONTRACTS = [
  'C11_RUNTIME_ANCHOR_AUDIT',
  'C11_RAF_ANCHOR_TIMING',
] as const;

/** Max allowed |currentTime - keywordTime| in seconds */
export const ANCHOR_PRECISION_THRESHOLD = 0.15;

/** Max allowed ms between ANCHOR_PAUSE_EXECUTED and PLAYER_PAUSE_STATE_TRUE */
export const PAUSE_PROPAGATION_MAX_MS = 200;

/** Max allowed ms between PLAYER_PAUSE_STATE_TRUE and SHOULD_PAUSE_TRANSITION */
export const PHASE_REACTION_MAX_MS = 200;

/** Tags that constitute a valid interactive phase audit trail */
const REQUIRED_TAGS = [
  'PLAYGROUND_ENTRY',
  'ANCHOR_PAUSE_EXECUTED',
  'PLAYER_PAUSE_STATE_TRUE',
  'SHOULD_PAUSE_TRANSITION',
] as const;

/** Final pause attribution tag (one of these must exist) */
const PAUSE_ATTRIBUTION_TAGS = [
  'PLAYGROUND_PAUSED_AUDIO',
  'PLAYGROUND_AUDIO_ALREADY_PAUSED',
] as const;

// ============= HELPERS =============

function groupByPhase(logs: V7DebugLogEntry[]): Map<string, V7DebugLogEntry[]> {
  const map = new Map<string, V7DebugLogEntry[]>();
  for (const entry of logs) {
    const phaseId = entry.phaseId as string | undefined;
    if (!phaseId) continue;
    if (!map.has(phaseId)) map.set(phaseId, []);
    map.get(phaseId)!.push(entry);
  }
  return map;
}

function findInteractivePhases(logs: V7DebugLogEntry[]): string[] {
  const phaseIds = new Set<string>();
  for (const entry of logs) {
    if (entry.tag === 'ANCHOR_PAUSE_EXECUTED' && entry.phaseId) {
      phaseIds.add(entry.phaseId as string);
    }
    // Also detect from PLAYGROUND_ENTRY
    if (entry.tag === 'PLAYGROUND_ENTRY' && entry.phaseId) {
      phaseIds.add(entry.phaseId as string);
    }
  }
  return Array.from(phaseIds);
}

function findFirst(events: V7DebugLogEntry[], tag: string): V7DebugLogEntry | null {
  return events.find(e => e.tag === tag) ?? null;
}

function findFirstPauseAttribution(events: V7DebugLogEntry[]): V7DebugLogEntry | null {
  for (const tag of PAUSE_ATTRIBUTION_TAGS) {
    const found = findFirst(events, tag);
    if (found) return found;
  }
  return null;
}

// ============= VALIDATOR =============

/**
 * Validates a complete set of V7 debug logs against the C11 contract.
 * 
 * @param logs - Array from window.__v7debugLogs
 * @returns ValidationResult with pass/fail and detailed errors
 */
export function validateV7DebugLogs(logs: V7DebugLogEntry[]): ValidationResult {
  const errors: ValidationError[] = [];
  const phaseResults: PhaseValidationResult[] = [];

  // Step 0: Global validation — no events with currentTime === -1
  const invalidTimestampEvents = logs.filter(e => e.currentTime === -1);
  if (invalidTimestampEvents.length > 0) {
    errors.push({
      code: 'C11_INVALID_TIMESTAMP',
      message: `${invalidTimestampEvents.length} event(s) have currentTime === -1`,
      evidence: {
        count: invalidTimestampEvents.length,
        tags: invalidTimestampEvents.map(e => e.tag),
        firstOccurrence: invalidTimestampEvents[0],
      },
    });
  }

  // Step 1: Identify interactive phases
  const interactivePhaseIds = findInteractivePhases(logs);

  if (interactivePhaseIds.length === 0) {
    // No interactive phases found — if the lesson has none, that's valid
    return {
      pass: errors.length === 0,
      contractVersion: CONTRACT_VERSION,
      validatedAt: new Date().toISOString(),
      phaseResults: [],
      errors,
    };
  }

  // Step 2: Group events by phase
  const grouped = groupByPhase(logs);

  // Step 3: Validate each interactive phase
  for (const phaseId of interactivePhaseIds) {
    const phaseEvents = (grouped.get(phaseId) ?? []).sort((a, b) => a.t - b.t);
    const phaseErrors: ValidationError[] = [];

    // Extract events
    const entry = findFirst(phaseEvents, 'PLAYGROUND_ENTRY');
    const anchorPause = findFirst(phaseEvents, 'ANCHOR_PAUSE_EXECUTED');
    const playerPause = findFirst(phaseEvents, 'PLAYER_PAUSE_STATE_TRUE');
    const shouldPause = findFirst(phaseEvents, 'SHOULD_PAUSE_TRANSITION');
    const pauseAttribution = findFirstPauseAttribution(phaseEvents);

    const events = {
      PLAYGROUND_ENTRY: entry,
      ANCHOR_PAUSE_EXECUTED: anchorPause,
      PLAYER_PAUSE_STATE_TRUE: playerPause,
      SHOULD_PAUSE_TRANSITION: shouldPause,
      PLAYGROUND_PAUSED_AUDIO: pauseAttribution,
    };

    // R1: Completeness — all required tags must exist
    for (const tag of REQUIRED_TAGS) {
      if (!findFirst(phaseEvents, tag)) {
        phaseErrors.push({
          code: 'C11_MISSING_EVENT',
          message: `Required event "${tag}" not found for phase "${phaseId}"`,
          evidence: { phaseId, missingTag: tag, availableTags: phaseEvents.map(e => e.tag) },
        });
      }
    }

    // Check pause attribution (one of two tags)
    if (!pauseAttribution) {
      phaseErrors.push({
        code: 'C11_MISSING_EVENT',
        message: `Neither PLAYGROUND_PAUSED_AUDIO nor PLAYGROUND_AUDIO_ALREADY_PAUSED found for phase "${phaseId}"`,
        evidence: { phaseId, expectedOneOf: [...PAUSE_ATTRIBUTION_TAGS] },
      });
    }

    // R2: No invalid timestamps (per-phase check)
    for (const event of phaseEvents) {
      if (event.currentTime === -1) {
        phaseErrors.push({
          code: 'C11_INVALID_TIMESTAMP',
          message: `Event "${event.tag}" has currentTime === -1 in phase "${phaseId}"`,
          evidence: { phaseId, tag: event.tag, t: event.t },
        });
      }
    }

    // R3: Wallclock monotonicity (t must be non-decreasing)
    for (let i = 1; i < phaseEvents.length; i++) {
      if (phaseEvents[i].t < phaseEvents[i - 1].t) {
        phaseErrors.push({
          code: 'C11_WALLCLOCK_NOT_MONOTONIC',
          message: `Wallclock t decreased: ${phaseEvents[i - 1].tag}(t=${phaseEvents[i - 1].t}) → ${phaseEvents[i].tag}(t=${phaseEvents[i].t})`,
          evidence: {
            phaseId,
            prev: { tag: phaseEvents[i - 1].tag, t: phaseEvents[i - 1].t },
            curr: { tag: phaseEvents[i].tag, t: phaseEvents[i].t },
          },
        });
        break; // Report only first violation
      }
    }

    // R4: Causal ordering (only if all events exist)
    if (anchorPause && playerPause && shouldPause) {
      if (anchorPause.t > playerPause.t) {
        phaseErrors.push({
          code: 'C11_CAUSAL_ORDER_VIOLATED',
          message: `ANCHOR_PAUSE_EXECUTED(t=${anchorPause.t}) must occur before PLAYER_PAUSE_STATE_TRUE(t=${playerPause.t})`,
          evidence: { phaseId, anchorT: anchorPause.t, playerT: playerPause.t },
        });
      }
      if (playerPause.t > shouldPause.t) {
        phaseErrors.push({
          code: 'C11_CAUSAL_ORDER_VIOLATED',
          message: `PLAYER_PAUSE_STATE_TRUE(t=${playerPause.t}) must occur before SHOULD_PAUSE_TRANSITION(t=${shouldPause.t})`,
          evidence: { phaseId, playerT: playerPause.t, shouldPauseT: shouldPause.t },
        });
      }
    }

    // R5: SHOULD_PAUSE_TRANSITION integrity
    if (shouldPause) {
      if (shouldPause.prev !== false || shouldPause.current !== true) {
        phaseErrors.push({
          code: 'C11_TRANSITION_STATE_INVALID',
          message: `SHOULD_PAUSE_TRANSITION must have prev=false, current=true. Got prev=${shouldPause.prev}, current=${shouldPause.current}`,
          evidence: { phaseId, prev: shouldPause.prev, current: shouldPause.current },
        });
      }
    }

    // Threshold checks (only if relevant events exist)
    if (anchorPause) {
      // T1: Anchor precision
      const keywordTime = anchorPause.keywordTime as number;
      if (keywordTime !== undefined && keywordTime > 0) {
        const delta = Math.abs(anchorPause.currentTime - keywordTime);
        if (delta > ANCHOR_PRECISION_THRESHOLD) {
          phaseErrors.push({
            code: 'C11_ANCHOR_PRECISION_EXCEEDED',
            message: `|currentTime(${anchorPause.currentTime.toFixed(3)}) - keywordTime(${keywordTime.toFixed(3)})| = ${delta.toFixed(3)}s > ${ANCHOR_PRECISION_THRESHOLD}s`,
            evidence: { phaseId, currentTime: anchorPause.currentTime, keywordTime, delta },
          });
        }
      }

      // T2: Pause propagation (anchor → player)
      if (playerPause) {
        const propagationMs = playerPause.t - anchorPause.t;
        if (propagationMs > PAUSE_PROPAGATION_MAX_MS) {
          phaseErrors.push({
            code: 'C11_PAUSE_PROPAGATION_SLOW',
            message: `Pause propagation: ${propagationMs}ms > ${PAUSE_PROPAGATION_MAX_MS}ms`,
            evidence: { phaseId, anchorT: anchorPause.t, playerT: playerPause.t, propagationMs },
          });
        }
      }

      // T3: Phase reaction (player → playground)
      if (playerPause && shouldPause) {
        const reactionMs = shouldPause.t - playerPause.t;
        if (reactionMs > PHASE_REACTION_MAX_MS) {
          phaseErrors.push({
            code: 'C11_PHASE_REACTION_SLOW',
            message: `Phase reaction: ${reactionMs}ms > ${PHASE_REACTION_MAX_MS}ms`,
            evidence: { phaseId, playerT: playerPause.t, shouldPauseT: shouldPause.t, reactionMs },
          });
        }
      }
    }

    phaseResults.push({
      phaseId,
      pass: phaseErrors.length === 0,
      errors: phaseErrors,
      events,
    });

    errors.push(...phaseErrors);
  }

  return {
    pass: errors.length === 0,
    contractVersion: CONTRACT_VERSION,
    validatedAt: new Date().toISOString(),
    phaseResults,
    errors,
  };
}
