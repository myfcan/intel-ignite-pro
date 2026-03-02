
-- GAP 5: Corrigir aula existente
UPDATE lessons SET model = 'v8' WHERE id = 'b92124bd-4243-4ee1-ad88-d2a520dd1f4b' AND model IS NULL;

-- GAP 2: Adicionar p_model à função create_lesson_draft
CREATE OR REPLACE FUNCTION public.create_lesson_draft(
  p_title text,
  p_trail_id uuid,
  p_order_index integer,
  p_estimated_time integer,
  p_content jsonb,
  p_exercises jsonb DEFAULT '[]'::jsonb,
  p_audio_url text DEFAULT NULL::text,
  p_word_timestamps jsonb DEFAULT NULL::jsonb,
  p_model text DEFAULT NULL::text
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
  SELECT public.has_role(auth.uid(), 'admin') INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Apenas admins podem criar lições';
  END IF;

  SET LOCAL row_security = off;

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
    word_timestamps,
    model
  )
  VALUES (
    p_title,
    'guided',
    p_trail_id,
    p_order_index,
    'beginner',
    p_estimated_time,
    false,
    p_content,
    p_exercises,
    1,
    p_audio_url,
    p_word_timestamps,
    p_model
  )
  RETURNING id INTO v_lesson_id;

  RETURN v_lesson_id;
END;
$function$;
