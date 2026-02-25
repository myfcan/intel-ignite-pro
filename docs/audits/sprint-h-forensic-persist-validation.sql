-- Sprint H — Forensic Persist Validation (v7-vv-1.1.5)
-- Objective: Verify that releaseForensicReport is persisted in output_data.meta
-- for ALL terminal states (completed AND failed) in create/reprocess modes.
-- Safe: read-only queries, no mutations.

-- ============================================================================
-- Q1) Coverage: releaseForensicReport presence by status (v7-vv runs only)
-- Expected after fix: 100% coverage for completed AND failed runs
-- ============================================================================
SELECT
  status,
  mode,
  count(*) AS total_runs,
  count(*) FILTER (
    WHERE output_data->'meta'->'releaseForensicReport' IS NOT NULL
  ) AS has_forensic,
  count(*) FILTER (
    WHERE output_data->'meta'->'auditGate' IS NOT NULL
  ) AS has_audit_gate,
  round(
    100.0 * count(*) FILTER (
      WHERE output_data->'meta'->'releaseForensicReport' IS NOT NULL
    ) / NULLIF(count(*), 0), 1
  ) AS forensic_coverage_pct
FROM pipeline_executions
WHERE pipeline_version LIKE 'v7-vv%'
  AND mode IN ('create', 'reprocess')
GROUP BY status, mode
ORDER BY status, mode;

-- ============================================================================
-- Q2) Detailed forensic report for latest v7-vv-1.1.5 runs
-- ============================================================================
SELECT
  run_id,
  mode,
  status,
  pipeline_version,
  completed_at,
  (output_data->'meta'->'auditGate'->>'checked')::boolean AS audit_checked,
  (output_data->'meta'->'auditGate'->>'passed')::boolean AS audit_passed,
  (output_data->'meta'->'auditGate'->>'httpStatus')::int AS audit_http,
  output_data->'meta'->'releaseForensicReport'->>'generatedAt' AS forensic_at,
  output_data->'meta'->'releaseForensicReport'->>'pipelineVersion' AS forensic_version,
  (output_data->'meta'->'releaseForensicReport'->'auditGate'->>'passed')::boolean AS forensic_passed
FROM pipeline_executions
WHERE pipeline_version LIKE 'v7-vv-1.1.5%'
  AND mode IN ('create', 'reprocess')
ORDER BY completed_at DESC
LIMIT 20;

-- ============================================================================
-- Q3) Gap detection: runs WITHOUT forensic report (should be zero after fix)
-- ============================================================================
SELECT
  run_id,
  mode,
  status,
  pipeline_version,
  completed_at,
  left(error_message, 120) AS error_preview
FROM pipeline_executions
WHERE pipeline_version LIKE 'v7-vv-1.1.5%'
  AND mode IN ('create', 'reprocess')
  AND status IN ('completed', 'failed')
  AND output_data->'meta'->'releaseForensicReport' IS NULL
ORDER BY completed_at DESC
LIMIT 20;

-- ============================================================================
-- Q4) Timestamp consistency: forensic_at should be close to completed_at
-- (not identical across all runs like a backfill)
-- ============================================================================
SELECT
  run_id,
  completed_at,
  output_data->'meta'->'releaseForensicReport'->>'generatedAt' AS forensic_at,
  EXTRACT(EPOCH FROM (
    (output_data->'meta'->'releaseForensicReport'->>'generatedAt')::timestamptz - completed_at
  )) AS drift_seconds
FROM pipeline_executions
WHERE pipeline_version LIKE 'v7-vv-1.1.5%'
  AND status IN ('completed', 'failed')
  AND output_data->'meta'->'releaseForensicReport' IS NOT NULL
ORDER BY completed_at DESC
LIMIT 20;
