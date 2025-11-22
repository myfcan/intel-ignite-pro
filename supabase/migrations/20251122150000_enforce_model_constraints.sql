-- ========================================
-- MIGRATION: Garantir Constraints de Model
-- ========================================
--
-- Esta migration garante que as constraints CHECK para o campo 'model'
-- estejam corretamente aplicadas nas tabelas 'lessons' e 'pipeline_executions'.
--
-- PROBLEMA: Constraints criadas com CHECK inline têm nomes auto-gerados,
-- dificultando validação e manutenção.
--
-- SOLUÇÃO: Criar constraints com nomes explícitos e verificar dados antes.
-- ========================================

-- ========================================
-- PARTE 1: Tabela LESSONS
-- ========================================

-- 1.1 Verificar se há valores inválidos (SEGURANÇA)
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM lessons
  WHERE model IS NOT NULL
    AND model NOT IN ('v1', 'v2', 'v3', 'v4');

  IF invalid_count > 0 THEN
    RAISE WARNING 'Encontrados % registros com model inválido em lessons. Eles serão corrigidos para v1.', invalid_count;

    -- Corrigir valores inválidos para 'v1' (padrão seguro)
    UPDATE lessons
    SET model = 'v1'
    WHERE model IS NOT NULL
      AND model NOT IN ('v1', 'v2', 'v3', 'v4');
  END IF;
END $$;

-- 1.2 Remover qualquer constraint CHECK existente (independente do nome)
DO $$
DECLARE
  constraint_rec RECORD;
BEGIN
  FOR constraint_rec IN
    SELECT constraint_name
    FROM information_schema.constraint_column_usage
    WHERE table_name = 'lessons'
      AND column_name = 'model'
      AND constraint_name LIKE '%check%'
  LOOP
    EXECUTE format('ALTER TABLE lessons DROP CONSTRAINT IF EXISTS %I', constraint_rec.constraint_name);
  END LOOP;
END $$;

-- 1.3 Criar constraint com NOME EXPLÍCITO
ALTER TABLE lessons
ADD CONSTRAINT lessons_model_must_be_valid
CHECK (model IN ('v1', 'v2', 'v3', 'v4'));

-- 1.4 Adicionar comentário descritivo
COMMENT ON CONSTRAINT lessons_model_must_be_valid ON lessons IS
'Garante que model seja um dos modelos pedagógicos válidos: v1 (playground mid), v2 (linear), v3 (slides), v4 (playground real)';


-- ========================================
-- PARTE 2: Tabela PIPELINE_EXECUTIONS
-- ========================================

-- 2.1 Verificar se há valores inválidos (SEGURANÇA)
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM pipeline_executions
  WHERE model IS NOT NULL
    AND model NOT IN ('v1', 'v2', 'v3', 'v4');

  IF invalid_count > 0 THEN
    RAISE WARNING 'Encontrados % registros com model inválido em pipeline_executions. Eles serão corrigidos para v1.', invalid_count;

    -- Corrigir valores inválidos para 'v1' (padrão seguro)
    UPDATE pipeline_executions
    SET model = 'v1'
    WHERE model IS NOT NULL
      AND model NOT IN ('v1', 'v2', 'v3', 'v4');
  END IF;
END $$;

-- 2.2 Remover constraint antiga (se existir)
ALTER TABLE pipeline_executions
DROP CONSTRAINT IF EXISTS pipeline_executions_model_check;

-- 2.3 Criar constraint com NOME EXPLÍCITO
ALTER TABLE pipeline_executions
ADD CONSTRAINT pipeline_executions_model_must_be_valid
CHECK (model IN ('v1', 'v2', 'v3', 'v4'));

-- 2.4 Adicionar comentário descritivo
COMMENT ON CONSTRAINT pipeline_executions_model_must_be_valid ON pipeline_executions IS
'Garante que model seja um dos modelos pedagógicos válidos: v1 (playground mid), v2 (linear), v3 (slides), v4 (playground real)';


-- ========================================
-- PARTE 3: Validação Final
-- ========================================

-- Verificar que as constraints foram criadas
DO $$
DECLARE
  lessons_constraint_exists BOOLEAN;
  pipeline_constraint_exists BOOLEAN;
BEGIN
  -- Verificar lessons
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'lessons'
      AND constraint_name = 'lessons_model_must_be_valid'
  ) INTO lessons_constraint_exists;

  -- Verificar pipeline_executions
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'pipeline_executions'
      AND constraint_name = 'pipeline_executions_model_must_be_valid'
  ) INTO pipeline_constraint_exists;

  -- Reportar resultado
  IF lessons_constraint_exists AND pipeline_constraint_exists THEN
    RAISE NOTICE '✅ Constraints aplicadas com sucesso em ambas as tabelas!';
  ELSE
    IF NOT lessons_constraint_exists THEN
      RAISE WARNING '❌ Constraint não encontrada em lessons';
    END IF;
    IF NOT pipeline_constraint_exists THEN
      RAISE WARNING '❌ Constraint não encontrada em pipeline_executions';
    END IF;
  END IF;
END $$;
