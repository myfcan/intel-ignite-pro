-- ============================================================================
-- FIX: Adicionar policies faltantes para user_playground_sessions
-- ============================================================================

-- Drop policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "playground_sessions_delete_own" ON public.user_playground_sessions;
DROP POLICY IF EXISTS "playground_sessions_admin_all" ON public.user_playground_sessions;

-- Policy: Usuários podem deletar suas próprias sessões
CREATE POLICY "playground_sessions_delete_own"
  ON public.user_playground_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins podem ver todas as sessões (para analytics)
CREATE POLICY "playground_sessions_admin_all"
  ON public.user_playground_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );