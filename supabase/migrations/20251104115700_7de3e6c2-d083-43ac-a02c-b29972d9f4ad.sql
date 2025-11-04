-- Add word_timestamps column to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS word_timestamps JSONB DEFAULT NULL;

COMMENT ON COLUMN public.lessons.word_timestamps IS 'Word-level timestamps for audio synchronization. Array of {word: string, start: number, end: number}';
