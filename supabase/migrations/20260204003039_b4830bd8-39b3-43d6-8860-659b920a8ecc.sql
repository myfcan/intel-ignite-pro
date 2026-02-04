-- ============================================================================
-- C05: Fix status constraint to include in_progress
-- ============================================================================

-- Drop and recreate status constraint to include in_progress
ALTER TABLE public.pipeline_executions 
DROP CONSTRAINT IF EXISTS pipeline_executions_status_check;

ALTER TABLE public.pipeline_executions 
ADD CONSTRAINT pipeline_executions_status_check 
CHECK (status IN ('pending', 'running', 'in_progress', 'completed', 'failed', 'paused'));