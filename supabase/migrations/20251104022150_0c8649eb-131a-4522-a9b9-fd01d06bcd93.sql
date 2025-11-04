-- Add time_spent column to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0;