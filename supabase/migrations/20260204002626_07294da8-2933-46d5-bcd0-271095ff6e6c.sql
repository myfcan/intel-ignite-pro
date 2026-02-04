-- ============================================================================
-- C05: Extensão da tabela pipeline_executions para Input→Output Traceability
-- ============================================================================

-- 1. Adicionar colunas faltantes para C05
ALTER TABLE public.pipeline_executions
ADD COLUMN IF NOT EXISTS run_id UUID,
ADD COLUMN IF NOT EXISTS pipeline_version TEXT,
ADD COLUMN IF NOT EXISTS commit_hash TEXT,
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'create',
ADD COLUMN IF NOT EXISTS normalized_input JSONB,
ADD COLUMN IF NOT EXISTS dry_run_result JSONB,
ADD COLUMN IF NOT EXISTS output_content_hash TEXT;

-- 2. Adicionar constraint CHECK para mode
-- (Usando DO block para evitar erro se já existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pipeline_executions_mode_check'
  ) THEN
    ALTER TABLE public.pipeline_executions 
    ADD CONSTRAINT pipeline_executions_mode_check 
    CHECK (mode IN ('create', 'reprocess', 'dry_run'));
  END IF;
END $$;

-- 3. Criar índice para run_id (idempotency lookup)
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_run_id 
ON public.pipeline_executions(run_id);

-- 4. Criar índice composto para lesson_id + status (common query)
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_lesson_status 
ON public.pipeline_executions(lesson_id, status);

-- 5. Criar índice para consultas por status (failed lookups)
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_status 
ON public.pipeline_executions(status);

-- 6. Adicionar unique constraint para run_id (idempotência)
-- Usando DO block para criar constraint idempotente
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pipeline_executions_run_id_unique'
  ) THEN
    ALTER TABLE public.pipeline_executions 
    ADD CONSTRAINT pipeline_executions_run_id_unique UNIQUE (run_id);
  END IF;
EXCEPTION
  WHEN others THEN
    -- Se run_id tem duplicatas, não adicionar constraint
    RAISE NOTICE 'Could not add unique constraint for run_id: %', SQLERRM;
END $$;

-- 7. Comentários para documentação
COMMENT ON COLUMN public.pipeline_executions.run_id IS 'C05: UUID idempotente vindo do cliente para evitar duplicatas';
COMMENT ON COLUMN public.pipeline_executions.pipeline_version IS 'C05: Versão do pipeline (ex: v7-vv-1.0.0)';
COMMENT ON COLUMN public.pipeline_executions.commit_hash IS 'C05: Hash do commit/build para rastreabilidade';
COMMENT ON COLUMN public.pipeline_executions.mode IS 'C05: Modo de execução - create, reprocess, ou dry_run';
COMMENT ON COLUMN public.pipeline_executions.normalized_input IS 'C05: Input após normalização/validação';
COMMENT ON COLUMN public.pipeline_executions.dry_run_result IS 'C05: Resultado do dry-run (erros/warnings)';
COMMENT ON COLUMN public.pipeline_executions.output_content_hash IS 'C05: SHA-256 do lessons.content final para verificação';