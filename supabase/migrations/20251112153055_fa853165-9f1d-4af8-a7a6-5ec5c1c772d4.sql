-- FASE 1: Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- FASE 2: Criar tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- FASE 3: Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- FASE 4: Criar política para user_roles (admins podem gerenciar)
CREATE POLICY "Service role can manage user roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- FASE 5: Criar função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- FASE 6: Atualizar políticas RLS de lessons
DROP POLICY IF EXISTS "Authenticated users can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can delete lessons" ON public.lessons;

CREATE POLICY "Admins can insert lessons"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- FASE 7: Inserir o usuário atual como admin (usando o user_id do primeiro usuário autenticado)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'fcanuto@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;