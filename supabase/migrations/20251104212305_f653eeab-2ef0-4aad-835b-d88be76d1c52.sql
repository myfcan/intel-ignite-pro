-- Remove políticas existentes se houver e recria
DROP POLICY IF EXISTS "Deny public access to users table" ON public.users;
DROP POLICY IF EXISTS "Deny public access to user profiles" ON public.user_profiles;

-- Tabela users: Nega acesso público/anônimo explicitamente
CREATE POLICY "Deny public access to users table"
ON public.users
FOR SELECT
TO anon
USING (false);

-- Tabela user_profiles: Nega acesso público/anônimo explicitamente  
CREATE POLICY "Deny public access to user profiles"
ON public.user_profiles
FOR SELECT
TO anon
USING (false);

-- Comentários explicativos
COMMENT ON POLICY "Deny public access to users table" ON public.users IS 'Explicitly denies unauthenticated access to prevent email harvesting';
COMMENT ON POLICY "Deny public access to user profiles" ON public.user_profiles IS 'Explicitly denies unauthenticated access to sensitive psychological profiling data';