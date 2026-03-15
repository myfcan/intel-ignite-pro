-- ============================================================
-- AILIV V10 — SCHEMA COMPLETO
-- Migration: 20260315120000_create_v10_tables.sql
-- Data: 15/03/2026
-- Descrição: Cria todas as tabelas necessárias para o modelo V10
-- ============================================================

-- ============================================================
-- 1. TABELA: v10_lessons (metadados da aula)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  trail_id uuid REFERENCES trails(id) ON DELETE SET NULL,
  order_in_trail int NOT NULL DEFAULT 0,
  total_steps int NOT NULL DEFAULT 0,
  estimated_minutes int NOT NULL DEFAULT 10,
  tools text[] DEFAULT '{}',
  badge_icon text,
  badge_name text,
  xp_reward int NOT NULL DEFAULT 150,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TABELA: v10_lesson_steps (passos da Parte B)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_lesson_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES v10_lessons(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  slug text,
  title text NOT NULL,
  description text,
  app_name text,
  app_icon text,
  app_badge_bg text DEFAULT '#EEF2FF',
  app_badge_color text DEFAULT '#6366F1',
  accent_color text DEFAULT '#6366F1',
  duration_seconds int NOT NULL DEFAULT 30,
  progress_percent int NOT NULL DEFAULT 0,
  phase int NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 5),
  frames jsonb NOT NULL DEFAULT '[]',
  liv jsonb DEFAULT '{"tip": "", "analogy": "", "sos": ""}',
  warnings jsonb DEFAULT NULL,
  audio_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, step_number)
);

-- ============================================================
-- 3. TABELA: v10_lesson_narrations (áudio Parte A e C)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_lesson_narrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES v10_lessons(id) ON DELETE CASCADE,
  part text NOT NULL CHECK (part IN ('A', 'C')),
  audio_url text,
  duration_seconds int NOT NULL DEFAULT 0,
  script_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, part)
);

-- ============================================================
-- 4. TABELA: v10_lesson_intro_slides (slides da Parte A)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_lesson_intro_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES v10_lessons(id) ON DELETE CASCADE,
  slide_order int NOT NULL,
  icon text,
  tool_name text,
  tool_color text DEFAULT '#6366F1',
  description text,
  label text,
  title text NOT NULL,
  subtitle text,
  appear_at_seconds int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, slide_order)
);

-- ============================================================
-- 5. TABELA: v10_user_lesson_progress (progresso do aluno)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_user_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES v10_lessons(id) ON DELETE CASCADE,
  current_part text NOT NULL DEFAULT 'A' CHECK (current_part IN ('A', 'B', 'C')),
  current_step int NOT NULL DEFAULT 1,
  current_frame int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  started_at timestamptz NOT NULL DEFAULT now(),
  time_spent_seconds int NOT NULL DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- 6. TABELA: v10_user_achievements (conquistas/badges)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES v10_lessons(id) ON DELETE CASCADE,
  badge_icon text,
  badge_name text,
  xp_earned int NOT NULL DEFAULT 0,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- 7. TABELA: v10_user_streaks (streak de aprendizado)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_activity_date date,
  streak_start_date date
);

-- ============================================================
-- 8. TABELA: v10_user_plans (planos de assinatura)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_slug text NOT NULL DEFAULT 'basico' CHECK (plan_slug IN ('basico', 'ultra', 'pro')),
  plan_name text NOT NULL DEFAULT 'Básico',
  daily_interactions_limit int NOT NULL DEFAULT 5,
  price_brl decimal(10,2) NOT NULL DEFAULT 37.90,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired'))
);

-- ============================================================
-- 9. TABELA: v10_user_daily_usage (controle diário Claude)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_user_daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  interactions_used int NOT NULL DEFAULT 0,
  interactions_limit int NOT NULL DEFAULT 5,
  UNIQUE(user_id, usage_date)
);

-- ============================================================
-- 10. TABELA: v10_bpa_pipeline (pipeline de produção)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_bpa_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES v10_lessons(id) ON DELETE SET NULL,
  slug text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'ready', 'published')),
  current_stage int NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 7),
  created_by text DEFAULT 'fernando',

  -- Etapa 1: Score de viabilidade
  score_total int DEFAULT 0,
  score_refero int DEFAULT 0,
  score_docs int DEFAULT 0,
  score_pedagogy int DEFAULT 0,
  score_difficulty int DEFAULT 0,
  score_relevance int DEFAULT 0,
  score_semaphore text DEFAULT 'red' CHECK (score_semaphore IN ('green', 'yellow', 'red')),
  docs_manual_input text,

  -- Etapa 2: Estrutura de passos
  steps_generated int DEFAULT 0,
  steps_audited int DEFAULT 0,
  audit_passed boolean DEFAULT false,

  -- Etapa 3: Imagens
  images_needed int DEFAULT 0,
  images_generated int DEFAULT 0,
  images_approved int DEFAULT 0,

  -- Etapa 4: Mockups
  mockups_total int DEFAULT 0,
  mockups_from_refero int DEFAULT 0,
  mockups_generic int DEFAULT 0,
  mockups_approved int DEFAULT 0,

  -- Etapa 5: Narração
  audios_total int DEFAULT 0,
  audios_generated int DEFAULT 0,
  audios_approved int DEFAULT 0,

  -- Etapa 6: Montagem
  assembly_checklist jsonb DEFAULT '{}',
  assembly_passed boolean DEFAULT false,

  -- Etapa 7: Publicação
  preview_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  approved_by text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. TABELA: v10_bpa_pipeline_log (auditoria do pipeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_bpa_pipeline_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES v10_bpa_pipeline(id) ON DELETE CASCADE,
  stage int NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_v10_lesson_steps_lesson_id ON v10_lesson_steps(lesson_id);
CREATE INDEX IF NOT EXISTS idx_v10_lesson_steps_step_number ON v10_lesson_steps(lesson_id, step_number);
CREATE INDEX IF NOT EXISTS idx_v10_lesson_intro_slides_lesson_id ON v10_lesson_intro_slides(lesson_id);
CREATE INDEX IF NOT EXISTS idx_v10_lesson_narrations_lesson_id ON v10_lesson_narrations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_v10_user_progress_user_lesson ON v10_user_lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_v10_user_achievements_user ON v10_user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_v10_user_daily_usage_date ON v10_user_daily_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_v10_bpa_pipeline_status ON v10_bpa_pipeline(status);
CREATE INDEX IF NOT EXISTS idx_v10_bpa_pipeline_log_pipeline ON v10_bpa_pipeline_log(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_v10_lessons_slug ON v10_lessons(slug);
CREATE INDEX IF NOT EXISTS idx_v10_lessons_status ON v10_lessons(status);
CREATE INDEX IF NOT EXISTS idx_v10_lessons_trail ON v10_lessons(trail_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- v10_lessons: todos podem ler publicadas, admin pode tudo
ALTER TABLE v10_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_lessons_select_published" ON v10_lessons
  FOR SELECT USING (status = 'published' OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor')
  ));

CREATE POLICY "v10_lessons_admin_all" ON v10_lessons
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- v10_lesson_steps: leitura baseada na lesson
ALTER TABLE v10_lesson_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_lesson_steps_select" ON v10_lesson_steps
  FOR SELECT USING (
    lesson_id IN (SELECT id FROM v10_lessons WHERE status = 'published')
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor'))
  );

CREATE POLICY "v10_lesson_steps_admin_all" ON v10_lesson_steps
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- v10_lesson_narrations: mesma lógica
ALTER TABLE v10_lesson_narrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_lesson_narrations_select" ON v10_lesson_narrations
  FOR SELECT USING (
    lesson_id IN (SELECT id FROM v10_lessons WHERE status = 'published')
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor'))
  );

CREATE POLICY "v10_lesson_narrations_admin_all" ON v10_lesson_narrations
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- v10_lesson_intro_slides: mesma lógica
ALTER TABLE v10_lesson_intro_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_lesson_intro_slides_select" ON v10_lesson_intro_slides
  FOR SELECT USING (
    lesson_id IN (SELECT id FROM v10_lessons WHERE status = 'published')
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor'))
  );

CREATE POLICY "v10_lesson_intro_slides_admin_all" ON v10_lesson_intro_slides
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- v10_user_lesson_progress: cada user só vê o seu
ALTER TABLE v10_user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_user_progress_own" ON v10_user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- v10_user_achievements: cada user só vê o seu
ALTER TABLE v10_user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_user_achievements_own" ON v10_user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- v10_user_streaks: cada user só vê o seu
ALTER TABLE v10_user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_user_streaks_own" ON v10_user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- v10_user_plans: cada user só vê o seu
ALTER TABLE v10_user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_user_plans_own" ON v10_user_plans
  FOR ALL USING (auth.uid() = user_id);

-- v10_user_daily_usage: cada user só vê o seu
ALTER TABLE v10_user_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_user_daily_usage_own" ON v10_user_daily_usage
  FOR ALL USING (auth.uid() = user_id);

-- v10_bpa_pipeline: só admin
ALTER TABLE v10_bpa_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_bpa_pipeline_admin" ON v10_bpa_pipeline
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- v10_bpa_pipeline_log: só admin
ALTER TABLE v10_bpa_pipeline_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_bpa_pipeline_log_admin" ON v10_bpa_pipeline_log
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION v10_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER v10_lessons_updated_at
  BEFORE UPDATE ON v10_lessons
  FOR EACH ROW EXECUTE FUNCTION v10_update_updated_at();

CREATE TRIGGER v10_bpa_pipeline_updated_at
  BEFORE UPDATE ON v10_bpa_pipeline
  FOR EACH ROW EXECUTE FUNCTION v10_update_updated_at();
