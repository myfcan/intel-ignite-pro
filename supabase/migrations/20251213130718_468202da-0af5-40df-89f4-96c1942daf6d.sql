-- Admin pode gerenciar cache do Claude (para debugging)
CREATE POLICY "admins_manage_claude_cache"
ON public.claude_cache
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));