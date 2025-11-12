-- Atualizar função create_lesson_draft para bypassar RLS durante INSERT
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
SET search_path = 'public'
AS $$
DECLARE
  v_lesson_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Verificar se usuário é admin (fail-fast para segurança)
  SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Apenas admins podem criar lições';
  END IF;

  -- CRÍTICO: Desabilitar RLS temporariamente para este INSERT
  -- Isso resolve o problema de auth.uid() retornar NULL dentro do contexto SECURITY DEFINER
  SET LOCAL row_security = off;

  -- Inserir a lição (agora SEM verificar políticas RLS)
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