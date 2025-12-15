-- V7 Cinematic Lesson System Tables
-- Created: 2025-12-15

-- ============================================================================
-- V7 LESSONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.v7_lessons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    duration INTEGER NOT NULL, -- in seconds
    data JSONB NOT NULL, -- Complete V7CinematicLesson object
    trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
    order_in_trail INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    published BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for v7_lessons
CREATE INDEX IF NOT EXISTS idx_v7_lessons_trail_id ON public.v7_lessons(trail_id);
CREATE INDEX IF NOT EXISTS idx_v7_lessons_created_at ON public.v7_lessons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_v7_lessons_published ON public.v7_lessons(published);
CREATE INDEX IF NOT EXISTS idx_v7_lessons_title ON public.v7_lessons USING GIN (to_tsvector('portuguese', title));

-- ============================================================================
-- V7 ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.v7_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id TEXT NOT NULL REFERENCES public.v7_lessons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    duration INTEGER, -- total session duration in milliseconds
    events JSONB DEFAULT '[]'::jsonb, -- Array of AnalyticsEvent objects
    metrics JSONB DEFAULT '[]'::jsonb, -- Array of AnalyticsMetric objects
    player_state JSONB, -- Final V7PlayerState
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for v7_analytics
CREATE INDEX IF NOT EXISTS idx_v7_analytics_lesson_id ON public.v7_analytics(lesson_id);
CREATE INDEX IF NOT EXISTS idx_v7_analytics_user_id ON public.v7_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_v7_analytics_session_id ON public.v7_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_v7_analytics_created_at ON public.v7_analytics(created_at DESC);

-- ============================================================================
-- V7 USER PROGRESS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.v7_user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES public.v7_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    completed_acts TEXT[] DEFAULT '{}', -- Array of act IDs
    interaction_results JSONB DEFAULT '{}'::jsonb,
    achievements TEXT[] DEFAULT '{}', -- Array of achievement IDs
    last_watched_time INTEGER DEFAULT 0, -- in seconds
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Indexes for v7_user_progress
CREATE INDEX IF NOT EXISTS idx_v7_user_progress_user_id ON public.v7_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_v7_user_progress_lesson_id ON public.v7_user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_v7_user_progress_completed ON public.v7_user_progress(completed);
CREATE INDEX IF NOT EXISTS idx_v7_user_progress_xp ON public.v7_user_progress(xp_earned DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.v7_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v7_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v7_user_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- V7 LESSONS POLICIES
-- ============================================================================

-- Anyone can view published lessons
CREATE POLICY "Public can view published v7 lessons"
    ON public.v7_lessons
    FOR SELECT
    USING (published = TRUE);

-- Admins can view all lessons
CREATE POLICY "Admins can view all v7 lessons"
    ON public.v7_lessons
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Admins can insert lessons
CREATE POLICY "Admins can insert v7 lessons"
    ON public.v7_lessons
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Admins can update lessons
CREATE POLICY "Admins can update v7 lessons"
    ON public.v7_lessons
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Admins can delete lessons
CREATE POLICY "Admins can delete v7 lessons"
    ON public.v7_lessons
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- V7 ANALYTICS POLICIES
-- ============================================================================

-- Users can view their own analytics
CREATE POLICY "Users can view own v7 analytics"
    ON public.v7_analytics
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view all v7 analytics"
    ON public.v7_analytics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Users can insert their own analytics
CREATE POLICY "Users can insert own v7 analytics"
    ON public.v7_analytics
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- V7 USER PROGRESS POLICIES
-- ============================================================================

-- Users can view their own progress
CREATE POLICY "Users can view own v7 progress"
    ON public.v7_user_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all v7 progress"
    ON public.v7_user_progress
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Users can insert their own progress
CREATE POLICY "Users can insert own v7 progress"
    ON public.v7_user_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own v7 progress"
    ON public.v7_user_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on v7_lessons
CREATE OR REPLACE FUNCTION update_v7_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER v7_lessons_updated_at
    BEFORE UPDATE ON public.v7_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_v7_lessons_updated_at();

-- Update updated_at timestamp on v7_user_progress
CREATE OR REPLACE FUNCTION update_v7_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER v7_user_progress_updated_at
    BEFORE UPDATE ON public.v7_user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_v7_user_progress_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.v7_lessons IS 'V7 Cinematic lessons with cinema-like experiences';
COMMENT ON TABLE public.v7_analytics IS 'Analytics data for V7 lesson sessions';
COMMENT ON TABLE public.v7_user_progress IS 'User progress tracking for V7 lessons';

COMMENT ON COLUMN public.v7_lessons.data IS 'Complete V7CinematicLesson JSONB object';
COMMENT ON COLUMN public.v7_analytics.events IS 'Array of analytics events (act-start, interaction, etc)';
COMMENT ON COLUMN public.v7_analytics.metrics IS 'Array of analytics metrics (engagement, completion, etc)';
COMMENT ON COLUMN public.v7_user_progress.completed_acts IS 'Array of completed act IDs';
COMMENT ON COLUMN public.v7_user_progress.interaction_results IS 'Results of all interactions in the lesson';
