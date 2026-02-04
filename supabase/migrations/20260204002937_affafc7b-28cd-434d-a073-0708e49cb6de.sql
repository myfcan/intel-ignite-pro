-- ============================================================================
-- C05: Fix model constraint to include v7-vv
-- ============================================================================

-- Drop and recreate model constraint to include v7-vv
ALTER TABLE public.pipeline_executions 
DROP CONSTRAINT IF EXISTS pipeline_executions_model_check;

ALTER TABLE public.pipeline_executions 
ADD CONSTRAINT pipeline_executions_model_check 
CHECK (model IN ('v1', 'v2', 'v3', 'v4', 'v5', 'v7', 'v7-vv'));