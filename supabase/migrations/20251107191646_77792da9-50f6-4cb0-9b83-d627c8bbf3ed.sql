-- Criar tabela de logs de diagnóstico
CREATE TABLE public.diagnostic_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  lesson_id text NOT NULL,
  event_type text NOT NULL,
  audio_time numeric(10,2),
  current_section integer,
  target_section integer,
  performance_timestamp numeric(15,2),
  latency_ms numeric(10,2),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índices para queries rápidas
CREATE INDEX idx_diagnostic_logs_lesson ON public.diagnostic_logs(lesson_id, created_at);
CREATE INDEX idx_diagnostic_logs_event ON public.diagnostic_logs(event_type);

-- Habilitar RLS
ALTER TABLE public.diagnostic_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own logs"
  ON public.diagnostic_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own logs"
  ON public.diagnostic_logs FOR SELECT
  USING (auth.uid() = user_id);