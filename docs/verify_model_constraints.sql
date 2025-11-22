-- ========================================
-- QUERY DE VERIFICAÇÃO: Constraints de Model
-- ========================================
-- Execute esta query no Lovable após aplicar a migration
-- 20251122150000_enforce_model_constraints.sql
-- ========================================

-- ========================================
-- 1. VERIFICAR SE AS CONSTRAINTS EXISTEM
-- ========================================
SELECT
  '🔍 CONSTRAINTS ENCONTRADAS' as titulo,
  tc.table_name as tabela,
  tc.constraint_name as nome_constraint,
  tc.constraint_type as tipo,
  pg_get_constraintdef(pgc.oid) as definicao
FROM information_schema.table_constraints tc
JOIN pg_constraint pgc
  ON pgc.conname = tc.constraint_name
WHERE tc.table_name IN ('lessons', 'pipeline_executions')
  AND tc.constraint_name LIKE '%model%'
ORDER BY tc.table_name, tc.constraint_name;

-- ========================================
-- 2. VERIFICAR VALORES EM LESSONS.MODEL
-- ========================================
SELECT
  '📊 DISTRIBUIÇÃO: lessons.model' as titulo,
  COALESCE(model, '(NULL)') as valor_model,
  COUNT(*) as total_licoes,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM lessons
GROUP BY model
ORDER BY total_licoes DESC;

-- ========================================
-- 3. VERIFICAR VALORES EM PIPELINE_EXECUTIONS.MODEL
-- ========================================
SELECT
  '📊 DISTRIBUIÇÃO: pipeline_executions.model' as titulo,
  COALESCE(model, '(NULL)') as valor_model,
  COUNT(*) as total_execucoes,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM pipeline_executions
GROUP BY model
ORDER BY total_execucoes DESC;

-- ========================================
-- 4. VERIFICAR SE HÁ VALORES INVÁLIDOS (NÃO DEVERIA TER NENHUM)
-- ========================================
SELECT
  '⚠️ VALORES INVÁLIDOS EM LESSONS' as titulo,
  id,
  title,
  model as valor_invalido
FROM lessons
WHERE model IS NOT NULL
  AND model NOT IN ('v1', 'v2', 'v3', 'v4')
LIMIT 10;

SELECT
  '⚠️ VALORES INVÁLIDOS EM PIPELINE_EXECUTIONS' as titulo,
  id,
  model as valor_invalido,
  created_at
FROM pipeline_executions
WHERE model IS NOT NULL
  AND model NOT IN ('v1', 'v2', 'v3', 'v4')
LIMIT 10;

-- ========================================
-- 5. TESTAR SE CONSTRAINTS ESTÃO FUNCIONANDO
-- ========================================
-- ATENÇÃO: Estes testes vão FALHAR de propósito (esperado!)
-- Se falharem = Constraints estão funcionando ✅
-- Se passarem = Constraints NÃO estão funcionando ❌

-- Teste 1: Tentar inserir valor inválido em lessons
DO $$
BEGIN
  INSERT INTO lessons (
    title, trail_id, order_index, lesson_type,
    passing_score, estimated_time, difficulty_level,
    content, model
  ) VALUES (
    'TESTE - DELETAR',
    (SELECT id FROM trails LIMIT 1),
    9999,
    'guided',
    70,
    10,
    'beginner',
    '{"test": true}'::jsonb,
    'VALOR_INVALIDO'  -- ❌ Deve falhar aqui
  );

  RAISE NOTICE '❌ PROBLEMA: Constraint NÃO está funcionando em lessons!';

  -- Limpar teste se conseguiu inserir
  DELETE FROM lessons WHERE title = 'TESTE - DELETAR';

EXCEPTION WHEN check_violation THEN
  RAISE NOTICE '✅ SUCESSO: Constraint lessons_model_must_be_valid está funcionando!';
  RAISE NOTICE '   Mensagem do erro: %', SQLERRM;
END $$;

-- Teste 2: Tentar inserir valor inválido em pipeline_executions
DO $$
BEGIN
  INSERT INTO pipeline_executions (
    lesson_id, status, model
  ) VALUES (
    (SELECT id FROM lessons LIMIT 1),
    'completed',
    'VALOR_INVALIDO'  -- ❌ Deve falhar aqui
  );

  RAISE NOTICE '❌ PROBLEMA: Constraint NÃO está funcionando em pipeline_executions!';

  -- Limpar teste se conseguiu inserir
  DELETE FROM pipeline_executions WHERE model = 'VALOR_INVALIDO';

EXCEPTION WHEN check_violation THEN
  RAISE NOTICE '✅ SUCESSO: Constraint pipeline_executions_model_must_be_valid está funcionando!';
  RAISE NOTICE '   Mensagem do erro: %', SQLERRM;
END $$;

-- ========================================
-- 6. RELATÓRIO FINAL
-- ========================================
SELECT
  '📋 RELATÓRIO FINAL' as titulo,
  (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE constraint_name = 'lessons_model_must_be_valid'
  ) as constraint_lessons_ok,
  (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE constraint_name = 'pipeline_executions_model_must_be_valid'
  ) as constraint_pipeline_ok,
  (
    SELECT COUNT(*)
    FROM lessons
    WHERE model NOT IN ('v1', 'v2', 'v3', 'v4')
      AND model IS NOT NULL
  ) as lessons_valores_invalidos,
  (
    SELECT COUNT(*)
    FROM pipeline_executions
    WHERE model NOT IN ('v1', 'v2', 'v3', 'v4')
      AND model IS NOT NULL
  ) as pipeline_valores_invalidos,
  CASE
    WHEN (
      SELECT COUNT(*) FROM information_schema.table_constraints
      WHERE constraint_name IN (
        'lessons_model_must_be_valid',
        'pipeline_executions_model_must_be_valid'
      )
    ) = 2 THEN '✅ TUDO OK'
    ELSE '❌ VERIFICAR PROBLEMAS'
  END as status_geral;
