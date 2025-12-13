
-- ================================================================
-- AUDITORIA ADMIN: Políticas RLS para acesso total de administradores
-- ================================================================

-- 1. TRAILS - Admin pode gerenciar todas as trilhas
CREATE POLICY "admins_manage_all_trails"
ON public.trails
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. MISSOES_DIARIAS - Admin pode ver e gerenciar todas as missões
CREATE POLICY "admins_manage_all_missoes_diarias"
ON public.missoes_diarias
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. POINTS_HISTORY - Admin pode ver todo histórico de pontos
CREATE POLICY "admins_manage_all_points_history"
ON public.points_history
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. PRICING_SESSIONS - Admin pode ver todas as sessões de preço
CREATE POLICY "admins_manage_all_pricing_sessions"
ON public.pricing_sessions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. SAVED_TEMPLATES - Admin pode ver todos os templates salvos
CREATE POLICY "admins_manage_all_saved_templates"
ON public.saved_templates
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 6. USER_GAMIFICATION_EVENTS - Admin pode ver todos os eventos
CREATE POLICY "admins_manage_all_gamification_events"
ON public.user_gamification_events
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 7. USER_GUIDE_PROGRESS - Admin pode ver todo progresso de guias
CREATE POLICY "admins_manage_all_guide_progress"
ON public.user_guide_progress
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 8. USER_ONBOARDING_ANSWERS - Admin pode ver todas as respostas
CREATE POLICY "admins_manage_all_onboarding_answers"
ON public.user_onboarding_answers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 9. USER_UNLOCKED_PROMPTS - Admin pode ver todos os prompts desbloqueados
CREATE POLICY "admins_manage_all_unlocked_prompts"
ON public.user_unlocked_prompts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 10. USER_ROLES - Admin pode ver todos os roles (importante para gestão)
CREATE POLICY "admins_manage_all_user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 11. LESSONS - Garantir que admin veja TODAS as aulas (inclusive inativas)
-- A política atual só mostra aulas ativas para usuários comuns
DROP POLICY IF EXISTS "admins_view_all_lessons" ON public.lessons;
CREATE POLICY "admins_view_all_lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 12. DIAGNOSTIC_LOGS - Admin pode gerenciar todos os logs (não só ver)
DROP POLICY IF EXISTS "admins_manage_all_diagnostic_logs" ON public.diagnostic_logs;
CREATE POLICY "admins_manage_all_diagnostic_logs"
ON public.diagnostic_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 13. SYSTEM_LOGS - Admin pode gerenciar todos os logs do sistema
DROP POLICY IF EXISTS "admins_manage_all_system_logs" ON public.system_logs;
CREATE POLICY "admins_manage_all_system_logs"
ON public.system_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 14. USER_PROFILES - Admin pode gerenciar todos os perfis (não só ver)
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_manage_all_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 15. USER_PROGRESS - Admin pode gerenciar todo progresso (não só ver)
DROP POLICY IF EXISTS "admins_manage_all_progress" ON public.user_progress;
CREATE POLICY "admins_manage_all_progress"
ON public.user_progress
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 16. USERS - Admin pode gerenciar todos os usuários (não só ver)
DROP POLICY IF EXISTS "admins_manage_all_users" ON public.users;
CREATE POLICY "admins_manage_all_users"
ON public.users
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
