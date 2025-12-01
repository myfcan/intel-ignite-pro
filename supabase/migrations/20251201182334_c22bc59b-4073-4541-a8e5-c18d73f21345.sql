-- Remover constraint antiga
ALTER TABLE pipeline_executions DROP CONSTRAINT IF EXISTS pipeline_executions_model_check;

-- Adicionar constraint nova incluindo 'v5'
ALTER TABLE pipeline_executions ADD CONSTRAINT pipeline_executions_model_check 
CHECK (model = ANY (ARRAY['v1'::text, 'v2'::text, 'v3'::text, 'v4'::text, 'v5'::text]));