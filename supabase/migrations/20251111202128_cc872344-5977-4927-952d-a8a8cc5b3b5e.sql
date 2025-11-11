-- Criar tabela para execuções do pipeline
CREATE TABLE IF NOT EXISTS public.pipeline_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_title TEXT NOT NULL,
  model TEXT NOT NULL CHECK (model IN ('v1', 'v2')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 8,
  lesson_id UUID,
  track_id UUID,
  track_name TEXT,
  order_index INTEGER,
  
  -- Dados estruturados
  input_data JSONB NOT NULL,
  output_data JSONB DEFAULT '{}'::jsonb,
  
  -- Logs e progresso
  logs JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  
  -- Progresso detalhado por step
  step_progress JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pipeline_executions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (apenas usuários autenticados)
CREATE POLICY "Authenticated users can view all executions"
ON public.pipeline_executions
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create executions"
ON public.pipeline_executions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update executions"
ON public.pipeline_executions
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Habilitar Realtime para monitoramento
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_executions;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pipeline_executions_updated_at
BEFORE UPDATE ON public.pipeline_executions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Criar índices para performance
CREATE INDEX idx_pipeline_executions_status ON public.pipeline_executions(status);
CREATE INDEX idx_pipeline_executions_created_at ON public.pipeline_executions(created_at DESC);
CREATE INDEX idx_pipeline_executions_lesson_id ON public.pipeline_executions(lesson_id);