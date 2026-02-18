
-- ============================================================================
-- C12.1 HARDENING — Parte 1: Tabela circuit_state + Parte 4: Cleanup 120s
-- ============================================================================

-- 1. Tabela image_lab_circuit_state para Circuit Breaker
CREATE TABLE public.image_lab_circuit_state (
  provider TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'CLOSED' CHECK (state IN ('CLOSED','OPEN','HALF_OPEN')),
  fail_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial providers
INSERT INTO public.image_lab_circuit_state (provider) VALUES ('openai'), ('gemini');

-- RLS: admin-only (mesmo padrão das tabelas image_*)
ALTER TABLE public.image_lab_circuit_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_circuit_state" ON public.image_lab_circuit_state
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role full access (edge functions use service_role_key)
CREATE POLICY "service_role_circuit_state" ON public.image_lab_circuit_state
  FOR ALL USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- 2. Update cleanup function: threshold 120s instead of 10min
CREATE OR REPLACE FUNCTION public.cleanup_stale_image_attempts()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cleaned_attempts integer := 0;
  cleaned_jobs integer := 0;
  cleaned_queued integer := 0;
BEGIN
  -- C12.1_NO_STUCK_JOBS: Clean stale attempts (processing > 2 min)
  UPDATE image_attempts
  SET 
    status = 'failed',
    error_code = 'TIMEOUT',
    error_message = 'Auto-cleanup: exceeded 120s processing limit (C12.1)'
  WHERE status = 'processing'
    AND created_at < now() - interval '2 minutes';
  
  GET DIAGNOSTICS cleaned_attempts = ROW_COUNT;

  -- C12.1_NO_STUCK_JOBS: Clean stale jobs (processing > 2 min)
  UPDATE image_jobs
  SET 
    status = 'failed',
    error_code = 'TIMEOUT',
    error_message = 'Auto-cleanup: exceeded 120s processing limit (C12.1)',
    updated_at = now()
  WHERE status = 'processing'
    AND updated_at < now() - interval '2 minutes';
  
  GET DIAGNOSTICS cleaned_jobs = ROW_COUNT;

  -- Clean stale jobs stuck in queued > 10 min (tightened from 30min)
  UPDATE image_jobs
  SET 
    status = 'failed',
    error_code = 'TIMEOUT',
    error_message = 'Auto-cleanup: stuck in queued > 10 minutes (C12.1)',
    updated_at = now()
  WHERE status = 'queued'
    AND updated_at < now() - interval '10 minutes';
  
  GET DIAGNOSTICS cleaned_queued = ROW_COUNT;

  IF cleaned_attempts > 0 OR cleaned_jobs > 0 OR cleaned_queued > 0 THEN
    RAISE LOG 'cleanup_stale_image_attempts(C12.1): cleaned % attempts, % processing jobs, % queued jobs', cleaned_attempts, cleaned_jobs, cleaned_queued;
  END IF;

  RETURN cleaned_attempts + cleaned_jobs + cleaned_queued;
END;
$function$;
