-- =====================================================
-- MIGRAÇÃO: Corrigir exercícios corrompidos no banco
-- =====================================================
-- PROBLEMA: Exercícios com wrapper 'data' vazio ou sem campos obrigatórios
-- SOLUÇÃO: Deletar exercisesConfig corrompidos (permitir recriação manual)
--
-- ⚠️ ATENÇÃO: Este script VAI DELETAR exercícios corrompidos!
-- Execute apenas se você puder recriar as lições problemáticas.
-- =====================================================

-- PASSO 1: Verificar quantas lições serão afetadas
SELECT
  COUNT(*) as total_licoes_corrompidas,
  array_agg(title) as titulos
FROM lessons
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND jsonb_array_length((content->'exercisesConfig')::jsonb) > 0
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );

-- PASSO 2: Ver detalhes das lições problemáticas
SELECT
  id,
  title,
  created_at,
  trail_id,
  order_index,
  is_active,
  jsonb_pretty((content->'exercisesConfig')::jsonb) as exercises_json
FROM lessons
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND jsonb_array_length((content->'exercisesConfig')::jsonb) > 0
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

-- =====================================================
-- OPÇÃO A: Deletar lições corrompidas completamente
-- (Use se as lições forem apenas testes)
-- =====================================================
/*
DELETE FROM lessons
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
*/

-- =====================================================
-- OPÇÃO B: Desativar lições corrompidas (marcar is_active = false)
-- (Use se quiser manter histórico mas remover de produção)
-- =====================================================
/*
UPDATE lessons
SET is_active = false
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
*/

-- =====================================================
-- OPÇÃO C: Remover apenas os exercícios corrompidos
-- (Mantém a lição mas remove os exercícios problemáticos)
-- =====================================================
/*
UPDATE lessons
SET content = jsonb_set(
  content,
  '{exercisesConfig}',
  (
    SELECT jsonb_agg(ex)
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE NOT (
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
    )
  ),
  true
)
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
*/

-- =====================================================
-- VERIFICAÇÃO FINAL: Confirmar que não há mais lições corrompidas
-- =====================================================
/*
SELECT
  COUNT(*) as licoes_corrompidas_restantes
FROM lessons
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
-- Deve retornar 0
*/
