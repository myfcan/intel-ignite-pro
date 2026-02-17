
# Plano de Correcao: Image Lab C12 — 4 Tarefas Criticas

## Dados Forenses Reais Coletados

### Attempts orfaos (status=processing, stuck desde 2026-02-13):
| attempt_id | job_id | provider | created_at |
|------------|--------|----------|------------|
| `3275590a-b57a-47f6-bb6f-93a0aa293915` | `00d7eeb6...` | openai | 18:27:19 |
| `1d73e794-233d-4c60-aea2-4b4548903f55` | `00d7eeb6...` | gemini | 18:27:19 |
| `65406883-9e98-4d6d-8111-d255a7882f10` | `00d7eeb6...` | gemini | 18:27:18 |
| `1c6f3ea9-5867-4329-ad88-9ae9e7444c5a` | `00d7eeb6...` | openai | 18:27:18 |

Todos pertencem ao mesmo `job_id: 00d7eeb6-64d1-48f0-ba68-c4e96263b0e4` — evidencia direta do race condition do batch.

### Job com erro LOCKED confirmado:
`bddc90e0-0696-411c-88c0-2a34da7853d6` — `error_message: "openai: Job is already being processed (concurrency lock); openai: Job is already being processed (concurrency lock); gemini: Job is already being processed (concurrency lock); gemini: Job is already being processed (concurrency lock)"`

### Cache hits: 0/10 jobs (0%)

### Gemini bug: `modalities: ["image", "text"]` AUSENTE na chamada (L195-209 de `image-lab-generate/index.ts`)

---

## Tarefa 1: Limpar attempts orfaos + cleanup automatico

### 1a. Limpeza imediata (via SQL insert tool)
Atualizar os 4 attempts stuck para `status = 'failed'`, `error_code = 'TIMEOUT'`, `error_message = 'Orphaned: stuck in processing since 2026-02-13 (cleanup)'`.

IDs exatos:
- `3275590a-b57a-47f6-bb6f-93a0aa293915`
- `1d73e794-233d-4c60-aea2-4b4548903f55`
- `65406883-9e98-4d6d-8111-d255a7882f10`
- `1c6f3ea9-5867-4329-ad88-9ae9e7444c5a`

### 1b. Cleanup automatico (migracao SQL)
Criar uma funcao de banco `cleanup_stale_image_attempts()` que:
- Busca attempts com `status = 'processing'` e `created_at < now() - interval '10 minutes'`
- Atualiza para `status = 'failed'`, `error_code = 'TIMEOUT'`, `error_message = 'Auto-cleanup: exceeded 10min processing limit'`
- Tambem atualiza jobs correspondentes que estejam stuck em `processing`

Agendar via `pg_cron` para rodar a cada 5 minutos.

---

## Tarefa 2: Refatorar batch para eliminar race condition (B1/B2)

### Causa raiz (codigo real)
`image-lab-generate-batch/index.ts` linhas 97-113:
```typescript
const results = await Promise.allSettled(
  tasks.map(async (task) => {
    const resp = await fetch(generateUrl, {
      method: "POST",
      headers: { "Authorization": authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ job_id, provider: task.provider, n: 1, size }),
    });
```
Cada task chama `image-lab-generate` com o **mesmo `job_id`**. A primeira chamada seta o job para `processing` (L174-183 de generate). Todas as chamadas subsequentes encontram `status = 'processing'` e retornam `LOCKED` (L92-96).

### Solucao: Internalizar a logica de geracao no batch
Refatorar `image-lab-generate-batch/index.ts` para:
1. Ler o job e preset uma unica vez
2. Setar o job para `processing` uma unica vez (ja faz isso, L79-82)
3. Para cada task no plan, executar a geracao **diretamente** (OpenAI API ou Lovable AI Gateway) dentro do batch, sem chamar a edge function `generate`
4. Criar attempts individuais por provider/task
5. Agregar resultados e setar status final

A logica de geracao sera extraida de `image-lab-generate/index.ts` (L190-308) e replicada no batch. O hash e cache check serao feitos uma unica vez no batch (nao por task).

### Arquivos modificados:
- `supabase/functions/image-lab-generate-batch/index.ts` — reescrita completa da logica de execucao

---

## Tarefa 3: Corrigir integracao Gemini

### Bug encontrado
`image-lab-generate/index.ts` L195-209 — chamada ao Lovable AI Gateway **sem** o parametro obrigatorio `modalities`:
```typescript
body: JSON.stringify({
  model: "google/gemini-3-pro-image-preview",
  messages: [
    {
      role: "user",
      content: `Generate an image...`,
    },
  ],
  // AUSENTE: modalities: ["image", "text"]
}),
```

Sem `modalities: ["image", "text"]`, o gateway retorna apenas texto, nao imagem. Isso explica o 0% de sucesso do Gemini.

### Correcao
Adicionar `modalities: ["image", "text"]` ao body da chamada em `image-lab-generate/index.ts` (L201-209).

Mesma correcao sera aplicada na versao internalizada dentro do batch refatorado.

### Arquivos modificados:
- `supabase/functions/image-lab-generate/index.ts` — adicionar modalities
- `supabase/functions/image-lab-generate-batch/index.ts` — incluir modalities na logica internalizada

---

## Tarefa 4: Testar E2E apos deploy

Apos deploy das funcoes corrigidas:
1. **Teste Gemini isolado**: Chamar `image-lab-generate` com `provider: "gemini"` e verificar se retorna imagem
2. **Teste Batch sem race condition**: Chamar `image-lab-generate-batch` com plan multi-provider e verificar que nao ha erros LOCKED
3. **Teste Idempotencia**: Gerar imagem, depois re-executar com mesmos parametros e confirmar `cache_hit: true`

Todos os testes serao executados via `curl_edge_functions` com dados reais.

---

## Sequencia de Execucao

1. Limpeza dos 4 attempts orfaos (SQL direto)
2. Corrigir `modalities` no `image-lab-generate` + deploy
3. Refatorar `image-lab-generate-batch` com logica internalizada + deploy
4. Criar funcao de cleanup automatico + cron
5. Executar testes E2E (Gemini, Batch, Cache)

## Arquivos impactados

| Arquivo | Acao |
|---------|------|
| `supabase/functions/image-lab-generate/index.ts` | Adicionar `modalities: ["image", "text"]` na chamada Gemini |
| `supabase/functions/image-lab-generate-batch/index.ts` | Reescrita: internalizar geracao, eliminar chamadas recursivas ao generate |
| Banco de dados (SQL) | UPDATE 4 attempts orfaos + criar funcao cleanup + cron job |
