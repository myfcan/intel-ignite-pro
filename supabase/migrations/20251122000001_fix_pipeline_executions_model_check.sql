-- Corrigir constraint de model em pipeline_executions
-- Adicionar v3 e v4 aos valores permitidos

-- Remover constraint antiga
ALTER TABLE public.pipeline_executions
DROP CONSTRAINT IF EXISTS pipeline_executions_model_check;

-- Adicionar nova constraint com v1, v2, v3, v4
ALTER TABLE public.pipeline_executions
ADD CONSTRAINT pipeline_executions_model_check
CHECK (model IN ('v1', 'v2', 'v3', 'v4'));

-- Comentário
COMMENT ON CONSTRAINT pipeline_executions_model_check ON public.pipeline_executions
IS 'Modelo pedagógico: v1 (playground mid), v2 (linear), v3 (slides), v4 (playground real)';
