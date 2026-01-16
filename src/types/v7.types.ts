/**
 * V7 Types - DEPRECATED
 * ======================
 * 
 * @deprecated This file is maintained for backward compatibility only.
 * All types have been moved to V7Contract.ts which is the single source of truth.
 * 
 * Please update your imports to use:
 * import type { ... } from '@/types/V7Contract';
 * 
 * Or use the compatibility layer:
 * import type { ... } from '@/types/v7-unified.types';
 */

// Re-export everything from V7Contract for backward compatibility
export * from './V7Contract';

// Legacy default exports
export { DEFAULT_TIMEOUT_CONFIG, DEFAULT_AUDIO_BEHAVIORS } from './V7Contract';
