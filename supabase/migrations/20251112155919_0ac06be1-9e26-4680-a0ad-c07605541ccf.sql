-- CORREÇÃO DEFINITIVA DO PROBLEMA RLS
-- Criar função de debug para verificar contexto de auth
CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS TABLE (
  current_user_id UUID,
  user_role TEXT,
  is_authenticated BOOLEAN
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

-- Criar função SECURITY DEFINER para criar lesson draft (bypass RLS)
CREATE OR REPLACE FUNCTION public.create_lesson_draft(
  p_title TEXT,
  p_trail_id UUID,
  p_order_index INTEGER,
  p_estimated_time INTEGER,
  p_content JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se usuário é admin
  SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Apenas admins podem criar lições';
  END IF;

  -- Inserir a lição
  INSERT INTO public.lessons (
    title,
    lesson_type,
    trail_id,
    order_index,
    difficulty_level,
    estimated_time,
    is_active,
    audio_url,
    content,
    word_timestamps
  )
  VALUES (
    p_title,
    'guided',
    p_trail_id,
    p_order_index,
    'beginner',
    p_estimated_time,
    false,
    null,
    p_content,
    null
  )
  RETURNING id INTO v_lesson_id;

  RETURN v_lesson_id;
END;
$$;