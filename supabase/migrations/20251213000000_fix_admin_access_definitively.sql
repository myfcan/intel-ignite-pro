-- =====================================================
-- CORREÇÃO DEFINITIVA: Admin tem acesso TOTAL a tudo
-- =====================================================
-- Esta migration garante que fcanuto@gmail.com sempre
-- tenha permissões de admin, independente de quando
-- a conta foi criada.
-- =====================================================

-- PASSO 1: Garantir que fcanuto@gmail.com está na tabela user_roles como admin
-- Usa INSERT com ON CONFLICT para não dar erro se já existir
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar o user_id do email admin
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'fcanuto@gmail.com'
  LIMIT 1;

  -- Se encontrou o usuário, garantir que ele está como admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE '✅ Admin fcanuto@gmail.com configurado com sucesso!';
  ELSE
    RAISE NOTICE '⚠️  Usuário fcanuto@gmail.com ainda não existe em auth.users';
  END IF;
END $$;

-- PASSO 2: Criar função helper para verificar se é admin por email
-- Esta função é útil para verificações rápidas no código
CREATE OR REPLACE FUNCTION public.is_admin_by_email(_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    INNER JOIN public.user_roles ur ON u.id = ur.user_id
    WHERE u.email = _email
      AND ur.role = 'admin'
  );
$$;

-- PASSO 3: Criar função para verificar se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- PASSO 4: Comentários para documentação
COMMENT ON FUNCTION public.is_admin_by_email IS
'Verifica se um email específico tem permissões de admin. Útil para verificações no código.';

COMMENT ON FUNCTION public.is_current_user_admin IS
'Verifica se o usuário autenticado atual é admin. Útil para RLS policies e verificações de permissão.';

-- PASSO 5: Criar view auxiliar para facilitar queries de admin
CREATE OR REPLACE VIEW public.admin_users AS
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data,
  u.created_at,
  ur.role
FROM auth.users u
INNER JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

COMMENT ON VIEW public.admin_users IS
'View que lista todos os usuários com permissões de admin. Útil para auditorias e verificações.';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ fcanuto@gmail.com está garantido como admin
-- ✅ Funções helper criadas para verificações rápidas
-- ✅ View admin_users disponível para consultas
-- ✅ Todas as verificações de isAdmin no código funcionarão
-- =====================================================
