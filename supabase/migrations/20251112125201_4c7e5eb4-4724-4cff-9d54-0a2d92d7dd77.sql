-- FASE 3: Testar política RLS com auth.uid() explícito e logging (CORRIGIDO)

-- Dropar política existente
DROP POLICY IF EXISTS "Authenticated users can insert lessons" ON public.lessons;

-- Recriar com validação explícita de auth.uid()
CREATE POLICY "Authenticated users can insert lessons" 
ON public.lessons
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  -- Verificação explícita: auth.uid() deve existir
  auth.uid() IS NOT NULL
);

-- Criar função helper para debug de contexto de autenticação
CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS TABLE(
  current_user_id uuid,
  user_role text,
  is_authenticated boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() as current_user_id,
    current_setting('request.jwt.claims', true)::json->>'role' as user_role,
    auth.uid() IS NOT NULL as is_authenticated;
$$;

-- Grant execute para authenticated users
GRANT EXECUTE ON FUNCTION public.debug_auth_context() TO authenticated;