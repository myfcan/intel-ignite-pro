-- ============================================
-- ONBOARDING SYSTEM - DATABASE SCHEMA
-- ============================================

-- Expandir tabela users com campos de onboarding
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Tabela: user_onboarding_answers
CREATE TABLE IF NOT EXISTS user_onboarding_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  answer_value TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user ON user_onboarding_answers(user_id);

-- Enable RLS
ALTER TABLE user_onboarding_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_onboarding_answers
CREATE POLICY "Users can view own answers"
  ON user_onboarding_answers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON user_onboarding_answers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
  ON user_onboarding_answers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabela: user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age_range VARCHAR(20),
  main_goal VARCHAR(50),
  intimidated_by_ai VARCHAR(20),
  knowledge_level VARCHAR(20),
  familiar_tools TEXT[],
  fear_replacement VARCHAR(20),
  interest_areas TEXT[],
  readiness_score INT DEFAULT 0,
  readiness_level VARCHAR(20),
  motivation VARCHAR(20) DEFAULT 'Alta',
  potential VARCHAR(20) DEFAULT 'Alto',
  focus VARCHAR(20),
  priority_trail VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabela: pricing_sessions
CREATE TABLE IF NOT EXISTS pricing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(100) UNIQUE NOT NULL,
  discount_code VARCHAR(50),
  discount_percentage INT DEFAULT 50,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  selected_plan VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_user ON pricing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_token ON pricing_sessions(session_token);

-- Enable RLS
ALTER TABLE pricing_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing_sessions
CREATE POLICY "Users can view own pricing sessions"
  ON pricing_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pricing sessions"
  ON pricing_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pricing sessions"
  ON pricing_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em user_profiles
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();