-- Verificar lições com exercícios corrompidos
SELECT 
  id,
  title,
  created_at,
  (content->'exercisesConfig')::jsonb as exercises
FROM lessons
WHERE 
  -- Lições que têm exercícios
  content->'exercisesConfig' IS NOT NULL
  AND jsonb_array_length((content->'exercisesConfig')::jsonb) > 0
  -- Buscar exercícios multiple-choice sem 'options' no data
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE 
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL 
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  )
ORDER BY created_at DESC;
