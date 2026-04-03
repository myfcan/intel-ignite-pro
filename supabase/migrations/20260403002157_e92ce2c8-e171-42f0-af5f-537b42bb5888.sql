
-- Fix 1: Anti-Alucinação — Restructure broken platform-match data
-- The platforms contain full sentences as names and correctPlatform is a sentence
-- Fix: Rename platforms to proper short names and update correctPlatform to use IDs
UPDATE lessons
SET content = jsonb_set(
  content,
  '{inlineExercises}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN ex->>'type' = 'platform-match' THEN
          jsonb_set(
            jsonb_set(
              ex,
              '{data,platforms}',
              '[
                {"id": "plat-1", "icon": "✈️", "name": "Verificar fontes oficiais", "color": "#10a37f"},
                {"id": "plat-2", "icon": "⚕️", "name": "Consultar profissional", "color": "#5865f2"},
                {"id": "plat-3", "icon": "❌", "name": "Aceitar sem verificar", "color": "#ff0000"}
              ]'::jsonb
            ),
            '{data,scenarios}',
            (
              SELECT jsonb_agg(
                jsonb_set(
                  s,
                  '{correctPlatform}',
                  CASE 
                    WHEN s->>'correctPlatform' ILIKE '%fontes oficiais%' THEN '"plat-1"'
                    WHEN s->>'correctPlatform' ILIKE '%profissional%' THEN '"plat-2"'
                    ELSE '"plat-3"'
                  END ::jsonb
                )
              )
              FROM jsonb_array_elements(ex->'data'->'scenarios') s
            )
          )
        ELSE ex
      END
    )
    FROM jsonb_array_elements(content->'inlineExercises') ex
  )
)
WHERE id = 'b11cda2a-5fca-4c64-87d4-5b0118b24743';

-- Fix 3: Migration retroativa — Convert correctPlatform names to IDs for Prompt na Prática
UPDATE lessons
SET content = jsonb_set(
  content,
  '{inlineExercises}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN ex->>'type' = 'platform-match' THEN
          jsonb_set(
            ex,
            '{data,scenarios}',
            (
              SELECT jsonb_agg(
                jsonb_set(
                  s,
                  '{correctPlatform}',
                  (
                    SELECT to_jsonb(p->>'id')
                    FROM jsonb_array_elements(ex->'data'->'platforms') p
                    WHERE p->>'name' = s->>'correctPlatform'
                    LIMIT 1
                  )
                )
              )
              FROM jsonb_array_elements(ex->'data'->'scenarios') s
            )
          )
        ELSE ex
      END
    )
    FROM jsonb_array_elements(content->'inlineExercises') ex
  )
)
WHERE id = '61b8f83f-5331-4186-b4d3-29ab7170a004';

-- Fix 3b: Migration retroativa — Convert correctPlatform names to IDs for Cérebro ChatGPT
UPDATE lessons
SET content = jsonb_set(
  content,
  '{inlineExercises}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN ex->>'type' = 'platform-match' THEN
          jsonb_set(
            ex,
            '{data,scenarios}',
            (
              SELECT jsonb_agg(
                jsonb_set(
                  s,
                  '{correctPlatform}',
                  (
                    SELECT to_jsonb(p->>'id')
                    FROM jsonb_array_elements(ex->'data'->'platforms') p
                    WHERE p->>'name' = s->>'correctPlatform'
                    LIMIT 1
                  )
                )
              )
              FROM jsonb_array_elements(ex->'data'->'scenarios') s
            )
          )
        ELSE ex
      END
    )
    FROM jsonb_array_elements(content->'inlineExercises') ex
  )
)
WHERE id = 'f69c5d51-6a32-4451-83aa-64a9fe8319ca';
