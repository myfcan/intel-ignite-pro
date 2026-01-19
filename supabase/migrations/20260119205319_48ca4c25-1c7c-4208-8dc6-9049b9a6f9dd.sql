-- Fase 2: Criar tabela v7_debug_reports para persistir histórico de debug
CREATE TABLE public.v7_debug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL,
  lesson_title TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'pipeline' CHECK (source IN ('pipeline', 'player', 'combined')),
  schema_version TEXT NOT NULL DEFAULT '1.0.0',
  
  -- Health summary
  health_score INTEGER NOT NULL DEFAULT 100,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  total_issues INTEGER NOT NULL DEFAULT 0,
  
  -- Detailed reports (JSONB for flexibility)
  audio_report JSONB,
  timeline_report JSONB,
  execution_report JSONB,
  rendering_report JSONB,
  player_report JSONB,
  summary_report JSONB NOT NULL,
  all_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.v7_debug_reports ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage debug reports"
ON public.v7_debug_reports
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Index for fast queries by lesson and severity
CREATE INDEX idx_v7_debug_reports_lesson_id ON public.v7_debug_reports(lesson_id);
CREATE INDEX idx_v7_debug_reports_severity ON public.v7_debug_reports(severity);
CREATE INDEX idx_v7_debug_reports_created_at ON public.v7_debug_reports(created_at DESC);

-- Comment for documentation
COMMENT ON TABLE public.v7_debug_reports IS 'Armazena relatórios de debug do pipeline e player V7 para diagnóstico';