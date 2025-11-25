-- Criar tabela para rastrear progresso dos usuários nos guias
CREATE TABLE IF NOT EXISTS public.user_guide_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, guide_id)
);

-- Habilitar RLS
ALTER TABLE public.user_guide_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuários podem ver apenas seu próprio progresso
CREATE POLICY "Usuários podem ver seu próprio progresso"
ON public.user_guide_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Políticas RLS: usuários podem inserir seu próprio progresso
CREATE POLICY "Usuários podem inserir seu próprio progresso"
ON public.user_guide_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS: usuários podem atualizar seu próprio progresso
CREATE POLICY "Usuários podem atualizar seu próprio progresso"
ON public.user_guide_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_guide_progress_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_guide_progress_updated_at
BEFORE UPDATE ON public.user_guide_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_guide_progress_updated_at();