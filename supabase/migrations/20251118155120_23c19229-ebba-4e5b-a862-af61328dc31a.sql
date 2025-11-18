-- Fase 1: Criar estrutura base das Missões Diárias

-- Tabela de templates de missões (gerenciada por admins)
CREATE TABLE IF NOT EXISTS public.missions_daily_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('aulas', 'exercicios', 'streak')),
  requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL CHECK (reward_value > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de missões diárias dos usuários
CREATE TABLE IF NOT EXISTS public.user_daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions_daily_templates(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_value INTEGER NOT NULL DEFAULT 0 CHECK (progress_value >= 0),
  completed BOOLEAN NOT NULL DEFAULT false,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mission_id, date)
);

-- Tabela de streaks dos usuários
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  best_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_user_date ON public.user_daily_missions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_completed ON public.user_daily_missions(completed, reward_claimed);

-- RLS Policies

-- missions_daily_templates: Apenas admins gerenciam, todos podem ver
ALTER TABLE public.missions_daily_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mission templates"
  ON public.missions_daily_templates
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view mission templates"
  ON public.missions_daily_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- user_daily_missions: Usuários veem apenas suas missões
ALTER TABLE public.user_daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily missions"
  ON public.user_daily_missions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own daily missions"
  ON public.user_daily_missions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert daily missions"
  ON public.user_daily_missions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all daily missions"
  ON public.user_daily_missions
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- user_streaks: Usuários veem apenas seu streak
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON public.user_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.user_streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert streaks"
  ON public.user_streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all streaks"
  ON public.user_streaks
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));