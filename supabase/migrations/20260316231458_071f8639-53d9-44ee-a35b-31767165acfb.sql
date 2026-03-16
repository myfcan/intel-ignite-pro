
-- 1. Adicionar coluna narration_script em v10_lesson_steps
ALTER TABLE public.v10_lesson_steps
ADD COLUMN IF NOT EXISTS narration_script text;

-- 2. Criar tabela v10_lesson_step_anchors
CREATE TABLE IF NOT EXISTS public.v10_lesson_step_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES public.v10_lesson_steps(id) ON DELETE CASCADE,
  anchor_type text NOT NULL,
  timestamp_seconds numeric NOT NULL,
  match_phrase text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. RLS
ALTER TABLE public.v10_lesson_step_anchors ENABLE ROW LEVEL SECURITY;

-- 4. Policy: admins full access
CREATE POLICY "admins_all_v10_step_anchors"
  ON public.v10_lesson_step_anchors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Policy: public read for published lessons
CREATE POLICY "public_read_v10_step_anchors"
  ON public.v10_lesson_step_anchors FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM public.v10_lesson_steps s
    JOIN public.v10_lessons l ON l.id = s.lesson_id
    WHERE s.id = v10_lesson_step_anchors.step_id
    AND l.status = 'published'
  ));
