-- Adicionar 'v5' como valor válido para o campo model
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_model_check;

ALTER TABLE lessons ADD CONSTRAINT lessons_model_check 
CHECK (model IN ('v1', 'v2', 'v3', 'v4', 'v5') OR model IS NULL);
