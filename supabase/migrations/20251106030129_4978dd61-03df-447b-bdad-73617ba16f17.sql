-- Política RLS para permitir UPDATE na tabela lessons
-- Apenas usuários autenticados podem atualizar lições

CREATE POLICY "Authenticated users can update lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Comentário explicativo
COMMENT ON POLICY "Authenticated users can update lessons" ON public.lessons IS 
'Permite que usuários autenticados atualizem lições (necessário para admin tools)';