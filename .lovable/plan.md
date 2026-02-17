

# Plano: Aplicar Todas as Melhorias da Auditoria Forense C12

## Resumo das Correcoes Identificadas

Com base na auditoria forense realizada, existem **5 problemas concretos** a corrigir e **2 melhorias de resiliencia** a implementar.

---

## Correcao 1: Cleanup de Jobs Stuck em `queued`

**Problema real**: Job `02a18465-87f0-45c3-84f2-1a188ef302e5` esta em `queued` desde 2026-02-17 15:57, ha mais de 2 horas. A funcao `cleanup_stale_image_attempts()` so limpa jobs em `processing`, nao em `queued` stuck.

**Acao**: Atualizar a funcao SQL `cleanup_stale_image_attempts()` para tambem limpar jobs em `queued` ha mais de 30 minutos:

```sql
-- Adicionar ao corpo da funcao:
UPDATE image_jobs
SET status = 'failed',
    error_code = 'TIMEOUT',
    error_message = 'Auto-cleanup: stuck in queued > 30 minutes',
    updated_at = now()
WHERE status = 'queued'
  AND updated_at < now() - interval '30 minutes';
```

**Acao imediata**: Tambem limpar o job orfao atual via INSERT tool:

```sql
UPDATE image_jobs SET status = 'failed', error_code = 'TIMEOUT',
  error_message = 'Manual cleanup: stuck in queued since 2026-02-17'
WHERE id = '02a18465-87f0-45c3-84f2-1a188ef302e5';
```

**Arquivo**: Migracao SQL nova

---

## Correcao 2: Cron Job — Agendar via `pg_cron`

**Problema real**: A migracao existente (`20260217152321`) criou a funcao de cleanup e a extensao `pg_cron`, mas **nao agendou o cron job**. O cleanup nunca roda automaticamente.

**Acao**: Criar migracao SQL para agendar o cron:

```sql
SELECT cron.schedule(
  'cleanup-stale-image-lab',
  '*/5 * * * *',
  $$SELECT public.cleanup_stale_image_attempts()$$
);
```

**Arquivo**: Migracao SQL nova

---

## Correcao 3: Retry do Job History — Preservar Provider Original

**Problema real**: `AdminImageLab.tsx` L554 — o botao "Retry" no historico de jobs sempre usa `provider: "openai"` hardcoded, ignorando o provider original do job (pode ter sido `gemini`).

**Acao**: Alterar `retryJob()` para usar o provider do job original:

```typescript
// L541-565: retryJob
const retryJob = async (jobId: string) => {
  const job = jobs.find(j => j.id === jobId);
  const retryProvider = job?.provider || "openai";
  // ... usar retryProvider na chamada
```

**Arquivo**: `src/pages/AdminImageLab.tsx`

---

## Correcao 4: Hash de Arquivo mais Robusto

**Problema real**: `image-lab-generate/index.ts` L346 — o `sha256_bytes` do asset e calculado sobre `TextDecoder().decode(imageBytes).substring(0, 1000)`, o que corrompe dados binarios no decode. Isso gera hashes inconsistentes.

**Acao**: Usar hash direto sobre os bytes binarios, sem TextDecoder:

```typescript
const fileHashBuffer = await crypto.subtle.digest("SHA-256", imageBytes);
const fileHash = Array.from(new Uint8Array(fileHashBuffer))
  .map(b => b.toString(16).padStart(2, "0")).join("");
```

Aplicar tanto em `image-lab-generate/index.ts` quanto em `image-lab-generate-batch/index.ts`.

**Arquivos**: `supabase/functions/image-lab-generate/index.ts`, `supabase/functions/image-lab-generate-batch/index.ts`

---

## Melhoria 5: Timeout com AbortController nos Providers

**Problema real**: Chamadas ao OpenAI e Gemini nao tem timeout. Se o provider travar, o attempt fica em `processing` ate o cleanup do cron (10 min).

**Acao**: Adicionar `AbortController` com timeout de 120s nas chamadas fetch a ambos os providers dentro de `generateFromProvider()` no batch e na funcao generate:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 120_000);
try {
  const resp = await fetch(url, { ...options, signal: controller.signal });
  // ...
} finally {
  clearTimeout(timeout);
}
```

**Arquivos**: `supabase/functions/image-lab-generate/index.ts`, `supabase/functions/image-lab-generate-batch/index.ts`

---

## Sequencia de Execucao

1. Limpar job orfao `02a18465` (SQL INSERT tool)
2. Criar migracao: atualizar `cleanup_stale_image_attempts()` para incluir `queued` stuck + agendar cron
3. Corrigir `retryJob()` no `AdminImageLab.tsx` para usar provider original
4. Corrigir hash de arquivo em ambas edge functions (sha256 direto sobre bytes)
5. Adicionar timeout de 120s nas chamadas aos providers em ambas edge functions
6. Deploy das edge functions

## Arquivos Impactados

| Arquivo | Acao |
|---------|------|
| Banco de dados (SQL) | UPDATE job orfao + atualizar funcao cleanup + agendar cron |
| `src/pages/AdminImageLab.tsx` | Corrigir `retryJob()` para usar provider do job |
| `supabase/functions/image-lab-generate/index.ts` | Hash robusto + timeout 120s |
| `supabase/functions/image-lab-generate-batch/index.ts` | Hash robusto + timeout 120s |

