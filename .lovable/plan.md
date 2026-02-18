
# Plano de Evolucao C12.1 — SLO Fallback + Health + Cache + Base C13

## Contexto Tecnico Atual (Dados Reais do Codigo)

### Estado Atual dos Timeouts (Problema)
- `image-lab-generate/index.ts` linha 123: Gemini usa `setTimeout(() => controller.abort(), 120_000)` — **120 segundos**
- `image-lab-generate/index.ts` linha 203: OpenAI usa `setTimeout(() => controller.abort(), 120_000)` — **120 segundos**
- `image-lab-pipeline-bridge/index.ts` linhas 57 e 129: ambos providers usam **120 segundos**
- NAO existe SLO por provider. NAO existe wall-clock guard total por job.
- NAO existe fallback por latencia (o fallback atual so ocorre quando o provider FALHA completamente, nao por lentidao).

### Estado Atual do Cache (Problema)
- Hash input (linha 535): `${requestedProvider}|${requestedModel}|${actualSize}|${preset.key}|${preset.version}|${promptFinal}`
- NAO existe normalizacao do prompt. Diferenca de espaco, maiuscula/minuscula gera hash diferente.
- Dados reais: `cache_hit = 0` em todos os jobs recentes.

### Nao existe `_shared/` folder em `supabase/functions/`.
### Nao existe edge function `image-lab-health`.

---

## PARTE 1 — Fallback por Latencia (SLO Guard em Runtime)

### Arquivos Modificados
1. **`supabase/functions/image-lab-generate/index.ts`**
2. **`supabase/functions/image-lab-pipeline-bridge/index.ts`**

### Mudancas Tecnicas

#### 1A. Constantes SLO (image-lab-generate)
Adicionar no topo do arquivo, apos `SIZE_MAP`:
```
const SLO_CONFIG = {
  OPENAI_TIMEOUT_MS: 20_000,
  GEMINI_TIMEOUT_MS: 15_000,
  MAX_TOTAL_WALL_MS: 25_000,
};
```

#### 1B. Refatorar `generateWithGemini` e `generateWithOpenAI`
- Aceitar parametro `timeoutMs` em vez de hard-coded `120_000`
- Quando `AbortError` ocorrer, o `classifyError` ja retorna `"TIMEOUT"` (linha 390 confirmada)

#### 1C. Refatorar `generateWithRetryPolicy`
Logica atual (3 attempts fixos com 120s cada): substituir por logica SLO-aware:

```
Attempt 1: provider primario com seu timeout SLO
  Se TIMEOUT → registrar attempt failed com error_code="SLO_TIMEOUT"
  
Attempt 2: retry mesmo provider (ja existe)
  Agora COM wall-clock guard: se tempo total > MAX_TOTAL_WALL_MS, pular para attempt 3

Attempt 3: fallback para provider alternativo
  Timeout = min(provider_timeout, tempo_restante_do_wall_clock)
```

- Adicionar novo error_code `"SLO_TIMEOUT"` no `classifyError` (distinguir de TIMEOUT generico via AbortError com mensagem customizada)
- Logs adicionais no console (nao v7DebugLogger — este roda no browser, nao na edge function):
  - `[C12.1_SLO] IMAGE_PROVIDER_START: provider=openai, jobId=xxx`
  - `[C12.1_SLO] IMAGE_PROVIDER_TIMEOUT: provider=openai, ms=20001, jobId=xxx`
  - `[C12.1_SLO] IMAGE_FALLBACK_TRIGGERED: from=openai, to=gemini, jobId=xxx`

#### 1D. Pipeline Bridge: Degraded Response
Na `image-lab-pipeline-bridge`, quando TODOS os providers falharem (retry exhausted), em vez de propagar o erro como `status: "failed"`, retornar:
```json
{
  "scene_id": "xxx",
  "status": "degraded",
  "asset_id": null,
  "storage_path": null,
  "degraded": true,
  "reason": "ALL_PROVIDERS_FAILED"
}
```
E o `ok` da response geral permanece `true` (para a bridge nao retornar 5xx), permitindo que o player continue.

O status HTTP 503 continua reservado SOMENTE para violacoes do SLO_GUARD sistemico (linhas 250-269 atuais).

### Criterios de Aceite (Pass/Fail)
- Se OpenAI > 20s: attempt registrado com `error_code="SLO_TIMEOUT"`, fallback para Gemini disparado
- Se ambos falharem: job=failed, bridge retorna `degraded: true` (player nao trava)
- Circuit breaker continua atualizando `image_lab_circuit_state` corretamente

---

## PARTE 2 — Health Endpoint

### Arquivo Criado
1. **`supabase/functions/image-lab-health/index.ts`** (novo)
2. **`supabase/config.toml`** — adicionar `[functions.image-lab-health]` com `verify_jwt = false`

### Implementacao
- Auth: mesma logica REST `/auth/v1/user` + check `user_roles` para admin/supervisor
- Queries:
  - `image_lab_circuit_state` → estado dos providers
  - Query agregada em `image_attempts` (last 24h) por provider: `avg(latency_ms)`, `count(*)`, `count(*) filter (where status='failed')`
  - `image_jobs` where `status='processing'` → stuck count
- `degraded_mode`: true se `(fail_rate_openai > 0.25 AND fail_rate_gemini > 0.50)` OU ambos `OPEN`
- Retorno conforme modelo JSON especificado no prompt

### Criterios de Aceite
- curl com JWT admin → retorna `ok: true` com dados preenchidos
- curl sem auth → 401 `AUTH_MISSING`

---

## PARTE 3 — Cache Normalizado

### Arquivos Criados/Modificados
1. **`supabase/functions/image-lab-generate/index.ts`** — adicionar funcao `normalizePrompt()` inline (nao ha folder `_shared` e cria-lo requer setup adicional; manter inline por simplicidade)
2. **`supabase/functions/image-lab-pipeline-bridge/index.ts`** — mesma funcao `normalizePrompt()`
3. **`supabase/functions/image-lab-generate-batch/index.ts`** — mesma funcao `normalizePrompt()`

### Logica de `normalizePrompt(prompt)`
```typescript
function normalizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/\s+/g, ' ')        // collapse whitespace
    .toLowerCase()
    .replace(/\s*([,.])\s*/g, '$1') // remove spaces around , and .
    .replace(/([.,!?]){2,}/g, '$1') // collapse repeated punctuation
    .replace(/\.\s*\./g, '.');      // remove ". ." style hints vazios
}
```

### Hash Input Atualizado
```
hashInput = `${provider}|${model}|${size}|${preset_key}|${preset_version}|${normalizePrompt(promptFinal)}`
```

NAO sera feita migracao de hashes existentes. Novos jobs usam o novo hash. Assets antigos continuam acessiveis pela PK.

### Criterios de Aceite
- Duas geracoes com prompts identicos exceto espacos/maiusculas → segunda retorna `cache_hit: true`
- Hash e deterministico (mesma entrada normalizada = mesmo hash)

---

## PARTE 4 — Base para Visual Avancado (Preparacao C13)

### Arquivo Modificado
1. **`supabase/functions/v7-vv/index.ts`** — DryRun validation (linhas ~2450-2474)

### Mudancas
- Adicionar tolerant parsing para campos futuros em `image-sequence`: ignorar campos desconhecidos sem rejeitar (ja e o comportamento padrao do JSON)
- Adicionar validacao OPCIONAL de `cameraSpec` se presente no frame: se `cameraSpec` existir mas nao for um objeto, gerar warning (nao error)
- Manter hard reject para `visual.type` invalido (ja existe, confirmado na linha 1679)
- ZERO mudanca no renderer ou UI

### Criterios de Aceite
- DryRun PASS para aulas existentes com `image-sequence`
- DryRun PASS para `image-sequence` com campo extra desconhecido (ex: `cameraSpec: {...}`)
- DryRun FAIL para `visual.type` invalido (ex: `"image-sequence-3d"`)
- Nenhuma mudanca de comportamento no player

---

## Resumo de Entregaveis

| # | Arquivo | Acao | Descricao |
|---|---------|------|-----------|
| 1 | `supabase/functions/image-lab-generate/index.ts` | MODIFICAR | SLO timeouts, `normalizePrompt()`, wall-clock guard, `SLO_TIMEOUT` error code |
| 2 | `supabase/functions/image-lab-pipeline-bridge/index.ts` | MODIFICAR | SLO timeouts, `normalizePrompt()`, resposta `degraded` em vez de 5xx |
| 3 | `supabase/functions/image-lab-generate-batch/index.ts` | MODIFICAR | `normalizePrompt()` no hash |
| 4 | `supabase/functions/image-lab-health/index.ts` | CRIAR | Health endpoint completo |
| 5 | `supabase/config.toml` | ATUALIZAR (automatico) | Entrada para `image-lab-health` |
| 6 | `supabase/functions/v7-vv/index.ts` | MODIFICAR | Tolerant parsing + warning para `cameraSpec` |
| 7 | `src/lib/imageLabStateMachine.ts` | MODIFICAR | Adicionar `SLO_TIMEOUT` ao tipo `ImageLabErrorCode` |

## Como Testar

### Health endpoint
```bash
curl -X GET \
  https://pspvppymcdjbwsudxzdx.supabase.co/functions/v1/image-lab-health \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -H "apikey: <ANON_KEY>"
```

### Teste de cache_hit
1. Gerar imagem com prompt "A futuristic city at night" via UI `/admin/image-lab`
2. Gerar novamente com "A  Futuristic  City  At  Night" (espacos duplos, maiusculas)
3. Segunda execucao deve retornar `cache_hit: true`

### Teste de SLO fallback
- Observar nos logs da edge function se OpenAI > 20s dispara `SLO_TIMEOUT` e fallback para Gemini
- Verificar `image_attempts` para o job: primeiro attempt `error_code="SLO_TIMEOUT"`, segundo attempt com provider diferente

## Nenhuma migracao SQL necessaria
Todos os campos ja existem nas tabelas. O novo error code `SLO_TIMEOUT` e apenas um valor string no campo `error_code` existente.
