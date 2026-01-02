/**
 * V7 Unified Types - Re-export layer for backward compatibility
 * ==============================================================
 * 
 * This file re-exports all types from V7Contract.ts (the single source of truth)
 * and provides backward compatibility for code using the old import paths.
 * 
 * USAGE:
 * import type { V7Phase, V7AudioBehavior, V7WordTimestamp } from '@/types/v7-unified.types';
 * 
 * NOTE: For new code, prefer importing directly from '@/types/V7Contract'
 */

// ============================================================================
// RE-EXPORT EVERYTHING FROM V7Contract (Single Source of Truth)
// ============================================================================

export * from './V7Contract';

// ============================================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================================

// Alias for WordTimestamp (some code uses this without V7 prefix)
export type { V7WordTimestamp as WordTimestamp } from './V7Contract';

// Alias for AnchorAction types
export type { V7AnchorAction as AnchorAction } from './V7Contract';
export type { V7AnchorActionType as AnchorActionType } from './V7Contract';

// Alias for interaction state types (used by useV7AudioManager)
export type InteractionState =
  | 'idle'
  | 'waiting'
  | 'thinking'
  | 'stuck'
  | 'struggling'
  | 'abandoned';

export type SoundEffectType =
  | 'click'
  | 'select'
  | 'success'
  | 'error'
  | 'hint'
  | 'timeout'
  | 'whoosh'
  | 'reveal';

// ============================================================================
// LEGACY TYPE ALIASES (for v7.types.ts compatibility)
// ============================================================================

export type { V7PhaseType as V7ActType } from './V7Contract';

// ============================================================================
// ANCHOR EVENT (used by anchor detection system)
// ============================================================================

import type { V7AnchorAction, V7WordTimestamp, V7AnchorActionType } from './V7Contract';

export interface AnchorEvent {
  action: V7AnchorAction;
  timestamp: number;
  wordTimestamp: V7WordTimestamp;
}

// ============================================================================
// V7 ANCHOR POINT (global anchor points)
// Compatible with V7PhaseController's V7AnchorPoint type
// ============================================================================

export interface V7AnchorPoint {
  id: string;
  keyword: string;
  phaseId: string;
  action: 'pause' | 'show' | 'highlight' | 'trigger';  // Removed 'hide' and 'resume' for compatibility
  targetId?: string;
  once?: boolean;
}

// ============================================================================
// PIPELINE ACT (Bridge between Pipeline and Frontend)
// ============================================================================

import type { V7AudioBehavior, V7TimeoutConfig } from './V7Contract';

export interface V7PipelineAct {
  id?: string;
  type: string;
  title?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  narration?: string;
  visual?: unknown;
  audio?: unknown;
  transitions?: unknown;
  anchorPoints?: unknown[];
  interaction?: unknown;
  audioBehavior?: V7AudioBehavior;
  timeout?: V7TimeoutConfig;
  tracking?: unknown;
  content?: {
    visual?: unknown;
    audio?: { narration?: string; narrationSegment?: { text: string } };
    interaction?: unknown;
    audioBehavior?: V7AudioBehavior;
    timeout?: V7TimeoutConfig;
    [key: string]: unknown;
  };
}

// ============================================================================
// PIPELINE INPUT (Extended from V7Contract)
// ============================================================================

import type { V7ScriptInput } from './V7Contract';

export interface V7PipelineInput extends Omit<V7ScriptInput, 'scenes'> {
  narrativeScript?: string;
  duration?: number;
  trail_id?: string;
  order_index?: number;
  scenes?: V7ScriptInput['scenes'];
  audioConfig?: {
    narrationVoice?: string;
    voiceSettings?: unknown;
    backgroundMusic?: unknown;
    soundEffects?: unknown[];
  };
  anchorPoints?: V7AnchorPoint[];
  cinematic_flow?: {
    acts: V7PipelineAct[];
    timeline?: { totalDuration?: number; chapters?: unknown[] };
  };
}

// ============================================================================
// UTILITY FUNCTIONS (re-exported from V7Contract)
// ============================================================================

export { 
  normalizeTimestamp, 
  extractNarration,
  isV7Phase,
  isV7WordTimestamp,
  isQuizInteraction,
  isPlaygroundInteraction,
  isCTAInteraction 
} from './V7Contract';

// ============================================================================
// ADDITIONAL TYPE GUARDS
// ============================================================================

export function hasV7v2Format(act: V7PipelineAct): boolean {
  return !!(act.narration || act.audioBehavior || act.timeout);
}

export function hasLegacyFormat(act: V7PipelineAct): boolean {
  return !!(act.content?.audio?.narration || act.content?.audio?.narrationSegment);
}
