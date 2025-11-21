-- Adicionar campo 'model' à tabela lessons
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS model text CHECK (model IN ('v1', 'v2', 'v3', 'v4'));

-- Atualizar lições existentes baseado no contentVersion
UPDATE lessons
SET model = CASE
  WHEN content->'contentVersion' = '"v2"'::jsonb THEN 'v2'
  WHEN content->'contentVersion' = '"v3"'::jsonb THEN 'v3'
  ELSE 'v1'
END
WHERE model IS NULL;

-- Adicionar comentário
COMMENT ON COLUMN lessons.model IS 'Modelo pedagógico da lição: v1 (playground mid), v2 (linear), v3 (slides), v4 (playground real)';