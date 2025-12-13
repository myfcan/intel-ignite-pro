-- =====================================================
-- FIX IMEDIATO: Garantir acesso admin para fcanuto@gmail.com
-- =====================================================
-- Execute este script no Lovable para corrigir O PROBLEMA AGORA
-- sem precisar esperar deploy de migration
-- =====================================================

-- 1. Verificar se o usuário existe e obter seu ID
DO $$
DECLARE
  admin_user_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- Buscar o user_id do email admin
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'fcanuto@gmail.com'
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION '❌ ERRO: Usuário fcanuto@gmail.com não encontrado em auth.users!';
  END IF;

  RAISE NOTICE '✅ Usuário encontrado: %', admin_user_id;

  -- Verificar se já existe na tabela user_roles
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = admin_user_id AND role = 'admin'
  ) INTO admin_exists;

  IF admin_exists THEN
    RAISE NOTICE '⚠️  Usuário JÁ está registrado como admin em user_roles';
  ELSE
    -- Inserir como admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role);

    RAISE NOTICE '✅ Admin adicionado com sucesso!';
  END IF;

  -- Verificação final
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = admin_user_id AND role = 'admin'
  ) INTO admin_exists;

  IF admin_exists THEN
    RAISE NOTICE '✅✅✅ CONFIRMADO: fcanuto@gmail.com está como ADMIN!';
  ELSE
    RAISE EXCEPTION '❌ ERRO: Falha ao configurar admin!';
  END IF;
END $$;

-- 2. Exibir resultado final para confirmação
SELECT
  u.id,
  u.email,
  ur.role,
  ur.created_at as "admin_desde"
FROM auth.users u
INNER JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'fcanuto@gmail.com' AND ur.role = 'admin';

-- =====================================================
-- O QUE FAZER DEPOIS DE EXECUTAR:
-- =====================================================
-- 1. Copie este script INTEIRO
-- 2. Cole no Lovable (SQL Editor ou Database)
-- 3. Execute
-- 4. Verifique que aparece: "✅✅✅ CONFIRMADO: fcanuto@gmail.com está como ADMIN!"
-- 5. Faça LOGOUT da plataforma
-- 6. Faça LOGIN novamente com fcanuto@gmail.com
-- 7. Teste acessar QUALQUER aula/trilha
-- =====================================================
