# C11 — Runtime Anchor Audit Contract

> **Contract Version**: `v7-runtime-c11-1.0`
> **Applies To**: V7 Renderer (V7PhasePlayer.tsx, useAnchorText.ts, V7PhasePlayground.tsx)
> **Last Updated**: 2026-02-13
> **Status**: ACTIVE — Breaking changes require MAJOR version bump

---

## 1. Purpose

C11_RUNTIME_ANCHOR_AUDIT ensures that every interactive phase (playground, quiz, interaction)
produces a **complete, ordered, and auditable** sequence of debug events in `window.__v7debugLogs`.
This contract enables automated regression testing by validating the causal chain from
anchor detection → player pause state → phase reaction.

---

## 2. Mandatory Event Sequence (per interactive phase)

For any phase of type `playground`, `interaction`, or `quiz`, the following events
MUST appear in `window.__v7debugLogs` in **strict wallclock order** (`t` ascending):

| # | Tag | Source | Required Fields |
|---|-----|--------|-----------------|
| 1 | `PLAYGROUND_ENTRY` | V7PhasePlayer.tsx | `phaseId`, `currentTime` (≥0), `inPhase` (true on first entry), `shouldPauseAudio` |
| 2 | `ANCHOR_PAUSE_EXECUTED` | useAnchorText.ts | `phaseId`, `actionId`, `keywordTime` (>0), `currentTime` (≥0) |
| 3 | `PLAYER_PAUSE_STATE_TRUE` | V7PhasePlayer.tsx | `phaseId`, `isPausedByAnchor` (true), `shouldPauseAudio` (true), `currentTime` (≥0) |
| 4 | `SHOULD_PAUSE_TRANSITION` | V7PhasePlayground.tsx | `prev` (false), `current` (true), `currentTime` (≥0), `audioIsPlaying` |
| 5 | `PLAYGROUND_PAUSED_AUDIO` **or** `PLAYGROUND_AUDIO_ALREADY_PAUSED` | V7PhasePlayground.tsx | `shouldPauseAudio` (true), `currentTime` (≥0) |

---

## 3. Validation Rules

### R1: Completeness
All 5 mandatory events MUST be present for each interactive phase. Missing any → `C11_MISSING_EVENT`.

### R2: No Invalid Timestamps
No event may have `currentTime === -1`. This indicates the audio ref was not ready.
Violation → `C11_INVALID_TIMESTAMP`.

### R3: Wallclock Monotonicity
For events within the same `phaseId`, the `t` (wallclock) field MUST be monotonically
non-decreasing: `events[i].t <= events[i+1].t`.
Violation → `C11_WALLCLOCK_NOT_MONOTONIC`.

### R4: Causal Ordering
Events MUST appear in the order specified in Section 2.
`ANCHOR_PAUSE_EXECUTED` before `PLAYER_PAUSE_STATE_TRUE` before `SHOULD_PAUSE_TRANSITION`.
Violation → `C11_CAUSAL_ORDER_VIOLATED`.

### R5: SHOULD_PAUSE_TRANSITION Integrity
The `SHOULD_PAUSE_TRANSITION` event MUST have `prev=false` and `current=true` (first transition).
Violation → `C11_TRANSITION_STATE_INVALID`.

---

## 4. Thresholds

| Metric | Formula | Max Allowed | Error Code |
|--------|---------|-------------|------------|
| Anchor precision | `\|ANCHOR_PAUSE_EXECUTED.currentTime - keywordTime\|` | **0.15s** (150ms) | `C11_ANCHOR_PRECISION_EXCEEDED` |
| Pause propagation (anchor→player) | `PLAYER_PAUSE_STATE_TRUE.t - ANCHOR_PAUSE_EXECUTED.t` | **200ms** | `C11_PAUSE_PROPAGATION_SLOW` |
| Phase reaction (player→playground) | `SHOULD_PAUSE_TRANSITION.t - PLAYER_PAUSE_STATE_TRUE.t` | **200ms** | `C11_PHASE_REACTION_SLOW` |

---

## 5. Examples

### PASS

```json
[
  { "t": 1707000100, "tag": "PLAYGROUND_ENTRY", "phaseId": "phase-5-playground", "currentTime": 42.5, "inPhase": true, "shouldPauseAudio": false },
  { "t": 1707000200, "tag": "ANCHOR_PAUSE_EXECUTED", "phaseId": "phase-5-playground", "actionId": "pause-playground", "keywordTime": 48.123, "currentTime": 48.130 },
  { "t": 1707000210, "tag": "PLAYER_PAUSE_STATE_TRUE", "phaseId": "phase-5-playground", "isPausedByAnchor": true, "shouldPauseAudio": true, "currentTime": 48.130 },
  { "t": 1707000220, "tag": "SHOULD_PAUSE_TRANSITION", "prev": false, "current": true, "currentTime": 48.130, "audioIsPlaying": false },
  { "t": 1707000225, "tag": "PLAYGROUND_PAUSED_AUDIO", "shouldPauseAudio": true, "currentTime": 48.130, "audioWasPlaying": false }
]
```

**Result**: PASS — all events present, ordered, within thresholds.

### FAIL — Missing Event

```json
[
  { "t": 1707000100, "tag": "PLAYGROUND_ENTRY", "phaseId": "phase-5-playground", "currentTime": 42.5, "inPhase": true },
  { "t": 1707000200, "tag": "ANCHOR_PAUSE_EXECUTED", "phaseId": "phase-5-playground", "keywordTime": 48.123, "currentTime": 48.130 },
  { "t": 1707000225, "tag": "PLAYGROUND_PAUSED_AUDIO", "shouldPauseAudio": true, "currentTime": 48.130 }
]
```

**Result**: FAIL
- `C11_MISSING_EVENT`: `PLAYER_PAUSE_STATE_TRUE` not found
- `C11_MISSING_EVENT`: `SHOULD_PAUSE_TRANSITION` not found

### FAIL — Precision Exceeded

```json
[
  { "t": 1707000200, "tag": "ANCHOR_PAUSE_EXECUTED", "phaseId": "phase-5-playground", "keywordTime": 48.123, "currentTime": 48.500 }
]
```

**Result**: FAIL
- `C11_ANCHOR_PRECISION_EXCEEDED`: `|48.500 - 48.123| = 0.377s > 0.15s`

---

## 6. Error Codes

| Code | Severity | Description |
|------|----------|-------------|
| `C11_MISSING_EVENT` | ERROR | Required audit event not found for phase |
| `C11_INVALID_TIMESTAMP` | ERROR | Event has `currentTime === -1` |
| `C11_WALLCLOCK_NOT_MONOTONIC` | ERROR | `t` values not monotonically increasing within phase |
| `C11_CAUSAL_ORDER_VIOLATED` | ERROR | Events out of required causal order |
| `C11_TRANSITION_STATE_INVALID` | ERROR | `SHOULD_PAUSE_TRANSITION` has wrong prev/current values |
| `C11_ANCHOR_PRECISION_EXCEEDED` | ERROR | Anchor fired >150ms from keywordTime |
| `C11_PAUSE_PROPAGATION_SLOW` | WARN | Anchor→Player propagation >200ms |
| `C11_PHASE_REACTION_SLOW` | WARN | Player→Phase reaction >200ms |

---

## 7. File Locations

| Component | File Path |
|-----------|-----------|
| Validator | `src/components/lessons/v7/cinematic/validators/validateV7DebugLogs.ts` |
| Unit Tests | `src/components/lessons/v7/cinematic/validators/validateV7DebugLogs.test.ts` |
| This Spec | `docs/contracts/C11_RUNTIME_ANCHOR_AUDIT.md` |
| Parent Spec | `docs/contracts/v7-vv-contracts.md` |
