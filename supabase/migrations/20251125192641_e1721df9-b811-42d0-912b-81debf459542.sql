-- Adicionar campos de gamificação à tabela users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS power_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS patent_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gamification_updated_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_power_score ON public.users(power_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_patent_level ON public.users(patent_level);

-- Adicionar comentários de documentação
COMMENT ON COLUMN public.users.power_score IS 'XP total acumulado (gamificação)';
COMMENT ON COLUMN public.users.coins IS 'Moedas/créditos de IA acumulados';
COMMENT ON COLUMN public.users.patent_level IS '0=Sem patente, 1=Operador, 2=Executor, 3=Estrategista';
COMMENT ON COLUMN public.users.gamification_updated_at IS 'Última atualização dos dados de gamificação';