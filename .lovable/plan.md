

## Auditoria do Plano — Gaps Encontrados com Dados Reais

---

### GAP CRÍTICO: `v10-score-bpa` NÃO ESTÁ NO `config.toml`

**Evidência real — `supabase/config.toml`**: O arquivo termina na linha 118 com `[functions.v10-process-anchors]`. Não existe entrada para `v10-score-bpa`.

**Impacto sistêmico**: A função **não será deployada**. O botão "IA Sugerir Score" no `Stage1Score.tsx` (linha 74) chama `supabase.functions.invoke('v10-score-bpa', ...)` mas a função não existe no runtime. Isso explica por que o pipeline "Automação com Calendly e GPT" ficou em 0/100 — além de não haver auto-score, o botão manual também pode falhar se a função nunca foi deployada.

**Correção**: Adicionar `[functions.v10-score-bpa]` + `verify_jwt = false` ao `config.toml`.

---

### GAP CRÍTICO: 10 Outras Edge Functions Existem no Disco mas NÃO Estão no `config.toml`

Cruzamento entre `supabase/functions/` (diretórios) e `config.toml` (entradas):

| Função no disco | No config.toml? |
|---|---|
| `v10-score-bpa` | **NÃO** |
| `v10-generate-audio` | **NÃO** |
| `v10-generate-steps` | **NÃO** |
| `v10-generate-images` | **NÃO** |
| `v10-assembly-check` | **NÃO** |
| `v10-publish-lesson` | **NÃO** |
| `v8-generate` | **NÃO** |
| `v8-generate-section-audio` | **NÃO** |
| `v8-reprocess-lesson-images` | **NÃO** |
| `admin-reset-password` | **NÃO** |
| `patch-lesson-content` | **NÃO** |

**Impacto sistêmico**: TODAS as 6 funções do pipeline V10 (`v10-score-bpa`, `v10-generate-steps`, `v10-generate-audio`, `v10-generate-images`, `v10-assembly-check`, `v10-publish-lesson`) estão fora do config.toml. Isso significa que **o pipeline V10 inteiro pode não estar deployado**.

---

### GAP 2: Prompt Pobre no `v10-score-bpa` — Contexto Insuficiente

**Evidência real — `v10-score-bpa/index.ts` linha 61:**
```typescript
const systemPrompt = `Você é um especialista em design instrucional para aulas de tecnologia. Analise o tema proposto e retorne um JSON com 5 scores (0-20 cada): score_refero (disponibilidade de screenshots/referências visuais), score_docs (qualidade da documentação oficial), score_pedagogy (valor pedagógico e aplicabilidade), score_difficulty (invertido: mais fácil = mais pontos), score_relevance (relevância no mercado atual). Retorne APENAS o JSON, sem markdown.`;
```

**Evidência real — linha 63:**
```typescript
const userMessage = `Tema: ${title}\nSlug: ${slug}\nNotas: ${docs_manual_input || 'nenhuma'}`;
```

O prompt não instrui a IA a usar seu conhecimento geral sobre ferramentas populares. Para "Automação com Calendly e GPT", a IA recebe apenas `Tema: Automação com Calendly e GPT / Notas: nenhuma` — sem contexto sobre o ecossistema MCP, API pública, documentação oficial, integrações etc.

**Correção**: Enriquecer o system prompt com instrução para usar conhecimento geral + adicionar heurísticas de scoring.

---

### GAP 3: Pipeline Nasce com Score 0/100 "Inviável" sem Avaliação Real

**Evidência real — `CreateBpaModal.tsx` linhas 76-82:**
```typescript
score_total: 0,
score_refero: 0,
score_docs: 0,
score_pedagogy: 0,
score_difficulty: 0,
score_relevance: 0,
score_semaphore: 'red' as const,
```

O pipeline é inserido com semáforo vermelho hardcoded. Não há chamada automática ao `v10-score-bpa` após criação.

**Correção**: Após insert bem-sucedido, disparar `v10-score-bpa` em background.

---

## Plano de Correção (3 frentes)

### 1. Adicionar TODAS as funções V10 + faltantes ao `config.toml`

Adicionar 11 entradas faltantes:
```toml
[functions.v10-score-bpa]
verify_jwt = false

[functions.v10-generate-audio]
verify_jwt = false

[functions.v10-generate-steps]
verify_jwt = false

[functions.v10-generate-images]
verify_jwt = false

[functions.v10-assembly-check]
verify_jwt = false

[functions.v10-publish-lesson]
verify_jwt = false

[functions.v8-generate]
verify_jwt = false

[functions.v8-generate-section-audio]
verify_jwt = false

[functions.v8-reprocess-lesson-images]
verify_jwt = false

[functions.admin-reset-password]
verify_jwt = false

[functions.patch-lesson-content]
verify_jwt = false
```

### 2. Enriquecer prompt do `v10-score-bpa/index.ts`

Substituir o system prompt (linha 61) por versão que instrua a IA a:
- Usar seu conhecimento geral sobre ferramentas populares (Calendly, Notion, Canva, ChatGPT etc.)
- Considerar ecossistema de integrações, API pública, documentação oficial conhecida
- Justificar brevemente cada score (para log)
- Manter output JSON com os mesmos 5 campos

### 3. Auto-score na criação do pipeline (`CreateBpaModal.tsx`)

Após o `insert().select().single()` com sucesso (linha 101-105), disparar em background:
```typescript
supabase.functions.invoke('v10-score-bpa', {
  body: { pipeline_id: pipeline.id },
});
```

O `onCreated(pipeline)` retorna o pipeline com score 0, mas a UI será atualizada quando o usuário entrar na Stage 1 e os dados recarregarem com o score calculado.

### Arquivos a editar

| Arquivo | Alteração |
|---|---|
| `supabase/config.toml` | Adicionar 11 funções faltantes |
| `supabase/functions/v10-score-bpa/index.ts` | Enriquecer system prompt |
| `src/components/admin/v10/CreateBpaModal.tsx` | Auto-score após criação |

