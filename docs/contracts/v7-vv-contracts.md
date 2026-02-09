# V7-VV Pipeline Contracts Specification

> **Contract Version**: `c10b-boundaryfix-execstate-1.0`
> **Pipeline Version**: `v7-vv-1.1.4+`
> **Last Updated**: 2026-02-09
> **Status**: FROZEN — Breaking changes require MAJOR version bump (1.x → 2.0)

---

## Table of Contents

1. [A1 — Trigger Contract (C10/C10B)](#a1--trigger-contract-c10c10b)
2. [A2 — Input Contract (Interactive Phases)](#a2--input-contract-interactive-phases)
3. [A3 — Boundary Contract (BoundaryFixGuard)](#a3--boundary-contract-boundaryfixguard)
4. [A4 — Execution State Contract (Canonical JSON)](#a4--execution-state-contract-canonical-json)
5. [A5 — Official Queries](#a5--official-queries)
6. [B — Schema Versioning (Anti-Breaking)](#b--schema-versioning-anti-breaking)
7. [C — Error Codes Registry](#c--error-codes-registry)

---

## A1 — Trigger Contract (C10/C10B)

### Trigger Source of Truth

All visual/interaction triggers are driven exclusively by `anchorActions`. The legacy `triggerTime` property is **stripped** from all `microVisuals` before persistence.

**Official Path**: `output_data.meta.triggerContract == "anchorActions"`

### anchorActions Schema

```jsonc
// Located at: output_data.content.phases[].anchorActions[]
{
  "id": "pause-cena-6-quiz",           // Unique identifier
  "type": "pause",                       // "pause" | "show" | "transition"
  "keyword": "você",                     // Word that triggers the action
  "keywordTime": 48.123,                 // Exact timestamp (seconds) — END of matched word
  "phaseId": "phase-cena-6-quiz",       // Parent phase ID
  "targetId": "quiz-interaction"         // Optional: target element ID
}
```

### wordTimestamps Schema

**Official Path**: `output_data.content.audio.mainAudio.wordTimestamps`

```jsonc
// Array of word-level timestamps from TTS (ElevenLabs)
[
  { "word": "Como",  "start": 0.000, "end": 0.320 },
  { "word": "você",  "start": 0.340, "end": 0.580 },
  // ... one entry per spoken word
]
```

**Invariants**:
- `start < end` for every entry
- `start[i+1] >= end[i]` (monotonic)
- All values in seconds (float)

---

## A2 — Input Contract (Interactive Phases)

### Interactive Scene Types

The following `scene.type` values are classified as **interactive** and require `anchorText.pauseAt`:

| scene.type       | Requires pauseAt | Maps to phase.type |
|------------------|------------------|--------------------|
| `interaction`    | ✅ YES           | `interaction`      |
| `playground`     | ✅ YES           | `playground`       |
| `secret-reveal`  | ✅ YES           | `revelation`       |
| `gamification`   | ❌ NO            | `narrative`        |

> Note: `cta` is a `visual.type`, NOT a `scene.type`. CTA uses `scene.type="narrative"` + `visual.type="cta"`.

### C10 — Hard Pause Anchor Contract (Deterministic)

**Rule**: `pauseTime` = **END** of the matched word (deterministic, no heuristics).

```
pauseTime = wordTimestamps[matchedWordIndex].end
```

**Search Strategy**: `LAST_IN_RANGE` — finds the LAST occurrence of the keyword within the phase's `[startTime, endTime]` range. If not found in range, performs a GLOBAL search to differentiate error codes.

**Mandatory**: `scene.anchorText.pauseAt` is REQUIRED for all interactive phases. Missing → `PAUSE_ANCHOR_REQUIRED` error.

### C10B — Editorial Guardrail

**Rule**: The pause anchor must occur in the **last 1.5 seconds** of the phase narration.

```
narrationAfterPause = lastWordEnd - pauseTime
FAIL if narrationAfterPause > 1.5
```

Where:
- `lastWordEnd` = end timestamp of the last word belonging to the scene (calculated from scene narration word count)
- `pauseTime` = end of the matched `pauseAt` keyword
- `maxAllowed` = **1.5 seconds** (current threshold)

**Error**: `PAUSE_ANCHOR_NOT_AT_END` with `error_details.narrationAfterPause`

### Keyword Matching Rules

1. Normalize both keyword and audio words using NFD decomposition:
   ```
   word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,!?;:]/g, '')
   ```
2. Minimum keyword length: 4 characters (avoids false positives with connectors)
3. Audio word must **contain** the keyword (substring match)
4. Multi-word anchors: sequential window match

---

## A3 — Boundary Contract (BoundaryFixGuard)

### Invariants (INVIOLABLE)

For every phase in `output_data.content.phases[]`:

| # | Invariant | Formula | Min Value |
|---|-----------|---------|-----------|
| 1 | Positive duration | `endTime - startTime > 0` | 0.05s (50ms) for narrative, 5.0s for interactive |
| 2 | Minimum duration | `endTime >= startTime + MIN_DURATION` | See above |
| 3 | Monotonicity | `phases[i].endTime <= phases[i+1].startTime` | No overlap allowed |

### Constants

```typescript
const MIN_PHASE_DURATION = 0.05;          // 50ms absolute minimum
const MIN_INTERACTIVE_DURATION = 5.0;     // 5s for interactive phases
const INTERACTIVE_PHASE_TYPES = [
  'interaction', 'playground', 'secret-reveal',
  'cta', 'gamification', 'quiz'
];
```

### Behavior

1. **PASS 1**: Enforce minimum duration per phase (expand `endTime` if needed, clamp to `totalDuration`)
2. **PASS 2**: Enforce monotonicity (shift `next.startTime` forward if overlap detected)
3. **PASS 3**: Final validation — if any phase still has `duration <= 0`, pipeline **FAILS** with `BOUNDARY_FIX_GUARD_FAILED`

### Pipeline Failure

If after guard application any invariant is still violated:
```
throw Error("BOUNDARY_FIX_GUARD FALHOU: phase-id: duration=X.XXXs (CRITICAL)")
```

---

## A4 — Execution State Contract (Canonical JSON)

### Terminal State Guarantee

Every pipeline execution MUST reach a terminal state:
- `status = 'completed'` — success path
- `status = 'failed'` — error path

**No run may remain `in_progress` after execution completes.**

Both `completed` and `failed` states MUST have `completed_at` populated (ISO 8601).

### Error Message Format (Canonical JSON)

For `status = 'failed'`, the `error_message` column contains a **pure JSON string** (no text prefixes):

```json
{
  "error_code": "PAUSE_ANCHOR_NOT_FOUND",
  "error_message": "Human-readable description of the error",
  "error_details": {
    "phaseId": "phase-cena-6-quiz",
    "keyword": "inexistente123xyz",
    "searchRange": [45.2, 50.1],
    "globalSearchResult": null
  }
}
```

**Rules**:
- `error_code` is NEVER null
- `error_message` is NEVER null
- `error_details` is an object or `null` (never missing key)
- Parseable via `error_message::jsonb->>'error_code'` in PostgreSQL

### Safe Access Pattern (Legacy + Canonical)

For mixed-version databases (legacy string errors + canonical JSON):

```sql
CASE
  WHEN error_message IS NOT NULL
   AND left(trim(error_message), 1) = '{'
  THEN (error_message::jsonb->>'error_code')
  ELSE NULL
END AS error_code
```

---

## A5 — Official Queries

### Q1: Stuck Count by Pipeline Version

```sql
SELECT
  pipeline_version,
  COUNT(*) AS stuck_count
FROM pipeline_executions
WHERE status = 'in_progress'
GROUP BY pipeline_version
ORDER BY stuck_count DESC;
```
**Expected**: 0 for all versions `>= v7-vv-1.1.3`.

### Q2: Extract Error Code and Details (SAFE)

```sql
SELECT
  run_id,
  status,
  pipeline_version,
  CASE
    WHEN error_message IS NOT NULL AND left(trim(error_message), 1) = '{'
    THEN (error_message::jsonb->>'error_code')
    ELSE NULL
  END AS error_code,
  CASE
    WHEN error_message IS NOT NULL AND left(trim(error_message), 1) = '{'
    THEN (error_message::jsonb->'error_details')
    ELSE NULL
  END AS error_details
FROM pipeline_executions
WHERE pipeline_version LIKE 'v7-vv%'
ORDER BY created_at DESC
LIMIT 50;
```

### Q3: Validate Boundaries (per run)

```sql
WITH phases AS (
  SELECT
    run_id,
    p->>'id' AS phase_id,
    (p->>'startTime')::numeric AS start_time,
    (p->>'endTime')::numeric AS end_time,
    ROW_NUMBER() OVER (PARTITION BY run_id ORDER BY (p->>'startTime')::numeric) AS rn
  FROM pipeline_executions,
       jsonb_array_elements(output_data->'content'->'phases') AS p
  WHERE run_id = '<RUN_ID>'
)
SELECT
  phase_id,
  start_time,
  end_time,
  (end_time - start_time) AS duration,
  CASE WHEN (end_time - start_time) > 0 THEN 'OK' ELSE 'FAIL' END AS duration_check,
  LAG(end_time) OVER (ORDER BY rn) AS prev_end,
  CASE
    WHEN LAG(end_time) OVER (ORDER BY rn) IS NULL THEN 'OK'
    WHEN start_time >= LAG(end_time) OVER (ORDER BY rn) THEN 'OK'
    ELSE 'OVERLAP'
  END AS monotonicity_check
FROM phases
ORDER BY rn;
```

### Q4: Validate Word Timestamp Count

```sql
SELECT
  run_id,
  jsonb_array_length(
    output_data->'content'->'audio'->'mainAudio'->'wordTimestamps'
  ) AS wt_count
FROM pipeline_executions
WHERE run_id = '<RUN_ID>'
  AND status = 'completed';
```

### Q5: Validate C10/C10B for Interactive Phases

```sql
WITH interactive_phases AS (
  SELECT
    run_id,
    p->>'id' AS phase_id,
    p->>'type' AS phase_type,
    (p->>'startTime')::numeric AS phase_start,
    (p->>'endTime')::numeric AS phase_end,
    a->>'keyword' AS pause_keyword,
    (a->>'keywordTime')::numeric AS pause_time
  FROM pipeline_executions,
       jsonb_array_elements(output_data->'content'->'phases') AS p,
       jsonb_array_elements(p->'anchorActions') AS a
  WHERE run_id = '<RUN_ID>'
    AND a->>'type' = 'pause'
)
SELECT
  phase_id,
  phase_type,
  pause_keyword,
  pause_time,
  phase_start,
  phase_end,
  (phase_end - pause_time) AS time_after_pause,
  CASE WHEN (phase_end - pause_time) <= 1.5 THEN 'C10B_OK' ELSE 'C10B_FAIL' END AS c10b_check
FROM interactive_phases
ORDER BY phase_start;
```

### Q6: Force Test Batch — 12 Runs

```sql
SELECT
  run_id,
  status,
  pipeline_version,
  output_data->'meta'->>'forceTestBatchId' AS batch_id,
  output_data->'meta'->>'forceTestRunTag' AS run_tag,
  output_data->'meta'->>'contractVersion' AS contract_version,
  CASE
    WHEN error_message IS NOT NULL AND left(trim(error_message), 1) = '{'
    THEN (error_message::jsonb->>'error_code')
    ELSE NULL
  END AS error_code
FROM pipeline_executions
WHERE output_data->'meta'->>'forceTestBatchId' = '<BATCH_ID>'
ORDER BY output_data->'meta'->>'forceTestRunTag';
```

---

## B — Schema Versioning (Anti-Breaking)

### Contract Version in output_data.meta

Every pipeline execution persists:

```jsonc
{
  "output_data": {
    "meta": {
      // ... existing fields ...
      "contractVersion": "c10b-boundaryfix-execstate-1.0",
      "contracts": [
        "C10",
        "C10B",
        "BOUNDARY_FIX_GUARD",
        "EXEC_STATE_CANONICAL_JSON"
      ]
    }
  }
}
```

### Versioning Rules

| Change Type | Version Impact | Example |
|-------------|----------------|---------|
| Add optional field to meta | PATCH (1.0.x) | Add `meta.newOptionalField` |
| Change threshold (e.g. C10B 1.5s → 2.0s) | MINOR (1.x.0) | Requires doc update |
| Change anchorActions schema | **MAJOR (x.0.0)** | Requires migration |
| Change wordTimestamps path | **MAJOR (x.0.0)** | Requires migration |
| Change error_message format | **MAJOR (x.0.0)** | Requires migration |
| Add new error_code | PATCH (1.0.x) | Extend registry |
| Remove error_code | **MAJOR (x.0.0)** | Breaking for consumers |

### Breaking Change Policy

1. **NEVER** alter `output_data.content.phases[].anchorActions` schema without MAJOR bump
2. **NEVER** change `output_data.content.audio.mainAudio.wordTimestamps` path without MAJOR bump
3. **NEVER** change `error_message` canonical JSON format without MAJOR bump
4. All changes MUST update this document AND increment `contractVersion`
5. All changes MUST pass the Force Test battery (R01-R12) before deployment

---

## C — Error Codes Registry

### Active Error Codes (v1.0)

| Code | HTTP | Category | Description |
|------|------|----------|-------------|
| `PAUSE_ANCHOR_REQUIRED` | 400 | C10 | Interactive scene missing `anchorText.pauseAt` |
| `PAUSE_ANCHOR_NOT_FOUND` | 400 | C10 | `pauseAt` keyword not found in audio (global search) |
| `PAUSE_ANCHOR_NOT_AT_END` | 400 | C10B | `pauseAt` found but > 1.5s before narration end |
| `BOUNDARY_FIX_GUARD_FAILED` | 500 | Boundary | Phase duration ≤ 0 after guard correction |
| `VALIDATION_ERROR` | 400 | Input | Input JSON validation failed |
| `UNSTRUCTURED_ERROR` | 500 | System | Unexpected error (legacy or unhandled) |

### Reserved Error Codes (Future)

| Code | Category | Description |
|------|----------|-------------|
| `AUDIO_GENERATION_FAILED` | Audio | TTS provider error |
| `CONTENT_SIZE_EXCEEDED` | System | Output > 5MB limit |
| `HASH_MISMATCH` | C05 | Content hash verification failed |

---

## Appendix: File Locations

| Component | File Path |
|-----------|-----------|
| Pipeline Entry Point | `supabase/functions/v7-vv/index.ts` |
| Force Test Orchestrator | `supabase/functions/force-test-c10b/index.ts` |
| Frontend Types (Input) | `src/types/V7ScriptInput.ts` |
| Frontend Pipeline Types | `src/lib/lessonPipeline/v7/types.ts` |
| Frontend Step5 (Build Content) | `src/lib/lessonPipeline/v7/steps/step5-build-content.ts` |
| This Contract Spec | `docs/contracts/v7-vv-contracts.md` |
