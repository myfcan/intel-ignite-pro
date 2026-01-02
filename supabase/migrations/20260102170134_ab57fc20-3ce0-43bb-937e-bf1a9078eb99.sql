-- ============================================================================
-- FIX: Corrigir policies de SELECT na tabela lessons para serem PERMISSIVAS
-- O problema: Múltiplas policies restritivas bloqueiam acesso
-- A solução: Policies permissivas fazem OR entre elas
-- ============================================================================

-- Remover policies duplicadas de SELECT
DROP POLICY IF EXISTS "Anyone can view active lessons" ON public.lessons;
DROP POLICY IF EXISTS "lessons_public_read" ON public.lessons;

-- Criar UMA policy permissiva para leitura pública de aulas ativas
CREATE POLICY "public_read_active_lessons"
ON public.lessons
FOR SELECT
TO public
USING (is_active = true);

-- Manter admins com acesso total (já existe, mas garantir que é permissiva)
DROP POLICY IF EXISTS "admins_view_all_lessons" ON public.lessons;
CREATE POLICY "admins_view_all_lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));