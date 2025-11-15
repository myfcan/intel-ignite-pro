-- ============================================================================
-- MIGRATION: user_playground_sessions
-- DATA: 2025-11-15
-- OBJETIVO: Criar tabela para salvar sessões de playground com IA real
-- ============================================================================
--
-- Esta migration cria a infraestrutura necessária para salvar as interações
-- dos usuários com o playground mid-lesson que usa IA real (Gemini).
--
-- COMPONENTES RELACIONADOS:
--   - Edge Function: supabase/functions/lesson-playground/index.ts
--   - UI Component: src/components/lessons/PlaygroundMidLesson.tsx
--   - Pipeline Step: src/lib/lessonPipeline/step5-5-process-playground.ts
--
-- GITHUB SEARCH: "user_playground_sessions", "lesson-playground"
--
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA user_playground_sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_playground_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,

  -- Dados da interação
  user_prompt TEXT NOT NULL,
  ai_response TEXT,
  ai_feedback TEXT,

  -- Métricas
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índice para consultas
  CONSTRAINT user_playground_sessions_user_lesson_idx
    UNIQUE (user_id, lesson_id, created_at)
);

-- ============================================================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice para buscar sessões por usuário
CREATE INDEX IF NOT EXISTS idx_playground_sessions_user
  ON public.user_playground_sessions(user_id, created_at DESC);

-- Índice para buscar sessões por lição
CREATE INDEX IF NOT EXISTS idx_playground_sessions_lesson
  ON public.user_playground_sessions(lesson_id, created_at DESC);

-- Índice para buscar sessões por usuário + lição
CREATE INDEX IF NOT EXISTS idx_playground_sessions_user_lesson
  ON public.user_playground_sessions(user_id, lesson_id);

-- ============================================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.user_playground_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CRIAR POLICIES DE SEGURANÇA
-- ============================================================================

-- Policy: Usuários podem inserir suas próprias sessões
CREATE POLICY "playground_sessions_insert_own"
  ON public.user_playground_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem ver suas próprias sessões
CREATE POLICY "playground_sessions_select_own"
  ON public.user_playground_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias sessões
CREATE POLICY "playground_sessions_delete_own"
  ON public.user_playground_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Admins podem ver todas as sessões (para analytics)
CREATE POLICY "playground_sessions_admin_all"
  ON public.user_playground_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE public.user_playground_sessions IS
  'Salva as interações dos usuários com playground mid-lesson que usa IA real (Gemini). Cada registro representa uma sessão onde o usuário enviou um prompt e recebeu resposta da IA.';

COMMENT ON COLUMN public.user_playground_sessions.user_prompt IS
  'Prompt enviado pelo usuário para a IA';

COMMENT ON COLUMN public.user_playground_sessions.ai_response IS
  'Resposta gerada pela IA (Gemini 2.5 Flash) baseada no prompt';

COMMENT ON COLUMN public.user_playground_sessions.ai_feedback IS
  'Feedback construtivo gerado pela IA sobre a qualidade do prompt';

COMMENT ON COLUMN public.user_playground_sessions.tokens_used IS
  'Total de tokens consumidos (resposta + feedback) para tracking de custos';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
