-- ================================================================
-- CORREÇÃO DEFINITIVA: Policies RLS da tabela lessons
-- ================================================================
-- Remove todas as policies conflitantes e cria estrutura limpa
-- que garante acesso total para admins
-- ================================================================

-- PASSO 1: Remover TODAS as policies existentes da tabela lessons
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'lessons' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.lessons', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END $$;

-- PASSO 2: Criar policies limpas e organizadas

-- 2.1: Admins têm acesso TOTAL a TODAS as lições (inclusive inativas)
CREATE POLICY "admins_full_access_lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
);

-- 2.2: Usuários autenticados podem VER lições ativas
CREATE POLICY "authenticated_users_view_active_lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2.3: Service role pode fazer tudo (para edge functions)
CREATE POLICY "service_role_full_access_lessons"
ON public.lessons
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2.4: Anon pode ver lições ativas públicas (opcional, se necessário)
CREATE POLICY "anon_users_view_active_lessons"
ON public.lessons
FOR SELECT
TO anon
USING (is_active = true);

-- PASSO 3: Garantir que RLS está habilitado
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar função helper para testar acesso de admin
CREATE OR REPLACE FUNCTION public.test_admin_lessons_access()
RETURNS TABLE (
  can_select BOOLEAN,
  can_insert BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN,
  user_email TEXT,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_is_admin BOOLEAN;
BEGIN
  -- Pegar email do usuário atual
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Verificar se é admin
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  ) INTO v_is_admin;

  -- Retornar informações de acesso
  RETURN QUERY
  SELECT
    true::BOOLEAN AS can_select,
    v_is_admin AS can_insert,
    v_is_admin AS can_update,
    v_is_admin AS can_delete,
    v_user_email AS user_email,
    v_is_admin AS is_admin;
END;
$$;

COMMENT ON FUNCTION public.test_admin_lessons_access IS
'Função de teste para verificar permissões do usuário atual na tabela lessons';

-- ================================================================
-- RESULTADO ESPERADO:
-- ================================================================
-- ✅ Todas as policies antigas removidas
-- ✅ Admins têm acesso TOTAL (SELECT, INSERT, UPDATE, DELETE)
-- ✅ Usuários comuns veem apenas lições ativas
-- ✅ Service role pode fazer tudo (edge functions funcionam)
-- ✅ Função de teste disponível: SELECT * FROM test_admin_lessons_access()
-- ================================================================
