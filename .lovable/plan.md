

# Correcao PGRST203: Drop da funcao ambigua + params explicitos

## Contexto do Problema

Existem duas versoes da funcao `create_lesson_draft` no banco:
- Versao A: 5 parametros (p_title, p_trail_id, p_order_index, p_estimated_time, p_content)
- Versao B: 8 parametros (mesmos 5 + p_exercises, p_audio_url, p_word_timestamps com defaults)

PostgREST retorna PGRST203 quando chamada com 5 ou 6 params porque ambas sao candidatas validas.

## Analise de Impacto

4 chamadas existentes no codigo:
- Pipeline V1 (step7-consolidate.ts): ja passa 8 params — sem impacto
- Pipeline V7 (step6-consolidate.ts): ja passa 8 params — sem impacto
- AdminV8Create handleGenerateAudio (L216): passa 5 params — AFETADO (causa do erro)
- AdminV8Create handleSaveLesson (L342): passa 6 params — AFETADO

## Plano de Execucao

### 1. Migracao SQL: Drop da funcao de 5 parametros

```sql
DROP FUNCTION IF EXISTS public.create_lesson_draft(text, uuid, integer, integer, jsonb);
```

A versao de 8 params (com defaults) continua aceitando chamadas com 5 params apos o drop, pois PostgREST resolve os defaults quando ha apenas uma funcao candidata.

### 2. AdminV8Create.tsx: Passar todos os params explicitamente

Duas chamadas precisam ser atualizadas:

**Linha 216-222 (handleGenerateAudio):** Adicionar `p_exercises`, `p_audio_url`, `p_word_timestamps` com valores padrao.

**Linha 342-349 (handleSaveLesson):** Adicionar `p_audio_url`, `p_word_timestamps` com valores padrao (ja tem p_exercises).

Isso garante defesa em profundidade — mesmo que alguem recrie a funcao de 5 params no futuro, o codigo nao quebraria.

### 3. Regeneracao automatica do types.ts

Apos o drop, o `types.ts` sera regenerado automaticamente com apenas uma overload de `create_lesson_draft`, eliminando a union type ambigua.

## Arquivos alterados

- Migracao SQL (1 statement)
- `src/pages/AdminV8Create.tsx` (2 chamadas RPC atualizadas)

## Risco

Zero. Todos os callers existentes (V1, V7, V8) passam params compativeis com a versao de 8 params.

