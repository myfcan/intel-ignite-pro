-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create cleanup function for stale image attempts
CREATE OR REPLACE FUNCTION public.cleanup_stale_image_attempts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cleaned_attempts integer := 0;
  cleaned_jobs integer := 0;
BEGIN
  -- Clean stale attempts (processing > 10 min)
  UPDATE image_attempts
  SET 
    status = 'failed',
    error_code = 'TIMEOUT',
    error_message = 'Auto-cleanup: exceeded 10min processing limit'
  WHERE status = 'processing'
    AND created_at < now() - interval '10 minutes';
  
  GET DIAGNOSTICS cleaned_attempts = ROW_COUNT;

  -- Clean stale jobs (processing > 10 min)
  UPDATE image_jobs
  SET 
    status = 'failed',
    error_code = 'TIMEOUT',
    error_message = 'Auto-cleanup: exceeded 10min processing limit',
    updated_at = now()
  WHERE status = 'processing'
    AND updated_at < now() - interval '10 minutes';
  
  GET DIAGNOSTICS cleaned_jobs = ROW_COUNT;

  IF cleaned_attempts > 0 OR cleaned_jobs > 0 THEN
    RAISE LOG 'cleanup_stale_image_attempts: cleaned % attempts, % jobs', cleaned_attempts, cleaned_jobs;
  END IF;

  RETURN cleaned_attempts + cleaned_jobs;
END;
$$;
