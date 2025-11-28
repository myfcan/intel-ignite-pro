-- Criar tabela para rastrear prompts desbloqueados por créditos
CREATE TABLE IF NOT EXISTS public.user_unlocked_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  credits_spent INTEGER NOT NULL DEFAULT 1000,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Habilitar RLS
ALTER TABLE public.user_unlocked_prompts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seus próprios prompts desbloqueados"
  ON public.user_unlocked_prompts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir prompts desbloqueados"
  ON public.user_unlocked_prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_user_unlocked_prompts_user_id ON public.user_unlocked_prompts(user_id);
CREATE INDEX idx_user_unlocked_prompts_prompt_id ON public.user_unlocked_prompts(prompt_id);