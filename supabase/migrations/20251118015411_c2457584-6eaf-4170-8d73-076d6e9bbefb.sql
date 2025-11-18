-- ========================================
-- 🧹 LIMPEZA: Remover políticas RLS duplicadas
-- ========================================

-- ========================================
-- DIAGNOSTIC_LOGS - Remover duplicadas antigas
-- ========================================
DROP POLICY IF EXISTS "Users can insert own logs" ON public.diagnostic_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.diagnostic_logs;
-- Mantém: users_insert_own_logs, users_view_own_logs, admins_view_all_diagnostic_logs

-- ========================================
-- USER_ACHIEVEMENTS - Remover duplicadas
-- ========================================
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conquistas" ON public.user_achievements;
DROP POLICY IF EXISTS "Sistema pode inserir conquistas" ON public.user_achievements;
-- Mantém: achievements_own, admins_view_all_achievements, admins_manage_achievements

-- ========================================
-- USERS - Remover duplicadas
-- ========================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON public.users;
-- Mantém: users_own, admins_view_all_users

-- ========================================
-- USER_PROGRESS - Remover duplicadas
-- ========================================
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
-- Mantém: progress_own, admins_view_all_progress

-- ========================================
-- USER_PROFILES - Remover duplicadas
-- ========================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
-- Mantém: Deny public access to user profiles, admins_view_all_profiles

-- E criar as políticas corretas para user_profiles
CREATE POLICY "users_view_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);