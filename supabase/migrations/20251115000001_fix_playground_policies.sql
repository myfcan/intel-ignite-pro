-- ============================================================================
-- FIX: Adicionar policies faltantes para user_playground_sessions
-- ============================================================================
-- A migration 20251115000000 criou a tabela, mas 2 policies falharam.
-- Este arquivo adiciona as policies que faltaram.
-- ============================================================================

-- Policy: Usuários podem deletar suas próprias sessões
CREATE POLICY IF NOT EXISTS "playground_sessions_delete_own"
  ON public.user_playground_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins podem ver todas as sessões (para analytics)
CREATE POLICY IF NOT EXISTS "playground_sessions_admin_all"
  ON public.user_playground_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- FIM DA FIX MIGRATION
-- ============================================================================
