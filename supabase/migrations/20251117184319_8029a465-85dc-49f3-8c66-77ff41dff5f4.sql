-- 🔒 CORREÇÃO CRÍTICA: Remover vulnerabilidade RLS que permite inserts não autenticados
DROP POLICY IF EXISTS "Allow insert via security definer or admin" ON public.lessons;

-- Criar nova policy SEGURA: apenas admins autenticados podem inserir
CREATE POLICY "Allow insert via security definer or admin"
ON public.lessons
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));