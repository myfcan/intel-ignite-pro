-- Adicionar política de INSERT para lessons
-- Permite que usuários autenticados possam criar lições
CREATE POLICY "Authenticated users can insert lessons"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Adicionar política de DELETE para lessons
-- Permite que usuários autenticados possam deletar lições
CREATE POLICY "Authenticated users can delete lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (true);