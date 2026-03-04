-- Phase 4: Add structured columns to user_playground_sessions for score tracking
ALTER TABLE public.user_playground_sessions
  ADD COLUMN IF NOT EXISTS playground_id text,
  ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS passed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_copy boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS similarity numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS evaluation_payload jsonb DEFAULT '{}'::jsonb;

-- Index for fast lookup by user + playground (used by register_gamification_event)
CREATE INDEX IF NOT EXISTS idx_playground_sessions_user_playground
  ON public.user_playground_sessions (user_id, playground_id, created_at DESC);
