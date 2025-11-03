-- Add RLS policies for claude_cache table
CREATE POLICY "Service role can manage cache"
ON claude_cache FOR ALL
USING (auth.role() = 'service_role');

-- Add RLS policies for pricing_sessions table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pricing_sessions' 
    AND policyname = 'Users can delete own pricing sessions'
  ) THEN
    CREATE POLICY "Users can delete own pricing sessions"
    ON pricing_sessions FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add RLS policies for saved_templates table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_templates' 
    AND policyname = 'Users can update own templates'
  ) THEN
    CREATE POLICY "Users can update own templates"
    ON saved_templates FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;