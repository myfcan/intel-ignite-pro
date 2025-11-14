-- =============================================
-- FASE 1: RECRIAR RLS (11 POLÍTICAS SIMPLES)
-- =============================================

-- 1. LESSONS
CREATE POLICY "lessons_public_read" ON lessons 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "lessons_admin_all" ON lessons 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 2. TRAILS  
CREATE POLICY "trails_public_read" ON trails 
  FOR SELECT 
  USING (is_active = true);

-- 3. USER_PROGRESS
CREATE POLICY "progress_own" ON user_progress 
  FOR ALL 
  USING (user_id = auth.uid());

-- 4. USERS
CREATE POLICY "users_own" ON users 
  FOR ALL 
  USING (id = auth.uid());

CREATE POLICY "users_ranking_read" ON users 
  FOR SELECT 
  USING (true);

-- 5. GAMIFICAÇÃO
CREATE POLICY "achievements_own" ON user_achievements 
  FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "points_own" ON points_history 
  FOR ALL 
  USING (user_id = auth.uid());

-- 6. DESABILITAR RLS EM TABELAS DE SISTEMA
ALTER TABLE IF EXISTS claude_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diagnostic_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pipeline_executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS validation_alerts DISABLE ROW LEVEL SECURITY;

-- =============================================
-- FASE 3: CRIAR TABELAS FALTANTES
-- =============================================

-- TABELA: system_logs (para logging robusto)
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('erro', 'info', 'sucesso', 'warning')),
  contexto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sem RLS (apenas sistema escreve)
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_system_logs_tipo ON system_logs(tipo);
CREATE INDEX IF NOT EXISTS idx_system_logs_contexto ON system_logs(contexto);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

-- TABELA: missoes_diarias (para gamificação)
CREATE TABLE IF NOT EXISTS missoes_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  
  missoes JSONB NOT NULL DEFAULT '[]',
  
  todas_completas BOOLEAN DEFAULT false,
  bonus_resgatado BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, data)
);

-- Policy: cada um vê suas missões
CREATE POLICY "missoes_own" ON missoes_diarias 
  FOR ALL 
  USING (user_id = auth.uid());

-- ADICIONAR COLUNAS EM LESSONS
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'processando', 'pronta', 'erro'));
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS progresso_criacao INTEGER DEFAULT 0 CHECK (progresso_criacao >= 0 AND progresso_criacao <= 100);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS fase_criacao TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS erro_criacao TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_urls TEXT[];

-- Índices para busca eficiente
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_trail_order ON lessons(trail_id, order_index);