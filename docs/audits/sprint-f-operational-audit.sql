-- Sprint F — Operational Forensic Audit (v7-vv)
-- Objective: produce deterministic operational evidence from real execution tables.
-- Tables: public.pipeline_executions, public.lesson_migrations_audit
-- Safe defaults:
--   - run_id filter is NULL by default (no single-run filter)
--   - no placeholder string like 'RUN_ID_AQUI' (prevents invalid UUID error 22P02)

-- ============================================================================
-- Q1) Last N runs (with canonical audit stamp extracted from output_data.meta.auditGate)
-- ============================================================================
WITH params AS (
  SELECT
    NULL::uuid AS run_id_filter,
    120::int AS max_rows
)
SELECT
  pe.run_id,
  pe.mode,
  pe.status,
  pe.pipeline_version,
  pe.started_at,
  pe.completed_at,
  pe.lesson_id,
  (pe.output_data->'meta'->'auditGate'->>'checked')::boolean AS audit_checked,
  (pe.output_data->'meta'->'auditGate'->>'httpStatus')::int AS audit_http_status,
  pe.output_data->'meta'->'auditGate'->>'scorecardHash' AS audit_scorecard_hash,
  CASE
    WHEN pe.error_message IS NULL THEN NULL
    WHEN pe.error_message ~ '^\s*\{' THEN (pe.error_message::jsonb ->> 'error_code')
    ELSE 'UNSTRUCTURED_ERROR'
  END AS error_code,
  CASE
    WHEN pe.error_message IS NULL THEN NULL
    WHEN pe.error_message ~ '^\s*\{' THEN left(pe.error_message::jsonb ->> 'error_message', 240)
    ELSE left(pe.error_message, 240)
  END AS error_preview
FROM public.pipeline_executions pe
CROSS JOIN params p
WHERE (p.run_id_filter IS NULL OR pe.run_id = p.run_id_filter)
ORDER BY pe.created_at DESC
LIMIT (SELECT max_rows FROM params);

-- ============================================================================
-- Q2) Compliance summary by execution mode and status
-- ============================================================================
WITH base AS (
  SELECT
    mode,
    status,
    (output_data->'meta'->'auditGate'->>'checked')::boolean AS audit_checked,
    (output_data->'meta'->'auditGate'->>'httpStatus')::int AS audit_http_status
  FROM public.pipeline_executions
)
SELECT
  mode,
  status,
  count(*) AS runs,
  count(*) FILTER (WHERE audit_checked IS TRUE) AS audit_checked_runs,
  count(*) FILTER (WHERE audit_http_status = 200) AS audit_http_200_runs,
  count(*) FILTER (WHERE status = 'failed') AS failed_runs
FROM base
GROUP BY mode, status
ORDER BY mode, status;

-- ============================================================================
-- Q3) Required-failed extraction from canonical JSON errors (AUDIT_GATE_FAILED)
-- ============================================================================
SELECT
  pe.run_id,
  pe.mode,
  pe.status,
  pe.pipeline_version,
  pe.created_at,
  (pe.error_message::jsonb -> 'error_details' ->> 'http_status')::int AS audit_http_status,
  (pe.error_message::jsonb -> 'error_details' ->> 'required_failed')::int AS required_failed,
  left(pe.error_message::jsonb ->> 'error_message', 240) AS gate_error_message
FROM public.pipeline_executions pe
WHERE pe.error_message IS NOT NULL
  AND pe.error_message ~ '^\s*\{'
  AND (pe.error_message::jsonb ->> 'error_code') = 'AUDIT_GATE_FAILED'
ORDER BY pe.created_at DESC
LIMIT 100;

-- ============================================================================
-- Q4) Correlate pipeline executions with lesson_migrations_audit by run_id
-- NOTE: lesson_migrations_audit uses migration_status (NOT status/audit_status)
-- ============================================================================
SELECT
  pe.run_id,
  pe.pipeline_version,
  pe.mode,
  pe.status AS execution_status,
  pe.lesson_id,
  lma.id AS migration_audit_id,
  lma.migration_version,
  lma.migration_status,
  lma.created_at AS migration_created_at,
  lma.completed_at AS migration_completed_at,
  left(lma.error_message, 240) AS migration_error_preview
FROM public.pipeline_executions pe
LEFT JOIN public.lesson_migrations_audit lma
  ON lma.run_id = pe.run_id
ORDER BY pe.created_at DESC
LIMIT 120;

-- ============================================================================
-- Q5) Forensic release stamp coverage (Sprint C)
-- ============================================================================
SELECT
  pe.run_id,
  pe.pipeline_version,
  pe.mode,
  pe.status,
  (pe.output_data->'meta'->'releaseForensicReport'->>'generatedAt')::timestamptz AS forensic_generated_at,
  (pe.output_data->'meta'->'releaseForensicReport'->'auditGate'->>'checked')::boolean AS forensic_audit_checked,
  (pe.output_data->'meta'->'releaseForensicReport'->'auditGate'->>'passed')::boolean AS forensic_audit_passed,
  (pe.output_data->'meta'->'releaseForensicReport'->'auditGate'->>'httpStatus')::int AS forensic_http_status,
  pe.output_data->'meta'->'releaseForensicReport'->'auditGate'->>'scorecardHash' AS forensic_scorecard_hash
FROM public.pipeline_executions pe
ORDER BY pe.created_at DESC
LIMIT 120;

-- ============================================================================
-- Q6) Duplicate run_id detection (idempotency contract sanity)
-- ============================================================================
SELECT run_id, count(*) AS duplicate_count
FROM public.pipeline_executions
GROUP BY run_id
HAVING count(*) > 1
ORDER BY duplicate_count DESC, run_id;
