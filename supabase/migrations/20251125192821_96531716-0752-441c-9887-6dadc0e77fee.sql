-- Criar tabela de eventos de gamificação com idempotência
CREATE TABLE IF NOT EXISTS public.user_gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('lesson_completed', 'journey_completed', 'quiz_answered')),
  event_reference_id UUID,
  payload JSONB DEFAULT '{}'::jsonb,
  xp_delta INTEGER NOT NULL DEFAULT 0,
  coins_delta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, event_type, event_reference_id)
);

-- Criar índices para performance
CREATE INDEX idx_gamification_events_user_id ON public.user_gamification_events(user_id);
CREATE INDEX idx_gamification_events_created_at ON public.user_gamification_events(created_at DESC);
CREATE INDEX idx_gamification_events_type ON public.user_gamification_events(event_type);

-- Habilitar RLS
ALTER TABLE public.user_gamification_events ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus próprios eventos
CREATE POLICY "users_view_own_gamification_events"
ON public.user_gamification_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para sistema inserir eventos
CREATE POLICY "system_insert_gamification_events"
ON public.user_gamification_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Documentação
COMMENT ON TABLE public.user_gamification_events IS 'Log de eventos de gamificação com idempotência';
COMMENT ON COLUMN public.user_gamification_events.event_type IS 'Tipos: lesson_completed, journey_completed, quiz_answered';
COMMENT ON COLUMN public.user_gamification_events.event_reference_id IS 'ID da aula/jornada/quiz relacionado';
COMMENT ON COLUMN public.user_gamification_events.payload IS 'Dados adicionais do evento (score, metadata, etc)';
COMMENT ON COLUMN public.user_gamification_events.xp_delta IS 'XP ganho neste evento';
COMMENT ON COLUMN public.user_gamification_events.coins_delta IS 'Coins ganhos neste evento';