-- Remove a política que permite ver todos os campos antes de completar
DROP POLICY IF EXISTS "Users can view exercise questions" ON public.exercises;

-- Mantém apenas a política que permite ver exercícios completos (com respostas)
-- após o usuário completar a lição
-- A política "Authenticated users can view exercises with answers after completion" já existe

-- Para acessar exercícios antes da conclusão, o frontend deve usar a view exercises_public
COMMENT ON VIEW public.exercises_public IS 'Use this view to show exercises to users before completion - hides answers and explanations';
COMMENT ON TABLE public.exercises IS 'Direct access restricted - use exercises_public view for pre-completion access';