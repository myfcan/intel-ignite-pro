

# Sprint H Validation: Execute Real Create via v7-vv v1.1.5

## Objective
Trigger the first real `create` execution of pipeline version `v7-vv-1.1.5-forensic-persist` and verify that `releaseForensicReport` + `auditGate` are persisted in `output_data.meta` regardless of terminal state (completed or failed).

## Pre-Execution Forensic State (Real Data)

| Metric | Value |
|--------|-------|
| Executions with v1.1.5 | **0** |
| Current code PIPELINE_VERSION (line 34) | `v7-vv-1.1.5-forensic-persist` |
| Current COMMIT_HASH (line 35) | `forensic-persist-r01-2026-02-25` |
| Target trail_id | `efa0c22c-26fb-44d2-b1dc-721724ca5c5b` (Fundamentos IA) |
| Next safe order_index | **100** (avoids conflict with existing 99) |

## Execution Plan

### Step 1: Invoke v7-vv Edge Function with Real Create Payload

Call the edge function with a minimal but valid `ScriptInput` containing:
- 2 scenes (1 narrative + 1 quiz with pauseAt anchor)
- `generate_audio: true` (real ElevenLabs call)
- `trail_id` and `order_index` mapped to real data
- No `dry_run`, no `reprocess` -- pure `create` mode

```text
Payload Structure:
{
  title: "Sprint H Forensic Validation Test",
  difficulty: "beginner",
  category: "fundamentos",
  tags: ["test", "sprint-h"],
  learningObjectives: ["Validate forensic persistence"],
  generate_audio: true,
  scenes: [
    { id: "s1", type: "narrative", narration: "...", visual: {...} },
    { id: "s2", type: "quiz", narration: "...", anchorText: { pauseAt: "..." }, interaction: {...}, visual: {...} }
  ]
}
```

### Step 2: Capture Response

Record `runId`, `lessonId`, HTTP status, and `forensic` field from response.

### Step 3: SQL Forensic Validation

Run validation queries against `pipeline_executions` for the new run:

```text
Query 1: Verify run exists with v1.1.5 version
Query 2: Verify output_data.meta.releaseForensicReport is NOT NULL
Query 3: Verify output_data.meta.auditGate is NOT NULL
Query 4: Verify releaseForensicReport contains runId, pipelineVersion, mode, generatedAt, auditGate
```

### Step 4: Cleanup

Delete the test lesson from `lessons` table (order_index 100) to keep production data clean.

## Expected Outcomes

| Scenario | releaseForensicReport | auditGate | Status |
|----------|----------------------|-----------|--------|
| Completed (audit passes) | Present in meta | `checked: true, passed: true` | completed |
| Failed (audit fails) | Present in meta | `checked: true, passed: false` | failed |
| Failed (global catch) | Present in meta | `checked: false/true` | failed |

All 3 paths now persist forensic data per the Sprint H fix in `buildFailedOutputData()` (lines 184-219).

## Technical Details

### Code Paths Verified in index.ts:
- **Success path** (line 8060-8075): `updatedOutput.meta.releaseForensicReport` persisted
- **AUDIT_GATE_FAILED** (line 7980-8015): `buildFailedOutputData()` merges forensic into existing output_data
- **UNREACHABLE** (line 8100-8132): Same `buildFailedOutputData()` pattern
- **Global catch** (line 8257-8291): `buildReleaseForensicReport()` + `buildFailedOutputData()` + update

### Files Involved:
- `supabase/functions/v7-vv/index.ts` (lines 34-35, 159-219, 7947-8145, 8191-8349)
- `supabase/functions/v7-vv/contracts.ts` (CONTRACT_VERSION, ACTIVE_CONTRACTS_LIST)

