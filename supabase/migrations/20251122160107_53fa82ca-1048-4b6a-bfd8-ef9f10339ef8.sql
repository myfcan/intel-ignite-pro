-- Migration: Enforce model constraints
-- Data: 2025-01-22 15:00:00
-- Descrição: Adiciona constraints CHECK explícitas para validação do campo 'model'

-- 1. Remover constraints antigas (se existirem) na tabela lessons
ALTER TABLE public.lessons 
DROP CONSTRAINT IF EXISTS lessons_model_check;

ALTER TABLE public.lessons 
DROP CONSTRAINT IF EXISTS check_model_value;

-- 2. Adicionar nova constraint com nome explícito na tabela lessons
ALTER TABLE public.lessons
ADD CONSTRAINT lessons_model_check 
CHECK (model IS NULL OR model IN ('v1', 'v2', 'v3', 'v4'));

-- 3. Remover constraints antigas (se existirem) na tabela pipeline_executions
ALTER TABLE public.pipeline_executions 
DROP CONSTRAINT IF EXISTS pipeline_executions_model_check;

ALTER TABLE public.pipeline_executions 
DROP CONSTRAINT IF EXISTS check_pipeline_model;

-- 4. Adicionar nova constraint com nome explícito na tabela pipeline_executions
ALTER TABLE public.pipeline_executions
ADD CONSTRAINT pipeline_executions_model_check 
CHECK (model IN ('v1', 'v2', 'v3', 'v4'));

-- 5. Criar índices para otimização de queries por modelo
CREATE INDEX IF NOT EXISTS idx_lessons_model ON public.lessons(model) WHERE model IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_model ON public.pipeline_executions(model);

-- 6. Comentários para documentação
COMMENT ON COLUMN public.lessons.model IS 'Modelo da lição: v1 (áudio único), v2 (multi-seção), v3 (slides), v4 (playground interativo)';
COMMENT ON COLUMN public.pipeline_executions.model IS 'Modelo do pipeline: v1, v2, v3 ou v4';
COMMENT ON CONSTRAINT lessons_model_check ON public.lessons IS 'Valida que model seja NULL ou um dos valores permitidos: v1, v2, v3, v4';
COMMENT ON CONSTRAINT pipeline_executions_model_check ON public.pipeline_executions IS 'Valida que model seja um dos valores permitidos: v1, v2, v3, v4';