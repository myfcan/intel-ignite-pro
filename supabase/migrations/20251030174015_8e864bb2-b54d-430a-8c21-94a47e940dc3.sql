-- Atualizar tabela lessons para suportar novos formatos interativos
ALTER TABLE lessons DROP COLUMN IF EXISTS content_text;
ALTER TABLE lessons DROP COLUMN IF EXISTS audio_url;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(50) DEFAULT 'fill-blanks';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 70;

-- Atualizar tabela user_progress para armazenar respostas
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS answers JSONB;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
ALTER TABLE user_progress RENAME COLUMN time_spent TO time_spent_seconds;

-- Criar tabela para sessões de playground com IA
CREATE TABLE IF NOT EXISTS user_playground_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_prompt TEXT NOT NULL,
  ai_response TEXT,
  ai_feedback TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_playground_user ON user_playground_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_playground_lesson ON user_playground_sessions(lesson_id);

-- Habilitar RLS
ALTER TABLE user_playground_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para playground
CREATE POLICY "Users can view own playground sessions"
  ON user_playground_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playground sessions"
  ON user_playground_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Atualizar achievements para suportar diferentes tipos
ALTER TABLE user_achievements DROP COLUMN IF EXISTS achievement_icon;
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;