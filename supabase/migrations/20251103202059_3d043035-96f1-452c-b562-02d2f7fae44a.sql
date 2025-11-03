-- Create storage bucket for lesson audios
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-audios', 'lesson-audios', true);

-- Create RLS policies for lesson-audios bucket
CREATE POLICY "Anyone can view lesson audios"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-audios');

CREATE POLICY "Authenticated users can upload lesson audios"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-audios' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update lesson audios"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lesson-audios' AND auth.role() = 'authenticated');

-- Add audio_url column to lessons table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE lessons ADD COLUMN audio_url TEXT;
  END IF;
END $$;