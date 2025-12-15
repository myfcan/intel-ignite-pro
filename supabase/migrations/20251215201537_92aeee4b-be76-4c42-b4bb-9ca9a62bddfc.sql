-- Drop the existing check constraint
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_model_check;

-- Create new check constraint that includes 'v7'
ALTER TABLE public.lessons ADD CONSTRAINT lessons_model_check 
CHECK (model IS NULL OR model IN ('v1', 'v2', 'v3', 'v4', 'v5', 'v7'));

-- Also update pipeline_executions if it has a similar constraint
ALTER TABLE public.pipeline_executions DROP CONSTRAINT IF EXISTS pipeline_executions_model_check;

ALTER TABLE public.pipeline_executions ADD CONSTRAINT pipeline_executions_model_check 
CHECK (model IN ('v1', 'v2', 'v3', 'v4', 'v5', 'v7'));