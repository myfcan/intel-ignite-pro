-- ============================================================================
-- FIX: Adicionar realConfig para playgrounds criados antes do Step 5.5
-- ============================================================================
-- Problema: Aulas criadas antes do Step 5.5 têm playgroundConfig.type = 'real-playground'
-- mas sem playgroundConfig.realConfig, causando fallback para multiple-choice.
--
-- Solução: Adicionar realConfig padrão para todas as seções que têm
-- playgroundConfig.type = 'real-playground' mas sem realConfig.
-- ============================================================================

DO $$
DECLARE
  lesson_record RECORD;
  section_record JSONB;
  updated_sections JSONB;
  section_index INT;
BEGIN
  -- Iterar por todas as lições
  FOR lesson_record IN
    SELECT id, content FROM lessons WHERE content IS NOT NULL
  LOOP
    updated_sections := '[]'::JSONB;

    -- Iterar por todas as seções da lição
    FOR section_index IN 0..(jsonb_array_length(lesson_record.content->'sections') - 1)
    LOOP
      section_record := lesson_record.content->'sections'->section_index;

      -- Verificar se a seção tem playground do tipo 'real-playground' sem realConfig
      IF section_record->'playgroundConfig' IS NOT NULL
         AND section_record->'playgroundConfig'->>'type' = 'real-playground'
         AND section_record->'playgroundConfig'->'realConfig' IS NULL
      THEN
        RAISE NOTICE 'Corrigindo seção % da aula %', section_index, lesson_record.id;

        -- Adicionar realConfig padrão
        section_record := jsonb_set(
          section_record,
          '{playgroundConfig,realConfig}',
          jsonb_build_object(
            'type', 'real-playground',
            'title', 'Hora da Prática! 🚀',
            'maiaMessage', COALESCE(
              section_record->'playgroundConfig'->>'instruction',
              'Vamos praticar o que você aprendeu! Complete o prompt abaixo com suas próprias ideias.'
            ),
            'scenario', jsonb_build_object(
              'title', 'Desafio Prático',
              'description', COALESCE(
                section_record->'playgroundConfig'->>'instruction',
                'Use o que aprendeu para criar um prompt eficaz.'
              )
            ),
            'prefilledText', '',
            'userPlaceholder', 'Digite seu prompt aqui... 💭',
            'validation', jsonb_build_object(
              'minLength', 20,
              'requiredKeywords', '[]'::JSONB,
              'feedback', jsonb_build_object(
                'tooShort', '⚠️ Seu prompt precisa ter pelo menos 20 caracteres. Tente ser mais específico!',
                'good', '✅ Bom trabalho! Seu prompt está bem estruturado.',
                'excellent', '🎉 Excelente! Você dominou a técnica de criar prompts eficazes!'
              )
            )
          )
        );
      END IF;

      -- Adicionar seção (modificada ou não) ao array
      updated_sections := updated_sections || section_record;
    END LOOP;

    -- Atualizar a lição se alguma seção foi modificada
    IF updated_sections != lesson_record.content->'sections' THEN
      UPDATE lessons
      SET content = jsonb_set(
        content,
        '{sections}',
        updated_sections
      )
      WHERE id = lesson_record.id;

      RAISE NOTICE 'Aula % atualizada com sucesso', lesson_record.id;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
