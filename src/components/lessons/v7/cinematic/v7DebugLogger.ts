/**
 * v7DebugLogger - Persistent in-memory debug logger for V7 runtime auditing
 * Writes to window.__v7debugLogs instead of relying on console buffer.
 * Only active when ?debug=1 or in /admin/v7/play routes.
 */

// ============= RUNTIME CONTRACT METADATA =============
export const V7_RUNTIME_CONTRACT_VERSION = 'v7-runtime-c12.1-1.0';
export const V7_RUNTIME_CONTRACTS = [
  'C11_RUNTIME_ANCHOR_AUDIT',
  'C11_RAF_ANCHOR_TIMING',
  'C12.1_IMAGE_SEQUENCE_START',
  'C12.1_IMAGE_SEQUENCE_FRAME_RENDER',
  'C12.1_IMAGE_SEQUENCE_END',
  'C12.1_IMAGE_SEQUENCE_FALLBACK',
] as const;

export interface V7DebugLogEntry {
  t: number;
  tag: string;
  currentTime: number;
  [key: string]: any;
}

declare global {
  interface Window {
    __v7debugLogs?: V7DebugLogEntry[];
  }
}

function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') === '1') return true;
  if (window.location.pathname.includes('/admin/v7/play')) return true;
  if (import.meta.env.DEV) return true;
  return false;
}

export function pushV7DebugLog(tag: string, payload: Record<string, any>): void {
  if (!isDebugEnabled()) return;
  if (!window.__v7debugLogs) window.__v7debugLogs = [];
  const entry: V7DebugLogEntry = {
    t: Date.now(),
    tag,
    currentTime: payload.currentTime ?? -1,
    ...payload,
  };
  window.__v7debugLogs.push(entry);
  // Also mirror to console for convenience
  console.log(`[v7DebugLog] ${tag}`, entry);
}

export function getV7DebugLogs(): V7DebugLogEntry[] {
  return window.__v7debugLogs ?? [];
}

export function exportV7DebugLogs(): string {
  return JSON.stringify(getV7DebugLogs(), null, 2);
}

export function clearV7DebugLogs(): void {
  window.__v7debugLogs = [];
}
