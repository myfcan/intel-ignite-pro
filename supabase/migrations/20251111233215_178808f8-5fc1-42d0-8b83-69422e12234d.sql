-- Adicionar coluna para rastrear progresso do áudio
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS audio_progress_percentage INTEGER DEFAULT 0;

COMMENT ON COLUMN user_progress.audio_progress_percentage IS 'Percentual do áudio assistido (0-100)';