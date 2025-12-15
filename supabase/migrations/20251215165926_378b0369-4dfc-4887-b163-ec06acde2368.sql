-- Create v7_analytics table for V7 Cinematic Lesson analytics
CREATE TABLE public.v7_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.v7_analytics ENABLE ROW LEVEL SECURITY;

-- Users can insert their own analytics
CREATE POLICY "users_insert_own_v7_analytics"
ON public.v7_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own analytics
CREATE POLICY "users_view_own_v7_analytics"
ON public.v7_analytics
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all analytics
CREATE POLICY "admins_manage_all_v7_analytics"
ON public.v7_analytics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index for performance
CREATE INDEX idx_v7_analytics_user_id ON public.v7_analytics(user_id);
CREATE INDEX idx_v7_analytics_lesson_id ON public.v7_analytics(lesson_id);
CREATE INDEX idx_v7_analytics_session_id ON public.v7_analytics(session_id);