

# A1 Closure: Persistent Debug Logger + Instrumented Events

## Context

A1 remains **OPEN**. The previous evidence was invalidated because `currentTime=118.793 > endTime=118.41`, proving the log was captured after the phase boundary -- not at true entry. Console buffer limitations also caused loss of critical transition logs.

## Problem

Two deliverables are required:
1. **Commit SHA/PR** for the `currentTime` addition and `Seek +30s` button (already in codebase via last diff)
2. **Runtime evidence** with 4 coherent events -- impossible to capture reliably via console buffer

## Solution: Persistent In-Memory Debug Logger

### New File: `src/components/lessons/v7/cinematic/v7DebugLogger.ts`

A lightweight, debug-only logger that writes to `window.__v7debugLogs` instead of relying on console buffer.

```typescript
// Structure
interface V7DebugLogEntry {
  t: number;           // Date.now()
  tag: string;         // Event tag (e.g., PLAYGROUND_ENTRY)
  currentTime: number; // audio.currentTime at moment of log
  [key: string]: any;  // Additional payload
}

// API
pushV7DebugLog(tag: string, payload: object): void
getV7DebugLogs(): V7DebugLogEntry[]
exportV7DebugLogs(): string  // JSON.stringify for copy/paste
clearV7DebugLogs(): void
```

Only active when `?debug=1` or in `/admin/v7/play` routes (same condition as Debug HUD).

### Instrumentation Points (4 mandatory events)

| # | Tag | File | Location | Payload |
|---|-----|------|----------|---------|
| 1 | `PLAYGROUND_ENTRY` | `V7PhasePlayer.tsx` line ~1576 | Where `PLAYGROUND ENTRY` console.log exists | `phaseId, startTime, endTime, currentTime, shouldPauseAudio` |
| 2 | `ANCHOR_PAUSE_EXECUTED` | `useAnchorText.ts` line ~244 | Inside `executeAction` when `action.type === 'pause'` | `phaseId, actionId, keywordTime (wordTs.end), currentTime` |
| 3 | `SHOULD_PAUSE_TRANSITION` | `V7PhasePlayground.tsx` line ~60 | Inside the `useEffect` that tracks `shouldPauseAudio` changes | `prev, current (shouldPauseAudio values), currentTime (from audioControl)` |
| 4 | `PLAYGROUND_PAUSED_AUDIO` | `V7PhasePlayground.tsx` line ~82 | Inside the `pauseAudio` function after `ctrl.pause()` | `shouldPauseAudio, currentTime (from audioControl)` |

### Export Button in Debug HUD

Add an "Export Logs" button to `V7DebugHUD.tsx` that calls `exportV7DebugLogs()` and copies the JSON to clipboard, so the full event trace can be pasted as evidence.

## Files to Create/Modify

1. **CREATE** `src/components/lessons/v7/cinematic/v7DebugLogger.ts` -- Persistent logger utility
2. **EDIT** `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx` (line ~1576) -- Add `pushV7DebugLog('PLAYGROUND_ENTRY', ...)` alongside existing console.log
3. **EDIT** `src/components/lessons/v7/cinematic/useAnchorText.ts` (line ~244) -- Add `pushV7DebugLog('ANCHOR_PAUSE_EXECUTED', ...)` inside pause case
4. **EDIT** `src/components/lessons/v7/cinematic/phases/V7PhasePlayground.tsx` (lines ~62, ~82) -- Add `pushV7DebugLog('SHOULD_PAUSE_TRANSITION', ...)` and `pushV7DebugLog('PLAYGROUND_PAUSED_AUDIO', ...)`
5. **EDIT** `src/components/lessons/v7/cinematic/V7DebugHUD.tsx` -- Add "Export Logs" button that copies `window.__v7debugLogs` as JSON

## Verification Protocol

After implementation:
1. Navigate to preview URL with `?debug=1`
2. Use `Seek +30s` button to reach ~113s
3. Let audio play through playground entry and pause anchor at ~118.410s
4. Click "Export Logs" in Debug HUD
5. Paste JSON -- it must contain 4 events with coherent, monotonically increasing `currentTime` values

## Regarding Commit SHA

Lovable does not expose git commit SHAs or PRs. The code changes are tracked by Lovable's version system. The diff from the last edit (shown in `<last-diff>`) is the auditable artifact for the `currentTime` addition and `Seek +30s` button. After this implementation, the new diff will serve as the auditable artifact for the persistent logger.

