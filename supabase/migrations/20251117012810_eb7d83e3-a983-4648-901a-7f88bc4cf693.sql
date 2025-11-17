-- ============================================
-- FASE 1: Corrigir system_logs (prevenir quebra)
-- ============================================

-- Drop policy if exists to avoid conflicts
DROP POLICY IF EXISTS "Service role can manage system logs" ON public.system_logs;

-- Criar política para service_role gerenciar logs
CREATE POLICY "Service role can manage system logs"
ON public.system_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- FASE 2: Corrigir validation_alerts (segurança crítica)
-- ============================================

-- Deletar políticas inseguras que usam "true"
DROP POLICY IF EXISTS "Admins podem criar alertas" ON public.validation_alerts;
DROP POLICY IF EXISTS "Admins podem ver alertas" ON public.validation_alerts;
DROP POLICY IF EXISTS "Admins podem atualizar alertas" ON public.validation_alerts;
DROP POLICY IF EXISTS "Admins podem deletar alertas" ON public.validation_alerts;
DROP POLICY IF EXISTS "Only admins can manage validation alerts" ON public.validation_alerts;

-- Criar política segura com validação real de admin
CREATE POLICY "Only admins can manage validation alerts"
ON public.validation_alerts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============================================
-- FASE 3: Corrigir pipeline_executions (privacidade)
-- ============================================

-- Deletar políticas muito permissivas
DROP POLICY IF EXISTS "Authenticated users can view all executions" ON public.pipeline_executions;
DROP POLICY IF EXISTS "Authenticated users can update executions" ON public.pipeline_executions;
DROP POLICY IF EXISTS "Users can view own or admin can view all executions" ON public.pipeline_executions;
DROP POLICY IF EXISTS "Users can update own or admin can update all executions" ON public.pipeline_executions;

-- SELECT: Ver apenas próprias execuções OU ser admin
CREATE POLICY "Users can view own or admin can view all executions"
ON public.pipeline_executions
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() 
  OR has_role(auth.uid(), 'admin')
);

-- UPDATE: Editar apenas próprias execuções OU ser admin
CREATE POLICY "Users can update own or admin can update all executions"
ON public.pipeline_executions
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() 
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  created_by = auth.uid() 
  OR has_role(auth.uid(), 'admin')
);

-- ============================================
-- FASE 4: Habilitar RLS nas 5 tabelas
-- ============================================

ALTER TABLE public.claude_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_alerts ENABLE ROW LEVEL SECURITY;