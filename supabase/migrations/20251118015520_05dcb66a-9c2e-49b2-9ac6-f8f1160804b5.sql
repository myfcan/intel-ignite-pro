-- ========================================
-- 🧹 LIMPEZA FINAL: Remover vulnerabilidades restantes
-- ========================================

-- 1️⃣ COMMUNITY_POSTS: Remover política pública perigosa
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;

-- 2️⃣ DIAGNOSTIC_LOGS: Remover duplicatas
DROP POLICY IF EXISTS "Users can insert own logs" ON public.diagnostic_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.diagnostic_logs;

-- 3️⃣ USER_ACHIEVEMENTS: Remover duplicatas
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conquistas" ON public.user_achievements;
DROP POLICY IF EXISTS "Sistema pode inserir conquistas" ON public.user_achievements;

-- 4️⃣ USER_PROGRESS: Remover duplicatas  
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;

-- 5️⃣ USER_PROFILES: Remover duplicatas
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

-- 6️⃣ USERS: Remover duplicatas
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.users;