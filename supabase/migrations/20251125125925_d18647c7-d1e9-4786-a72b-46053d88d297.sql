-- Criar trigger para adicionar usuários automaticamente na tabela users quando se registram
-- Isso permite que novos usuários (perfil aluno) sejam criados automaticamente

-- Primeiro, garantir que a função handle_new_user existe e está correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir novo usuário na tabela users com valores padrão
  INSERT INTO public.users (
    id, 
    email, 
    name,
    total_points, 
    streak_days, 
    total_lessons_completed,
    onboarding_completed,
    plan
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    0,
    0,
    0,
    false,
    'basico'
  );
  
  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar o trigger que chama a função quando um novo usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Garantir que a política RLS permite inserção via trigger (SECURITY DEFINER)
-- A política users_own já permite que o usuário gerencie seus próprios dados
-- Mas precisamos garantir que o INSERT via trigger funcione

-- Adicionar política para permitir INSERT do próprio usuário
DROP POLICY IF EXISTS "users_can_insert_own" ON public.users;
CREATE POLICY "users_can_insert_own"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);