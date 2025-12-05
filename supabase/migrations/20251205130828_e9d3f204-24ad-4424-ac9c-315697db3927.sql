-- Garantir que RLS está habilitado na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover política redundante (users_own já cobre tudo)
DROP POLICY IF EXISTS "users_can_insert_own" ON public.users;

-- A política "users_own" (ALL) já existe e cobre SELECT/INSERT/UPDATE/DELETE para o próprio usuário
-- A política "admins_view_all_users" já permite admins visualizarem todos os usuários

-- Adicionar política explícita de DELETE se não existir (para clareza)
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
CREATE POLICY "Users can delete own profile" ON public.users
FOR DELETE USING (auth.uid() = id);

-- Também habilitar RLS nas 5 tabelas críticas identificadas no scan
ALTER TABLE public.claude_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_alerts ENABLE ROW LEVEL SECURITY;