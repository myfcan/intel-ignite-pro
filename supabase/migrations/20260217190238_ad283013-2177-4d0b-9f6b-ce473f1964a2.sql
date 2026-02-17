-- Correção 1: Atualizar cleanup_stale_image_attempts para incluir jobs stuck em 'queued'
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

  -- NEW: Clean stale jobs stuck in queued > 30 min
  UPDATE image_jobs
  SET 
    status = 'failed',
    error_code = 'TIMEOUT',
    error_message = 'Auto-cleanup: stuck in queued > 30 minutes',
    updated_at = now()
  WHERE status = 'queued'
    AND updated_at < now() - interval '30 minutes';
  
  GET DIAGNOSTICS cleaned_queued = ROW_COUNT;

  IF cleaned_attempts > 0 OR cleaned_jobs > 0 OR cleaned_queued > 0 THEN
    RAISE LOG 'cleanup_stale_image_attempts: cleaned % attempts, % processing jobs, % queued jobs', cleaned_attempts, cleaned_jobs, cleaned_queued;
  END IF;

  RETURN cleaned_attempts + cleaned_jobs + cleaned_queued;
END;
$function$;