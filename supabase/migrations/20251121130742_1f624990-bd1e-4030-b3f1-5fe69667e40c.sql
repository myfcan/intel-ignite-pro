-- Remover constraint antiga que só permitia v1 e v2
ALTER TABLE public.pipeline_executions
DROP CONSTRAINT IF EXISTS pipeline_executions_model_check;

-- Adicionar nova constraint permitindo v1, v2, v3 e v4
ALTER TABLE public.pipeline_executions
ADD CONSTRAINT pipeline_executions_model_check
CHECK (model IN ('v1', 'v2', 'v3', 'v4'));