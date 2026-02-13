# C11 — RAF Anchor Timing Contract

> **Contract Version**: `v7-runtime-c11-1.0`
> **Applies To**: V7 Renderer (useV7AudioManager.ts, useAnchorText.ts)
> **Last Updated**: 2026-02-13
> **Status**: ACTIVE — Breaking changes require MAJOR version bump

---

## 1. Purpose

C11_RAF_ANCHOR_TIMING guarantees that the V7 audio polling system uses
`requestAnimationFrame` (RAF) instead of the browser's native `timeupdate` event
for anchor crossing detection. This eliminates the ~250ms latency inherent in
`timeupdate`, ensuring pause actions fire within **2 animation frames** (~32ms)
of the actual crossing point.

---

## 2. Architecture

### Problem (Pre-C11)

The browser's `HTMLAudioElement.timeupdate` fires approximately every 250ms.
When a pause anchor is at `t=48.123s` and the previous `timeupdate` was at `t=47.900s`,
the next `timeupdate` may report `t=48.200s` — causing up to **300ms of audio overshoot**
("bleed") past the intended pause point.

### Solution (C11)

```
┌──────────────────────────────────────────────────┐
│  requestAnimationFrame Loop (~16ms per tick)      │
│                                                   │
│  tick() {                                         │
│    currentTime = audio.currentTime                │
│    setCurrentTime(currentTime)  // → React state  │
│    onTimeUpdate(currentTime)    // → callback      │
│    rafId = requestAnimationFrame(tick)             │
│  }                                                │
│                                                   │
│  Starts on: audio 'play' event                    │
│  Stops on:  audio 'pause' | 'ended' event         │
└──────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│  useAnchorText — Crossing Detection               │
│                                                   │
│  if (prevTime < triggerPoint && currTime >= triggerPoint) │
│    → executeAction(pause)                         │
│    → audio.pause()                                │
│    → seekTo(keywordTime)                          │
│                                                   │
│  preemptiveMs = 0 (C10: zero anticipation)        │
└──────────────────────────────────────────────────┘
```

---

## 3. Invariants

### I1: RAF Polling Active During Playback

When `audio.paused === false`, a `requestAnimationFrame` loop MUST be running
that updates `currentTime` state at ≥30Hz (≤33ms interval).

### I2: RAF Stops on Pause/End

When `audio.paused === true` or `audio.ended === true`, the RAF loop MUST be
cancelled via `cancelAnimationFrame`.

### I3: Crossing Detection Precision

The crossing detector (`hasCrossedTrigger`) MUST detect the trigger within
**2 RAF frames** of the actual crossing point:

```
maxDetectionLatency = 2 × (1000 / 60) = 33.33ms
```

### I4: Fallback Safety Net

The native `timeupdate` listener MUST remain attached but ONLY update state
when the RAF loop is NOT running (`rafIdRef.current === null`). This prevents
regressions in edge cases where RAF fails silently.

### I5: Zero Preemption (C10 Compliance)

For pause actions, `preemptiveMs = 0`. The trigger fires at the EXACT `keywordTime`
(end of word), not before. Combined with seek-back on pause, this guarantees
zero audio bleed.

---

## 4. Validation Criteria

### For Unit Tests

| Test | Assertion | Max Latency |
|------|-----------|-------------|
| RAF tick frequency | `avgInterval <= 33ms` | 33ms |
| Crossing detection | `pause fires within 2 frames of keywordTime` | 32ms |
| RAF cleanup | `rafId === null after pause()` | immediate |
| Fallback isolation | `timeupdate does NOT update state while RAF runs` | N/A |

### For Integration Tests (via debug logs)

| Metric | Formula | Threshold |
|--------|---------|-----------|
| Anchor overshoot | `ANCHOR_PAUSE_EXECUTED.currentTime - keywordTime` | ≤ 0.15s |
| Total pause latency | `PLAYGROUND_PAUSED_AUDIO.t - ANCHOR_PAUSE_EXECUTED.t` | ≤ 400ms |

---

## 5. Examples

### PASS — RAF Detection

```
Audio playing at 60fps RAF polling:
  tick@47.990s → no crossing
  tick@48.006s → no crossing  
  tick@48.023s → no crossing
  tick@48.040s → no crossing
  tick@48.056s → no crossing
  tick@48.073s → no crossing
  tick@48.090s → no crossing
  tick@48.106s → no crossing
  tick@48.123s → CROSSED (prevTime=48.106 < 48.123 <= currTime=48.123)
  → audio.pause() called
  → seekTo(48.123)

Overshoot: 0.000s ✅
```

### FAIL — Fallback-Only (timeupdate)

```
Audio playing with only timeupdate (~250ms):
  timeupdate@47.900s → no crossing
  timeupdate@48.150s → CROSSED (but overshoot = 48.150 - 48.123 = 0.027s)
  
  Worst case: 48.400s → overshoot = 0.277s > 0.15s ❌
```

---

## 6. Implementation Files

| Component | File Path | Key Function |
|-----------|-----------|--------------|
| RAF Polling | `src/components/lessons/v7/cinematic/useV7AudioManager.ts` | `startRafPolling()` / `stopRafPolling()` |
| Crossing Detection | `src/components/lessons/v7/cinematic/useAnchorText.ts` | `hasCrossedTrigger()` |
| Seek-Back | `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx` | `onPause` callback |
| Unit Tests | `src/components/lessons/v7/cinematic/validators/crossingDetector.test.ts` |
| This Spec | `docs/contracts/C11_RAF_ANCHOR_TIMING.md` |

---

## 7. Error Codes

| Code | Severity | Description |
|------|----------|-------------|
| `C11_RAF_NOT_ACTIVE` | ERROR | RAF loop not running during audio playback |
| `C11_RAF_LEAK` | ERROR | RAF loop still running after audio pause/end |
| `C11_CROSSING_LATENCY_EXCEEDED` | ERROR | Crossing detected >33ms after actual crossing |
| `C11_TIMEUPDATE_OVERRIDE` | WARN | `timeupdate` updated state while RAF was active |
