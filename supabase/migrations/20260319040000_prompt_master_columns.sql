-- Prompt Master: 3 novos campos no pipeline
ALTER TABLE v10_bpa_pipeline
  ADD COLUMN IF NOT EXISTS lesson_type text DEFAULT 'automation'
    CHECK (lesson_type IN ('automation', 'tutorial', 'conceptual')),
  ADD COLUMN IF NOT EXISTS unverified_tools text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS intermediary_status jsonb DEFAULT null;
