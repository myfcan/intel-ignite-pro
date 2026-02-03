-- Tabela de auditoria para migrações de lições (v4.1)
CREATE TABLE public.lesson_migrations_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  run_id UUID NOT NULL,
  migration_version TEXT NOT NULL,
  migration_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (migration_status IN ('pending', 'in_progress', 'completed', 'failed')),
  old_content JSONB NOT NULL,
  new_content JSONB,
  diff_summary JSONB,
  triggered_by TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT unique_lesson_run UNIQUE(lesson_id, run_id)
);

-- Índices para queries de auditoria
CREATE INDEX idx_migrations_lesson ON public.lesson_migrations_audit(lesson_id);
CREATE INDEX idx_migrations_status ON public.lesson_migrations_audit(migration_status);
CREATE INDEX idx_migrations_version ON public.lesson_migrations_audit(migration_version);
CREATE INDEX idx_migrations_run ON public.lesson_migrations_audit(run_id);

-- RLS com USING + WITH CHECK para INSERT
ALTER TABLE public.lesson_migrations_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access"
ON public.lesson_migrations_audit
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "admins_read_audits"
ON public.lesson_migrations_audit
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));