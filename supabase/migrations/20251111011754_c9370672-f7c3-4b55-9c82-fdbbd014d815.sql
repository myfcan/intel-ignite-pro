-- Criar tabela de notificações de validação
CREATE TABLE IF NOT EXISTS public.validation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  guarantee_name TEXT NOT NULL,
  test_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  message TEXT NOT NULL,
  details JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Criar índice para consultas rápidas
CREATE INDEX idx_validation_alerts_resolved ON public.validation_alerts(resolved);
CREATE INDEX idx_validation_alerts_created_at ON public.validation_alerts(created_at DESC);
CREATE INDEX idx_validation_alerts_severity ON public.validation_alerts(severity);

-- Habilitar RLS
ALTER TABLE public.validation_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: apenas admins podem ver e gerenciar alertas
CREATE POLICY "Admins podem ver alertas"
  ON public.validation_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Admins podem criar alertas"
  ON public.validation_alerts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar alertas"
  ON public.validation_alerts
  FOR UPDATE
  USING (true);

CREATE POLICY "Admins podem deletar alertas"
  ON public.validation_alerts
  FOR DELETE
  USING (true);

COMMENT ON TABLE public.validation_alerts IS 'Armazena notificações automáticas de falhas no sistema de validação';