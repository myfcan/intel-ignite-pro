
-- ============================================================
-- V10 Tables Migration
-- Creates all 9 V10 tables needed by the codebase
-- ============================================================

-- 1. v10_lessons
CREATE TABLE public.v10_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  trail_id UUID REFERENCES public.trails(id) ON DELETE SET NULL,
  order_in_trail INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  tools TEXT[] NOT NULL DEFAULT '{}',
  badge_icon TEXT,
  badge_name TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. v10_lesson_steps
CREATE TABLE public.v10_lesson_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.v10_lessons(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  slug TEXT,
  title TEXT NOT NULL,
  description TEXT,
  app_name TEXT,
  app_icon TEXT,
  app_badge_bg TEXT NOT NULL DEFAULT '#e2e8f0',
  app_badge_color TEXT NOT NULL DEFAULT '#1e293b',
  accent_color TEXT NOT NULL DEFAULT '#6366f1',
  duration_seconds INTEGER NOT NULL DEFAULT 30,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  phase INTEGER NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 5),
  frames JSONB NOT NULL DEFAULT '[]',
  liv JSONB NOT NULL DEFAULT '{"tip":"","analogy":"","sos":""}',
  warnings JSONB,
  audio_url TEXT,
  UNIQUE(lesson_id, step_number)
);

-- 3. v10_lesson_narrations
CREATE TABLE public.v10_lesson_narrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.v10_lessons(id) ON DELETE CASCADE,
  part TEXT NOT NULL CHECK (part IN ('A', 'C')),
  audio_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  script_text TEXT,
  UNIQUE(lesson_id, part)
);

-- 4. v10_lesson_intro_slides
CREATE TABLE public.v10_lesson_intro_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.v10_lessons(id) ON DELETE CASCADE,
  slide_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  tool_name TEXT,
  tool_color TEXT NOT NULL DEFAULT '#6366f1',
  description TEXT,
  label TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  appear_at_seconds INTEGER NOT NULL DEFAULT 0
);

-- 5. v10_user_lesson_progress
CREATE TABLE public.v10_user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.v10_lessons(id) ON DELETE CASCADE,
  current_part TEXT NOT NULL DEFAULT 'A' CHECK (current_part IN ('A', 'B', 'C')),
  current_step INTEGER NOT NULL DEFAULT 0,
  current_frame INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- 6. v10_user_achievements
CREATE TABLE public.v10_user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.v10_lessons(id) ON DELETE CASCADE,
  badge_icon TEXT,
  badge_name TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 7. v10_user_streaks
CREATE TABLE public.v10_user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE
);

-- 8. v10_bpa_pipeline
CREATE TABLE public.v10_bpa_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.v10_lessons(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'ready', 'published')),
  current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 7),
  created_by UUID,

  -- Stage 1: Viability score
  score_total INTEGER NOT NULL DEFAULT 0,
  score_refero INTEGER NOT NULL DEFAULT 0,
  score_docs INTEGER NOT NULL DEFAULT 0,
  score_pedagogy INTEGER NOT NULL DEFAULT 0,
  score_difficulty INTEGER NOT NULL DEFAULT 0,
  score_relevance INTEGER NOT NULL DEFAULT 0,
  score_semaphore TEXT NOT NULL DEFAULT 'red' CHECK (score_semaphore IN ('green', 'yellow', 'red')),
  docs_manual_input TEXT,

  -- Stage 2: Step structure
  steps_generated INTEGER NOT NULL DEFAULT 0,
  steps_audited INTEGER NOT NULL DEFAULT 0,
  audit_passed BOOLEAN NOT NULL DEFAULT false,

  -- Stage 3: Images
  images_needed INTEGER NOT NULL DEFAULT 0,
  images_generated INTEGER NOT NULL DEFAULT 0,
  images_approved INTEGER NOT NULL DEFAULT 0,

  -- Stage 4: Mockups
  mockups_total INTEGER NOT NULL DEFAULT 0,
  mockups_from_refero INTEGER NOT NULL DEFAULT 0,
  mockups_generic INTEGER NOT NULL DEFAULT 0,
  mockups_approved INTEGER NOT NULL DEFAULT 0,

  -- Stage 5: Narration
  audios_total INTEGER NOT NULL DEFAULT 0,
  audios_generated INTEGER NOT NULL DEFAULT 0,
  audios_approved INTEGER NOT NULL DEFAULT 0,

  -- Stage 6: Assembly
  assembly_checklist JSONB NOT NULL DEFAULT '{}',
  assembly_passed BOOLEAN NOT NULL DEFAULT false,

  -- Stage 7: Publication
  preview_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  approved_by UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. v10_bpa_pipeline_log
CREATE TABLE public.v10_bpa_pipeline_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES public.v10_bpa_pipeline(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS: Enable on all tables
-- ============================================================
ALTER TABLE public.v10_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v10_lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v10_lesson_narrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v10_lesson_intro_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v10_user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v10_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v10_user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v10_bpa_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v10_bpa_pipeline_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: Content tables (public read, admin write)
-- ============================================================

-- v10_lessons
CREATE POLICY "public_read_v10_lessons" ON public.v10_lessons FOR SELECT TO public USING (status = 'published');
CREATE POLICY "admins_all_v10_lessons" ON public.v10_lessons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- v10_lesson_steps
CREATE POLICY "public_read_v10_lesson_steps" ON public.v10_lesson_steps FOR SELECT TO public USING (
  EXISTS (SELECT 1 FROM public.v10_lessons WHERE id = v10_lesson_steps.lesson_id AND status = 'published')
);
CREATE POLICY "admins_all_v10_lesson_steps" ON public.v10_lesson_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- v10_lesson_narrations
CREATE POLICY "public_read_v10_lesson_narrations" ON public.v10_lesson_narrations FOR SELECT TO public USING (
  EXISTS (SELECT 1 FROM public.v10_lessons WHERE id = v10_lesson_narrations.lesson_id AND status = 'published')
);
CREATE POLICY "admins_all_v10_lesson_narrations" ON public.v10_lesson_narrations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- v10_lesson_intro_slides
CREATE POLICY "public_read_v10_lesson_intro_slides" ON public.v10_lesson_intro_slides FOR SELECT TO public USING (
  EXISTS (SELECT 1 FROM public.v10_lessons WHERE id = v10_lesson_intro_slides.lesson_id AND status = 'published')
);
CREATE POLICY "admins_all_v10_lesson_intro_slides" ON public.v10_lesson_intro_slides FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- RLS Policies: User tables (own data + admin)
-- ============================================================

-- v10_user_lesson_progress
CREATE POLICY "users_own_v10_progress" ON public.v10_user_lesson_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_all_v10_progress" ON public.v10_user_lesson_progress FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- v10_user_achievements
CREATE POLICY "users_own_v10_achievements" ON public.v10_user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_all_v10_achievements" ON public.v10_user_achievements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- v10_user_streaks
CREATE POLICY "users_own_v10_streaks" ON public.v10_user_streaks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins_all_v10_streaks" ON public.v10_user_streaks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- RLS Policies: Admin-only tables
-- ============================================================

-- v10_bpa_pipeline
CREATE POLICY "admins_all_v10_bpa_pipeline" ON public.v10_bpa_pipeline FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- v10_bpa_pipeline_log
CREATE POLICY "admins_all_v10_bpa_pipeline_log" ON public.v10_bpa_pipeline_log FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Triggers: updated_at
-- ============================================================
CREATE TRIGGER v10_lessons_updated_at BEFORE UPDATE ON public.v10_lessons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER v10_bpa_pipeline_updated_at BEFORE UPDATE ON public.v10_bpa_pipeline FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_v10_lesson_steps_lesson_id ON public.v10_lesson_steps(lesson_id);
CREATE INDEX idx_v10_lesson_narrations_lesson_id ON public.v10_lesson_narrations(lesson_id);
CREATE INDEX idx_v10_lesson_intro_slides_lesson_id ON public.v10_lesson_intro_slides(lesson_id);
CREATE INDEX idx_v10_user_progress_user_lesson ON public.v10_user_lesson_progress(user_id, lesson_id);
CREATE INDEX idx_v10_user_achievements_user ON public.v10_user_achievements(user_id);
CREATE INDEX idx_v10_bpa_pipeline_log_pipeline ON public.v10_bpa_pipeline_log(pipeline_id);
