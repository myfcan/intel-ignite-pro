-- Fix Security Definer Views - recreate with SECURITY INVOKER

-- 1. exercises_public view
DROP VIEW IF EXISTS public.exercises_public;
CREATE VIEW public.exercises_public 
WITH (security_invoker = on)
AS
SELECT id, lesson_id, question, options, type, order_index, created_at
FROM exercises;

COMMENT ON VIEW public.exercises_public IS 'Use this view to show exercises to users before completion - hides answers and explanations';

-- 2. image_lab_kpis_last_7d view
DROP VIEW IF EXISTS public.image_lab_kpis_last_7d;
CREATE VIEW public.image_lab_kpis_last_7d 
WITH (security_invoker = on)
AS
WITH recent_jobs AS (
  SELECT * FROM image_jobs WHERE created_at >= now() - interval '7 days'
),
recent_attempts AS (
  SELECT a.id, a.job_id, a.provider, a.model, a.status, a.prompt_final, a.latency_ms, a.cost_estimate, a.error_code, a.error_message, a.created_at
  FROM image_attempts a
  JOIN recent_jobs j ON a.job_id = j.id
),
approved_jobs AS (
  SELECT j.id, count(a.id) AS attempt_count
  FROM recent_jobs j
  JOIN image_attempts a ON a.job_id = j.id
  WHERE j.status = 'approved'
  GROUP BY j.id
),
first_pass AS (
  SELECT j.id
  FROM recent_jobs j
  WHERE j.status = 'approved'
    AND (SELECT count(*) FROM image_attempts a WHERE a.job_id = j.id) = 1
)
SELECT
  (SELECT count(*) FROM recent_jobs) AS total_jobs,
  (SELECT count(*) FROM recent_attempts) AS total_attempts,
  CASE WHEN (SELECT count(*) FROM approved_jobs) > 0
    THEN round(((SELECT count(*) FROM first_pass)::numeric / (SELECT count(*) FROM approved_jobs)::numeric) * 100, 1)
    ELSE 0::numeric END AS first_pass_accept_rate,
  CASE WHEN (SELECT count(*) FROM approved_jobs) > 0
    THEN round((SELECT avg(attempt_count) FROM approved_jobs), 1)
    ELSE 0::numeric END AS avg_attempts_per_approved,
  CASE WHEN (SELECT count(*) FROM recent_attempts WHERE provider = 'openai') > 0
    THEN round(((SELECT count(*) FROM recent_attempts WHERE provider = 'openai' AND status = 'failed')::numeric / NULLIF((SELECT count(*) FROM recent_attempts WHERE provider = 'openai'), 0)::numeric) * 100, 1)
    ELSE 0::numeric END AS fail_rate_openai,
  CASE WHEN (SELECT count(*) FROM recent_attempts WHERE provider = 'gemini') > 0
    THEN round(((SELECT count(*) FROM recent_attempts WHERE provider = 'gemini' AND status = 'failed')::numeric / NULLIF((SELECT count(*) FROM recent_attempts WHERE provider = 'gemini'), 0)::numeric) * 100, 1)
    ELSE 0::numeric END AS fail_rate_gemini,
  COALESCE((SELECT round(avg(latency_ms)) FROM recent_attempts WHERE provider = 'openai' AND status = 'completed'), 0)::bigint AS avg_latency_openai,
  COALESCE((SELECT round(avg(latency_ms)) FROM recent_attempts WHERE provider = 'gemini' AND status = 'completed'), 0)::bigint AS avg_latency_gemini;