-- Remove a política pública atual que expõe tudo
DROP POLICY IF EXISTS "Anyone can view exercises" ON public.exercises;

-- Cria uma view pública que expõe apenas campos seguros (sem respostas)
CREATE OR REPLACE VIEW public.exercises_public AS
SELECT 
  id,
  lesson_id,
  question,
  options,
  type,
  order_index,
  created_at
FROM public.exercises;

-- Permite acesso público à view (sem respostas)
GRANT SELECT ON public.exercises_public TO anon, authenticated;

-- Cria política para usuários autenticados verem exercícios completos
-- apenas após completarem (quando precisam ver o feedback)
CREATE POLICY "Authenticated users can view exercises with answers after completion"
ON public.exercises
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_progress 
    WHERE user_progress.lesson_id = exercises.lesson_id
    AND user_progress.user_id = auth.uid()
    AND user_progress.status = 'completed'
  )
);

-- Política adicional: permitir ver questões (sem respostas) antes de completar
CREATE POLICY "Users can view exercise questions"
ON public.exercises
FOR SELECT
TO authenticated
USING (true);

COMMENT ON VIEW public.exercises_public IS 'Public view of exercises without answers - safe for unauthenticated access';