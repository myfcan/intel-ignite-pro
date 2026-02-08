
# Plano: TESTE FORCE do Contrato C10B + BoundaryFix (12 Runs)

## Contexto
Objetivo: Provar que o pipeline **v7-vv-1.1.1-c10b-boundaryfix** aguenta variações reais de conteúdo e não quebra quando a frase-âncora muda — desde que respeite o contrato (pauseAt determinístico).

**Aula Base**: `8208852d-da41-4113-981c-ea57426f0528` (10 fases, 3 interativas: quiz, promessa, playground)

**Cenas Interativas Alvo**:
- `cena-6-quiz` (type: interaction, pauseAt original: "representa você")
- `cena-7-promessa` (type: interaction, pauseAt original: "resultado" — problematico, não existe na narração)
- `cena-10-playground` (type: playground, pauseAt original: "teste agora")

---

## Matriz dos 12 Runs

| Run | Tag | Variação | pauseAt quiz | pauseAt promessa | pauseAt playground | Resultado Esperado |
|-----|-----|----------|--------------|------------------|--------------------|--------------------|
| R01 | `3-4-words-unique` | pauseAt 3-4 palavras únicas no final | "representa você" | "dez vezes mais claro" | "teste agora" | ✅ PASS (delta 0.000) |
| R02 | `2-words-unique` | pauseAt 2 palavras únicas | "representa você" | "você faz" | "agora" | ✅ PASS |
| R03 | `1-word-common` | pauseAt 1 palavra comum (risco) | "você" | "faz" | "agora" | ⚠️ PASS (pode haver match ambíguo) |
| R04 | `repeated-word` | pauseAt repetido 2x na mesma narração | "você" (aparece 2x) | "projetos" (aparece 2x) | "agora" | ✅ PASS (usa LAST_IN_RANGE) |
| R05 | `not-in-narration` | pauseAt NÃO existe na narração | "inexistente123" | "xyz" | "zzz" | ❌ FAIL: `PAUSE_ANCHOR_NOT_FOUND` |
| R06 | `early-anchor` | pauseAt existe mas aparece cedo (>1.5s antes do fim) | "Como" | "Vou" | "Agora" | ❌ FAIL: `PAUSE_ANCHOR_NOT_AT_END` (C10B) |
| R07 | `with-punctuation` | pauseAt com pontuação no final | "representa você." | "você faz." | "agora." | ✅ PASS (normalização remove pontuação) |
| R08 | `with-accent` | pauseAt com acento/variação | "é você" | "é agora" | "é" | ✅ PASS (normalização remove acentos) |
| R09 | `case-insensitive` | pauseAt em CAIXA ALTA na narração | "REPRESENTA VOCÊ" | "VOCÊ FAZ" | "AGORA" | ✅ PASS (normalize toLower) |
| R10 | `plural-singular` | pauseAt plural/singular (match exato) | "opção" vs "opções" | "projeto" vs "projetos" | "prompt" vs "prompts" | ⚠️ Depende se existe match exato |
| R11 | `short-narration` | narração muito curta antes do quiz | (5 palavras) | (5 palavras) | (5 palavras) | ⚠️ PASS (stress boundary) |
| R12 | `long-narration` | narração muito longa antes do playground | (original) | (original) | (50+ palavras) | ✅ PASS (stress timestamps) |

---

## Critérios de Sucesso por Run

Para cada run que **DEVE PASSAR**:
- ✅ Boundaries: 0 violations (duration > 0 E end <= next_start)
- ✅ C10: 3/3 interativas com delta = 0.000s (pauseTime = matched_word_end)
- ✅ C10B: 3/3 interativas com narration_after_pause ≤ 1.5s

Para cada run que **DEVE FALHAR** (R05, R06):
- ❌ Erro determinístico com código explícito
- ❌ R05: `PAUSE_ANCHOR_NOT_FOUND`
- ❌ R06: `PAUSE_ANCHOR_NOT_AT_END`

---

## Implementação Técnica

### 1. Criar Edge Function de Orquestração `force-test-c10b`

```typescript
// supabase/functions/force-test-c10b/index.ts
// Orquestra os 12 runs e coleta resultados
```

**Responsabilidades**:
- Recuperar input_data original da aula base
- Gerar 12 variações modificando APENAS as cenas interativas
- Executar reprocess com `generate_audio: true`
- Coletar resultados e erros
- Retornar tabela consolidada

### 2. Estrutura do Input Modificado

Para cada run, modificamos apenas:
```typescript
{
  ...originalInput,
  postLessonFlow: { runTag: 'R01-3-4-words-unique' },
  scenes: originalInput.scenes.map(scene => {
    if (scene.id === 'cena-6-quiz') {
      return {
        ...scene,
        narration: MODIFIED_NARRATION_IF_NEEDED,
        anchorText: { pauseAt: NEW_PAUSE_AT }
      };
    }
    // Similar para cena-7-promessa e cena-10-playground
    return scene;
  })
}
```

### 3. Queries SQL de Validação (Pós-Execução)

**A) Identidade dos Runs**:
```sql
SELECT 
  run_id::text,
  input_data->'postLessonFlow'->>'runTag' as run_tag,
  pipeline_version,
  commit_hash,
  status,
  mode,
  error_message
FROM pipeline_executions
WHERE lesson_id = '8208852d-da41-4113-981c-ea57426f0528'
  AND created_at > '2026-02-08T00:00:00Z'
  AND input_data->'postLessonFlow'->>'runTag' LIKE 'R%'
ORDER BY created_at;
```

**B) Boundaries Guard (todas as fases)**:
```sql
WITH phases AS (
  SELECT 
    run_id,
    p->>'id' as phase_id,
    (p->>'startTime')::float as start_time,
    (p->>'endTime')::float as end_time,
    LEAD((p->>'startTime')::float) OVER (PARTITION BY run_id ORDER BY ord) as next_start
  FROM pipeline_executions pe,
       jsonb_array_elements(output_data->'content'->'phases') WITH ORDINALITY as arr(p, ord)
  WHERE lesson_id = '8208852d-...'
)
SELECT 
  run_id,
  COUNT(*) as total_phases,
  COUNT(*) FILTER (WHERE (end_time - start_time) <= 0) as negative_duration,
  COUNT(*) FILTER (WHERE end_time > next_start) as overlap_violations
FROM phases
GROUP BY run_id;
```

**C) C10 Delta Report**:
```sql
-- Para cada fase interativa, comparar pauseTime com matched_word_end
-- Calcular delta (deve ser 0.000)
```

**D) C10B Guardrail**:
```sql
-- Para cada fase interativa, verificar narration_after_pause <= 1.5s
```

### 4. Tabela Final de Entrega

```
| run_id | runTag | status | boundaries_ok | wt_count | C10_pass | C10B_pass | failure_reason |
|--------|--------|--------|---------------|----------|----------|-----------|----------------|
| uuid1  | R01    | ✅     | 10/10         | 450      | 3/3      | 3/3       | -              |
| uuid2  | R02    | ✅     | 10/10         | 450      | 3/3      | 3/3       | -              |
| ...    | ...    | ...    | ...           | ...      | ...      | ...       | ...            |
| uuid5  | R05    | ❌     | -             | -        | -        | -         | PAUSE_ANCHOR_NOT_FOUND |
| uuid6  | R06    | ❌     | -             | -        | -        | -         | PAUSE_ANCHOR_NOT_AT_END |
| ...    | ...    | ...    | ...           | ...      | ...      | ...       | ...            |
```

---

## Arquivos a Criar/Modificar

1. **NOVO**: `supabase/functions/force-test-c10b/index.ts`
   - Edge function para orquestrar os 12 runs
   - Chama v7-vv com variações controladas
   - Coleta resultados e gera relatório

2. **NOVO**: `src/pages/admin/ForceTestC10B.tsx` (opcional)
   - UI para iniciar teste e visualizar resultados
   - Tabela com status dos 12 runs

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Custo de áudio (12 runs × ElevenLabs) | Médio | Usar voice_id de baixo custo ou mock em dry-run |
| Run paralelo causa timeout | Baixo | Executar sequencialmente com delay |
| Match ambíguo em R03/R04 | Médio | Aceitar como "comportamento definido" (LAST_IN_RANGE) |
| Boundary fix mascara bug | Baixo | Verificar se fixesAppliedCount > 0 e investigar |

---

## Sequência de Execução

```text
1. Deploy force-test-c10b
2. Invocar: POST /force-test-c10b { lesson_id: "8208852d-...", runs: "R01-R12" }
3. Aguardar ~10-15 min (12 runs × ~1min cada)
4. Coletar resultados via SQL
5. Gerar tabela final
6. Analisar falhas esperadas (R05, R06)
7. Analisar falhas inesperadas (se houver)
```

---

## Entregáveis

1. ✅ Tabela com 12 linhas (R01..R12)
2. ✅ Para R05/R06: erro determinístico com código explícito
3. ✅ Para runs que deveriam PASSAR mas falharam: causa raiz + patch + re-run
4. ✅ Relatório SQL consolidado (não prints)
