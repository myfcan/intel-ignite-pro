-- CORREÇÃO 4 E 3: Alterar default de is_active + Atualizar função create_lesson_draft

-- 1. Alterar default de is_active para false (segurança)
ALTER TABLE public.lessons 
ALTER COLUMN is_active SET DEFAULT false;

-- 2. Atualizar lições incompletas existentes (se houver)
UPDATE public.lessons 
SET is_active = false 
WHERE is_active = true 
  AND (content = '{}'::jsonb OR content IS NULL OR exercises = '[]'::jsonb OR exercises IS NULL);

-- 3. Atualizar função create_lesson_draft para aceitar parâmetros separados
CREATE OR REPLACE FUNCTION public.create_lesson_draft(
  p_title text,
  p_trail_id uuid,
  p_order_index integer,
  p_estimated_time integer,
  p_content jsonb,
  p_exercises jsonb DEFAULT '[]'::jsonb,
  p_audio_url text DEFAULT null,
  p_word_timestamps jsonb DEFAULT null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- Inserir a lição com todos os campos separados corretamente
  INSERT INTO public.lessons (
    title,
    lesson_type,
    trail_id,
    order_index,
    difficulty_level,
    estimated_time,
    is_active,
    content,
    exercises,
    exercises_version,
    audio_url,
    word_timestamps
  )
  VALUES (
    p_title,
    'guided',
    p_trail_id,
    p_order_index,
    'beginner',
    p_estimated_time,
    false,  -- Sempre começa como false (segurança)
    p_content,  -- Content separado (sem exercises misturados)
    p_exercises,  -- Exercises separado
    1,  -- Versão inicial dos exercícios
    p_audio_url,  -- Audio URL separado (V1/V3)
    p_word_timestamps  -- Timestamps separados (V1/V3)
  )
  RETURNING id INTO v_lesson_id;

  RETURN v_lesson_id;
END;
$function$;