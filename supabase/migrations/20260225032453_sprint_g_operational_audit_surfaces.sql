-- Sprint G: Operational audit surfaces + stale execution maintenance helpers
-- Additive migration (no destructive schema changes)

BEGIN;

-- ============================================================================
-- 1) Flattened forensic view for v7-vv operational analysis
-- ============================================================================
CREATE OR REPLACE VIEW public.v7vv_audit_runs_v1 AS
SELECT
  pe.run_id,
  pe.lesson_id,
  pe.mode,
  pe.status,
  pe.pipeline_version,
  pe.started_at,
  pe.completed_at,
  pe.created_at,
  pe.updated_at,
  (pe.output_data->'meta'->'auditGate'->>'checked')::boolean AS audit_checked,
  (pe.output_data->'meta'->'auditGate'->>'httpStatus')::int AS audit_http_status,
  pe.output_data->'meta'->'auditGate'->>'scorecardHash' AS audit_scorecard_hash,
  (pe.output_data->'meta'->'releaseForensicReport'->>'generatedAt')::timestamptz AS forensic_generated_at,
  (pe.output_data->'meta'->'releaseForensicReport'->'auditGate'->>'checked')::boolean AS forensic_audit_checked,
  (pe.output_data->'meta'->'releaseForensicReport'->'auditGate'->>'passed')::boolean AS forensic_audit_passed,
  (pe.output_data->'meta'->'releaseForensicReport'->'auditGate'->>'httpStatus')::int AS forensic_http_status,
  pe.output_data->'meta'->'releaseForensicReport'->'auditGate'->>'scorecardHash' AS forensic_scorecard_hash,
  CASE
    WHEN pe.error_message IS NULL THEN NULL
    WHEN pe.error_message ~ '^\s*\{' THEN pe.error_message::jsonb ->> 'error_code'
    ELSE 'UNSTRUCTURED_ERROR'
  END AS error_code,
  CASE
    WHEN pe.error_message IS NULL THEN NULL
    WHEN pe.error_message ~ '^\s*\{' THEN left(pe.error_message::jsonb ->> 'error_message', 240)
    ELSE left(pe.error_message, 240)
  END AS error_preview
FROM public.pipeline_executions pe;

COMMENT ON VIEW public.v7vv_audit_runs_v1 IS
'Flattened operational/forensic projection of pipeline_executions for v7-vv';

-- ============================================================================
-- 2) Safe query helper (avoids ad-hoc UUID placeholder mistakes)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_v7vv_audit_runs(
  limit_rows int DEFAULT 120,
  run_id_filter uuid DEFAULT NULL
)
RETURNS SETOF public.v7vv_audit_runs_v1
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.v7vv_audit_runs_v1 v
  WHERE (run_id_filter IS NULL OR v.run_id = run_id_filter)
  ORDER BY v.created_at DESC
  LIMIT GREATEST(COALESCE(limit_rows, 120), 1);
$$;

COMMENT ON FUNCTION public.get_v7vv_audit_runs(int, uuid) IS
'Operational helper: returns v7vv_audit_runs_v1 ordered by recency with optional run_id filter';

-- ============================================================================
-- 3) Controlled stale-run maintenance helper (dry-run by default)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.close_stale_pipeline_runs(
  age_threshold interval DEFAULT interval '30 days',
  do_update boolean DEFAULT false
)
RETURNS TABLE(
  run_id uuid,
  previous_status text,
  new_status text,
  age_since_update interval,
  updated boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF do_update THEN
    RETURN QUERY
    WITH target AS (
      SELECT
        pe.run_id,
        pe.status,
        now() - COALESCE(pe.updated_at, pe.created_at) AS age_since_update
      FROM public.pipeline_executions pe
      WHERE pe.status IN ('in_progress', 'pending')
        AND COALESCE(pe.updated_at, pe.created_at) < now() - age_threshold
    ), upd AS (
      UPDATE public.pipeline_executions pe
      SET
        status = 'failed',
        completed_at = COALESCE(pe.completed_at, now()),
        error_message = COALESCE(
          pe.error_message,
          '{"error_code":"STALE_EXECUTION_TIMEOUT","error_message":"Execution auto-closed by maintenance helper","error_details":null}'
        ),
        updated_at = now()
      FROM target t
      WHERE pe.run_id = t.run_id
      RETURNING pe.run_id, t.status AS previous_status, t.age_since_update
    )
    SELECT
      u.run_id,
      u.previous_status,
      'failed'::text AS new_status,
      u.age_since_update,
      true AS updated
    FROM upd u
    ORDER BY u.age_since_update DESC;
  ELSE
    RETURN QUERY
    SELECT
      pe.run_id,
      pe.status AS previous_status,
      pe.status AS new_status,
      now() - COALESCE(pe.updated_at, pe.created_at) AS age_since_update,
      false AS updated
    FROM public.pipeline_executions pe
    WHERE pe.status IN ('in_progress', 'pending')
      AND COALESCE(pe.updated_at, pe.created_at) < now() - age_threshold
    ORDER BY age_since_update DESC;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.close_stale_pipeline_runs(interval, boolean) FROM PUBLIC;
COMMENT ON FUNCTION public.close_stale_pipeline_runs(interval, boolean) IS
'Dry-run by default. When do_update=true, closes stale in_progress/pending runs as failed.';

COMMIT;
