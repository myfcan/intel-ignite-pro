-- Corrige a view para usar SECURITY INVOKER ao invés de SECURITY DEFINER
-- Isso faz com que a view use as permissões do usuário que está consultando
DROP VIEW IF EXISTS public.exercises_public;

CREATE OR REPLACE VIEW public.exercises_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  lesson_id,
  question,
  options,
  type,
  order_index,
  created_at
FROM public.exercises;

-- Permite acesso público à view
GRANT SELECT ON public.exercises_public TO anon, authenticated;

COMMENT ON VIEW public.exercises_public IS 'Public view of exercises without answers - uses security invoker for proper RLS';