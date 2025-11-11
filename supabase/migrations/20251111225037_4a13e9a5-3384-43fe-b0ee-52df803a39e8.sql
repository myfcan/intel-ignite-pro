-- FASE 1: Separar Exercises do Content
-- Adicionar colunas para exercises independentes

ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS exercises JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS exercises_version INTEGER DEFAULT 1;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_lessons_exercises_version ON lessons(exercises_version);

-- Comentários para documentação
COMMENT ON COLUMN lessons.exercises IS 'Exercícios da lição, separados do content para versionamento independente';
COMMENT ON COLUMN lessons.exercises_version IS 'Versão dos exercícios, incrementa independente do contentVersion';