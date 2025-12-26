-- ============================================================================
-- FIX: Add 'v7' to model constraint
-- ============================================================================
-- Issue: Original constraint only allowed v1, v2, v3, v4
-- V7 lessons were being rejected by the database
-- Created: 2024-12-26

-- Drop existing constraint
ALTER TABLE lessons
DROP CONSTRAINT IF EXISTS lessons_model_check;

-- Add new constraint with v7 support
ALTER TABLE lessons
ADD CONSTRAINT lessons_model_check
CHECK (model IN ('v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'));

-- Update comment
COMMENT ON COLUMN lessons.model IS 'Modelo pedagogico da licao: v1-v4 (legacy), v5-v6 (transitional), v7 (cinematic with word-based sync)';

-- Log
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Model constraint updated to include v7';
END;
$$;
