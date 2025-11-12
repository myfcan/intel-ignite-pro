-- Dropar política restritiva existente
DROP POLICY IF EXISTS "Authenticated users can insert lessons" ON public.lessons;

-- Recriar como PERMISSIVE (padrão)
CREATE POLICY "Authenticated users can insert lessons" 
ON public.lessons
AS PERMISSIVE  -- Esta é a chave!
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verificar e ajustar as outras políticas também
DROP POLICY IF EXISTS "Authenticated users can update lessons" ON public.lessons;
CREATE POLICY "Authenticated users can update lessons" 
ON public.lessons
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete lessons" ON public.lessons;
CREATE POLICY "Authenticated users can delete lessons" 
ON public.lessons
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);